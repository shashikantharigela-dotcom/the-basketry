import { useMemo } from "react";
import * as THREE from "three";
import { isNarrowViewport } from "../../../hooks/useIsMobile";
import { InstancedBatch } from "./InstancedBatch";
import { createRandom, groundY, instanceMatrix, rectToWorld } from "./placement";
import type { CropKind, FieldSpec } from "./types";

const lod = isNarrowViewport();

/** How far the soil sits above the terrain, and how tall the furrow ridges are. */
const SOIL_LIFT = 0.02;
const RIDGE_HEIGHT = 0.018;
const EDGE_MARGIN = 0.12;

interface CropStyle {
  rowSpacing: number;
  plantSpacing: number;
  soil: string;
  furrow: string;
}

const CROP_STYLES: Record<CropKind, CropStyle> = {
  greens: { rowSpacing: 0.2, plantSpacing: 0.13, soil: "#8a5d3b", furrow: "#6d462b" },
  wheat: { rowSpacing: 0.13, plantSpacing: 0.085, soil: "#a4794d", furrow: "#8a6139" },
  sprouts: { rowSpacing: 0.2, plantSpacing: 0.1, soil: "#8f6140", furrow: "#6f4a2f" },
  tomatoes: { rowSpacing: 0.3, plantSpacing: 0.22, soil: "#86593a", furrow: "#684429" },
  squash: { rowSpacing: 0.32, plantSpacing: 0.24, soil: "#8a5d3b", furrow: "#6d462b" },
};

// Low-poly but smooth-shaded plant forms, shared by every field.
const LEAF_GEOMETRY = new THREE.IcosahedronGeometry(1, 1);
const SPROUT_GEOMETRY = new THREE.IcosahedronGeometry(1, 0);
const WHEAT_GEOMETRY = new THREE.ConeGeometry(1, 1, 5);
WHEAT_GEOMETRY.translate(0, 0.5, 0);
const FRUIT_GEOMETRY = new THREE.SphereGeometry(1, 8, 6);

const PLANT_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.75, metalness: 0 });
const FRUIT_MATERIAL = new THREE.MeshStandardMaterial({ color: "#d9221b", roughness: 0.35, metalness: 0 });
const PRODUCE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.45, metalness: 0 });
const SOIL_MATERIAL = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.97,
  metalness: 0,
  // Sits a hair above the terrain — keep it from shimmering against it.
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
});

const GREENS = [new THREE.Color("#7a9c52"), new THREE.Color("#98ba66"), new THREE.Color("#6c8c47")];
const WHEAT = [new THREE.Color("#e3be6c"), new THREE.Color("#d8ac56"), new THREE.Color("#ecd08a")];
const SPROUTS = [new THREE.Color("#a9c56a"), new THREE.Color("#94b35a")];
const BUSH = [new THREE.Color("#5d8743"), new THREE.Color("#6f9a4f")];
const SQUASH_LEAVES = [new THREE.Color("#6b9148"), new THREE.Color("#7fa656")];
const SQUASH_COLORS = [new THREE.Color("#e38b2c"), new THREE.Color("#d9a441"), new THREE.Color("#e9b650")];

/** Ridge profile across a row: 1 on the row line, 0 in the furrow between rows. */
function ridge(lz: number, depth: number, rowSpacing: number): number {
  const t = (((lz + depth / 2) / rowSpacing) % 1 + 1) % 1;
  return 0.5 + 0.5 * Math.cos((t - 0.5) * Math.PI * 2);
}

function buildSoil(field: FieldSpec, style: CropStyle): THREE.BufferGeometry {
  const segX = Math.max(2, Math.ceil(field.width / 0.25));
  const segZ = Math.max(2, Math.ceil(field.depth / (style.rowSpacing / 4)));
  const soil = new THREE.Color(style.soil);
  const furrow = new THREE.Color(style.furrow);
  const color = new THREE.Color();
  const world = new THREE.Vector2();

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let iz = 0; iz <= segZ; iz++) {
    const lz = -field.depth / 2 + (field.depth * iz) / segZ;
    const r = ridge(lz, field.depth, style.rowSpacing);
    color.copy(furrow).lerp(soil, r);
    for (let ix = 0; ix <= segX; ix++) {
      const lx = -field.width / 2 + (field.width * ix) / segX;
      rectToWorld(field, lx, lz, world);
      positions.push(world.x, groundY(world.x, world.y) + SOIL_LIFT + RIDGE_HEIGHT * r, world.y);
      colors.push(color.r, color.g, color.b);
    }
  }
  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * (segX + 1) + ix;
      const b = a + 1;
      const c = a + segX + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

interface PlantBatches {
  plants: { geometry: THREE.BufferGeometry; matrices: THREE.Matrix4[]; colors: THREE.Color[] };
  fruit?: THREE.Matrix4[];
  /** Coloured produce sitting among the leaves (squash). */
  produce?: { matrices: THREE.Matrix4[]; colors: THREE.Color[] };
}

