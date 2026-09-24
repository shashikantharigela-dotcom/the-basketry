import { STAGE1_PADS, STAGE1_ZONE } from "./stage1/stage1Layout";

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

export const TERRAIN_ZONES: TerrainZone[] = [STAGE1_ZONE];

export const TERRAIN_PADS: TerrainPad[] = [...STAGE1_PADS];
