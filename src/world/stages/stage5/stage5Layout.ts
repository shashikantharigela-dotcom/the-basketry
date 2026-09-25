/**
 * STAGE 5 — MORE ACTIVATIONS, STALLS & EXHIBITIONS: the activation model
 * expands into a public exhibition — several THE BASKETRY activations side by
 * side, white event tents, a Ferris wheel landmark, trucks unloading, crowds
 * moving between stalls.
 *
 * Visual reference: references/approved/stage5_activations_exhibitions_reference.png
 *
 * Where: just past Stage 4's district the S-road swings hard right (road
 * u ≈ 0.87 → 0.91; journey progress ≈ 0.99–1.08, see journey.ts), so the
 * LEFT of the road is the outside of the bend and the ground fans out wide —
 * room for an event plaza. The camera watches from the inside of the bend
 * (right of travel): road and journey truck in front, the exhibition across
 * it, the Ferris wheel and a lit skyline behind.
 *
 * Pure layout data (no imports from the road/terrain modules) so the shared
 * terrain and vegetation registries can read it without an import cycle.
 * Road terms: position `u`, lateral `offset` (+ = right of travel, so the
 * event is at negative offsets); yaw 0 = facing the road.
 *
 * Scale: 0.22 units per metre, like the truck and every other stage.
 */

import type { FigureSpec } from "../common/Figures";
import type { RoadPlacement } from "../common/roadPlacement";
import type { Rect } from "../common/types";

/** The event plaza, from the kerb out across the fan of the bend. */
export const EVENT_PLAZA = { uFrom: 0.873, uTo: 0.918, near: -0.84, far: -11.2, taper: 0.1 };

/** A service apron along the kerb before the plaza, where the first truck unloads. */
export const SERVICE_APRON = { uFrom: 0.862, uTo: 0.8745, near: -0.84, far: -2.3 };

/** Sidewalks continuing Stage 4's: the left one up to the plaza, the right one past the event. */
export const SIDEWALKS = { inner: 0.84, outer: 1.4, left: [0.845, 0.8625], right: [0.845, 0.915] };

/** A raised exhibition deck (each activation stands level on one). */
export interface ActivationSpec extends RoadPlacement {
  width: number;
  depth: number;
}

/** A: red canopy — U of stocked shelves, tasting counter at the front. */
export const ACTIVATION_A: ActivationSpec = { u: 0.8775, offset: -3.3, yaw: 0.05, width: 1.8, depth: 1.2 };
/** B: open exhibition booth — red back wall, shelves, product tables, sampling. */
export const ACTIVATION_B: ActivationSpec = { u: 0.8928, offset: -3.3, yaw: -0.1, width: 1.7, depth: 1.1 };
/** C: large white marquee — product showcase with plinths and tables inside. */
export const ACTIVATION_C: ActivationSpec = { u: 0.8835, offset: -7.0, yaw: 0.1, width: 2.4, depth: 1.5 };
/** D: small community / demo stall — a cooking demo with a little audience. */
export const ACTIVATION_D: ActivationSpec = { u: 0.899, offset: -6.3, yaw: -0.3, width: 1.1, depth: 0.8 };
/** E: another small red sampling stall. */
export const ACTIVATION_E: ActivationSpec = { u: 0.8942, offset: -8.3, yaw: -0.15, width: 1.0, depth: 0.8 };

/** White pagoda tents round the back of the plaza (more exhibitors). */
export const PAGODA_TENTS: ActivationSpec[] = [
  { u: 0.8795, offset: -9.9, yaw: 0.2, width: 0.95, depth: 0.95 },
  { u: 0.8768, offset: -6.6, yaw: 0.25, width: 0.85, depth: 0.85 },
  { u: 0.9035, offset: -4.3, yaw: -0.35, width: 0.85, depth: 0.85 },
];

/** Parasol tasting tables in the open spaces between stalls. */
export const PARASOL_TABLES: RoadPlacement[] = [
  { u: 0.8918, offset: -6.25 },
  { u: 0.8752, offset: -5.15 },
  { u: 0.9038, offset: -5.75 },
];

