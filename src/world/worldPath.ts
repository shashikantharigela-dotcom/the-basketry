import * as THREE from "three";

/**
 * The physical world of THE BASKETRY: one continuous road the delivery
 * truck drives from the factory to the consumer market, and the camera
 * logic that rides along with it. This is deliberately separate from
 * narrativeConfig.ts — that file owns the *text* (what the visitor reads
 * and when); this file owns the *place* (where things physically are,
 * and how the camera moves through them).
 *
 * There is no per-stage camera keyframe here, on purpose: snapping
 * between fixed shots is exactly the "slide deck" feeling this replaces.
 * Instead the camera is a continuous function of scroll progress, chasing
 * the truck with a slowly-varying cinematic offset, then blending into a
 * high aerial view for the final ecosystem reveal.
 */

// The road's waypoints — every environment in the story sits at or near
// one of these, so the whole world is physically one connected place.
// y stays flat (ground level); x wanders gently; z counts down steadily,
// so the whole journey reads as one continuous forward drive.
export const WORLD_PATH_POINTS: Array<[number, number, number]> = [
  [0.6, -1.3, 10], // factory forecourt — the truck starts loaded here
  [0.9, -1.3, 2], // leaving the factory
  [0.5, -1.3, -6], // open road
  [0.0, -1.3, -15], // the "disconnected" stretch — other parts of the ecosystem visible off to the side, cut off from each other
  [0.0, -1.3, -23], // approaching the Basketry
  [0.0, -1.3, -30], // straight through the Basketry plaza
  [0.3, -1.3, -38], // brand reach
  [0.2, -1.3, -47], // toward business sourcing
  [0.0, -1.3, -55], // business sourcing
  [0.3, -1.3, -64], // consumer market — the truck's final stop
];

export const TRUCK_CURVE = new THREE.CatmullRomCurve3(
  WORLD_PATH_POINTS.map((p) => new THREE.Vector3(...p)),
  false,
  "catmullrom",
  0.3
);

// The truck finishes its drive at this fraction of the overall scroll —
// matching Consumer Market's own end in narrativeConfig. Past this point
// the truck is parked (delivered) and the camera continues alone into
// the aerial ecosystem reveal.
export const TRUCK_END_PROGRESS = 0.72;

const UP = new THREE.Vector3(0, 1, 0);

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(t: number): number {
  const clamped = clamp01(t);
  return clamped * clamped * (3 - 2 * clamped);
}

/** Truck position + forward tangent at a given global scroll progress
 * (0–1). Writes into the supplied vectors to avoid per-frame allocation. */
export function computeTruckPose(progress: number, outPosition: THREE.Vector3, outTangent: THREE.Vector3): void {
  const u = clamp01(progress / TRUCK_END_PROGRESS);
  TRUCK_CURVE.getPoint(u, outPosition);
  TRUCK_CURVE.getTangent(u, outTangent);
}

interface OffsetKeyframe {
  /** Truck-path parameter (0–1), not global scroll progress. */
  u: number;
  back: number;
  up: number;
  side: number;
  lookAhead: number;
  /** How far to the truck's left the camera's look-at target sits, so
   * the truck+road reads right-of-center on screen, clear of the DOM
   * text column — the same trick Phase 1 used with fixed keyframes,
   * now computed relative to the truck's own heading. */
  targetBias: number;
}

// Cinematic pacing: a wide, dramatic shot through the disconnected
// stretch, tightening to thread through the Basketry hub, easing back
// out for the later stops. u values land on each stage's own start (see
// narrativeConfig ranges ÷ TRUCK_END_PROGRESS) so the framing changes
// land with the story beats.
const OFFSET_KEYFRAMES: OffsetKeyframe[] = [
  { u: 0.0, back: 7.0, up: 3.2, side: 1.8, lookAhead: 1.8, targetBias: 0.9 },
  { u: 0.111, back: 10.0, up: 5.0, side: 1.2, lookAhead: 2.0, targetBias: 0.8 },
  { u: 0.25, back: 10.5, up: 6.0, side: 2.0, lookAhead: 2.4, targetBias: 1.0 },
  { u: 0.417, back: 8.5, up: 5.5, side: 1.4, lookAhead: 1.8, targetBias: 0.8 },
  { u: 0.556, back: 11.5, up: 6.5, side: 1.8, lookAhead: 2.0, targetBias: 0.9 },
  { u: 0.694, back: 10.5, up: 6.0, side: 1.5, lookAhead: 1.8, targetBias: 0.85 },
  { u: 1.0, back: 5.0, up: 3.0, side: 1.2, lookAhead: 1.4, targetBias: 0.8 },
];

