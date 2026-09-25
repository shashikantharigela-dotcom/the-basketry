import { Figures } from "../common/Figures";
import { FacilityBuildings } from "./FacilityBuildings";
import { Surroundings } from "./Surroundings";
import { Terrace } from "./Terrace";
import { YardProps } from "./YardProps";
import { TERRACE_TOP } from "./stage2Geometry";
import { STAGE2_FIGURES } from "./stage2Layout";

const terraceSurface = () => TERRACE_TOP;

/**
 * STAGE 2 — THE BASKETRY APPROACHES PRODUCTS. Product evaluation and discovery.
 *
 * Master visual reference: references/approved/stage2_product_approaches_reference_v2.png
 *
 * A local producer's facility in a lush Indian agricultural landscape,
 * inside the road's second bend: a cream plastered building with a red
 * corrugated roof carrying solar panels and a water tank, a shaded
 * verandah, a courtyard behind a low plastered wall full of bougainvillea
 * and potted plants. At its heart, a long table of product samples where
 * the producer presents and THE BASKETRY evaluates; loading sits quietly
 * behind. Around it: banana, mango and coconut palms, vegetable beds,
 * fruit trees and paddy fields.
 *
 * Part of the one continuous world — placed beside the same road the truck
 * drives, straight on from Stage 1 (see stage2Layout.ts / stage2Geometry.ts).
 */
export function Stage2ProductApproaches() {
  return (
    <group name="stage2-product-approaches">
      <Terrace />
      <FacilityBuildings />
      <YardProps />
      <Figures figures={STAGE2_FIGURES} surfaceY={terraceSurface} />
      <Surroundings />
    </group>
  );
}
