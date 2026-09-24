import * as THREE from "three";
import { smoothstep } from "./sRoad";

/** Smooth, layered pseudo-noise (sums of skewed sines) — organic patches
 * without any texture lookups. Returns roughly 0–1. */
export function patchNoise(x: number, z: number, scale: number, seed: number): number {
  const a = Math.sin(x * 0.13 * scale + seed) * Math.cos(z * 0.11 * scale - seed * 0.7);
  const b = Math.sin((x * 0.29 + z * 0.21) * scale + seed * 1.9);
  const c = Math.cos((x * 0.47 - z * 0.39) * scale - seed * 2.3);
  return THREE.MathUtils.clamp(0.5 + a * 0.3 + b * 0.14 + c * 0.08, 0, 1);
}

/** 0–1: how much meadow grass covers the land at (x, z). Shared by the
 * terrain colouring and the world vegetation, so grass grows exactly
 * where the ground reads green. */
export function meadowAmount(x: number, z: number): number {
  return smoothstep(0.4, 0.72, patchNoise(x, z, 1, 3.1));
}

/** 0–1: clustered groves — where trees gather into small woods. */
export function groveAmount(x: number, z: number): number {
  return smoothstep(0.55, 0.82, patchNoise(x, z, 0.7, 21.4));
}
