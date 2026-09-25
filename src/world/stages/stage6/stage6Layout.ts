/**
 * STAGE 6 — THE BASKETRY ECOSYSTEM: the journey's destination. At the end
 * of the S-road a large U-shaped complex — community pavilion, offices, a
 * flagship tower, a product-experience hall, an exhibition hall and terraced
 * homes — wraps a landscaped plaza with a circular garden and a basket
 * sculpture. The road enters the U's open side and becomes the arrival loop
 * round the garden; the journey truck arrives there. From the final
 * elevated camera the whole connected world reads at once: farm, facility,
 * awareness, city, exhibition, ecosystem — joined by the road.
 *
 * Where: on the inside of the S-road's last bend, just before the road would
 * run down the world's rim (road u ≈ 0.93). The U opens WEST toward the
 * arriving road; the ground falls away to the south (the rim), so the estate
 * steps down in landscaped terraces there, over the road's unused tail.
 *
 * Pure layout data in WORLD x/z (the U is axis-aligned so it reads as a
 * clean U from above), no imports from the road/terrain modules.
 * Scale: 0.22 units per metre.
 */

import type { FigureSpec } from "../common/Figures";
import type { Rect } from "../common/types";

/** The whole estate (world x/z bounds): lawns, terraces and the plaza. */
export const ESTATE = { minX: -3.8, maxX: 10.4, minZ: -95.6, maxZ: -79.2 };

/** The paved plaza inside the U (the arrival court included). */
export const PLAZA = { minX: -3.8, maxX: 7.4, minZ: -89.0, maxZ: -82.0 };

/** The circular garden at the heart of the plaza, and the arrival loop round it. */
export const GARDEN = { x: 2.2, z: -85.5, lawn: 1.35, hedge: 1.45, loopInner: 1.75, loopOuter: 2.55 };

/** Where the arriving road meets the plaza edge (road u), and where it joins the loop (angle, radians in x/z). */
export const ROAD_ENTRY_U = 0.9262;
export const LOOP_JOIN_ANGLE = Math.PI + 0.35;

export type BuildingKind = "pavilion" | "office" | "flagship" | "hall" | "exhibition" | "terraces";

/** The U's buildings: world rect (x/z min/max), storeys, kind, facade tone. */
export interface EcoBuilding {
  kind: BuildingKind;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  floors: number;
  /** Which side faces the plaza: "s" (north arm), "w" (east arm), "n" (south arm). */
  faces: "s" | "w" | "n";
  tone: string;
}

export const ECO_BUILDINGS: EcoBuilding[] = [
  // North arm (the far side of the U from the reveal camera).
  { kind: "pavilion", minX: -2.6, maxX: 3.4, minZ: -81.9, maxZ: -79.6, floors: 2, faces: "s", tone: "#f1e7d4" },
  { kind: "office", minX: 3.6, maxX: 7.2, minZ: -81.9, maxZ: -79.6, floors: 5, faces: "s", tone: "#e6ded0" },
  // East arm (the back of the U): flagship tower, offices, product-experience hall.
  { kind: "flagship", minX: 7.3, maxX: 10.2, minZ: -82.6, maxZ: -79.6, floors: 10, faces: "w", tone: "#ddd4c5" },
  { kind: "office", minX: 7.5, maxX: 10.2, minZ: -86.8, maxZ: -82.8, floors: 4, faces: "w", tone: "#e9e2d5" },
  { kind: "hall", minX: 7.3, maxX: 10.4, minZ: -90.9, maxZ: -87.0, floors: 3, faces: "w", tone: "#f3eee6" },
  // South arm: exhibition hall and terraced community homes.
  { kind: "exhibition", minX: 1.6, maxX: 7.2, minZ: -91.2, maxZ: -89.0, floors: 2, faces: "n", tone: "#f6f2ea" },
  { kind: "terraces", minX: -2.6, maxX: 1.4, minZ: -91.2, maxZ: -89.0, floors: 4, faces: "n", tone: "#efe4cf" },
];

/** The covered arcade along the U's inner edge — one continuous roof line
 * tracing the U through all three arms (segments as x/z polyline corners). */
export const ARCADE = { path: [[-2.7, -82.3], [7.0, -82.3], [7.0, -88.6], [-2.7, -88.6]] as Array<[number, number]>, width: 0.75, height: 0.9 };

/**
 * Physical 3D architectural signage — raised cream letters on dark sign
 * fascias with a slim THE BASKETRY red accent, mounted on the façades that
 * face the final reveal camera (south). `building` indexes ECO_BUILDINGS
 * (its floor level sets the height); `y` is the sign's centre above it.
 * Each sign is fitted to `width` (world units), capped at `size`.
 */
export interface SignSpec {
  lines: string[];
  x: number;
  z: number;
  /** Facing (radians): Math.PI faces south (-z), toward the reveal camera. */
  yaw: number;
  width: number;
  size: number;
  y: number;
  building?: number;
  /** The destination's own name — larger, on a long fascia over the gallery. */
  main?: boolean;
}

