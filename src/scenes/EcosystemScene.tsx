import { ProductCluster } from "./ProductCluster";
import { BrandStructure } from "./BrandStructure";
import { DisconnectedJourney } from "./DisconnectedJourney";
import { BasketryHub } from "./BasketryHub";

/** The full four-stage world, laid out along the camera's dolly track.
 * Each stage occupies its own depth slice; fog and framing (see CameraRig
 * and ExperienceCanvas) do the work of keeping focus on the current one. */
export function EcosystemScene() {
  return (
    <group>
      <ProductCluster />
      <BrandStructure />
      <DisconnectedJourney />
      <BasketryHub />

      <mesh position={[0, -2, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#171717" roughness={0.95} />
      </mesh>
    </group>
  );
}
