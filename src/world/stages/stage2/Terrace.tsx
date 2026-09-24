import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom } from "../common/placement";
import { groundAt, TERRACE_OUTLINE, TERRACE_TOP, TERRACE_WALL_LINE } from "./stage2Geometry";

const PAVING = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 });
const SKIRT = new THREE.MeshStandardMaterial({ color: "#d6c7a8", roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
const LIMESTONE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.92, metalness: 0 });
const BLOCK_GEOMETRY = new RoundedBoxGeometry(1, 1, 1, 2, 0.12);

const STONE_COLORS = [
  new THREE.Color("#e3d6bb"),
  new THREE.Color("#d9caa9"),
  new THREE.Color("#ebdfc7"),
  new THREE.Color("#cfbf9d"),
];

// Dry-stone courses: large cream limestone blocks (~1.2 m long, 0.6 m high).
const BLOCK_LENGTH = 0.27;
const COURSE_HEIGHT = 0.13;
const BLOCK_DEPTH = 0.24;
const SKIRT_DEPTH = 0.5;

/** The paved yard: one level slab over the terrace outline, with a soft
 * large-format paving pattern baked into vertex colours. */
function buildPaving(): THREE.BufferGeometry {
  const shape = new THREE.Shape(TERRACE_OUTLINE.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geometry = new THREE.ShapeGeometry(shape, 24);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, TERRACE_TOP, 0);
  const position = geometry.attributes.position;
  const colors: number[] = [];
  const base = new THREE.Color("#e9dec8");
  const warm = new THREE.Color("#e2d3b6");
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const t = 0.5 + 0.5 * Math.sin(x * 0.9) * Math.cos(z * 0.7);
    c.copy(base).lerp(warm, t * 0.6);
    colors.push(c.r, c.g, c.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Plain stone faces down the non-road sides of the terrace. */
function buildSkirt(): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const outline = TERRACE_OUTLINE;
  // The road-facing wall (first segment run) is built from blocks instead.
  const wallSegments = TERRACE_WALL_LINE.length - 1;
  for (let i = wallSegments; i < outline.length; i++) {
    const [ax, az] = outline[i];
    const [bx, bz] = outline[(i + 1) % outline.length];
    const base = positions.length / 3;
    positions.push(
      ax, TERRACE_TOP, az,
      ax, groundAt(ax, az) - SKIRT_DEPTH, az,
      bx, TERRACE_TOP, bz,
      bx, groundAt(bx, bz) - SKIRT_DEPTH, bz,
    );
    indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Instanced limestone blocks laid in staggered courses along the curved,
 * road-facing wall, from below the ground line up to the yard level,
 * with a slightly proud capping course. */
function buildWallBlocks(): { matrices: THREE.Matrix4[]; colors: THREE.Color[] } {
  const random = createRandom(2202);
  const matrices: THREE.Matrix4[] = [];
  const colors: THREE.Color[] = [];
  const curve = new THREE.CatmullRomCurve3(TERRACE_WALL_LINE.map(([x, z]) => new THREE.Vector3(x, 0, z)));
  const length = curve.getLength();
  const count = Math.ceil(length / BLOCK_LENGTH);
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const inward = new THREE.Vector3();

  for (let course = 0; ; course++) {
    const top = TERRACE_TOP - course * COURSE_HEIGHT;
    const capping = course === 0;
    let anyBelowGround = true;
    for (let i = 0; i < count; i++) {
      const u = Math.min(1, (i + (course % 2) * 0.5) / count);
      curve.getPointAt(u, p);
      curve.getTangentAt(u, t);
      t.y = 0;
      t.normalize();
      // Wall face on the road side; blocks extend inward under the yard.
      inward.crossVectors(up, t).normalize().multiplyScalar(-1);
      const ground = groundAt(p.x, p.z);
      if (top - COURSE_HEIGHT < ground - 0.06) continue;
      anyBelowGround = false;
      const lengthJitter = BLOCK_LENGTH * (0.9 + random() * 0.18);
      const heightJitter = COURSE_HEIGHT * (0.92 + random() * 0.1);
      const depth = BLOCK_DEPTH * (capping ? 1.05 : 0.95 + random() * 0.08);
      const outset = capping ? 0.02 : (random() - 0.5) * 0.02;
      q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), t);
      const center = new THREE.Vector3(
        p.x + inward.x * (depth / 2 - outset),
        top - heightJitter / 2,
        p.z + inward.z * (depth / 2 - outset)
      );
      matrices.push(new THREE.Matrix4().compose(center, q, new THREE.Vector3(lengthJitter, heightJitter, depth)));
      colors.push(STONE_COLORS[Math.floor(random() * STONE_COLORS.length)]);
    }
    if (anyBelowGround || course > 10) break;
  }
  return { matrices, colors };
}

/** The raised, paved producer yard and its dry-stone retaining wall
 * along the road — the plinth the whole Stage 2 facility stands on. */
export function Terrace() {
  const { paving, skirt, blocks } = useMemo(
    () => ({ paving: buildPaving(), skirt: buildSkirt(), blocks: buildWallBlocks() }),
    []
  );
  return (
    <group>
      <mesh geometry={paving} material={PAVING} receiveShadow />
      <mesh geometry={skirt} material={SKIRT} receiveShadow castShadow />
      <InstancedBatch geometry={BLOCK_GEOMETRY} material={LIMESTONE} matrices={blocks.matrices} colors={blocks.colors} />
    </group>
  );
}