/** The Ferris wheel — the event's landmark, facing the road. */
export const FERRIS_WHEEL: RoadPlacement = { u: 0.8905, offset: -10.1, yaw: 0.35 };
export const FERRIS_RADIUS = 2.5;

/** Two parked THE BASKETRY trucks along the kerb, rear doors open to the event. */
export const EVENT_TRUCKS: Array<{ u: number; offset: number; reverse: boolean }> = [
  // Facing back up the road, doors toward the plaza ahead.
  { u: 0.8705, offset: -1.72, reverse: true },
  // Facing the direction of travel, doors toward the plaza behind.
  { u: 0.9075, offset: -1.72, reverse: false },
];

/** Event trees in the plaza (fairy lights in their crowns), road u / offset / scale. */
export const EVENT_TREES: Array<[number, number, number]> = [
  [0.8812, -5.2, 0.72],
  [0.8888, -5.3, 0.7],
  [0.8962, -5.2, 0.74],
  [0.8858, -9.2, 0.7],
  [0.9005, -8.6, 0.66],
  [0.8752, -8.2, 0.7],
];

/** Low planters of flowers along the kerb between the trucks, and round the trees. */
export const EVENT_PLANTERS: Array<RoadPlacement & { length: number }> = [
  { u: 0.8858, offset: -1.18, length: 0.42 },
  { u: 0.889, offset: -1.18, length: 0.42 },
  { u: 0.8922, offset: -1.18, length: 0.42 },
  { u: 0.8812, offset: -4.72, length: 0.5 },
  { u: 0.8888, offset: -4.8, length: 0.5 },
  { u: 0.8962, offset: -4.72, length: 0.5 },
];

/** Standee banners along the walkways (red and white, basket emblem, no text). */
export const EVENT_BANNERS: RoadPlacement[] = [
  { u: 0.8795, offset: -1.35, yaw: 0.3 },
  { u: 0.8972, offset: -1.28, yaw: -0.3 },
  { u: 0.8855, offset: -2.75, yaw: 0.2 },
  { u: 0.8795, offset: -5.75, yaw: 0.4 },
  { u: 0.8928, offset: -9.4, yaw: 0 },
  { u: 0.9018, offset: -6.9, yaw: -0.5 },
];

/** Poles carrying strings of festoon lights over the walkways; each run joins two poles. */
export const LIGHT_POLES: RoadPlacement[] = [
  { u: 0.8748, offset: -4.3 }, // 0
  { u: 0.8855, offset: -2.3 }, // 1
  { u: 0.8962, offset: -2.3 }, // 2
  { u: 0.9048, offset: -3.1 }, // 3
  { u: 0.8773, offset: -8.9 }, // 4
  { u: 0.8878, offset: -8.2 }, // 5
  { u: 0.8985, offset: -7.6 }, // 6
];
export const LIGHT_RUNS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [1, 5],
  [2, 6],
  [4, 5],
  [5, 6],
  [1, 4],
  [2, 5],
];

/** Ornamental event lamps along the kerb and the right sidewalk. */
export const EVENT_LAMPS: RoadPlacement[] = [
  { u: 0.884, offset: -1.12 },
  { u: 0.8942, offset: -1.12 },
  ...[0.851, 0.861, 0.871, 0.881, 0.891, 0.901, 0.911].map((u) => ({ u, offset: 1.2 })),
];

/** Stock stacked by the trucks: pallets of cartons being unloaded. */
export const EVENT_CARTONS: Array<RoadPlacement & { count: number; pallet?: boolean }> = [
  { u: 0.8822, offset: -1.9, yaw: 0.2, count: 9, pallet: true },
  { u: 0.8852, offset: -2.2, yaw: -0.1, count: 5, pallet: true },
  { u: 0.8975, offset: -2.0, yaw: -0.2, count: 7, pallet: true },
  { u: 0.8878, offset: -6.4, yaw: 0.3, count: 4, pallet: true },
  { u: 0.9005, offset: -5.0, yaw: 0.1, count: 3 },
];

