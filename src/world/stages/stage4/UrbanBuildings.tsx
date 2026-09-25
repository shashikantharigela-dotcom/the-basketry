import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { buildingFrame } from "./stage4Geometry";
import { BUILDINGS, type BuildingSpec } from "./stage4Layout";

/**
 * The mixed-use district round the activation: modern apartment blocks
 * (lime-white facades, warm timber accents, balconies with glass rails and
 * planters) and glass office buildings (curtain walls with floor bands and
 * mullions, stone podiums). Every building shares the same few instanced
 * draw calls. Each faces the road; local +Z points at it.
 */

const BOX = new THREE.BoxGeometry(1, 1, 1);

const WALL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.82, metalness: 0 });
const WINDOW = new THREE.MeshStandardMaterial({ color: "#3b4d58", roughness: 0.18, metalness: 0.35 });
const CURTAIN = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.14, metalness: 0.4, emissive: "#1d2a33", emissiveIntensity: 0.35 });
const BAND = new THREE.MeshStandardMaterial({ color: "#dcdcd8", roughness: 0.55, metalness: 0.15 });
const MULLION = new THREE.MeshStandardMaterial({ color: "#c9ccce", roughness: 0.4, metalness: 0.45 });
const SLAB = new THREE.MeshStandardMaterial({ color: "#f1ede6", roughness: 0.75, metalness: 0 });
const RAIL = new THREE.MeshStandardMaterial({ color: "#cfe0e6", roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.5 });
const TIMBER = new THREE.MeshStandardMaterial({ color: "#a8754a", roughness: 0.75, metalness: 0 });
const STONE = new THREE.MeshStandardMaterial({ color: "#cdc3b3", roughness: 0.8, metalness: 0 });
const ROOF = new THREE.MeshStandardMaterial({ color: "#bdb8ae", roughness: 0.85, metalness: 0 });
const FORECOURT = new THREE.MeshStandardMaterial({ color: "#d9d2c6", roughness: 0.88, metalness: 0 });
const GREEN = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8, metalness: 0 });
const LEAF = new THREE.IcosahedronGeometry(1, 1);
const GREENS = [new THREE.Color("#5d8c3e"), new THREE.Color("#4f7d34"), new THREE.Color("#6f9a45"), new THREE.Color("#3f6b2c")];
const BLOOMS = [new THREE.Color("#d8457a"), new THREE.Color("#e8892b")];

const GROUND_FLOOR = 0.7;
const APARTMENT_FLOOR = 0.58;
const OFFICE_FLOOR = 0.62;

interface Batches {
  walls: THREE.Matrix4[];
  wallColors: THREE.Color[];
  windows: THREE.Matrix4[];
  curtain: THREE.Matrix4[];
  curtainColors: THREE.Color[];
  bands: THREE.Matrix4[];
  mullions: THREE.Matrix4[];
  slabs: THREE.Matrix4[];
  rails: THREE.Matrix4[];
  timber: THREE.Matrix4[];
  stone: THREE.Matrix4[];
  roof: THREE.Matrix4[];
  forecourts: THREE.Matrix4[];
  greens: THREE.Matrix4[];
  greenColors: THREE.Color[];
}

/** Adds boxes in a building's local frame (x along the frontage, y up, +z toward the road). */
function frame(b: BuildingSpec) {
  const { base, yaw, toWorld } = buildingFrame(b);
  return (list: THREE.Matrix4[], lx: number, ly: number, lz: number, sx: number, sy: number, sz: number, extraYaw = 0) => {
    const [x, z] = toWorld(lx, lz);
    list.push(instanceMatrix(x, base + ly, z, yaw + extraYaw, sx, sy, sz));
  };
}

