/**
 * STAGE 2 — THE BASKETRY APPROACHES PRODUCTS: product evaluation and
 * discovery at a producer's processing facility.
 *
 * Master visual reference: references/approved/stage2_product_approaches_reference.png
 *
 * Pure layout data (world coordinates, no imports from the road/terrain
 * modules), like stage1Layout.ts, so the shared terrain can read the pads
 * and keep-outs without an import cycle. Runtime geometry that must follow
 * the road exactly (the terrace edge, the roadside fences) is derived from
 * the road in stage2Geometry.ts.
 *
 * Mapping the reference onto the real S-road: in this stretch (truck
 * u ≈ 0.29 → 0.44, scroll ≈ 25–45%) the road swings left to its westmost
 * point (x ≈ -6.5, z ≈ -17) and back, so a terrace on the INSIDE of that
 * bend has the road wrapping around its west face — the reference's arc.
 * Seen from the outside of the bend (camera to the west, looking east),
 * south is frame-left and north is frame-right, and the truck crosses the
 * frame right-to-left, as in the reference: processing hall centre-left,
 * loading canopy and silos to the right, the evaluation group in front on
 * the yard, the orchard below-right, crop terraces behind.
 *
 * Scale: the same 0.22 units per metre as the truck and Stage 1.
 */

import type { FigureSpec } from "../common/Figures";
import type { FieldSpec, Rect, TreeSpec } from "../common/types";

/** The raised, paved yard. Its road-facing (west) edge follows the road at
 * a constant offset between these road positions; its east edge is straight. */
export const TERRACE = {
  roadUFrom: 0.345,
  roadUTo: 0.418,
  /** Distance from the road centerline to the retaining wall face. */
  roadOffset: 2.0,
  eastX: 2.8,
  /** How far the paving sits above the highest ground under it. */
  lift: 0.26,
};

/** Level ground under the terrace (so no hill pokes through the paving). */
export const STAGE2_PADS = [
  { x: -0.7, z: -14.6, radius: 4.2, falloff: 2.2 },
  { x: -0.7, z: -19.4, radius: 4.2, falloff: 2.2 },
];

/** Processing hall: long cream building, red standing-seam roof, front to the west (the yard). */
export const HALL = { x: 1.0, z: -18.6, rotationY: -Math.PI / 2, length: 4.6, depth: 2.2, wallHeight: 0.86 };

/** Open-sided loading canopy (grey metal) north of the hall, and a small red canopy beyond it. */
export const LOADING_CANOPY = { x: 1.0, z: -14.6, rotationY: -Math.PI / 2, length: 2.3, depth: 1.8, height: 0.78 };
export const RED_CANOPY = { x: -0.8, z: -13.35, rotationY: -Math.PI / 2, length: 1.2, depth: 1.0, height: 0.6 };

/** Twin galvanised silos with a ladder gantry, behind the canopy. */
export const SILOS: Array<[number, number]> = [
  [2.32, -13.35],
  [2.32, -14.4],
];

/** THE KEY STORY MOMENT — product evaluation / discovery: display tables of
 * samples on the yard in front of the hall, with the producer team
 * presenting and THE BASKETRY representative inspecting. */
export const EVALUATION = {
  tables: [
    { x: -2.55, z: -17.7, rotationY: 0.1 },
    { x: -2.35, z: -16.8, rotationY: -0.15 },
    { x: -2.95, z: -18.6, rotationY: 0.3 },
  ],
  /** A spread of sample bowls, baskets and crates on the yard toward the road. */
  samples: { x: -3.35, z: -15.45, rotationY: 0.3 },
};

/** Where the camera's Stage 2 shots lean their aim — the evaluation group. */
export const STAGE2_FOCUS = { x: -2.6, z: -17.3, height: 0.55 };

const BASKETRY_RED = "#c8161d";

/** The people: the producer team presenting and working, THE BASKETRY
 * representative (brand red, with a clipboard) inspecting the products. */
export const STAGE2_FIGURES: FigureSpec[] = [
  // THE BASKETRY representative, looking over the samples.
  { x: -3.15, z: -17.35, yaw: Math.PI / 2 - 0.2, pose: "clipboard", shirt: BASKETRY_RED, hat: "none", trousers: "#3f3a36" },
  // Producer presenting the products across the table.
  { x: -1.95, z: -17.45, yaw: -Math.PI / 2 + 0.25, pose: "present", shirt: "#efe4cf", hat: "none", trousers: "#5b4a3b" },
  // A second producer holding up a sample.
  { x: -1.95, z: -16.5, yaw: -Math.PI / 2 - 0.35, pose: "inspect", shirt: "#8fa36b", hat: "cap", hatColor: "#efe4cf" },
  // A colleague of the representative, inspecting at the second table.
  { x: -3.0, z: -16.45, yaw: Math.PI / 2 + 0.45, pose: "inspect", shirt: "#d9cdb6", hat: "none", trousers: "#4b4440" },
  // The producer's lead, presenting at the third table.
  { x: -2.4, z: -19.0, yaw: -2.3, pose: "present", shirt: "#c8663f", hat: "none", trousers: "#5b4a3b" },
  // Supporting activity: loading-bay workers.
  { x: 0.05, z: -15.3, yaw: 0.9, pose: "carry", shirt: "#b8a27a", hat: "cap", hatColor: "#5b4a3b" },
  { x: -0.2, z: -13.0, yaw: -2.2, pose: "stand", shirt: "#8fa36b", hat: "cap", hatColor: "#efe4cf" },
];

