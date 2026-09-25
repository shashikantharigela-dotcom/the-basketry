import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY, instanceMatrix } from "../common/placement";
import { TreeBatchMeshes } from "../common/TreeBatchMeshes";
import { TropicalMeshes } from "../common/TropicalMeshes";
import { addTree, createTreeBatches } from "../common/treeKit";
import { addFloweringShrub, createTropicalBatches } from "../common/tropicalKit";
import {
  BUILDING_TREES,
  LAY_BY_GEOMETRY,
  LAY_BY_KERB,
  HEDGE_LINES,
  LOADING_COURT_GEOMETRY,
  paveY,
  PLAZA_GEOMETRY,
  resolve,
  SIDEWALK_GEOMETRIES,
  STREET_LAMPS,
  STREET_TREES,
} from "./stage4Geometry";
import { PLANTERS } from "./stage4Layout";

/**
 * The city street: paved sidewalks with kerbs, the activation plaza, the
 * truck lay-by, street lamps, street trees in grated pits, clipped hedges
 * and big concrete planters of flowering shrubs round the plaza.
 */

/** A tiled paver texture (world-unit UVs: `tile` world units per texture repeat). */
function paverTexture(base: string, joint: string, cells: number, tile: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const random = createRandom(4201 + cells);
  const cell = size / cells;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      // Slight tone variation per paver.
      const shade = Math.floor((random() - 0.5) * 14);
      ctx.fillStyle = `rgba(${shade > 0 ? 255 : 0},${shade > 0 ? 255 : 0},${shade > 0 ? 255 : 0},${Math.abs(shade) / 140})`;
      ctx.fillRect(i * cell, j * cell, cell, cell);
    }
  }
  ctx.strokeStyle = joint;
  ctx.lineWidth = 2;
  for (let i = 0; i <= cells; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, size);
    ctx.moveTo(0, i * cell);
    ctx.lineTo(size, i * cell);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / tile, 1 / tile);
  texture.anisotropy = 4;
  return texture;
}

const STEEL = new THREE.MeshStandardMaterial({ color: "#3d4144", roughness: 0.45, metalness: 0.6 });
const LAMP_GLOW = new THREE.MeshStandardMaterial({ color: "#fff4dc", roughness: 0.3, metalness: 0, emissive: "#ffe6b0", emissiveIntensity: 0.6 });
const GRATE = new THREE.MeshStandardMaterial({ color: "#5b5550", roughness: 0.7, metalness: 0.3 });
const HEDGE = new THREE.MeshStandardMaterial({ color: "#4d7a35", roughness: 0.85, metalness: 0 });
const CONCRETE = new THREE.MeshStandardMaterial({ color: "#c9c4bb", roughness: 0.85, metalness: 0 });
const SOIL = new THREE.MeshStandardMaterial({ color: "#5a4533", roughness: 0.95, metalness: 0 });
const ASPHALT = new THREE.MeshStandardMaterial({ color: "#3b3b3d", roughness: 0.92, metalness: 0 });
const BOX = new THREE.BoxGeometry(1, 1, 1);
const POLE = new THREE.CylinderGeometry(1, 1, 1, 8);
const BLOOMS = [new THREE.Color("#e0457b"), new THREE.Color("#f2a93b"), new THREE.Color("#f4f0e6"), new THREE.Color("#d8342c")];

