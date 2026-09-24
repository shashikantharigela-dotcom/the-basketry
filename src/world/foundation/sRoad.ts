import * as THREE from "three";
import { TERRAIN_PADS } from "../stages/worldZones";

/**
 * The 3D foundation's physical world: one continuous S-shaped road laid
 * across a rounded miniature terrain. This module is pure data + math —
 * no React — so the terrain, the road mesh, the truck and the camera all
 * read the exact same curve and the exact same ground height, and can
 * never drift apart from one another.
 *
 * Story stages are deliberately NOT defined here. Everything is
 * parameterized by `u` (0–1 arc-length along the road), so later stage
 * work only has to decide *where along the road* something happens.
 */

// ---------------------------------------------------------------------------
// Road shape
// ---------------------------------------------------------------------------

/** Where the road starts and ends along z (it always reads as forward motion, -z).
 * It runs edge to edge across the terrain, draping over the rounded rims,
 * so the road never visibly stops in the middle of the world. */
const ROAD_Z_START = 31;
const ROAD_Z_END = -95;
/** Lateral swing of each bend. */
const ROAD_AMPLITUDE = 6.5;
/** Full sine periods along the road — 2 = two linked S-curves (four bends). */
const ROAD_PERIODS = 2;
/** Fraction of the road at each end that eases from straight into the S. */
const ROAD_EASE = 0.1;
const ROAD_CONTROL_POINTS = 48;

/** Paved width. Matches the legacy WorldRoad (1.6) so the existing truck GLB scale still reads right. */
export const ROAD_WIDTH = 1.6;
export const ROAD_HALF_WIDTH = ROAD_WIDTH / 2;
/** How far the road surface sits above the raw ground — the truck's wheels sit on this. */
export const ROAD_SURFACE_OFFSET = 0.04;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function buildRoadCurve(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= ROAD_CONTROL_POINTS; i++) {
    const s = i / ROAD_CONTROL_POINTS;
    const envelope = smoothstep(0, ROAD_EASE, s) * smoothstep(1, 1 - ROAD_EASE, s);
    const x = ROAD_AMPLITUDE * Math.sin(s * Math.PI * 2 * ROAD_PERIODS) * envelope;
    const z = THREE.MathUtils.lerp(ROAD_Z_START, ROAD_Z_END, s);
    points.push(new THREE.Vector3(x, 0, z));
  }
  return new THREE.CatmullRomCurve3(points, false, "centripetal");
}

/** The road's centerline on the flat XZ plane (y = 0). Always sample with
 * getPointAt/getTangentAt (arc-length), so equal scroll = equal distance. */
export const ROAD_CURVE = buildRoadCurve();
export const ROAD_LENGTH = ROAD_CURVE.getLength();

// ---------------------------------------------------------------------------
// Rounded miniature terrain
// ---------------------------------------------------------------------------

/** Centre + half-extents of the terrain slab, sized to hold the whole road with margin. */
export const TERRAIN_CENTER = new THREE.Vector2(0, (ROAD_Z_START + ROAD_Z_END) / 2);
export const TERRAIN_HALF_SIZE = new THREE.Vector2(30, (ROAD_Z_START - ROAD_Z_END) / 2 + 0.5);

/** Gentle "tiny planet" curvature: the ground falls away from the centre,
 * so the horizon rolls over like a miniature diorama rather than
 * stretching flat to infinity. */
const DOME_CURVATURE = 0.0011;
/** Superellipse exponent for the slab outline — high = squarer, with rounded corners. */
const EDGE_POWER = 4;
/** Where (0–1 of the superellipse radius) the edge shoulder begins rolling down. */
const EDGE_SHOULDER_START = 0.82;
const EDGE_DROP = 5;

/** Base ground height: dome curvature + rounded edge falloff. The road
 * follows exactly this — no hills under the pavement. */
export function groundHeight(x: number, z: number): number {
  const dx = x - TERRAIN_CENTER.x;
  const dz = z - TERRAIN_CENTER.y;
  const dome = -(dx * dx + dz * dz) * DOME_CURVATURE;

  const r = Math.pow(
    Math.pow(Math.abs(dx) / TERRAIN_HALF_SIZE.x, EDGE_POWER) + Math.pow(Math.abs(dz) / TERRAIN_HALF_SIZE.y, EDGE_POWER),
    1 / EDGE_POWER
  );
  // Quarter-circle-like roll-off: flat, then an ever-steeper rounded shoulder.
  const edgeT = clamp01((r - EDGE_SHOULDER_START) / (1 - EDGE_SHOULDER_START));
  const edge = (1 - Math.sqrt(1 - edgeT * edgeT)) * EDGE_DROP;

  return dome - edge;
}

/** Soft rolling hills (0 .. ~1.8) — layered sines rather than noise, so
 * the landscape stays smooth, rounded and toy-like. */
export function hillHeight(x: number, z: number): number {
  const a = 0.5 + 0.5 * Math.sin(x * 0.21 + 1.3) * Math.cos(z * 0.17 - 0.4);
  const b = 0.5 + 0.5 * Math.sin(x * 0.47 - z * 0.33 + 2.1);
  const c = 0.5 + 0.5 * Math.cos(x * 0.11 + z * 0.09);
  return a * a * 1.1 + b * b * 0.35 + c * 0.35;
}

