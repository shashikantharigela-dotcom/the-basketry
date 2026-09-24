import { CropField } from "./CropField";
import { FarmBuildings } from "./FarmBuildings";
import { FarmLane } from "./FarmLane";
import { Fences } from "./Fences";
import { Figures } from "./Figures";
import { ProduceStand } from "./ProduceStand";
import { Scatter } from "./Scatter";
import { Trees } from "./Trees";
import { FIELDS } from "./stage1Layout";

/**
 * STAGE 1 — PRODUCT ORIGIN. "Good products start somewhere."
 *
 * A small working farm set beside the first S-bend of the shared road:
 * crop fields, an orchard, the producer's workshop with a farm-gate
 * produce stand, fences, a lane and lived-in landscape detail. It is not a
 * separate scene — just more of the one continuous world, placed in world
 * coordinates next to the road (see stage1Layout.ts). Its ground palette
 * and level building pads reach the shared terrain via stages/worldZones.ts.
 */
export function Stage1ProductOrigin() {
  return (
    <group name="stage1-product-origin">
      {FIELDS.map((field, i) => (
        <CropField key={field.kind} field={field} seed={100 + i} />
      ))}
      <FarmBuildings />
      <ProduceStand />
      <FarmLane />
      <Fences />
      <Trees />
      <Figures />
      <Scatter />
    </group>
  );
}