function interpolateOffset(u: number): OffsetKeyframe {
  const frames = OFFSET_KEYFRAMES;
  if (u <= frames[0].u) return frames[0];
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (u <= b.u) {
      const t = smoothstep01((u - a.u) / (b.u - a.u));
      return {
        u,
        back: THREE.MathUtils.lerp(a.back, b.back, t),
        up: THREE.MathUtils.lerp(a.up, b.up, t),
        side: THREE.MathUtils.lerp(a.side, b.side, t),
        lookAhead: THREE.MathUtils.lerp(a.lookAhead, b.lookAhead, t),
        targetBias: THREE.MathUtils.lerp(a.targetBias, b.targetBias, t),
      };
    }
  }
  return frames[frames.length - 1];
}

// The "problem" stretch gets a touch of handheld tension, same idea as
// Phase 1's disconnected-stage wobble — peaking mid-stretch, gone
// everywhere else, and scaled by motionScale for reduced-motion.
const TENSION_CENTER_U = 0.333; // midpoint of the disconnected stretch (0.25–0.417)
const TENSION_HALF_WIDTH = 0.12;

// A high, wide aerial vantage that takes in the whole world at once —
// the ecosystem reveal is a camera move, not a new floating diorama.
const AERIAL_POSITION = new THREE.Vector3(17, 25, 11);
const AERIAL_TARGET = new THREE.Vector3(0, -1, -28);

const truckPosition = new THREE.Vector3();
const truckTangent = new THREE.Vector3();
const right = new THREE.Vector3();
const chasePosition = new THREE.Vector3();
const chaseTarget = new THREE.Vector3();

/** The camera's raw target position + look-at point for a given global
 * scroll progress. CameraRig damps toward these every frame; this
 * function itself is a pure snapshot, no smoothing. */
export function computeCameraPose(
  progress: number,
  elapsedTime: number,
  motionScale: number,
  outPosition: THREE.Vector3,
  outTarget: THREE.Vector3
): void {
  const truckU = clamp01(progress / TRUCK_END_PROGRESS);
  computeTruckPose(progress, truckPosition, truckTangent);
  right.crossVectors(truckTangent, UP).normalize();

  const offset = interpolateOffset(truckU);

  chasePosition
    .copy(truckPosition)
    .addScaledVector(truckTangent, -offset.back)
    .addScaledVector(right, offset.side)
    .addScaledVector(UP, offset.up);

  chaseTarget.copy(truckPosition).addScaledVector(truckTangent, offset.lookAhead).addScaledVector(right, -offset.targetBias);

  const tensionDistance = Math.abs(truckU - TENSION_CENTER_U) / TENSION_HALF_WIDTH;
  const tension = tensionDistance < 1 ? Math.cos((tensionDistance * Math.PI) / 2) * motionScale : 0;
  chasePosition.x += Math.sin(elapsedTime * 0.6) * 0.12 * tension;
  chasePosition.y += Math.sin(elapsedTime * 0.9 + 1.3) * 0.07 * tension;

  if (progress <= TRUCK_END_PROGRESS) {
    outPosition.copy(chasePosition);
    outTarget.copy(chaseTarget);
    return;
  }

  const blend = smoothstep01((progress - TRUCK_END_PROGRESS) / (1 - TRUCK_END_PROGRESS));
  outPosition.copy(chasePosition).lerp(AERIAL_POSITION, blend);
  outTarget.copy(chaseTarget).lerp(AERIAL_TARGET, blend);
}

/** How far into the aerial pull-back we are (0 before it starts, 1 once
 * fully aerial) — used to widen fog so the wide reveal isn't washed out. */
export function getAerialBlend(progress: number): number {
  return smoothstep01((progress - TRUCK_END_PROGRESS) / (1 - TRUCK_END_PROGRESS));
}
