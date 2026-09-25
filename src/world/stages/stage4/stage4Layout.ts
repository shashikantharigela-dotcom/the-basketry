/**
 * STAGE 4 — CONSUMER APPROACHES & EXPERIENCES PRODUCTS: the activation is
 * established and people are discovering the products — approaching,
 * browsing the shelves, tasting, talking with the team, leaving with bags.
 *
 * Visual reference: references/approved/stage4_consumer_experience_reference.png
 *
 * Where: the road leaves Stage 3's village and enters a modern mixed-use
 * district (road u ≈ 0.68 → 0.84, scroll ≈ 74–92%). On this stretch the
 * S-road runs almost straight and then bends right, so the RIGHT of travel
 * is the inside of the bend — the activation sits there on a paved plaza
 * between apartment blocks and office buildings, a second THE BASKETRY
 * truck parked in a lay-by just past it. The camera watches from the left
 * (outside of the bend): road and journey truck in front, the activation
 * beyond, the residential + corporate skyline behind.
 *
 * Pure layout data (no imports from the road/terrain modules) so the shared
 * terrain and vegetation registries can read it without an import cycle.
 * Road-relative things use road position `u` and lateral `offset` (+ = right
 * of travel), resolved in stage4Geometry.ts; yaw 0 = facing the road.
 *
 * Scale: 0.22 units per metre, like the truck and every other stage.
 */

import type { FigureSpec } from "../common/Figures";
import type { RoadPlacement } from "../common/roadPlacement";
import type { Rect } from "../common/types";

/** Where the city begins and ends along the road. */
export const CITY = { uFrom: 0.68, uTo: 0.845 };

/** Paved sidewalks on both sides of the road (offset range from the centerline). */
export const SIDEWALK = { inner: 0.84, outer: 1.4 };

/** The activation plaza on the right of the road (road-relative). */
export const PLAZA = { uFrom: 0.71, uTo: 0.772, offsetNear: 1.4, offsetFar: 5.7 };

/** A paved loading court beside the lay-by, continuing the plaza. */
export const LOADING_COURT = { uFrom: 0.768, uTo: 0.806, offsetNear: 2.3, offsetFar: 5.1 };

/** The truck lay-by, cut into the right sidewalk just past the plaza. */
export const LAY_BY = { uFrom: 0.768, uTo: 0.808, offsetNear: 0.82, offsetFar: 2.3 };

/** The SECOND THE BASKETRY truck, in the lay-by facing the direction of
 * travel, its open rear doors toward the activation. */
export const PARKED_TRUCK = { u: 0.789, offset: 1.58 };

/** Level ground under the plaza and every building (world x/z: the plaza
 * centreline at u 0.715–0.786, offset 3.9, and each building's centre). */
export const STAGE4_PADS = [
  { x: 5.87, z: -61.51, radius: 2.9, falloff: 2.2 },
  { x: 4.11, z: -64.33, radius: 2.9, falloff: 2.2 },
  { x: 2.3, z: -67.12, radius: 2.9, falloff: 2.2 },
  { x: 0.63, z: -69.83, radius: 2.9, falloff: 2.2 },
  { x: 7.85, z: -58.98, radius: 2.1, falloff: 2.2 },
  { x: 9.51, z: -64.95, radius: 2.35, falloff: 2.2 },
  { x: 7.76, z: -68.99, radius: 2.25, falloff: 2.2 },
  { x: 4.81, z: -71.6, radius: 2.15, falloff: 2.2 },
  { x: 12.5, z: -68.84, radius: 2.5, falloff: 2.2 },
  { x: 9.34, z: -73.02, radius: 2.35, falloff: 2.2 },
  { x: 1.17, z: -73.67, radius: 2.3, falloff: 2.2 },
  { x: -9.06, z: -67.73, radius: 2.45, falloff: 2.2 },
  { x: -10.6, z: -71.82, radius: 2.15, falloff: 2.2 },
  { x: -12.69, z: -76.22, radius: 2.45, falloff: 2.2 },
  { x: -10.83, z: -62.3, radius: 2.25, falloff: 2.2 },
];

