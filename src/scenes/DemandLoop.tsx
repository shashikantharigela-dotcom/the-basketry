import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { getStage } from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";

const TRACK_GEOMETRY = new THREE.TorusGeometry(2.2, 0.04, 16, 96);
const TRACK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.15 });

const ORB_GEOMETRY = new THREE.SphereGeometry(0.14, 24, 24);
const ORB_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.2,
  metalness: 0.15,
  emissive: "#f20d16",
  emissiveIntensity: 0.45,
});

const ARROW_GEOMETRY = new THREE.ConeGeometry(0.12, 0.26, 12);
const ARROW_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.25, metalness: 0.1 });

const ORB_COUNT = 4;
const ARROW_COUNT = 4;
const RADIUS = 2.2;
const TRACK_TILT = 0.35;

/** Demand doesn't just flow one way — a ring of orbs travels backward
 * around the loop (consumer -> business -> Basketry -> brand), with
 * fixed arrow markers reading the direction at a glance. Motion speed
 * respects the shared motionScale (reduced-motion), never the scroll
 * dolly itself. */
export function DemandLoop() {
  const stage = getStage("demandLoop");
  const orbRefs = useRef<Array<Group | null>>([]);

  const orbAngles = useMemo(() => Array.from({ length: ORB_COUNT }, (_, i) => (i / ORB_COUNT) * Math.PI * 2), []);
  const arrowAngles = useMemo(() => Array.from({ length: ARROW_COUNT }, (_, i) => (i / ARROW_COUNT) * Math.PI * 2), []);

  useFrame((state) => {
    const motionScale = useSceneStore.getState().motionScale;
    const t = state.clock.elapsedTime * motionScale;

    orbAngles.forEach((baseAngle, i) => {
      const angle = baseAngle - t * 0.35;
      const x = Math.cos(angle) * RADIUS;
      const z = Math.sin(angle) * RADIUS;
      const orb = orbRefs.current[i];
      if (orb) orb.position.set(x, 0, z);
    });
  });

  return (
    <group position={stage.anchor} rotation={[TRACK_TILT, 0, 0]}>
      <mesh geometry={TRACK_GEOMETRY} material={TRACK_MATERIAL} />

      {arrowAngles.map((angle, i) => {
        const x = Math.cos(angle) * RADIUS;
        const z = Math.sin(angle) * RADIUS;
        return (
          <mesh
            key={i}
            geometry={ARROW_GEOMETRY}
            material={ARROW_MATERIAL}
            position={[x, 0, z]}
            rotation={[Math.PI / 2, 0, -angle]}
          />
        );
      })}

      {orbAngles.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            orbRefs.current[i] = el;
          }}
        >
          <mesh geometry={ORB_GEOMETRY} material={ORB_MATERIAL} />
        </group>
      ))}
    </group>
  );
}
