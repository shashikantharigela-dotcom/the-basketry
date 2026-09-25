import { useMemo } from "react";
import * as THREE from "three";
import { isNarrowViewport } from "../../hooks/useIsMobile";
import { groveAmount, meadowAmount } from "../foundation/landNoise";
import { ROAD_HALF_WIDTH, TERRAIN_CENTER, TERRAIN_HALF_SIZE, distanceToRoad } from "../foundation/sRoad";
import { InstancedBatch } from "../stages/common/InstancedBatch";
import { createRandom, groundY, insideRect, instanceMatrix } from "../stages/common/placement";
import { addTree, createTreeBatches } from "../stages/common/treeKit";
import { TreeBatchMeshes } from "../stages/common/TreeBatchMeshes";
import type { TreeKind } from "../stages/common/types";
import { VEGETATION_CLEARINGS, VEGETATION_KEEP_OUT, VEGETATION_SPARSE, VEGETATION_THINNING } from "../stages/worldZones";

const lod = isNarrowViewport();
/** Mobile spreads everything thinner. */
const SPACING_SCALE = lod ? 1.5 : 1;

const TUFT_GEOMETRY = new THREE.ConeGeometry(1, 1, 4);
TUFT_GEOMETRY.translate(0, 0.5, 0);
const BUSH_GEOMETRY = new THREE.IcosahedronGeometry(1, 1);
const ROCK_GEOMETRY = new THREE.DodecahedronGeometry(1, 0);
const FLOWER_GEOMETRY = new THREE.SphereGeometry(1, 6, 4);

const FOLIAGE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const ROCK = new THREE.MeshStandardMaterial({ color: "#d2c5aa", roughness: 0.95, metalness: 0, flatShading: true });
const FLOWER = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6, metalness: 0 });

const TUFT_DRY = new THREE.Color("#c9c083");
const TUFT_GREEN = new THREE.Color("#8c9d59");
const BUSH_COLORS = [new THREE.Color("#7d9a50"), new THREE.Color("#91ab5e"), new THREE.Color("#6a8744")];
// Mostly cream/yellow wildflowers, with the odd brand-red poppy as an accent.
const FLOWER_COLORS = [
  new THREE.Color("#fff6e6"),
  new THREE.Color("#f0c64e"),
  new THREE.Color("#fff6e6"),
  new THREE.Color("#e4312a"),
];

/** Inside the terrain slab's flat top (not on its rounded rim). */
function onPlateau(x: number, z: number): boolean {
  const dx = Math.abs(x - TERRAIN_CENTER.x) / TERRAIN_HALF_SIZE.x;
  const dz = Math.abs(z - TERRAIN_CENTER.y) / TERRAIN_HALF_SIZE.y;
  return Math.pow(Math.pow(dx, 4) + Math.pow(dz, 4), 0.25) < 0.8;
}

function densityFactor(x: number, z: number): number {
  for (const region of VEGETATION_SPARSE) {
    if (x >= region.minX && x <= region.maxX && z >= region.minZ && z <= region.maxZ) return region.factor;
  }
  return 1;
}

function isFree(x: number, z: number, roadDistance: number, roadClearance: number): boolean {
  if (roadDistance < ROAD_HALF_WIDTH + roadClearance) return false;
  if (!onPlateau(x, z)) return false;
  return !VEGETATION_KEEP_OUT.some((rect) => insideRect(rect, x, z));
}

