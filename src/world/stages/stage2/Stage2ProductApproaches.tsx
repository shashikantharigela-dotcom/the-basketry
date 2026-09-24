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
 * Master visual reference: references/approved/stage2_product_approaches_reference.png
 *
 * A producer's processing facility on a raised, stone-walled terrace inside
 * the road's second bend: a cream hall with a red standing-seam roof, a
 * loading canopy, twin silos and an organised yard of pallets, crates and
 * baskets. At its heart, display tables of product samples where the
 * producer team presents and THE BASKETRY representative evaluates. Around
 * it: crop terraces, an orange orchard, cypresses, limestone and fences.
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
