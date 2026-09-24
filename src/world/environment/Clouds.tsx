import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useSceneStore } from "../../store/useSceneStore";
import { createRandom } from "../stages/common/placement";

/** Follows the camera closely (like the mountains) so the cloud band always
 * stays out ahead of the drive, never overhead of the camera. */
const PARALLAX_FOLLOW = 0.92;
const CLOUD_COUNT = 8;
const PUFF_GEOMETRY = new THREE.IcosahedronGeometry(1, 3);
const MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#fff1e4",
  emissiveIntensity: 0.6,
  roughness: 1,
  metalness: 0,
  transparent: true,
  opacity: 0.92,
  fog: false,
});

/** Soft, stylized cumulus clusters drifting above the world ahead of the drive, on a
 * slow-parallax layer so they read as atmospheric depth, not props. */
export function Clouds() {
  const groupRef = useRef<Group>(null);
  const driftRef = useRef<Group>(null);

  const clouds = useMemo(() => {
    const random = createRandom(9001);
    return Array.from({ length: CLOUD_COUNT }, (_, i) => {
      // A band ahead of the camera (the drive always heads toward -z).
      const angle = Math.PI + ((i / (CLOUD_COUNT - 1)) - 0.5) * 2.4 + (random() - 0.5) * 0.2;
      const radius = 46 + random() * 20;
      const puffs = Array.from({ length: 4 + Math.floor(random() * 4) }, (_, k) => ({
        position: [(k - 2.5) * 1.6 + (random() - 0.5) * 1.2, (random() - 0.3) * 0.9, (random() - 0.5) * 1.6] as [
          number,
          number,
          number,
        ],
        scale: 0.9 + random() * 0.9,
      }));
      return {
        position: [Math.sin(angle) * radius, 10 + random() * 5, Math.cos(angle) * radius] as [number, number, number],
        scale: 0.7 + random() * 0.4,
        puffs,
      };
    });
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.set(state.camera.position.x * PARALLAX_FOLLOW, 0, state.camera.position.z * PARALLAX_FOLLOW);
    }
    if (driftRef.current) {
      driftRef.current.rotation.y += delta * 0.006 * useSceneStore.getState().motionScale;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={driftRef}>
        {clouds.map((cloud, i) => (
          <group key={i} position={cloud.position} scale={[cloud.scale * 1.3, cloud.scale * 0.7, cloud.scale]}>
            {cloud.puffs.map((puff, k) => (
              <mesh key={k} geometry={PUFF_GEOMETRY} material={MATERIAL} position={puff.position} scale={puff.scale} />
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}
