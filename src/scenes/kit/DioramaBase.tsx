import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export interface DioramaBaseProps {
  position?: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
}

const BASE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.5, metalness: 0.15 });
const RIM_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.25,
  metalness: 0.12,
  emissive: "#f20d16",
  emissiveIntensity: 0.3,
});

/** The bevelled plinth every Stage 1–4 miniature environment sits on —
 * turns "objects floating in the void" into an actual diorama piece. */
export function DioramaBase({ position = [0, 0, 0], width = 5, depth = 4, height = 0.3 }: DioramaBaseProps) {
  const geometry = useMemo(() => new RoundedBoxGeometry(width, height, depth, 3, 0.06), [width, depth, height]);

  return (
    <group position={position}>
      <mesh geometry={geometry} material={BASE_MATERIAL} />
      <mesh material={RIM_MATERIAL} position={[0, height / 2 + 0.006, 0]}>
        <boxGeometry args={[width * 0.985, 0.012, depth * 0.985]} />
      </mesh>
    </group>
  );
}
