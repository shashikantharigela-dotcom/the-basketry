import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Group, BufferGeometry, Material } from "three";
import { getStage } from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";
import { isNarrowViewport } from "../hooks/useIsMobile";

const lod = isNarrowViewport();

const PLAZA_GEOMETRY = new THREE.CylinderGeometry(2.4, 2.5, 0.14, lod ? 32 : 64);
const PLAZA_RIM_GEOMETRY = new THREE.TorusGeometry(2.42, 0.035, 12, lod ? 32 : 64);
const CORE_GEOMETRY = new THREE.CylinderGeometry(0.55, 0.62, 0.55, lod ? 20 : 32);

const RIB_RADIUS = 1.15;
const RIB_COUNT = 7;
const RIB_GEOMETRY = new THREE.TorusGeometry(RIB_RADIUS, 0.032, 8, lod ? 24 : 32, Math.PI);

const PLAZA_MATERIAL = new THREE.MeshStandardMaterial({ color: "#b90710", roughness: 0.5, metalness: 0.2 });
const RIM_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.25,
  metalness: 0.12,
  emissive: "#f20d16",
  emissiveIntensity: 0.35,
});
const CORE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.22, metalness: 0.1 });
const RIB_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.15 });

const BOOTH_BASE_GEOMETRY = new THREE.BoxGeometry(0.5, 0.06, 0.5);
const BOOTH_CANOPY_GEOMETRY = new THREE.BoxGeometry(0.58, 0.03, 0.58);
const CANOPY_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.35, metalness: 0.05 });

const BOOTH_COUNT = 6;
const BOOTH_RADIUS = 1.95;
const PATH_LENGTH = BOOTH_RADIUS - 0.55 - 0.3; // clears the core and the booth base
const PATH_GEOMETRY = new THREE.BoxGeometry(0.3, 0.02, PATH_LENGTH);
const PATH_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.3,
  metalness: 0.1,
  emissive: "#ffffff",
  emissiveIntensity: 0.12,
});

const WHITE_NODE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.18, metalness: 0.1 });
const DARK_NODE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#b90710", roughness: 0.3, metalness: 0.4 });
const ACCENT_NODE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.22,
  metalness: 0.15,
  emissive: "#f20d16",
  emissiveIntensity: 0.35,
});

// Six small "goods on display" forms at the six market booths — varied,
// not six identical primitives — standing in for the six ecosystem
// participants the Basketry connects.
const BOOTH_GOODS_GEOMETRIES: BufferGeometry[] = [
  new THREE.BoxGeometry(0.22, 0.22, 0.22),
  new THREE.CapsuleGeometry(0.1, 0.16, 4, 8),
  new RoundedBoxGeometry(0.2, 0.2, 0.2, 2, 0.05),
  new THREE.CylinderGeometry(0.1, 0.1, 0.24, 16),
  new THREE.ConeGeometry(0.13, 0.22, 16),
  new THREE.IcosahedronGeometry(0.14, 0),
];

const BOOTH_GOODS_MATERIALS: Material[] = [
  WHITE_NODE_MATERIAL,
  DARK_NODE_MATERIAL,
  ACCENT_NODE_MATERIAL,
  WHITE_NODE_MATERIAL,
  DARK_NODE_MATERIAL,
  ACCENT_NODE_MATERIAL,
];

/** The Basketry hub — a plaza with a woven-dome pavilion at its center
 * and six small market booths around its edge, linked by paved paths.
 * A connection layer you could actually walk through: an engineered
 * place, not a planet with rings and orbiting moons. */
export function BasketryHub() {
  const stage = getStage("basketry");
  const domeRef = useRef<Group>(null);

  const boothAngles = useMemo(
    () => Array.from({ length: BOOTH_COUNT }, (_, i) => (i / BOOTH_COUNT) * Math.PI * 2),
    []
  );

  useFrame((state) => {
    if (!domeRef.current) return;
    domeRef.current.rotation.y = state.clock.elapsedTime * 0.03 * useSceneStore.getState().motionScale;
  });

  return (
    <group position={[stage.anchor[0], -1.3, stage.anchor[2]]} scale={1.25}>
      <mesh geometry={PLAZA_GEOMETRY} material={PLAZA_MATERIAL} />
      <mesh geometry={PLAZA_RIM_GEOMETRY} material={RIM_MATERIAL} position={[0, 0.075, 0]} rotation={[Math.PI / 2, 0, 0]} />

      <mesh geometry={CORE_GEOMETRY} material={CORE_MATERIAL} position={[0, 0.34, 0]} />
      <group ref={domeRef} position={[0, 0.6, 0]}>
        {Array.from({ length: RIB_COUNT }, (_, i) => (
          <mesh key={`rib-${i}`} geometry={RIB_GEOMETRY} material={RIB_MATERIAL} rotation={[0, (i / RIB_COUNT) * Math.PI, 0]} />
        ))}
      </group>

      {boothAngles.map((angle, i) => {
        const x = Math.cos(angle) * BOOTH_RADIUS;
        const z = Math.sin(angle) * BOOTH_RADIUS;
        const pathMidRadius = 0.55 + PATH_LENGTH / 2;
        const pathX = Math.cos(angle) * pathMidRadius;
        const pathZ = Math.sin(angle) * pathMidRadius;

        return (
          <group key={`booth-${i}`}>
            <mesh
              geometry={PATH_GEOMETRY}
              material={PATH_MATERIAL}
              position={[pathX, 0.08, pathZ]}
              rotation={[0, Math.PI / 2 - angle, 0]}
            />

            <group position={[x, 0.09, z]} rotation={[0, -angle, 0]}>
              <mesh geometry={BOOTH_BASE_GEOMETRY} material={PLAZA_MATERIAL} />
              <mesh geometry={BOOTH_CANOPY_GEOMETRY} material={CANOPY_MATERIAL} position={[0, 0.42, -0.2]} rotation={[0.25, 0, 0]} />
              <mesh geometry={BOOTH_GOODS_GEOMETRIES[i]} material={BOOTH_GOODS_MATERIALS[i]} position={[0, 0.18, 0]} />
            </group>
          </group>
        );
      })}
    </group>
  );
}
