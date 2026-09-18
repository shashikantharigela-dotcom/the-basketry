import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";
import { ProductObject } from "./ProductObject";

const PLINTH_GEOMETRY = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 48);
const PLINTH_MATERIAL = new THREE.MeshStandardMaterial({ color: "#3d0509", roughness: 0.3, metalness: 0.3 });

const CONSUMER_GEOMETRY = new THREE.CapsuleGeometry(0.22, 0.5, 6, 12);
const CONSUMER_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.3, metalness: 0.05 });

const CONSUMERS: Array<{ position: [number, number, number]; rotation: [number, number, number] }> = [
  { position: [2.7, 0.1, 1.4], rotation: [0, -0.4, 0] },
  { position: [3.0, 0.1, -1.6], rotation: [0, 0.5, 0] },
];

/** A premium display plinth, not a storefront or a shopping UI — a few
 * hero products presented well, with abstract consumer presences nearby
 * rather than literal figures or checkout chrome. */
export function ConsumerMarket() {
  const stage = getStage("consumerMarket");

  return (
    <group position={[stage.anchor[0], -0.3, stage.anchor[2]]}>
      <mesh geometry={PLINTH_GEOMETRY} material={PLINTH_MATERIAL} position={[0.6, -0.9, 0]} />

      <ProductObject position={[0, -0.4, 0.3]} rotation={[0, 0.3, 0]} scale={1.1} variant="bottle" accent spinSpeed={0.05} />
      <ProductObject position={[0.9, -0.4, -0.5]} rotation={[0, -0.4, 0]} scale={0.95} variant="jar" spinSpeed={0.06} />
      <ProductObject position={[-0.5, -0.4, -0.6]} rotation={[0, 0.6, 0]} scale={0.85} variant="carton" spinSpeed={0.04} />

      {CONSUMERS.map((consumer, i) => (
        <mesh key={i} geometry={CONSUMER_GEOMETRY} material={CONSUMER_MATERIAL} position={consumer.position} rotation={consumer.rotation} />
      ))}
    </group>
  );
}
