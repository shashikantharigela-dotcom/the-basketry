import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PointLight } from "three";
import {
  CAMERA_CURVE,
  LOOKAT_CURVE,
  getStage,
  getStageLocalProgress,
} from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";

const targetPosition = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();
const disconnectedStage = getStage("disconnected");

export function CameraRig() {
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const fillLightRef = useRef<PointLight>(null);

  useFrame((state, delta) => {
    const progress = useSceneStore.getState().progress;
    const t = THREE.MathUtils.clamp(progress, 0, 1);

    CAMERA_CURVE.getPointAt(t, targetPosition);
    LOOKAT_CURVE.getPointAt(t, targetLookAt);

    // A touch of handheld-style tension while the story is at its most
    // fragmented, peaking at the Disconnected Journey stage's center and
    // fading back to a steady dolly everywhere else — never a random spin.
    const localDisconnect = getStageLocalProgress(disconnectedStage, t);
    const tension = Math.sin(localDisconnect * Math.PI);
    const elapsed = state.clock.elapsedTime;
    targetPosition.x += Math.sin(elapsed * 0.6) * 0.1 * tension;
    targetPosition.y += Math.sin(elapsed * 0.9 + 1.3) * 0.06 * tension;

    // Damp rather than snap, so the dolly reads as cinematic rather than
    // scrollbar-attached (see blueprint §4/§8).
    const dampFactor = 1 - Math.pow(0.001, delta);
    state.camera.position.lerp(targetPosition, dampFactor);
    currentLookAt.current.lerp(targetLookAt, dampFactor);
    state.camera.lookAt(currentLookAt.current);

    // A soft fill/highlight light that travels with the camera, so every
    // stage gets a gentle specular pop on the glossy materials regardless
    // of how far it sits along the ~40-unit dolly track.
    if (fillLightRef.current) {
      fillLightRef.current.position.set(
        state.camera.position.x - 1.5,
        state.camera.position.y + 1.2,
        state.camera.position.z
      );
    }
  });

  return <pointLight ref={fillLightRef} intensity={1.8} distance={13} decay={2} color="#ffffff" />;
}