/** Manicured city green for the Stage 4 stretch (after Stage 3's village green). */
export const STAGE4_ZONE = {
  id: "consumerExperience",
  zFrom: -60,
  zTo: -80,
  fade: 6,
  strength: 0.7,
  palette: { low: "#7b9a4c", high: "#93ad5e", verge: "#a8a38c" },
};

// ---------------------------------------------------------------------------
// The activation
// ---------------------------------------------------------------------------

/** The large red canopy: U of stocked shelves inside, tasting counter at the front. */
export const CANOPY: RoadPlacement = { u: 0.744, offset: 3.6 };
export const CANOPY_SIZE = { width: 1.8, depth: 1.2, leg: 0.56 };

/** Product display tables round the canopy (jar pyramids, packs, samples). */
export const DISPLAY_TABLES: RoadPlacement[] = [
  { u: 0.7275, offset: 2.55, yaw: 0.25 },
  { u: 0.7605, offset: 2.5, yaw: -0.25 },
  { u: 0.7275, offset: 4.55, yaw: 0.1 },
  { u: 0.7605, offset: 4.6, yaw: -0.1 },
];
/** Parasols over the two back tables. */
export const PARASOLS: RoadPlacement[] = [
  { u: 0.7275, offset: 4.55 },
  { u: 0.7605, offset: 4.6 },
];
/** White and red display plinths stacked with jars, at the front of the plaza. */
export const PLINTHS: RoadPlacement[] = [
  { u: 0.7505, offset: 2.0, yaw: -0.2 },
  { u: 0.7355, offset: 1.95, yaw: 0.3 },
  { u: 0.7705, offset: 3.6, yaw: -0.5 },
];
/** Woven basket displays of produce. */
export const BASKET_DISPLAYS: RoadPlacement[] = [
  { u: 0.7185, offset: 3.4, yaw: 0.5 },
  { u: 0.7445, offset: 4.95, yaw: 0 },
];
/** Tall standee banners (brand red and white, basket emblem — no text). */
export const BANNERS: RoadPlacement[] = [
  { u: 0.7145, offset: 2.0, yaw: 0.4 },
  { u: 0.7765, offset: 2.9, yaw: -0.5 },
  { u: 0.7355, offset: 5.3, yaw: 0.1 },
  { u: 0.7535, offset: 5.3, yaw: -0.1 },
];
/** Bunting poles; the bunting is strung between consecutive poles. */
export const BUNTING_POLES: RoadPlacement[] = [
  { u: 0.7135, offset: 2.4 },
  { u: 0.7155, offset: 5.4 },
  { u: 0.744, offset: 5.5 },
  { u: 0.7725, offset: 5.4 },
  { u: 0.7775, offset: 4.2 },
];
/** Concrete planters with flowering shrubs along the plaza's road edge
 * (an opening left at the main entrance, facing the canopy). */
export const PLANTERS: Array<RoadPlacement & { length: number }> = [
  { u: 0.7155, offset: 1.62, length: 0.62 },
  { u: 0.7225, offset: 1.62, length: 0.62 },
  { u: 0.7295, offset: 1.62, length: 0.55 },
  { u: 0.7358, offset: 1.62, length: 0.34 },
  { u: 0.7522, offset: 1.62, length: 0.34 },
  { u: 0.7585, offset: 1.62, length: 0.55 },
  { u: 0.765, offset: 1.62, length: 0.5 },
  // Round the back and sides of the plaza.
  { u: 0.7125, offset: 4.0, yaw: Math.PI / 2, length: 0.7 },
  { u: 0.7215, offset: 5.45, length: 0.6 },
  { u: 0.7665, offset: 5.45, length: 0.6 },
];
/** Stock by the truck: pallets of cartons being wheeled to the stall. */
export const CARTON_STACKS: Array<RoadPlacement & { count: number; pallet?: boolean }> = [
  { u: 0.7772, offset: 2.78, yaw: 0.1, count: 9, pallet: true },
  { u: 0.7795, offset: 3.62, yaw: -0.2, count: 6, pallet: true },
  { u: 0.7755, offset: 4.6, yaw: 0.2, count: 5, pallet: true },
  { u: 0.7515, offset: 4.35, yaw: 0.1, count: 3 },
];
/** A hand truck of cartons on its way from the truck. */
export const HAND_TRUCK: RoadPlacement = { u: 0.7735, offset: 2.45, yaw: 2.2 };

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface Stage4Figure extends RoadPlacement {
  pose: FigureSpec["pose"];
  shirt: string;
  hat?: FigureSpec["hat"];
  hatColor?: string;
  trousers?: string;
  outfit?: FigureSpec["outfit"];
}

