import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY } from "../common/placement";
import { Basket, Crate } from "./HarvestKit";
import { CRATE, PRODUCE, PRODUCE_GEOMETRY, WOOD, WOOD_DARK, fillProduce, type Placed } from "./harvest";
import { HARVEST, YARD_GATE } from "./stage1Layout";

const BARROW_RED = new THREE.MeshStandardMaterial({ color: "#c9282b", roughness: 0.45, metalness: 0.2 });
const METAL = new THREE.MeshStandardMaterial({ color: "#5d5650", roughness: 0.5, metalness: 0.4 });
const BURLAP = new THREE.MeshStandardMaterial({ color: "#cdb58a", roughness: 0.95, metalness: 0 });
const SOIL = new THREE.MeshStandardMaterial({ color: "#7a5236", roughness: 0.95, metalness: 0 });
const LEAF = new THREE.MeshStandardMaterial({ color: "#6f9a4f", roughness: 0.8, metalness: 0 });

const SQUASH = [new THREE.Color("#e38b2c"), new THREE.Color("#d9a441")];
const APPLE = new THREE.Color("#d42a1f");
const PLANTER_FLOWERS = [new THREE.Color("#fff6e6"), new THREE.Color("#f0c64e"), new THREE.Color("#e4312a")];

interface Batch {
  matrices: THREE.Matrix4[];
  colors: THREE.Color[];
}

/** A wooden pallet stacked with filled crates at the lane mouth — the
 * harvest, packed and waiting beside the road for the truck. */
