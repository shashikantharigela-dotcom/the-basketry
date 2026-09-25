import * as THREE from "three";
import { groundHeight, ROAD_CURVE } from "../../foundation/sRoad";
import { buildRoadStrip, resolveRoadPlacement, type RoadPlacement } from "../common/roadPlacement";
import { roadOffsetLine, roadOffsetPoint } from "../stage2/stage2Geometry";
import { BUILDINGS, BUNTING_POLES, CITY, LAY_BY, LOADING_COURT, PARKED_TRUCK, PLAZA, SIDEWALK, type BuildingSpec } from "./stage4Layout";

/**
 * Stage 4 geometry that must follow the road exactly — resolved from the
 * shared road curve at load.
 */

/** Paving sits a kerb's height above the road surface (the road is at ground + 0.04). */
const PAVE_LIFT = 0.075;
const ROAD_LEVEL_LIFT = 0.036;
const KERB = PAVE_LIFT - 0.01;

/** Height of the sidewalks and the plaza paving at a world x/z. */
export function paveY(x: number, z: number): number {
  return groundHeight(x, z) + PAVE_LIFT;
}

/** Road-level surfaces (the truck lay-by) at a world x/z. */
function roadLevelY(x: number, z: number): number {
  return groundHeight(x, z) + ROAD_LEVEL_LIFT;
}

export function resolve(p: RoadPlacement): { x: number; z: number; yaw: number } {
  return resolveRoadPlacement(p);
}

// --- Buildings -----------------------------------------------------------------

export interface BuildingFrame {
  x: number;
  z: number;
  /** Faces the road: local +Z points at it, local X runs along the frontage. */
  yaw: number;
  /** The lowest ground under the footprint — the building stands here (its
   * plinth sinks below); its paved forecourt's surface is at base + 0.01. */
  base: number;
  toWorld: (lx: number, lz: number) => [number, number];
}

export function buildingFrame(b: BuildingSpec): BuildingFrame {
  const { x, z, yaw } = resolve(b);
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const toWorld = (lx: number, lz: number): [number, number] => [x + lx * c + lz * s, z - lx * s + lz * c];
  let base = Infinity;
  for (const fx of [-0.5, 0.5]) {
    for (const fz of [-0.5, 0.5]) {
      base = Math.min(base, groundHeight(...toWorld(fx * b.width, fz * b.depth)));
    }
  }
  return { x, z, yaw, base, toWorld };
}

/** Surface of a building's paved forecourt. */
export const FORECOURT_LIFT = 0.01;

// --- Sidewalks, plaza, lay-by -------------------------------------------------

const sidewalk = (uFrom: number, uTo: number, side: 1 | -1) =>
  buildRoadStrip({
    uFrom,
    uTo,
    near: side * SIDEWALK.inner,
    far: side * SIDEWALK.outer,
    surface: paveY,
    skirt: KERB + 0.04,
    skirtEdges: { near: true, far: true, ends: true },
    steps: Math.max(6, Math.round((uTo - uFrom) * 300)),
  });

/** Sidewalks: the right one is interrupted by the truck lay-by. */
export const SIDEWALK_GEOMETRIES: THREE.BufferGeometry[] = [
  sidewalk(CITY.uFrom, LAY_BY.uFrom + 0.003, 1),
  sidewalk(LAY_BY.uTo - 0.003, CITY.uTo, 1),
  sidewalk(CITY.uFrom, CITY.uTo, -1),
];

/** The activation plaza: level paving from the sidewalk back to its planted edge. */
export const PLAZA_GEOMETRY = buildRoadStrip({
  uFrom: PLAZA.uFrom,
  uTo: PLAZA.uTo,
  near: PLAZA.offsetNear - 0.02,
  far: PLAZA.offsetFar,
  surface: (x, z) => paveY(x, z) + 0.001,
  taper: 0.06,
  skirt: 0.2,
  skirtEdges: { far: true, ends: true },
  steps: 48,
});

/** The loading court beside the lay-by, level with the plaza. */
export const LOADING_COURT_GEOMETRY = buildRoadStrip({
  uFrom: LOADING_COURT.uFrom,
  uTo: LOADING_COURT.uTo,
  near: LOADING_COURT.offsetNear,
  far: LOADING_COURT.offsetFar,
  surface: (x, z) => paveY(x, z) + 0.0005,
  taper: 0.12,
  skirt: 0.2,
  skirtEdges: { far: true, ends: true },
  steps: 24,
});

