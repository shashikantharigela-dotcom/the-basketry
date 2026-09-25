import { useMemo } from "react";
import * as THREE from "three";
import { Truck } from "../../../scenes/Truck";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { apronY, PARKED_TRUCK_POSE, resolvePlacement } from "./stage3Geometry";
import { HAND_TRUCK } from "./stage3Layout";

/**
 * The SECOND THE BASKETRY truck, parked in the pull-off and being unloaded.
 *
 * It is the same approved GLB, through the same Truck component the journey
 * truck uses — only its pose source is fixed instead of following scroll,
 * so the asset and its approved scale/orientation are shared, untouched.
 *
 * The GLB's cargo doors are baked into the van body (not separate parts),
 * so the open doors are simple separate panels hinged at the rear corners,
 * with a dark cargo interior and stock inside — on this parked truck only.
 */

// Measured off the GLB (see Truck.tsx): in the truck's local frame (+Z =
// forward) the van's rear face is at z = -1.191, its sides at x = ±0.281,
// its roof at y = 0.831; the cargo floor sits just above the chassis.
const REAR_Z = -1.191;
const HALF_WIDTH = 0.281;
const FLOOR_Y = 0.25;
const ROOF_Y = 0.8;
const DOOR_HEIGHT = ROOF_Y - FLOOR_Y;
const DOOR_WIDTH = HALF_WIDTH - 0.006;
/** Doors swung open ~100°, standing out behind the truck like the reference. */
const DOOR_OPEN = THREE.MathUtils.degToRad(100);

const DOOR = new THREE.MeshStandardMaterial({ color: "#d3cfc6", roughness: 0.55, metalness: 0.25, side: THREE.DoubleSide });
const DOOR_RIB = new THREE.MeshStandardMaterial({ color: "#b8b3a8", roughness: 0.5, metalness: 0.3 });
const INTERIOR = new THREE.MeshStandardMaterial({ color: "#2b2723", roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
const INTERIOR_FLOOR = new THREE.MeshStandardMaterial({ color: "#5a4a3a", roughness: 0.9, metalness: 0 });
const STEEL = new THREE.MeshStandardMaterial({ color: "#8e9296", roughness: 0.45, metalness: 0.5 });
const CARTON = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const TAPE = new THREE.MeshStandardMaterial({ color: "#c8161d", roughness: 0.6, metalness: 0 });
const RED = new THREE.MeshStandardMaterial({ color: "#c8161d", roughness: 0.5, metalness: 0.2 });
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CARTON_COLORS = [new THREE.Color("#c79b62"), new THREE.Color("#bf9258"), new THREE.Color("#d2a871")];

/** Fixed pose for the Truck component (it ignores scroll progress). */
function parkedPose(_progress: number, outPosition: THREE.Vector3, outTangent: THREE.Vector3): void {
  outPosition.copy(PARKED_TRUCK_POSE.position);
  outTangent.copy(PARKED_TRUCK_POSE.tangent);
}

/** A rear door panel with vertical ribs and a locking bar, hinged on its outer edge. */
function Door({ side }: { side: 1 | -1 }) {
  // Hinge at the rear corner; the closed panel runs inward (toward x = 0).
  return (
    <group position={[side * HALF_WIDTH, FLOOR_Y, REAR_Z]} rotation={[0, side * -DOOR_OPEN, 0]}>
      <mesh material={DOOR} position={[-side * DOOR_WIDTH * 0.5, DOOR_HEIGHT / 2, -0.008]} castShadow receiveShadow>
        <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, 0.012]} />
      </mesh>
      {[0.25, 0.5, 0.75].map((f) => (
        <mesh key={f} material={DOOR_RIB} position={[-side * DOOR_WIDTH * f, DOOR_HEIGHT / 2, -0.016]}>
          <boxGeometry args={[0.012, DOOR_HEIGHT - 0.04, 0.006]} />
        </mesh>
      ))}
      <mesh material={STEEL} position={[-side * DOOR_WIDTH * 0.62, DOOR_HEIGHT / 2, -0.022]}>
        <boxGeometry args={[0.008, DOOR_HEIGHT - 0.02, 0.008]} />
      </mesh>
    </group>
  );
}

