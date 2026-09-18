import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useSceneStore } from "../store/useSceneStore";
import { computeTruckPose } from "../world/worldPath";
import { DeliveryVehicle } from "./kit/DeliveryVehicle";

const UP = new THREE.Vector3(0, 1, 0);
const position = new THREE.Vector3();
const tangent = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const orientationHelper = new THREE.Object3D();

/** The delivery truck — present for the entire journey, its position and
 * heading driven continuously by scroll progress along the world path.
 * It never disappears and reappears between sections. */
export function Truck() {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = useSceneStore.getState().progress;
    computeTruckPose(progress, position, tangent);

    groupRef.current.position.copy(position);
    lookTarget.copy(position).add(tangent);
    orientationHelper.position.copy(position);
    orientationHelper.up.copy(UP);
    orientationHelper.lookAt(lookTarget);
    groupRef.current.quaternion.copy(orientationHelper.quaternion);
  });

  return (
    <group ref={groupRef}>
      {/* DeliveryVehicle's cab faces local +X; lookAt orients -Z forward,
          so correct for that mismatch here rather than in the shared kit
          component. */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <DeliveryVehicle scale={1.3} />
      </group>
    </group>
  );
}
