import { ProductCluster } from "./ProductCluster";
import { BrandStructure } from "./BrandStructure";
import { DisconnectedJourney } from "./DisconnectedJourney";
import { BasketryHub } from "./BasketryHub";
import { BrandReach } from "./BrandReach";
import { BusinessHub } from "./BusinessHub";
import { ConsumerMarket } from "./ConsumerMarket";
import { EcosystemWeb } from "./EcosystemWeb";
import { DemandLoop } from "./DemandLoop";
import { BasketIcon } from "./BasketIcon";
import { StageVisibility } from "./StageVisibility";

/** The full ten-stage world, laid out along the camera's dolly track.
 * Each stage occupies its own depth slice and is explicitly hidden
 * outside its own scroll range (StageVisibility) so a neighboring stage
 * never reads through in the background — fog and framing alone aren't
 * a reliable enough separation. */
export function EcosystemScene() {
  return (
    <group>
      <StageVisibility stageId="products">
        <ProductCluster />
      </StageVisibility>
      <StageVisibility stageId="brand">
        <BrandStructure />
      </StageVisibility>
      <StageVisibility stageId="disconnected">
        <DisconnectedJourney />
      </StageVisibility>
      <StageVisibility stageId="basketry">
        <BasketryHub />
      </StageVisibility>
      <StageVisibility stageId="brandReach">
        <BrandReach />
      </StageVisibility>
      <StageVisibility stageId="businessSourcing">
        <BusinessHub />
      </StageVisibility>
      <StageVisibility stageId="consumerMarket">
        <ConsumerMarket />
      </StageVisibility>
      <StageVisibility stageId="ecosystem">
        <EcosystemWeb />
      </StageVisibility>
      <StageVisibility stageId="demandLoop">
        <DemandLoop />
      </StageVisibility>
      <StageVisibility stageId="finalStatement">
        <BasketIcon />
      </StageVisibility>

      {/* Wide enough in X to stay under the frame even for the more
          oblique camera keyframes, not just straight-down-the-track shots. */}
      <mesh position={[0, -2, -55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 260]} />
        <meshStandardMaterial color="#171717" roughness={0.95} />
      </mesh>
    </group>
  );
}