function HarvestPallet({ produce }: { produce: Batch }) {
  const { x, z, rotationY } = HARVEST.pallet;
  return (
    <group position={[x, groundY(x, z), z]} rotation={[0, rotationY, 0]}>
      {[-0.1, 0, 0.1].map((lz) => (
        <mesh key={`r${lz}`} material={WOOD_DARK} position={[0, 0.015, lz]} castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.03, 0.035]} />
        </mesh>
      ))}
      {[-0.11, -0.055, 0, 0.055, 0.11].map((lx) => (
        <mesh key={`d${lx}`} material={WOOD} position={[lx, 0.036, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.045, 0.012, 0.24]} />
        </mesh>
      ))}
      {PALLET_CRATES.map((crate, i) => (
        <Crate key={i} {...crate} />
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={produce.matrices} colors={produce.colors} />
    </group>
  );
}

const PALLET_DECK = 0.042;
const PALLET_CRATES: Placed[] = [
  { x: -0.067, y: PALLET_DECK, z: -0.052, yaw: 0 },
  { x: 0.067, y: PALLET_DECK, z: -0.052, yaw: 0 },
  { x: -0.067, y: PALLET_DECK, z: 0.052, yaw: 0 },
  { x: 0.067, y: PALLET_DECK, z: 0.052, yaw: 0 },
  // One more on top of the first.
  { x: -0.06, y: PALLET_DECK + CRATE.h + 0.004, z: -0.045, yaw: 0.08 },
];

/** A little red wheelbarrow of squash at the market garden's edge. */
function Wheelbarrow({ produce }: { produce: Batch }) {
  const { x, z, rotationY } = HARVEST.wheelbarrow;
  return (
    <group position={[x, groundY(x, z), z]} rotation={[0, rotationY, 0]}>
      <mesh material={BARROW_RED} position={[0, 0.075, 0]} rotation={[0, 0, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.055, 0.13]} />
      </mesh>
      <mesh material={METAL} position={[0.13, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.035, 0.012, 8, 16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={WOOD_DARK} position={[-0.09, 0.075, s * 0.05]} rotation={[0, 0, -0.35]} castShadow>
            <cylinderGeometry args={[0.006, 0.006, 0.34, 6]} />
          </mesh>
          <mesh material={METAL} position={[-0.05, 0.022, s * 0.05]} castShadow>
            <boxGeometry args={[0.01, 0.045, 0.01]} />
          </mesh>
        </group>
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={produce.matrices} colors={produce.colors} />
    </group>
  );
}

/** Grain sacks and a short stack of crates beside the workshop door. */
function DoorSideHarvest({ produce }: { produce: Batch }) {
  const { x, z } = HARVEST.doorSide;
  return (
    <group position={[x, groundY(x, z) + 0.06, z]}>
      {[
        [0, 0, 0.1, 0.1],
        [0.075, 0, -0.02, -0.15],
        [0.02, 0.055, 0.05, 0.25],
      ].map(([sx, sy, sz, tilt], i) => (
        <mesh key={i} material={BURLAP} position={[sx, 0.04 + sy, sz]} rotation={[tilt, i, 0.12]} castShadow receiveShadow>
          <capsuleGeometry args={[0.034, 0.05, 6, 12]} />
        </mesh>
      ))}
      {DOOR_CRATES.map((crate, i) => (
        <Crate key={i} {...crate} />
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={produce.matrices} colors={produce.colors} />
    </group>
  );
}

const DOOR_CRATES: Placed[] = [
  { x: 0.05, y: 0, z: -0.19, yaw: 0.1 },
  { x: 0.06, y: CRATE.h + 0.004, z: -0.185, yaw: -0.08 },
];

/** A long planter of flowers along the workshop front. */
function Planter({ flowers }: { flowers: Batch }) {
  const { x, z } = HARVEST.planter;
  return (
    <group position={[x, groundY(x, z) + 0.06, z]}>
      <mesh material={WOOD} position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.09, 0.06, 0.52]} />
      </mesh>
      <mesh material={SOIL} position={[0, 0.061, 0]}>
        <boxGeometry args={[0.075, 0.004, 0.5]} />
      </mesh>
      {[-0.19, -0.06, 0.07, 0.2].map((lz) => (
        <mesh key={lz} material={LEAF} position={[0, 0.08, lz]} scale={[0.04, 0.03, 0.06]} castShadow>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={flowers.matrices} colors={flowers.colors} castShadow={false} />
    </group>
  );
}

/** A wooden ladder leaning into an orchard tree. */
function Ladder() {
  const { x, z, towardX, towardZ } = HARVEST.ladder;
  const yaw = Math.atan2(towardX - x, towardZ - z);
  const length = 0.46;
  return (
    <group position={[x, groundY(x, z), z]} rotation={[0, yaw, 0]}>
      <group rotation={[0.38, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} material={WOOD} position={[s * 0.035, length / 2, 0]} castShadow>
            <boxGeometry args={[0.012, length, 0.012]} />
          </mesh>
        ))}
        {[0.08, 0.16, 0.24, 0.32, 0.4].map((h) => (
          <mesh key={h} material={WOOD} position={[0, h, 0]} castShadow>
            <boxGeometry args={[0.07, 0.008, 0.008]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** An open gate in the yard fence, leading out to the greens field. */
function YardGate() {
  const [ax, az] = YARD_GATE.from;
  const [bx, bz] = YARD_GATE.to;
  const width = Math.hypot(bx - ax, bz - az) * 0.9;
  const along = Math.atan2(bx - ax, bz - az);
  return (
    <group>
      {[YARD_GATE.from, YARD_GATE.to].map(([px, pz], i) => (
        <mesh key={i} material={WOOD_DARK} position={[px, groundY(px, pz) + 0.14, pz]} castShadow>
          <boxGeometry args={[0.035, 0.3, 0.035]} />
        </mesh>
      ))}
      {/* Swung open, into the yard. */}
      <group position={[ax, groundY(ax, az), az]} rotation={[0, along - 1.25, 0]}>
        {[0.1, 0.2].map((h) => (
          <mesh key={h} material={WOOD} position={[0, h, width / 2]} castShadow>
            <boxGeometry args={[0.012, 0.02, width]} />
          </mesh>
        ))}
        <mesh material={WOOD} position={[0, 0.15, width / 2]} rotation={[Math.atan2(0.1, width), 0, 0]} castShadow>
          <boxGeometry args={[0.012, 0.018, Math.hypot(width, 0.1)]} />
        </mesh>
        <mesh material={WOOD} position={[0, 0.15, width]} castShadow>
          <boxGeometry args={[0.014, 0.14, 0.014]} />
        </mesh>
      </group>
    </group>
  );
}

/** Orchard baskets brimming with picked fruit. */
function OrchardBaskets({ produce }: { produce: Batch }) {
  return (
    <group>
      {HARVEST.orchardBaskets.map(([bx, bz], i) => (
        <Basket key={i} x={bx} y={groundY(bx, bz)} z={bz} yaw={0} />
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={produce.matrices} colors={produce.colors} />
    </group>
  );
}

/**
 * The working details of the farm that tell "products start here":
 * harvest packed on a pallet by the road, a wheelbarrow of squash, sacks
 * and crates at the workshop door, a flower planter, a ladder and baskets
 * in the orchard, and an open gate out to the fields.
 */
export function FarmProps() {
  const batches = useMemo(() => {
    const random = createRandom(5151);
    const pallet: Batch = { matrices: [], colors: [] };
    for (const crate of PALLET_CRATES.slice(1)) {
      fillProduce(random, pallet, crate.x, crate.y + CRATE.h - 0.008, crate.z, crate.yaw, 3, 2, 0.04, 0.04);
    }

    const barrow: Batch = { matrices: [], colors: [] };
    for (let i = 0; i < 2; i++) {
      fillProduce(random, barrow, -0.04 + i * 0.07, 0.11, 0, 0, 2, 2, 0.045, 0.045, SQUASH[i]);
    }

    const door: Batch = { matrices: [], colors: [] };
    const top = DOOR_CRATES[1];
    fillProduce(random, door, top.x, top.y + CRATE.h - 0.008, top.z, top.yaw, 3, 2, 0.04, 0.04);

    const flowers: Batch = { matrices: [], colors: [] };
    const scale = new THREE.Vector3();
    for (let i = 0; i < 26; i++) {
      const r = 0.012 + random() * 0.006;
      flowers.matrices.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3((random() - 0.5) * 0.06, 0.09 + random() * 0.03, (random() - 0.5) * 0.48),
          new THREE.Quaternion(),
          scale.set(r, r, r)
        )
      );
      flowers.colors.push(PLANTER_FLOWERS[Math.floor(random() * PLANTER_FLOWERS.length)]);
    }

    const orchard: Batch = { matrices: [], colors: [] };
    for (const [bx, bz] of HARVEST.orchardBaskets) {
      fillProduce(random, orchard, bx, groundY(bx, bz) + 0.045, bz, 0, 2, 2, 0.032, 0.032, APPLE);
    }
    return { pallet, barrow, door, flowers, orchard };
  }, []);

  return (
    <group>
      <HarvestPallet produce={batches.pallet} />
      <Wheelbarrow produce={batches.barrow} />
      <DoorSideHarvest produce={batches.door} />
      <Planter flowers={batches.flowers} />
      <Ladder />
      <YardGate />
      <OrchardBaskets produce={batches.orchard} />
    </group>
  );
}
