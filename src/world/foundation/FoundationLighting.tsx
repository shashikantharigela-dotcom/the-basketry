import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { DirectionalLight, Group } from "three";
import { useSceneStore } from "../../store/useSceneStore";
import { isNarrowViewport } from "../../hooks/useIsMobile";
import { getRoadPoint, truckRoadU } from "./sRoad";
import { getOverviewBlend } from "./foundationCamera";
import { Backdrop } from "../../canvas/Backdrop";
import type { SkyStops } from "../../canvas/skyStops";

const lod = isNarrowViewport();
const SHADOW_MAP_SIZE = lod ? 1024 : 2048;
/** Half-size of the key light's shadow frustum — kept tight around the truck for crisp miniature shadows. */
const SHADOW_EXTENT = 18;
/** Sun direction relative to the truck: high, from front-left, so shadows fall back-right toward camera. */
const SUN_OFFSET = new THREE.Vector3(-7, 12, -5);

/** Warm natural sky: a soft, slightly cool zenith easing into a warm
 * cream-peach haze at the horizon (which the fog matches, so distant
 * land dissolves into atmosphere rather than ending at an edge). */
const NATURAL_SKY: SkyStops = [
  [0, "#bfcfd4"],
  [0.22, "#d3dad6"],
  [0.4, "#ebe3d6"],
  [0.48, "#f6e7d4"],
  [0.52, "#f2dcc4"],
  [1, "#e6cdb0"],
];
const HAZE = "#f1e0cb";

const focus = new THREE.Vector3();

/**
 * Premium miniature-world lighting: a warm, low-angle sun with soft
 * contact shadows that travels with the truck (so shadow resolution stays
 * high everywhere along the road), a warm sky/earth hemisphere bounce, a
 * soft rim light to separate forms from the terrain, and
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

    // Atmospheric haze: distant land softens into the warm horizon rather
    // than ending at an edge; opened up further for the closing overview.
    const fog = state.scene.fog as THREE.Fog | null;
    if (fog) {
      const overview = getOverviewBlend(progress);
      fog.near = THREE.MathUtils.lerp(20, 32, overview);
      fog.far = THREE.MathUtils.lerp(110, 150, overview);
    }

    // Dust stays around the camera so there's always atmosphere in frame.
    if (dustRef.current) dustRef.current.position.copy(state.camera.position);
  });

  const motionScale = useSceneStore((state) => state.motionScale);

  return (
    <>
      <color attach="background" args={[HAZE]} />
      <fog attach="fog" args={[HAZE, 20, 110]} />
      <Backdrop stops={NATURAL_SKY} />

      <hemisphereLight args={["#ffe3d2", "#9c5a3a", 0.8]} />
      <ambientLight intensity={0.12} color="#fff8ed" />

      <directionalLight
        ref={sunRef}
        intensity={2.6}
        color="#ffe6c4"
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