/** Dark cargo interior across the rear opening, with cartons stacked inside. */
function CargoOpening() {
  const cartons = useMemo(() => {
    const random = createRandom(3404);
    const matrices: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const tape: THREE.Matrix4[] = [];
    // Stacks of cartons just inside the doorway (shallow fronts, drawn in
    // front of the dark opening, which itself covers the GLB's closed doors).
    for (let col = 0; col < 3; col++) {
      const layers = col === 1 ? 2 : 3 + Math.floor(random() * 2);
      for (let layer = 0; layer < layers; layer++) {
        const x = (col - 1) * 0.165 + (random() - 0.5) * 0.008;
        const y = FLOOR_Y + 0.05 + layer * 0.1;
        if (y + 0.05 > ROOF_Y - 0.02) continue;
        const z = REAR_Z - 0.03;
        matrices.push(instanceMatrix(x, y, z, 0, 0.15, 0.095, 0.04));
        colors.push(CARTON_COLORS[Math.floor(random() * CARTON_COLORS.length)]);
        tape.push(instanceMatrix(x, y + 0.048, z, 0, 0.152, 0.003, 0.024));
      }
    }
    return { matrices, colors, tape };
  }, []);
  return (
    <group>
      {/* The dark interior "void", laid just over the GLB's closed rear doors… */}
      <mesh material={INTERIOR} position={[0, (FLOOR_Y + ROOF_Y) / 2, REAR_Z - 0.006]}>
        <boxGeometry args={[HALF_WIDTH * 2 - 0.03, DOOR_HEIGHT - 0.02, 0.004]} />
      </mesh>
      {/* …with the cargo floor edge and the stacks of stock visible inside. */}
      <mesh material={INTERIOR_FLOOR} position={[0, FLOOR_Y + 0.003, REAR_Z - 0.03]} receiveShadow>
        <boxGeometry args={[HALF_WIDTH * 2 - 0.03, 0.006, 0.05]} />
      </mesh>
      <group>
        <InstancedBatch geometry={BOX} material={CARTON} matrices={cartons.matrices} colors={cartons.colors} />
        <InstancedBatch geometry={BOX} material={TAPE} matrices={cartons.tape} castShadow={false} />
      </group>
      {/* Tail-lift plate folded down behind the truck. */}
      <mesh material={STEEL} position={[0, FLOOR_Y - 0.02, REAR_Z - 0.09]} castShadow receiveShadow>
        <boxGeometry args={[HALF_WIDTH * 2 - 0.02, 0.012, 0.18]} />
      </mesh>
      {/* Two cartons set down on the plate, ready to go. */}
      <mesh geometry={BOX} position={[-0.09, FLOOR_Y + 0.03, REAR_Z - 0.1]} scale={[0.14, 0.09, 0.1]} castShadow>
        <meshStandardMaterial color="#c79b62" roughness={0.85} />
      </mesh>
      <mesh geometry={BOX} position={[0.1, FLOOR_Y + 0.03, REAR_Z - 0.08]} rotation={[0, 0.2, 0]} scale={[0.14, 0.09, 0.1]} castShadow>
        <meshStandardMaterial color="#bf9258" roughness={0.85} />
      </mesh>
    </group>
  );
}

/** A red sack trolley loaded with cartons, being wheeled toward the stall. */
function HandTruck() {
  const { x, z, yaw } = resolvePlacement(HAND_TRUCK);
  return (
    <group position={[x, apronY(x, z), z]} rotation={[0, yaw, 0]}>
      <group rotation={[-0.45, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} material={RED} position={[s * 0.045, 0.14, 0]} castShadow>
            <boxGeometry args={[0.01, 0.28, 0.01]} />
          </mesh>
        ))}
        <mesh material={RED} position={[0, 0.005, 0.03]} castShadow>
          <boxGeometry args={[0.1, 0.008, 0.06]} />
        </mesh>
        {[0, 1].map((k) => (
          <mesh key={k} geometry={BOX} position={[0, 0.05 + k * 0.088, 0.045]} scale={[0.085, 0.085, 0.08]} castShadow>
            <meshStandardMaterial color={k === 0 ? "#c79b62" : "#d2a871"} roughness={0.85} />
          </mesh>
        ))}
      </group>
      {[-1, 1].map((s) => (
        <mesh key={s} material={STEEL} position={[s * 0.055, 0.02, -0.01]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.014, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/** Orientation of the parked truck (same convention as Truck.tsx: local +Z faces its tangent). */
const TRUCK_QUATERNION = (() => {
  const helper = new THREE.Object3D();
  helper.position.copy(PARKED_TRUCK_POSE.position);
  helper.lookAt(PARKED_TRUCK_POSE.position.clone().add(PARKED_TRUCK_POSE.tangent));
  return helper.quaternion.clone();
})();

export function ParkedTruck() {
  return (
    <group>
      <Truck computePose={parkedPose} castShadow />
      <group position={PARKED_TRUCK_POSE.position} quaternion={TRUCK_QUATERNION}>
        <Door side={1} />
        <Door side={-1} />
        <CargoOpening />
      </group>
      <HandTruck />
    </group>
  );
}
