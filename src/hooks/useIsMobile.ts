import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 768px)";

/** Reactive check for the same breakpoint NarrativeController's ScrollTrigger uses. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = () => setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

/** Non-reactive variant for one-time module-scope geometry LOD decisions. */
export function isNarrowViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
}
