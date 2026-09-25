import { useMemo } from "react";
import * as THREE from "three";
import { Figures, type FigureSpec } from "../common/Figures";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { TreeBatchMeshes } from "../common/TreeBatchMeshes";
import { TropicalMeshes } from "../common/TropicalMeshes";
import { addTree, createTreeBatches } from "../common/treeKit";
import { addFloweringShrub, createTropicalBatches } from "../common/tropicalKit";
import { roadOffsetPoint } from "../stage2/stage2Geometry";
import { buildingFrame, FORECOURT_LIFT, paveY, resolve } from "./stage4Geometry";
import { BUILDINGS, DISTRICT_TREES, PEDESTRIANS, type BuildingSpec } from "./stage4Layout";

/**
 * The lived-in district round the activation: building entrances (timber
 * door portals, steps and potted plants at the apartments; revolving doors,
 * bollards and planters at the offices), lawn beds and benches on the
 * forecourts, a few more trees, and a handful of passers-by going about
 * their day — quiet enough that the activation stays the focal point.
 */

const BOX = new THREE.BoxGeometry(1, 1, 1);
const DRUM = new THREE.CylinderGeometry(1, 1, 1, 14);
const POT = new THREE.CylinderGeometry(1, 0.76, 1, 12);
const BALL = new THREE.IcosahedronGeometry(1, 1);

const TIMBER = new THREE.MeshStandardMaterial({ color: "#a8754a", roughness: 0.75, metalness: 0 });
const DOOR = new THREE.MeshStandardMaterial({ color: "#2f3b43", roughness: 0.2, metalness: 0.35 });
const STEEL = new THREE.MeshStandardMaterial({ color: "#8a8f93", roughness: 0.4, metalness: 0.6 });
const STONE = new THREE.MeshStandardMaterial({ color: "#cfc6b8", roughness: 0.85, metalness: 0 });
const CONCRETE = new THREE.MeshStandardMaterial({ color: "#c9c4bb", roughness: 0.85, metalness: 0 });
const TERRACOTTA = new THREE.MeshStandardMaterial({ color: "#b8603f", roughness: 0.85, metalness: 0 });
const LAWN = new THREE.MeshStandardMaterial({ color: "#6f9a45", roughness: 0.95, metalness: 0 });
const HEDGE = new THREE.MeshStandardMaterial({ color: "#4d7a35", roughness: 0.85, metalness: 0 });
const FOLIAGE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8, metalness: 0 });
const WOOD = new THREE.MeshStandardMaterial({ color: "#9b6b43", roughness: 0.8, metalness: 0 });

const GREENS = [new THREE.Color("#5d8c3e"), new THREE.Color("#4f7d34"), new THREE.Color("#6f9a45")];
const BLOOMS = [new THREE.Color("#e0457b"), new THREE.Color("#f2a93b"), new THREE.Color("#f4f0e6"), new THREE.Color("#d8342c")];

interface Dressing {
  timber: THREE.Matrix4[];
  doors: THREE.Matrix4[];
  steel: THREE.Matrix4[];
  stone: THREE.Matrix4[];
  concrete: THREE.Matrix4[];
  pots: THREE.Matrix4[];
  lawn: THREE.Matrix4[];
  hedges: THREE.Matrix4[];
  foliage: THREE.Matrix4[];
  foliageColors: THREE.Color[];
  benches: THREE.Matrix4[];
  drums: THREE.Matrix4[];
}

function dressBuilding(b: BuildingSpec, out: Dressing, tropical: ReturnType<typeof createTropicalBatches>, random: () => number) {
  const { base, yaw, toWorld } = buildingFrame(b);
  const top = base + FORECOURT_LIFT;
  const { width: w, depth: d } = b;
  const box = (list: THREE.Matrix4[], lx: number, ly: number, lz: number, sx: number, sy: number, sz: number, extraYaw = 0) => {
    const [x, z] = toWorld(lx, lz);
    list.push(instanceMatrix(x, top + ly, z, yaw + extraYaw, sx, sy, sz));
  };
  const pottedPlant = (lx: number, lz: number, size: number) => {
    box(out.pots, lx, size * 0.5, lz, size * 0.45, size, size * 0.45);
    box(out.foliage, lx, size * 1.35, lz, size * 0.6, size * 0.75, size * 0.6);
    out.foliageColors.push(GREENS[Math.floor(random() * GREENS.length)]);
  };
  const bench = (lx: number, lz: number, turn: number) => {
    box(out.benches, lx, 0.05, lz, 0.26, 0.018, 0.08, turn);
    box(out.benches, lx, 0.085, lz - 0.035, 0.26, 0.05, 0.012, turn);
    box(out.steel, lx - 0.1, 0.025, lz, 0.012, 0.05, 0.07, turn);
    box(out.steel, lx + 0.1, 0.025, lz, 0.012, 0.05, 0.07, turn);
  };
  // Lawn beds edged with a low hedge down both sides of the forecourt, with shrubs.
  for (const side of [-1, 1]) {
    const lx = side * (w / 2 + 0.28);
    box(out.lawn, lx, 0.006, 0.1, 0.34, 0.012, d * 0.85);
    box(out.hedges, lx + side * 0.15, 0.05, 0.1, 0.05, 0.09, d * 0.85);
    for (let k = 0; k < 3; k++) {
      const [sx, sz] = toWorld(lx, -d * 0.3 + k * d * 0.3 + 0.1);
      addFloweringShrub(sx, sz, 0.75 + random() * 0.25, random, tropical, BLOOMS, top + 0.012);
    }
  }

  if (b.kind === "apartment") {
    // Timber door portal, a stone step, potted plants either side.
    const front = d / 2;
    box(out.timber, -0.17, 0.23, front + 0.015, 0.04, 0.46, 0.03);
    box(out.timber, 0.17, 0.23, front + 0.015, 0.04, 0.46, 0.03);
    box(out.timber, 0, 0.47, front + 0.015, 0.38, 0.04, 0.03);
    box(out.doors, 0, 0.22, front + 0.008, 0.3, 0.44, 0.01);
    box(out.stone, 0, 0.015, front + 0.1, 0.46, 0.03, 0.14);
    pottedPlant(-0.29, front + 0.12, 0.09);
    pottedPlant(0.29, front + 0.12, 0.09);
    bench(w / 2 - 0.25, front + 0.6, 0);
  } else {
    // Revolving door in the glazed lobby, bollards and planters on the forecourt.
    const front = d / 2 - 0.09;
    box(out.drums, 0, 0.2, front + 0.04, 0.11, 0.4, 0.11);
    box(out.steel, 0, 0.405, front + 0.04, 0.24, 0.02, 0.24);
    for (let i = -2; i <= 2; i++) box(out.steel, i * 0.34, 0.05, d / 2 + 0.85, 0.022, 0.1, 0.022);
    for (const side of [-1, 1]) {
      box(out.concrete, side * w * 0.3, 0.06, d / 2 + 0.45, 0.46, 0.12, 0.2);
      for (let k = 0; k < 3; k++) {
        const [sx, sz] = toWorld(side * w * 0.3 - 0.14 + k * 0.14, d / 2 + 0.45);
        addFloweringShrub(sx, sz, 0.8 + random() * 0.25, random, tropical, BLOOMS, top + 0.12);
      }
    }
    bench(-w / 2 + 0.3, d / 2 + 0.62, 0);
  }
}

