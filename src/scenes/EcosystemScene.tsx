import { ProductCluster } from "./ProductCluster";
import { BrandStructure } from "./BrandStructure";
import { DisconnectedJourney } from "./DisconnectedJourney";
import { BasketryHub } from "./BasketryHub";
import { StageVisibility } from "./StageVisibility";

/** The full four-stage world, laid out along the camera's dolly track.
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

      <mesh position={[0, -2, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#171717" roughness={0.95} />
      </mesh>
    </group>
  );
}
