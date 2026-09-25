import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { InstancedBatch } from "../common/InstancedBatch";
import { Basket, Crate } from "../common/HarvestKit";
import { CRATE, PRODUCE, PRODUCE_COLORS, PRODUCE_GEOMETRY, WOOD, WOOD_DARK, fillProduce, type Placed } from "../common/harvest";
import { createRandom } from "../common/placement";
import { BENCH, EVALUATION, FORKLIFT, PALLET_JACK, PALLETS, POTTED_PLANTS } from "./stage2Layout";
import { TERRACE_TOP } from "./stage2Geometry";

const TABLE_TOP = new THREE.MeshStandardMaterial({ color: "#c9a06c", roughness: 0.7, metalness: 0 });
const SACK = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95, metalness: 0 });
const BOWL = new THREE.MeshStandardMaterial({ color: "#d8c3a0", roughness: 0.8, metalness: 0, side: THREE.DoubleSide });
const GRAIN = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95, metalness: 0 });
const FORKLIFT_RED = new THREE.MeshStandardMaterial({ color: "#c9282b", roughness: 0.4, metalness: 0.25 });
const DARK = new THREE.MeshStandardMaterial({ color: "#3a3533", roughness: 0.6, metalness: 0.3 });
const STEEL = new THREE.MeshStandardMaterial({ color: "#9a9ea2", roughness: 0.4, metalness: 0.7 });
const TERRACOTTA = new THREE.MeshStandardMaterial({ color: "#b8603f", roughness: 0.85, metalness: 0 });
const LEAF = new THREE.MeshStandardMaterial({ color: "#5d8c3e", roughness: 0.8, metalness: 0 });
const BENCH_WOOD = new THREE.MeshStandardMaterial({ color: "#8c6440", roughness: 0.8, metalness: 0 });
const CLOTH = new THREE.MeshStandardMaterial({ color: "#f3ead6", roughness: 0.85, metalness: 0 });
const POT_GEOMETRY = new THREE.CylinderGeometry(0.045, 0.034, 0.075, 14);

const SACK_GEOMETRY = new RoundedBoxGeometry(1, 1, 1, 2, 0.35);
const BOWL_GEOMETRY = new THREE.LatheGeometry(
  [new THREE.Vector2(0, 0), new THREE.Vector2(0.04, 0.002), new THREE.Vector2(0.058, 0.022), new THREE.Vector2(0.062, 0.03)],
  20
);
const GRAIN_GEOMETRY = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);

// Cream/white sacks, and the colours of sampled goods: grains, pulses, spices, greens.
const SACK_COLORS = [new THREE.Color("#efe6d2"), new THREE.Color("#e6dac2"), new THREE.Color("#d8c7a4")];
const GRAIN_COLORS = [
  new THREE.Color("#e2b75a"),
  new THREE.Color("#c9572c"),
  new THREE.Color("#9aa64f"),
  new THREE.Color("#efe3c4"),
  new THREE.Color("#b1462b"),
  new THREE.Color("#d8a44a"),
];

interface Batch {
  matrices: THREE.Matrix4[];
  colors: THREE.Color[];
}

const PALLET_DECK = 0.042;

function PalletBase() {
  return (
    <group>
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
    </group>
  );
}

const PALLET_CRATES: Placed[] = [
  { x: -0.067, y: PALLET_DECK, z: -0.052, yaw: 0 },
  { x: 0.067, y: PALLET_DECK, z: -0.052, yaw: 0 },
  { x: -0.067, y: PALLET_DECK, z: 0.052, yaw: 0 },
  { x: 0.067, y: PALLET_DECK, z: 0.052, yaw: 0 },
];

/** The evaluation table: a long timber table with a cream cloth, set with
 * sample bowls of grains, pulses and spices and crates of fresh produce —
 * what the producer is showing and THE BASKETRY is examining. */
