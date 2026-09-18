import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";
import { ProductObject } from "./ProductObject";
import { SolidConnection } from "./SolidConnection";

const CORE_GEOMETRY = new THREE.SphereGeometry(0.4, 32, 32);
const CORE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#171717",
  roughness: 0.2,
  metalness: 0.4,
  emissive: "#fff8ed",
  emissiveIntensity: 0.08,
});

const BRAND_GEOMETRY = new THREE.BoxGeometry(0.5, 0.6, 0.22);
const BRAND_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2, metalness: 0.1 });

const BUSINESS_GEOMETRY = new THREE.BoxGeometry(0.55, 0.4, 0.5);
const BUSINESS_MATERIAL = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.3, metalness: 0.3 });

const CONSUMER_GEOMETRY = new THREE.CapsuleGeometry(0.16, 0.32, 6, 12);
const CONSUMER_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.25, metalness: 0.05 });

const PILLARS = {
  products: [2.6, 0.9, 1.8] as [number, number, number],
  brands: [2.7, -0.6, -0.4] as [number, number, number],
  businesses: [1.8, 1.1, -2.4] as [number, number, number],
  consumers: [3.0, -0.4, -3.4] as [number, number, number],
};

/** Four pillars — Products, Brands, Businesses, Consumers — permanently
 * connected around the Basketry core: the payoff of the whole journey,
 * where the Disconnected Journey's broken lines finally read as solved. */
export function EcosystemWeb() {
  const stage = getStage("ecosystem");

  return (
    <group position={stage.anchor}>
      <mesh geometry={CORE_GEOMETRY} material={CORE_MATERIAL} />

      <group position={PILLARS.products}>
        <ProductObject position={[0, 0, 0]} variant="bottle" scale={0.8} spinSpeed={0.05} />
        <ProductObject position={[0.35, -0.1, 0.2]} variant="jar" scale={0.6} accent spinSpeed={0.04} />
      </group>
      <mesh geometry={BRAND_GEOMETRY} material={BRAND_MATERIAL} position={PILLARS.brands} />
      <mesh geometry={BUSINESS_GEOMETRY} material={BUSINESS_MATERIAL} position={PILLARS.businesses} />
      <mesh
        geometry={CONSUMER_GEOMETRY}
        material={CONSUMER_MATERIAL}
        position={PILLARS.consumers}
        rotation={[0, 0, Math.PI / 2]}
      />

      <SolidConnection start={[0, 0, 0]} end={PILLARS.products} color="#ffffff" />
      <SolidConnection start={[0, 0, 0]} end={PILLARS.brands} color="#f20d16" />
      <SolidConnection start={[0, 0, 0]} end={PILLARS.businesses} color="#ffffff" />
      <SolidConnection start={[0, 0, 0]} end={PILLARS.consumers} color="#f20d16" />
    </group>
  );
}
