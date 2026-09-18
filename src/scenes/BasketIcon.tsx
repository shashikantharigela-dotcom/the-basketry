import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";

const BASKET_BODY_GEOMETRY = new THREE.CylinderGeometry(1.0, 0.7, 1.0, 32, 1, true);
const RIM_GEOMETRY = new THREE.TorusGeometry(1.0, 0.055, 16, 48);
const HANDLE_GEOMETRY = new THREE.TorusGeometry(0.9, 0.035, 8, 32, Math.PI);
const WEAVE_GEOMETRY = new THREE.TorusGeometry(0.85, 0.012, 6, 48);

const BODY_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.28,
  metalness: 0.06,
  side: THREE.DoubleSide,
});
const RIM_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.22,
  metalness: 0.15,
  emissive: "#f20d16",
  emissiveIntensity: 0.3,
});
const HANDLE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#3d0509", roughness: 0.3, metalness: 0.35 });
const WEAVE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.35, metalness: 0.05 });

const WEAVE_HEIGHTS = [-0.32, -0.1, 0.12];

/** A single elegant procedural basket — the closing icon for "ONE
 * BASKET. MANY POSSIBILITIES." Static and quiet by design; this is the
 * resting point after nine stages of motion, not another set piece. */
export function BasketIcon() {
  const stage = getStage("finalStatement");

  return (
    <group position={[stage.anchor[0], -0.75, stage.anchor[2]]}>
      <mesh geometry={BASKET_BODY_GEOMETRY} material={BODY_MATERIAL} position={[0, -0.05, 0]} />
      <mesh geometry={RIM_GEOMETRY} material={RIM_MATERIAL} position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={HANDLE_GEOMETRY} material={HANDLE_MATERIAL} position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} />

      {WEAVE_HEIGHTS.map((y, i) => (
        <mesh key={i} geometry={WEAVE_GEOMETRY} material={WEAVE_MATERIAL} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
  );
}
