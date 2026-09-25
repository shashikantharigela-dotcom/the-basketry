/**
 * How far the scroll-driven journey runs, in "journey progress" units.
 *
 * Stages 1–4 were built on progress 0 → 1 (truck on road u 0.1 → 0.86).
 * Later stages extend the journey past 1 along the same S-road at the same
 * pace; the page scrolls proportionally further, so every earlier stage
 * appears at exactly the same scroll distance from the top as before.
 * Stage 6 extends it once more: the truck arrives at the destination at
 * ARRIVAL_U and holds there for the final reveal.
 */
export const JOURNEY_LENGTH = 1.2;

/** Road fraction where the journey truck arrives at the final destination
 * (Stage 6) and holds while the camera completes the reveal. */
export const ARRIVAL_U = 0.928;

/** Scroll length (vh) of the pinned narrative for the full journey: the
 * original 1300vh of scrub per unit of progress, plus the pinned viewport. */
export const JOURNEY_SCROLL_VH = 1300 * JOURNEY_LENGTH + 100;