export const SIGNS: SignSpec[] = [
  // The destination's name along the far arm of the U, over the gallery,
  // facing the camera across the arrival plaza.
  { lines: ["THE BASKETRY ECOSYSTEM"], x: 2.15, z: -82.72, yaw: Math.PI, width: 9.2, size: 0.8, y: 1.32, main: true },
  // The journey's stages on the buildings that correspond to them.
  { lines: ["PRODUCT", "ORIGIN"], x: -0.6, z: -91.24, yaw: Math.PI, width: 3.4, size: 0.52, y: 1.35, building: 6 },
  { lines: ["PRODUCERS"], x: 5.4, z: -81.94, yaw: Math.PI, width: 3.2, size: 0.5, y: 2.5, building: 1 },
  { lines: ["AWARENESS"], x: 8.75, z: -82.64, yaw: Math.PI, width: 2.6, size: 0.5, y: 4.9, building: 2 },
  { lines: ["CONSUMER", "EXPERIENCE"], x: 8.85, z: -90.94, yaw: Math.PI, width: 2.9, size: 0.5, y: 1.2, building: 4 },
  { lines: ["ACTIVATIONS &", "EXHIBITIONS"], x: 4.4, z: -91.24, yaw: Math.PI, width: 5.2, size: 0.52, y: 0.72, building: 5 },
];

/** Gateway pylons either side of the road where it enters the U. */
export const GATEWAY = { x: -3.35, zNorth: -84.75, zSouth: -87.75, height: 1.5 };

/** Trees: round the plaza, along the west edge, and on the terraced slope to the rim (x, z, scale). */
export const ECO_TREES: Array<[number, number, number]> = [
  // A ring round the garden, outside the loop.
  [-0.9, -83.4, 0.62],
  [2.2, -82.85, 0.6],
  [5.3, -83.4, 0.62],
  [5.6, -87.6, 0.6],
  [2.2, -88.15, 0.58],
  [-0.9, -87.8, 0.6],
  // Along the plaza's west edge, either side of the arrival.
  [-3.3, -82.6, 0.66],
  [-2.8, -88.6, 0.6],
  // The terraced gardens stepping down to the rim.
  [-2.0, -92.4, 0.7],
  [1.2, -92.8, 0.66],
  [4.4, -92.4, 0.72],
  [7.6, -92.2, 0.68],
  [9.6, -92.8, 0.66],
  [-0.6, -94.2, 0.62],
  [3.0, -94.4, 0.66],
  [6.4, -94.0, 0.62],
];

/** Terrace edges on the slope to the rim (hedged steps), as z lines across the estate. */
export const TERRACE_LINES = [-91.9, -92.9, -93.9, -94.9];

/** Two small product-experience kiosks on the plaza. */
export const KIOSKS: Array<{ x: number; z: number; yaw: number }> = [
  { x: 6.0, z: -84.2, yaw: -Math.PI / 2 },
  { x: -1.6, z: -83.1, yaw: Math.PI },
];

/** Benches round the garden (x, z, yaw). */
export const BENCHES: Array<[number, number, number]> = [
  [0.6, -83.0, 0.5],
  [3.8, -83.0, -0.5],
  [4.9, -86.9, -2.3],
  [-0.3, -87.3, 2.4],
];

/** Warm lamps round the arrival loop and the plaza edge. */
export const PLAZA_LAMPS: Array<[number, number]> = [
  [-0.7, -85.5],
  [5.1, -85.5],
  [1.2, -82.75],
  [3.2, -88.2],
  [0.2, -83.5],
  [4.2, -83.5],
  [4.2, -87.5],
  [0.2, -87.5],
  [-3.5, -83.6],
  [-3.5, -88.2],
  [6.6, -82.8],
  [6.6, -88.1],
];

// ---------------------------------------------------------------------------
// People (world x/z; yaw = facing, radians)
// ---------------------------------------------------------------------------

export interface Stage6Figure {
  x: number;
  z: number;
  yaw: number;
  pose: FigureSpec["pose"];
  shirt: string;
  trousers?: string;
  outfit?: FigureSpec["outfit"];
  hat?: FigureSpec["hat"];
  hatColor?: string;
  scale?: number;
}

const RED = "#c8161d";
const DENIM = "#3d4f68";
const KHAKI = "#8f7f62";
const DARK = "#3a3531";
const p = (
  x: number,
  z: number,
  yaw: number,
  pose: FigureSpec["pose"],
  shirt: string,
  trousers = DENIM,
  outfit: FigureSpec["outfit"] = "trousers",
  scale?: number
): Stage6Figure => ({ x, z, yaw, pose, shirt, trousers, outfit, hat: "hair", scale });
const staff = (x: number, z: number, yaw: number, pose: FigureSpec["pose"]): Stage6Figure => ({
  x,
  z,
  yaw,
  pose,
  shirt: RED,
  trousers: DARK,
  hat: "cap",
  hatColor: RED,
});

