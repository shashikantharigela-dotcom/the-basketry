import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "../gsap/gsapConfig";
import { useSceneStore } from "../store/useSceneStore";

interface NarrativeControllerProps {
  children: ReactNode;
  /** How much scroll distance the whole pinned narrative should consume. */
  scrollLengthVh?: number;
  /** Progress reported at the end of the scroll (1 = normalized 0–1). */
  progressScale?: number;
}

export function NarrativeController({
  children,
  scrollLengthVh = 400,
  progressScale = 1,
}: NarrativeControllerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<HTMLDivElement | null>(null);
  const setProgress = useSceneStore((state) => state.setProgress);

  useEffect(() => {
    if (!wrapperRef.current || !pinnedRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        // Desktop / tablet: full pinned scrub.
        "(min-width: 769px)": function () {
          ScrollTrigger.create({
            trigger: wrapperRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            pin: pinnedRef.current,
            pinSpacing: false,
            onUpdate: (self) => setProgress(self.progress * progressScale),
          });
        },
        // Mobile: shorter, slightly less smoothed scrub so it doesn't feel
        // laggy on touch input. Still pinned — Phase 5 will branch this
        // further into the "guided" autoplay tier from the blueprint.
        "(max-width: 768px)": function () {
          ScrollTrigger.create({
            trigger: wrapperRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            pin: pinnedRef.current,
            pinSpacing: false,
            onUpdate: (self) => setProgress(self.progress * progressScale),
          });
        },
      });
    });

    return () => ctx.revert();
  }, [setProgress, progressScale]);

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", height: `${scrollLengthVh}vh` }}
    >
      <div
        ref={pinnedRef}
        style={{
          position: "relative",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
