import * as THREE from "three";
import { getRoadPoint, getRoadRight, getRoadTangent, getRoadTurn, smoothstep, terrainHeight, truckRoadU } from "./sRoad";
import { STAGE1_FOCUS } from "../stages/stage1/stage1Layout";

/**
 * Cinematic camera path for the 3D foundation: a pure function of scroll
 * progress that rides along the S-road with the truck. It opens on a
 * high establishing shot, settles into a low chase, and lifts back into
 * a wide overview at the end. FoundationCameraRig damps toward this every
 * frame — nothing here is smoothed or stateful.
 *
 * Framing is keyed by scroll progress, not by story stage, so future
 * stages can add their own keyframes here without touching the road.
 */

interface CameraKeyframe {
  /** Global scroll progress (0–1). */
  at: number;
  /** Distance behind the truck, along the road. */
  back: number;
  /** Height above the road. */
  up: number;
  /** Extra lateral offset to the right of travel (negative = left). */
  side: number;
  /** How far ahead of the truck (in road u) the camera looks. */
  lookAhead: number;
  /** Height of the look-at point above the road. */
  lookUp: number;
  fov: number;
  /** 0–1: how far the aim leans from the road ahead toward the stage's
   * focus point (e.g. the heart of the farm), so a shot can frame a place
   * beside the road with the truck still in view. 0 = pure road chase. */
  focus?: number;
}

/** The world point stage-focused shots lean toward. */
const FOCUS_POINT = new THREE.Vector3(
  STAGE1_FOCUS.x,
  terrainHeight(STAGE1_FOCUS.x, STAGE1_FOCUS.z) + STAGE1_FOCUS.height,
  STAGE1_FOCUS.z
);

const KEYFRAMES: CameraKeyframe[] = [
  // STAGE 1 — PRODUCT ORIGIN (≈ first 20% of the journey), a closer
  // three-beat sequence: farm → crops/producers/harvest → truck.
  // Establishing: from the outside of the bend, the farm fills the frame
  // with the truck in the foreground about to pass it.
  { at: 0.0, back: 4.0, up: 5.6, side: 5.2, lookAhead: 0.02, lookUp: 0.2, fov: 44, focus: 0.6 },
  // The truck passes the lane mouth: look across it into the yard —
  // producers at work, the produce stand, the harvest pallet by the road.
  { at: 0.06, back: 3.2, up: 3.9, side: 4.4, lookAhead: 0.01, lookUp: 0.25, fov: 42, focus: 0.5 },
  // Close rear three-quarter on the truck, drawn toward the market garden
  // and orchard right beside it.
  { at: 0.12, back: 5.0, up: 2.6, side: 3.4, lookAhead: 0.01, lookUp: 0.35, fov: 40, focus: 0.22 },
  // Releasing the farm: the aim swings back onto the road ahead.
  { at: 0.2, back: 5.6, up: 2.9, side: 2.4, lookAhead: 0.02, lookUp: 0.45, fov: 42, focus: 0.04 },
  // Low cinematic chase through the bends.
  { at: 0.35, back: 6.2, up: 3.2, side: 1.6, lookAhead: 0.028, lookUp: 0.5, fov: 44 },
  // Pass alongside in a side profile, keeping distance so the truck stays framed during the swing.
  { at: 0.48, back: 0.5, up: 3.0, side: 4.6, lookAhead: 0.004, lookUp: 0.35, fov: 42 },
  // Swing around the side to a front three-quarter view of the cab (negative back = ahead of the truck).
  { at: 0.6, back: -4.8, up: 2.3, side: 3.2, lookAhead: 0, lookUp: 0.4, fov: 40 },
  { at: 0.82, back: 8.5, up: 5.0, side: 2.0, lookAhead: 0.035, lookUp: 0.3, fov: 42 },
  // Lift into a wide overview of the miniature world.
  { at: 1.0, back: 16, up: 14, side: 5.0, lookAhead: 0.02, lookUp: 0, fov: 38 },
];

/** How strongly the camera swings to the outside of a bend (world units per radian of turn). */
const OUTSIDE_SWING = 5;
const MAX_OUTSIDE_SWING = 2.2;
/** Camera roll into bends, like a vehicle leaning through a curve. */
const BANK_GAIN = 0.28;
const MAX_BANK = THREE.MathUtils.degToRad(6);

const scratchFrame: CameraKeyframe = { ...KEYFRAMES[0] };

function interpolate(progress: number): CameraKeyframe {
  if (progress <= KEYFRAMES[0].at) return KEYFRAMES[0];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    if (progress <= b.at) {
      const t = smoothstep(a.at, b.at, progress);
      const f = scratchFrame;
      f.at = progress;
      f.back = THREE.MathUtils.lerp(a.back, b.back, t);
      f.up = THREE.MathUtils.lerp(a.up, b.up, t);
      f.side = THREE.MathUtils.lerp(a.side, b.side, t);
      f.lookAhead = THREE.MathUtils.lerp(a.lookAhead, b.lookAhead, t);
      f.lookUp = THREE.MathUtils.lerp(a.lookUp, b.lookUp, t);
      f.fov = THREE.MathUtils.lerp(a.fov, b.fov, t);
      f.focus = THREE.MathUtils.lerp(a.focus ?? 0, b.focus ?? 0, t);
      return f;
    }
  }
  return KEYFRAMES[KEYFRAMES.length - 1];
}

export interface FoundationCameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  /** Roll around the view axis, radians. */
  bank: number;
  fov: number;
}

const truckPoint = new THREE.Vector3();
const truckTangent = new THREE.Vector3();
const right = new THREE.Vector3();
const flatTangent = new THREE.Vector3();

/** Raw (undamped) camera pose for a given scroll progress. */
export function computeFoundationCameraPose(
  progress: number,
  elapsedTime: number,
  motionScale: number,
  out: FoundationCameraPose
): FoundationCameraPose {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const frame = interpolate(p);
  const u = truckRoadU(p);

  getRoadPoint(u, truckPoint);
  getRoadTangent(u, truckTangent);
  getRoadRight(u, right);
  flatTangent.set(truckTangent.x, 0, truckTangent.z).normalize();

  // Swing toward the outside of upcoming bends so turns open up in frame
  // instead of the road disappearing behind the truck.
  const turn = getRoadTurn(Math.min(1, u + 0.02), 0.02);
  // (turn > 0 is a left bend, whose outside is to the right.)
  const outside = THREE.MathUtils.clamp(turn * OUTSIDE_SWING, -MAX_OUTSIDE_SWING, MAX_OUTSIDE_SWING);

  out.position
    .copy(truckPoint)
    .addScaledVector(flatTangent, -frame.back)
    .addScaledVector(right, frame.side + outside);
  out.position.y = truckPoint.y + frame.up;

  getRoadPoint(Math.min(1, u + frame.lookAhead), out.target);
  out.target.y += frame.lookUp;
  if (frame.focus) out.target.lerp(FOCUS_POINT, frame.focus);

  // Subtle handheld "breathing" — scaled away for reduced motion.
  out.position.x += Math.sin(elapsedTime * 0.35) * 0.08 * motionScale;
  out.position.y += Math.sin(elapsedTime * 0.5 + 1.1) * 0.05 * motionScale;

  out.bank = THREE.MathUtils.clamp(turn * BANK_GAIN, -MAX_BANK, MAX_BANK) * motionScale;
  out.fov = frame.fov;
  return out;
}

/** 0 during the chase, rising to 1 across the closing overview — used to widen fog. */
export function getOverviewBlend(progress: number): number {
  return smoothstep(0.82, 1, progress);
}
