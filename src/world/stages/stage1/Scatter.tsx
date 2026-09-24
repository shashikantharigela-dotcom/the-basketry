import { useMemo } from "react";
import * as THREE from "three";
import { isNarrowViewport } from "../../../hooks/useIsMobile";
import { ROAD_HALF_WIDTH, distanceToRoad } from "../../foundation/sRoad";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY, insideRect, instanceMatrix } from "../common/placement";
import { SCATTER_BOUNDS, SCATTER_KEEP_OUT } from "./stage1Layout";

const lod = isNarrowViewport();

const BUSH_GEOMETRY = new THREE.IcosahedronGeometry(1, 1);
const ROCK_GEOMETRY = new THREE.DodecahedronGeometry(1, 0);
const FLOWER_GEOMETRY = new THREE.SphereGeometry(1, 6, 4);
const TUFT_GEOMETRY = new THREE.ConeGeometry(1, 1, 4);
TUFT_GEOMETRY.translate(0, 0.5, 0);

const FOLIAGE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const ROCK = new THREE.MeshStandardMaterial({ color: "#cfc2a6", roughness: 0.95, metalness: 0, flatShading: true });
const FLOWER = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6, metalness: 0 });

const BUSH_COLORS = [new THREE.Color("#7d9a50"), new THREE.Color("#91ab5e"), new THREE.Color("#6a8744")];
const TUFT_COLORS = [new THREE.Color("#b9b06a"), new THREE.Color("#a6a35d"), new THREE.Color("#c8b877")];
const FLOWER_COLORS = [new THREE.Color("#fff6e6"), new THREE.Color("#e4312a"), new THREE.Color("#f0c64e")];

/** Keeps scatter off the road (with a verge margin) and out of fields/yard. */
function isFree(x: number, z: number, roadClearance: number): boolean {
  if (distanceToRoad(x, z) < ROAD_HALF_WIDTH + roadClearance) return false;
  return !SCATTER_KEEP_OUT.some((rect) => insideRect(rect, x, z));
}

/** Lived-in detail across Stage 1's landscape: shrubs, grass tufts,
 * rocks and little clusters of wildflowers. Seeded, so it never shifts. */
export function Scatter() {
  const batches = useMemo(() => {
    const random = createRandom(777);
    const { minX, maxX, minZ, maxZ } = SCATTER_BOUNDS;
    const pick = () => [minX + random() * (maxX - minX), minZ + random() * (maxZ - minZ)] as const;

    const bushes: THREE.Matrix4[] = [];
    const bushColors: THREE.Color[] = [];
    const rocks: THREE.Matrix4[] = [];
    const tufts: THREE.Matrix4[] = [];
    const tuftColors: THREE.Color[] = [];
    const flowers: THREE.Matrix4[] = [];
    const flowerColors: THREE.Color[] = [];
    const density = lod ? 0.5 : 1;

    for (let i = 0; i < 70 * density; i++) {
      const [x, z] = pick();
      if (!isFree(x, z, 0.9)) continue;
      const r = 0.07 + random() * 0.09;
      bushes.push(instanceMatrix(x, groundY(x, z) + r * 0.45, z, random() * 6, r * 1.15, r * 0.8, r));
      bushColors.push(BUSH_COLORS[Math.floor(random() * BUSH_COLORS.length)]);
    }
    for (let i = 0; i < 45 * density; i++) {
      const [x, z] = pick();
      if (!isFree(x, z, 0.5)) continue;
      const r = 0.03 + random() * 0.07;
      rocks.push(instanceMatrix(x, groundY(x, z) + r * 0.2, z, random() * 6, r * 1.2, r * 0.7, r, random() * 0.4));
    }
    for (let i = 0; i < 260 * density; i++) {
      const [x, z] = pick();
      if (!isFree(x, z, 0.35)) continue;
      const h = 0.04 + random() * 0.05;
      tufts.push(instanceMatrix(x, groundY(x, z) - 0.005, z, random() * 6, 0.018, h, 0.018, (random() - 0.5) * 0.4));
      tuftColors.push(TUFT_COLORS[Math.floor(random() * TUFT_COLORS.length)]);
    }
    for (let i = 0; i < 45 * density; i++) {
      const [cx, cz] = pick();
      if (!isFree(cx, cz, 0.6)) continue;
      const color = FLOWER_COLORS[Math.floor(random() * FLOWER_COLORS.length)];
      for (let k = 0; k < 7; k++) {
        const x = cx + (random() - 0.5) * 0.3;
        const z = cz + (random() - 0.5) * 0.3;
        flowers.push(instanceMatrix(x, groundY(x, z) + 0.025, z, 0, 0.011 + random() * 0.006));
        flowerColors.push(color);
      }
    }
    return { bushes, bushColors, rocks, tufts, tuftColors, flowers, flowerColors };
  }, []);

  return (
    <group>
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
