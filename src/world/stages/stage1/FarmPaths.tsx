import { useMemo } from "react";
import * as THREE from "three";
import { groundY } from "../common/placement";
import { FARM_PATHS, type FarmPath } from "./stage1Layout";

const PATH_LIFT = 0.018;
const LANE_SEGMENTS = 60;

const materials = new Map<string, THREE.MeshStandardMaterial>();
function pathMaterial(color: string): THREE.MeshStandardMaterial {
  let material = materials.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.98,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    materials.set(color, material);
  }
  return material;
}

function buildPath(path: FarmPath): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(
    path.points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    "centripetal"
  );
  const segments = path.flareStart ? LANE_SEGMENTS : Math.max(24, Math.ceil(curve.getLength() / 0.12));
  const positions: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    curve.getPointAt(u, point);
    curve.getTangentAt(u, tangent);
    // A lane flares where it meets the road, like a real farm entrance;
    // tracks taper softly at both ends so they fade into the ground.
    const flare = path.flareStart ? 1 + 0.35 * (1 - Math.min(1, u * 4)) : 1;
    const taper = path.flareStart ? 1 : Math.min(1, u * 8, (1 - u) * 8) * 0.6 + 0.4;
    const half = (path.width / 2) * flare * taper;
    for (const side of [-1, 1]) {
      const x = point.x - tangent.z * half * side;
      const z = point.z + tangent.x * half * side;
      positions.push(x, groundY(x, z) + PATH_LIFT, z);
    }
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** The farm's gravel lane (from the road's inner edge up to the yard —
 * it starts at the road edge, never on it) and the worn earth tracks
 * linking yard, market garden, orchard and fields, draped over the terrain. */
export function FarmPaths() {
  const geometries = useMemo(() => FARM_PATHS.map(buildPath), []);
  return (
    <group>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={pathMaterial(FARM_PATHS[i].color)} receiveShadow />
      ))}
    </group>
  );
}
