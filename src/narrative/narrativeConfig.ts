import * as THREE from "three";

export type StageId =
  | "products"
  | "brand"
  | "disconnected"
  | "basketry"
  | "brandReach"
  | "businessSourcing"
  | "consumerMarket"
  | "ecosystem"
  | "demandLoop"
  | "finalStatement";

export interface StageCopy {
  /** Large DOM headline, one array entry per rendered line. */
  heading: string[];
  /** Optional short line above/below the body copy (e.g. a supply chain map). */
  supportingLine?: string;
  /** Supporting paragraph copy, one array entry per rendered line. */
  body: string[];
}

export interface StageConfig {
  id: StageId;
  /** Position of this stage within STAGES — the single source for its "0N" index label. */
  index: number;
  /** Normalized 0–1 scroll progress this stage owns. Stages tile the full timeline. */
  range: [number, number];
  /** World-space anchor the stage's 3D content is built around. */
  anchor: [number, number, number];
  /** Camera keyframe the dolly path passes through for this stage. */
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  copy: StageCopy;
}

interface RawStageConfig extends Omit<StageConfig, "index"> {}

// Single source of truth for the full ten-stage Basketry narrative:
// PRODUCTS -> BRAND -> DISCONNECTED JOURNEY -> THE BASKETRY -> BRAND REACH ->
// BUSINESS SOURCING -> CONSUMER MARKET -> ECOSYSTEM -> DEMAND LOOP -> FINAL STATEMENT
//
// Composition rule: the DOM heading always lives in a fixed left text-safe
// column (see UIOverlay). Every camera.target here is deliberately offset
// to the left of its stage's anchor, so the 3D content it frames reads on
// the right two-thirds of the screen and never sits behind the typography.
//
// Depth rule: each stage's anchor sits further down the -Z dolly track
// than the last (8 -> -103), so the whole experience reads as one
// continuous forward journey rather than a set of separate scenes.
const RAW_STAGES: RawStageConfig[] = [
  {
    id: "products",
    range: [0, 0.1],
    anchor: [0.7, -0.05, 8],
    camera: {
      position: [-0.8, 1.5, 14.5],
      target: [-0.9, 0.15, 8],
    },
    copy: {
      heading: ["PRODUCTS"],
      supportingLine: "GOOD PRODUCTS ARE EVERYWHERE.",
      body: [
        "Great products. Great manufacturers. Emerging brands.",
        "But finding the right connection isn't always simple.",
      ],
    },
  },
  {
    id: "brand",
    range: [0.1, 0.2],
    anchor: [1.0, 0.1, -3],
    camera: {
      position: [2.6, 1.9, 3.0],
      target: [-0.6, 0.5, -3],
    },
    copy: {
      heading: ["A GREAT PRODUCT", "NEEDS THE RIGHT JOURNEY."],
      body: ["From manufacturer to market, every connection matters."],
    },
  },
  {
    id: "disconnected",
    range: [0.2, 0.3],
    anchor: [0, 0.3, -15],
    camera: {
      position: [-4.0, 1.9, -6.0],
      target: [-1.6, 0.2, -15],
    },
    copy: {
      heading: ["TODAY,", "THE JOURNEY FEELS DISCONNECTED."],
      supportingLine: "MANUFACTURER → DISTRIBUTOR → RETAILER → CONSUMER",
      body: [
        "Good products can exist. Demand can exist.",
        "But the connection between them isn't always there.",
      ],
    },
  },
  {
    id: "basketry",
    range: [0.3, 0.4],
    anchor: [0, 0.25, -28],
    camera: {
      position: [0.6, 2.8, -19.0],
      target: [-1.4, 0.3, -28],
    },
    copy: {
      heading: ["WHAT IF WE COULD", "CONNECT THE JOURNEY?"],
      supportingLine: "PRODUCTS × BRANDS × BUSINESSES × CONSUMERS",
      body: ["One connected ecosystem."],
    },
  },
  {
    id: "brandReach",
    range: [0.4, 0.5],
    anchor: [0.6, 0.2, -40],
    camera: {
      position: [2.2, 1.8, -31],
      target: [-0.8, 0.4, -40],
    },
    copy: {
      heading: ["BRANDS", "REACH FURTHER."],
      supportingLine: "NEW MARKETS. NEW BUSINESSES. NEW OPPORTUNITIES.",
      body: ["The Basketry opens doors brands couldn't reach alone."],
    },
  },
  {
    id: "businessSourcing",
    range: [0.5, 0.6],
    anchor: [0, 0.3, -52],
    camera: {
      position: [-3.0, 1.7, -43],
      target: [-1.5, 0.3, -52],
    },
    copy: {
      heading: ["BUSINESSES", "SOURCE WITH CONFIDENCE."],
      supportingLine: "PRODUCTS. SUPPLIERS. DISTRIBUTION.",
      body: ["The right products, the right suppliers, found faster."],
    },
  },
  {
    id: "consumerMarket",
    range: [0.6, 0.7],
    anchor: [0.5, 0.1, -64],
    camera: {
      position: [2.0, 1.6, -55],
      target: [-0.9, 0.2, -64],
    },
    copy: {
      heading: ["CONSUMERS", "DESERVE BETTER CHOICES."],
      supportingLine: "DISCOVERY, MADE SIMPLE.",
      body: ["Better products, reaching the people who want them."],
    },
  },
  {
    id: "ecosystem",
    range: [0.7, 0.8],
    anchor: [0, 0.4, -78],
    camera: {
      position: [0.4, 2.6, -68],
      target: [-1.6, 0.4, -78],
    },
    copy: {
      heading: ["ONE CONNECTED", "ECOSYSTEM."],
      supportingLine: "PRODUCTS × BRANDS × BUSINESSES × CONSUMERS",
      body: ["Sourcing better. Distributing smarter."],
    },
  },
  {
    id: "demandLoop",
    range: [0.8, 0.9],
    anchor: [0, 0.3, -90],
    camera: {
      position: [-2.4, 2.0, -81],
      target: [-1.4, 0.3, -90],
    },
    copy: {
      heading: ["DEMAND", "FLOWS BACK."],
      supportingLine: "CONSUMER → BUSINESS → THE BASKETRY → BRAND",
      body: ["Every purchase becomes a signal, flowing back toward better products."],
    },
  },
  {
    id: "finalStatement",
    range: [0.9, 1],
    anchor: [0, 0.3, -103],
    camera: {
      position: [0.4, 2.2, -95],
      target: [-1.3, 0.3, -103],
    },
    copy: {
      heading: ["ONE BASKET.", "MANY POSSIBILITIES."],
      body: ["Sourcing better. Distributing smarter."],
    },
  },
];

