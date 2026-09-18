import { useMemo } from "react";
import * as THREE from "three";

export interface SolidConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  radius?: number;
}

const UNIT_CYLINDER_GEOMETRY = new THREE.CylinderGeometry(1, 1, 1, 8);
const UP = new THREE.Vector3(0, 1, 0);

/** A permanently-resolved structural line between two ecosystem
 * pillars — unlike FragmentedConnection/GrowingBeam, this doesn't
 * animate in; it's already whole, for the stage where everything reads
 * as connected. */
export function SolidConnection({ start, end, color = "#ffffff", radius = 0.03 }: SolidConnectionProps) {
  const { position, quaternion, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const len = direction.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, direction.clone().normalize());
    const midpoint = startVec.clone().add(endVec).multiplyScalar(0.5);
    return { position: midpoint, quaternion: quat, length: len };
  }, [start, end]);

  return (
    <mesh geometry={UNIT_CYLINDER_GEOMETRY} position={position} quaternion={quaternion} scale={[radius, length, radius]}>
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.12} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
}
