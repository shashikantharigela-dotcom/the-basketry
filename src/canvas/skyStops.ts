/** [t, color] stops, t = 0 straight up … 1 straight down. */
export type SkyStops = ReadonlyArray<readonly [number, string]>;

/** The legacy Red World sky: vivid red fading to a deeper red — never black. */
export const RED_WORLD_SKY: SkyStops = [
  [0, "#f20d16"],
  [1, "#b90710"],
];
