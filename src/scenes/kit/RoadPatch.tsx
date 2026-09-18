import * as THREE from "three";

export interface RoadPatchProps {
  position?: [number, number, number];
  rotationY?: number;
  width?: number;
  length?: number;
}

const ROAD_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.8, metalness: 0.05 });
const LINE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f20d16", roughness: 0.4, metalness: 0.1 });

/** A paved patch with a center line — grounds a building in an actual
 * place (a yard, a loading apron, a street) instead of empty space. */
export function RoadPatch({ position = [0, 0, 0], rotationY = 0, width = 1.2, length = 3 }: RoadPatchProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh material={ROAD_MATERIAL} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length]} />
      </mesh>
      <mesh material={LINE_MATERIAL} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, length * 0.7]} />
      </mesh>
    </group>
  );
}