const RED = "#c8161d";
const DARK = "#3a3531";
const DENIM = "#3d4f68";
const KHAKI = "#8f7f62";
const staff = (u: number, offset: number, yaw: number, pose: FigureSpec["pose"], cap = true): Stage4Figure => ({
  u,
  offset,
  yaw,
  pose,
  shirt: RED,
  hat: cap ? "cap" : "hair",
  hatColor: RED,
  trousers: DARK,
});
const person = (
  u: number,
  offset: number,
  yaw: number,
  pose: FigureSpec["pose"],
  shirt: string,
  trousers = DENIM,
  outfit: FigureSpec["outfit"] = "trousers"
): Stage4Figure => ({ u, offset, yaw, pose, shirt, trousers, hat: "hair", outfit });

/** THE BASKETRY team in brand red: behind the counter, at the tables, at the
 * truck. Yaw 0 = facing the road (toward the camera). */
export const STAGE4_STAFF: Stage4Figure[] = [
  staff(0.7415, 3.4, 0, "present"),
  staff(0.7465, 3.4, 0, "talk", false),
  staff(0.744, 3.82, Math.PI, "hold", false),
  staff(0.7275, 2.95, 0.3, "talk"),
  staff(0.7605, 2.9, -0.3, "present", false),
  staff(0.7275, 4.2, Math.PI - 0.2, "present", false),
  staff(0.7788, 2.3, 2.3, "carton"),
  staff(0.7748, 3.2, 2.1, "carton"),
];

/** Consumers — a busy, believable crowd, not a festival: at the tasting
 * counter, at the tables and shelves, arriving, and leaving with bags. */