function addApartment(b: BuildingSpec, out: Batches, random: () => number) {
  const box = frame(b);
  const { width: w, depth: d, floors } = b;
  const height = GROUND_FLOOR + (floors - 1) * APARTMENT_FLOOR;
  const tone = new THREE.Color(b.tone);

  // Plinth, body, roof parapet and a stair core.
  box(out.stone, 0, -0.2, 0, w + 0.1, 0.36, d + 0.1);
  box(out.walls, 0, height / 2, 0, w, height, d);
  out.wallColors.push(tone);
  box(out.slabs, 0, height + 0.03, 0, w + 0.06, 0.06, d + 0.06);
  box(out.roof, -w * 0.18, height + 0.18, -d * 0.1, w * 0.3, 0.3, d * 0.35);
  // Roof garden.
  for (let k = 0; k < 4; k++) {
    const r = 0.1 + random() * 0.06;
    box(out.greens, w * 0.1 + k * w * 0.1, height + 0.06 + r * 0.4, d * 0.2, r * 1.2, r * 0.8, r);
    out.greenColors.push(GREENS[Math.floor(random() * GREENS.length)]);
  }

  // Ground floor: glazed lobby with a timber-framed entrance canopy.
  box(out.windows, 0, GROUND_FLOOR * 0.45, d / 2 + 0.003, w * 0.86, GROUND_FLOOR * 0.72, 0.01);
  box(out.slabs, 0, GROUND_FLOOR - 0.02, d / 2 + 0.14, w * 0.5, 0.035, 0.3);
  box(out.timber, 0, GROUND_FLOOR + 0.02, d / 2 + 0.005, w * 0.52, 0.05, 0.02);

  // Balcony bays across the frontage, timber fins between them.
  const bays = Math.max(2, Math.round(w / 0.85));
  const bay = w / bays;
  for (let f = 1; f < floors; f++) {
    const y = GROUND_FLOOR + (f - 1) * APARTMENT_FLOOR;
    for (let i = 0; i < bays; i++) {
      const bx = -w / 2 + bay * (i + 0.5);
      // Glazed doors behind the balcony.
      box(out.windows, bx, y + APARTMENT_FLOOR * 0.48, d / 2 + 0.003, bay * 0.72, APARTMENT_FLOOR * 0.66, 0.01);
      // Balcony slab, glass rail on three sides.
      box(out.slabs, bx, y + 0.02, d / 2 + 0.12, bay * 0.86, 0.04, 0.24);
      box(out.rails, bx, y + 0.12, d / 2 + 0.235, bay * 0.86, 0.16, 0.01);
      box(out.rails, bx - bay * 0.43, y + 0.12, d / 2 + 0.12, 0.01, 0.16, 0.23);
      box(out.rails, bx + bay * 0.43, y + 0.12, d / 2 + 0.12, 0.01, 0.16, 0.23);
      // Planters on some balconies.
      if (random() < 0.55) {
        const r = 0.05 + random() * 0.03;
        box(out.greens, bx + (random() - 0.5) * bay * 0.5, y + 0.07 + r * 0.5, d / 2 + 0.17, r * 1.4, r, r);
        out.greenColors.push(random() < 0.25 ? BLOOMS[Math.floor(random() * BLOOMS.length)] : GREENS[Math.floor(random() * GREENS.length)]);
      }
    }
    // Side windows.
    for (const side of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        const wz = -d / 2 + d * (0.3 + k * 0.4);
        box(out.windows, side * (w / 2 + 0.003), y + APARTMENT_FLOOR * 0.5, wz, 0.01, APARTMENT_FLOOR * 0.5, d * 0.22);
      }
    }
  }
  for (let i = 1; i < bays; i++) {
    box(out.timber, -w / 2 + bay * i, GROUND_FLOOR + (height - GROUND_FLOOR) / 2, d / 2 + 0.02, 0.06, height - GROUND_FLOOR, 0.05);
  }
}

