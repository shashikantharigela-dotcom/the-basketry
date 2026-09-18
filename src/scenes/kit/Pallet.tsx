import * as THREE from "three";

export interface PalletProps {
  position?: [number, number, number];
  rotationY?: number;
  boxCount?: number;
  scale?: number;
}

const PALLET_MATERIAL = new THREE.MeshStandardMaterial({ color: "#9c8570", roughness: 0.7, metalness: 0.02 });
const BOX_WHITE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.05 });
const BOX_ACCENT_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f20d16", roughness: 0.3, metalness: 0.1 });

/** A pallet stacked with packaged goods — the recurring "product ready
 * to ship" unit for the Brand and Business environments. */
export function Pallet({ position = [0, 0, 0], rotationY = 0, boxCount = 3, scale = 1 }: PalletProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh material={PALLET_MATERIAL} position={[0, 0.04, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.5]} />
      </mesh>
      {Array.from({ length: boxCount }, (_, i) => (
        <mesh
          key={i}
          material={i % 2 === 0 ? BOX_WHITE_MATERIAL : BOX_ACCENT_MATERIAL}
          position={[(i - (boxCount - 1) / 2) * 0.22, 0.24, 0]}
        >
          <boxGeometry args={[0.2, 0.32, 0.32]} />
        </mesh>
      ))}
    </group>
  );
}
