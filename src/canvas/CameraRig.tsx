import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_CURVE, LOOKAT_CURVE } from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";

const targetPosition = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();

export function CameraRig() {
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const progress = useSceneStore.getState().progress;
    const t = THREE.MathUtils.clamp(progress, 0, 1);

    CAMERA_CURVE.getPointAt(t, targetPosition);
    LOOKAT_CURVE.getPointAt(t, targetLookAt);

    // Damp rather than snap, so the dolly reads as cinematic rather than
    // scrollbar-attached (see blueprint §4/§8).
    const dampFactor = 1 - Math.pow(0.001, delta);
    state.camera.position.lerp(targetPosition, dampFactor);
    currentLookAt.current.lerp(targetLookAt, dampFactor);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}
