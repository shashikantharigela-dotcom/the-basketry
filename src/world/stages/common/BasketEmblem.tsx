import * as THREE from "three";

/**
 * THE BASKETRY's existing procedural basket (the same form and colours as
 * the legacy BasketIcon — src/scenes/BasketIcon.tsx), reusable at any size
 * as a brand emblem on stalls, banners and trucks until the real logo
 * asset is added. Unit size: ~2 wide, centred on its body.
 */
const BODY_GEOMETRY = new THREE.CylinderGeometry(1.0, 0.7, 1.0, 32, 1, true);
const RIM_GEOMETRY = new THREE.TorusGeometry(1.0, 0.055, 16, 48);
const HANDLE_GEOMETRY = new THREE.TorusGeometry(0.9, 0.035, 8, 32, Math.PI);
const WEAVE_GEOMETRY = new THREE.TorusGeometry(0.85, 0.012, 6, 48);

const BODY_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.28, metalness: 0.06, side: THREE.DoubleSide });
const RIM_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.22,
  metalness: 0.15,
  emissive: "#f20d16",
  emissiveIntensity: 0.3,
});
const HANDLE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#b90710", roughness: 0.3, metalness: 0.35 });
const WEAVE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.35, metalness: 0.05 });
const WEAVE_HEIGHTS = [-0.32, -0.1, 0.12];

export function BasketEmblem({
  position,
  rotation,
  scale = 1,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={BODY_GEOMETRY} material={BODY_MATERIAL} position={[0, -0.05, 0]} castShadow />
      <mesh geometry={RIM_GEOMETRY} material={RIM_MATERIAL} position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={HANDLE_GEOMETRY} material={HANDLE_MATERIAL} position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} castShadow />
      {WEAVE_HEIGHTS.map((y, i) => (
        <mesh key={i} geometry={WEAVE_GEOMETRY} material={WEAVE_MATERIAL} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
  );
}