function StreetLamps() {
  const built = useMemo(() => {
    const poles: THREE.Matrix4[] = [];
    const heads: THREE.Matrix4[] = [];
    for (const { x, z, yaw } of STREET_LAMPS) {
      const y = paveY(x, z);
      poles.push(instanceMatrix(x, y + 0.36, z, 0, 0.012, 0.72, 0.012));
      poles.push(instanceMatrix(x, y + 0.02, z, 0, 0.03, 0.04, 0.03));
      // A short arm reaching over the road, with a lantern.
      const ax = x + Math.sin(yaw) * 0.09;
      const az = z + Math.cos(yaw) * 0.09;
      poles.push(instanceMatrix(ax, y + 0.72, az, yaw, 0.008, 0.008, 0.18, Math.PI / 2));
      heads.push(instanceMatrix(x + Math.sin(yaw) * 0.18, y + 0.7, z + Math.cos(yaw) * 0.18, yaw, 0.03, 0.02, 0.05));
    }
    return { poles, heads };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={POLE} material={STEEL} matrices={built.poles} />
      <InstancedBatch geometry={BOX} material={LAMP_GLOW} matrices={built.heads} castShadow={false} />
    </group>
  );
}

function Greenery() {
  const built = useMemo(() => {
    const random = createRandom(4301);
    const trees = createTreeBatches();
    const tropical = createTropicalBatches();
    const grates: THREE.Matrix4[] = [];
    // Street trees: rounded crowns on clean trunks, in grated pits on the paving.
    for (const [x, z, scale] of STREET_TREES) {
      const y = Math.max(paveY(x, z), groundY(x, z));
      addTree({ kind: "round", x, z, scale, y: y + 0.02 }, random, trees);
      grates.push(instanceMatrix(x, y + 0.004, z, random() * 0.2, 0.2, 0.01, 0.2));
    }
    // Trees round the building forecourts.
    for (const [x, z, scale] of BUILDING_TREES) {
      addTree({ kind: "round", x, z, scale }, random, trees);
    }
    // Clipped hedges, in short runs.
    const hedges: THREE.Matrix4[] = [];
    for (const line of HEDGE_LINES) {
      for (let i = 0; i < line.length - 1; i++) {
        if (i % 4 === 3) continue;
        const [x1, z1] = line[i];
        const [x2, z2] = line[i + 1];
        const mx = (x1 + x2) / 2;
        const mz = (z1 + z2) / 2;
        const length = Math.hypot(x2 - x1, z2 - z1);
        hedges.push(instanceMatrix(mx, groundY(mx, mz) + 0.06, mz, Math.atan2(x2 - x1, z2 - z1), 0.14, 0.13, length * 1.02));
      }
    }
    // Concrete planters of flowering shrubs round the plaza.
    const planters: THREE.Matrix4[] = [];
    const soil: THREE.Matrix4[] = [];
    for (const planter of PLANTERS) {
      const { x, z, yaw } = resolve(planter);
      const y = paveY(x, z);
      planters.push(instanceMatrix(x, y + 0.07, z, yaw, planter.length, 0.14, 0.26));
      soil.push(instanceMatrix(x, y + 0.141, z, yaw, planter.length - 0.04, 0.004, 0.22));
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      const count = Math.round(planter.length / 0.13);
      for (let k = 0; k < count; k++) {
        const lx = -planter.length / 2 + 0.07 + (k * (planter.length - 0.14)) / Math.max(1, count - 1);
        const lz = (random() - 0.5) * 0.08;
        addFloweringShrub(x + lx * c + lz * s, z - lx * s + lz * c, 0.9 + random() * 0.35, random, tropical, BLOOMS, y + 0.14);
      }
    }
    return { trees, tropical, grates, hedges, planters, soil };
  }, []);
  return (
    <group>
      <TreeBatchMeshes batches={built.trees} />
      <TropicalMeshes batches={built.tropical} />
      <InstancedBatch geometry={BOX} material={GRATE} matrices={built.grates} castShadow={false} />
      <InstancedBatch geometry={BOX} material={HEDGE} matrices={built.hedges} />
      <InstancedBatch geometry={BOX} material={CONCRETE} matrices={built.planters} />
      <InstancedBatch geometry={BOX} material={SOIL} matrices={built.soil} castShadow={false} />
    </group>
  );
}

export function Streetscape() {
  const { sidewalk, plaza } = useMemo(
    () => ({
      sidewalk: new THREE.MeshStandardMaterial({
        map: paverTexture("#d6d0c5", "#b9b2a6", 4, 0.36),
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
      plaza: new THREE.MeshStandardMaterial({
        map: paverTexture("#e3d9c6", "#c7baa3", 3, 0.42),
        roughness: 0.88,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    }),
    []
  );
  return (
    <group name="stage4-streetscape">
      {SIDEWALK_GEOMETRIES.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={sidewalk} receiveShadow />
      ))}
      <mesh geometry={PLAZA_GEOMETRY} material={plaza} receiveShadow />
      <mesh geometry={LOADING_COURT_GEOMETRY} material={plaza} receiveShadow />
      <mesh geometry={LAY_BY_GEOMETRY} material={ASPHALT} receiveShadow />
      <mesh geometry={LAY_BY_KERB} material={sidewalk} receiveShadow />
      <StreetLamps />
      <Greenery />
    </group>
  );
}