export const STAGE4_CONSUMERS: Stage4Figure[] = [
  // At the tasting counter (facing it, i.e. away from the road), with a
  // short queue behind.
  person(0.7395, 2.8, Math.PI + 0.15, "taste", "#f1eee6"),
  person(0.742, 2.74, Math.PI, "hold", "#d7892f", KHAKI),
  person(0.7448, 2.78, Math.PI - 0.1, "taste", "#b0306a", DENIM, "sari"),
  person(0.7475, 2.74, Math.PI - 0.15, "talk", "#5f8fb3"),
  person(0.7498, 2.82, Math.PI - 0.4, "taste", "#e8d9b8", "#57534c"),
  person(0.7372, 2.86, Math.PI + 0.45, "bag", "#2f6b62", KHAKI),
  person(0.7432, 2.45, Math.PI, "stand", "#9b3b4a", DENIM),
  person(0.7458, 2.4, Math.PI - 0.1, "talk", "#e2c15a", DENIM, "sari"),
  // Round the front tables.
  person(0.7255, 2.2, Math.PI - 0.4, "inspect", "#e8d9b8"),
  person(0.7298, 2.18, Math.PI + 0.3, "hold", "#3f5f8a", KHAKI),
  person(0.7245, 2.62, -2.2, "taste", "#d46a86", DENIM, "sari"),
  person(0.7625, 2.15, Math.PI + 0.35, "taste", "#e2a33b", DENIM, "sari"),
  person(0.7585, 2.2, Math.PI - 0.2, "talk", "#f1eee6", "#57534c"),
  person(0.7632, 2.58, 2.2, "hold", "#6b8f5a", KHAKI),
  // Round the plinths.
  person(0.7518, 1.72, Math.PI - 0.6, "hold", "#c9d6e3", DENIM),
  person(0.7338, 1.7, Math.PI + 0.5, "inspect", "#f0b35a", DENIM, "sari"),
  person(0.7688, 3.3, -1.9, "taste", "#44607f"),
  // Browsing the side shelves inside the canopy.
  person(0.7398, 3.55, Math.PI / 2, "hold", "#7c9c52"),
  person(0.7482, 3.55, -Math.PI / 2, "inspect", "#c85a3a", DENIM, "sari"),
  // Under the parasols at the back tables.
  person(0.7245, 4.15, Math.PI + 0.3, "taste", "#6d4c8f"),
  person(0.7305, 4.2, Math.PI - 0.3, "hold", "#f4f1e8", KHAKI),
  person(0.7635, 4.25, Math.PI - 0.2, "talk", "#2e7f9a", DENIM, "sari"),
  person(0.7575, 4.2, Math.PI + 0.3, "bag", "#d9c46a"),
  person(0.7605, 4.12, Math.PI, "taste", "#f1eee6", DARK),
  // At the basket displays.
  person(0.7205, 3.05, 2.4, "inspect", "#a8452c", KHAKI),
  person(0.7178, 3.1, 1.2, "hold", "#e9e2d0", DENIM, "sari"),
  person(0.7445, 4.62, Math.PI, "inspect", "#5a7fa3"),
  // Arriving along the sidewalk and through the entrance.
  person(0.7445, 1.85, Math.PI + 0.1, "stand", "#f1eee6", DENIM),
  person(0.7415, 1.18, -1.4, "stand", "#e36b5a", DENIM, "sari"),
  person(0.7075, 1.15, -1.55, "stand", "#415a7a", KHAKI),
  person(0.7025, 1.2, -1.5, "talk", "#d9a441", DENIM),
  // Leaving with their shopping.
  person(0.7535, 1.2, 1.5, "bag", "#d9d2c3", DENIM),
  person(0.7195, 1.2, 1.6, "bag", "#9c6b3f", DARK, "sari"),
  person(0.7675, 3.5, 0.9, "bag", "#5b7f4a", KHAKI),
  person(0.7645, 1.18, 1.55, "bag", "#b8475a", DENIM, "sari"),
];

// ---------------------------------------------------------------------------
// The district: apartments + offices, streetscape
// ---------------------------------------------------------------------------

export interface BuildingSpec extends RoadPlacement {
  kind: "apartment" | "office";
  /** Frontage along the road, depth away from it (world units). */
  width: number;
  depth: number;
  floors: number;
  /** Facade base colour (apartments) or glass tint (offices). */
  tone: string;
}

export const BUILDINGS: BuildingSpec[] = [
  // Right of the road: residential by the city's edge and behind the plaza,
  // offices further along.
  { kind: "apartment", u: 0.694, offset: 4.4, width: 2.8, depth: 2.1, floors: 5, tone: "#f1ebe0" },
  { kind: "apartment", u: 0.722, offset: 8.8, width: 3.4, depth: 2.2, floors: 7, tone: "#efe6d6" },
  { kind: "office", u: 0.752, offset: 9.5, width: 2.8, depth: 2.6, floors: 10, tone: "#7d9fb5" },
  { kind: "apartment", u: 0.781, offset: 8.4, width: 3.0, depth: 2.1, floors: 6, tone: "#f3eee6" },
  { kind: "office", u: 0.733, offset: 13.4, width: 3.2, depth: 3.0, floors: 13, tone: "#6f93ab" },
  { kind: "office", u: 0.772, offset: 13.0, width: 3.0, depth: 2.8, floors: 11, tone: "#86a6b9" },
  { kind: "office", u: 0.812, offset: 6.2, width: 3.2, depth: 2.4, floors: 6, tone: "#7898ad" },
  // Left of the road, beyond the bend: offices and apartments along the far side.
  { kind: "office", u: 0.806, offset: -5.6, width: 3.4, depth: 2.6, floors: 7, tone: "#7d9fb5" },
  { kind: "apartment", u: 0.832, offset: -5.4, width: 3.0, depth: 2.1, floors: 6, tone: "#f0e9dc" },
  { kind: "office", u: 0.858, offset: -6.4, width: 3.0, depth: 3.0, floors: 10, tone: "#6f93ab" },
  { kind: "apartment", u: 0.782, offset: -9.8, width: 3.2, depth: 2.2, floors: 8, tone: "#ede3d2" },
];

