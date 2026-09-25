import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { TreeBatchMeshes } from "../common/TreeBatchMeshes";
import { TropicalMeshes } from "../common/TropicalMeshes";
import { addTree, createTreeBatches } from "../common/treeKit";
import { addFloweringShrub, createTropicalBatches } from "../common/tropicalKit";
import { roadOffsetPoint } from "../stage2/stage2Geometry";
import {
  LIGHT_POLE_HEIGHT,
  LIGHT_POLE_POSITIONS,
  LIGHT_RUN_LINES,
  paveY,
  PLAZA_GEOMETRY,
  resolve,
  SERVICE_APRON_GEOMETRY,
  SIDEWALK_GEOMETRIES,
} from "./stage5Geometry";
import { EVENT_LAMPS, EVENT_PLANTERS, EVENT_TREES } from "./stage5Layout";

/**
 * The event grounds: kerb-height paving (continuing Stage 4's sidewalks),
 * trees strung with fairy lights, planters of flowers, ornamental lamps and
 * festoon lights zig-zagging over the walkways — the evening glow of a fair.
 */

/** A tiled paver texture (world-unit UVs). */
function paverTexture(base: string, joint: string, cells: number, tile: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const random = createRandom(5201 + cells);
  const cell = size / cells;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const shade = (random() - 0.5) * 0.1;
      ctx.fillStyle = shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(0,0,0,${-shade})`;
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

const BULB = new THREE.MeshStandardMaterial({ color: "#fff3d6", roughness: 0.3, metalness: 0, emissive: "#ffc56b", emissiveIntensity: 1.6 });
const STRING = new THREE.MeshStandardMaterial({ color: "#3a3431", roughness: 0.8, metalness: 0 });
const POLE = new THREE.MeshStandardMaterial({ color: "#3d4144", roughness: 0.45, metalness: 0.6 });
const LANTERN = new THREE.MeshStandardMaterial({ color: "#fff4dc", roughness: 0.3, metalness: 0, emissive: "#ffd08a", emissiveIntensity: 1.1 });
const WOOD_PLANTER = new THREE.MeshStandardMaterial({ color: "#8a5f3c", roughness: 0.85, metalness: 0 });
const GRATE = new THREE.MeshStandardMaterial({ color: "#5b5550", roughness: 0.7, metalness: 0.3 });
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 8);
const DOT = new THREE.SphereGeometry(1, 6, 4);
const BLOOMS = [new THREE.Color("#e0457b"), new THREE.Color("#f2a93b"), new THREE.Color("#f4f0e6"), new THREE.Color("#d8342c")];

function Festoons() {
  const built = useMemo(() => {
    const bulbs: THREE.Matrix4[] = [];
    const strings: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    const zAxis = new THREE.Vector3(0, 0, 1);
    for (const line of LIGHT_RUN_LINES) {
      for (let k = 1; k < line.length; k++) {
        const a = line[k - 1];
        const b = line[k];
        const dir = new THREE.Vector3().subVectors(b, a);
        q.setFromUnitVectors(zAxis, dir.clone().normalize());
        strings.push(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(0.004, 0.004, dir.length())));
        bulbs.push(instanceMatrix(b.x, b.y - 0.018, b.z, 0, 0.014));
      }
    }
    const poles = LIGHT_POLE_POSITIONS.map((p) => instanceMatrix(p.x, p.y + LIGHT_POLE_HEIGHT / 2, p.z, 0, 0.012, LIGHT_POLE_HEIGHT, 0.012));
    return { bulbs, strings, poles };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={CYL} material={POLE} matrices={built.poles} />
      <InstancedBatch geometry={BOX} material={STRING} matrices={built.strings} castShadow={false} />
      <InstancedBatch geometry={DOT} material={BULB} matrices={built.bulbs} castShadow={false} />
    </group>
  );
}

function Lamps() {
  const built = useMemo(() => {
    const poles: THREE.Matrix4[] = [];
    const heads: THREE.Matrix4[] = [];
    for (const lamp of EVENT_LAMPS) {
      const { x, z } = resolve(lamp);
      const y = paveY(x, z);
      poles.push(instanceMatrix(x, y + 0.3, z, 0, 0.011, 0.6, 0.011));
      poles.push(instanceMatrix(x, y + 0.02, z, 0, 0.028, 0.04, 0.028));
      heads.push(instanceMatrix(x, y + 0.64, z, 0, 0.032, 0.06, 0.032));
    }
    return { poles, heads };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={CYL} material={POLE} matrices={built.poles} />
      <InstancedBatch geometry={CYL} material={LANTERN} matrices={built.heads} castShadow={false} />
    </group>
  );
}

function Greenery() {
  const built = useMemo(() => {
    const random = createRandom(5301);
    const trees = createTreeBatches();
    const tropical = createTropicalBatches();
    const grates: THREE.Matrix4[] = [];
    const fairy: THREE.Matrix4[] = [];
    for (const [u, offset, scale] of EVENT_TREES) {
      const [x, z] = roadOffsetPoint(u, offset);
      const y = paveY(x, z);
      addTree({ kind: "round", x, z, scale, y: y + 0.02 }, random, trees);
      grates.push(instanceMatrix(x, y + 0.004, z, random() * 0.3, 0.2, 0.01, 0.2));
      // Fairy lights scattered over the crown (the round crown sits ~0.9 × scale up).
      for (let k = 0; k < 42; k++) {
        const a = random() * Math.PI * 2;
        const el = (random() - 0.3) * 1.2;
        const r = 0.36 * scale;
        fairy.push(instanceMatrix(x + Math.cos(a) * Math.cos(el) * r, y + 0.95 * scale + Math.sin(el) * r * 0.8, z + Math.sin(a) * Math.cos(el) * r, 0, 0.011));
      }
    }
    const planters: THREE.Matrix4[] = [];
    for (const planter of EVENT_PLANTERS) {
      const { x, z, yaw } = resolve(planter);
      const y = paveY(x, z);
      planters.push(instanceMatrix(x, y + 0.06, z, yaw, planter.length, 0.12, 0.2));
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      const count = Math.round(planter.length / 0.12);
      for (let k = 0; k < count; k++) {
        const lx = -planter.length / 2 + 0.06 + (k * (planter.length - 0.12)) / Math.max(1, count - 1);
        addFloweringShrub(x + lx * c, z - lx * s, 0.85 + random() * 0.3, random, tropical, BLOOMS, y + 0.12);
      }
    }
    return { trees, tropical, grates, fairy, planters };
  }, []);
  return (
    <group>
      <TreeBatchMeshes batches={built.trees} />
      <TropicalMeshes batches={built.tropical} />
      <InstancedBatch geometry={BOX} material={GRATE} matrices={built.grates} castShadow={false} />
      <InstancedBatch geometry={DOT} material={BULB} matrices={built.fairy} castShadow={false} />
      <InstancedBatch geometry={BOX} material={WOOD_PLANTER} matrices={built.planters} />
    </group>
  );
}

export function EventGrounds() {
  const { sidewalk, plaza } = useMemo(
    () => ({
      sidewalk: new THREE.MeshStandardMaterial({ map: paverTexture("#d6d0c5", "#b9b2a6", 4, 0.36), roughness: 0.9, metalness: 0, side: THREE.DoubleSide }),
      plaza: new THREE.MeshStandardMaterial({ map: paverTexture("#e6dcc8", "#c9bba2", 3, 0.4), roughness: 0.88, metalness: 0, side: THREE.DoubleSide }),
    }),
    []
  );
  return (
    <group name="stage5-grounds">
      {SIDEWALK_GEOMETRIES.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={sidewalk} receiveShadow />
      ))}
      <mesh geometry={PLAZA_GEOMETRY} material={plaza} receiveShadow />
      <mesh geometry={SERVICE_APRON_GEOMETRY} material={sidewalk} receiveShadow />
      <Festoons />
      <Lamps />
      <Greenery />
    </group>
  );
}
