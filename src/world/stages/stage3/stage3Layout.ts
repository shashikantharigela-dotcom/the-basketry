/**
 * STAGE 3 — AWARENESS SETUP: THE BASKETRY reaches a community and begins
 * creating awareness around the selected products.
 *
 * Visual reference: references/approved/stage3_awareness_setup_reference.png
 *
 * Pure layout data (no imports from the road/terrain modules) so the shared
 * terrain and vegetation registries can read it without an import cycle.
 * Things that must follow the road exactly (the activation apron, the
 * truck pull-off, fences, marker posts, bunting) are placed in road terms
 * here — road position `u` and lateral `offset` (+ = right of travel) —
 * and converted to world space in stage3Geometry.ts.
 *
 * Mapping onto the real S-road: in this stretch (truck u ≈ 0.48 → 0.63,
 * scroll ≈ 50–70%) the road swings right to x ≈ 6.4 and bends back left,
 * so the INSIDE of that bend is left of travel. As in the reference, the
 * activation and the parked, unloading truck sit on a flat apron on that
 * inside edge, with village homes and trees behind; the camera watches
 * from the outside of the bend with the road in the foreground and the
 * journey truck driving on ahead.
 *
 * Scale: 0.22 units per metre, like the truck and every other stage.
 */

import type { FigureSpec } from "../common/Figures";
import type { Rect } from "../common/types";

/** The flat activation apron beside the road (road-relative). */
export const APRON = { uFrom: 0.518, uTo: 0.566, offsetNear: -1.05, offsetFar: -4.7 };

/** The truck pull-off, running on from the apron toward the bend (road-relative). */
export const PULL_OFF = { uFrom: 0.555, uTo: 0.592, offsetNear: -0.86, offsetFar: -2.45 };

/** The SECOND THE BASKETRY truck, parked in the pull-off facing the direction
 * of travel, its rear (and open doors) toward the activation. */
export const PARKED_TRUCK = { u: 0.576, offset: -1.66 };

/** Level ground for the apron, pull-off and the homes behind them (world x/z). */
export const STAGE3_PADS = [
  { x: -0.9, z: -36.9, radius: 2.6, falloff: 2.0 },
  { x: 0.9, z: -40.0, radius: 2.6, falloff: 2.0 },
  { x: 3.3, z: -42.9, radius: 1.8, falloff: 1.6 },
];

/** Lush ground for the Stage 3 stretch, continuing Stage 2's green (whose
 * tint fades out by z ≈ -37.5) so the two read as one living landscape. */
export const STAGE3_ZONE = {
  id: "awarenessSetup",
  zFrom: -38,
  zTo: -56,
  fade: 8,
  strength: 0.72,
  palette: { low: "#739545", high: "#9eb564", verge: "#99905e" },
};

/**
 * The activation, placed on the apron in road terms: `u` along the road,
 * `offset` from its centerline (negative = the apron side), `yaw` relative
 * to the road direction (0 = facing across the road, toward the camera).
 */
export interface ApronPlacement {
  u: number;
  offset: number;
  yaw?: number;
}

/** The red pop-up canopy over the display shelves and sampling counter. */
export const CANOPY: ApronPlacement = { u: 0.541, offset: -3.35, yaw: 0.05 };
/** Display shelving under the canopy (being stocked). */
export const SHELVES: ApronPlacement[] = [
  { u: 0.537, offset: -3.9, yaw: 0.05 },
  { u: 0.545, offset: -3.9, yaw: 0.05 },
];
/** The sampling / demo counter at the front of the canopy. */
export const COUNTER: ApronPlacement = { u: 0.541, offset: -2.72, yaw: 0.05 };
/** A folding display table still being arranged, beside the canopy. */
export const SIDE_TABLE: ApronPlacement = { u: 0.530, offset: -3.1, yaw: -0.25 };
/** White market parasols. */
export const PARASOLS: ApronPlacement[] = [
  { u: 0.528, offset: -3.9 },
  { u: 0.554, offset: -3.75 },
];
/** Tall standee banners (brand red and white, basket emblem — no text). */
export const BANNERS: ApronPlacement[] = [
  { u: 0.523, offset: -2.25, yaw: 0.35 },
  { u: 0.559, offset: -2.3, yaw: -0.35 },
];
/** A blank A-frame board by the counter. */
export const A_FRAME: ApronPlacement = { u: 0.534, offset: -2.1, yaw: 0.4 };
/** Bunting poles: the bunting is strung between them, along the apron. */
export const BUNTING_POLES: ApronPlacement[] = [
  { u: 0.520, offset: -4.35 },
  { u: 0.541, offset: -4.45 },
  { u: 0.563, offset: -4.3 },
  { u: 0.564, offset: -2.75 },
];
/** Cartons and crates: unloaded stock moving from the truck to the stall. */
export const CARTON_STACKS: Array<ApronPlacement & { count: number; pallet?: boolean }> = [
  { u: 0.5625, offset: -2.25, yaw: 0.1, count: 5, pallet: true },
  { u: 0.562, offset: -3.2, yaw: -0.2, count: 4, pallet: true },
  { u: 0.552, offset: -2.55, yaw: 0.3, count: 3 },
  { u: 0.534, offset: -3.75, yaw: 0.0, count: 2 },
];
/** Potted plants dressing the stall. */
export const STALL_POTS: ApronPlacement[] = [
  { u: 0.525, offset: -2.7 },
  { u: 0.549, offset: -2.3 },
  { u: 0.557, offset: -2.7 },
  { u: 0.532, offset: -4.25 },
];

