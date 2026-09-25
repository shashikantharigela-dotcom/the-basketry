import { useMemo } from "react";
import * as THREE from "three";
import { BasketEmblem } from "../common/BasketEmblem";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { BUILDING_FRAMES, type BuildingFrame } from "./stage6Geometry";
import { ECO_BUILDINGS, type EcoBuilding } from "./stage6Layout";

/**
 * The U-shaped complex: a community pavilion (verandah colonnade, terracotta
 * jaali screens, roof pergola), glass offices, the flagship tower (red fins,
 * the basket emblem at its crown), the product-experience hall (a great red
 * canopy over its entrance), the barrel-vaulted exhibition hall, and
 * terraced homes stepping back with planted edges. Windows glow warm for
 * the evening arrival. All share a few instanced draw calls; each building
 * faces the plaza (local +Z).
 */

const BOX = new THREE.BoxGeometry(1, 1, 1);
const LEAF = new THREE.IcosahedronGeometry(1, 1);
const VAULT = (() => {
  // Half a cylinder lying along X (unit radius/length), open side down.
  const g = new THREE.CylinderGeometry(1, 1, 1, 24, 1, false, -Math.PI / 2, Math.PI);
  g.rotateZ(Math.PI / 2);
  return g;
})();

const WALL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.82, metalness: 0 });
const CURTAIN = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.16, metalness: 0.35, emissive: "#ffcf96", emissiveIntensity: 0.16 });
const LIT = new THREE.MeshStandardMaterial({ color: "#fff1d6", roughness: 0.3, metalness: 0, emissive: "#ffc77e", emissiveIntensity: 0.75 });
const GLASS_DARK = new THREE.MeshStandardMaterial({ color: "#3b4d58", roughness: 0.18, metalness: 0.35 });
const BAND = new THREE.MeshStandardMaterial({ color: "#e2ddd4", roughness: 0.55, metalness: 0.15 });
const MULLION = new THREE.MeshStandardMaterial({ color: "#c9ccce", roughness: 0.4, metalness: 0.45 });
const SLAB = new THREE.MeshStandardMaterial({ color: "#f1ede6", roughness: 0.75, metalness: 0 });
const TIMBER = new THREE.MeshStandardMaterial({ color: "#a8754a", roughness: 0.75, metalness: 0 });
const STONE = new THREE.MeshStandardMaterial({ color: "#d3c8b6", roughness: 0.85, metalness: 0 });
const TERRACOTTA = new THREE.MeshStandardMaterial({ color: "#b8603f", roughness: 0.85, metalness: 0 });
const RED = new THREE.MeshStandardMaterial({ color: "#d0161e", roughness: 0.5, metalness: 0.08 });
const ROOF = new THREE.MeshStandardMaterial({ color: "#c2bcb1", roughness: 0.85, metalness: 0 });
const VAULT_MAT = new THREE.MeshStandardMaterial({ color: "#f7f3ec", roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide });
const GREEN = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8, metalness: 0 });
const GREENS = [new THREE.Color("#5d8c3e"), new THREE.Color("#4f7d34"), new THREE.Color("#6f9a45"), new THREE.Color("#3f6b2c")];
const BLOOMS = [new THREE.Color("#d8457a"), new THREE.Color("#e8892b")];

interface Batches {
  walls: THREE.Matrix4[];
  wallColors: THREE.Color[];
  curtain: THREE.Matrix4[];
  curtainColors: THREE.Color[];
  lit: THREE.Matrix4[];
  dark: THREE.Matrix4[];
  bands: THREE.Matrix4[];
  mullions: THREE.Matrix4[];
  slabs: THREE.Matrix4[];
  timber: THREE.Matrix4[];
  stone: THREE.Matrix4[];
  terracotta: THREE.Matrix4[];
  red: THREE.Matrix4[];
  roof: THREE.Matrix4[];
  vaults: THREE.Matrix4[];
  greens: THREE.Matrix4[];
  greenColors: THREE.Color[];
}

type Box = (list: THREE.Matrix4[], lx: number, ly: number, lz: number, sx: number, sy: number, sz: number) => void;

function boxer(f: BuildingFrame): Box {
  return (list, lx, ly, lz, sx, sy, sz) => {
    const [x, z] = f.toWorld(lx, lz);
    list.push(instanceMatrix(x, f.floor + ly, z, f.yaw, sx, sy, sz));
  };
}

function plant(out: Batches, box: Box, lx: number, ly: number, lz: number, r: number, random: () => number, bloom = 0.2) {
  box(out.greens, lx, ly + r * 0.5, lz, r * 1.4, r, r);
  out.greenColors.push(random() < bloom ? BLOOMS[Math.floor(random() * BLOOMS.length)] : GREENS[Math.floor(random() * GREENS.length)]);
}

