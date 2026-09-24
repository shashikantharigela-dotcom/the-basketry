/**
 * STAGE 1 — PRODUCT ORIGIN: where good products come from.
 *
 * Pure layout data (world coordinates, no imports from the road/terrain
 * modules) so the foundation's terrain can read this stage's building
 * pads without an import cycle.
 *
 * Everything sits beside the first S-bend of the road (truck u ≈ 0.10 →
 * 0.25). In that stretch the road swings right to x ≈ 6.5 at z ≈ 15 and
 * back to x ≈ 0 at z ≈ 0; the farm yard sits inside the bend (west), with
 * fields both inside and outside it. Every footprint below is kept at
 * least ~2 units clear of the road centerline — nothing touches the road.
 *
 * Scale: the truck GLB is a ~10.8 m truck at 0.22 units per meter, so
 * everything here uses the same 0.22 units / meter.
 */

import type { Rect, TreeSpec } from "../common/types";

export type { TreeKind, TreeSpec } from "../common/types";

export const METER = 0.22;

export type CropKind = "greens" | "wheat" | "sprouts" | "tomatoes";

export interface FieldSpec extends Rect {
  kind: CropKind;
}


/** Where the land is flattened so buildings and the yard sit level. */
export const STAGE1_PADS = [
  { x: -0.9, z: 13.8, radius: 3.4, falloff: 2.2 },
  { x: -3.0, z: 7.8, radius: 2.4, falloff: 1.8 },
];

export const FARM_BUILDING = { x: -1.4, z: 13.6, rotationY: Math.PI / 2 };
export const SILO = { x: -2.9, z: 16.1 };
export const TOOL_SHED = { x: 0.4, z: 16.6, rotationY: Math.PI / 2 + 0.15 };
export const PRODUCE_STAND = { x: 1.25, z: 12.4, rotationY: Math.PI / 2 };

export const FIELDS: FieldSpec[] = [
  // Leafy greens, inside the bend, north of the yard.
  { kind: "greens", x: -3.6, z: 20.6, width: 4.6, depth: 3.2, rotationY: 0.12 },
  // Golden wheat on the outside of the bend.
  { kind: "wheat", x: 11.6, z: 16.2, width: 4.2, depth: 7.0, rotationY: -0.05 },
  // Young sprouts, outside the bend further on.
  { kind: "sprouts", x: 10.8, z: 7.0, width: 3.8, depth: 4.6, rotationY: 0.2 },
  // Tomato rows — the red fruit is the brand accent in the fields.
  { kind: "tomatoes", x: -5.2, z: 1.8, width: 3.8, depth: 3.6, rotationY: -0.35 },
];

export const TREES: TreeSpec[] = [
  // Around the farm yard.
  { kind: "round", x: -4.6, z: 12.4, scale: 1.1 },
  { kind: "round", x: -4.0, z: 15.4, scale: 0.9 },
  { kind: "poplar", x: -3.9, z: 17.6, scale: 1.0 },
  { kind: "poplar", x: -4.8, z: 17.0, scale: 0.9 },
  { kind: "round", x: 1.9, z: 18.2, scale: 0.8 },
  // Hedge line behind the greens.
  { kind: "poplar", x: -6.9, z: 19.0, scale: 1.1 },
  { kind: "poplar", x: -7.2, z: 20.6, scale: 1.0 },
  { kind: "poplar", x: -7.0, z: 22.2, scale: 1.15 },
  { kind: "round", x: -2.4, z: 23.8, scale: 1.0 },
  // Outside the bend, framing the wheat.
  { kind: "round", x: 14.6, z: 12.0, scale: 1.2 },
  { kind: "round", x: 14.4, z: 20.4, scale: 1.0 },
  { kind: "poplar", x: 9.2, z: 21.4, scale: 1.0 },
  { kind: "round", x: 9.4, z: 24.8, scale: 0.9 },
  { kind: "round", x: 13.8, z: 4.2, scale: 1.1 },
  { kind: "poplar", x: 8.6, z: 2.4, scale: 0.95 },
  // Further out, filling the landscape.
  { kind: "round", x: -9.5, z: 9.0, scale: 1.3 },
  { kind: "round", x: -8.4, z: 4.6, scale: 1.0 },
  { kind: "round", x: 17.5, z: 16.0, scale: 1.3 },
  { kind: "round", x: 16.2, z: 8.6, scale: 1.0 },
  { kind: "round", x: -8.0, z: -2.0, scale: 1.1 },
  { kind: "round", x: 5.5, z: 27.5, scale: 1.2 },
  { kind: "poplar", x: 4.2, z: -3.4, scale: 1.0 },
];

/** A small orchard of fruit trees beside the yard, on its own level pad. */
export const ORCHARD = { x: -3.0, z: 7.8, columns: 3, rows: 3, spacing: 1.05, rotationY: 0.25 };

/** Gravel lane from the road's inner edge up to the yard (world x/z control points). */
export const FARM_LANE: Array<[number, number]> = [
  [5.25, 13.6],
  [4.1, 13.3],
  [2.8, 12.9],
  [1.9, 13.1],
  [0.6, 13.6],
];

/** Fence runs (world x/z polylines). */
export const FENCES: Array<Array<[number, number]>> = [
  // Along the wheat field's road side.
  [
    [9.35, 12.6],
    [9.25, 16.2],
    [9.3, 19.8],
  ],
  // Along the sprouts field's road side.
  [
    [8.8, 4.8],
    [8.6, 7.2],
    [8.9, 9.3],
  ],
  // Yard fence, behind the building and around the silo.
  [
    [0.6, 18.3],
    [-1.6, 18.4],
    [-3.6, 18.0],
    [-4.4, 16.3],
    [-4.3, 11.2],
    [-2.6, 10.1],
  ],
];

/** Round hay bales at the wheat field's corner. */
export const HAY_BALES: Array<[number, number, number]> = [
  [10.2, 20.6, 0.4],
  [10.75, 20.95, 1.3],
  [11.3, 20.55, 2.2],
];

/** Stylized producer figures (x, z, facing yaw, pose). */
export const FIGURES: Array<{ x: number; z: number; yaw: number; pose: "carry" | "basket" | "stand"; shirt: string }> = [
  { x: 1.75, z: 11.85, yaw: -Math.PI / 2 + 0.4, pose: "basket", shirt: "#8fa36b" },
  { x: 0.55, z: 12.75, yaw: Math.PI / 2 - 0.2, pose: "carry", shirt: "#c8663f" },
  { x: -3.2, z: 19.6, yaw: 0.6, pose: "stand", shirt: "#efe4cf" },
];

/** Areas the ambient scatter (bushes, rocks, flowers) must stay out of. */
export const SCATTER_KEEP_OUT: Rect[] = [
  ...FIELDS.map((f) => ({ ...f, width: f.width + 0.6, depth: f.depth + 0.6 })),
  { x: -1.0, z: 13.8, width: 7.5, depth: 9.5, rotationY: 0 },
  { x: ORCHARD.x, z: ORCHARD.z, width: 3.8, depth: 3.8, rotationY: ORCHARD.rotationY },
  // The gravel lane from the road to the yard.
  { x: 3.9, z: 13.3, width: 3.2, depth: 1.0, rotationY: 0 },
];

/** The region the scatter is sprinkled over. */
export const SCATTER_BOUNDS = { minX: -12, maxX: 19, minZ: -4, maxZ: 29 };