/** A distant skyline beyond the event (world x/z centre, footprint, height). */
export const SKYLINE: Array<{ x: number; z: number; w: number; d: number; h: number; tone: string }> = [
  { x: -21.6, z: -70.4, w: 2.2, d: 2.2, h: 8.4, tone: "#6f8ea6" },
  { x: -22.4, z: -74.2, w: 2.6, d: 2.0, h: 6.2, tone: "#e9e1d2" },
  { x: -21.8, z: -77.8, w: 2.0, d: 2.0, h: 10.2, tone: "#7b97ab" },
  { x: -20.6, z: -81.2, w: 2.4, d: 2.2, h: 7.0, tone: "#e6ddcd" },
  { x: -24.2, z: -72.6, w: 2.0, d: 2.0, h: 11.6, tone: "#66849c" },
  { x: -24.0, z: -79.0, w: 2.2, d: 2.2, h: 9.0, tone: "#7090a6" },
  // Along the rim beyond the event, closing the view past the bend.
  { x: -8.0, z: -90.8, w: 2.0, d: 2.0, h: 4.6, tone: "#e9e1d2" },
  { x: -11.4, z: -89.6, w: 1.8, d: 1.8, h: 6.0, tone: "#6f8ea6" },
  { x: -14.8, z: -88.0, w: 2.2, d: 2.0, h: 4.2, tone: "#e6ddcd" },
  { x: -4.8, z: -92.6, w: 1.8, d: 1.8, h: 3.8, tone: "#7b97ab" },
];

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface Stage5Figure extends RoadPlacement {
  pose: FigureSpec["pose"];
  shirt: string;
  hat?: FigureSpec["hat"];
  hatColor?: string;
  trousers?: string;
  outfit?: FigureSpec["outfit"];
  scale?: number;
}