/** The shared roofline of the whole complex: a slim THE BASKETRY red band
 * round every building's top, so the U reads as one family of buildings. */
function crown(out: Batches, box: Box, w: number, d: number, h: number, cz = 0) {
  box(out.red, 0, h + 0.02, cz + d / 2 + 0.012, w + 0.05, 0.05, 0.03);
  box(out.red, 0, h + 0.02, cz - d / 2 - 0.012, w + 0.05, 0.05, 0.03);
  box(out.red, w / 2 + 0.012, h + 0.02, cz, 0.03, 0.05, d + 0.05);
  box(out.red, -w / 2 - 0.012, h + 0.02, cz, 0.03, 0.05, d + 0.05);
}

/** Plinth down to the lowest ground, plus a paved apron at the floor level. */
function base(out: Batches, box: Box, f: BuildingFrame) {
  box(out.stone, 0, -f.plinth / 2, 0, f.width + 0.12, f.plinth, f.depth + 0.12);
}

/** Warm-lit window grid on one face (local z = faceZ, facing ±Z), floors from y0. */
function windowGrid(out: Batches, box: Box, width: number, faceZ: number, y0: number, floors: number, floorH: number, random: () => number, litRatio = 0.7) {
  const cols = Math.max(2, Math.floor(width / 0.34));
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const lx = -width / 2 + (width / cols) * (c + 0.5);
      box(random() < litRatio ? out.lit : out.dark, lx, y0 + f * floorH + floorH * 0.5, faceZ, (width / cols) * 0.62, floorH * 0.55, 0.012);
    }
  }
}

function addPavilion(b: EcoBuilding, f: BuildingFrame, out: Batches, random: () => number) {
  const box = boxer(f);
  const { width: w, depth: d } = f;
  const fh = 0.62;
  const h = fh * b.floors;
  base(out, box, f);
  // Body set back behind a deep verandah on the plaza side.
  box(out.walls, 0, h / 2, -0.25, w, h, d - 0.5);
  out.wallColors.push(new THREE.Color(b.tone));
  box(out.terracotta, 0, h - 0.04, -0.25 + (d - 0.5) / 2 + 0.005, w, 0.06, 0.012);
  windowGrid(out, box, w - 0.4, -0.25 + (d - 0.5) / 2 + 0.008, 0.08, b.floors, fh, random, 0.8);
  // Verandah: a colonnade carrying a projecting roof slab, jaali screens above.
  box(out.slabs, 0, h + 0.03, 0.05, w + 0.3, 0.06, d + 0.1);
  crown(out, box, w + 0.3, d + 0.1, h + 0.04, 0.05);
  for (let i = 0; i <= Math.round(w / 0.5); i++) {
    const lx = -w / 2 + (w / Math.round(w / 0.5)) * i;
    box(out.stone, lx, h / 2, d / 2 - 0.08, 0.06, h, 0.06);
  }
  const jaaliCols = Math.round(w / 0.5);
  for (let i = 0; i < jaaliCols; i++) {
    const lx = -w / 2 + (w / jaaliCols) * (i + 0.5);
    for (let k = 0; k < 4; k++) box(out.terracotta, lx - 0.15 + k * 0.1, fh + fh * 0.45, d / 2 - 0.08, 0.02, fh * 0.6, 0.015);
  }
  // Roof pergola and garden.
  for (let i = 0; i < Math.round(w / 0.25); i++) box(out.timber, -w / 2 + 0.12 + i * 0.25, h + 0.2, -0.3, 0.035, 0.035, d - 0.9);
  for (const sx of [-1, 1]) box(out.timber, sx * (w / 2 - 0.2), h + 0.1, -0.3, 0.05, 0.2, 0.05);
  for (let k = 0; k < 7; k++) plant(out, box, -w / 2 + 0.4 + k * ((w - 0.8) / 6), h + 0.06, 0.25, 0.08 + random() * 0.04, random, 0.35);
}

