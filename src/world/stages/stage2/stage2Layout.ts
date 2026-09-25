/**
 * STAGE 2 — THE BASKETRY APPROACHES PRODUCTS: product evaluation and
 * discovery at a local producer's facility, in a lush Indian agricultural
 * landscape.
 *
 * Master visual reference: references/approved/stage2_product_approaches_reference_v2.png
 *
 * Pure layout data (world coordinates, no imports from the road/terrain
 * modules), like stage1Layout.ts, so the shared terrain can read the pads,
 * zone and keep-outs without an import cycle. Geometry that must follow
 * the road exactly (the courtyard wall, fences, marker posts) is derived
 * from the road in stage2Geometry.ts.
 *
 * Mapping onto the real S-road: in this stretch (truck u ≈ 0.29 → 0.44,
 * scroll ≈ 25–45%) the road swings left to its westmost point (x ≈ -6.5,
 * z ≈ -17) and back, so a courtyard on the INSIDE of that bend has the road
 * wrapping round it, as in the reference. The camera views it from the
 * outside of the bend (west, looking east): the verandah and courtyard
 * face the road and the camera; loading sits to the north (frame-right),
 * behind the evaluation; fields, orchard and paddies spread beyond.
 *
 * Scale: the same 0.22 units per metre as the truck and Stage 1.
 */

import type { FigureSpec } from "../common/Figures";
import type { FieldSpec, Rect } from "../common/types";

/** The raised courtyard. Its road-facing (west) edge follows the road at a
 * constant offset between these road positions; its east edge is straight. */
export const TERRACE = {
  roadUFrom: 0.345,
  roadUTo: 0.418,
  /** Distance from the road centerline to the compound wall face. */
  roadOffset: 2.0,
  eastX: 2.8,
  /** How far the courtyard floor sits above the highest ground under it. */
  lift: 0.2,
};

/** Level ground under the courtyard, and under the paddy fields (paddies are flat by nature). */
export const STAGE2_PADS = [
  { x: -0.7, z: -14.6, radius: 4.2, falloff: 2.2 },
  { x: -0.7, z: -19.4, radius: 4.2, falloff: 2.2 },
  // East paddies.
  { x: 16.0, z: -13.0, radius: 4.2, falloff: 2.4 },
  { x: 16.0, z: -19.6, radius: 4.2, falloff: 2.4 },
  { x: 16.0, z: -26.0, radius: 4.2, falloff: 2.4 },
  // West paddies (outside the bend).
  { x: -16.8, z: -15.0, radius: 3.8, falloff: 2.2 },
  { x: -16.8, z: -21.6, radius: 3.8, falloff: 2.2 },
];

/** Lush green ground for the Stage 2 stretch — blended over the shared
 * natural earth (never replacing it), easing in after Stage 1 ends. */
export const STAGE2_ZONE = {
  id: "productApproaches",
  zFrom: -13,
  zTo: -29,
  fade: 8.5,
  strength: 0.8,
  palette: { low: "#6f9443", high: "#9cb462", verge: "#97905c" },
};

/** The producer's building: cream plaster, red corrugated roof with solar
 * panels, a shaded verandah along its yard-facing (west) front. */
export const HALL = { x: 1.05, z: -18.4, rotationY: -Math.PI / 2, length: 4.4, depth: 2.1, wallHeight: 0.78, verandahDepth: 0.72 };

/** White metal loading canopy north of the building, and a small red-roofed store beyond. */
export const LOADING_CANOPY = { x: 1.0, z: -14.55, rotationY: -Math.PI / 2, length: 2.2, depth: 1.8, height: 0.74 };
export const RED_CANOPY = { x: -0.75, z: -13.2, rotationY: -Math.PI / 2, length: 1.2, depth: 1.0, height: 0.58 };

/** Two steel grain silos behind the loading canopy. */
export const SILOS: Array<[number, number]> = [
  [2.35, -13.25],
  [2.35, -14.3],
];

/** THE KEY STORY MOMENT — product evaluation / discovery: a long table of
 * product samples in front of the verandah, the producer on one side and
 * THE BASKETRY on the other, with crates of produce around them. */
export const EVALUATION = {
  // The table runs across the camera's view, so the producer and THE
  // BASKETRY face each other over it, both seen in profile.
  table: { x: -1.95, z: -17.55, rotationY: 0, length: 0.95 },
  /** A woven mat under the group — it gathers the interaction into one place. */
  mat: { x: -1.95, z: -17.55, rotationY: 0.04, width: 1.45, depth: 1.15 },
  /** Crates and baskets of produce set out beside the table. */
  samples: { x: -2.75, z: -16.7, rotationY: 0.25 },
  /** Sacks and baskets of raw material at the table's verandah end. */
  rawMaterials: { x: -1.2, z: -18.2, rotationY: -0.2 },
};

/** Where the camera's Stage 2 shots lean their aim — the evaluation table. */
export const STAGE2_FOCUS = { x: -1.95, z: -17.5, height: 0.35 };

const BASKETRY_RED = "#c8161d";

