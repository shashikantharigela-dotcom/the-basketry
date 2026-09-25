import { Figures } from "../common/Figures";
import type { FigureSpec } from "../common/Figures";
import { ParkedDeliveryTruck, TRUCK_FLOOR_Y, TRUCK_REAR_Z } from "../common/ParkedDeliveryTruck";
import { ConsumerActivation } from "./ConsumerActivation";
import { DistrictLife } from "./DistrictLife";
import { paveY, PARKED_TRUCK_POSE, resolve } from "./stage4Geometry";
import { STAGE4_CONSUMERS, STAGE4_STAFF, type Stage4Figure } from "./stage4Layout";
import { Streetscape } from "./Streetscape";
import { UrbanBuildings } from "./UrbanBuildings";

const toFigure = ({ u, offset, yaw, ...rest }: Stage4Figure): FigureSpec => {
  const placed = resolve({ u, offset, yaw });
  return { ...rest, x: placed.x, z: placed.z, yaw: placed.yaw };
};

/** The team and the consumers, resolved from road terms into world space. */
const PEOPLE: FigureSpec[] = [...STAGE4_STAFF, ...STAGE4_CONSUMERS].map(toFigure);

/**
 * STAGE 4 — CONSUMER APPROACHES & EXPERIENCES PRODUCTS. The activation is
 * established; people notice it, approach, browse, taste, talk with the
 * team and leave with the products.
 *
 * Visual reference: references/approved/stage4_consumer_experience_reference.png
 *
 * The road enters a modern mixed-use district: on a paved plaza on the
 * right of the road — between apartment blocks and glass offices — stands
 * the large red THE BASKETRY canopy with stocked shelves and a tasting
 * counter, display tables, plinths and basket displays, busy with
 * consumers and the team in brand red. A second truck in the lay-by beyond
 * brings more stock. The journey truck drives on along the same road.
 */
export function Stage4ConsumerExperience() {
  return (
    <group name="stage4-consumer-experience">
      <UrbanBuildings />
      <Streetscape />
      <DistrictLife />
      <ConsumerActivation />
      <ParkedDeliveryTruck pose={PARKED_TRUCK_POSE} seed={4404}>
        {/* A carton waiting on the tail lift. */}
        <mesh position={[-0.12, TRUCK_FLOOR_Y + 0.03, TRUCK_REAR_Z - 0.1]} rotation={[0, 0.15, 0]} scale={[0.13, 0.09, 0.1]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#c79b62" roughness={0.85} />
        </mesh>
      </ParkedDeliveryTruck>
      <Figures figures={PEOPLE} surfaceY={paveY} />
    </group>
  );
}
