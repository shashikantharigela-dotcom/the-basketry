import * as THREE from "three";
import { terrainHeight } from "../../foundation/sRoad";
import type { Rect } from "./types";

/** Seeded PRNG (mulberry32) — stage dressing is scattered randomly but
 * identically on every load. */
export function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Terrain surface height at a world x/z — where anything standing on the land sits. */
export function groundY(x: number, z: number): number {
  return terrainHeight(x, z);
}

/** Rect-local (lx, lz) → world x/z. */
export function rectToWorld(rect: Rect, lx: number, lz: number, out = new THREE.Vector2()): THREE.Vector2 {
  const c = Math.cos(rect.rotationY);
  const s = Math.sin(rect.rotationY);
  return out.set(rect.x + lx * c + lz * s, rect.z - lx * s + lz * c);
}

/** Whether a world x/z lies inside a rotated rect. */
export function insideRect(rect: Rect, x: number, z: number): boolean {
  const dx = x - rect.x;
  const dz = z - rect.z;
  const c = Math.cos(rect.rotationY);
  const s = Math.sin(rect.rotationY);
  const lx = dx * c - dz * s;
  const lz = dx * s + dz * c;
  return Math.abs(lx) <= rect.width / 2 && Math.abs(lz) <= rect.depth / 2;
}

const matrixPosition = new THREE.Vector3();
const matrixQuaternion = new THREE.Quaternion();
const matrixScale = new THREE.Vector3();
const matrixEuler = new THREE.Euler();

/** Compose an instance matrix from position / yaw(+pitch, roll) / scale. */
export function instanceMatrix(
  x: number,
  y: number,
  z: number,
  yaw: number,
  sx: number,
  sy = sx,
  sz = sx,
  pitch = 0,
  roll = 0
): THREE.Matrix4 {
  matrixPosition.set(x, y, z);
  matrixQuaternion.setFromEuler(matrixEuler.set(pitch, yaw, roll, "YXZ"));
  matrixScale.set(sx, sy, sz);
  return new THREE.Matrix4().compose(matrixPosition, matrixQuaternion, matrixScale);
}
