import { Truck } from "../../scenes/Truck";
import { FoundationCameraRig } from "./FoundationCameraRig";
import { FoundationLighting } from "./FoundationLighting";
import { MiniatureLens } from "./MiniatureLens";
import { MiniatureTerrain } from "./MiniatureTerrain";
import { SRoad } from "./SRoadMesh";
import { computeRoadTruckPose } from "./sRoad";
import { Clouds } from "../environment/Clouds";
import { DistantMountains } from "../environment/DistantMountains";
import { WorldVegetation } from "../environment/WorldVegetation";
import { Stage1ProductOrigin } from "../stages/stage1/Stage1ProductOrigin";
import { Stage2ProductApproaches } from "../stages/stage2/Stage2ProductApproaches";

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
      <WorldVegetation />

      <Stage1ProductOrigin />
      <Stage2ProductApproaches />

      {/* The existing truck component + GLB, unchanged — only its pose
          source is swapped to the S-road (see TRUCK_SYNC in sRoad.ts). */}
      <Truck computePose={computeRoadTruckPose} castShadow />

      <MiniatureLens />
    </>
  );
}