function EvaluationTable() {
  const spec = EVALUATION.table;
  const L = spec.length;
  const setting = useMemo(() => {
    const random = createRandom(9100);
    const produce: Batch = { matrices: [], colors: [] };
    const grains: Batch = { matrices: [], colors: [] };
    const crates: Placed[] = [
      { x: -L / 2 + 0.12, y: 0.2, z: 0.02, yaw: 0.05 },
      { x: L / 2 - 0.12, y: 0.2, z: -0.02, yaw: -0.08 },
    ];
    for (const crate of crates) {
      fillProduce(random, produce, crate.x, crate.y + CRATE.h - 0.008, crate.z, crate.yaw, 3, 2, 0.04, 0.04);
    }
    const bowls: Array<[number, number]> = [];
    for (let i = 0; i < 6; i++) {
      const bx = -L / 2 + 0.3 + (i % 3) * 0.17 + (i < 3 ? 0 : 0.08);
      const bz = i < 3 ? -0.07 : 0.07;
      bowls.push([bx, bz]);
      grains.matrices.push(
        new THREE.Matrix4().compose(new THREE.Vector3(bx, 0.2 + 0.018, bz), new THREE.Quaternion(), new THREE.Vector3(0.05, 0.02, 0.05))
      );
      grains.colors.push(GRAIN_COLORS[i % GRAIN_COLORS.length]);
    }
    // A small basket of samples in the middle.
    fillProduce(random, produce, 0.33, 0.2 + 0.045, 0.0, 0, 2, 2, 0.032, 0.032, PRODUCE_COLORS[0]);
    return { crates, bowls, produce, grains };
  }, [L]);

  return (
    <group position={[spec.x, TERRACE_TOP, spec.z]} rotation={[0, spec.rotationY, 0]}>
      <mesh material={TABLE_TOP} position={[0, 0.185, 0]} castShadow receiveShadow>
        <boxGeometry args={[L, 0.022, 0.3]} />
      </mesh>
      <mesh material={CLOTH} position={[0, 0.198, 0]} receiveShadow>
        <boxGeometry args={[L - 0.12, 0.004, 0.26]} />
      </mesh>
      {[
        [-L / 2 + 0.04, -0.12],
        [L / 2 - 0.04, -0.12],
        [-L / 2 + 0.04, 0.12],
        [L / 2 - 0.04, 0.12],
      ].map(([lx, lz], i) => (
        <mesh key={i} material={WOOD_DARK} position={[lx, 0.09, lz]} castShadow>
          <boxGeometry args={[0.025, 0.18, 0.025]} />
        </mesh>
      ))}
      {setting.crates.map((crate, i) => (
        <Crate key={i} {...crate} />
      ))}
      <Basket x={0.33} y={0.2} z={0} yaw={0} />
      {setting.bowls.map(([bx, bz], i) => (
        <mesh key={i} geometry={BOWL_GEOMETRY} material={BOWL} position={[bx, 0.2, bz]} castShadow receiveShadow />
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={setting.produce.matrices} colors={setting.produce.colors} />
      <InstancedBatch geometry={GRAIN_GEOMETRY} material={GRAIN} matrices={setting.grains.matrices} colors={setting.grains.colors} />
    </group>
  );
}

/** Raw materials beside the table: a few filled sacks, one open, and baskets. */
function RawMaterials() {
  const { x, z, rotationY } = EVALUATION.rawMaterials;
  const layout = useMemo(() => {
    const random = createRandom(9400);
    const produce: Batch = { matrices: [], colors: [] };
    const baskets: Placed[] = [
      { x: 0.2, y: 0, z: 0.1, yaw: 0 },
      { x: 0.32, y: 0, z: -0.06, yaw: 0 },
    ];
    for (const basket of baskets) {
      fillProduce(random, produce, basket.x, basket.y + 0.045, basket.z, 0, 2, 2, 0.032, 0.032,
        PRODUCE_COLORS[Math.floor(random() * PRODUCE_COLORS.length)]);
    }
    return { produce, baskets };
  }, []);
  return (
    <group position={[x, TERRACE_TOP, z]} rotation={[0, rotationY, 0]}>
      {[
        [-0.1, 0, 0.05, 0.1],
        [-0.02, 0, -0.08, -0.2],
        [-0.18, 0, -0.1, 0.3],
      ].map(([sx, sy, sz, r], i) => (
        <mesh key={i} geometry={SACK_GEOMETRY} material={SACK} position={[sx, 0.045 + sy, sz]} rotation={[0, r, 0]} scale={[0.09, 0.09, 0.075]} castShadow receiveShadow />
      ))}
      <mesh geometry={GRAIN_GEOMETRY} material={GRAIN} position={[-0.1, 0.09, 0.05]} scale={[0.035, 0.02, 0.03]} />
      {layout.baskets.map((basket, i) => (
        <Basket key={i} {...basket} />
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={layout.produce.matrices} colors={layout.produce.colors} />
    </group>
  );
}

/** A spread of sample bowls, baskets and crates laid out on the yard —
 * the variety of goods on offer, the reference's foreground display. */
function SampleSpread() {
  const { x, z, rotationY } = EVALUATION.samples;
  const layout = useMemo(() => {
    const random = createRandom(9300);
    const bowls: Array<[number, number]> = [];
    const grains: Batch = { matrices: [], colors: [] };
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const bx = (col - 1.5) * 0.14 + (random() - 0.5) * 0.02;
        const bz = 0.22 + row * 0.14 + (random() - 0.5) * 0.02;
        bowls.push([bx, bz]);
        grains.matrices.push(
          new THREE.Matrix4().compose(new THREE.Vector3(bx, 0.018, bz), new THREE.Quaternion(), new THREE.Vector3(0.055, 0.022, 0.055))
        );
        grains.colors.push(GRAIN_COLORS[(row * 4 + col) % GRAIN_COLORS.length]);
      }
    }
    const crates: Placed[] = [
      { x: -0.18, y: 0, z: -0.05, yaw: 0.1 },
      { x: -0.03, y: 0, z: -0.06, yaw: -0.05 },
      { x: 0.12, y: 0, z: -0.04, yaw: 0.12 },
      { x: -0.1, y: CRATE.h + 0.004, z: -0.05, yaw: -0.05 },
    ];
    const produce: Batch = { matrices: [], colors: [] };
    for (const crate of [crates[1], crates[2], crates[3]]) {
      fillProduce(random, produce, crate.x, crate.y + CRATE.h - 0.008, crate.z, crate.yaw, 3, 2, 0.04, 0.04);
    }
    const baskets: Placed[] = [
      { x: 0.32, y: 0, z: 0.05, yaw: 0 },
      { x: -0.36, y: 0, z: 0.14, yaw: 0 },
    ];
    for (const basket of baskets) {
      fillProduce(random, produce, basket.x, basket.y + 0.045, basket.z, 0, 2, 2, 0.032, 0.032,
        PRODUCE_COLORS[Math.floor(random() * PRODUCE_COLORS.length)]);
    }
    return { bowls, grains, crates, baskets, produce };
  }, []);

  return (
    <group position={[x, TERRACE_TOP, z]} rotation={[0, rotationY, 0]}>
      {layout.bowls.map(([bx, bz], i) => (
        <mesh key={i} geometry={BOWL_GEOMETRY} material={BOWL} position={[bx, 0, bz]} castShadow receiveShadow />
      ))}
      <InstancedBatch geometry={GRAIN_GEOMETRY} material={GRAIN} matrices={layout.grains.matrices} colors={layout.grains.colors} />
      {layout.crates.map((crate, i) => (
        <Crate key={i} {...crate} />
      ))}
      {layout.baskets.map((basket, i) => (
        <Basket key={i} {...basket} />
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={layout.produce.matrices} colors={layout.produce.colors} />
    </group>
  );
}

/** Pallets on the yard and under the canopies: sacks or filled crates. */
function Pallets() {
  const batches = useMemo(() => {
    const random = createRandom(9500);
    const sacks: Batch = { matrices: [], colors: [] };
    const produce: Batch = { matrices: [], colors: [] };
    const q = new THREE.Quaternion();
    PALLETS.forEach((pallet) => {
      q.setFromEuler(new THREE.Euler(0, pallet.rotationY, 0));
      const c = Math.cos(pallet.rotationY);
      const s = Math.sin(pallet.rotationY);
      const toWorld = (lx: number, ly: number, lz: number) =>
        new THREE.Vector3(pallet.x + lx * c + lz * s, TERRACE_TOP + ly, pallet.z - lx * s + lz * c);
      if (pallet.load === "sacks") {
        // Three layers of bagged goods, interlocked.
        for (let layer = 0; layer < 3; layer++) {
          for (let k = 0; k < 3; k++) {
            const across = layer % 2 === 0;
            const lx = across ? 0 : (k - 1) * 0.085;
            const lz = across ? (k - 1) * 0.078 : 0;
            const qq = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, pallet.rotationY + (across ? 0 : Math.PI / 2) + (random() - 0.5) * 0.1, 0));
            sacks.matrices.push(
              new THREE.Matrix4().compose(toWorld(lx, PALLET_DECK + 0.03 + layer * 0.055, lz), qq, new THREE.Vector3(0.24, 0.058, 0.075))
            );
            sacks.colors.push(SACK_COLORS[Math.floor(random() * SACK_COLORS.length)]);
          }
        }
      } else {
        for (const crate of PALLET_CRATES) {
          const w = toWorld(crate.x, crate.y + CRATE.h - 0.008, crate.z);
          const local: Batch = { matrices: [], colors: [] };
          fillProduce(random, local, 0, 0, 0, pallet.rotationY + crate.yaw, 3, 2, 0.04, 0.04);
          local.matrices.forEach((m) => produce.matrices.push(new THREE.Matrix4().makeTranslation(w.x, w.y, w.z).multiply(m)));
          produce.colors.push(...local.colors);
        }
      }
    });
    return { sacks, produce };
  }, []);

  return (
    <group>
      {PALLETS.map((pallet, i) => (
        <group key={i} position={[pallet.x, TERRACE_TOP, pallet.z]} rotation={[0, pallet.rotationY, 0]}>
          <PalletBase />
          {pallet.load === "crates" && PALLET_CRATES.map((crate, k) => <Crate key={k} {...crate} />)}
        </group>
      ))}
      <InstancedBatch geometry={SACK_GEOMETRY} material={SACK} matrices={batches.sacks.matrices} colors={batches.sacks.colors} />
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={batches.produce.matrices} colors={batches.produce.colors} />
    </group>
  );
}

/** A small red counterbalance forklift carrying a pallet of sacks. */
function Forklift() {
  const { x, z, rotationY } = FORKLIFT;
  return (
    <group position={[x, TERRACE_TOP, z]} rotation={[0, rotationY, 0]}>
      <mesh material={FORKLIFT_RED} position={[0, 0.085, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.11, 0.3]} />
      </mesh>
      <mesh material={FORKLIFT_RED} position={[0, 0.1, -0.16]} castShadow>
        <boxGeometry args={[0.21, 0.14, 0.08]} />
      </mesh>
      <mesh material={DARK} position={[0, 0.17, -0.05]} castShadow>
        <boxGeometry args={[0.09, 0.05, 0.08]} />
      </mesh>
      {/* Overhead guard. */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={DARK} position={[sx * 0.085, 0.24, -0.04 + sz * 0.08]} castShadow>
            <boxGeometry args={[0.012, 0.2, 0.012]} />
          </mesh>
        ))
      )}
      <mesh material={DARK} position={[0, 0.345, -0.04]} castShadow>
        <boxGeometry args={[0.19, 0.012, 0.19]} />
      </mesh>
      {/* Mast and forks, with a pallet of sacks raised a little. */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} material={STEEL} position={[sx * 0.07, 0.19, 0.15]} castShadow>
          <boxGeometry args={[0.02, 0.36, 0.02]} />
        </mesh>
      ))}
      {[-1, 1].map((sx) => (
        <mesh key={sx} material={STEEL} position={[sx * 0.05, 0.07, 0.26]} castShadow>
          <boxGeometry args={[0.025, 0.008, 0.2]} />
        </mesh>
      ))}
      <group position={[0, 0.075, 0.28]} rotation={[0, Math.PI / 2, 0]}>
        <PalletBase />
        {[0, 1].map((layer) =>
          [-1, 0, 1].map((k) => (
            <mesh key={`${layer}${k}`} geometry={SACK_GEOMETRY} material={SACK} position={[0, PALLET_DECK + 0.03 + layer * 0.055, k * 0.078]} scale={[0.24, 0.058, 0.075]} castShadow />
          ))
        )}
      </group>
      {[
        [-0.1, 0.1],
        [0.1, 0.1],
        [-0.1, -0.13],
        [0.1, -0.13],
      ].map(([wx, wz], i) => (
        <mesh key={i} material={DARK} position={[wx, 0.04, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.035, 14]} />
        </mesh>
      ))}
    </group>
  );
}

