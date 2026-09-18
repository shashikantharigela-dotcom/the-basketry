import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Material, BufferGeometry } from "three";
import { useSceneStore } from "../store/useSceneStore";

export type SupplyRole = "manufacturer" | "distributor" | "retailer" | "consumer";

export interface SupplyNodeProps {
  position: [number, number, number];
  role: SupplyRole;
  bobOffset?: number;
}

const MANUFACTURER_GEOMETRY = new THREE.BoxGeometry(0.7, 0.7, 0.7);
const DISTRIBUTOR_GEOMETRY = new THREE.OctahedronGeometry(0.55, 0);
const RETAILER_GEOMETRY = new THREE.BoxGeometry(0.5, 0.9, 0.5);
const CONSUMER_GEOMETRY = new THREE.SphereGeometry(0.42, 32, 32);

const DARK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.35, metalness: 0.35 });
const WHITE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2, metalness: 0.1 });
const ACCENT_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f20d16", roughness: 0.25, metalness: 0.15 });

const ROLE_GEOMETRY: Record<SupplyRole, BufferGeometry> = {
  manufacturer: MANUFACTURER_GEOMETRY,
  distributor: DISTRIBUTOR_GEOMETRY,
  retailer: RETAILER_GEOMETRY,
  consumer: CONSUMER_GEOMETRY,
};

const ROLE_MATERIAL: Record<SupplyRole, Material> = {
  manufacturer: DARK_MATERIAL,
  distributor: WHITE_MATERIAL,
  retailer: ACCENT_MATERIAL,
  consumer: WHITE_MATERIAL,
};

/** One node in the disconnected supply chain — abstract, unlabeled geometry
 * distinguished by form rather than text, drifting gently in place. */
export function SupplyNode({ position, role, bobOffset = 0 }: SupplyNodeProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * useSceneStore.getState().motionScale;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + bobOffset) * 0.08;
    groupRef.current.rotation.y = t * 0.12 + bobOffset;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={ROLE_GEOMETRY[role]} material={ROLE_MATERIAL[role]} />
    </group>
  );
}
