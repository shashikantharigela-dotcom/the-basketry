import { useMemo } from "react";
import * as THREE from "three";
import { distanceToRoad, ROAD_HALF_WIDTH } from "../../foundation/sRoad";
import { Fences } from "../common/Fences";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY, insideRect, instanceMatrix } from "../common/placement";
import { TreeBatchMeshes } from "../common/TreeBatchMeshes";
import { TropicalMeshes } from "../common/TropicalMeshes";
import { addTree, createTreeBatches } from "../common/treeKit";
import { addBanana, addBougainvillea, addFloweringShrub, addPalm, createTropicalBatches } from "../common/tropicalKit";
import { APRON_EDGE_PLANTING, CAMERA_VERGE_PLANTING, APRON_GEOMETRY, PULL_OFF_GEOMETRY, STAGE3_FENCES, STAGE3_MARKER_POSTS } from "./stage3Geometry";
import { HOMES, STAGE3_BOUNDS, STAGE3_KEEP_OUT, STAGE3_PLANTS } from "./stage3Layout";

const APRON = new THREE.MeshStandardMaterial({
  color: "#dccaa3",
  roughness: 0.97,
  metalness: 0,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
});
const PULL_OFF = new THREE.MeshStandardMaterial({
  color: "#cfbd97",
  roughness: 0.97,
  metalness: 0,
  polygonOffset: true,
  polygonOffsetFactor: -3,
  polygonOffsetUnits: -3,
});
const ROOF = new THREE.MeshStandardMaterial({ color: "#b5553a", roughness: 0.8, metalness: 0 });
const ROOF_EDGE = new THREE.MeshStandardMaterial({ color: "#96422c", roughness: 0.8, metalness: 0 });
const BAND = new THREE.MeshStandardMaterial({ color: "#a8563a", roughness: 0.9, metalness: 0 });
const FRAME = new THREE.MeshStandardMaterial({ color: "#6f3a26", roughness: 0.7, metalness: 0 });
const DARK = new THREE.MeshStandardMaterial({ color: "#3a302a", roughness: 0.9, metalness: 0 });
const POST = new THREE.MeshStandardMaterial({ color: "#efe6d4", roughness: 0.8, metalness: 0 });
const WALL_CAP = new THREE.MeshStandardMaterial({ color: "#f5eee0", roughness: 0.85, metalness: 0 });
const WHITE = new THREE.MeshStandardMaterial({ color: "#f4f2ec", roughness: 0.6, metalness: 0 });
const BLACK = new THREE.MeshStandardMaterial({ color: "#232323", roughness: 0.6, metalness: 0 });
const FOLIAGE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });

const POST_GEOMETRY = new THREE.CylinderGeometry(1, 1, 1, 10);
POST_GEOMETRY.translate(0, 0.5, 0);
const TUFT_GEOMETRY = new THREE.ConeGeometry(1, 1, 4);
TUFT_GEOMETRY.translate(0, 0.5, 0);
const BUSH_GEOMETRY = new THREE.IcosahedronGeometry(1, 1);
/** Four-sided hip roof, unit size (rotated so its ridges run over the corners). */
const HIP_ROOF = (() => {
  const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  g.rotateY(Math.PI / 4);
  g.translate(0, 0.5, 0);
  return g;
})();

const GROUND_GREENS = [new THREE.Color("#5f8f3c"), new THREE.Color("#6f9e45"), new THREE.Color("#4e7d34"), new THREE.Color("#7aa84e")];
const BLOOMS = [new THREE.Color("#fff6e6"), new THREE.Color("#f0c64e"), new THREE.Color("#e8579a"), new THREE.Color("#f2f0e6")];

const wallMaterials = new Map<string, THREE.MeshStandardMaterial>();
function wallMaterial(color: string) {
  let m = wallMaterials.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 });
    wallMaterials.set(color, m);
  }
  return m;
}

/** A small Indian village home: lime-washed walls with a terracotta base
 * band, a tiled hip roof, a shaded front verandah on slim posts, a doorway,
 * windows and a low compound wall. */
