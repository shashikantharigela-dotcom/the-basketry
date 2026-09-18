import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { getStage } from "../narrative/narrativeConfig";

const COLUMN_GEOMETRY = new THREE.BoxGeometry(0.16, 1, 0.16);
const ACCENT_GEOMETRY = new THREE.BoxGeometry(0.035, 1, 0.035);
const PLATFORM_GEOMETRY = new THREE.BoxGeometry(1, 0.07, 1);
const BLOCK_GEOMETRY = new THREE.BoxGeometry(0.2, 0.2, 0.2);

const DARK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.45, metalness: 0.3 });
const WHITE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2, metalness: 0.15 });
const BLOCK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.25, metalness: 0.05 });
const RED_ACCENT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.3,
  metalness: 0.1,
  emissive: "#f20d16",
  emissiveIntensity: 0.5,
});

const FLOOR_Y = -1.3;

interface ColumnConfig {
  x: number;
  z: number;
  height: number;
  accent: boolean;
}

// Vertical structural elements — an abstract manufacturing/brand
// architecture rather than a literal factory: columns of varying height,
// platforms/shelves at three levels, and product blocks resting on them.
const COLUMNS: ColumnConfig[] = [
  { x: -2.2, z: 0.4, height: 2.6, accent: false },
  { x: -1.1, z: -0.6, height: 3.4, accent: true },
  { x: 0.2, z: 0.8, height: 2.1, accent: false },
  { x: 1.3, z: -0.4, height: 3.9, accent: false },
  { x: 2.3, z: 0.6, height: 2.8, accent: true },
];

interface PlatformConfig {
  position: [number, number, number];
  scale: [number, number, number];
}

const PLATFORMS: PlatformConfig[] = [
  { position: [-1.6, 0.3, 0], scale: [2.2, 1, 1.4] },
  { position: [0.8, 1.3, -0.2], scale: [1.8, 1, 1.2] },
  { position: [-0.4, 2.2, 0.3], scale: [1.4, 1, 1] },
];

const BLOCKS: Array<[number, number, number]> = [
  [-2.1, 0.42, 0.2],
  [-1.6, 0.42, -0.3],
  [-1.1, 0.42, 0.4],
  [0.4, 1.42, -0.1],
  [0.9, 1.42, 0.3],
  [1.3, 1.42, -0.4],
  [-0.7, 2.32, 0.1],
  [-0.2, 2.32, 0.4],
];

export function BrandStructure() {
  const stage = getStage("brand");
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={groupRef} position={stage.anchor}>
      {COLUMNS.map((column, i) => {
        const y = FLOOR_Y + column.height / 2;
        return (
          <group key={i}>
            <mesh
              geometry={COLUMN_GEOMETRY}
              material={DARK_MATERIAL}
              position={[column.x, y, column.z]}
              scale={[1, column.height, 1]}
            />
            {column.accent && (
              <mesh
                geometry={ACCENT_GEOMETRY}
                material={RED_ACCENT_MATERIAL}
                position={[column.x, y, column.z + 0.1]}
                scale={[1, column.height * 0.96, 1]}
              />
            )}
          </group>
        );
      })}

      {PLATFORMS.map((platform, i) => (
        <mesh
          key={i}
          geometry={PLATFORM_GEOMETRY}
          material={WHITE_MATERIAL}
          position={platform.position}
          scale={platform.scale}
        />
      ))}

      {BLOCKS.map((position, i) => (
        <mesh key={i} geometry={BLOCK_GEOMETRY} material={BLOCK_MATERIAL} position={position} />
      ))}
    </group>
  );
}