/** A hand truck (sack trolley) of cartons being wheeled from the truck. */
export const HAND_TRUCK: ApronPlacement = { u: 0.5635, offset: -1.25, yaw: 2.4 };

/** The small team (no crowd — that's Stage 4): three unloading and
 * carrying cartons, two setting up the stall. Positions are road-relative
 * and resolved to world space in stage3Geometry.ts. */
export interface Stage3Figure extends ApronPlacement {
  pose: FigureSpec["pose"];
  shirt: string;
  hat?: FigureSpec["hat"];
  hatColor?: string;
  trousers?: string;
}

const RED = "#c8161d";
const CREAM = "#efe6d4";

export const STAGE3_FIGURES: Stage3Figure[] = [
  // At the truck's open doors, lifting a carton down.
  { u: 0.5652, offset: -1.66, yaw: Math.PI, pose: "carton", shirt: RED, hat: "cap", hatColor: RED, trousers: "#3f3a36" },
  // Carrying cartons across the apron toward the stall.
  { u: 0.559, offset: -2.55, yaw: Math.PI * 0.72, pose: "carton", shirt: RED, hat: "cap", hatColor: RED, trousers: "#3f3a36" },
  { u: 0.553, offset: -3.05, yaw: Math.PI * 0.62, pose: "carton", shirt: RED, hat: "cap", hatColor: RED, trousers: "#3f3a36" },
  // Stocking the shelves under the canopy.
  { u: 0.543, offset: -3.55, yaw: Math.PI, pose: "inspect", shirt: CREAM, hat: "none", trousers: "#4b4440" },
  // Arranging the sampling counter.
  { u: 0.538, offset: -2.42, yaw: 0, pose: "present", shirt: RED, hat: "none", trousers: "#3f3a36" },
];

/** Village homes behind the activation (world x/z, facing yaw, size, wall colour). */
export const HOMES: Array<{ x: number; z: number; yaw: number; w: number; d: number; wall: string }> = [
  { x: -6.6, z: -34.0, yaw: 0.55, w: 1.5, d: 1.2, wall: "#f0e3c8" },
  { x: -5.3, z: -39.2, yaw: 0.45, w: 1.8, d: 1.3, wall: "#ecd8b0" },
  { x: -3.9, z: -44.4, yaw: 0.3, w: 1.5, d: 1.2, wall: "#f3e8d2" },
  { x: -8.4, z: -41.8, yaw: 0.5, w: 1.3, d: 1.1, wall: "#e9d4ab" },
  { x: -1.8, z: -49.4, yaw: 0.15, w: 1.6, d: 1.2, wall: "#efe0c4" },
  { x: -9.2, z: -36.4, yaw: 0.6, w: 1.4, d: 1.1, wall: "#f1e6cf" },
];

/** Trees and plants round the activation and village (kind, x, z, scale). */
export type Stage3Plant = ["mango" | "round" | "banana" | "palm" | "bougainvillea", number, number, number];

export const STAGE3_PLANTS: Stage3Plant[] = [
  // Behind the activation, between the homes.
  ["mango", -3.2, -35.9, 1.15],
  ["mango", -2.1, -41.9, 1.1],
  ["mango", -7.4, -37.6, 1.0],
  ["mango", -6.6, -44.6, 1.2],
  ["palm", -4.4, -33.2, 1.05],
  ["palm", -7.9, -39.6, 1.1],
  ["palm", -3.4, -47.2, 1.0],
  ["palm", -10.6, -43.2, 1.1],
  ["banana", -2.9, -38.7, 1.05],
  ["banana", -1.3, -44.2, 1.0],
  ["banana", -4.5, -42.0, 0.95],
  ["banana", 0.4, -46.6, 1.0],
  ["bougainvillea", -2.2, -33.8, 1.2],
  ["bougainvillea", -0.4, -43.6, 1.15],
  ["bougainvillea", -4.6, -37.2, 1.0],
  // Outside the bend (camera side / foreground), kept off the sightline.
  ["banana", 10.2, -38.4, 1.2],
  ["banana", 11.4, -44.6, 1.15],
  ["mango", 12.6, -41.2, 1.2],
  ["palm", 13.4, -36.6, 1.05],
  ["palm", 12.8, -48.2, 1.1],
  ["bougainvillea", 9.6, -42.6, 1.0],
  ["banana", 9.2, -47.8, 1.0],
];

/** Areas the world vegetation is cleared from (after placement — see worldZones). */
export const STAGE3_KEEP_OUT: Rect[] = [
  // The apron and pull-off (a generous box round both).
  { x: 1.0, z: -39.1, width: 6.4, depth: 10.4, rotationY: -0.5 },
  ...HOMES.map((h) => ({ x: h.x, z: h.z, width: h.w + 0.9, depth: h.d + 0.9, rotationY: h.yaw })),
];

/** Where Stage 3 dresses its own land (the world vegetation thins here). */
export const STAGE3_BOUNDS = { minX: -12, maxX: 14, minZ: -52, maxZ: -31 };

/** Where the camera's Stage 3 shots lean their aim — between the stall and the parked truck. */
export const STAGE3_FOCUS = { x: 1.6, z: -39.6, height: 0.35 };