/** Visitors across the plaza and garden — walking, gathering, meeting, at the kiosks and the hall. */
export const STAGE6_PEOPLE: Stage6Figure[] = [
  // Round the sculpture garden.
  p(0.75, -84.6, 1.9, "stand", "#f1eee6"),
  p(0.8, -84.95, 1.5, "talk", "#b0306a", DENIM, "sari"),
  p(3.7, -86.4, -1.2, "stand", "#3f5f8a", KHAKI),
  p(3.55, -86.7, -0.8, "hold", "#e2a33b", DENIM, "sari"),
  p(3.3, -84.2, -2.3, "talk", "#5f8fb3"),
  child(3.1, -84.0, -2.3, "#e36b5a"),
  // Crossing the plaza.
  p(-1.9, -85.6, Math.PI / 2, "bag", "#d9a441"),
  p(-2.2, -85.8, Math.PI / 2, "stand", "#c85a3a", DENIM, "sari"),
  p(6.1, -88.2, 0.3, "bag", "#9fb6c9", DARK),
  p(1.0, -88.6, Math.PI / 2, "stand", "#6b8f5a", KHAKI),
  p(4.6, -82.7, -Math.PI / 2, "talk", "#f4f1e8", DARK),
  p(4.9, -82.8, Math.PI / 2, "clipboard", "#44607f", DARK),
  // At the product-experience hall entrance and the kiosks.
  p(7.0, -84.4, -Math.PI / 2, "hold", "#d46a86", DENIM, "sari"),
  p(6.9, -85.0, -Math.PI / 2 + 0.3, "taste", "#e8d9b8"),
  p(6.95, -83.7, -Math.PI / 2 - 0.3, "bag", "#2e7f9a", KHAKI),
  staff(6.45, -84.2, Math.PI / 2, "present"),
  p(5.55, -84.0, Math.PI / 2 - 0.2, "taste", "#6d4c8f"),
  staff(-1.6, -82.75, 0, "present"),
  p(-1.5, -83.55, Math.PI, "hold", "#f0b35a", DENIM, "sari"),
  p(-1.9, -83.5, Math.PI + 0.4, "stand", "#415a7a", KHAKI),
  // By the pavilion and the exhibition hall.
  p(0.4, -82.3, 0.1, "talk", "#9c6b3f", DARK),
  p(0.7, -82.35, -0.4, "stand", "#e9e2d0", DENIM, "sari"),
  child(0.55, -82.6, 0, "#7c9c52"),
  p(4.0, -88.7, Math.PI, "stand", "#5a7fa3"),
  p(4.3, -88.6, Math.PI + 0.3, "bag", "#b8475a", DENIM, "sari"),
  p(2.8, -88.8, 0.2, "hold", "#f1eee6", KHAKI),
  // On the terraces and walking down to the gardens.
  p(-1.2, -91.6, 0.8, "stand", "#e36b5a", DENIM, "sari"),
  p(3.6, -91.7, -0.4, "talk", "#3f5f8a"),
  p(3.85, -91.9, 2.6, "stand", "#d9c46a", DENIM, "sari"),
  p(8.4, -91.5, 0.2, "bag", "#d9d2c3"),
];

function child(x: number, z: number, yaw: number, shirt: string): Stage6Figure {
  return p(x, z, yaw, "stand", shirt, DENIM, "trousers", 0.62);
}

// ---------------------------------------------------------------------------
// Terrain / vegetation
// ---------------------------------------------------------------------------

/** Level the rolling hills under the estate (the rim's fall remains). */
export const STAGE6_PADS = [
  { x: 0.0, z: -83.0, radius: 3.4, falloff: 2.0 },
  { x: 6.0, z: -83.0, radius: 3.4, falloff: 2.0 },
  { x: 0.0, z: -88.5, radius: 3.4, falloff: 2.0 },
  { x: 6.0, z: -88.5, radius: 3.4, falloff: 2.0 },
  { x: 9.2, z: -85.5, radius: 3.0, falloff: 2.0 },
  { x: 2.0, z: -93.2, radius: 3.6, falloff: 2.0 },
  { x: 8.0, z: -93.2, radius: 3.0, falloff: 2.0 },
];

/** The estate is cleared of the world's wild vegetation (after placement — see worldZones). */
export const STAGE6_KEEP_OUT: Rect[] = [{ x: 3.3, z: -87.4, width: 14.6, depth: 16.8, rotationY: 0 }];

/** Where the camera's Stage 6 shots lean their aim: the heart of the U, and the whole journey behind it. */
export const STAGE6_FOCUS = { x: 3.0, z: -85.8, height: 0.8 };
export const JOURNEY_FOCUS = { x: -2.0, z: -52.0, height: 0 };