function addOffice(b: EcoBuilding, f: BuildingFrame, out: Batches, random: () => number, finColor = false) {
  const box = boxer(f);
  const { width: w, depth: d } = f;
  const podium = 0.78;
  const fh = 0.62;
  const h = podium + (b.floors - 1) * fh;
  base(out, box, f);
  box(out.dark, 0, podium / 2, 0, w - 0.16, podium, d - 0.16);
  for (const fx of [-0.5, -0.17, 0.17, 0.5]) box(out.stone, fx * (w - 0.1), podium / 2, d / 2 - 0.05, 0.08, podium, 0.08);
  box(out.slabs, 0, podium, 0, w + 0.04, 0.07, d + 0.04);
  box(finColor ? out.red : out.slabs, 0, podium - 0.1, d / 2 + 0.22, w * 0.5, 0.045, 0.44);
  const towerH = h - podium;
  box(out.curtain, 0, podium + towerH / 2, 0, w, towerH, d);
  out.curtainColors.push(new THREE.Color(b.tone));
  for (let i = 1; i < b.floors; i++) box(out.bands, 0, podium + i * fh, 0, w + 0.025, 0.045, d + 0.025);
  const cols = Math.round(w / 0.34);
  for (let i = 1; i < cols; i++) {
    const mx = -w / 2 + (w / cols) * i;
    box(finColor && i % 2 === 0 ? out.red : out.mullions, mx, podium + towerH / 2, d / 2 + (finColor ? 0.03 : 0.008), finColor ? 0.03 : 0.018, towerH, finColor ? 0.07 : 0.02);
    box(out.mullions, mx, podium + towerH / 2, -d / 2 - 0.008, 0.018, towerH, 0.02);
  }
  const rows = Math.round(d / 0.34);
  for (let i = 1; i < rows; i++) {
    const mz = -d / 2 + (d / rows) * i;
    for (const sx of [-1, 1]) box(out.mullions, sx * (w / 2 + 0.008), podium + towerH / 2, mz, 0.02, towerH, 0.018);
  }
  box(out.bands, 0, h + 0.05, 0, w + 0.04, 0.1, d + 0.04);
  crown(out, box, w + 0.04, d + 0.04, h + 0.1);
  box(out.roof, w * 0.12, h + 0.26, -d * 0.1, w * 0.42, 0.32, d * 0.42);
  for (let k = 0; k < 3; k++) plant(out, box, -w * 0.3 + k * 0.25, h + 0.1, d * 0.25, 0.08, random);
}

function addHall(b: EcoBuilding, f: BuildingFrame, out: Batches, random: () => number) {
  const box = boxer(f);
  const { width: w, depth: d } = f;
  const fh = 0.66;
  const h = fh * b.floors;
  base(out, box, f);
  box(out.walls, 0, h / 2, -0.1, w, h, d - 0.2);
  out.wallColors.push(new THREE.Color(b.tone));
  // Fully glazed, warm-lit plaza face behind timber louvres.
  box(out.lit, 0, h / 2, d / 2 - 0.09, w - 0.3, h - 0.16, 0.012);
  for (let i = 0; i < Math.round(w / 0.16); i++) box(out.timber, -w / 2 + 0.2 + i * 0.16, h * 0.62, d / 2 - 0.05, 0.03, h * 0.7, 0.04);
  // The great red canopy over the entrance.
  // (It rides above the plaza's gallery, which passes beneath it.)
  box(out.red, 0, 1.08, d / 2 + 0.42, w * 0.7, 0.07, 0.84);
  box(out.slabs, 0, h + 0.04, 0, w + 0.1, 0.08, d + 0.1);
  crown(out, box, w + 0.1, d + 0.1, h + 0.08);
  for (let k = 0; k < 6; k++) plant(out, box, -w / 2 + 0.3 + k * ((w - 0.6) / 5), h + 0.09, 0, 0.1, random, 0.3);
}

function addExhibition(b: EcoBuilding, f: BuildingFrame, out: Batches, random: () => number) {
  const box = boxer(f);
  const { width: w, depth: d } = f;
  const wallH = 1.35;
  base(out, box, f);
  box(out.walls, 0, wallH / 2, 0, w, wallH, d);
  out.wallColors.push(new THREE.Color(b.tone));
  box(out.lit, 0, wallH * 0.48, d / 2 + 0.006, w - 0.3, wallH * 0.78, 0.012);
  for (let i = 1; i < Math.round(w / 0.4); i++) box(out.mullions, -w / 2 + i * (w / Math.round(w / 0.4)), wallH * 0.48, d / 2 + 0.014, 0.02, wallH * 0.78, 0.02);
  // Barrel vault roof along the building, red ribs.
  box(out.vaults, 0, wallH, 0, w + 0.06, d / 2 + 0.03, d / 2 + 0.03);
  for (let i = 0; i <= Math.round(w / 0.7); i++) {
    const lx = -w / 2 + i * (w / Math.round(w / 0.7));
    box(out.red, lx, wallH + d * 0.26, 0, 0.04, 0.03, d * 0.9);
  }
  box(out.red, 0, 0.62, d / 2 + 0.35, 1.4, 0.06, 0.7);
  crown(out, box, w, d, wallH - 0.02);
  for (let k = 0; k < 5; k++) plant(out, box, -w / 2 + 0.5 + k * ((w - 1) / 4), 0, d / 2 + 0.25, 0.09, random, 0.4);
}

