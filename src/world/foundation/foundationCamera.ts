import * as THREE from "three";
import { JOURNEY_LENGTH } from "./journey";
import { getRoadPoint, getRoadRight, getRoadTangent, getRoadTurn, smoothstep, terrainHeight, truckRoadU } from "./sRoad";
import { STAGE1_FOCUS } from "../stages/stage1/stage1Layout";
import { STAGE2_FOCUS } from "../stages/stage2/stage2Layout";
import { TERRACE_TOP } from "../stages/stage2/stage2Geometry";
import { STAGE3_FOCUS } from "../stages/stage3/stage3Layout";
import { apronY } from "../stages/stage3/stage3Geometry";
import { STAGE4_FOCUS } from "../stages/stage4/stage4Layout";
import { paveY } from "../stages/stage4/stage4Geometry";
import { STAGE5_FOCUS } from "../stages/stage5/stage5Layout";

/**
 * Cinematic camera path for the 3D foundation: a pure function of scroll
 * progress that rides along the S-road with the truck. Each story stage
 * gets its own short sequence of shots (Stage 1 ≈ 0–20%, Stage 2 ≈ 25–45%,
 * Stage 3 ≈ 50–70%, Stage 4 ≈ 74–92%; Stage 5 runs on past progress 1 —
 * see journey.ts)
 * leaning toward that stage's focus point, then the journey continues and
 * lifts into a wide overview at the end. FoundationCameraRig damps toward this every
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
  /** 0–1 per stage: how far the aim leans from the road ahead toward that
   * stage's focus point (e.g. the heart of the farm), so a shot can frame
   * a place beside the road with the truck still in view. Omitted = pure
   * road chase. */
  focus?: Partial<Record<FocusId, number>>;
}

/** The world points stage-focused shots lean toward. */
const FOCUS_POINTS = {
  productOrigin: new THREE.Vector3(
    STAGE1_FOCUS.x,
    terrainHeight(STAGE1_FOCUS.x, STAGE1_FOCUS.z) + STAGE1_FOCUS.height,
    STAGE1_FOCUS.z
  ),
  productApproaches: new THREE.Vector3(STAGE2_FOCUS.x, TERRACE_TOP + STAGE2_FOCUS.height, STAGE2_FOCUS.z),
  awarenessSetup: new THREE.Vector3(STAGE3_FOCUS.x, apronY(STAGE3_FOCUS.x, STAGE3_FOCUS.z) + STAGE3_FOCUS.height, STAGE3_FOCUS.z),
  consumerExperience: new THREE.Vector3(STAGE4_FOCUS.x, paveY(STAGE4_FOCUS.x, STAGE4_FOCUS.z) + STAGE4_FOCUS.height, STAGE4_FOCUS.z),
  exhibition: new THREE.Vector3(STAGE5_FOCUS.x, paveY(STAGE5_FOCUS.x, STAGE5_FOCUS.z) + STAGE5_FOCUS.height, STAGE5_FOCUS.z),
};
type FocusId = keyof typeof FOCUS_POINTS;
const FOCUS_IDS = Object.keys(FOCUS_POINTS) as FocusId[];

