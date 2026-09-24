import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "../../store/useSceneStore";
import { computeFoundationCameraPose, getOverviewBlend, type FoundationCameraPose } from "./foundationCamera";

const pose: FoundationCameraPose = {
  position: new THREE.Vector3(),
  target: new THREE.Vector3(),
  bank: 0,
  fov: 42,
};
const forwardAxis = new THREE.Vector3();
const bankedUp = new THREE.Vector3();

/** Scroll-driven cinematic camera for the foundation world. Scroll
 * progress is already scrubbed by ScrollTrigger (see NarrativeController);
 * on top of that the camera eases toward its target pose each frame, so
 * the move reads as a smooth dolly rather than being bolted to the
 * scrollbar. */
export function FoundationCameraRig() {
  const lookAt = useRef(new THREE.Vector3());
  const bank = useRef(0);
  const initialized = useRef(false);

  useFrame((state, delta) => {
    const { progress, motionScale } = useSceneStore.getState();
    computeFoundationCameraPose(progress, state.clock.elapsedTime, motionScale, pose);

    const camera = state.camera as THREE.PerspectiveCamera;

    // Snap on the very first frame so the page doesn't open on a swoop in
    // from the Canvas's default camera position.
    const damp = initialized.current ? 1 - Math.pow(0.02, Math.min(delta, 0.1)) : 1;
    initialized.current = true;

    camera.position.lerp(pose.position, damp);
    lookAt.current.lerp(pose.target, damp);
    bank.current = THREE.MathUtils.lerp(bank.current, pose.bank, damp);

    const fov = THREE.MathUtils.lerp(camera.fov, pose.fov, damp);
    if (Math.abs(fov - camera.fov) > 1e-3) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    forwardAxis.subVectors(lookAt.current, camera.position).normalize();
    bankedUp.set(0, 1, 0).applyAxisAngle(forwardAxis, bank.current);
    camera.up.copy(bankedUp);
    camera.lookAt(lookAt.current);

    // Open the fog up for the closing overview so the wide shot isn't washed out.
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      const overview = getOverviewBlend(progress);
      fog.near = THREE.MathUtils.lerp(14, 26, overview);
      fog.far = THREE.MathUtils.lerp(55, 110, overview);
    }
  });

  return null;
}
