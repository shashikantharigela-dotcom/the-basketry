import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Group } from "three";
import { useSceneStore } from "../store/useSceneStore";

export type ProductVariant = "carton" | "jar" | "bottle" | "pouch" | "can";

export interface ProductObjectProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  variant: ProductVariant;
  accent?: boolean;
  spinSpeed?: number;
}

// Shared geometries/materials — created once and reused across every
// ProductObject instance rather than per-mesh, so an 8-object cluster costs
// a handful of draw calls' worth of GPU state, not eight unique ones.
const CARTON_GEOMETRY = new RoundedBoxGeometry(0.62, 0.9, 0.4, 3, 0.06);
const JAR_BODY_GEOMETRY = new THREE.CylinderGeometry(0.34, 0.34, 0.62, 24);
const JAR_LID_GEOMETRY = new THREE.CylinderGeometry(0.36, 0.36, 0.1, 24);
const BOTTLE_BODY_GEOMETRY = new THREE.CylinderGeometry(0.22, 0.28, 0.74, 20);
const BOTTLE_NECK_GEOMETRY = new THREE.CylinderGeometry(0.1, 0.14, 0.22, 16);
const POUCH_GEOMETRY = new THREE.CapsuleGeometry(0.26, 0.34, 6, 12);
const CAN_GEOMETRY = new THREE.CylinderGeometry(0.28, 0.28, 0.68, 24);

// A single reusable ring, non-uniformly scaled per variant — the "subtle
// red accent" called for in the brief, applied as a thin band rather than
// recoloring the whole product white->red.
const ACCENT_RING_GEOMETRY = new THREE.TorusGeometry(1, 0.1, 8, 24);

// Glossy, premium-plastic/glass feel: low roughness, low-but-present
// metalness so highlights read as soft specular pops rather than flat
// matte or full-metal.
const WHITE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.14,
  metalness: 0.08,
});

const ACCENT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.2,
  metalness: 0.12,
});

const CAP_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#3d0509",
  roughness: 0.24,
  metalness: 0.55,
});

const ACCENT_CONFIG: Record<ProductVariant, { y: number; radius: number }> = {
  carton: { y: 0.16, radius: 0.34 },
  jar: { y: 0.02, radius: 0.36 },
  bottle: { y: 0.02, radius: 0.26 },
  pouch: { y: 0, radius: 0.28 },
  can: { y: 0, radius: 0.3 },
};

export function ProductObject({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  variant,
  accent = false,
  spinSpeed = 0.08,
}: ProductObjectProps) {
  const groupRef = useRef<Group>(null);
  const accentConfig = ACCENT_CONFIG[variant];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const motionScale = useSceneStore.getState().motionScale;
    groupRef.current.rotation.y += delta * spinSpeed * motionScale;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {variant === "carton" && <mesh geometry={CARTON_GEOMETRY} material={WHITE_MATERIAL} />}

      {variant === "jar" && (
        <>
          <mesh geometry={JAR_BODY_GEOMETRY} material={WHITE_MATERIAL} />
          <mesh geometry={JAR_LID_GEOMETRY} material={CAP_MATERIAL} position={[0, 0.36, 0]} />
        </>
      )}

      {variant === "bottle" && (
        <>
          <mesh geometry={BOTTLE_BODY_GEOMETRY} material={WHITE_MATERIAL} />
          <mesh geometry={BOTTLE_NECK_GEOMETRY} material={CAP_MATERIAL} position={[0, 0.48, 0]} />
        </>
      )}

      {variant === "pouch" && (
        <mesh geometry={POUCH_GEOMETRY} material={WHITE_MATERIAL} rotation={[0, 0, Math.PI / 2]} />
      )}

      {variant === "can" && <mesh geometry={CAN_GEOMETRY} material={WHITE_MATERIAL} />}

      {accent && (
        <mesh
          geometry={ACCENT_RING_GEOMETRY}
          material={ACCENT_MATERIAL}
          position={[0, accentConfig.y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[accentConfig.radius, accentConfig.radius, accentConfig.radius]}
        />
      )}
    </group>
  );
}