/** Pallets stacked with sacks / crates on the yard and under the canopies. */
export const PALLETS: Array<{ x: number; z: number; rotationY: number; load: "sacks" | "crates" }> = [
  { x: 0.55, z: -14.0, rotationY: 0, load: "sacks" },
  { x: 0.55, z: -14.9, rotationY: 0.05, load: "sacks" },
  { x: 1.4, z: -15.2, rotationY: 0, load: "crates" },
  { x: 1.35, z: -14.05, rotationY: -0.05, load: "sacks" },
  { x: -0.6, z: -13.1, rotationY: 0.1, load: "crates" },
  { x: -1.05, z: -13.6, rotationY: -0.1, load: "sacks" },
  { x: -0.4, z: -16.1, rotationY: 0.2, load: "crates" },
  { x: -0.55, z: -20.35, rotationY: -0.1, load: "crates" },
  { x: -1.1, z: -20.6, rotationY: 0.15, load: "sacks" },
];

/** A red forklift carrying a pallet across the yard, and a pallet jack. */
export const FORKLIFT = { x: -0.9, z: -14.6, rotationY: -2.4 };
export const PALLET_JACK = { x: -1.8, z: -15.1, rotationY: 0.6 };

/** Planters along the hall front and yard edge. */
export const PLANTERS: Array<[number, number, number]> = [
  [-0.3, -19.55, 0],
  [-0.3, -16.7, 0],
];

/** Shrubs spilling over the top of the retaining wall (points inset from the wall; built from the road at runtime). */
export const WALL_PLANTING = {
  inset: 0.3,
  uFrom: 0.349,
  uTo: 0.415,
  gaps: [
    [0.36, 0.366],
    [0.382, 0.39],
    [0.4, 0.405],
  ] as Array<[number, number]>,
};

/** Small trees in planters on the yard, near the wall (as in the reference). */
export const YARD_TREES: Array<[number, number, number]> = [
  [-3.55, -20.35, 0.75],
  [-3.7, -13.9, 0.7],
  [-0.9, -21.0, 0.6],
];

/** Surroundings. */
export const ORANGE_ORCHARD = { x: 0.3, z: -9.1, columns: 4, rows: 2, spacing: 1.05, rotationY: -0.35 };

export const STAGE2_FIELDS: FieldSpec[] = [
  // Fenced vegetable rows below the orchard, toward the road.
  { kind: "greens", x: 3.9, z: -8.6, width: 2.6, depth: 2.2, rotationY: -0.35 },
  // Terraced crop rows behind the facility.
  { kind: "greens", x: 6.4, z: -17.0, width: 3.0, depth: 4.6, rotationY: 0.05 },
  { kind: "sprouts", x: 6.2, z: -22.6, width: 3.0, depth: 4.0, rotationY: -0.1 },
  { kind: "tomatoes", x: 5.6, z: -12.2, width: 2.6, depth: 2.4, rotationY: 0.2 },
];

export const STAGE2_TREES: TreeSpec[] = [
  // Cypresses framing the terrace and the road — the reference's signature tree.
  { kind: "cypress", x: -3.35, z: -10.45, scale: 1.1 },
  { kind: "cypress", x: -2.4, z: -22.9, scale: 1.2 },
  { kind: "cypress", x: 3.6, z: -11.2, scale: 1.25 },
  { kind: "cypress", x: 3.7, z: -15.8, scale: 1.3 },
  { kind: "cypress", x: 3.6, z: -21.4, scale: 1.15 },
  { kind: "cypress", x: 8.4, z: -14.4, scale: 1.2 },
  { kind: "cypress", x: 8.6, z: -20.0, scale: 1.1 },
  { kind: "cypress", x: 4.6, z: -25.8, scale: 1.2 },
  // Outside the bend (camera side), kept clear of the sightline to the yard.
  { kind: "cypress", x: -9.4, z: -10.6, scale: 1.2 },
  { kind: "cypress", x: -10.2, z: -11.6, scale: 1.0 },
  { kind: "cypress", x: -9.2, z: -21.9, scale: 1.25 },
  { kind: "cypress", x: -10.4, z: -23.0, scale: 1.05 },
  // Round olive-like trees.
  { kind: "round", x: 4.9, z: -19.4, scale: 1.0 },
  { kind: "round", x: 9.6, z: -23.4, scale: 1.1 },
  { kind: "round", x: 9.2, z: -10.2, scale: 1.0 },
  { kind: "round", x: -11.4, z: -17.0, scale: 1.15 },
  { kind: "round", x: -8.8, z: -7.6, scale: 1.0 },
  { kind: "round", x: 1.2, z: -25.6, scale: 1.0 },
];

/** Limestone boulders at the wall foot and in the landscape (x, z, size). */
export const BOULDERS: Array<[number, number, number]> = [
  [-3.0, -11.3, 0.16],
  [-2.6, -23.2, 0.2],
  [-8.3, -13.2, 0.18],
  [-8.1, -19.8, 0.22],
  [-8.6, -16.4, 0.12],
  [3.2, -24.4, 0.18],
  [4.0, -10.4, 0.14],
  [-9.9, -14.4, 0.15],
];

/** Areas the ambient/world vegetation must stay out of. */
export const STAGE2_KEEP_OUT: Rect[] = [
  // The terrace (its road-facing edge curves; this box covers it).
  { x: -0.9, z: -16.85, width: 7.6, depth: 9.2, rotationY: 0 },
  ...STAGE2_FIELDS.map((f) => ({ ...f, width: f.width + 0.6, depth: f.depth + 0.6 })),
  { x: ORANGE_ORCHARD.x, z: ORANGE_ORCHARD.z, width: 4.8, depth: 2.8, rotationY: ORANGE_ORCHARD.rotationY },
];

/** Where the world vegetation thins out because Stage 2 dresses its own land. */
export const STAGE2_BOUNDS = { minX: -12, maxX: 11, minZ: -27, maxZ: -6 };
