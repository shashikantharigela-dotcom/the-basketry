import { useMemo } from "react";
import * as THREE from "three";
import { BasketEmblem } from "../common/BasketEmblem";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { TreeBatchMeshes } from "../common/TreeBatchMeshes";
import { TropicalMeshes } from "../common/TropicalMeshes";
import { addTree, createTreeBatches } from "../common/treeKit";
import { addFloweringShrub, createTropicalBatches } from "../common/tropicalKit";
import { groundHeight } from "../../foundation/sRoad";
import {
  ARRIVAL_CURVE,
  ARRIVAL_ROAD_GEOMETRY,
  ESTATE_LAWN_GEOMETRY,
  GARDEN_LAWN_GEOMETRY,
  lawnY,
  LOOP_GEOMETRY,
  loopY,
  PLAZA_GEOMETRY,
  plazaY,
} from "./stage6Geometry";
import { ARCADE, BENCHES, ECO_TREES, ESTATE, GARDEN, GATEWAY, KIOSKS, PLAZA_LAMPS, TERRACE_LINES } from "./stage6Layout";

/**
 * The estate's landscape: lawns stepping down to the rim in hedged terraces,
 * the plaza paving inside the U, the circular garden with the basket
 * sculpture at its heart, the arrival loop the road flows into, trees,
 * benches, two product kiosks and warm lamps.
 */

function paverTexture(base: string, joint: string, cells: number, tile: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const random = createRandom(6201 + cells);
  const cell = size / cells;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const shade = (random() - 0.5) * 0.08;
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

const LAWN = new THREE.MeshStandardMaterial({ color: "#7fa04f", roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
const GARDEN_LAWN = new THREE.MeshStandardMaterial({ color: "#6f9a45", roughness: 0.95, metalness: 0 });
const ASPHALT = new THREE.MeshStandardMaterial({ color: "#3b3b3d", roughness: 0.92, metalness: 0, side: THREE.DoubleSide });
const LINE = new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: 0.6, metalness: 0 });
const HEDGE = new THREE.MeshStandardMaterial({ color: "#4d7a35", roughness: 0.85, metalness: 0 });
const STONE = new THREE.MeshStandardMaterial({ color: "#e0d6c4", roughness: 0.8, metalness: 0 });
const RED = new THREE.MeshStandardMaterial({ color: "#d0161e", roughness: 0.5, metalness: 0.1 });
const WHITE = new THREE.MeshStandardMaterial({ color: "#f6f2ea", roughness: 0.6, metalness: 0 });
const WOOD = new THREE.MeshStandardMaterial({ color: "#9b6b43", roughness: 0.8, metalness: 0 });
const STEEL = new THREE.MeshStandardMaterial({ color: "#3d4144", roughness: 0.45, metalness: 0.6 });
const LANTERN = new THREE.MeshStandardMaterial({ color: "#fff4dc", roughness: 0.3, metalness: 0, emissive: "#ffd08a", emissiveIntensity: 1.2 });
const GLOW = new THREE.MeshStandardMaterial({ color: "#fff1d6", roughness: 0.4, metalness: 0, emissive: "#ffd79a", emissiveIntensity: 0.9 });
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 12);
const BLOOMS = [new THREE.Color("#e0457b"), new THREE.Color("#f2a93b"), new THREE.Color("#f4f0e6"), new THREE.Color("#d8342c")];