/** Extra trees in the lawns between the buildings (road u, offset, scale). */
export const DISTRICT_TREES: Array<[number, number, number]> = [
  [0.707, 7.0, 0.72],
  [0.7, 10.4, 0.8],
  [0.738, 7.6, 0.7],
  [0.738, 9.9, 0.78],
  [0.766, 7.8, 0.74],
  [0.766, 10.1, 0.7],
  [0.797, 8.7, 0.76],
  [0.801, 11.0, 0.72],
  [0.748, -3.3, 0.7],
  [0.765, -3.7, 0.76],
  [0.788, -3.4, 0.7],
];

/**
 * A few passers-by outside the activation, going about their day: on the
 * sidewalks (road terms) or on a building's forecourt (`building` index into
 * BUILDINGS, local lx/lz, yaw relative to facing the road).
 */
export const PEDESTRIANS: Array<
  RoadPlacement & {
    pose: FigureSpec["pose"];
    shirt: string;
    trousers?: string;
    outfit?: FigureSpec["outfit"];
    building?: number;
    lx?: number;
    lz?: number;
  }
> = [
  // Left sidewalk (on this side +π/2 faces the direction of travel).
  { u: 0.735, offset: -1.1, yaw: Math.PI / 2, pose: "talk", shirt: "#f1eee6", trousers: DENIM },
  { u: 0.7365, offset: -1.26, yaw: Math.PI / 2, pose: "stand", shirt: "#b0306a", trousers: DENIM, outfit: "sari" },
  { u: 0.758, offset: -1.18, yaw: -Math.PI / 2, pose: "stand", shirt: "#3f5f8a", trousers: KHAKI },
  { u: 0.79, offset: -1.15, yaw: Math.PI / 2, pose: "bag", shirt: "#e2a33b", trousers: DENIM, outfit: "sari" },
  { u: 0.806, offset: -1.2, yaw: -Math.PI / 2, pose: "stand", shirt: "#d9d2c3", trousers: DARK },
  // Right sidewalk beyond the lay-by, walking toward the activation.
  { u: 0.818, offset: 1.15, yaw: Math.PI / 2, pose: "stand", shirt: "#5b7f4a", trousers: KHAKI },
  // Coming home with shopping (first apartment block).
  { u: 0, offset: 0, building: 0, lx: 0.05, lz: 1.4, yaw: Math.PI, pose: "bag", shirt: "#c85a3a", trousers: DENIM, outfit: "sari" },
  // Neighbours chatting on the forecourt behind the plaza.
  { u: 0, offset: 0, building: 1, lx: 1.15, lz: 1.6, yaw: 0.5, pose: "talk", shirt: "#e8d9b8", trousers: DENIM },
  { u: 0, offset: 0, building: 1, lx: 0.85, lz: 1.65, yaw: -0.6, pose: "stand", shirt: "#2e7f9a", trousers: DENIM, outfit: "sari" },
  // Office workers outside the offices.
  { u: 0, offset: 0, building: 6, lx: -0.55, lz: 1.65, yaw: 0.7, pose: "talk", shirt: "#f4f1e8", trousers: DARK },
  { u: 0, offset: 0, building: 6, lx: -0.28, lz: 1.72, yaw: -2.3, pose: "clipboard", shirt: "#9fb6c9", trousers: DARK },
  { u: 0, offset: 0, building: 7, lx: 0.35, lz: 1.5, yaw: 0, pose: "stand", shirt: "#6d4c8f", trousers: KHAKI },
];