function addOffice(b: BuildingSpec, out: Batches) {
  const box = frame(b);
  const { width: w, depth: d, floors } = b;
  const podium = 0.78;
  const height = podium + (floors - 1) * OFFICE_FLOOR;
  const tone = new THREE.Color(b.tone);

  // Stone plinth and a set-back glazed lobby under the tower.
  box(out.stone, 0, -0.2, 0, w + 0.14, 0.36, d + 0.14);
  box(out.windows, 0, podium / 2, 0, w - 0.18, podium, d - 0.18);
  for (const fx of [-0.5, -0.17, 0.17, 0.5]) {
    box(out.stone, fx * (w - 0.1), podium / 2, d / 2 - 0.05, 0.08, podium, 0.08);
  }
  box(out.slabs, 0, podium, 0, w + 0.04, 0.07, d + 0.04);
  box(out.slabs, 0, podium - 0.1, d / 2 + 0.2, w * 0.45, 0.04, 0.4);

  // Curtain wall, floor bands and mullions.
  const towerH = height - podium;
  box(out.curtain, 0, podium + towerH / 2, 0, w, towerH, d);
  out.curtainColors.push(tone);
  for (let f = 1; f < floors; f++) {
    box(out.bands, 0, podium + f * OFFICE_FLOOR, 0, w + 0.025, 0.045, d + 0.025);
  }
  const spacing = 0.34;
  for (let i = 1; i < Math.round(w / spacing); i++) {
    const mx = -w / 2 + (w / Math.round(w / spacing)) * i;
    box(out.mullions, mx, podium + towerH / 2, d / 2 + 0.008, 0.018, towerH, 0.02);
    box(out.mullions, mx, podium + towerH / 2, -d / 2 - 0.008, 0.018, towerH, 0.02);
  }
  for (let i = 1; i < Math.round(d / spacing); i++) {
    const mz = -d / 2 + (d / Math.round(d / spacing)) * i;
    box(out.mullions, w / 2 + 0.008, podium + towerH / 2, mz, 0.02, towerH, 0.018);
    box(out.mullions, -w / 2 - 0.008, podium + towerH / 2, mz, 0.02, towerH, 0.018);
  }
  // Roof crown and plant.
  box(out.bands, 0, height + 0.05, 0, w + 0.04, 0.1, d + 0.04);
  box(out.roof, w * 0.12, height + 0.26, -d * 0.08, w * 0.42, 0.32, d * 0.42);
}

export function UrbanBuildings() {
  const batches = useMemo(() => {
    const random = createRandom(4101);
    const out: Batches = {
      walls: [],
      wallColors: [],
      windows: [],
      curtain: [],
      curtainColors: [],
      bands: [],
      mullions: [],
      slabs: [],
      rails: [],
      timber: [],
      stone: [],
      roof: [],
      forecourts: [],
      greens: [],
      greenColors: [],
    };
    for (const building of BUILDINGS) {
      // A paved forecourt round every building, deepest toward the road.
      frame(building)(out.forecourts, 0, -0.14, 0.3, building.width + 1.0, 0.3, building.depth + 1.3);
      if (building.kind === "apartment") addApartment(building, out, random);
      else addOffice(building, out);
    }
    return out;
  }, []);

  return (
    <group name="stage4-buildings">
      <InstancedBatch geometry={BOX} material={WALL} matrices={batches.walls} colors={batches.wallColors} />
      <InstancedBatch geometry={BOX} material={WINDOW} matrices={batches.windows} castShadow={false} />
      <InstancedBatch geometry={BOX} material={CURTAIN} matrices={batches.curtain} colors={batches.curtainColors} />
      <InstancedBatch geometry={BOX} material={BAND} matrices={batches.bands} />
      <InstancedBatch geometry={BOX} material={MULLION} matrices={batches.mullions} castShadow={false} />
      <InstancedBatch geometry={BOX} material={SLAB} matrices={batches.slabs} />
      <InstancedBatch geometry={BOX} material={RAIL} matrices={batches.rails} castShadow={false} />
      <InstancedBatch geometry={BOX} material={TIMBER} matrices={batches.timber} />
      <InstancedBatch geometry={BOX} material={STONE} matrices={batches.stone} />
      <InstancedBatch geometry={BOX} material={ROOF} matrices={batches.roof} />
      <InstancedBatch geometry={BOX} material={FORECOURT} matrices={batches.forecourts} castShadow={false} />
      <InstancedBatch geometry={LEAF} material={GREEN} matrices={batches.greens} colors={batches.greenColors} />
    </group>
  );
}
