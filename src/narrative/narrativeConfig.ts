import * as THREE from "three";

export type StageId = "products" | "brand" | "disconnected" | "basketry";

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

// Single source of truth for Phase 1's four-stage narrative:
// PRODUCTS -> BRAND -> DISCONNECTED JOURNEY -> THE BASKETRY
//
// Composition rule: the DOM heading always lives in a fixed left text-safe
// column (see UIOverlay). Every camera.target here is deliberately offset
// to the left of its stage's anchor, so the 3D content it frames reads on
// the right two-thirds of the screen and never sits behind the typography.
const RAW_STAGES: RawStageConfig[] = [
  {
    id: "products",
    range: [0, 0.25],
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
        "But finding the right product, the right market, and the right distribution isn't always simple.",
      ],
    },
  },
  {
    id: "brand",
    range: [0.25, 0.5],
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
    range: [0.5, 0.75],
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
    range: [0.75, 1],
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

const CROSSFADE_HALF = 0.05;

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
export const RECONNECT_START = disconnectedStage.range[1] - 0.08;
export const RECONNECT_END = basketryStage.range[0] + 0.1;

export function getReconnectProgress(progress: number): number {
  return smoothstep(inverseLerp(RECONNECT_START, RECONNECT_END, progress));
}
