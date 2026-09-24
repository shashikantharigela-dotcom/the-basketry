import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useSceneStore } from "../store/useSceneStore";
import { computeTruckPose } from "../world/worldPath";
import { DeliveryVehicle } from "./kit/DeliveryVehicle";
import { GLBModel } from "../components/3d/GLBModel";

// Measured directly off the exported asset (blender/exports/the-basketry-delivery-truck.glb):
// bbox X 5.59 (length) x Y 2.95 (height) x Z 2.64 (width, mirror-to-mirror), root origin at
// the wheel-contact ground plane. 0.3 matches the old procedural DeliveryVehicle's effective
// on-road length (1.315 local units x 1.3 scale = 1.7095) against the GLB's 5.59 length.
const TRUCK_GLB_SRC = "/models/environment/the-basketry-delivery-truck.glb";
const TRUCK_GLB_SCALE = 0.3;

const UP = new THREE.Vector3(0, 1, 0);
const position = new THREE.Vector3();
const tangent = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const orientationHelper = new THREE.Object3D();

export interface TruckProps {
  /** Where the truck sits for a given scroll progress. Defaults to the legacy world path. */
  computePose?: (progress: number, outPosition: THREE.Vector3, outTangent: THREE.Vector3) => void;
  castShadow?: boolean;
}

/** The delivery truck — present for the entire journey, its position and
 * heading driven continuously by scroll progress along the world path.
 * It never disappears and reappears between sections. */
export function Truck({ computePose = computeTruckPose, castShadow = false }: TruckProps = {}) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = useSceneStore.getState().progress;
    computePose(progress, position, tangent);

    groupRef.current.position.copy(position);
    lookTarget.copy(position).add(tangent);
    orientationHelper.position.copy(position);
    orientationHelper.up.copy(UP);
    orientationHelper.lookAt(lookTarget);
    groupRef.current.quaternion.copy(orientationHelper.quaternion);
  });

  return (
    <group ref={groupRef}>
      {/* Both the GLB and DeliveryVehicle's cab face local +X; lookAt orients
          -Z forward, so correct for that mismatch here rather than in the
          shared kit component. */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <GLBModel
          src={TRUCK_GLB_SRC}
          scale={TRUCK_GLB_SCALE}
          castShadow={castShadow}
          fallback={<DeliveryVehicle scale={1.3} />}
        />
      </group>
    </group>
  );
}
