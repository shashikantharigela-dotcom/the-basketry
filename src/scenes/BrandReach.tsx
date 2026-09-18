import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";
import { GrowingBeam } from "./GrowingBeam";

const EMBLEM_GEOMETRY = new THREE.BoxGeometry(1.1, 1.3, 0.45);
const RING_GEOMETRY = new THREE.TorusGeometry(0.85, 0.05, 12, 48);
const MARKER_GEOMETRY = new THREE.IcosahedronGeometry(0.16, 0);

const EMBLEM_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.18, metalness: 0.12 });
const RING_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.22,
  metalness: 0.12,
  emissive: "#f20d16",
  emissiveIntensity: 0.4,
});
const MARKER_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2, metalness: 0.1 });
const MARKER_ACCENT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.22,
  metalness: 0.15,
  emissive: "#f20d16",
  emissiveIntensity: 0.3,
});

const MARKERS: Array<{ position: [number, number, number]; accent: boolean }> = [
  { position: [2.4, 0.9, 1.0], accent: false },
  { position: [3.0, -0.6, -0.6], accent: true },
  { position: [1.6, 1.4, -1.8], accent: false },
  { position: [3.6, 0.3, -2.6], accent: true },
  { position: [2.0, -1.0, -3.4], accent: false },
];

/** The brand emblem sends reach lines out to new market/opportunity
 * markers as the stage advances — "brands reach further" through the
 * Basketry connection layer they were just introduced to. */
export function BrandReach() {
  const stage = getStage("brandReach");

  return (
    <group position={stage.anchor}>
      <mesh geometry={EMBLEM_GEOMETRY} material={EMBLEM_MATERIAL} />
      <mesh geometry={RING_GEOMETRY} material={RING_MATERIAL} rotation={[Math.PI / 2, 0, 0]} />

      {MARKERS.map((marker, i) => (
        <group key={i}>
          <mesh geometry={MARKER_GEOMETRY} material={marker.accent ? MARKER_ACCENT_MATERIAL : MARKER_MATERIAL} position={marker.position} />
          <GrowingBeam
            stageId="brandReach"
            start={[0, 0, 0]}
            end={marker.position}
            revealRange={[0.08 + i * 0.05, 0.5 + i * 0.05]}
            color={marker.accent ? "#f20d16" : "#ffffff"}
          />
        </group>
      ))}
    </group>
  );
}
