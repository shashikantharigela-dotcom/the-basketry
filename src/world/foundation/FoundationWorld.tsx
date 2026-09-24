import { Truck } from "../../scenes/Truck";
import { FoundationCameraRig } from "./FoundationCameraRig";
import { FoundationLighting } from "./FoundationLighting";
import { MiniatureTerrain } from "./MiniatureTerrain";
import { SRoad } from "./SRoadMesh";
import { computeRoadTruckPose } from "./sRoad";
import { Clouds } from "../environment/Clouds";
import { DistantMountains } from "../environment/DistantMountains";
import { Stage1ProductOrigin } from "../stages/stage1/Stage1ProductOrigin";

/**
 * The 3D foundation: rounded miniature terrain, one continuous S-road,
 * the existing THE BASKETRY truck GLB driving it, a scroll-driven
 * cinematic camera and the miniature-world lighting. Story stages are
 * layered into this same world beside the road (see src/world/stages/).
 */
export function FoundationWorld() {
  return (
    <>
      <FoundationLighting />
      <FoundationCameraRig />

      <DistantMountains />
      <Clouds />

      <MiniatureTerrain />
      <SRoad />

      <Stage1ProductOrigin />

      {/* The existing truck component + GLB, unchanged — only its pose
          source is swapped to the S-road (see TRUCK_SYNC in sRoad.ts). */}
      <Truck computePose={computeRoadTruckPose} castShadow />
    </>
  );
}