const RED = "#c8161d";
const DARK = "#3a3531";
const DENIM = "#3d4f68";
const KHAKI = "#8f7f62";
const staff = (u: number, offset: number, yaw: number, pose: FigureSpec["pose"], cap = true): Stage5Figure => ({
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
  outfit: FigureSpec["outfit"] = "trousers",
  scale?: number
): Stage5Figure => ({ u, offset, yaw, pose, shirt, trousers, hat: "hair", outfit, scale });
const child = (u: number, offset: number, yaw: number, shirt: string, pose: FigureSpec["pose"] = "stand") =>
  person(u, offset, yaw, pose, shirt, DENIM, "trousers", 0.62);

/** The teams in brand red, at every activation (yaw 0 = facing the road). */
export const STAGE5_STAFF: Stage5Figure[] = [
  // A: behind the tasting counter, restocking.
  staff(0.8762, -3.0, 0, "present"),
  staff(0.879, -3.0, 0, "talk", false),
  staff(0.8775, -3.62, Math.PI, "hold", false),
  // B: explaining products at the booth's tables, sampling.
  staff(0.8915, -3.25, 0, "talk"),
  staff(0.8942, -3.3, 0.2, "present", false),
  // C: in the marquee.
  staff(0.8825, -7.3, 0, "present", false),
  staff(0.8848, -7.35, 0.3, "talk"),
  // D: the cooking demo.
  staff(0.899, -6.45, 0, "present"),
  // E: sampling stall.
  staff(0.8942, -8.45, 0, "talk"),
  // Pagoda tents.
  staff(0.8795, -10.05, 0, "present", false),
  staff(0.9035, -4.45, 0, "talk"),
  // Unloading the trucks.
  staff(0.8805, -1.85, -1.6, "carton"),
  staff(0.8845, -2.6, -2.2, "carton"),
  staff(0.8866, -1.72, -1.2, "clipboard", false),
  staff(0.8995, -1.95, 1.6, "carton"),
  staff(0.8968, -2.5, 2.0, "carton"),
];

/** Consumers: at every stall, walking between them, families, the wheel queue. */
export const STAGE5_CONSUMERS: Stage5Figure[] = [
  // A: at the tasting counter.
  person(0.8762, -2.45, Math.PI + 0.1, "taste", "#f1eee6"),
  person(0.8778, -2.4, Math.PI, "hold", "#d7892f", KHAKI),
  person(0.8794, -2.47, Math.PI - 0.2, "taste", "#b0306a", DENIM, "sari"),
  person(0.8748, -2.55, Math.PI + 0.5, "talk", "#5f8fb3"),
  person(0.8808, -2.55, Math.PI - 0.5, "bag", "#2f6b62", KHAKI),
  // B: round the booth's tables.
  person(0.8912, -2.45, Math.PI + 0.2, "inspect", "#e8d9b8"),
  person(0.893, -2.4, Math.PI, "taste", "#e2a33b", DENIM, "sari"),
  person(0.8948, -2.5, Math.PI - 0.3, "hold", "#3f5f8a", KHAKI),
  person(0.8898, -2.62, Math.PI + 0.6, "talk", "#f4f1e8", DARK),
  // C: inside and in front of the marquee.
  person(0.8818, -6.2, Math.PI + 0.2, "hold", "#9b3b4a"),
  person(0.8838, -6.15, Math.PI, "inspect", "#c9d6e3", KHAKI),
  person(0.8856, -6.25, Math.PI - 0.3, "taste", "#d46a86", DENIM, "sari"),
  person(0.8808, -6.9, Math.PI / 2, "hold", "#6b8f5a", KHAKI),
  person(0.8862, -6.95, -Math.PI / 2, "inspect", "#e9e2d0", DENIM, "sari"),
  // D: watching the demo (a small audience).
  person(0.8978, -5.6, Math.PI + 0.25, "stand", "#44607f"),
  person(0.8992, -5.55, Math.PI, "taste", "#f0b35a", DENIM, "sari"),
  person(0.9006, -5.62, Math.PI - 0.25, "stand", "#7c9c52"),
  child(0.8985, -5.3, Math.PI, "#e36b5a"),
  // E and the pagoda tents.
  person(0.8932, -7.65, Math.PI + 0.3, "taste", "#6d4c8f"),
  person(0.8952, -7.6, Math.PI - 0.2, "hold", "#f1eee6", KHAKI),
  person(0.8785, -9.3, Math.PI + 0.3, "inspect", "#2e7f9a", DENIM, "sari"),
  person(0.8805, -9.25, Math.PI - 0.2, "bag", "#d9c46a"),
  person(0.8768, -6.05, Math.PI, "talk", "#a8452c", KHAKI),
  person(0.9028, -3.75, Math.PI + 0.2, "hold", "#5a7fa3"),
  person(0.9042, -3.8, Math.PI - 0.3, "taste", "#e8d9b8", DENIM, "sari"),
  // The Ferris wheel queue.
  person(0.8872, -9.55, -0.6, "stand", "#f1eee6"),
  person(0.8858, -9.4, -0.6, "talk", "#b8475a", DENIM, "sari"),
  child(0.8864, -9.25, -0.6, "#e2c15a"),
  person(0.8845, -9.25, -0.6, "stand", "#415a7a", KHAKI),
  // Families and friends walking between the stalls.
  person(0.8835, -4.2, Math.PI / 2, "bag", "#d9a441"),
  person(0.8845, -4.38, Math.PI / 2, "stand", "#c85a3a", DENIM, "sari"),
  child(0.8838, -4.55, Math.PI / 2, "#5f8fb3"),
  person(0.8915, -4.3, -Math.PI / 2, "talk", "#9fb6c9", DARK),
  person(0.8928, -4.45, -Math.PI / 2, "hold", "#e2a33b", DENIM, "sari"),
  person(0.8872, -8.0, Math.PI / 2 + 0.4, "bag", "#5b7f4a", KHAKI),
  person(0.8962, -6.9, 0.8, "bag", "#d9d2c3", DENIM),
  person(0.9015, -6.2, -1.2, "stand", "#e36b5a", DENIM, "sari"),
  child(0.9022, -6.0, -1.2, "#7c9c52"),
  person(0.8792, -4.9, 2.4, "talk", "#f4f1e8", KHAKI),
  person(0.8805, -5.05, -0.8, "taste", "#6d4c8f", DENIM, "sari"),
  person(0.8905, -6.1, 1.1, "stand", "#44607f"),
  person(0.8982, -9.1, 0.4, "bag", "#b0306a", DENIM, "sari"),
  // Arriving along the sidewalks and across from the right side.
  person(0.8655, -1.12, Math.PI / 2, "stand", "#f1eee6", DENIM),
  person(0.8672, -1.25, Math.PI / 2, "talk", "#d46a86", DENIM, "sari"),
  person(0.8705, 1.15, -Math.PI / 2, "bag", "#3f5f8a", KHAKI),
  person(0.8885, 1.18, Math.PI / 2, "stand", "#e8d9b8"),
  person(0.8995, 1.12, -Math.PI / 2, "bag", "#9b3b4a", DENIM, "sari"),
  person(0.9085, 1.2, Math.PI / 2, "talk", "#5b7f4a"),
];

// ---------------------------------------------------------------------------
// Terrain / vegetation (world x/z; derived from the road terms above)
// ---------------------------------------------------------------------------

/** Level the hills under the plaza, the wheel and the skyline. */
export const STAGE5_PADS = [
  { x: -10.4, z: -82.4, radius: 2.6, falloff: 1.8 },
  { x: -14.4, z: -82.0, radius: 2.8, falloff: 1.8 },
  { x: -17.0, z: -80.2, radius: 1.6, falloff: 1.4 },
  { x: -14.4, z: -84.6, radius: 3.0, falloff: 2.0 },
  { x: -16.6, z: -83.0, radius: 2.8, falloff: 1.8 },
  { x: -22.4, z: -75.0, radius: 4.6, falloff: 2.0 },
  { x: -21.8, z: -80.0, radius: 3.0, falloff: 2.0 },
  { x: -9.8, z: -90.2, radius: 3.0, falloff: 2.0 },
  { x: -14.8, z: -88.0, radius: 2.4, falloff: 2.0 },
];

/** Areas the world vegetation is cleared from (after placement — see worldZones). */
export const STAGE5_KEEP_OUT: Rect[] = [
  // The plaza (road-following segments across the fan of the bend).
  { x: -12.8, z: -79.59, width: 2.8, depth: 11.2, rotationY: 1.56 },
  { x: -12.75, z: -81.02, width: 2.8, depth: 11.2, rotationY: 1.5 },
  { x: -12.52, z: -82.84, width: 2.8, depth: 11.2, rotationY: 1.38 },
  { x: -12.04, z: -84.62, width: 2.8, depth: 11.2, rotationY: 1.25 },
  { x: -11.41, z: -86.21, width: 2.8, depth: 11.2, rotationY: 1.14 },
  { x: -10.65, z: -87.68, width: 2.8, depth: 11.2, rotationY: 1.04 },
  { x: -9.54, z: -89.29, width: 2.8, depth: 11.2, rotationY: 0.9 },
  // The service apron and the left sidewalk before it.
  { x: -7.71, z: -76.37, width: 2.6, depth: 1.6, rotationY: 1.74 },
  { x: -8.08, z: -78.42, width: 2, depth: 1.8, rotationY: 1.62 },
  // The right sidewalk.
  { x: -5.03, z: -76.23, width: 1.8, depth: 1.3, rotationY: 1.78 },
  { x: -5.24, z: -77.5, width: 1.8, depth: 1.3, rotationY: 1.69 },
  { x: -5.34, z: -78.79, width: 1.8, depth: 1.3, rotationY: 1.6 },
  { x: -5.34, z: -80.1, width: 1.8, depth: 1.3, rotationY: 1.54 },
  { x: -5.22, z: -81.31, width: 1.8, depth: 1.3, rotationY: 1.39 },
  { x: -4.9, z: -82.46, width: 1.8, depth: 1.3, rotationY: 1.22 },
  { x: -4.4, z: -83.59, width: 1.8, depth: 1.3, rotationY: 1.08 },
  // The skyline strips beyond the event and beyond the bend.
  { x: -22.6, z: -75.6, width: 6.0, depth: 12.0, rotationY: 0 },
  { x: -10.0, z: -90.0, width: 12.0, depth: 4.4, rotationY: -0.35 },
];

/** Where Stage 5 dresses its own land (the world vegetation thins here). */
export const STAGE5_BOUNDS = { minX: -26, maxX: -2, minZ: -92, maxZ: -76 };

/** Where the camera's Stage 5 shots lean their aim — the heart of the exhibition. */
export const STAGE5_FOCUS = { x: -12.2, z: -81.8, height: 1.0 };
