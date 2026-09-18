import * as THREE from "three";

export type StageId = "products" | "brand" | "basketry";

export interface StageConfig {
  id: StageId;
  label: string;
  sublabel: string;
  /** Where this stage is centered on the 0–1 scroll timeline. */
  progressCenter: number;
  /** Object position in world space. */
  objectPosition: [number, number, number];
  /** Camera keyframe the path passes through for this stage. */
  cameraPoint: [number, number, number];
}

// Single source of truth for Phase 0's three-stage path:
// PRODUCTS -> BRAND -> THE BASKETRY
export const STAGES: StageConfig[] = [
  {
    id: "products",
    label: "PRODUCTS",
    sublabel: "Scattered. Isolated. Waiting to be found.",
    progressCenter: 0,
    objectPosition: [-1.4, 0, 6],
    cameraPoint: [0, 1.2, 10],
  },
  {
    id: "brand",
    label: "BRAND",
    sublabel: "A story without a way to reach its people.",
    progressCenter: 0.5,
    objectPosition: [1.6, 0.4, -2],
    cameraPoint: [0, 1.6, 2],
  },
  {
    id: "basketry",
    label: "THE BASKETRY",
    sublabel: "The connection layer for the whole ecosystem.",
    progressCenter: 1,
    objectPosition: [0, 0.2, -12],
    cameraPoint: [0, 2.1, -8],
  },
];

// Camera dolly path — a smooth spline through each stage's camera point.
// Phase 1 will extend this with more keyframes for the remaining four acts.
export const CAMERA_CURVE = new THREE.CatmullRomCurve3(
  STAGES.map((s) => new THREE.Vector3(...s.cameraPoint)),
  false,
  "catmullrom",
  0.4
);

// The point the camera looks toward, interpolated the same way as position
// so gaze and dolly stay in sync across the path.
export const LOOKAT_CURVE = new THREE.CatmullRomCurve3(
  STAGES.map((s) => new THREE.Vector3(...s.objectPosition)),
  false,
  "catmullrom",
  0.4
);

export function getStageOpacity(stage: StageConfig, progress: number): number {
  // Each stage's text is fully visible near its own progressCenter and
  // fades out toward the neighboring stages.
  const distance = Math.abs(progress - stage.progressCenter);
  const band = 0.22; // how wide the fully-visible window is
  const fade = 0.16; // how wide the fade transition is
  if (distance <= band) return 1;
  if (distance >= band + fade) return 0;
  return 1 - (distance - band) / fade;
}
