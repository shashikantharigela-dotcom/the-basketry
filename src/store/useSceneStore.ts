import { create } from "zustand";

interface SceneState {
  /** Scroll progress across the pinned narrative: 0–1 in the legacy scene;
   * in the foundation world it runs to JOURNEY_LENGTH (see journey.ts), so
   * progress values of the earlier stages keep their meaning. */
  progress: number;
  setProgress: (value: number) => void;
  /** Multiplier applied to every ambient/idle animation (spins, orbits,
   * camera wobble). 1 = full motion, reduced when the visitor has
   * prefers-reduced-motion set. The scroll-driven camera dolly itself is
   * unaffected — that's navigation, not decoration. */
  motionScale: number;
  setMotionScale: (value: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  setProgress: (value) => set({ progress: value }),
  motionScale: 1,
  setMotionScale: (value) => set({ motionScale: value }),
}));
