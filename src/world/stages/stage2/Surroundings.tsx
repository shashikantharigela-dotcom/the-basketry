import { useMemo } from "react";
import * as THREE from "three";
import { ROAD_HALF_WIDTH, distanceToRoad } from "../../foundation/sRoad";
import { CropField } from "../common/CropField";
import { Fences } from "../common/Fences";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY, insideRect, instanceMatrix, rectToWorld } from "../common/placement";
import { TreeBatchMeshes } from "../common/TreeBatchMeshes";
import { TropicalMeshes } from "../common/TropicalMeshes";
import { addTree, createTreeBatches } from "../common/treeKit";
import { addBanana, addBougainvillea, addFloweringShrub, addPalm, createTropicalBatches } from "../common/tropicalKit";
import {
  BOUGAINVILLEA,
  COURTYARD_TREES,
  DISTANT_PALMS,
  FRUIT_ORCHARD,
  PADDIES,
  STAGE2_BOUNDS,
  STAGE2_FIELDS,
  STAGE2_KEEP_OUT,
  STAGE2_PLANTS,
  TRELLIS_FIELD,
} from "./stage2Layout";
import { MARKER_POSTS, ROADSIDE_FENCES, TERRACE_TOP, WALL_BED_POINTS, WALL_FOOT_POINTS } from "./stage2Geometry";

const BOX = new THREE.BoxGeometry(1, 1, 1);
const POST_GEOMETRY = new THREE.CylinderGeometry(1, 1, 1, 10);
POST_GEOMETRY.translate(0, 0.5, 0);
const TUFT_GEOMETRY = new THREE.ConeGeometry(1, 1, 4);
TUFT_GEOMETRY.translate(0, 0.5, 0);
const BUSH_GEOMETRY = new THREE.IcosahedronGeometry(1, 1);

const WHITE = new THREE.MeshStandardMaterial({ color: "#f4f2ec", roughness: 0.6, metalness: 0 });
const BLACK = new THREE.MeshStandardMaterial({ color: "#232323", roughness: 0.6, metalness: 0 });
const STAKE = new THREE.MeshStandardMaterial({ color: "#8a6a47", roughness: 0.85, metalness: 0 });
const FOLIAGE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const BUND = new THREE.MeshStandardMaterial({ color: "#8e8f55", roughness: 0.95, metalness: 0 });
const PADDY_WATER = new THREE.MeshStandardMaterial({ color: "#8fae8a", roughness: 0.18, metalness: 0.1 });
const PADDY_FIELD = new THREE.MeshStandardMaterial({ color: "#86ad4c", roughness: 0.85, metalness: 0 });

const GROUND_GREENS = [new THREE.Color("#5f8f3c"), new THREE.Color("#6f9e45"), new THREE.Color("#4e7d34"), new THREE.Color("#7aa84e")];
const BLOOMS = [new THREE.Color("#fff6e6"), new THREE.Color("#f0c64e"), new THREE.Color("#e8579a"), new THREE.Color("#f2f0e6")];
const RICE = [new THREE.Color("#8cc04f"), new THREE.Color("#7db246"), new THREE.Color("#9ccb5a")];

const courtyardY = TERRACE_TOP;

