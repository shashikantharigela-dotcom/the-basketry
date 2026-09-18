import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";
import { GrowingBeam } from "./GrowingBeam";

const EMBLEM_GEOMETRY = new THREE.BoxGeometry(1.1, 1.3, 0.45);
const RING_GEOMETRY = new THREE.TorusGeometry(0.85, 0.05, 12, 48);
const MARKER_GEOMETRY = new THREE.IcosahedronGeometry(0.16, 0);
const PLINTH_GEOMETRY = new THREE.CylinderGeometry(1.0, 1.1, 0.3, 32);

const PLINTH_MATERIAL = new THREE.MeshStandardMaterial({ color: "#3d0509", roughness: 0.45, metalness: 0.2 });
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

// Y values already include the +0.95 lift that sets them above the
// emblem/plinth (see EMBLEM_Y below) — kept as absolute-to-group numbers
// so the beams reaching for them read as rising from the plinth, not
// floating disconnected from it.
const MARKERS: Array<{ position: [number, number, number]; accent: boolean }> = [
  { position: [2.4, 1.85, 1.0], accent: false },
  { position: [3.0, 0.35, -0.6], accent: true },
  { position: [1.6, 2.35, -1.8], accent: false },
  { position: [3.6, 1.25, -2.6], accent: true },
  { position: [2.0, -0.05, -3.4], accent: false },
];

const PLINTH_Y = 0.15;
const EMBLEM_Y = 0.95;

/** A monument on a paved plinth — the base the reach lines visibly rise
 * from — with the brand emblem sending reach lines out to new
 * market/opportunity markers as the stage advances. Grounded on the same
 * road-level plinth every other stop along the drive sits on, so it
 * reads as a place beside the road rather than a shape floating in the
 * sky. */
export function BrandReach() {
  const stage = getStage("brandReach");

  return (
    <group position={[stage.anchor[0], -1.3, stage.anchor[2]]}>
      <mesh geometry={PLINTH_GEOMETRY} material={PLINTH_MATERIAL} position={[0, PLINTH_Y, 0]} />
      <mesh geometry={EMBLEM_GEOMETRY} material={EMBLEM_MATERIAL} position={[0, EMBLEM_Y, 0]} />
      <mesh geometry={RING_GEOMETRY} material={RING_MATERIAL} position={[0, EMBLEM_Y, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {MARKERS.map((marker, i) => (
        <group key={i}>
          <mesh geometry={MARKER_GEOMETRY} material={marker.accent ? MARKER_ACCENT_MATERIAL : MARKER_MATERIAL} position={marker.position} />
          <GrowingBeam
            stageId="brandReach"
            start={[0, PLINTH_Y + 0.15, 0]}
            end={marker.position}
            revealRange={[0.08 + i * 0.05, 0.5 + i * 0.05]}
            color={marker.accent ? "#f20d16" : "#ffffff"}
          />
        </group>
      ))}
    </group>
  );
}