export const STAGES: StageConfig[] = RAW_STAGES.map((stage, index) => ({
  ...stage,
  index,
}));

// Camera dolly path — a smooth spline through each stage's camera keyframe.
export const CAMERA_CURVE = new THREE.CatmullRomCurve3(
  STAGES.map((s) => new THREE.Vector3(...s.camera.position)),
  false,
  "catmullrom",
  0.35
);

// The point the camera looks toward, interpolated the same way as position
// so gaze and dolly stay in sync across the path.
export const LOOKAT_CURVE = new THREE.CatmullRomCurve3(
  STAGES.map((s) => new THREE.Vector3(...s.camera.target)),
  false,
  "catmullrom",
  0.35
);

// Remaps global scroll progress to the camera curve's own uniform
// parameter space, so that stage i's camera keyframe (control point i,
// naturally sitting at t = i/(STAGES.length-1)) is reached exactly when
// progress hits stage i's *center* — not an arbitrary point determined by
// how many stages happen to exist. Without this, getPoint(progress)
// directly would drift keyframes away from their intended stage windows
// as more stages are added, and getPointAt (arc-length) would drift them
// based on how far apart keyframes happen to sit in world space — both
// wrong for a scroll-paced narrative where every stage owns an equal
// share of the timeline.
export function getCameraParam(progress: number): number {
  const stageCount = STAGES.length;
  const t = (progress * stageCount - 0.5) / (stageCount - 1);
  return clamp01(t);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function inverseLerp(a: number, b: number, x: number): number {
  if (a === b) return x >= b ? 1 : 0;
  return clamp01((x - a) / (b - a));
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

const CROSSFADE_HALF = 0.02;

/** How visible a stage's DOM copy should be at a given global scroll progress. */
export function getStageOpacity(stage: StageConfig, progress: number): number {
  const [start, end] = stage.range;
  const fadeIn =
    start <= 0
      ? 1
      : smoothstep(inverseLerp(start - CROSSFADE_HALF, start + CROSSFADE_HALF, progress));
  const fadeOut =
    end >= 1
      ? 1
      : 1 - smoothstep(inverseLerp(end - CROSSFADE_HALF, end + CROSSFADE_HALF, progress));
  return Math.min(fadeIn, fadeOut);
}

/** Normalized 0–1 progress local to a single stage's own range, clamped. */
export function getStageLocalProgress(stage: StageConfig, progress: number): number {
  const [start, end] = stage.range;
  return inverseLerp(start, end, progress);
}

export function getStage(id: StageId): StageConfig {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown stage: ${id}`);
  return stage;
}

// The window (in global scroll progress) across which the Disconnected
// Journey's fragmented supply-chain lines resolve into the Basketry hub's
// spokes — straddling the boundary between the two stages so the two scenes
// read as one continuous reconnection rather than a hard cut.
const disconnectedStage = getStage("disconnected");
const basketryStage = getStage("basketry");
export const RECONNECT_START = disconnectedStage.range[1] - 0.035;
export const RECONNECT_END = basketryStage.range[0] + 0.04;

export function getReconnectProgress(progress: number): number {
  return smoothstep(inverseLerp(RECONNECT_START, RECONNECT_END, progress));
}