function Landscape() {
  const built = useMemo(() => {
    const random = createRandom(6301);
    const trees = createTreeBatches();
    const tropical = createTropicalBatches();
    for (const [x, z, scale] of ECO_TREES) {
      const y = x >= -3.8 && x <= 7.4 && z <= -82 && z >= -89 ? plazaY(x, z) : lawnY(x, z);
      addTree({ kind: "round", x, z, scale, y: y + 0.01 }, random, trees);
    }
    // Hedged terrace edges stepping down the slope to the rim, with flowers.
    const hedges: THREE.Matrix4[] = [];
    for (const lineZ of TERRACE_LINES) {
      for (let x = ESTATE.minX + 0.6; x < ESTATE.maxX - 0.4; x += 0.7) {
        if (Math.abs(x - 3.2) < 0.4) continue; // a gap for the path down
        hedges.push(instanceMatrix(x + 0.3, lawnY(x + 0.3, lineZ) + 0.055, lineZ, 0, 0.62, 0.11, 0.14));
        if (random() < 0.45) addFloweringShrub(x + random() * 0.5, lineZ - 0.25, 0.8 + random() * 0.3, random, tropical, BLOOMS, lawnY(x, lineZ - 0.25));
      }
    }
    // Hedge ring round the garden lawn.
    const ring: THREE.Matrix4[] = [];
    for (let i = 0; i < 36; i++) {
      if (i % 9 === 4) continue; // four openings onto the walkway
      const a = (i / 36) * Math.PI * 2;
      const x = GARDEN.x + Math.cos(a) * GARDEN.hedge;
      const z = GARDEN.z + Math.sin(a) * GARDEN.hedge;
      ring.push(instanceMatrix(x, plazaY(x, z) + 0.05, z, -a, 0.08, 0.1, 0.26));
    }
    // Flower beds inside the garden.
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.2;
      const x = GARDEN.x + Math.cos(a) * 1.0;
      const z = GARDEN.z + Math.sin(a) * 1.0;
      addFloweringShrub(x, z, 0.75, random, tropical, BLOOMS, plazaY(x, z) + 0.006);
    }
    // Loop edge lines.
    const lines: THREE.Matrix4[] = [];
    for (const r of [GARDEN.loopInner + 0.05, GARDEN.loopOuter - 0.05]) {
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const x = GARDEN.x + Math.cos(a) * r;
        const z = GARDEN.z + Math.sin(a) * r;
        lines.push(instanceMatrix(x, loopY(x, z) + 0.004, z, -a, 0.012, 0.004, ((Math.PI * 2 * r) / 64) * 0.9));
      }
    }
    return { trees, tropical, hedges, ring, lines };
  }, []);
  return (
    <group>
      <TreeBatchMeshes batches={built.trees} />
      <TropicalMeshes batches={built.tropical} />
      <InstancedBatch geometry={BOX} material={HEDGE} matrices={built.hedges} />
      <InstancedBatch geometry={BOX} material={HEDGE} matrices={built.ring} />
      <InstancedBatch geometry={BOX} material={LINE} matrices={built.lines} castShadow={false} />
    </group>
  );
}

/** The basket sculpture on its plinth, a red ring at its foot, lit from below. */
function Sculpture() {
  const y = plazaY(GARDEN.x, GARDEN.z);
  return (
    <group position={[GARDEN.x, y, GARDEN.z]}>
      <mesh material={STONE} position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.24, 32]} />
      </mesh>
      <mesh material={RED} position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.44, 0.44, 0.03, 32]} />
      </mesh>
      <mesh material={GLOW} position={[0, 0.27, 0]}>
        <torusGeometry args={[0.36, 0.015, 8, 48]} />
      </mesh>
      <BasketEmblem position={[0, 0.72, 0]} scale={0.42} />
    </group>
  );
}

