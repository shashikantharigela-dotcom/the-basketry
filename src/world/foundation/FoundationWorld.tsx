import { Truck } from "../../scenes/Truck";
import { FoundationCameraRig } from "./FoundationCameraRig";
import { FoundationLighting } from "./FoundationLighting";
import { MiniatureTerrain } from "./MiniatureTerrain";
import { SRoad } from "./SRoad";
import { computeRoadTruckPose } from "./sRoad";

/**
 * The 3D foundation: rounded miniature terrain, one continuous S-road,
 * the existing THE BASKETRY truck GLB driving it, a scroll-driven
 * cinematic camera and the miniature-world lighting. No story stages or
 * story content live here yet — those get layered on top of this world.
 */
export function FoundationWorld() {
  return (
    <>
      <FoundationLighting />
      <FoundationCameraRig />

      <MiniatureTerrain />
      <SRoad />

      {/* The existing truck component + GLB, unchanged — only its pose
          source is swapped to the S-road (see TRUCK_SYNC in sRoad.ts). */}
      <Truck computePose={computeRoadTruckPose} castShadow />
    </>
  );
}
