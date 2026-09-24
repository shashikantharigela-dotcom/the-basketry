import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useSceneStore } from "../store/useSceneStore";
import { computeTruckPose } from "../world/worldPath";
import { DeliveryVehicle } from "./kit/DeliveryVehicle";
import { GLBModel } from "../components/3d/GLBModel";

// The approved THE BASKETRY truck: "Rigid box delivery truck" from 3DAssets.dev (CC0 1.0,
// commercial use allowed, no attribution required). Used exactly as provided — only placed
// here. Measured off the asset with its node transforms applied: bbox X 2.706 (width) x
// Y 3.776 (height) x Z 10.826 (length), in meters, lowest point (tyre contact) at y = -0.978,
// length spanning z -3.849..6.976 (so the model's own origin is not centered along its length).
const TRUCK_GLB_SRC = "/truck_candidate_01.glb";
const TRUCK_GLB_MIN_Y = -0.978;
const TRUCK_GLB_CENTER_Z = (-3.849 + 6.976) / 2;
// 0.22 puts the truck at ~0.6 wide on the 1.6-wide road (one lane) and ~2.4 long.
const TRUCK_GLB_SCALE = 0.22;
// Which way the model's cab faces along its local Z. The truck group's +Z is the direction
// of travel (see the lookAt below), so a cab facing -Z needs a half turn.
const TRUCK_GLB_ROTATION_Y = Math.PI;
// Wheels on the road surface, and the pivot at the middle of the truck's length so it
// tracks the road's centerline through the bends. Expressed after the model's own rotation.
const TRUCK_GLB_POSITION: [number, number, number] = [
  0,
  -TRUCK_GLB_MIN_Y * TRUCK_GLB_SCALE,
  -TRUCK_GLB_CENTER_Z * TRUCK_GLB_SCALE * Math.cos(TRUCK_GLB_ROTATION_Y),
];

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
      <GLBModel
        src={TRUCK_GLB_SRC}
        position={TRUCK_GLB_POSITION}
        rotation={[0, TRUCK_GLB_ROTATION_Y, 0]}
        scale={TRUCK_GLB_SCALE}
        castShadow={castShadow}
        fallback={
          // DeliveryVehicle's cab faces local +X; the group's +Z is forward.
          <group rotation={[0, -Math.PI / 2, 0]}>
            <DeliveryVehicle scale={1.3} />
          </group>
        }
      />
    </group>
  );
}
