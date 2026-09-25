import * as THREE from "three";
import { getRoadRight, groundHeight, ROAD_CURVE, terrainHeight } from "../../foundation/sRoad";
import { TERRACE, WALL_BED } from "./stage2Layout";

/**
 * Stage 2 geometry that must follow the road exactly — derived from the
 * shared road curve at load, so the courtyard wall, roadside fences and
 * marker posts sit at a constant distance from the pavement all the way
 * round the bend.
 */

const right = new THREE.Vector3();
const point = new THREE.Vector3();

/** A world x/z point at a lateral offset from the road centerline (+ = right of travel). */
export function roadOffsetPoint(u: number, offset: number): [number, number] {
  ROAD_CURVE.getPointAt(u, point);
  getRoadRight(u, right);
  return [point.x + right.x * offset, point.z + right.z * offset];
}

/** A polyline following the road at a constant lateral offset. */
export function roadOffsetLine(uFrom: number, uTo: number, offset: number, steps = 24): Array<[number, number]> {
  return Array.from({ length: steps + 1 }, (_, i) => roadOffsetPoint(uFrom + ((uTo - uFrom) * i) / steps, offset));
}

/** The terrace outline (world x/z, counter-clockwise seen from above):
 * the curved road-facing wall, then straight back to the east edge. */
export const TERRACE_WALL_LINE = roadOffsetLine(TERRACE.roadUFrom, TERRACE.roadUTo, TERRACE.roadOffset, 40);

export const TERRACE_OUTLINE: Array<[number, number]> = (() => {
  const wall = TERRACE_WALL_LINE;
  const [, northZ] = wall[0];
  const [, southZ] = wall[wall.length - 1];
  return [...wall, [TERRACE.eastX, southZ], [TERRACE.eastX, northZ]];
})();

/** The paved yard is one level surface, just above the highest ground it covers. */
export const TERRACE_TOP: number = (() => {
  const xs = TERRACE_OUTLINE.map(([x]) => x);
  const zs = TERRACE_OUTLINE.map(([, z]) => z);
  let highest = -Infinity;
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += 0.4) {
    for (let z = Math.min(...zs); z <= Math.max(...zs); z += 0.4) {
      highest = Math.max(highest, terrainHeight(x, z));
    }
  }
  return highest + TERRACE.lift;
})();

/** Surface height for anything standing on the terrace. */
export function terraceY(): number {
  return TERRACE_TOP;
}

/** Ground height at the base of the wall (for block courses). */
export function groundAt(x: number, z: number): number {
  return Math.min(terrainHeight(x, z), groundHeight(x, z) + 0.02);
}

/** Post-and-rail fences along both sides of the road through Stage 2 —
 * the outside (camera side) and between the road and the terrace wall. */
export const ROADSIDE_FENCES: Array<Array<[number, number]>> = [
  roadOffsetLine(0.3, 0.46, -1.3, 36),
  roadOffsetLine(0.335, 0.43, 1.3, 24),
];

/** Black-and-white striped roadside marker posts, just inside each fence. */
export const MARKER_POSTS: Array<[number, number]> = [
  ...roadOffsetLine(0.3, 0.46, -1.16, 20),
  ...roadOffsetLine(0.335, 0.43, 1.16, 11),
];

/** Flowering shrubs along the foot of the compound wall, between it and the fence. */
export const WALL_FOOT_POINTS: Array<[number, number]> = roadOffsetLine(
  TERRACE.roadUFrom + 0.004,
  TERRACE.roadUTo - 0.004,
  TERRACE.roadOffset - 0.3,
  14
);

/** Points along the flowering bed just inside the compound wall (skipping the gate). */
export const WALL_BED_POINTS: Array<[number, number]> = (() => {
  const steps = 30;
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (WALL_BED.gaps.some(([a, b]) => t > a && t < b)) continue;
    out.push(roadOffsetPoint(TERRACE.roadUFrom + (TERRACE.roadUTo - TERRACE.roadUFrom) * t, TERRACE.roadOffset + WALL_BED.inset));
  }
  return out;
})();
