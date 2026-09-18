import * as THREE from "three";

export interface DeliveryVehicleProps {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
}

const CAB_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.25, metalness: 0.15 });
const CARGO_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f20d16", roughness: 0.3, metalness: 0.1 });
const WHEEL_MATERIAL = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.5, metalness: 0.2 });
const WINDOW_MATERIAL = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.15, metalness: 0.4 });

const WHEEL_POSITIONS: Array<[number, number, number]> = [
  [-0.55, -0.02, 0.28],
  [-0.05, -0.02, 0.28],
  [0.45, -0.02, 0.28],
  [-0.55, -0.02, -0.28],
  [-0.05, -0.02, -0.28],
  [0.45, -0.02, -0.28],
];

/** A simple delivery truck silhouette — cab, cargo box, six wheels —
 * readable at diorama scale from any of the story's camera angles. */
export function DeliveryVehicle({ position = [0, 0, 0], rotationY = 0, scale = 1 }: DeliveryVehicleProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh material={CAB_MATERIAL} position={[0.45, 0.22, 0]}>
        <boxGeometry args={[0.32, 0.34, 0.5]} />
      </mesh>
      <mesh material={WINDOW_MATERIAL} position={[0.58, 0.28, 0]}>
        <boxGeometry args={[0.04, 0.14, 0.36]} />
      </mesh>
      <mesh material={CARGO_MATERIAL} position={[-0.28, 0.28, 0]}>
        <boxGeometry args={[0.85, 0.46, 0.52]} />
      </mesh>

      {WHEEL_POSITIONS.map((wheelPosition, i) => (
        <mesh key={i} material={WHEEL_MATERIAL} position={wheelPosition} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.08, 16]} />
        </mesh>
      ))}
    </group>
  );
}