/** The truck lay-by: road-level asphalt cut into the right sidewalk. */
export const LAY_BY_GEOMETRY = buildRoadStrip({
  uFrom: LAY_BY.uFrom,
  uTo: LAY_BY.uTo,
  near: LAY_BY.offsetNear - 0.04,
  far: LAY_BY.offsetFar,
  surface: roadLevelY,
  taper: 0.28,
  steps: 30,
});

/** A kerb along the lay-by's back edge, up to the plaza/sidewalk paving. */
export const LAY_BY_KERB = buildRoadStrip({
  uFrom: LAY_BY.uFrom,
  uTo: LAY_BY.uTo,
  near: LAY_BY.offsetFar,
  far: LAY_BY.offsetFar + 0.3,
  surface: paveY,
  taper: 0.28,
  skirt: KERB,
  skirtEdges: { near: true },
  steps: 30,
});

// --- Street furniture lines ----------------------------------------------------

/** Street lamps along both sidewalks (x, z, yaw facing the road). */
export const STREET_LAMPS: Array<{ x: number; z: number; yaw: number }> = [
  ...[0.688, 0.708, 0.8225, 0.838].map((u) => resolve({ u, offset: 1.22 })),
  ...[0.69, 0.71, 0.73, 0.75, 0.77, 0.79, 0.81, 0.83].map((u) => resolve({ u, offset: -1.22 })),
];

/** Street trees in grated pits along the left sidewalk, and planted beyond it. */
export const STREET_TREES: Array<[number, number, number]> = [
  ...roadOffsetLine(0.684, 0.838, -1.72, 11).map(([x, z], i): [number, number, number] => [x, z, 0.62 + (i % 3) * 0.06]),
  ...roadOffsetLine(0.713, 0.8, 6.15, 8).map(([x, z], i): [number, number, number] => [x, z, 0.7 + (i % 2) * 0.08]),
  ...[0.684, 0.702, 0.822, 0.84].map((u, i): [number, number, number] => {
    const [x, z] = roadOffsetPoint(u, 1.75);
    return [x, z, 0.62 + (i % 2) * 0.08];
  }),
];

/** Trees framing each building's forecourt: its two front corners and one side. */
export const BUILDING_TREES: Array<[number, number, number]> = BUILDINGS.flatMap((b, i) => {
  const { x, z, yaw } = resolve(b);
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const spots: Array<[number, number]> = [
    [-(b.width / 2 + 0.3), b.depth / 2 + 0.45],
    [b.width / 2 + 0.3, b.depth / 2 + 0.45],
    [(i % 2 ? 1 : -1) * (b.width / 2 + 0.35), -b.depth * 0.15],
  ];
  return spots.map(([lx, lz], k): [number, number, number] => [x + lx * c + lz * s, z - lx * s + lz * c, 0.66 + ((i + k) % 3) * 0.07]);
});

/** Low clipped hedges: behind the left sidewalk, and along the back of the plaza. */
export const HEDGE_LINES = [roadOffsetLine(0.684, 0.842, -2.15, 30), roadOffsetLine(0.716, 0.8, 5.82, 16)];

/** Where the plaza's bunting poles stand (on the paving). */
export const BUNTING_POLE_POSITIONS = BUNTING_POLES.map((pole) => {
  const [x, z] = roadOffsetPoint(pole.u, pole.offset);
  return new THREE.Vector3(x, paveY(x, z), z);
});

// --- The parked truck -------------------------------------------------------

/** The second truck's fixed pose, in the lay-by facing the direction of travel. */
export const PARKED_TRUCK_POSE = (() => {
  const tangent = new THREE.Vector3();
  const [x, z] = roadOffsetPoint(PARKED_TRUCK.u, PARKED_TRUCK.offset);
  ROAD_CURVE.getTangentAt(PARKED_TRUCK.u, tangent);
  return {
    position: new THREE.Vector3(x, roadLevelY(x, z), z),
    tangent: new THREE.Vector3(tangent.x, 0, tangent.z).normalize(),
  };
})();
