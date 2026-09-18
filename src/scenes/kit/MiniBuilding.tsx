import * as THREE from "three";

export type RoofType = "gable" | "sawtooth" | "flat";

export interface MiniBuildingProps {
  position?: [number, number, number];
  rotationY?: number;
  width?: number;
  depth?: number;
  wallHeight?: number;
  roofType?: RoofType;
  /** Recolors the door/entrance accent red instead of cream trim. */
  accent?: boolean;
  chimney?: boolean;
  /** A small raised panel above the entrance, like a shopfront sign. */
  sign?: boolean;
  scale?: number;
}

const WALL_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.35, metalness: 0.05 });
const ROOF_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f20d16", roughness: 0.4, metalness: 0.2 });
const ACCENT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.3,
  metalness: 0.1,
  emissive: "#f20d16",
  emissiveIntensity: 0.25,
});
const TRIM_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.4, metalness: 0.05 });

const ROOF_PITCH = 0.5;

/**
 * A small parametric building — walls, a door/entrance accent, a
 * configurable roof (gable/sawtooth/flat), and optional chimney/sign —
 * the base unit every Stage 1–4 environment is built from (factory,
 * warehouse, storefront, house). Real GLB buildings can replace this
 * per-role later without changing how the scenes place or connect them.
 */
export function MiniBuilding({
  position = [0, 0, 0],
  rotationY = 0,
  width = 1.6,
  depth = 1.2,
  wallHeight = 0.9,
  roofType = "gable",
  accent = false,
  chimney = false,
  sign = false,
  scale = 1,
}: MiniBuildingProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh material={WALL_MATERIAL} position={[0, wallHeight / 2, 0]}>
        <boxGeometry args={[width, wallHeight, depth]} />
      </mesh>

      <mesh material={accent ? ACCENT_MATERIAL : TRIM_MATERIAL} position={[0, wallHeight * 0.32, depth / 2 + 0.01]}>
        <boxGeometry args={[width * 0.22, wallHeight * 0.55, 0.02]} />
      </mesh>

      {roofType === "flat" && (
        <mesh material={ROOF_MATERIAL} position={[0, wallHeight + 0.05, 0]}>
          <boxGeometry args={[width * 1.06, 0.1, depth * 1.06]} />
        </mesh>
      )}

      {roofType === "sawtooth" && (
        // Pivoted so the back edge stays flush with the wall top and only
        // the front (entrance-side) edge rises — a lean-to roof grounded
        // at the back, not a lid hinged open in mid-air.
        <mesh
          material={ROOF_MATERIAL}
          position={[0, wallHeight + ((depth * 1.2) / 2) * Math.sin(Math.atan(ROOF_PITCH)), 0]}
          rotation={[-Math.atan(ROOF_PITCH), 0, 0]}
        >
          <boxGeometry args={[width * 1.06, 0.06, depth * 1.2]} />
        </mesh>
      )}

      {roofType === "gable" && (
        <group position={[0, wallHeight, 0]}>
          <mesh material={ROOF_MATERIAL} position={[-width * 0.26, depth * 0.13, 0]} rotation={[0, 0, Math.atan(ROOF_PITCH)]}>
            <boxGeometry args={[width * 0.62, 0.06, depth * 1.08]} />
          </mesh>
          <mesh material={ROOF_MATERIAL} position={[width * 0.26, depth * 0.13, 0]} rotation={[0, 0, -Math.atan(ROOF_PITCH)]}>
            <boxGeometry args={[width * 0.62, 0.06, depth * 1.08]} />
          </mesh>
        </group>
      )}

      {chimney && (
        <mesh material={ROOF_MATERIAL} position={[width * 0.25, wallHeight + depth * 0.3, 0]}>
          <cylinderGeometry args={[0.06, 0.07, depth * 0.5, 12]} />
        </mesh>
      )}

      {sign && (
        <mesh material={ACCENT_MATERIAL} position={[0, wallHeight + 0.18, depth / 2 + 0.08]}>
          <boxGeometry args={[width * 0.7, 0.16, 0.04]} />
        </mesh>
      )}
    </group>
  );
}
