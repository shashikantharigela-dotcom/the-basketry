import { ProductCluster } from "./ProductCluster";
import { BrandStructure } from "./BrandStructure";
import { DisconnectedJourney } from "./DisconnectedJourney";
import { BasketryHub } from "./BasketryHub";
import { BrandReach } from "./BrandReach";
import { BusinessHub } from "./BusinessHub";
import { ConsumerMarket } from "./ConsumerMarket";
import { BasketIcon } from "./BasketIcon";
import { WorldRoad } from "./WorldRoad";
import { Truck } from "./Truck";

/**
 * ONE continuous miniature world, not ten slides: every environment
 * below is simply placed at its spot along the road (see
 * src/world/worldPath.ts) and left mounted for the whole journey. There
 * is no per-stage show/hide here on purpose — the camera moving toward
 * and away from each one, plus fog softening the far distance, is what
 * makes things "enter and leave naturally" instead of cutting.
 */
export function EcosystemScene() {
  return (
    <group>
      <WorldRoad />
      <Truck />

      <ProductCluster />
      <BrandStructure />
      <DisconnectedJourney />
      <BasketryHub />
      <BrandReach />
      <BusinessHub />
      <ConsumerMarket />
      <BasketIcon />

      <mesh position={[0, -2, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[420, 320]} />
        <meshStandardMaterial color="#b90710" roughness={0.95} />
      </mesh>
    </group>
  );
}
