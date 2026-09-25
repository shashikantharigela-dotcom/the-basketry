import * as THREE from "three";
import { groundHeight, ROAD_CURVE } from "../../foundation/sRoad";
import { buildRoadStrip, resolveRoadPlacement, type RoadPlacement } from "../common/roadPlacement";
import { insideRect } from "../common/placement";
import { roadOffsetPoint } from "../stage2/stage2Geometry";
import { paveY } from "../stage4/stage4Geometry";
import {
  ACTIVATION_A,
  ACTIVATION_B,
  ACTIVATION_C,
  ACTIVATION_D,
  ACTIVATION_E,
  EVENT_PLAZA,
  EVENT_TRUCKS,
  LIGHT_POLES,
  LIGHT_RUNS,
  PAGODA_TENTS,
  SERVICE_APRON,
  SIDEWALKS,
  type ActivationSpec,
} from "./stage5Layout";

/**
 * Stage 5 geometry that must follow the road exactly, resolved from the
 * shared road curve at load. Paving uses the same kerb-height surface as
 * Stage 4's city (paveY), so the two districts join seamlessly.
 */

export { paveY };

export function resolve(p: RoadPlacement): { x: number; z: number; yaw: number } {
  return resolveRoadPlacement(p);
}

// --- Paving -------------------------------------------------------------------

const sidewalk = ([uFrom, uTo]: number[], side: 1 | -1) =>
  buildRoadStrip({
    uFrom,
    uTo,
    near: side * SIDEWALKS.inner,
    far: side * SIDEWALKS.outer,
    surface: paveY,
    skirt: 0.105,
    skirtEdges: { near: true, far: true, ends: true },
    steps: Math.max(6, Math.round((uTo - uFrom) * 300)),
  });

export const SIDEWALK_GEOMETRIES = [sidewalk(SIDEWALKS.left, -1), sidewalk(SIDEWALKS.right, 1)];

/** The event plaza: kerb-height paving fanning out across the outside of the bend. */
export const PLAZA_GEOMETRY = buildRoadStrip({
  uFrom: EVENT_PLAZA.uFrom,
  uTo: EVENT_PLAZA.uTo,
  near: EVENT_PLAZA.near,
  far: EVENT_PLAZA.far,
  surface: (x, z) => paveY(x, z) + 0.001,
  taper: EVENT_PLAZA.taper,
  skirt: 0.35,
  skirtEdges: { near: true, far: true, ends: true },
  steps: 60,
});

export const SERVICE_APRON_GEOMETRY = buildRoadStrip({
  uFrom: SERVICE_APRON.uFrom,
  uTo: SERVICE_APRON.uTo,
  near: SERVICE_APRON.near,
  far: SERVICE_APRON.far,
  surface: paveY,
  skirt: 0.15,
  skirtEdges: { near: true, far: true, ends: true },
  steps: 12,
});

// --- Exhibition decks -----------------------------------------------------------

export interface Deck {
  x: number;
  z: number;
  yaw: number;
  /** Level top of the raised deck (the activation stands on it). */
  top: number;
  /** How far its skirt drops to meet the sloping plaza. */
  drop: number;
  width: number;
  depth: number;
  rect: { x: number; z: number; width: number; depth: number; rotationY: number };
}

const DECK_RISE = 0.035;

/** A level deck under an activation: the plaza slopes with the land, so each
 * booth is built up to the highest paving under it. */
export function deckFor(spec: ActivationSpec): Deck {
  const { x, z, yaw } = resolve(spec);
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  let high = -Infinity;
  let low = Infinity;
  for (const fx of [-0.5, 0.5]) {
    for (const fz of [-0.5, 0.5]) {
      const lx = fx * spec.width;
      const lz = fz * spec.depth;
      const y = paveY(x + lx * c + lz * s, z - lx * s + lz * c);
      high = Math.max(high, y);
      low = Math.min(low, y);
    }
  }
  const top = high + DECK_RISE;
  return {
    x,
    z,
    yaw,
    top,
    drop: top - low + 0.04,
    width: spec.width,
    depth: spec.depth,
    rect: { x, z, width: spec.width, depth: spec.depth, rotationY: yaw },
  };
}

export const DECKS = {
  a: deckFor(ACTIVATION_A),
  b: deckFor(ACTIVATION_B),
  c: deckFor(ACTIVATION_C),
  d: deckFor(ACTIVATION_D),
  e: deckFor(ACTIVATION_E),
  pagodas: PAGODA_TENTS.map(deckFor),
};
const ALL_DECKS: Deck[] = [DECKS.a, DECKS.b, DECKS.c, DECKS.d, DECKS.e, ...DECKS.pagodas];

/** What people and things stand on: a deck where there is one, else the paving. */
export function eventSurfaceY(x: number, z: number): number {
  for (const deck of ALL_DECKS) if (insideRect(deck.rect, x, z)) return deck.top;
  return paveY(x, z);
}

// --- Festoon lights -------------------------------------------------------------

export const LIGHT_POLE_HEIGHT = 0.95;

export const LIGHT_POLE_POSITIONS = LIGHT_POLES.map((pole) => {
  const [x, z] = roadOffsetPoint(pole.u, pole.offset);
  return new THREE.Vector3(x, paveY(x, z), z);
});

/** Each festoon run as a sagging polyline between two pole tops. */
export const LIGHT_RUN_LINES: THREE.Vector3[][] = LIGHT_RUNS.map(([i, j]) => {
  const a = LIGHT_POLE_POSITIONS[i].clone().setY(LIGHT_POLE_POSITIONS[i].y + LIGHT_POLE_HEIGHT);
  const b = LIGHT_POLE_POSITIONS[j].clone().setY(LIGHT_POLE_POSITIONS[j].y + LIGHT_POLE_HEIGHT);
  const span = a.distanceTo(b);
  const count = Math.max(6, Math.round(span / 0.12));
  return Array.from({ length: count + 1 }, (_, k) => {
    const t = k / count;
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    p.y -= Math.sin(Math.PI * t) * span * 0.07;
    return p;
  });
});

// --- Trucks -----------------------------------------------------------------------

/** The parked trucks' fixed poses on the plaza kerb. */
export const EVENT_TRUCK_POSES = EVENT_TRUCKS.map(({ u, offset, reverse }) => {
  const tangent = new THREE.Vector3();
  const [x, z] = roadOffsetPoint(u, offset);
  ROAD_CURVE.getTangentAt(u, tangent);
  const facing = new THREE.Vector3(tangent.x, 0, tangent.z).normalize().multiplyScalar(reverse ? -1 : 1);
  // Pitch with the sloping plaza so all wheels sit on the paving.
  const rise = paveY(x + facing.x, z + facing.z) - paveY(x - facing.x, z - facing.z);
  facing.y = rise / 2;
  facing.normalize();
  return { position: new THREE.Vector3(x, paveY(x, z), z), tangent: facing };
});

/** Ground under the skyline towers. */
export function lowestGround(x: number, z: number, w: number, d: number): number {
  let low = Infinity;
  for (const fx of [-0.5, 0.5]) for (const fz of [-0.5, 0.5]) low = Math.min(low, groundHeight(x + fx * w, z + fz * d));
  return low;
}
