import { Figures } from "../common/Figures";
import type { FigureSpec } from "../common/Figures";
import { ParkedDeliveryTruck, TRUCK_FLOOR_Y, TRUCK_REAR_Z } from "../common/ParkedDeliveryTruck";
import { Activations } from "./Activations";
import { EventGrounds } from "./EventGrounds";
import { FerrisWheel } from "./FerrisWheel";
import { Skyline } from "./Skyline";
import { EVENT_TRUCK_POSES, eventSurfaceY, resolve } from "./stage5Geometry";
import { STAGE5_CONSUMERS, STAGE5_STAFF, type Stage5Figure } from "./stage5Layout";

const toFigure = ({ u, offset, yaw, ...rest }: Stage5Figure): FigureSpec => {
  const placed = resolve({ u, offset, yaw });
  return { ...rest, x: placed.x, z: placed.z, yaw: placed.yaw };
};

/** The teams and the crowd, resolved from road terms into world space. */
const PEOPLE: FigureSpec[] = [...STAGE5_STAFF, ...STAGE5_CONSUMERS].map(toFigure);

/**
 * STAGE 5 — MORE ACTIVATIONS, STALLS & EXHIBITIONS. THE BASKETRY's
 * activation model has grown into a public exhibition: several distinct
 * activations (red canopy, open booth, white marquee, demo stall, sampling
 * stalls and pagoda tents), trucks unloading at both ends, crowds moving
 * between the stalls, a lit Ferris wheel and the city skyline behind.
 *
 * Visual reference: references/approved/stage5_activations_exhibitions_reference.png
 *
 * On the LEFT of the road, fanned across the outside of the bend past
 * Stage 4's district. The journey truck drives on along the same road.
 */
export function Stage5Exhibition() {
  return (
    <group name="stage5-exhibition">
      <Skyline />
      <EventGrounds />
      <FerrisWheel />
      <Activations />
      {EVENT_TRUCK_POSES.map((pose, i) => (
        <ParkedDeliveryTruck key={i} pose={pose} seed={5501 + i}>
          <mesh position={[0.12, TRUCK_FLOOR_Y + 0.03, TRUCK_REAR_Z - 0.1]} rotation={[0, -0.2, 0]} scale={[0.13, 0.09, 0.1]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#c79b62" roughness={0.85} />
          </mesh>
        </ParkedDeliveryTruck>
      ))}
      <Figures figures={PEOPLE} surfaceY={eventSurfaceY} />
    </group>
  );
}
