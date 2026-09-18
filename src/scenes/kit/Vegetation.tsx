import * as THREE from "three";

export interface MiniTreeProps {
  position?: [number, number, number];
  scale?: number;
}

const TRUNK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#3d0509", roughness: 0.6, metalness: 0.1 });
const FOLIAGE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.5, metalness: 0.05 });

/** A stylized, on-brand tree (cream foliage rather than green) — quiet
 * landscaping that reads as "outdoor plaza" without breaking the
 * red/white/black/cream palette. */
export function MiniTree({ position = [0, 0, 0], scale = 1 }: MiniTreeProps) {
  return (
    <group position={position} scale={scale}>
      <mesh material={TRUNK_MATERIAL} position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.32, 8]} />
      </mesh>
      <mesh material={FOLIAGE_MATERIAL} position={[0, 0.42, 0]}>
        <icosahedronGeometry args={[0.22, 0]} />
      </mesh>
    </group>
  );
}
