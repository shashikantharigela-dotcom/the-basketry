import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";
import { GrowingBeam } from "./GrowingBeam";

const WAREHOUSE_BODY_GEOMETRY = new THREE.BoxGeometry(2.0, 1.1, 1.6);
const ROOF_GEOMETRY = new THREE.CylinderGeometry(0, 1.3, 0.55, 4);
const DOOR_GEOMETRY = new THREE.BoxGeometry(0.5, 0.7, 0.06);
const CRATE_GEOMETRY = new THREE.BoxGeometry(0.32, 0.32, 0.32);
const SUPPLIER_GEOMETRY = new THREE.OctahedronGeometry(0.22, 0);

const WHITE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.25, metalness: 0.08 });
const DARK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#b90710", roughness: 0.35, metalness: 0.3 });
const ACCENT_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f20d16", roughness: 0.25, metalness: 0.12 });
const ROOF_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f20d16", roughness: 0.35, metalness: 0.15 });

const SUPPLIERS: Array<[number, number, number]> = [
  [3.2, 0.6, 1.6],
  [3.6, -0.4, -0.6],
  [2.6, 1.1, -2.2],
  [3.4, -0.2, -3.4],
];

const CRATES: Array<[number, number, number]> = [
  [-1.1, -0.9, 0.6],
  [-0.6, -0.9, 0.9],
  [-1.0, -0.55, 0.75],
];

/** A sourcing hub: a warehouse drawing supplier nodes in via beams that
 * grow as the stage advances — "businesses source with confidence". */
export function BusinessHub() {
  const stage = getStage("businessSourcing");

  return (
    <group position={[stage.anchor[0], -0.4, stage.anchor[2]]}>
      <mesh geometry={WAREHOUSE_BODY_GEOMETRY} material={WHITE_MATERIAL} position={[0, -0.35, 0]} />
      <mesh geometry={ROOF_GEOMETRY} material={ROOF_MATERIAL} position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} />
      <mesh geometry={DOOR_GEOMETRY} material={ACCENT_MATERIAL} position={[0, -0.55, 0.83]} />

      {CRATES.map((position, i) => (
        <mesh key={i} geometry={CRATE_GEOMETRY} material={i % 2 === 0 ? WHITE_MATERIAL : DARK_MATERIAL} position={position} />
      ))}

      {SUPPLIERS.map((position, i) => (
        <group key={i}>
          <mesh geometry={SUPPLIER_GEOMETRY} material={i % 2 === 0 ? WHITE_MATERIAL : ACCENT_MATERIAL} position={position} />
          <GrowingBeam
            stageId="businessSourcing"
            start={position}
            end={[0, -0.1, 0]}
            revealRange={[0.1 + i * 0.06, 0.55 + i * 0.06]}
            color="#ffffff"
          />
        </group>
      ))}
    </group>
  );
}