function buildPlants(field: FieldSpec, style: CropStyle, seed: number): PlantBatches {
  const random = createRandom(seed);
  const world = new THREE.Vector2();
  const matrices: THREE.Matrix4[] = [];
  const colors: THREE.Color[] = [];
  const fruit: THREE.Matrix4[] = [];
  const produce: THREE.Matrix4[] = [];
  const produceColors: THREE.Color[] = [];
  // Thin the densest crops on small screens.
  const plantSpacing = style.plantSpacing * (lod && field.kind === "wheat" ? 1.6 : 1);

  const rows = Math.floor((field.depth - EDGE_MARGIN * 2) / style.rowSpacing);
  const perRow = Math.floor((field.width - EDGE_MARGIN * 2) / plantSpacing);
  const rowStart = -field.depth / 2 + (field.depth - rows * style.rowSpacing) / 2 + style.rowSpacing / 2;
  const plantStart = -(perRow - 1) * plantSpacing * 0.5;

  for (let row = 0; row < rows; row++) {
    const lz = rowStart + row * style.rowSpacing;
    for (let i = 0; i < perRow; i++) {
      const lx = plantStart + i * plantSpacing + (random() - 0.5) * plantSpacing * 0.3;
      const jz = lz + (random() - 0.5) * style.rowSpacing * 0.12;
      rectToWorld(field, lx, jz, world);
      const base = groundY(world.x, world.y) + SOIL_LIFT + RIDGE_HEIGHT;
      const yaw = random() * Math.PI * 2;
      const v = 0.8 + random() * 0.4;

      switch (field.kind) {
        case "greens": {
          const r = 0.05 * v;
          matrices.push(instanceMatrix(world.x, base + r * 0.45, world.y, yaw, r, r * 0.62, r));
          colors.push(GREENS[Math.floor(random() * GREENS.length)]);
          break;
        }
        case "wheat": {
          const h = 0.13 * v;
          const lean = (random() - 0.5) * 0.25;
          matrices.push(instanceMatrix(world.x, base - 0.005, world.y, yaw, 0.022, h, 0.022, lean, lean * 0.5));
          colors.push(WHEAT[Math.floor(random() * WHEAT.length)]);
          break;
        }
        case "sprouts": {
          const r = 0.028 * v;
          matrices.push(instanceMatrix(world.x, base + r * 0.4, world.y, yaw, r, r * 0.8, r));
          colors.push(SPROUTS[Math.floor(random() * SPROUTS.length)]);
          break;
        }
        case "tomatoes": {
          const r = 0.075 * v;
          matrices.push(instanceMatrix(world.x, base + r * 0.85, world.y, yaw, r * 0.9, r, r * 0.9));
          colors.push(BUSH[Math.floor(random() * BUSH.length)]);
          const count = 3 + Math.floor(random() * 3);
          for (let k = 0; k < count; k++) {
            const a = random() * Math.PI * 2;
            const h = base + r * (0.55 + random() * 0.7);
            const fr = 0.017 + random() * 0.006;
            fruit.push(
              instanceMatrix(world.x + Math.cos(a) * r * 0.85, h, world.y + Math.sin(a) * r * 0.85, 0, fr)
            );
          }
          break;
        }
        case "squash": {
          // A broad, low leafy mound with one or two squash resting beside it.
          const r = 0.085 * v;
          matrices.push(instanceMatrix(world.x, base + r * 0.3, world.y, yaw, r * 1.2, r * 0.5, r * 1.2));
          colors.push(SQUASH_LEAVES[Math.floor(random() * SQUASH_LEAVES.length)]);
          const count = 1 + Math.floor(random() * 2);
          for (let k = 0; k < count; k++) {
            const a = random() * Math.PI * 2;
            const sr = 0.03 + random() * 0.012;
            produce.push(
              instanceMatrix(
                world.x + Math.cos(a) * r * 0.9,
                base + sr * 0.7,
                world.y + Math.sin(a) * r * 0.9,
                a,
                sr * 1.25,
                sr * 0.9,
                sr
              )
            );
            produceColors.push(SQUASH_COLORS[Math.floor(random() * SQUASH_COLORS.length)]);
          }
          break;
        }
      }
    }
  }

  const geometry =
    field.kind === "wheat" ? WHEAT_GEOMETRY : field.kind === "sprouts" ? SPROUT_GEOMETRY : LEAF_GEOMETRY;
  return {
    plants: { geometry, matrices, colors },
    fruit: fruit.length ? fruit : undefined,
    produce: produce.length ? { matrices: produce, colors: produceColors } : undefined,
  };
}

/** One cultivated field: ridged soil furrows draped over the terrain,
 * with rows of instanced crops sitting on the ridges. */
export function CropField({ field, seed }: { field: FieldSpec; seed: number }) {
  const style = CROP_STYLES[field.kind];
  const soil = useMemo(() => buildSoil(field, style), [field, style]);
  const batches = useMemo(() => buildPlants(field, style, seed), [field, style, seed]);

  return (
    <group>
      <mesh geometry={soil} material={SOIL_MATERIAL} receiveShadow />
      <InstancedBatch
        geometry={batches.plants.geometry}
        material={PLANT_MATERIAL}
        matrices={batches.plants.matrices}
        colors={batches.plants.colors}
      />
      {batches.fruit && <InstancedBatch geometry={FRUIT_GEOMETRY} material={FRUIT_MATERIAL} matrices={batches.fruit} />}
      {batches.produce && (
        <InstancedBatch
          geometry={FRUIT_GEOMETRY}
          material={PRODUCE_MATERIAL}
          matrices={batches.produce.matrices}
          colors={batches.produce.colors}
        />
      )}
    </group>
  );
}