function Home({ x, z, yaw, w, d, wall }: (typeof HOMES)[number]) {
  const y = groundY(x, z);
  const h = 0.62;
  const verandah = 0.34;
  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      <mesh material={wallMaterial(wall)} position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh material={BAND} position={[0, 0.035, 0]}>
        <boxGeometry args={[w + 0.01, 0.07, d + 0.01]} />
      </mesh>
      {/* Tiled hip roof with a slight overhang. */}
      <mesh geometry={HIP_ROOF} material={ROOF} position={[0, h, 0]} scale={[w + 0.2, 0.42, d + 0.2]} castShadow receiveShadow />
      <mesh material={ROOF_EDGE} position={[0, h + 0.005, 0]}>
        <boxGeometry args={[w + 0.2, 0.02, d + 0.2]} />
      </mesh>
      {/* Front verandah: lean-to roof on posts. */}
      <mesh material={ROOF} position={[0, h - 0.1, d / 2 + verandah / 2]} rotation={[0.28, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.85, 0.022, verandah + 0.06]} />
      </mesh>
      {[-1, 0, 1].map((k) => (
        <mesh key={k} material={POST} position={[k * w * 0.38, (h - 0.14) / 2, d / 2 + verandah - 0.03]} castShadow>
          <boxGeometry args={[0.03, h - 0.14, 0.03]} />
        </mesh>
      ))}
      <mesh material={POST} position={[0, 0.02, d / 2 + verandah / 2]} receiveShadow>
        <boxGeometry args={[w * 0.9, 0.04, verandah]} />
      </mesh>
      {/* Doorway and windows. */}
      <mesh material={FRAME} position={[0, 0.22, d / 2 + 0.006]}>
        <boxGeometry args={[0.2, 0.36, 0.012]} />
      </mesh>
      <mesh material={DARK} position={[0, 0.21, d / 2 + 0.01]}>
        <boxGeometry args={[0.15, 0.32, 0.01]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * w * 0.3, 0.34, d / 2 + 0.006]}>
          <mesh material={FRAME}>
            <boxGeometry args={[0.16, 0.14, 0.012]} />
          </mesh>
          <mesh material={DARK} position={[0, 0, 0.004]}>
            <boxGeometry args={[0.12, 0.1, 0.01]} />
          </mesh>
        </group>
      ))}
      <group position={[w / 2 + 0.006, 0.34, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={FRAME}>
          <boxGeometry args={[0.16, 0.14, 0.012]} />
        </mesh>
        <mesh material={DARK} position={[0, 0, 0.004]}>
          <boxGeometry args={[0.12, 0.1, 0.01]} />
        </mesh>
      </group>
      {/* Low compound wall in front, with a gap for the gate. */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w * 0.3 + 0.2), 0, d / 2 + verandah + 0.32]}>
          <mesh material={wallMaterial(wall)} position={[0, 0.065, 0]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.6 - 0.1, 0.13, 0.05]} />
          </mesh>
          <mesh material={WALL_CAP} position={[0, 0.135, 0]}>
            <boxGeometry args={[w * 0.6 - 0.08, 0.015, 0.07]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MarkerPosts() {
  const { posts, bands } = useMemo(() => {
    const posts: THREE.Matrix4[] = [];
    const bands: THREE.Matrix4[] = [];
    for (const [x, z] of STAGE3_MARKER_POSTS) {
      const y = groundY(x, z) - 0.01;
      posts.push(instanceMatrix(x, y, z, 0, 0.02, 0.17, 0.02));
      for (const h of [0.07, 0.13]) bands.push(instanceMatrix(x, y + h, z, 0, 0.0205, 0.025, 0.0205));
    }
    return { posts, bands };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={POST_GEOMETRY} material={WHITE} matrices={posts} />
      <InstancedBatch geometry={POST_GEOMETRY} material={BLACK} matrices={bands} />
    </group>
  );
}

/** The land round the activation: apron and pull-off, village homes,
 * mango and coconut palms, bananas, bougainvillea, lush ground cover,
 * roadside fences and marker posts. */
export function Stage3Surroundings() {
  const { trees, tropical, bushes, bushColors, tufts, tuftColors } = useMemo(() => {
    const random = createRandom(3505);
    const treeBatches = createTreeBatches();
    const tropicalBatches = createTropicalBatches();
    for (const [kind, x, z, scale] of STAGE3_PLANTS) {
      if (kind === "banana") addBanana(x, z, scale, random, tropicalBatches);
      else if (kind === "palm") addPalm(x, z, scale, random, tropicalBatches);
      else if (kind === "bougainvillea") addBougainvillea(x, z, scale, random, tropicalBatches);
      else addTree({ kind, x, z, scale }, random, treeBatches);
    }
    APRON_EDGE_PLANTING.forEach(([x, z], i) => {
      const jx = x + (random() - 0.5) * 0.18;
      const jz = z + (random() - 0.5) * 0.18;
      if (i % 3 === 1) addBougainvillea(jx, jz, 0.9 + random() * 0.25, random, tropicalBatches);
      else if (i % 5 === 3) addBanana(jx, jz, 0.85 + random() * 0.2, random, tropicalBatches);
      else addFloweringShrub(jx, jz, 1.0 + random() * 0.35, random, tropicalBatches, BLOOMS);
    });

    CAMERA_VERGE_PLANTING.forEach(([x, z], i) => {
      const jx = x + (random() - 0.5) * 0.4;
      const jz = z + (random() - 0.5) * 0.4;
      if (random() < 0.2) return;
      if (i % 4 === 1) addBougainvillea(jx, jz, 0.75 + random() * 0.2, random, tropicalBatches);
      else addFloweringShrub(jx, jz, 0.9 + random() * 0.4, random, tropicalBatches, BLOOMS);
    });

    // Lush low planting across the stretch — clustered, never a carpet.
    const bushMatrices: THREE.Matrix4[] = [];
    const bushColorList: THREE.Color[] = [];
    const tuftMatrices: THREE.Matrix4[] = [];
    const tuftColorList: THREE.Color[] = [];
    const { minX, maxX, minZ, maxZ } = STAGE3_BOUNDS;
    const free = (x: number, z: number, clearance: number) =>
      distanceToRoad(x, z) >= ROAD_HALF_WIDTH + clearance && !STAGE3_KEEP_OUT.some((rect) => insideRect(rect, x, z));
    const clump = (x: number, z: number) => 0.5 + 0.5 * Math.sin(x * 0.61 - 0.4) * Math.cos(z * 0.43 + 1.2);
    for (let i = 0; i < 380; i++) {
      const x = minX + random() * (maxX - minX);
      const z = minZ + random() * (maxZ - minZ);
      if (random() > 0.25 + clump(x, z) * 0.75 || !free(x, z, 0.9)) continue;
      const roll = random();
      if (roll < 0.62) {
        const r = 0.07 + random() * 0.1;
        bushMatrices.push(instanceMatrix(x, groundY(x, z) + r * 0.5, z, random() * 6, r * 1.15, r * 0.85, r));
        bushColorList.push(GROUND_GREENS[Math.floor(random() * GROUND_GREENS.length)]);
      } else if (roll < 0.9) {
        addFloweringShrub(x, z, 0.9 + random() * 0.4, random, tropicalBatches, BLOOMS);
      } else {
        addBanana(x, z, 0.75 + random() * 0.3, random, tropicalBatches);
      }
    }
    for (let i = 0; i < 640; i++) {
      const x = minX + random() * (maxX - minX);
      const z = minZ + random() * (maxZ - minZ);
      if (random() > 0.35 + clump(x, z) * 0.65 || !free(x, z, 0.25)) continue;
      const color = GROUND_GREENS[Math.floor(random() * GROUND_GREENS.length)];
      for (let k = 0; k < 4; k++) {
        const tx = x + (random() - 0.5) * 0.2;
        const tz = z + (random() - 0.5) * 0.2;
        if (distanceToRoad(tx, tz) < ROAD_HALF_WIDTH + 0.2) continue;
        tuftMatrices.push(instanceMatrix(tx, groundY(tx, tz) - 0.005, tz, random() * 6, 0.02, 0.06 + random() * 0.05, 0.02, (random() - 0.5) * 0.4));
        tuftColorList.push(color);
      }
    }
    return {
      trees: treeBatches,
      tropical: tropicalBatches,
      bushes: bushMatrices,
      bushColors: bushColorList,
      tufts: tuftMatrices,
      tuftColors: tuftColorList,
    };
  }, []);

  return (
    <group>
      <mesh geometry={APRON_GEOMETRY} material={APRON} receiveShadow />
      <mesh geometry={PULL_OFF_GEOMETRY} material={PULL_OFF} receiveShadow />
      {HOMES.map((home, i) => (
        <Home key={i} {...home} />
      ))}
      <TreeBatchMeshes batches={trees} />
      <TropicalMeshes batches={tropical} />
      <InstancedBatch geometry={BUSH_GEOMETRY} material={FOLIAGE} matrices={bushes} colors={bushColors} />
      <InstancedBatch geometry={TUFT_GEOMETRY} material={FOLIAGE} matrices={tufts} colors={tuftColors} castShadow={false} />
      <Fences lines={STAGE3_FENCES} />
      <MarkerPosts />
    </group>
  );
}
