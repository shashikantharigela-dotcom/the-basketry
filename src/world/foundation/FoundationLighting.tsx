import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { DirectionalLight, Group } from "three";
import { useSceneStore } from "../../store/useSceneStore";
import { isNarrowViewport } from "../../hooks/useIsMobile";
import { getRoadPoint, truckRoadU } from "./sRoad";

const lod = isNarrowViewport();
const SHADOW_MAP_SIZE = lod ? 1024 : 2048;
/** Half-size of the key light's shadow frustum — kept tight around the truck for crisp miniature shadows. */
const SHADOW_EXTENT = 14;
/** Sun direction relative to the truck: high, from front-left, so shadows fall back-right toward camera. */
const SUN_OFFSET = new THREE.Vector3(-7, 12, -5);

const focus = new THREE.Vector3();

/**
 * Premium miniature-world lighting: a warm, low-angle sun with soft
 * contact shadows that travels with the truck (so shadow resolution stays
 * high everywhere along the road), a red sky/ground hemisphere matching
 * the Red World, a cool rim light to separate forms from the terrain, and
 * a drift of fine cream dust in the air for depth.
 */
export function FoundationLighting() {
  const sunRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<DirectionalLight>(null);
  const dustRef = useRef<Group>(null);

  useFrame((state) => {
    const progress = useSceneStore.getState().progress;
    getRoadPoint(truckRoadU(progress), focus);

    const sun = sunRef.current;
    if (sun) {
      sun.position.copy(focus).add(SUN_OFFSET);
      sun.target.position.copy(focus);
      sun.target.updateMatrixWorld();
    }

    const rim = rimRef.current;
    if (rim) {
      rim.position.set(focus.x + 6, focus.y + 5, focus.z + 9);
      rim.target.position.copy(focus);
      rim.target.updateMatrixWorld();
    }

    // Dust stays around the camera so there's always atmosphere in frame.
    if (dustRef.current) dustRef.current.position.copy(state.camera.position);
  });

  const motionScale = useSceneStore((state) => state.motionScale);

  return (
    <>
      <color attach="background" args={["#f20d16"]} />
      <fog attach="fog" args={["#b90710", 14, 55]} />

      <hemisphereLight args={["#ff6a5c", "#8f050c", 0.7]} />
      <ambientLight intensity={0.12} color="#fff8ed" />

      <directionalLight
        ref={sunRef}
        intensity={2.4}
        color="#fff1e0"
        castShadow
        shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={4}
      />
      <directionalLight ref={rimRef} intensity={0.9} color="#ffe9e4" />

      <group ref={dustRef}>
        <Sparkles
          count={lod ? 40 : 90}
          scale={[22, 8, 22]}
          size={2.2}
          speed={0.25 * motionScale}
          opacity={0.55}
          color="#fff8ed"
          noise={0.6}
        />
      </group>
    </>
  );
}