function Furniture() {
  const built = useMemo(() => {
    const benches: THREE.Matrix4[] = [];
    const steel: THREE.Matrix4[] = [];
    const heads: THREE.Matrix4[] = [];
    for (const [x, z, yaw] of BENCHES) {
      const y = plazaY(x, z);
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      benches.push(instanceMatrix(x, y + 0.05, z, yaw, 0.3, 0.018, 0.08));
      benches.push(instanceMatrix(x - s * 0.035, y + 0.085, z - c * 0.035, yaw, 0.3, 0.05, 0.012));
      for (const k of [-1, 1]) steel.push(instanceMatrix(x + c * 0.12 * k, y + 0.025, z - s * 0.12 * k, yaw, 0.012, 0.05, 0.07));
    }
    for (const [x, z] of PLAZA_LAMPS) {
      const y = plazaY(x, z);
      steel.push(instanceMatrix(x, y + 0.3, z, 0, 0.011, 0.6, 0.011));
      heads.push(instanceMatrix(x, y + 0.63, z, 0, 0.03, 0.06, 0.03));
    }
    return { benches, steel, heads };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={BOX} material={WOOD} matrices={built.benches} />
      <InstancedBatch geometry={CYL} material={STEEL} matrices={built.steel} />
      <InstancedBatch geometry={CYL} material={LANTERN} matrices={built.heads} castShadow={false} />
      {KIOSKS.map(({ x, z, yaw }, i) => (
        <group key={i} position={[x, plazaY(x, z), z]} rotation={[0, yaw, 0]}>
          <mesh material={WHITE} position={[0, 0.16, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.32, 0.34]} />
          </mesh>
          <mesh material={RED} position={[0, 0.34, 0]} castShadow>
            <boxGeometry args={[0.56, 0.035, 0.4]} />
          </mesh>
          <mesh material={RED} position={[0, 0.62, 0]} castShadow>
            <coneGeometry args={[0.42, 0.18, 4]} />
          </mesh>
          {[-1, 1].flatMap((sx) =>
            [-1, 1].map((sz) => (
              <mesh key={`${sx}${sz}`} material={STEEL} position={[sx * 0.26, 0.45, sz * 0.18]}>
                <boxGeometry args={[0.015, 0.25, 0.015]} />
              </mesh>
            ))
          )}
          <BasketEmblem position={[0, 0.18, 0.176]} rotation={[Math.PI / 2, 0, 0]} scale={0.05} />
        </group>
      ))}
    </group>
  );
}

/** The covered arcade tracing the U: columns, a white roof stepping down with the land, a red fascia. */
function Arcade() {
  const built = useMemo(() => {
    const roofs: THREE.Matrix4[] = [];
    const fascia: THREE.Matrix4[] = [];
    const columns: THREE.Matrix4[] = [];
    const glow: THREE.Matrix4[] = [];
    const { width: w, height: h } = ARCADE;
    for (let k = 0; k < ARCADE.path.length - 1; k++) {
      const [x1, z1] = ARCADE.path[k];
      const [x2, z2] = ARCADE.path[k + 1];
      const length = Math.hypot(x2 - x1, z2 - z1);
      const dx = (x2 - x1) / length;
      const dz = (z2 - z1) / length;
      const yaw = Math.atan2(dx, dz);
      // Inward normal (toward the plaza centre) for the fascia side.
      const nx = -dz;
      const nz = dx;
      const bays = Math.round(length / 0.7);
      const bay = length / bays;
      for (let i = 0; i < bays; i++) {
        const cx = x1 + dx * bay * (i + 0.5);
        const cz = z1 + dz * bay * (i + 0.5);
        const y = plazaY(cx, cz);
        roofs.push(instanceMatrix(cx, y + h, cz, yaw, w, 0.08, bay + 0.02));
        for (const k of [1, -1]) {
          fascia.push(instanceMatrix(cx + nx * k * (w / 2 + 0.012), y + h, cz + nz * k * (w / 2 + 0.012), yaw, 0.025, 0.1, bay + 0.03));
        }
        glow.push(instanceMatrix(cx, y + h - 0.045, cz, yaw, w * 0.5, 0.01, bay * 0.8));
        const px = x1 + dx * bay * i;
        const pz = z1 + dz * bay * i;
        const py = plazaY(px, pz);
        columns.push(instanceMatrix(px + nx * (w / 2 - 0.05), py + h / 2, pz + nz * (w / 2 - 0.05), 0, 0.03, h, 0.03));
      }
    }
    return { roofs, fascia, columns, glow };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={BOX} material={WHITE} matrices={built.roofs} />
      <InstancedBatch geometry={BOX} material={RED} matrices={built.fascia} />
      <InstancedBatch geometry={CYL} material={STONE} matrices={built.columns} />
      <InstancedBatch geometry={BOX} material={GLOW} matrices={built.glow} castShadow={false} />
    </group>
  );
}

/** The S-road's markings carried on into the destination: white edge lines
 * and the dashed centre line along the arrival road, round into the loop. */
function ArrivalMarkings() {
  const built = useMemo(() => {
    const lines: THREE.Matrix4[] = [];
    const p = new THREE.Vector3();
    const q = new THREE.Vector3();
    const steps = 48;
    for (let i = 0; i < steps; i++) {
      const s0 = i / steps;
      const s1 = (i + 1) / steps;
      ARRIVAL_CURVE.getPoint(s0, p);
      ARRIVAL_CURVE.getPoint(s1, q);
      const mx = (p.x + q.x) / 2;
      const mz = (p.z + q.z) / 2;
      const len = Math.hypot(q.x - p.x, q.z - p.z);
      const yaw = Math.atan2(q.x - p.x, q.z - p.z);
      const sx = Math.cos(yaw);
      const sz = -Math.sin(yaw);
      const lift = s0 < 0.12 ? 0.05 + (s0 / 0.12) * 0.05 : 0.1;
      for (const off of [-0.6, 0.6]) {
        const x = mx + sx * off;
        const z = mz + sz * off;
        lines.push(instanceMatrix(x, groundHeight(x, z) + lift, z, yaw, 0.05, 0.004, len * 1.02));
      }
      if (i % 2 === 0) lines.push(instanceMatrix(mx, groundHeight(mx, mz) + lift, mz, yaw, 0.035, 0.004, len * 0.9));
    }
    // Dashed centre line round the loop.
    const r = (GARDEN.loopInner + GARDEN.loopOuter) / 2;
    for (let i = 0; i < 40; i += 2) {
      const a = (i / 40) * Math.PI * 2;
      const x = GARDEN.x + Math.cos(a) * r;
      const z = GARDEN.z + Math.sin(a) * r;
      lines.push(instanceMatrix(x, loopY(x, z) + 0.004, z, -a, 0.03, 0.004, ((Math.PI * 2 * r) / 40) * 0.8));
    }
    return lines;
  }, []);
  return <InstancedBatch geometry={BOX} material={LINE} matrices={built} castShadow={false} />;
}

/** Twin pylons where the road enters the U, a beam across with the emblem. */
function Gateway() {
  const { x, zNorth, zSouth, height } = GATEWAY;
  const yN = plazaY(x, zNorth);
  const yS = plazaY(x, zSouth);
  const top = Math.max(yN, yS) + height;
  const zMid = (zNorth + zSouth) / 2;
  return (
    <group>
      {[
        [zNorth, yN],
        [zSouth, yS],
      ].map(([z, y]) => (
        <group key={z} position={[x, y, z]}>
          <mesh material={STONE} position={[0, (top - y) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.32, top - y, 0.32]} />
          </mesh>
          <mesh material={RED} position={[0, top - y - 0.25, 0]}>
            <boxGeometry args={[0.34, 0.08, 0.34]} />
          </mesh>
          <mesh material={GLOW} position={[0.165, (top - y) * 0.45, 0]}>
            <boxGeometry args={[0.01, (top - y) * 0.6, 0.06]} />
          </mesh>
        </group>
      ))}
      <mesh material={WHITE} position={[x, top + 0.07, zMid]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.14, zNorth - zSouth + 0.5]} />
      </mesh>
      <mesh material={RED} position={[x, top + 0.005, zMid]}>
        <boxGeometry args={[0.37, 0.03, zNorth - zSouth + 0.5]} />
      </mesh>
      <BasketEmblem position={[x, top + 0.42, zMid]} scale={0.22} />
    </group>
  );
}

export function EstateGrounds() {
  const plaza = useMemo(
    () => new THREE.MeshStandardMaterial({ map: paverTexture("#e7ddc9", "#cbbda4", 3, 0.42), roughness: 0.88, metalness: 0, side: THREE.DoubleSide }),
    []
  );
  return (
    <group name="stage6-grounds">
      <mesh geometry={ESTATE_LAWN_GEOMETRY} material={LAWN} receiveShadow />
      <mesh geometry={PLAZA_GEOMETRY} material={plaza} receiveShadow />
      <mesh geometry={GARDEN_LAWN_GEOMETRY} material={GARDEN_LAWN} receiveShadow />
      <mesh geometry={LOOP_GEOMETRY} material={ASPHALT} receiveShadow />
      <mesh geometry={ARRIVAL_ROAD_GEOMETRY} material={ASPHALT} receiveShadow />
      <Landscape />
      <Sculpture />
      <Arcade />
      <ArrivalMarkings />
      <Gateway />
      <Furniture />
    </group>
  );
}
