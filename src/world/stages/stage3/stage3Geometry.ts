import * as THREE from "three";
import { getRoadRight, ROAD_CURVE } from "../../foundation/sRoad";
import { groundY } from "../common/placement";
import { roadOffsetLine, roadOffsetPoint } from "../stage2/stage2Geometry";
import { APRON, BUNTING_POLES, PARKED_TRUCK, PULL_OFF, type ApronPlacement } from "./stage3Layout";

/**
 * Stage 3 geometry that must follow the road exactly — resolved from the
 * shared road curve at load (the same helpers Stage 2 uses).
 */

const tangent = new THREE.Vector3();
const right = new THREE.Vector3();

/** World x, z and yaw for a road-relative placement. Yaw 0 faces across
 * the road toward its right side (the camera side in Stage 3). */
export function resolvePlacement(p: ApronPlacement): { x: number; z: number; yaw: number } {
  const [x, z] = roadOffsetPoint(p.u, p.offset);
  getRoadRight(p.u, right);
  return { x, z, yaw: Math.atan2(right.x, right.z) + (p.yaw ?? 0) };
}

/** A strip of ground surface between two road offsets, draped on the terrain,
 * tapered at both ends so it merges into the verge like a real pull-off. */
function buildStrip(uFrom: number, uTo: number, near: number, far: number, lift: number, taper: number): THREE.BufferGeometry {
  const steps = 40;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = uFrom + (uTo - uFrom) * t;
    // Ease the far edge in toward the road at both ends.
    const ease = Math.min(1, t / taper, (1 - t) / taper);
    const smooth = ease * ease * (3 - 2 * ease);
    const farOffset = near + (far - near) * (0.35 + 0.65 * smooth);
    for (const offset of [near, farOffset]) {
      const [x, z] = roadOffsetPoint(u, offset);
      positions.push(x, groundY(x, z) + lift, z);
    }
    if (i < steps) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export const APRON_LIFT = 0.022;
export const APRON_GEOMETRY = buildStrip(APRON.uFrom, APRON.uTo, APRON.offsetNear, APRON.offsetFar, APRON_LIFT, 0.18);
export const PULL_OFF_GEOMETRY = buildStrip(PULL_OFF.uFrom, PULL_OFF.uTo, PULL_OFF.offsetNear, PULL_OFF.offsetFar, APRON_LIFT + 0.002, 0.3);

/** Height of the apron surface at a world x/z. */
export function apronY(x: number, z: number): number {
  return groundY(x, z) + APRON_LIFT;
}

/** Post-and-rail fences along both sides of the road through Stage 3 — open
 * on the apron side where the activation and the pull-off meet the road. */
export const STAGE3_FENCES: Array<Array<[number, number]>> = [
  // Outside of the bend (camera side), all the way along.
  roadOffsetLine(0.47, 0.66, 1.3, 40),
  // Apron side: before the activation and after the pull-off only.
  roadOffsetLine(0.47, APRON.uFrom - 0.004, -1.3, 10),
  roadOffsetLine(PULL_OFF.uTo + 0.004, 0.66, -1.3, 12),
];

/** Black-and-white striped roadside marker posts. */
export const STAGE3_MARKER_POSTS: Array<[number, number]> = [
  ...roadOffsetLine(0.47, 0.66, 1.16, 22),
  ...roadOffsetLine(0.47, APRON.uFrom - 0.006, -1.16, 5),
  ...roadOffsetLine(PULL_OFF.uTo + 0.006, 0.66, -1.16, 6),
];

/** A loose planted border just beyond the apron's back edge — flowering
 * shrubs, bougainvillea and bananas framing the activation. */
export const APRON_EDGE_PLANTING: Array<[number, number]> = roadOffsetLine(
  APRON.uFrom + 0.004,
  APRON.uTo - 0.004,
  APRON.offsetFar - 0.32,
  16
);

/** The parked truck's fixed pose, in the same form the journey truck uses. */
export const PARKED_TRUCK_POSE = (() => {
  const position = new THREE.Vector3();
  const along = new THREE.Vector3();
  const [x, z] = roadOffsetPoint(PARKED_TRUCK.u, PARKED_TRUCK.offset);
  ROAD_CURVE.getTangentAt(PARKED_TRUCK.u, tangent);
  along.set(tangent.x, 0, tangent.z).normalize();
  position.set(x, groundY(x, z) + APRON_LIFT, z);
  return { position, tangent: along };
})();

/** Bunting: gently sagging strings between the poles, with pennant positions. */
export const BUNTING_POLE_POSITIONS = BUNTING_POLES.map((pole) => {
  const [x, z] = roadOffsetPoint(pole.u, pole.offset);
  return new THREE.Vector3(x, apronY(x, z), z);
});
