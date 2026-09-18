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
// y stays flat (ground level); z counts down steadily so the drive
// always reads as forward motion; x swings widely between points on
// purpose — this is a real winding road with left/right turns and
// S-curves, not a straight line with a gentle wobble. The Basketry
// waypoint (index 5) is the one point every turn resolves back toward
// center on, so it reads as the road's actual convergence point.
export const WORLD_PATH_POINTS: Array<[number, number, number]> = [
  [1.0, -1.3, 14], // factory forecourt — the truck starts loaded here
  [5.5, -1.3, 5], // leaving the factory, curving right
  [-4.5, -1.3, -5], // swinging left through the open road
  [4.5, -1.3, -15], // swinging right — the "disconnected" stretch
  [-1.5, -1.3, -23], // converging back toward center, approaching the Basketry
  [0.0, -1.3, -31], // straight through the Basketry plaza — the connection point
  [5.0, -1.3, -39], // brand reach, curving right again
  [-5.5, -1.3, -48], // swinging left toward business sourcing
  [3.0, -1.3, -57], // business sourcing, curving right
  [-2.0, -1.3, -66], // consumer market — the truck's final stop
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

/**
 * The position/tangent/right frame exactly at one of the road's named
 * waypoints (see WORLD_PATH_POINTS) — how narrativeConfig places each
 * stage's environment relative to the road at that point (`side` off
 * to the right of the direction of travel, `along` further forward),
 * so an environment reads as "beside the road" correctly regardless of
 * which way the road happens to be turning there, rather than as a
 * flat world-space offset that only worked back when the road was
 * nearly straight.
 */
export function getPathFrame(index: number): { point: THREE.Vector3; tangent: THREE.Vector3; right: THREE.Vector3 } {
  const u = index / (WORLD_PATH_POINTS.length - 1);
  const point = TRUCK_CURVE.getPoint(u);
  const tangent = TRUCK_CURVE.getTangent(u);
  const right = new THREE.Vector3().crossVectors(tangent, UP).normalize();
  return { point, tangent, right };
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
  { u: 0.0, back: 9.0, up: 4.5, side: 2.2, lookAhead: 2.2, targetBias: 1.0 },
  { u: 0.111, back: 13.0, up: 7.0, side: 1.6, lookAhead: 2.6, targetBias: 0.9 },
  { u: 0.25, back: 14.0, up: 8.0, side: 2.6, lookAhead: 3.0, targetBias: 1.1 },
  { u: 0.417, back: 12.0, up: 7.5, side: 1.8, lookAhead: 2.2, targetBias: 0.9 },
  { u: 0.556, back: 15.0, up: 8.5, side: 2.4, lookAhead: 2.6, targetBias: 1.0 },
  { u: 0.694, back: 14.5, up: 8.5, side: 2.0, lookAhead: 2.2, targetBias: 0.95 },
  { u: 1.0, back: 10.0, up: 6.5, side: 1.6, lookAhead: 1.6, targetBias: 0.9 },
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
const AERIAL_POSITION = new THREE.Vector3(24, 32, 16);
const AERIAL_TARGET = new THREE.Vector3(2, -1, -30);

const truckPosition = new THREE.Vector3();
const truckTangent = new THREE.Vector3();
const aheadTangent = new THREE.Vector3();
const right = new THREE.Vector3();
const chasePosition = new THREE.Vector3();
const chaseTarget = new THREE.Vector3();

// How far ahead (in truck-curve u) to sample when estimating the road's
// current turn rate for camera banking.
const BANK_SAMPLE_DU = 0.01;
// Roll a few degrees into a turn, like a vehicle leaning through a
// curve — clamped well short of disorienting, and never applied during
// the aerial reveal (a level horizon there reads as the "we've arrived
// at the overview" cue).
const BANK_GAIN = 0.35;
const MAX_BANK_RADIANS = THREE.MathUtils.degToRad(10);

/** The camera's raw target position + look-at point for a given global
 * scroll progress. CameraRig damps toward these every frame; this
 * function itself is a pure snapshot, no smoothing.
 *
 * `biasMultiplier` (+1/-1/0) comes from the active stage's text side
 * (see narrativeConfig's getTextSideMultiplier) — it mirrors the
 * camera's own lateral offset and look-at bias so the 3D content
 * always reads on the side of the screen opposite the DOM text column,
 * whichever side that is for the current stage.
 *
 * Returns the camera's bank (roll) angle in radians, so CameraRig can
 * apply it via camera.up without this function needing to touch the
 * camera object directly.
 */
export function computeCameraPose(
  progress: number,
  elapsedTime: number,
  motionScale: number,
  biasMultiplier: number,
  outPosition: THREE.Vector3,
  outTarget: THREE.Vector3
): number {
  const truckU = clamp01(progress / TRUCK_END_PROGRESS);
  computeTruckPose(progress, truckPosition, truckTangent);
  right.crossVectors(truckTangent, UP).normalize();

  const offset = interpolateOffset(truckU);

  chasePosition
    .copy(truckPosition)
    .addScaledVector(truckTangent, -offset.back)
    .addScaledVector(right, offset.side * biasMultiplier)
    .addScaledVector(UP, offset.up);

  chaseTarget
    .copy(truckPosition)
    .addScaledVector(truckTangent, offset.lookAhead)
    .addScaledVector(right, -offset.targetBias * biasMultiplier);

  const tensionDistance = Math.abs(truckU - TENSION_CENTER_U) / TENSION_HALF_WIDTH;
  const tension = tensionDistance < 1 ? Math.cos((tensionDistance * Math.PI) / 2) * motionScale : 0;
  chasePosition.x += Math.sin(elapsedTime * 0.6) * 0.12 * tension;
  chasePosition.y += Math.sin(elapsedTime * 0.9 + 1.3) * 0.07 * tension;

  // Signed turn rate: the angle between the current tangent and one a
  // small step further along the curve, via cross/dot rather than a
  // difference of atan2(heading)s — the road runs close to due -z for
  // long stretches, which sits right on atan2's +-pi branch cut and
  // would otherwise produce a spurious near-2*pi spike in turnRate.
  TRUCK_CURVE.getTangent(clamp01(truckU + BANK_SAMPLE_DU), aheadTangent);
  const crossY = truckTangent.z * aheadTangent.x - truckTangent.x * aheadTangent.z;
  const dot = truckTangent.x * aheadTangent.x + truckTangent.z * aheadTangent.z;
  const turnRate = Math.atan2(crossY, dot);
  const bankAngle = THREE.MathUtils.clamp(turnRate * BANK_GAIN, -MAX_BANK_RADIANS, MAX_BANK_RADIANS) * motionScale;

  if (progress <= TRUCK_END_PROGRESS) {
    outPosition.copy(chasePosition);
    outTarget.copy(chaseTarget);
    return bankAngle;
  }

  const blend = smoothstep01((progress - TRUCK_END_PROGRESS) / (1 - TRUCK_END_PROGRESS));
  outPosition.copy(chasePosition).lerp(AERIAL_POSITION, blend);
  outTarget.copy(chaseTarget).lerp(AERIAL_TARGET, blend);
  return bankAngle * (1 - blend);
}

/** How far into the aerial pull-back we are (0 before it starts, 1 once
 * fully aerial) — used to widen fog so the wide reveal isn't washed out. */
export function getAerialBlend(progress: number): number {
  return smoothstep01((progress - TRUCK_END_PROGRESS) / (1 - TRUCK_END_PROGRESS));
}
