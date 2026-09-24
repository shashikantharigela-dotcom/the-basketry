import { CropField } from "../common/CropField";
import { FarmBuildings } from "./FarmBuildings";
import { FarmPaths } from "./FarmPaths";
import { FarmProps } from "./FarmProps";
import { ProduceStand } from "./ProduceStand";
import { Scatter } from "./Scatter";
import { Trees } from "./Trees";
import { FENCES, FIELDS, FIGURES, HEDGES } from "./stage1Layout";
import { Figures } from "../common/Figures";
import { Fences } from "../common/Fences";
import { Hedgerows } from "../common/Hedgerows";

/**
 * STAGE 1 — PRODUCT ORIGIN. "Good products start somewhere."
 *
 * A small working farm set beside the first S-bend of the shared road,
 * composed as one connected place: the producer's workshop and produce
 * stand at its heart, a market garden beside the road, an orchard, crop
 * fields, a lane and tracks tying them together, hedges and fences, and
 * the harvest itself — packed on a pallet by the road for the truck.
 *
 * It is not a separate scene — just more of the one continuous world,
 * placed in world coordinates next to the road (see stage1Layout.ts). Its
 * level building pads and vegetation keep-outs reach the shared world via
 * stages/worldZones.ts.
 */
export function Stage1ProductOrigin() {
  return (
    <group name="stage1-product-origin">
      {FIELDS.map((field, i) => (
        <CropField key={field.kind} field={field} seed={100 + i} />
      ))}
      <FarmBuildings />
      <ProduceStand />
      <FarmProps />
      <FarmPaths />
      <Fences lines={FENCES} />
      <Hedgerows lines={HEDGES} seed={6262} />
      <Trees />
      <Figures figures={FIGURES} />
      <Scatter />
    </group>
  );
}
