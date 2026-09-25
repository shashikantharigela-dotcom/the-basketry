import { Figures } from "../common/Figures";
import { EcosystemBuildings } from "./EcosystemBuildings";
import { EstateGrounds } from "./EstateGrounds";
import { Signage } from "./Signage";
import { lawnY, plazaY } from "./stage6Geometry";
import { PLAZA, STAGE6_PEOPLE } from "./stage6Layout";

/** On the plaza paving inside the U, else on the terraced lawns. */
function surfaceY(x: number, z: number): number {
  const onPlaza = x >= PLAZA.minX && x <= PLAZA.maxX && z >= PLAZA.minZ && z <= PLAZA.maxZ;
  return onPlaza ? plazaY(x, z) : lawnY(x, z);
}

/**
 * STAGE 6 — THE BASKETRY ECOSYSTEM. The destination the whole journey has
 * led to: a large U-shaped complex at the end of the S-road — community,
 * work, product experience and exhibition under one roof line — round a
 * landscaped plaza with the basket sculpture at its heart. The road enters
 * the U's open side and becomes the arrival loop; the journey truck arrives.
 * Seen from the final elevated camera with every earlier stage along the road.
 */
export function Stage6Ecosystem() {
  return (
    <group name="stage6-ecosystem">
      <EstateGrounds />
      <EcosystemBuildings />
      <Signage />
      <Figures figures={STAGE6_PEOPLE} surfaceY={surfaceY} />
    </group>
  );
}
