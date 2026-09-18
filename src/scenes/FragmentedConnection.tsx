import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";
import { useSceneStore } from "../store/useSceneStore";
import { getReconnectProgress } from "../narrative/narrativeConfig";

export interface FragmentedConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
  fragmentCount?: number;
  /** Staggers when this specific connection starts resolving, 0–1. */
  revealOffset?: number;
}

const BAR_GEOMETRY = new THREE.CylinderGeometry(0.035, 0.035, 1, 8);
const FRAGMENT_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.1 });
const RESOLVE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.25,
  metalness: 0.1,
  emissive: "#f20d16",
  emissiveIntensity: 0.3,
});

const UP = new THREE.Vector3(0, 1, 0);

/** A broken line between two supply-chain nodes: a handful of short,
 * gapped bars (the "disconnected" state) plus a beam that grows from the
 * start node toward the end node as global scroll progress enters the
 * reconnect window, visually bridging the gap. */
export function FragmentedConnection({
  start,
  end,
  fragmentCount = 4,
  revealOffset = 0,
}: FragmentedConnectionProps) {
  const resolveRef = useRef<Mesh>(null);

  const { quaternion, length, fragments } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const len = direction.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, direction.clone().normalize());

    const gapRatio = 0.35;
    const segmentSpan = 1 / fragmentCount;
    const segmentLength = segmentSpan * (1 - gapRatio);
    const frags = Array.from({ length: fragmentCount }, (_, i) => {
      const centerT = i * segmentSpan + segmentSpan / 2;
      return { y: centerT * len, height: segmentLength * len };
    });

    return { quaternion: quat, length: len, fragments: frags };
  }, [start, end, fragmentCount]);

  useFrame(() => {
    if (!resolveRef.current) return;
    const progress = useSceneStore.getState().progress;
    const closing = THREE.MathUtils.clamp(getReconnectProgress(progress) - revealOffset, 0, 1);
    const currentLength = Math.max(0.001, closing * length);
    resolveRef.current.scale.y = currentLength;
    resolveRef.current.position.y = currentLength / 2;
  });

  return (
    <group position={start} quaternion={quaternion}>
      {fragments.map((fragment, i) => (
        <mesh
          key={i}
          geometry={BAR_GEOMETRY}
          material={FRAGMENT_MATERIAL}
          position={[0, fragment.y, 0]}
          scale={[1, fragment.height, 1]}
        />
      ))}
      <mesh ref={resolveRef} geometry={BAR_GEOMETRY} material={RESOLVE_MATERIAL} scale={[1.4, 0.001, 1.4]} />
    </group>
  );
}