/** Deterministic 0–1 value per position (independent of the random stream). */
function positionHash(x: number, z: number): number {
  const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

/** Post-placement filter for later stages (see VEGETATION_CLEARINGS): true
 * when a plant at (x, z) should be dropped. Evaluated only AFTER a plant's
 * random draws, so it never shifts the seeded layout anywhere else. */
function isCleared(x: number, z: number, kind?: TreeKind): boolean {
  if (VEGETATION_CLEARINGS.some((rect) => insideRect(rect, x, z))) return true;
  for (const region of VEGETATION_THINNING) {
    if (x >= region.minX && x <= region.maxX && z >= region.minZ && z <= region.maxZ) {
      if (kind === "poplar" && region.dropPoplars) return true;
      return positionHash(x, z) > region.factor;
    }
  }
  return false;
}

/** Visit a jittered grid over the whole plateau. */
function forEachCandidate(spacing: number, random: () => number, visit: (x: number, z: number) => void): void {
  const minX = TERRAIN_CENTER.x - TERRAIN_HALF_SIZE.x;
  const maxX = TERRAIN_CENTER.x + TERRAIN_HALF_SIZE.x;
  const minZ = TERRAIN_CENTER.y - TERRAIN_HALF_SIZE.y;
  const maxZ = TERRAIN_CENTER.y + TERRAIN_HALF_SIZE.y;
  for (let z = minZ; z < maxZ; z += spacing) {
    for (let x = minX; x < maxX; x += spacing) {
      visit(x + random() * spacing, z + random() * spacing);
    }
  }
}

/**
 * The natural landscape that continues the whole length of the road:
 * grass tufts that follow the terrain's meadow patches (thicker along the
 * road verge), shrubs, small groves of trees, rocks and wildflowers.
 * Clustered by the same noise that colours the ground, so it reads as
 * living land rather than an even green carpet. Everything is seeded and
 * kept clear of the road, the terrain rim and each stage's own areas.
 */
export function WorldVegetation() {
  const batches = useMemo(() => {
    const random = createRandom(31337);
    const trees = createTreeBatches();
    const discarded = createTreeBatches();
    const tufts: THREE.Matrix4[] = [];
    const tuftColors: THREE.Color[] = [];
    const bushes: THREE.Matrix4[] = [];
    const bushColors: THREE.Color[] = [];
    const rocks: THREE.Matrix4[] = [];
    const flowers: THREE.Matrix4[] = [];
    const flowerColors: THREE.Color[] = [];

    // Trees: sparse singles everywhere, gathering into groves.
    forEachCandidate(2.6 * SPACING_SCALE, random, (x, z) => {
      const d = distanceToRoad(x, z);
      const chance = (0.14 + 0.6 * groveAmount(x, z)) * densityFactor(x, z);
      if (random() > chance || !isFree(x, z, d, 2.0)) return;
      const roll = random();
      const kind: TreeKind = roll < 0.68 ? "round" : roll < 0.95 ? "poplar" : "fruit";
      // Always build (so the random stream advances identically); keep it
      // only if no later stage has cleared this spot.
      addTree({ kind, x, z, scale: 0.8 + random() * 0.55 }, random, isCleared(x, z, kind) ? discarded : trees);
    });

    // Shrubs, mostly in the meadows.
    forEachCandidate(1.3 * SPACING_SCALE, random, (x, z) => {
      const d = distanceToRoad(x, z);
      const chance = (0.08 + 0.35 * meadowAmount(x, z) + 0.15 * groveAmount(x, z)) * densityFactor(x, z);
      if (random() > chance || !isFree(x, z, d, 1.2)) return;
      const r = 0.07 + random() * 0.1;
      const matrix = instanceMatrix(x, groundY(x, z) + r * 0.45, z, random() * 6, r * 1.15, r * 0.8, r);
      const color = BUSH_COLORS[Math.floor(random() * BUSH_COLORS.length)];
      if (isCleared(x, z)) return;
      bushes.push(matrix);
      bushColors.push(color);
    });

    // Grass: little clumps of tufts, dense in meadows and along the verge,
    // sparse and dry on open earth.
    forEachCandidate(0.7 * SPACING_SCALE, random, (x, z) => {
      const d = distanceToRoad(x, z);
      const meadow = meadowAmount(x, z);
      const verge = 1 - THREE.MathUtils.smoothstep(d, ROAD_HALF_WIDTH + 0.3, ROAD_HALF_WIDTH + 1.8);
      const chance = (0.16 + 0.7 * meadow + 0.6 * verge) * densityFactor(x, z);
      if (random() > chance || !isFree(x, z, d, 0.22)) return;
      const count = 3 + Math.floor(random() * 4);
      const color = new THREE.Color().copy(TUFT_DRY).lerp(TUFT_GREEN, Math.min(1, 0.3 + meadow * 0.6 + verge * 0.3 + random() * 0.25));
      for (let k = 0; k < count; k++) {
        const tx = x + (random() - 0.5) * 0.22;
        const tz = z + (random() - 0.5) * 0.22;
        if (distanceToRoad(tx, tz) < ROAD_HALF_WIDTH + 0.2) continue;
        const h = 0.05 + random() * 0.06;
        const matrix = instanceMatrix(tx, groundY(tx, tz) - 0.005, tz, random() * 6, 0.018, h, 0.018, (random() - 0.5) * 0.45);
        if (isCleared(tx, tz)) continue;
        tufts.push(matrix);
        tuftColors.push(color);
      }
    });

    // Rocks and wildflower clusters.
    forEachCandidate(1.8 * SPACING_SCALE, random, (x, z) => {
      const d = distanceToRoad(x, z);
      const density = densityFactor(x, z);
      if (random() < 0.1 * density && isFree(x, z, d, 0.5)) {
        const r = 0.03 + random() * 0.08;
        const matrix = instanceMatrix(x, groundY(x, z) + r * 0.2, z, random() * 6, r * 1.2, r * 0.7, r, random() * 0.4);
        if (!isCleared(x, z)) rocks.push(matrix);
      }
      if (random() < (0.04 + 0.2 * meadowAmount(x, z)) * density && isFree(x, z, d, 0.6)) {
        const color = FLOWER_COLORS[Math.floor(random() * FLOWER_COLORS.length)];
        for (let k = 0; k < 6; k++) {
          const fx = x + (random() - 0.5) * 0.3;
          const fz = z + (random() - 0.5) * 0.3;
          const matrix = instanceMatrix(fx, groundY(fx, fz) + 0.025, fz, 0, 0.011 + random() * 0.006);
          if (isCleared(fx, fz)) continue;
          flowers.push(matrix);
          flowerColors.push(color);
        }
      }
    });

    return { trees, tufts, tuftColors, bushes, bushColors, rocks, flowers, flowerColors };
  }, []);

  return (
    <group name="world-vegetation">
      <TreeBatchMeshes batches={batches.trees} />
      <InstancedBatch geometry={BUSH_GEOMETRY} material={FOLIAGE} matrices={batches.bushes} colors={batches.bushColors} />
      <InstancedBatch geometry={ROCK_GEOMETRY} material={ROCK} matrices={batches.rocks} />
      <InstancedBatch
        geometry={TUFT_GEOMETRY}
        material={FOLIAGE}
        matrices={batches.tufts}
        colors={batches.tuftColors}
        castShadow={false}
      />
      <InstancedBatch
        geometry={FLOWER_GEOMETRY}
        material={FLOWER}
        matrices={batches.flowers}
        colors={batches.flowerColors}
        castShadow={false}
      />
    </group>
  );
}
