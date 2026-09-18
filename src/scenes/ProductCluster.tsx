import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";
import { ProductObject, type ProductVariant } from "./ProductObject";
import { useIsMobile } from "../hooks/useIsMobile";
import { DioramaBase } from "./kit/DioramaBase";
import { MiniTree } from "./kit/Vegetation";

interface ProductItemConfig {
  variant: ProductVariant;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  accent: boolean;
  spinSpeed: number;
}

// A deliberate premium still-life rather than a scatter: a foreground hero
// pair, a middle-ground row, and a smaller, softer background row — each
// item spaced so nothing intersects its neighbors, and the whole cluster
// sits clear of the text-safe column (see narrativeConfig's camera notes).
const PRODUCT_ITEMS: ProductItemConfig[] = [
  // Foreground hero pair.
  { variant: "bottle", position: [0.8, 0.05, 1.6], rotation: [0, -0.35, 0], scale: 1.1, accent: false, spinSpeed: 0.07 },
  { variant: "jar", position: [-0.6, -0.35, 2.0], rotation: [0, 0.25, 0], scale: 1.05, accent: true, spinSpeed: 0.05 },

  // Middle ground.
  { variant: "carton", position: [1.9, 0.35, 0.7], rotation: [0, 0.5, 0], scale: 1.05, accent: false, spinSpeed: 0.06 },
  { variant: "can", position: [0.4, 0.65, -0.3], rotation: [0, -0.6, 0], scale: 0.55, accent: false, spinSpeed: 0.08 },
  { variant: "pouch", position: [1.0, -0.15, 0.0], rotation: [0.2, 0.15, 0], scale: 0.6, accent: false, spinSpeed: 0.05 },

  // Background, smaller and softer — recedes into the fog.
  { variant: "carton", position: [1.3, 0.15, -1.4], rotation: [0, -0.2, 0], scale: 0.75, accent: false, spinSpeed: 0.04 },
  { variant: "bottle", position: [0.6, 0.9, -1.8], rotation: [0, 0.4, 0], scale: 0.7, accent: true, spinSpeed: 0.05 },
  { variant: "jar", position: [2.0, -0.2, -2.3], rotation: [0, -0.5, 0], scale: 0.65, accent: false, spinSpeed: 0.04 },
];

const BACKDROP_MATERIAL = new THREE.MeshStandardMaterial({ color: "#b90710", roughness: 0.55, metalness: 0.1 });

/** A premium miniature product environment: a bevelled display plinth
 * with a backdrop wall and a touch of landscaping, not products floating
 * in the void. */
export function ProductCluster() {
  const stage = getStage("products");
  const isMobile = useIsMobile();
  const items = isMobile ? PRODUCT_ITEMS.slice(0, 5) : PRODUCT_ITEMS;

  return (
    <group position={stage.anchor}>
      <DioramaBase position={[1.0, -1.0, -0.2]} width={5.4} depth={3.8} height={0.3} />
      <mesh material={BACKDROP_MATERIAL} position={[1.0, 0.35, -3.1]}>
        <boxGeometry args={[5.6, 2.4, 0.14]} />
      </mesh>
      <MiniTree position={[3.1, -0.85, -1.4]} scale={1.3} />

      {items.map((item, i) => (
        <ProductObject key={i} {...item} />
      ))}
    </group>
  );
}