function addTerraces(b: EcoBuilding, f: BuildingFrame, out: Batches, random: () => number) {
  const box = boxer(f);
  const { width: w, depth: d } = f;
  const fh = 0.6;
  base(out, box, f);
  for (let i = 0; i < b.floors; i++) {
    // Each storey steps back from the plaza, its terrace edged with planters.
    const setback = i * 0.3;
    const dz = d - setback;
    const cz = -setback / 2;
    box(out.walls, 0, i * fh + fh / 2, cz, w - i * 0.1, fh, dz);
    out.wallColors.push(new THREE.Color(b.tone));
    windowGrid(out, box, w - 0.4 - i * 0.1, cz + dz / 2 + 0.006, i * fh + 0.04, 1, fh * 0.92, random, 0.8);
    box(out.timber, 0, i * fh + fh - 0.02, cz + dz / 2 + 0.01, w - i * 0.1, 0.04, 0.03);
    if (i < b.floors - 1) {
      for (let k = 0; k < 6; k++) plant(out, box, -w / 2 + 0.35 + k * ((w - 0.7) / 5), (i + 1) * fh, cz + dz / 2 - 0.1, 0.07, random, 0.4);
    }
  }
  box(out.slabs, 0, b.floors * fh + 0.03, -(b.floors - 1) * 0.15, w - b.floors * 0.1 + 0.1, 0.06, d - (b.floors - 1) * 0.3 + 0.1);
  crown(out, box, w - b.floors * 0.1 + 0.1, d - (b.floors - 1) * 0.3 + 0.1, b.floors * fh + 0.06, -(b.floors - 1) * 0.15);
}

export function EcosystemBuildings() {
  const batches = useMemo(() => {
    const random = createRandom(6101);
    const out: Batches = {
      walls: [],
      wallColors: [],
      curtain: [],
      curtainColors: [],
      lit: [],
      dark: [],
      bands: [],
      mullions: [],
      slabs: [],
      timber: [],
      stone: [],
      terracotta: [],
      red: [],
      roof: [],
      vaults: [],
      greens: [],
      greenColors: [],
    };
    ECO_BUILDINGS.forEach((b, i) => {
      const f = BUILDING_FRAMES[i];
      if (b.kind === "pavilion") addPavilion(b, f, out, random);
      else if (b.kind === "office") addOffice(b, f, out, random);
      else if (b.kind === "flagship") addOffice(b, f, out, random, true);
      else if (b.kind === "hall") addHall(b, f, out, random);
      else if (b.kind === "exhibition") addExhibition(b, f, out, random);
      else addTerraces(b, f, out, random);
    });
    return out;
  }, []);

  // The flagship's emblem: the basket high on its plaza face.
  const emblem = useMemo(() => {
    const i = ECO_BUILDINGS.findIndex((b) => b.kind === "flagship");
    const f = BUILDING_FRAMES[i];
    const b = ECO_BUILDINGS[i];
    const top = f.floor + 0.78 + (b.floors - 1) * 0.62;
    const [x, z] = f.toWorld(0, f.depth / 2 + 0.2);
    return { x, y: top + 0.55, z, yaw: f.yaw };
  }, []);

  return (
    <group name="stage6-buildings">
      <InstancedBatch geometry={BOX} material={WALL} matrices={batches.walls} colors={batches.wallColors} />
      <InstancedBatch geometry={BOX} material={CURTAIN} matrices={batches.curtain} colors={batches.curtainColors} />
      <InstancedBatch geometry={BOX} material={LIT} matrices={batches.lit} castShadow={false} />
      <InstancedBatch geometry={BOX} material={GLASS_DARK} matrices={batches.dark} castShadow={false} />
      <InstancedBatch geometry={BOX} material={BAND} matrices={batches.bands} />
      <InstancedBatch geometry={BOX} material={MULLION} matrices={batches.mullions} castShadow={false} />
      <InstancedBatch geometry={BOX} material={SLAB} matrices={batches.slabs} />
      <InstancedBatch geometry={BOX} material={TIMBER} matrices={batches.timber} />
      <InstancedBatch geometry={BOX} material={STONE} matrices={batches.stone} />
      <InstancedBatch geometry={BOX} material={TERRACOTTA} matrices={batches.terracotta} />
      <InstancedBatch geometry={BOX} material={RED} matrices={batches.red} />
      <InstancedBatch geometry={BOX} material={ROOF} matrices={batches.roof} />
      <InstancedBatch geometry={VAULT} material={VAULT_MAT} matrices={batches.vaults} />
      <InstancedBatch geometry={LEAF} material={GREEN} matrices={batches.greens} colors={batches.greenColors} />
      <group position={[emblem.x, emblem.y, emblem.z]} rotation={[0, emblem.yaw, 0]}>
        <mesh material={RED} position={[0, 0, -0.05]}>
          <boxGeometry args={[1.0, 1.0, 0.06]} />
        </mesh>
        <BasketEmblem position={[0, -0.05, 0.12]} scale={0.3} />
      </group>
    </group>
  );
}
