import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { Truck } from "../../../scenes/Truck";
import { InstancedBatch } from "./InstancedBatch";
import { createRandom, instanceMatrix } from "./placement";

// Shared across stages: a THE BASKETRY truck parked with its rear doors open.
// It is the same approved GLB through the same Truck component the journey
// truck uses — only the pose is fixed instead of following scroll. The GLB's
// cargo doors are baked into the van body, so the open doors are separate
// panels hinged at the rear corners, with a dark cargo interior and stock.

// Measured off the GLB (see Truck.tsx), in the truck's local frame (+Z =
// forward): the van's rear face, its sides, the cargo floor and the roof.
export const TRUCK_REAR_Z = -1.191;
export const TRUCK_HALF_WIDTH = 0.281;
export const TRUCK_FLOOR_Y = 0.25;
const ROOF_Y = 0.8;
const DOOR_HEIGHT = ROOF_Y - TRUCK_FLOOR_Y;
const DOOR_WIDTH = TRUCK_HALF_WIDTH - 0.006;
const DOOR_OPEN = THREE.MathUtils.degToRad(100);

const DOOR = new THREE.MeshStandardMaterial({ color: "#d3cfc6", roughness: 0.55, metalness: 0.25, side: THREE.DoubleSide });
const DOOR_RIB = new THREE.MeshStandardMaterial({ color: "#b8b3a8", roughness: 0.5, metalness: 0.3 });
const INTERIOR = new THREE.MeshStandardMaterial({ color: "#2b2723", roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
const INTERIOR_FLOOR = new THREE.MeshStandardMaterial({ color: "#5a4a3a", roughness: 0.9, metalness: 0 });
const STEEL = new THREE.MeshStandardMaterial({ color: "#8e9296", roughness: 0.45, metalness: 0.5 });
const CARTON = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const TAPE = new THREE.MeshStandardMaterial({ color: "#c8161d", roughness: 0.6, metalness: 0 });
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CARTON_COLORS = [new THREE.Color("#c79b62"), new THREE.Color("#bf9258"), new THREE.Color("#d2a871")];

export interface TruckPose {
  position: THREE.Vector3;
  /** Horizontal unit vector the truck faces. */
  tangent: THREE.Vector3;
}

function Door({ side }: { side: 1 | -1 }) {
  return (
    <group position={[side * TRUCK_HALF_WIDTH, TRUCK_FLOOR_Y, TRUCK_REAR_Z]} rotation={[0, side * -DOOR_OPEN, 0]}>
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

function CargoOpening({ seed }: { seed: number }) {
  const cartons = useMemo(() => {
    const random = createRandom(seed);
    const matrices: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const tape: THREE.Matrix4[] = [];
    for (let col = 0; col < 3; col++) {
      const layers = 3 + Math.floor(random() * 2);
      for (let layer = 0; layer < layers; layer++) {
        const x = (col - 1) * 0.165 + (random() - 0.5) * 0.008;
        const y = TRUCK_FLOOR_Y + 0.05 + layer * 0.1;
        if (y + 0.05 > ROOF_Y - 0.02) continue;
        const z = TRUCK_REAR_Z - 0.03;
        matrices.push(instanceMatrix(x, y, z, 0, 0.15, 0.095, 0.04));
        colors.push(CARTON_COLORS[Math.floor(random() * CARTON_COLORS.length)]);
        tape.push(instanceMatrix(x, y + 0.048, z, 0, 0.152, 0.003, 0.024));
      }
    }
    return { matrices, colors, tape };
  }, [seed]);
  return (
    <group>
      <mesh material={INTERIOR} position={[0, (TRUCK_FLOOR_Y + ROOF_Y) / 2, TRUCK_REAR_Z - 0.006]}>
        <boxGeometry args={[TRUCK_HALF_WIDTH * 2 - 0.03, DOOR_HEIGHT - 0.02, 0.004]} />
      </mesh>
      <mesh material={INTERIOR_FLOOR} position={[0, TRUCK_FLOOR_Y + 0.003, TRUCK_REAR_Z - 0.03]} receiveShadow>
        <boxGeometry args={[TRUCK_HALF_WIDTH * 2 - 0.03, 0.006, 0.05]} />
      </mesh>
      <InstancedBatch geometry={BOX} material={CARTON} matrices={cartons.matrices} colors={cartons.colors} />
      <InstancedBatch geometry={BOX} material={TAPE} matrices={cartons.tape} castShadow={false} />
      {/* Tail-lift plate folded down behind the truck. */}
      <mesh material={STEEL} position={[0, TRUCK_FLOOR_Y - 0.02, TRUCK_REAR_Z - 0.09]} castShadow receiveShadow>
        <boxGeometry args={[TRUCK_HALF_WIDTH * 2 - 0.02, 0.012, 0.18]} />
      </mesh>
    </group>
  );
}

/** The parked truck with open rear doors; `children` render in the truck's
 * local frame (e.g. stock on the tail lift). */
export function ParkedDeliveryTruck({ pose, seed = 3404, children }: { pose: TruckPose; seed?: number; children?: ReactNode }) {
  const { computePose, quaternion } = useMemo(() => {
    const helper = new THREE.Object3D();
    helper.position.copy(pose.position);
    helper.lookAt(pose.position.clone().add(pose.tangent));
    return {
      computePose: (_progress: number, outPosition: THREE.Vector3, outTangent: THREE.Vector3) => {
        outPosition.copy(pose.position);
        outTangent.copy(pose.tangent);
      },
      quaternion: helper.quaternion.clone(),
    };
  }, [pose]);
  return (
    <group>
      <Truck computePose={computePose} castShadow />
      <group position={pose.position} quaternion={quaternion}>
        <Door side={1} />
        <Door side={-1} />
        <CargoOpening seed={seed} />
        {children}
      </group>
    </group>
  );
}
