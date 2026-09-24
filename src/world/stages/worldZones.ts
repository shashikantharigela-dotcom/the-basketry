import type { Rect } from "./common/types";
import { SCATTER_BOUNDS, SCATTER_KEEP_OUT, STAGE1_PADS } from "./stage1/stage1Layout";
import { STAGE2_BOUNDS, STAGE2_KEEP_OUT, STAGE2_PADS } from "./stage2/stage2Layout";

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
  palette: TerrainPalette;
}

/** Optional gentle ground tints a stage can lay over the shared natural
 * landscape. Stage 1 uses none — the farm sits in the same continuous
 * land as everything else. */
export const TERRAIN_ZONES: TerrainZone[] = [];

export const TERRAIN_PADS: TerrainPad[] = [...STAGE1_PADS, ...STAGE2_PADS];

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
export const VEGETATION_CLEARINGS: Rect[] = [...STAGE2_KEEP_OUT];

export const VEGETATION_THINNING: Array<{ minX: number; maxX: number; minZ: number; maxZ: number; factor: number }> = [
  { ...STAGE2_BOUNDS, factor: 0.4 },
];
