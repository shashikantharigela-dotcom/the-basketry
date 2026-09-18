import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PointLight } from "three";
import { computeCameraPose, getAerialBlend } from "../world/worldPath";
import { getTextSideMultiplier } from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";

const targetPosition = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();
const bankedUp = new THREE.Vector3();
const forwardAxis = new THREE.Vector3();

/** Drives the camera continuously along the world path (see
 * worldPath.ts) — chasing the truck with a slowly-varying cinematic
 * offset, then blending into the aerial ecosystem reveal. There is no
 * per-stage snap here: the whole point is one continuous shot. */
export function CameraRig() {
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentBank = useRef(0);
  const fillLightRef = useRef<PointLight>(null);

  useFrame((state, delta) => {
    const progress = useSceneStore.getState().progress;
    const motionScale = useSceneStore.getState().motionScale;
    const t = THREE.MathUtils.clamp(progress, 0, 1);
    const biasMultiplier = getTextSideMultiplier(t);

    const bankAngle = computeCameraPose(
      t,
      state.clock.elapsedTime,
      motionScale,
      biasMultiplier,
      targetPosition,
      targetLookAt
    );

    // Damp rather than snap, so the dolly reads as cinematic rather than
    // scrollbar-attached.
    const dampFactor = 1 - Math.pow(0.001, delta);
    state.camera.position.lerp(targetPosition, dampFactor);
    currentLookAt.current.lerp(targetLookAt, dampFactor);
    currentBank.current = THREE.MathUtils.lerp(currentBank.current, bankAngle, dampFactor);

    // Roll the camera a few degrees into turns (banked around its own
    // look direction) before the final lookAt, rather than always
    // using a level world-up — a vehicle actually leaning through a
    // curve is part of what makes this read as a real drive.
    forwardAxis.subVectors(currentLookAt.current, state.camera.position).normalize();
    bankedUp.set(0, 1, 0).applyAxisAngle(forwardAxis, currentBank.current);
    state.camera.up.copy(bankedUp);
    state.camera.lookAt(currentLookAt.current);

    // A soft fill/highlight light that travels with the camera, so every
    // stop along the drive gets a gentle specular pop on the glossy
    // materials regardless of how far it sits along the route.
    if (fillLightRef.current) {
      fillLightRef.current.position.set(
        state.camera.position.x - 1.5,
        state.camera.position.y + 1.2,
        state.camera.position.z
      );
    }

    // Widen the fog for the aerial reveal — the same near/far values that
    // read as cinematic depth at truck height would wash out a high wide
    // shot of the whole world.
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      const aerial = getAerialBlend(t);
      fog.near = THREE.MathUtils.lerp(9, 16, aerial);
      fog.far = THREE.MathUtils.lerp(34, 140, aerial);
    }
  });

  return <pointLight ref={fillLightRef} intensity={1.8} distance={13} decay={2} color="#ffffff" />;
}