const KEYFRAMES: CameraKeyframe[] = [
  // STAGE 1 — PRODUCT ORIGIN (≈ first 20% of the journey), a closer
  // three-beat sequence: farm → crops/producers/harvest → truck.
  // Establishing: from the outside of the bend, the farm fills the frame
  // with the truck in the foreground about to pass it.
  { at: 0.0, back: 4.0, up: 5.6, side: 5.2, lookAhead: 0.02, lookUp: 0.2, fov: 44, focus: { productOrigin: 0.6 } },
  // The truck passes the lane mouth: look across it into the yard —
  // producers at work, the produce stand, the harvest pallet by the road.
  { at: 0.06, back: 3.2, up: 3.9, side: 4.4, lookAhead: 0.01, lookUp: 0.25, fov: 42, focus: { productOrigin: 0.5 } },
  // Close rear three-quarter on the truck, drawn toward the market garden
  // and orchard right beside it.
  { at: 0.12, back: 5.0, up: 2.6, side: 3.4, lookAhead: 0.01, lookUp: 0.35, fov: 40, focus: { productOrigin: 0.22 } },
  // Releasing the farm: the aim swings back onto the road ahead.
  { at: 0.2, back: 5.6, up: 2.9, side: 2.4, lookAhead: 0.02, lookUp: 0.45, fov: 42, focus: { productOrigin: 0.04 } },
  // STAGE 2 — THE BASKETRY APPROACHES PRODUCTS (≈ 25–45%), after the
  // approved reference: the camera moves to the OUTSIDE of the bend (left
  // of travel) so the road and truck lie in the foreground and the
  // facility rises behind them, then closes in on the product evaluation.
  // Approach: lifting and drifting left as the facility comes into view.
  { at: 0.25, back: 6.5, up: 4.4, side: -1.6, lookAhead: 0.045, lookUp: 0.3, fov: 42, focus: { productApproaches: 0.2 } },
  // The reference view: high three-quarter from outside the bend — truck
  // on the road below, the terrace, hall, canopy and silos behind.
  { at: 0.31, back: 0.8, up: 5.0, side: -5.4, lookAhead: 0.015, lookUp: 0.2, fov: 38, focus: { productApproaches: 0.72 } },
  // Product evaluation: closer on the tables and the people around them,
  // the truck passing right below the wall.
  { at: 0.38, back: -0.8, up: 3.1, side: -4.1, lookAhead: 0, lookUp: 0.24, fov: 21.5, focus: { productApproaches: 0.95 } },
  // Moving on: back behind the truck, rejoining the journey.
  { at: 0.44, back: 5.2, up: 4.0, side: 0.6, lookAhead: 0.02, lookUp: 0.35, fov: 42, focus: { productApproaches: 0.12 } },
  // STAGE 3 — AWARENESS SETUP (≈ 50–70%), after the approved reference:
  // from the OUTSIDE of the bend (right of travel), the road in the
  // foreground, the journey truck driving on, and across it the parked
  // truck being unloaded beside the activation.
  // Approach: lifting out to the right as the village and activation appear.
  { at: 0.5, back: 6.0, up: 4.6, side: 2.6, lookAhead: 0.04, lookUp: 0.3, fov: 42, focus: { awarenessSetup: 0.3 } },
  // Establishing: high three-quarter across the road — the journey truck
  // arriving alongside the activation, the parked truck beyond it.
  { at: 0.565, back: 4.8, up: 5.0, side: 3.8, lookAhead: 0.02, lookUp: 0.2, fov: 40, focus: { awarenessSetup: 0.7 } },
  // Hero: the unloading and the activation being built, the journey truck
  // passing the parked one on the road in front.
  { at: 0.605, back: 3.6, up: 4.6, side: 4.0, lookAhead: 0, lookUp: 0.25, fov: 36, focus: { awarenessSetup: 0.74 } },
  // Moving on: back behind the journey truck as the road bends away.
  { at: 0.68, back: 5.0, up: 4.4, side: 1.8, lookAhead: 0.03, lookUp: 0.3, fov: 42, focus: { awarenessSetup: 0.08 } },
  // Bridge: exactly where the previous journey shot passed at 70%, so the
  // Stage 3 sequence before it is untouched.
  { at: 0.7, back: 5.194, up: 4.433, side: 1.811, lookAhead: 0.0303, lookUp: 0.3, fov: 42, focus: { awarenessSetup: 0.0756 } },
  // STAGE 4 — CONSUMER EXPERIENCE (≈ 74–92%), after the approved reference:
  // the road enters the city; from the LEFT of the road (outside of the next
  // bend), the road and journey truck in front, the busy activation on the
  // plaza to the right, apartments and offices behind.
  // Approach: swinging out to the left as the district comes into view.
  { at: 0.775, back: 6.2, up: 5.2, side: -2.6, lookAhead: 0.04, lookUp: 0.3, fov: 42, focus: { consumerExperience: 0.35 } },
  // Hero: the journey truck arriving alongside the plaza — consumers at the
  // counter, tables and shelves; the second truck beyond with more stock.
  { at: 0.845, back: 3.2, up: 4.2, side: -3.0, lookAhead: 0.01, lookUp: 0.25, fov: 34, focus: { consumerExperience: 0.78 } },
  // Moving on: back behind the journey truck as the road bends away.
  { at: 0.905, back: 5.6, up: 4.8, side: -1.2, lookAhead: 0.03, lookUp: 0.3, fov: 42, focus: { consumerExperience: 0.12 } },
  // STAGE 5 — MORE ACTIVATIONS & EXHIBITIONS (journey ≈ 0.95–1.08), after
  // the approved reference: from the INSIDE of the hard right bend (right
  // of travel), the road and journey truck in front, the exhibition fanned
  // across the outside of the bend on the left, the Ferris wheel and the
  // lit skyline behind.
  // Approach: the wheel and the first stalls rising ahead.
  { at: 0.965, back: 6.5, up: 5.6, side: 4.6, lookAhead: 0.04, lookUp: 0.3, fov: 42, focus: { exhibition: 0.45 } },
  // Hero: the journey truck arriving at the event — several activations,
  // crowds, trucks unloading, the wheel.
  { at: 1.01, back: 4.0, up: 6.2, side: 6.0, lookAhead: 0.012, lookUp: 0.3, fov: 42, focus: { exhibition: 0.7 } },
  // Moving on: the truck heads on round the bend, the exhibition receding on the left.
  { at: 1.06, back: 4.6, up: 5.2, side: 3.2, lookAhead: 0.02, lookUp: 0.3, fov: 42, focus: { exhibition: 0.35 } },
  // Lift into a wide overview of the miniature world.
  { at: JOURNEY_LENGTH, back: 16, up: 14, side: 5.0, lookAhead: 0.02, lookUp: 0, fov: 38 },
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
      const focus: Partial<Record<FocusId, number>> = {};
      for (const id of FOCUS_IDS) {
        const weight = THREE.MathUtils.lerp(a.focus?.[id] ?? 0, b.focus?.[id] ?? 0, t);
        if (weight > 0) focus[id] = weight;
      }
      f.focus = focus;
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
  const p = THREE.MathUtils.clamp(progress, 0, JOURNEY_LENGTH);
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
  for (const id of FOCUS_IDS) {
    const weight = frame.focus?.[id];
    if (weight) out.target.lerp(FOCUS_POINTS[id], weight);
  }

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