// Dense lookup of the road centerline, used for terrain road-distance masks.
const ROAD_SAMPLE_COUNT = 320;
export const ROAD_SAMPLES: THREE.Vector3[] = ROAD_CURVE.getSpacedPoints(ROAD_SAMPLE_COUNT);

/** Approximate horizontal distance from (x, z) to the road centerline. */
export function distanceToRoad(x: number, z: number): number {
  let best = Infinity;
  for (let i = 0; i < ROAD_SAMPLES.length; i++) {
    const p = ROAD_SAMPLES[i];
    const dx = x - p.x;
    const dz = z - p.z;
    const d = dx * dx + dz * dz;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/** 0–1: how strongly the stage pads (see stages/worldZones.ts) level the
 * hills at (x, z) — 1 inside a pad, easing to 0 across its falloff. */
function padFlatten(x: number, z: number): number {
  let flatten = 0;
  for (const pad of TERRAIN_PADS) {
    const d = Math.hypot(x - pad.x, z - pad.z);
    flatten = Math.max(flatten, 1 - smoothstep(pad.radius, pad.radius + pad.falloff, d));
  }
  return flatten;
}

/** Full terrain height: ground + hills, with hills flattened into a
 * clean verge along the road and under any stage building pads. */
export function terrainHeight(x: number, z: number, roadDistance = distanceToRoad(x, z)): number {
  const hillMask = smoothstep(ROAD_HALF_WIDTH + 0.7, ROAD_HALF_WIDTH + 6, roadDistance) * (1 - padFlatten(x, z));
  // Tuck the ground just under the pavement so the road never z-fights.
  const verge = roadDistance < ROAD_HALF_WIDTH + 0.4 ? -0.02 : 0;
  return groundHeight(x, z) + hillHeight(x, z) * hillMask + verge;
}

// ---------------------------------------------------------------------------
// Frames along the road
// ---------------------------------------------------------------------------

const UP = new THREE.Vector3(0, 1, 0);
const TANGENT_DU = 0.0015;
const aheadPoint = new THREE.Vector3();

/** Point on the road surface at arc-length fraction `u` (0–1). */
export function getRoadPoint(u: number, out: THREE.Vector3): THREE.Vector3 {
  ROAD_CURVE.getPointAt(clamp01(u), out);
  out.y = groundHeight(out.x, out.z) + ROAD_SURFACE_OFFSET;
  return out;
}

/** Unit tangent along the road surface at `u`, including the dome's pitch. */
export function getRoadTangent(u: number, out: THREE.Vector3): THREE.Vector3 {
  const a = clamp01(u - TANGENT_DU);
  const b = clamp01(u + TANGENT_DU);
  getRoadPoint(a, out);
  getRoadPoint(b, aheadPoint);
  return out.subVectors(aheadPoint, out).normalize();
}

/** Horizontal unit vector to the right of the direction of travel at `u`. */
export function getRoadRight(u: number, out: THREE.Vector3): THREE.Vector3 {
  ROAD_CURVE.getTangentAt(clamp01(u), out);
  out.y = 0;
  return out.crossVectors(out.normalize(), UP).normalize();
}

const curvA = new THREE.Vector3();
const curvB = new THREE.Vector3();

/** Signed horizontal turn rate at `u` (radians per unit u-step): positive
 * when the road bends left, negative when it bends right. */
export function getRoadTurn(u: number, du = 0.01): number {
  ROAD_CURVE.getTangentAt(clamp01(u - du), curvA);
  ROAD_CURVE.getTangentAt(clamp01(u + du), curvB);
  const cross = curvA.z * curvB.x - curvA.x * curvB.z;
  const dot = curvA.x * curvB.x + curvA.z * curvB.z;
  return Math.atan2(cross, dot);
}

// ---------------------------------------------------------------------------
// Truck ↔ road synchronization (placeholder)
// ---------------------------------------------------------------------------

/**
 * PLACEHOLDER for syncing the existing THE BASKETRY truck GLB to the road.
 *
 * Right now the truck simply drives from `startU` to `endU` linearly over
 * the whole scroll. When the story stages are built, replace
 * `truckRoadU` with a stage-aware mapping (e.g. hold at a stop, ease in
 * and out of each stage) — the truck, camera and anything else that
 * follows the truck all read from this one function, so they stay in
 * sync automatically.
 */
export const TRUCK_SYNC = {
  /** Road fraction the truck starts at (scroll = 0) — clear of the terrain rim. */
  startU: 0.1,
  /** Road fraction the truck ends at (scroll = 1). */
  endU: 0.86,
};

/** Maps global scroll progress (0–1) to the truck's position along the road (0–1). */
export function truckRoadU(progress: number): number {
  return THREE.MathUtils.lerp(TRUCK_SYNC.startU, TRUCK_SYNC.endU, clamp01(progress));
}

/** Truck pose on the road for a given scroll progress — same signature as
 * the legacy computeTruckPose, so the existing Truck component can use it. */
export function computeRoadTruckPose(progress: number, outPosition: THREE.Vector3, outTangent: THREE.Vector3): void {
  const u = truckRoadU(progress);
  getRoadPoint(u, outPosition);
  getRoadTangent(u, outTangent);
}
