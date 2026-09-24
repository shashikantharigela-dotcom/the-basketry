import * as THREE from "three";
import { getRoadRight, groundHeight, ROAD_CURVE, terrainHeight } from "../../foundation/sRoad";
import { TERRACE, WALL_PLANTING } from "./stage2Layout";

/**
 * Stage 2 geometry that must follow the road exactly — derived from the
 * shared road curve at load, so the terrace wall and roadside fences sit
 * at a constant distance from the pavement all the way round the bend.
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

/** Shrubs spilling over the top of the wall, inset onto the terrace. */
export const WALL_PLANTING_LINES: Array<Array<[number, number]>> = (() => {
  const breaks = [WALL_PLANTING.uFrom, ...WALL_PLANTING.gaps.flat(), WALL_PLANTING.uTo];
  const lines: Array<Array<[number, number]>> = [];
  for (let i = 0; i < breaks.length - 1; i += 2) {
    lines.push(roadOffsetLine(breaks[i], breaks[i + 1], TERRACE.roadOffset + WALL_PLANTING.inset, 12));
  }
  return lines;
})();