/** The people: producer and colleague presenting from the verandah side,
 * THE BASKETRY representative (brand red) and a colleague evaluating from
 * the courtyard side; a few workers in the background. */
export const STAGE2_FIGURES: FigureSpec[] = [
  // THE BASKETRY representative, examining a sample — nearest the camera,
  // facing the producer across the table.
  { x: -2.12, z: -17.88, yaw: 0.08, pose: "inspect", shirt: BASKETRY_RED, hat: "none", trousers: "#3f3a36" },
  // The producer, presenting the product to them.
  { x: -2.08, z: -17.22, yaw: Math.PI - 0.08, pose: "present", shirt: "#e9dcc0", hat: "none", trousers: "#5b4a3b" },
  // Producer's colleague, holding up a second sample.
  { x: -1.62, z: -17.2, yaw: Math.PI + 0.35, pose: "inspect", shirt: "#7f9a5a", hat: "none", trousers: "#4b4440" },
  // THE BASKETRY colleague, taking notes.
  { x: -1.66, z: -17.9, yaw: -0.35, pose: "clipboard", shirt: "#f2ede2", hat: "none", trousers: "#4b4440" },
  // Supporting activity (secondary): loading and the store.
  { x: 0.15, z: -15.1, yaw: 0.9, pose: "carry", shirt: "#c8663f", hat: "none", trousers: "#5b4a3b" },
  { x: -0.35, z: -12.85, yaw: -2.3, pose: "stand", shirt: "#d9cdb6", hat: "none", trousers: "#4b4440" },
];

/** Pallets of sacks / crates under the loading canopy and by the store (secondary). */
export const PALLETS: Array<{ x: number; z: number; rotationY: number; load: "sacks" | "crates" }> = [
  { x: 0.55, z: -13.95, rotationY: 0, load: "sacks" },
  { x: 0.55, z: -14.85, rotationY: 0.05, load: "sacks" },
  { x: 1.45, z: -15.15, rotationY: 0, load: "crates" },
  { x: 1.4, z: -14.0, rotationY: -0.05, load: "sacks" },
  { x: -0.5, z: -13.0, rotationY: 0.1, load: "crates" },
  { x: -1.0, z: -13.5, rotationY: -0.1, load: "sacks" },
];

/** A small forklift and a pallet jack by the loading area (secondary). */
export const FORKLIFT = { x: -0.55, z: -14.7, rotationY: -2.3 };
export const PALLET_JACK = { x: -1.35, z: -15.3, rotationY: 0.6 };

/** Terracotta potted plants along the verandah front (x, z, size). */
export const POTTED_PLANTS: Array<[number, number, number]> = [
  [-0.95, -20.35, 1.1],
  [-0.95, -19.6, 0.9],
  [-0.95, -18.85, 1.0],
  [-0.95, -15.8, 0.85],
  [-3.35, -14.85, 1.0],
  [-1.2, -21.4, 1.0],
  [-1.5, -12.1, 0.9],
  // Framing the evaluation mat.
  [-1.18, -17.0, 0.9],
  [-2.78, -18.25, 0.85],
];

/** Shade trees in the courtyard, with a bench under the southern one. */
export const COURTYARD_TREES: Array<[number, number, number]> = [
  [-2.85, -20.85, 0.72],
  [-3.15, -12.45, 0.62],
  [-3.55, -15.6, 0.5],
  // A young tree behind the evaluation group, shading it from the verandah side.
  [-0.98, -16.35, 0.44],
];

/** Low planted beds with a plastered curb, around the evaluation area (x, z, width, depth, rotationY). */
export const COURTYARD_BEDS: Array<[number, number, number, number, number]> = [
  [-2.55, -19.35, 1.2, 0.42, 0.05],
  [-3.2, -16.45, 0.42, 1.0, 0.08],
];

/** Height of the planted beds' curb above the courtyard floor. */
export const BED_CURB = 0.05;

/** Homely courtyard details: a woven charpai and a cluster of clay water pots. */
export const CHARPAI = { x: -2.45, z: -13.35, rotationY: 0.35 };
export const CLAY_POTS = { x: -1.3, z: -20.85 };

/** A planted bed of flowering shrubs just inside the compound wall (road offsets from the wall face). */
export const WALL_BED = { inset: 0.28, gaps: [[0.44, 0.55]] as Array<[number, number]> };
export const BENCH = { x: -2.3, z: -21.05, rotationY: 0.15 };

/** Flowering bougainvillea at the courtyard edges and along the compound wall (x, z, scale). */
export const BOUGAINVILLEA: Array<[number, number, number]> = [
  // Inside the courtyard, against the wall.
  [-3.55, -21.7, 1.2],
  [-3.9, -19.2, 1.0],
  [-3.6, -13.7, 1.1],
  [-2.9, -11.45, 1.15],
  [-0.2, -11.3, 1.0],
  [-0.4, -22.3, 1.1],
];