/** Pedestrians stand on the sidewalks, or on a building's forecourt when given one. */
function surfaceFor(p: (typeof PEDESTRIANS)[number]): (x: number, z: number) => number {
  if (p.building === undefined) return paveY;
  const top = buildingFrame(BUILDINGS[p.building]).base + FORECOURT_LIFT;
  return () => top;
}

export function DistrictLife() {
  const built = useMemo(() => {
    const random = createRandom(4601);
    const out: Dressing = {
      timber: [],
      doors: [],
      steel: [],
      stone: [],
      concrete: [],
      pots: [],
      lawn: [],
      hedges: [],
      foliage: [],
      foliageColors: [],
      benches: [],
      drums: [],
    };
    const tropical = createTropicalBatches();
    for (const building of BUILDINGS) dressBuilding(building, out, tropical, random);

    const trees = createTreeBatches();
    for (const [u, offset, scale] of DISTRICT_TREES) {
      const [x, z] = roadOffsetPoint(u, offset);
      addTree({ kind: "round", x, z, scale }, random, trees);
    }

    // Passers-by, grouped by the surface they stand on.
    const groups = new Map<(x: number, z: number) => number, FigureSpec[]>();
    const surfaces = new Map<number | undefined, (x: number, z: number) => number>();
    for (const p of PEDESTRIANS) {
      let surface = surfaces.get(p.building);
      if (!surface) {
        surface = surfaceFor(p);
        surfaces.set(p.building, surface);
      }
      const where =
        p.building === undefined
          ? resolve(p)
          : (() => {
              const f = buildingFrame(BUILDINGS[p.building]);
              const [x, z] = f.toWorld(p.lx ?? 0, p.lz ?? 0);
              return { x, z, yaw: f.yaw + (p.yaw ?? 0) };
            })();
      const list = groups.get(surface) ?? [];
      list.push({ x: where.x, z: where.z, yaw: where.yaw, pose: p.pose, shirt: p.shirt, trousers: p.trousers, hat: "hair", outfit: p.outfit });
      groups.set(surface, list);
    }
    return { out, tropical, trees, groups: [...groups.entries()] };
  }, []);

  const { out } = built;
  return (
    <group name="stage4-district-life">
      <InstancedBatch geometry={BOX} material={TIMBER} matrices={out.timber} />
      <InstancedBatch geometry={BOX} material={DOOR} matrices={out.doors} castShadow={false} />
      <InstancedBatch geometry={BOX} material={STEEL} matrices={out.steel} />
      <InstancedBatch geometry={BOX} material={STONE} matrices={out.stone} />
      <InstancedBatch geometry={BOX} material={CONCRETE} matrices={out.concrete} />
      <InstancedBatch geometry={POT} material={TERRACOTTA} matrices={out.pots} />
      <InstancedBatch geometry={BOX} material={LAWN} matrices={out.lawn} castShadow={false} />
      <InstancedBatch geometry={BOX} material={HEDGE} matrices={out.hedges} />
      <InstancedBatch geometry={BALL} material={FOLIAGE} matrices={out.foliage} colors={out.foliageColors} />
      <InstancedBatch geometry={BOX} material={WOOD} matrices={out.benches} />
      <InstancedBatch geometry={DRUM} material={DOOR} matrices={out.drums} />
      <TropicalMeshes batches={built.tropical} />
      <TreeBatchMeshes batches={built.trees} />
      {built.groups.map(([surface, figures], i) => (
        <Figures key={i} figures={figures} surfaceY={surface} />
      ))}
    </group>
  );
}
