import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useSceneStore } from "../../store/useSceneStore";
import { computeFoundationCameraPose, type FoundationCameraPose } from "./foundationCamera";

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
  const shift = useRef(0);
  // On narrow screens the story text is a card along the bottom, so the
  // scene stays centred.
  const isMobile = useIsMobile();

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

    // Sideways framing shift (e.g. keep the scene left of the story text):
    // offsets the view window without moving or turning the camera.
    const targetShift = isMobile ? 0 : (pose.screenShift ?? 0);
    const nextShift = THREE.MathUtils.lerp(shift.current, targetShift, damp);
    if (Math.abs(nextShift) > 1e-4) {
      const { width, height } = state.size;
      const view = camera.view;
      const stale = !view?.enabled || view.fullWidth !== width || view.fullHeight !== height;
      if (stale || Math.abs(nextShift - shift.current) > 1e-5) {
        camera.setViewOffset(width, height, width * nextShift, 0, width, height);
      }
    } else if (camera.view?.enabled) {
      camera.clearViewOffset();
    }
    shift.current = Math.abs(nextShift) > 1e-4 ? nextShift : 0;

    forwardAxis.subVectors(lookAt.current, camera.position).normalize();
    bankedUp.set(0, 1, 0).applyAxisAngle(forwardAxis, bank.current);
    camera.up.copy(bankedUp);
    camera.lookAt(lookAt.current);

  });

  return null;
}
