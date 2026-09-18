import { create } from "zustand";

interface SceneState {
  /** Normalized 0–1 scroll progress across the entire pinned narrative. */
  progress: number;
  setProgress: (value: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  setProgress: (value) => set({ progress: value }),
}));
