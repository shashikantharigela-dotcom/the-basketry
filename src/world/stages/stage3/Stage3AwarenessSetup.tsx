import { Figures } from "../common/Figures";
import type { FigureSpec } from "../common/Figures";
import { ActivationStall } from "./ActivationStall";
import { ParkedTruck } from "./ParkedTruck";
import { Stage3Surroundings } from "./Stage3Surroundings";
import { apronY, resolvePlacement } from "./stage3Geometry";
import { STAGE3_FIGURES } from "./stage3Layout";

/** The small setup team, resolved from road terms into world space. */
const FIGURES: FigureSpec[] = STAGE3_FIGURES.map(({ u, offset, yaw, ...rest }) => {
  const placed = resolvePlacement({ u, offset, yaw });
  return { ...rest, x: placed.x, z: placed.z, yaw: placed.yaw };
});

/**
 * STAGE 3 — AWARENESS SETUP. THE BASKETRY has arrived: products are being
 * unloaded, the activation is being built, awareness is beginning.
 *
 * Visual reference: references/approved/stage3_awareness_setup_reference.png
 *
 * On a flat apron on the inside of the road's third bend: a second
 * THE BASKETRY truck parked in a pull-off with its rear doors open, a
 * small team carrying cartons from it to a temporary branded activation —
 * red canopy, display shelves being stocked, a sampling counter, parasols,
 * standee banners and bunting — among village homes, mango and coconut
 * palms, bananas and bougainvillea. Deliberately few people: the crowd is
 * Stage 4. The journey truck drives on along the same road.
 */
export function Stage3AwarenessSetup() {
  return (
    <group name="stage3-awareness-setup">
      <Stage3Surroundings />
      <ActivationStall />
      <ParkedTruck />
      <Figures figures={FIGURES} surfaceY={apronY} />
    </group>
  );
}
