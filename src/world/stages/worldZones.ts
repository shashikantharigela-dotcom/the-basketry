import type { Rect } from "./common/types";
import { SCATTER_BOUNDS, SCATTER_KEEP_OUT, STAGE1_PADS } from "./stage1/stage1Layout";
import { STAGE2_BOUNDS, STAGE2_KEEP_OUT, STAGE2_PADS, STAGE2_ZONE } from "./stage2/stage2Layout";
import { STAGE3_BOUNDS, STAGE3_KEEP_OUT, STAGE3_PADS, STAGE3_ZONE } from "./stage3/stage3Layout";
import { STAGE4_BOUNDS, STAGE4_KEEP_OUT, STAGE4_PADS, STAGE4_STREET_CLEARING, STAGE4_ZONE } from "./stage4/stage4Layout";

/**
 * Registry of how each story stage shapes the shared terrain. The
 * foundation terrain reads this — stages never edit the terrain module
 * directly. Adding Stage 2+ means appending its zone and pads here.
 *
 * Pure data only (no imports from the road/terrain modules), so the
 * terrain can import it without a cycle.
 */

export interface TerrainPad {
  x: number;
  z: number;
  /** Fully level inside this radius… */
  radius: number;
  /** …blending back into the rolling hills over this distance. */
  falloff: number;
}

export interface TerrainPalette {
  low: string;
  high: string;
  verge: string;
}

export interface TerrainZone {
  id: string;
  /** z range (the road always runs toward -z) the zone's palette fully covers. */
  zFrom: number;
  zTo: number;
  /** Blend distance back to the neutral palette outside the range. */
  fade: number;
  /** How strongly the tint covers the shared landscape at full weight (0–1,
   * default 0.35); below 1 the natural earth variation shows through. */
  strength?: number;
  palette: TerrainPalette;
}

/** Optional ground tints a stage can lay over the shared natural landscape.
 * Stage 1 uses none. Stage 2 greens its stretch (lush Indian farmland),
 * easing in only after Stage 1's land ends. */
export const TERRAIN_ZONES: TerrainZone[] = [STAGE2_ZONE, STAGE3_ZONE, STAGE4_ZONE];

export const TERRAIN_PADS: TerrainPad[] = [...STAGE1_PADS, ...STAGE2_PADS, ...STAGE3_PADS, ...STAGE4_PADS];

/** Areas the world-wide vegetation never grows into (a stage's fields,
 * yards, lanes and buildings). */
export const VEGETATION_KEEP_OUT: Rect[] = [...SCATTER_KEEP_OUT];

/** Regions where a stage already dresses its own land, so the world-wide
 * vegetation thins out there (factor = fraction of normal density). */
export const VEGETATION_SPARSE: Array<{ minX: number; maxX: number; minZ: number; maxZ: number; factor: number }> = [
  { ...SCATTER_BOUNDS, factor: 0.35 },
];

/**
 * Later stages clear and thin the world vegetation AFTER placement instead
 * (see WorldVegetation): the vegetation is scattered by one seeded random
 * stream, so a keep-out added above would reshuffle every plant placed
 * after it — including around earlier, approved stages. Clearings remove
 * plants inside them; thinning keeps a deterministic fraction per plant.
 */
export const VEGETATION_CLEARINGS: Rect[] = [
  ...STAGE2_KEEP_OUT,
  ...STAGE3_KEEP_OUT,
  ...STAGE4_KEEP_OUT,
  ...STAGE4_STREET_CLEARING,
];

export const VEGETATION_THINNING: Array<{
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  factor: number;
  /** Drop the world's poplar columns here (they read as cypresses, not Indian farmland). */
  dropPoplars?: boolean;
}> = [
  { ...STAGE2_BOUNDS, minX: -26, maxX: 26, minZ: -34, factor: 0.85, dropPoplars: true },
  { ...STAGE3_BOUNDS, minX: -26, maxX: 26, maxZ: -34, factor: 0.85, dropPoplars: true },
  // The city: the wild countryside gives way to planted streets.
  { ...STAGE4_BOUNDS, factor: 0.35, dropPoplars: true },
];