function PalletJack() {
  const { x, z, rotationY } = PALLET_JACK;
  return (
    <group position={[x, TERRACE_TOP, z]} rotation={[0, rotationY, 0]}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} material={FORKLIFT_RED} position={[sx * 0.045, 0.012, 0.08]} castShadow>
          <boxGeometry args={[0.035, 0.018, 0.22]} />
        </mesh>
      ))}
      <mesh material={FORKLIFT_RED} position={[0, 0.04, -0.04]} castShadow>
        <boxGeometry args={[0.13, 0.06, 0.05]} />
      </mesh>
      <mesh material={DARK} position={[0, 0.15, -0.07]} rotation={[-0.35, 0, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.24, 8]} />
      </mesh>
    </group>
  );
}

/** Terracotta pots of leafy plants along the verandah and courtyard. */
function PottedPlants() {
  return (
    <group>
      {POTTED_PLANTS.map(([x, z, size], i) => (
        <group key={i} position={[x, TERRACE_TOP, z]} scale={size}>
          <mesh geometry={POT_GEOMETRY} material={TERRACOTTA} position={[0, 0.0375, 0]} castShadow receiveShadow />
          <mesh material={LEAF} position={[0, 0.1, 0]} scale={[0.06, 0.055, 0.06]} castShadow>
            <icosahedronGeometry args={[1, 1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A simple timber bench under the courtyard shade tree. */
function Bench() {
  const { x, z, rotationY } = BENCH;
  return (
    <group position={[x, TERRACE_TOP, z]} rotation={[0, rotationY, 0]}>
      <mesh material={BENCH_WOOD} position={[0, 0.09, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.02, 0.1]} />
      </mesh>
      {[-0.15, 0.15].map((lx) => (
        <mesh key={lx} material={BENCH_WOOD} position={[lx, 0.045, 0]} castShadow>
          <boxGeometry args={[0.02, 0.09, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

/** Everything in the courtyard: the evaluation table, samples and raw
 * materials (the key story moment); pallets, forklift and pallet jack by the
 * loading area (secondary); potted plants and a bench. */
export function YardProps() {
  return (
    <group>
      <EvaluationTable />
      <SampleSpread />
      <RawMaterials />
      <Pallets />
      <Forklift />
      <PalletJack />
      <PottedPlants />
      <Bench />
    </group>
  );
}
