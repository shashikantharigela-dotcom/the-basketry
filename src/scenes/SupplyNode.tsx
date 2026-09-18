import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useSceneStore } from "../store/useSceneStore";
import { MiniBuilding, type RoofType } from "./kit/MiniBuilding";

export type SupplyRole = "manufacturer" | "distributor" | "retailer" | "consumer";

export interface SupplyNodeProps {
  position: [number, number, number];
  role: SupplyRole;
  bobOffset?: number;
}

const FRAGMENT_GEOMETRY = new THREE.CylinderGeometry(0.85, 0.95, 0.16, 24);
const FRAGMENT_MATERIAL = new THREE.MeshStandardMaterial({ color: "#4a0710", roughness: 0.7, metalness: 0.1 });

interface RoleConfig {
  roofType: RoofType;
  width: number;
  depth: number;
  wallHeight: number;
  chimney: boolean;
  sign: boolean;
  accent: boolean;
}

// Each role reads as a distinct small building, not an abstract
// primitive — a factory, a warehouse, a storefront, a house.
const ROLE_CONFIG: Record<SupplyRole, RoleConfig> = {
  manufacturer: { roofType: "sawtooth", width: 1.3, depth: 1.0, wallHeight: 0.7, chimney: true, sign: false, accent: false },
  distributor: { roofType: "flat", width: 1.5, depth: 1.1, wallHeight: 0.6, chimney: false, sign: false, accent: false },
  retailer: { roofType: "gable", width: 1.0, depth: 0.9, wallHeight: 0.55, chimney: false, sign: true, accent: true },
  consumer: { roofType: "gable", width: 0.75, depth: 0.7, wallHeight: 0.45, chimney: false, sign: false, accent: true },
};

/** One isolated fragment of the supply chain — a small building on its
 * own broken-off patch of ground, drifting and swaying gently apart
 * from the others, rather than a single abstract shape. */
export function SupplyNode({ position, role, bobOffset = 0 }: SupplyNodeProps) {
  const groupRef = useRef<Group>(null);
  const config = ROLE_CONFIG[role];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * useSceneStore.getState().motionScale;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + bobOffset) * 0.05;
    groupRef.current.rotation.y = Math.sin(t * 0.1 + bobOffset) * 0.15;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={FRAGMENT_GEOMETRY} material={FRAGMENT_MATERIAL} position={[0, -0.08, 0]} />
      <MiniBuilding
        width={config.width}
        depth={config.depth}
        wallHeight={config.wallHeight}
        roofType={config.roofType}
        chimney={config.chimney}
        sign={config.sign}
        accent={config.accent}
      />
    </group>
  );
}
