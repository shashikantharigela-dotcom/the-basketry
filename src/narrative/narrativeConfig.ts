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
  /** Normalized 0–1 scroll progress this stage's DOM copy owns. Stages tile the full timeline. */
  range: [number, number];
  /**
   * Where this stage's environment sits in the single continuous world
   * (see src/world/worldPath.ts for the road/truck/camera that connects
   * them all). Ecosystem/Demand Loop/Final Statement don't have a
   * dedicated environment of their own — those beats play out as the
   * camera pulls back to reveal the world already built for the earlier
   * stages — so their anchors are unused placeholders.
   */
  anchor: [number, number, number];
  copy: StageCopy;
}

interface RawStageConfig extends Omit<StageConfig, "index"> {}

// Single source of truth for THE BASKETRY's ten-beat narrative copy.
// This file owns *what the visitor reads and when* — the physical world
// (the road, the truck, the camera) lives in src/world/worldPath.ts, so
// that one continuous journey isn't accidentally re-fragmented into
// per-stage camera snaps here.
const RAW_STAGES: RawStageConfig[] = [
  {
    id: "products",
    range: [0, 0.08],
    anchor: [0.7, -0.05, 8],
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
    range: [0.08, 0.18],
    anchor: [0.9, 0.1, 1],
    copy: {
      heading: ["A GREAT PRODUCT", "NEEDS THE RIGHT JOURNEY."],
      body: ["The product is packed. The truck arrives. The journey begins."],
    },
  },
  {
    id: "disconnected",
    range: [0.18, 0.3],
    anchor: [3.0, 0.3, -14],
    copy: {
      heading: ["TODAY,", "THE JOURNEY FEELS DISCONNECTED."],
      supportingLine: "MANUFACTURER → DISTRIBUTOR → RETAILER → CONSUMER",
      body: ["Finding the right connection isn't always simple."],
    },
  },
  {
    id: "basketry",
    range: [0.3, 0.4],
    anchor: [0, 0.25, -30],
    copy: {
      heading: ["WHAT IF WE COULD", "CONNECT THE JOURNEY?"],
      supportingLine: "PRODUCTS × BRANDS × BUSINESSES × CONSUMERS",
      body: ["One connected ecosystem."],
    },
  },
  {
    id: "brandReach",
    range: [0.4, 0.5],
    anchor: [2.2, 0.2, -40],
    copy: {
      heading: ["BRANDS", "REACH FURTHER."],
      supportingLine: "NEW MARKETS. NEW BUSINESSES. NEW OPPORTUNITIES.",
      body: ["The Basketry opens doors brands couldn't reach alone."],
    },
  },
  {
    id: "businessSourcing",
    range: [0.5, 0.6],
    anchor: [-2.5, 0.3, -55],
    copy: {
      heading: ["BUSINESSES", "SOURCE WITH CONFIDENCE."],
      supportingLine: "PRODUCTS. SUPPLIERS. DISTRIBUTION.",
      body: ["The right products, the right suppliers, found faster."],
    },
  },
  {
    id: "consumerMarket",
    range: [0.6, 0.72],
    anchor: [0.3, 0.1, -64],
    copy: {
      heading: ["CONSUMERS", "DESERVE BETTER CHOICES."],
      supportingLine: "DISCOVERY, MADE SIMPLE.",
      body: ["The product reaches the people who want it."],
    },
  },
  {
    id: "ecosystem",
    range: [0.72, 0.84],
    anchor: [0, -1, -28],
    copy: {
      heading: ["ONE CONNECTED", "ECOSYSTEM."],
      supportingLine: "PRODUCTS × BRANDS × BUSINESSES × CONSUMERS",
      body: ["Sourcing better. Distributing smarter."],
    },
  },
  {
    id: "demandLoop",
    range: [0.84, 0.93],
    anchor: [0, -1, -40],
    copy: {
      heading: ["DEMAND", "FLOWS BACK."],
      supportingLine: "CONSUMER → BUSINESS → THE BASKETRY → BRAND",
      body: ["Every purchase becomes a signal, flowing back toward better products."],
    },
  },
  {
    id: "finalStatement",
    range: [0.93, 1],
    anchor: [1.0, 0.15, -65],
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

const TRANSITION_WIDTH = 0.035;

/**
 * How visible a stage's DOM copy should be at a given global scroll
 * progress. Adjacent stages share a boundary (one's `end` is the next's
 * `start`), so the fade windows are one-sided rather than a symmetric
 * crossfade straddling that shared point: the outgoing headline finishes
 * fading out exactly AT the boundary, and the incoming one only starts
 * fading in from that same point onward. That guarantees the two never
 * sit at ~50% opacity at once — which read as illegible overlapping
 * text if a visitor stopped scrolling mid-transition — at the cost of a
 * single instant of "nothing visible" exactly on the boundary, which
 * reads as a clean cut rather than a garble.
 */
export function getStageOpacity(stage: StageConfig, progress: number): number {
  const [start, end] = stage.range;
  const fadeIn = start <= 0 ? 1 : smoothstep(inverseLerp(start, start + TRANSITION_WIDTH, progress));
  const fadeOut = end >= 1 ? 1 : 1 - smoothstep(inverseLerp(end - TRANSITION_WIDTH, end, progress));
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
