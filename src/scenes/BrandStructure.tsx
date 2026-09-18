import * as THREE from "three";
import { getStage } from "../narrative/narrativeConfig";
import { MiniBuilding } from "./kit/MiniBuilding";
import { Pallet } from "./kit/Pallet";
import { MiniTree } from "./kit/Vegetation";

const FLOOR_Y = -1.3;
const DOCK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.08 });

/** A miniature manufacturing/brand facility: a factory with a chimney
 * and loading dock, pallets of packaged goods, and a paved yard — an
 * actual place, not abstract columns and platforms. The delivery
 * vehicle isn't a static prop here: it's the one truck (see
 * scenes/Truck.tsx) driving continuously through the whole world, so it
 * departs from this yard rather than a duplicate parked truck. */
export function BrandStructure() {
  const stage = getStage("brand");

  return (
    <group position={stage.anchor}>
      <MiniBuilding
        position={[0.8, FLOOR_Y, -5.2]}
        rotationY={0.25}
        width={2.6}
        depth={1.9}
        wallHeight={1.35}
        roofType="sawtooth"
        chimney
        scale={1.15}
      />

      <mesh material={DOCK_MATERIAL} position={[1.6, FLOOR_Y + 0.1, -2.6]}>
        <boxGeometry args={[1.3, 0.2, 1.0]} />
      </mesh>

      <Pallet position={[1.3, FLOOR_Y + 0.2, -2.2]} rotationY={0.3} boxCount={3} scale={1.1} />
      <Pallet position={[2.1, FLOOR_Y + 0.2, -2.7]} rotationY={-0.2} boxCount={2} scale={0.95} />

      <MiniTree position={[3.1, FLOOR_Y, 0.6]} scale={1.4} />
      <MiniTree position={[0.3, FLOOR_Y, 1.6]} scale={1.1} />
    </group>
  );
}
