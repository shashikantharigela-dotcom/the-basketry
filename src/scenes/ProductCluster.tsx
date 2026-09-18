import { getStage } from "../narrative/narrativeConfig";
import { ProductObject, type ProductVariant } from "./ProductObject";
import { useIsMobile } from "../hooks/useIsMobile";

interface ProductItemConfig {
  variant: ProductVariant;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  accent: boolean;
  spinSpeed: number;
}

// Deterministic, hand-placed cluster — approximates an FMCG shelf pulled
// apart in space rather than a random scatter, with foreground/background
// depth and a mix of package forms.
const PRODUCT_ITEMS: ProductItemConfig[] = [
  { variant: "carton", position: [-2.4, 0.6, 1.6], rotation: [0.2, 0.6, 0], scale: 1.1, accent: false, spinSpeed: 0.09 },
  { variant: "jar", position: [-1.1, -0.4, 2.4], rotation: [0, 0.2, 0], scale: 1, accent: true, spinSpeed: 0.06 },
  { variant: "bottle", position: [0.6, 0.9, 0.8], rotation: [0, -0.4, 0], scale: 1.15, accent: false, spinSpeed: 0.1 },
  { variant: "pouch", position: [1.9, -0.6, 1.9], rotation: [0.3, 0.3, 0.1], scale: 1, accent: false, spinSpeed: 0.07 },
  { variant: "can", position: [-1.8, 0.3, -1.4], rotation: [0, 0.9, 0], scale: 0.9, accent: true, spinSpeed: 0.05 },
  { variant: "carton", position: [0.4, -1, -2.2], rotation: [0.1, -0.7, 0], scale: 0.85, accent: false, spinSpeed: 0.08 },
  { variant: "bottle", position: [2.6, 0.5, -1.6], rotation: [0, 0.5, 0], scale: 0.95, accent: false, spinSpeed: 0.11 },
  { variant: "jar", position: [-3, -0.2, -0.6], rotation: [0, -0.2, 0], scale: 0.8, accent: false, spinSpeed: 0.06 },
];

export function ProductCluster() {
  const stage = getStage("products");
  const isMobile = useIsMobile();
  const items = isMobile ? PRODUCT_ITEMS.slice(0, 5) : PRODUCT_ITEMS;

  return (
    <group position={stage.anchor}>
      {items.map((item, i) => (
        <ProductObject key={i} {...item} />
      ))}
    </group>
  );
}