/** Black-and-white striped roadside marker posts. */
function MarkerPosts() {
  const { posts, bands } = useMemo(() => {
    const posts: THREE.Matrix4[] = [];
    const bands: THREE.Matrix4[] = [];
    for (const [x, z] of MARKER_POSTS) {
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

/** Bamboo-stake trellis rows over the vegetable beds. */
function Trellis() {
  const matrices = useMemo(() => {
    const field = STAGE2_FIELDS[TRELLIS_FIELD];
    const out: THREE.Matrix4[] = [];
    const w = new THREE.Vector2();
    const rows = 5;
    for (let r = 0; r < rows; r++) {
      const lz = -field.depth / 2 + 0.25 + (r * (field.depth - 0.5)) / (rows - 1);
      const stakes = 7;
      for (let k = 0; k < stakes; k++) {
        const lx = -field.width / 2 + 0.15 + (k * (field.width - 0.3)) / (stakes - 1);
        rectToWorld(field, lx, lz, w);
        out.push(instanceMatrix(w.x, groundY(w.x, w.y) + 0.12, w.y, 0, 0.01, 0.24, 0.01));
      }
      // Top rail along the row.
      rectToWorld(field, 0, lz, w);
      out.push(instanceMatrix(w.x, groundY(w.x, w.y) + 0.235, w.y, field.rotationY, field.width - 0.28, 0.008, 0.008));
    }
    return out;
  }, []);
  return <InstancedBatch geometry={BOX} material={STAKE} matrices={matrices} />;
}

/** Flooded paddy plots with green young rice, divided by earth bunds. */
function Paddies() {
  const built = useMemo(() => {
    const random = createRandom(2626);
    const water: THREE.Matrix4[] = [];
    const fields: THREE.Matrix4[] = [];
    const bunds: THREE.Matrix4[] = [];
    const rice: THREE.Matrix4[] = [];
    const riceColors: THREE.Color[] = [];
    const w = new THREE.Vector2();
    for (const paddy of PADDIES) {
      const [pw, pd] = paddy.plot;
      const grid = { ...paddy, width: paddy.columns * pw, depth: paddy.rows * pd };
      for (let c = 0; c < grid.columns; c++) {
        for (let r = 0; r < grid.rows; r++) {
          const lx = (c - (grid.columns - 1) / 2) * pw;
          const lz = (r - (grid.rows - 1) / 2) * pd;
          rectToWorld(grid, lx, lz, w);
          const y = groundY(w.x, w.y) + 0.04;
          const flooded = random() < 0.35;
          (flooded ? water : fields).push(instanceMatrix(w.x, y, w.y, grid.rotationY, pw - 0.08, 0.01, pd - 0.08));
          if (!flooded) {
            // Rows of young rice.
            const color = RICE[Math.floor(random() * RICE.length)];
            for (let i = 0; i < 14; i++) {
              for (let k = 0; k < 16; k++) {
                const px = lx - pw / 2 + 0.12 + (i * (pw - 0.24)) / 13;
                const pz = lz - pd / 2 + 0.12 + (k * (pd - 0.24)) / 15;
                const q = new THREE.Vector2();
                rectToWorld(grid, px, pz, q);
                rice.push(instanceMatrix(q.x, y, q.y, random() * 6, 0.02, 0.05 + random() * 0.02, 0.02));
                riceColors.push(color);
              }
            }
          }
          // Bunds on the plot's north and east edges (plus the outer edges).
          const edges: Array<[number, number, number, number]> = [
            [lx, lz + pd / 2, pw, 0],
            [lx + pw / 2, lz, pd, Math.PI / 2],
          ];
          if (r === 0) edges.push([lx, lz - pd / 2, pw, 0]);
          if (c === 0) edges.push([lx - pw / 2, lz, pd, Math.PI / 2]);
          for (const [ex, ez, len, rot] of edges) {
            const q = new THREE.Vector2();
            rectToWorld(grid, ex, ez, q);
            bunds.push(instanceMatrix(q.x, groundY(q.x, q.y) + 0.035, q.y, grid.rotationY + rot, len + 0.08, 0.06, 0.09));
          }
        }
      }
    }
    return { water, fields, bunds, rice, riceColors };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={BOX} material={PADDY_WATER} matrices={built.water} castShadow={false} />
      <InstancedBatch geometry={BOX} material={PADDY_FIELD} matrices={built.fields} castShadow={false} />
      <InstancedBatch geometry={BOX} material={BUND} matrices={built.bunds} castShadow={false} />
      <InstancedBatch geometry={TUFT_GEOMETRY} material={FOLIAGE} matrices={built.rice} colors={built.riceColors} castShadow={false} />
    </group>
  );
}

/** Dense, lush low planting across Stage 2's land: leafy shrubs, flowering
 * bushes and grass clumps — clustered, never an even carpet. */
function useGroundCover() {
  return useMemo(() => {
    const random = createRandom(2727);
    const tropical = createTropicalBatches();
    const bushes: THREE.Matrix4[] = [];
    const bushColors: THREE.Color[] = [];
    const tufts: THREE.Matrix4[] = [];
    const tuftColors: THREE.Color[] = [];
    const { minX, maxX, minZ, maxZ } = STAGE2_BOUNDS;
    const free = (x: number, z: number, clearance: number) =>
      distanceToRoad(x, z) >= ROAD_HALF_WIDTH + clearance && !STAGE2_KEEP_OUT.some((rect) => insideRect(rect, x, z));
    // Clumping: a slow wave decides where the planting thickens.
    const clump = (x: number, z: number) => 0.5 + 0.5 * Math.sin(x * 0.55 + 1.7) * Math.cos(z * 0.47 - 0.6);

    for (let i = 0; i < 420; i++) {
      const x = minX + random() * (maxX - minX);
      const z = minZ + random() * (maxZ - minZ);
      const density = clump(x, z);
      if (random() > 0.25 + density * 0.75 || !free(x, z, 0.9)) continue;
      const roll = random();
      if (roll < 0.62) {
        const r = 0.07 + random() * 0.1;
        bushes.push(instanceMatrix(x, groundY(x, z) + r * 0.5, z, random() * 6, r * 1.15, r * 0.85, r));
        bushColors.push(GROUND_GREENS[Math.floor(random() * GROUND_GREENS.length)]);
      } else if (roll < 0.9) {
        addFloweringShrub(x, z, 0.9 + random() * 0.4, random, tropical, BLOOMS);
      } else {
        addBanana(x, z, 0.75 + random() * 0.3, random, tropical);
      }
    }
    for (let i = 0; i < 700; i++) {
      const x = minX + random() * (maxX - minX);
      const z = minZ + random() * (maxZ - minZ);
      if (random() > 0.35 + clump(x, z) * 0.65 || !free(x, z, 0.25)) continue;
      const color = GROUND_GREENS[Math.floor(random() * GROUND_GREENS.length)];
      for (let k = 0; k < 4; k++) {
        const tx = x + (random() - 0.5) * 0.2;
        const tz = z + (random() - 0.5) * 0.2;
        if (distanceToRoad(tx, tz) < ROAD_HALF_WIDTH + 0.2) continue;
        tufts.push(instanceMatrix(tx, groundY(tx, tz) - 0.005, tz, random() * 6, 0.02, 0.06 + random() * 0.05, 0.02, (random() - 0.5) * 0.4));
        tuftColors.push(color);
      }
    }
    return { tropical, bushes, bushColors, tufts, tuftColors };
  }, []);
}

/** The lush landscape round the producer's courtyard. */
export function Surroundings() {
  const { trees, tropical } = useMemo(() => {
    const random = createRandom(2420);
    const treeBatches = createTreeBatches();
    const tropicalBatches = createTropicalBatches();
    for (const [kind, x, z, scale] of STAGE2_PLANTS) {
      if (kind === "banana") addBanana(x, z, scale, random, tropicalBatches);
      else if (kind === "palm") addPalm(x, z, scale, random, tropicalBatches);
      else addTree({ kind, x, z, scale }, random, treeBatches);
    }
    // The fruit orchard.
    const w = new THREE.Vector2();
    for (let row = 0; row < FRUIT_ORCHARD.rows; row++) {
      for (let col = 0; col < FRUIT_ORCHARD.columns; col++) {
        rectToWorld(
          { x: FRUIT_ORCHARD.x, z: FRUIT_ORCHARD.z, width: 0, depth: 0, rotationY: FRUIT_ORCHARD.rotationY },
          (col - (FRUIT_ORCHARD.columns - 1) / 2) * FRUIT_ORCHARD.spacing,
          (row - (FRUIT_ORCHARD.rows - 1) / 2) * FRUIT_ORCHARD.spacing,
          w
        );
        addTree({ kind: "orange", x: w.x, z: w.y, scale: 1.05 + random() * 0.15 }, random, treeBatches);
      }
    }
    // Shade trees growing in the courtyard.
    for (const [x, z, scale] of COURTYARD_TREES) addTree({ kind: "mango", x, z, scale, y: courtyardY }, random, treeBatches);
    // Bougainvillea inside the courtyard, and flowering shrubs along the wall foot.
    for (const [x, z, scale] of BOUGAINVILLEA) addBougainvillea(x, z, scale, random, tropicalBatches, courtyardY);
    WALL_FOOT_POINTS.forEach(([x, z], i) => {
      if (i % 2 === 0) addBougainvillea(x, z, 0.8 + random() * 0.3, random, tropicalBatches);
      else addFloweringShrub(x, z, 1.0, random, tropicalBatches, BLOOMS);
    });
    // A flowering bed just inside the wall: bougainvillea and small blooms, with the odd banana.
    WALL_BED_POINTS.forEach(([x, z], i) => {
      if (i % 5 === 2) addBanana(x, z, 0.7, random, tropicalBatches, courtyardY);
      else if (i % 2 === 0) addBougainvillea(x, z, 0.75 + random() * 0.25, random, tropicalBatches, courtyardY);
      else addFloweringShrub(x, z, 1.0, random, tropicalBatches, BLOOMS, courtyardY);
    });
    // Distant coconut palms round the paddies.
    for (const [x, z, scale] of DISTANT_PALMS) addPalm(x, z, scale, random, tropicalBatches);
    return { trees: treeBatches, tropical: tropicalBatches };
  }, []);

  const cover = useGroundCover();

  return (
    <group>
      {STAGE2_FIELDS.map((field, i) => (
        <CropField key={i} field={field} seed={200 + i} />
      ))}
      <Trellis />
      <Paddies />
      <TreeBatchMeshes batches={trees} />
      <TropicalMeshes batches={tropical} />
      <TropicalMeshes batches={cover.tropical} />
      <InstancedBatch geometry={BUSH_GEOMETRY} material={FOLIAGE} matrices={cover.bushes} colors={cover.bushColors} />
      <InstancedBatch geometry={TUFT_GEOMETRY} material={FOLIAGE} matrices={cover.tufts} colors={cover.tuftColors} castShadow={false} />
      <Fences lines={ROADSIDE_FENCES} />
      <MarkerPosts />
    </group>
  );
}
