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

export type CropKind = "greens" | "wheat" | "sprouts" | "tomatoes" | "squash";

export interface FieldSpec extends Rect {
  kind: CropKind;
}


/** The heart of the farm (yard, produce stand, lane mouth, market garden) —
 * what the Stage 1 camera shots lean their aim toward. */
export const STAGE1_FOCUS = { x: 0.4, z: 11.6, height: 0.35 };

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
  // The market garden right beside the road, between the yard and the
  // orchard — the crop the truck passes closest to.
  { kind: "squash", x: 1.45, z: 8.4, width: 2.4, depth: 2.6, rotationY: 0.35 },
];

/** The market garden (last entry of FIELDS) — referenced by its fence and props. */
export const MARKET_GARDEN = FIELDS[FIELDS.length - 1];

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
  // Framing the farm cluster so it sits embedded in the landscape.
  { kind: "round", x: 2.9, z: 17.1, scale: 0.85 },
  { kind: "round", x: 3.35, z: 10.55, scale: 0.75 },
  { kind: "poplar", x: 0.7, z: 5.5, scale: 0.9 },
  { kind: "round", x: -5.6, z: 10.2, scale: 0.9 },
];

/** A small orchard of fruit trees beside the yard, on its own level pad. */
export const ORCHARD = { x: -3.0, z: 7.8, columns: 3, rows: 3, spacing: 1.05, rotationY: 0.25 };

export interface FarmPath {
  /** World x/z control points. */
  points: Array<[number, number]>;
  width: number;
  /** Flare the start (a lane meeting the road). */
  flareStart?: boolean;
  color: string;
}

/** Gravel lane from the road's inner edge up to the yard (world x/z control points). */
export const FARM_LANE: Array<[number, number]> = [
  [5.25, 13.6],
  [4.1, 13.3],
  [2.8, 12.9],
  [1.9, 13.1],
  [0.6, 13.6],
];

/** The farm's lane and its worn earth tracks, tying yard, garden, orchard
 * and fields together into one working place. */
export const FARM_PATHS: FarmPath[] = [
  { points: FARM_LANE, width: 0.46, flareStart: true, color: "#dcc9a4" },
  // Yard → between garden and orchard → out to the tomato field.
  {
    points: [
      [0.1, 12.3],
      [-0.45, 11.0],
      [-0.8, 9.5],
      [-0.9, 8.0],
      [-1.3, 6.3],
      [-2.5, 4.7],
      [-3.5, 4.0],
    ],
    width: 0.26,
    color: "#cfb58c",
  },
  // Yard → through the fence gate → the greens field.
  {
    points: [
      [0.0, 14.9],
      [-0.4, 16.3],
      [-0.85, 18.4],
      [-1.25, 19.2],
    ],
    width: 0.24,
    color: "#cfb58c",
  },
];

/** A low post-and-rail fence along the market garden's road side and ends. */
function gardenFence(): Array<[number, number]> {
  const { x, z, width, depth, rotationY } = MARKET_GARDEN;
  const c = Math.cos(rotationY);
  const sn = Math.sin(rotationY);
  const toWorld = (lx: number, lz: number): [number, number] => [x + lx * c + lz * sn, z - lx * sn + lz * c];
  const hx = width / 2 + 0.2;
  const hz = depth / 2 + 0.2;
  return [toWorld(-hx * 0.35, -hz), toWorld(hx, -hz), toWorld(hx, hz), toWorld(-hx * 0.35, hz)];
}

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
  // Yard fence, behind the building and around the silo — with a gap
  // for the gate out to the greens field.
  [
    [0.6, 18.3],
    [-0.45, 18.35],
  ],
  [
    [-1.25, 18.4],
    [-1.6, 18.4],
    [-3.6, 18.0],
    [-4.4, 16.3],
    [-4.3, 11.2],
    [-2.6, 10.1],
  ],
  gardenFence(),
];

/** The yard gate (an open gate between two posts), at the fence gap. */
export const YARD_GATE = { from: [-0.45, 18.35] as [number, number], to: [-1.25, 18.4] as [number, number] };

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
  // Carrying the harvest down the lane to the pallet by the road.
  { x: 3.55, z: 12.8, yaw: Math.PI / 2 + 0.15, pose: "carry", shirt: "#b8a27a" },
  // Picking in the orchard, facing a fruit tree.
  { x: -1.25, z: 9.05, yaw: -2.4, pose: "basket", shirt: "#c8663f" },
];

/** Harvest details that tell the "products start here" story. */
export const HARVEST = {
  /** Filled crates on a pallet at the lane mouth — ready for the truck. */
  pallet: { x: 4.2, z: 12.45, rotationY: 0.12 },
  /** Wheelbarrow of squash at the garden's edge. */
  wheelbarrow: { x: 0.2, z: 10.45, rotationY: 0.7 },
  /** Grain sacks and crates beside the workshop door. */
  doorSide: { x: -0.4, z: 12.85 },
  /** Flower planter along the workshop front, north of the door. */
  planter: { x: -0.5, z: 14.35 },
  /** Ladder leaning into an orchard tree, and baskets of picked fruit. */
  ladder: { x: -1.42, z: 8.33, towardX: -1.72, towardZ: 8.56 },
  orchardBaskets: [
    [-1.5, 9.35],
    [-2.45, 7.2],
    [-3.7, 8.9],
  ] as Array<[number, number]>,
};

/** Low hedges and planting that embed the farm in the landscape. */
export const HEDGES: Array<Array<[number, number]>> = [
  // Along the lane's north side.
  [
    [4.55, 14.05],
    [3.3, 13.85],
    [2.35, 13.7],
  ],
  // Along the yard's south edge, west of the track.
  [
    [-0.95, 11.35],
    [-1.8, 11.05],
    [-2.5, 10.6],
  ],
];

/** Areas the ambient scatter (bushes, rocks, flowers) must stay out of. */
export const SCATTER_KEEP_OUT: Rect[] = [
  ...FIELDS.map((f) => ({ ...f, width: f.width + 0.6, depth: f.depth + 0.6 })),
  { x: -1.0, z: 13.8, width: 7.5, depth: 9.5, rotationY: 0 },
  { x: ORCHARD.x, z: ORCHARD.z, width: 3.8, depth: 3.8, rotationY: ORCHARD.rotationY },
  // The gravel lane from the road to the yard (and the pallet at its mouth).
  { x: 3.9, z: 13.2, width: 3.2, depth: 1.5, rotationY: 0 },
  // The farm tracks and the harvest props along them.
  { x: -0.55, z: 10.2, width: 1.1, depth: 4.6, rotationY: 0.25 },
  { x: -1.9, z: 5.4, width: 1.0, depth: 3.4, rotationY: -0.8 },
  { x: -0.55, z: 17.0, width: 1.0, depth: 4.6, rotationY: 0.25 },
];

/** The region the scatter is sprinkled over. */
export const SCATTER_BOUNDS = { minX: -12, maxX: 19, minZ: -4, maxZ: 29 };