/** Crop fields and the fruit orchard around the facility. */
export const STAGE2_FIELDS: FieldSpec[] = [
  // Vegetable beds (trellised) below the orchard, toward the road.
  { kind: "greens", x: 3.9, z: -8.6, width: 2.6, depth: 2.2, rotationY: -0.35 },
  // Fields behind the facility.
  { kind: "greens", x: 6.4, z: -17.0, width: 3.0, depth: 4.6, rotationY: 0.05 },
  { kind: "sprouts", x: 6.2, z: -22.6, width: 3.0, depth: 4.0, rotationY: -0.1 },
  { kind: "tomatoes", x: 5.6, z: -12.2, width: 2.6, depth: 2.4, rotationY: 0.2 },
];

/** The trellised vegetable bed (index into STAGE2_FIELDS). */
export const TRELLIS_FIELD = 0;

export const FRUIT_ORCHARD = { x: 0.3, z: -9.1, columns: 4, rows: 2, spacing: 1.05, rotationY: -0.35 };

/** Paddy fields: grids of flooded plots with earth bunds (x, z = grid centre). */
export const PADDIES: Array<{ x: number; z: number; columns: number; rows: number; plot: [number, number]; rotationY: number }> = [
  { x: 16.0, z: -19.5, columns: 3, rows: 5, plot: [2.2, 2.4], rotationY: 0.04 },
  { x: -16.8, z: -18.3, columns: 2, rows: 4, plot: [2.1, 2.3], rotationY: -0.06 },
];

/** Trees and plants around the facility (kind, x, z, scale). */
export type Stage2Plant = ["mango" | "round" | "banana" | "palm", number, number, number];

export const STAGE2_PLANTS: Stage2Plant[] = [
  // Around the compound: mango shade trees and banana clumps.
  ["mango", 3.9, -11.0, 1.1],
  ["mango", 3.8, -21.6, 1.15],
  ["mango", -1.6, -24.2, 1.2],
  ["mango", 1.2, -25.5, 1.0],
  ["banana", 3.3, -16.0, 1.0],
  ["banana", 3.5, -19.3, 1.1],
  ["banana", -3.2, -10.0, 1.05],
  ["banana", -2.4, -23.6, 1.1],
  ["banana", -0.8, -23.0, 0.95],
  ["banana", 4.6, -24.8, 1.0],
  // Outside the bend (camera side / foreground), clear of the sightline to the courtyard.
  ["banana", -9.3, -10.4, 1.2],
  ["banana", -10.1, -11.6, 1.0],
  ["banana", -9.1, -23.2, 1.15],
  ["banana", -9.9, -22.3, 1.0],
  ["mango", -11.3, -9.2, 1.2],
  ["mango", -11.2, -24.8, 1.25],
  ["palm", -14.6, -11.2, 1.0],
  ["palm", -14.8, -23.2, 1.05],
  // Behind the fields.
  ["palm", 8.8, -14.4, 1.0],
  ["palm", 9.0, -20.2, 1.1],
  ["mango", 9.4, -23.6, 1.1],
  ["mango", 9.2, -10.0, 1.05],
  ["banana", 8.4, -8.4, 1.0],
  ["palm", 7.6, -26.6, 1.05],
];

/** Coconut palms along the paddy bunds and field margins (distant depth). */
export const DISTANT_PALMS: Array<[number, number, number]> = [
  [11.6, -9.8, 1.1], [12.4, -13.6, 0.95], [11.8, -18.4, 1.05], [12.2, -23.5, 1.1], [11.5, -28.4, 1.0],
  [20.3, -11.2, 1.05], [20.8, -16.8, 1.15], [20.1, -22.4, 1.0], [20.6, -28.2, 1.1],
  [14.1, -30.2, 1.0], [17.6, -8.6, 0.95],
  [-14.6, -8.9, 1.05], [-14.4, -26.9, 1.1], [-13.6, -24.6, 0.95],
  [-20.1, -13.6, 1.0], [-20.4, -19.4, 1.1], [-19.8, -24.8, 1.05],
  [-16.2, -10.6, 1.0], [-17.4, -27.2, 1.1],
];

/** Areas the Stage 2 ground cover and the world vegetation stay out of. */
export const STAGE2_KEEP_OUT: Rect[] = [
  // The courtyard (its road-facing edge curves; this box covers it).
  { x: -0.9, z: -16.85, width: 7.6, depth: 11.6, rotationY: 0 },
  ...STAGE2_FIELDS.map((f) => ({ ...f, width: f.width + 0.6, depth: f.depth + 0.6 })),
  { x: FRUIT_ORCHARD.x, z: FRUIT_ORCHARD.z, width: 4.8, depth: 2.8, rotationY: FRUIT_ORCHARD.rotationY },
  ...PADDIES.map((p) => ({
    x: p.x,
    z: p.z,
    width: p.columns * p.plot[0] + 0.6,
    depth: p.rows * p.plot[1] + 0.6,
    rotationY: p.rotationY,
  })),
];

/** Where Stage 2 dresses its own land (its ground cover goes here; the
 * world vegetation is left at nearly full density — the land stays lush). */
export const STAGE2_BOUNDS = { minX: -12, maxX: 11, minZ: -27, maxZ: -6 };
