import { useEffect } from "react";
import { useSceneStore } from "../store/useSceneStore";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Wires the OS-level reduced-motion preference into the scene store's
 * motionScale, so every idle/ambient animation (spins, orbits, camera
 * wobble) reads it — without touching the scroll-driven camera dolly,
 * which is navigation, not decoration. Mount once near the app root. */
export function usePrefersReducedMotion(): void {
  const setMotionScale = useSceneStore((state) => state.setMotionScale);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const apply = () => setMotionScale(mediaQuery.matches ? 0.15 : 1);
    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, [setMotionScale]);
}
