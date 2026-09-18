import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";

const COLUMN_GEOMETRY = new THREE.BoxGeometry(0.2, 1, 0.2);
const ACCENT_GEOMETRY = new THREE.BoxGeometry(0.04, 1, 0.04);
const PLATFORM_GEOMETRY = new THREE.BoxGeometry(1, 0.07, 1);
const BLOCK_GEOMETRY = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const RING_GEOMETRY = new THREE.TorusGeometry(0.06, 0.012, 8, 24);

const DARK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.4, metalness: 0.35 });
const WHITE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.18, metalness: 0.15 });
const BLOCK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.22, metalness: 0.06 });
const RED_ACCENT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.25,
  metalness: 0.12,
  emissive: "#f20d16",
  emissiveIntensity: 0.55,
});

const FLOOR_Y = -1.3;

interface ColumnConfig {
  x: number;
  z: number;
  height: number;
  accent: boolean;
}

// Background — large architectural columns, pushed well behind the
// platforms so they read as a distant structure rather than something
// crossing in front of (or behind) the DOM heading.
const COLUMNS: ColumnConfig[] = [
  { x: -1.0, z: -6.5, height: 2.8, accent: false },
  { x: -0.1, z: -7.6, height: 3.6, accent: true },
  { x: 1.0, z: -6.0, height: 2.3, accent: false },
  { x: 2.1, z: -8.2, height: 4.2, accent: false },
  { x: 3.2, z: -6.8, height: 3.0, accent: true },
];

interface PlatformConfig {
  position: [number, number, number];
  scale: [number, number, number];
}

// Middle ground — the platforms/shelves, kept close to the anchor's own
// depth so they sit between the foreground accents and the background
// columns.
const PLATFORMS: PlatformConfig[] = [
  { position: [0.3, 0.3, 0.1], scale: [2.0, 1, 1.2] },
  { position: [1.5, 1.3, -0.2], scale: [1.7, 1, 1.0] },
  { position: [0.8, 2.2, 0.15], scale: [1.3, 1, 0.85] },
];

const BLOCKS: Array<[number, number, number]> = [
  [-0.3, 0.42, 0.2],
  [0.2, 0.42, -0.3],
  [0.7, 0.42, 0.4],
  [1.2, 1.42, -0.1],
  [1.7, 1.42, 0.3],
  [0.4, 2.32, 0.05],
  [0.9, 2.32, 0.35],
];

// Foreground — a couple of small, subtle structural accents near the
// camera, low enough in visual weight that they read as detail rather
// than an obstruction.
const FOREGROUND_ACCENTS: Array<{ x: number; z: number; height: number; accent: boolean }> = [
  { x: 2.3, z: 1.8, height: 1.0, accent: false },
  { x: 2.9, z: 1.5, height: 0.7, accent: true },
];

export function BrandStructure() {
  const stage = getStage("brand");

  return (
    <group position={stage.anchor}>
      {COLUMNS.map((column, i) => {
        const y = FLOOR_Y + column.height / 2;
        return (
          <group key={`column-${i}`}>
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
                position={[column.x, y, column.z + 0.12]}
                scale={[1, column.height * 0.96, 1]}
              />
            )}
          </group>
        );
      })}

      {PLATFORMS.map((platform, i) => (
        <mesh
          key={`platform-${i}`}
          geometry={PLATFORM_GEOMETRY}
          material={WHITE_MATERIAL}
          position={platform.position}
          scale={platform.scale}
        />
      ))}

      {BLOCKS.map((position, i) => (
        <mesh key={`block-${i}`} geometry={BLOCK_GEOMETRY} material={BLOCK_MATERIAL} position={position} />
      ))}

      {FOREGROUND_ACCENTS.map((accentRod, i) => {
        const y = FLOOR_Y + accentRod.height / 2 + 0.4;
        return (
          <group key={`accent-${i}`}>
            <mesh
              geometry={COLUMN_GEOMETRY}
              material={accentRod.accent ? RED_ACCENT_MATERIAL : DARK_MATERIAL}
              position={[accentRod.x, y, accentRod.z]}
              scale={[0.6, accentRod.height, 0.6]}
            />
            <mesh
              geometry={RING_GEOMETRY}
              material={WHITE_MATERIAL}
              position={[accentRod.x, y + accentRod.height / 2 + 0.05, accentRod.z]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
        );
      })}
    </group>
  );
}
