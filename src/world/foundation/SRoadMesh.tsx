import { useMemo } from "react";
import * as THREE from "three";
import { isNarrowViewport } from "../../hooks/useIsMobile";
import { ROAD_CURVE, ROAD_HALF_WIDTH, ROAD_LENGTH, ROAD_SURFACE_OFFSET, groundHeight } from "./sRoad";

const lod = isNarrowViewport();
const ROAD_SEGMENTS = lod ? 500 : 1000;

/** Dark asphalt with a fine aggregate grain. The road strips carry no UVs,
 * so the grain is a small world-space hash noise added in the shader —
 * it only varies color and roughness, never the geometry. */
function createAsphaltMaterial(color: string, roughness: number): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vAsphaltPos;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvAsphaltPos = (modelMatrix * vec4(transformed, 1.0)).xyz;"
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vAsphaltPos;
float asphaltHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
float asphaltGrain = asphaltHash(floor(vAsphaltPos * 60.0));
float asphaltPatch = asphaltHash(floor(vAsphaltPos * 4.0));
diffuseColor.rgb *= 0.82 + 0.3 * asphaltGrain + 0.1 * asphaltPatch;`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor - 0.12 * asphaltGrain, 0.0, 1.0);`
      );
  };
  return material;
}

const ROAD_MATERIAL = createAsphaltMaterial("#1e1e21", 0.9);
const CURB_MATERIAL = createAsphaltMaterial("#2c2c30", 0.95);
const CENTER_LINE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f5f5f2", roughness: 0.55, metalness: 0 });
const EDGE_LINE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f5f5f2", roughness: 0.55, metalness: 0 });

const CURB_DEPTH = 0.12;
const DASH_LENGTH = 0.55;
const DASH_GAP = 0.45;

const UP = new THREE.Vector3(0, 1, 0);

interface RoadFrame {
  point: THREE.Vector3;
  right: THREE.Vector3;
  distance: number;
}

function sampleFrames(): RoadFrame[] {
  const frames: RoadFrame[] = [];
  const tangent = new THREE.Vector3();
  for (let i = 0; i <= ROAD_SEGMENTS; i++) {
    const u = i / ROAD_SEGMENTS;
    const point = ROAD_CURVE.getPointAt(u);
    ROAD_CURVE.getTangentAt(u, tangent);
    tangent.y = 0;
    const right = new THREE.Vector3().crossVectors(tangent.normalize(), UP).normalize();
    frames.push({ point, right, distance: u * ROAD_LENGTH });
  }
  return frames;
}

/** Lateral offset → a point on the draped road surface (following the terrain dome). */
function surfacePoint(frame: RoadFrame, lateral: number, lift: number, out: number[]): void {
  const x = frame.point.x + frame.right.x * lateral;
  const z = frame.point.z + frame.right.z * lateral;
  out.push(x, groundHeight(x, z) + ROAD_SURFACE_OFFSET + lift, z);
}

/** A flat ribbon strip between two lateral offsets. When `dash` is set,
 * only the "on" parts of the dash pattern are emitted. */
function buildStrip(
  frames: RoadFrame[],
  left: number,
  right: number,
  lift: number,
  dash?: { on: number; off: number }
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < frames.length - 1; i++) {
    if (dash) {
      const mid = (frames[i].distance + frames[i + 1].distance) / 2;
      if (mid % (dash.on + dash.off) > dash.on) continue;
    }
    const base = positions.length / 3;
    surfacePoint(frames[i], left, lift, positions);
    surfacePoint(frames[i], right, lift, positions);
    surfacePoint(frames[i + 1], left, lift, positions);
    surfacePoint(frames[i + 1], right, lift, positions);
    // Counter-clockwise from above so faces point up.
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Vertical skirts down both road edges, so the pavement reads as a slab
 * sitting on the land rather than a paper-thin decal. */
function buildCurbs(frames: RoadFrame[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (const side of [-1, 1]) {
    for (let i = 0; i < frames.length - 1; i++) {
      const base = positions.length / 3;
      surfacePoint(frames[i], side * ROAD_HALF_WIDTH, 0, positions);
      surfacePoint(frames[i], side * ROAD_HALF_WIDTH, -CURB_DEPTH, positions);
      surfacePoint(frames[i + 1], side * ROAD_HALF_WIDTH, 0, positions);
      surfacePoint(frames[i + 1], side * ROAD_HALF_WIDTH, -CURB_DEPTH, positions);
      if (side > 0) indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
      else indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** The single continuous S-shaped road, draped over the terrain dome:
 * dark asphalt, curbed edges, white edge lines and a dashed white
 * center dividing line. */
export function SRoad() {
  const geometries = useMemo(() => {
    const frames = sampleFrames();
    return {
      surface: buildStrip(frames, -ROAD_HALF_WIDTH, ROAD_HALF_WIDTH, 0),
      curbs: buildCurbs(frames),
      edgeLeft: buildStrip(frames, -ROAD_HALF_WIDTH + 0.08, -ROAD_HALF_WIDTH + 0.13, 0.004),
      edgeRight: buildStrip(frames, ROAD_HALF_WIDTH - 0.13, ROAD_HALF_WIDTH - 0.08, 0.004),
      center: buildStrip(frames, -0.035, 0.035, 0.005, { on: DASH_LENGTH, off: DASH_GAP }),
    };
  }, []);

  return (
    <group>
      <mesh geometry={geometries.surface} material={ROAD_MATERIAL} receiveShadow />
      <mesh geometry={geometries.curbs} material={CURB_MATERIAL} receiveShadow />
      <mesh geometry={geometries.edgeLeft} material={EDGE_LINE_MATERIAL} receiveShadow />
      <mesh geometry={geometries.edgeRight} material={EDGE_LINE_MATERIAL} receiveShadow />
      <mesh geometry={geometries.center} material={CENTER_LINE_MATERIAL} receiveShadow />
    </group>
  );
}