/** Areas the world vegetation is cleared from (after placement — see worldZones). */
export const STAGE4_KEEP_OUT: Rect[] = [
  // Plaza and lay-by.
  { x: 2.23, z: -67.23, width: 15.2, depth: 5.6, rotationY: 2.14 },
  // Each building (footprint + a small margin), in BUILDINGS order.
  { x: 7.85, z: -58.98, width: 3.7, depth: 3, rotationY: 2.05 },
  { x: 9.51, z: -64.95, width: 4.3, depth: 3.1, rotationY: 2.12 },
  { x: 7.76, z: -68.99, width: 3.7, depth: 3.5, rotationY: 2.14 },
  { x: 4.81, z: -71.6, width: 3.9, depth: 3, rotationY: 2.12 },
  { x: 12.5, z: -68.84, width: 4.1, depth: 3.9, rotationY: 2.14 },
  { x: 9.34, z: -73.02, width: 3.9, depth: 3.7, rotationY: 2.12 },
  { x: 1.17, z: -73.67, width: 4.1, depth: 3.3, rotationY: 2.01 },
  { x: -9.06, z: -67.73, width: 4.3, depth: 3.5, rotationY: 2.04 },
  { x: -10.6, z: -71.82, width: 3.9, depth: 3, rotationY: 1.9 },
  { x: -12.69, z: -76.22, width: 3.9, depth: 3.9, rotationY: 1.71 },
  { x: -10.83, z: -62.3, width: 4.1, depth: 3.1, rotationY: 2.11 },
];

/** The street: sidewalks and verges on both sides, cleared of the world's
 * wild grass and shrubs (road-following segments, u 0.68 → 0.845). */
export const STAGE4_STREET_CLEARING: Rect[] = [
  { x: 4.5, z: -55.83, width: 1.7, depth: 4.4, rotationY: 2.01 },
  { x: 3.88, z: -57.08, width: 1.7, depth: 4.4, rotationY: 2.05 },
  { x: 3.22, z: -58.3, width: 1.7, depth: 4.4, rotationY: 2.08 },
  { x: 2.53, z: -59.5, width: 1.7, depth: 4.4, rotationY: 2.11 },
  { x: 1.8, z: -60.68, width: 1.7, depth: 4.4, rotationY: 2.12 },
  { x: 1.06, z: -61.86, width: 1.7, depth: 4.4, rotationY: 2.14 },
  { x: 0.31, z: -63.02, width: 1.7, depth: 4.4, rotationY: 2.14 },
  { x: -0.45, z: -64.19, width: 1.7, depth: 4.4, rotationY: 2.15 },
  { x: -1.2, z: -65.36, width: 1.7, depth: 4.4, rotationY: 2.14 },
  { x: -1.94, z: -66.54, width: 1.7, depth: 4.4, rotationY: 2.12 },
  { x: -2.66, z: -67.72, width: 1.7, depth: 4.4, rotationY: 2.11 },
  { x: -3.35, z: -68.93, width: 1.7, depth: 4.4, rotationY: 2.07 },
  { x: -4, z: -70.15, width: 1.7, depth: 4.4, rotationY: 2.05 },
  { x: -4.61, z: -71.4, width: 1.7, depth: 4.4, rotationY: 1.99 },
  { x: -5.15, z: -72.68, width: 1.7, depth: 4.4, rotationY: 1.95 },
  { x: -5.62, z: -73.99, width: 1.7, depth: 4.4, rotationY: 1.88 },
  { x: -6.01, z: -75.32, width: 1.7, depth: 4.4, rotationY: 1.82 },
];

/** Where Stage 4 dresses its own land (the world vegetation thins here). */
export const STAGE4_BOUNDS = { minX: -18, maxX: 20, minZ: -84, maxZ: -58 };

/** Where the camera's Stage 4 shots lean their aim — the heart of the activation. */
export const STAGE4_FOCUS = { x: 2.22, z: -65.41, height: 0.3 };
