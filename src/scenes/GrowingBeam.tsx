import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";
import { getStage, getStageLocalProgress, type StageId } from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";

export interface GrowingBeamProps {
  stageId: StageId;
  start: [number, number, number];
  end: [number, number, number];
  /** Local stage progress (0–1) window over which the beam grows in. */
  revealRange?: [number, number];
  color?: string;
  radius?: number;
  emissiveIntensity?: number;
}

const UNIT_CYLINDER_GEOMETRY = new THREE.CylinderGeometry(1, 1, 1, 8);
const UP = new THREE.Vector3(0, 1, 0);

function smoothstep01(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

/** A thin structural line that grows from `start` toward `end` as the
 * given stage's own local scroll progress advances through `revealRange`
 * — a "reach"/"sourcing" line resolving in, reused across the Brand
 * Reach and Business Sourcing stages. */
export function GrowingBeam({
  stageId,
  start,
  end,
  revealRange = [0.1, 0.6],
  color = "#ffffff",
  radius = 0.028,
  emissiveIntensity = 0.25,
}: GrowingBeamProps) {
  const meshRef = useRef<Mesh>(null);
  const stage = getStage(stageId);

  const startVec = new THREE.Vector3(...start);
  const direction = new THREE.Vector3().subVectors(new THREE.Vector3(...end), startVec);
  const length = direction.length();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, direction.normalize());

  useFrame(() => {
    if (!meshRef.current) return;
    const progress = useSceneStore.getState().progress;
    const local = getStageLocalProgress(stage, progress);
    const [from, to] = revealRange;
    const reveal = smoothstep01((local - from) / Math.max(0.0001, to - from));
    const currentLength = Math.max(0.001, reveal * length);
    meshRef.current.scale.set(radius, currentLength, radius);
    meshRef.current.position.y = currentLength / 2;
  });

  return (
    <group position={start} quaternion={quaternion}>
      <mesh ref={meshRef} geometry={UNIT_CYLINDER_GEOMETRY}>
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.12}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
}
