export interface StoryCopy {
  /** Scroll window (0–1) the panel owns; it fades in and out at the edges. */
  range: [number, number];
  label: string;
  heading: string[];
  body: string[];
  steps: string[];
}

/** Stage 3 — the first stage with story text in the foundation world
 * (3D left, text right). */
export const STAGE3_COPY: StoryCopy = {
  range: [0.5, 0.7],
  label: "STAGE 3",
  heading: ["AWARENESS", "SETUP"],
  body: ["The Basketry reaches the community", "and brings the product into the real world."],
  steps: ["Arrive", "Unload", "Build", "Begin Awareness"],
};
