/**
 * Which world the canvas renders. The new 3D foundation is the default;
 * the previous ten-beat scene is kept intact and reachable with `?legacy`
 * in the URL, for side-by-side comparison while the six stages are built.
 */
export type SceneMode = "foundation" | "legacy";

export const SCENE_MODE: SceneMode =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("legacy") ? "legacy" : "foundation";
