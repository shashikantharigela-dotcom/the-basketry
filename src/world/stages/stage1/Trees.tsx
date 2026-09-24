import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY, instanceMatrix, rectToWorld } from "../common/placement";
import { ORCHARD, TREES, type TreeSpec } from "./stage1Layout";

const TRUNK_GEOMETRY = new THREE.CylinderGeometry(0.6, 1, 1, 7);
TRUNK_GEOMETRY.translate(0, 0.5, 0);
const CROWN_GEOMETRY = new THREE.IcosahedronGeometry(1, 2);
const FRUIT_GEOMETRY = new THREE.SphereGeometry(1, 8, 6);

const TRUNK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#7a5539", roughness: 0.9, metalness: 0 });
const CROWN_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8, metalness: 0 });
const FRUIT_MATERIAL = new THREE.MeshStandardMaterial({ color: "#d42a1f", roughness: 0.35, metalness: 0 });

const CROWN_COLORS = [
  new THREE.Color("#6f8e48"),
  new THREE.Color("#86a457"),
  new THREE.Color("#5f7f3f"),
  new THREE.Color("#9aae62"),
];
const POPLAR_COLORS = [new THREE.Color("#5b7a3c"), new THREE.Color("#6a8a45")];

interface TreeBatches {
  trunks: THREE.Matrix4[];
  crowns: THREE.Matrix4[];
  crownColors: THREE.Color[];
  fruit: THREE.Matrix4[];
}

function addTree(tree: TreeSpec, random: () => number, out: TreeBatches): void {
  const y = groundY(tree.x, tree.z) - 0.02;
  const s = tree.scale;
  const yaw = random() * Math.PI * 2;

  if (tree.kind === "poplar") {
    // Tall, narrow column — a classic windbreak along field edges.
    out.trunks.push(instanceMatrix(tree.x, y, tree.z, yaw, 0.035 * s, 0.35 * s, 0.035 * s));
    out.crowns.push(instanceMatrix(tree.x, y + 0.85 * s, tree.z, yaw, 0.2 * s, 0.62 * s, 0.2 * s));
    out.crownColors.push(POPLAR_COLORS[Math.floor(random() * POPLAR_COLORS.length)]);
    return;
  }

  const fruitTree = tree.kind === "fruit";
  const trunkHeight = (fruitTree ? 0.24 : 0.42) * s;
  const crown = (fruitTree ? 0.24 : 0.36) * s;
  out.trunks.push(instanceMatrix(tree.x, y, tree.z, yaw, 0.04 * s, trunkHeight, 0.04 * s));

  // A soft cluster of three overlapping blobs reads as a rounded canopy.
  const blobs: Array<[number, number, number, number]> = [
    [0, trunkHeight + crown * 0.75, 0, 1],
    [crown * 0.55, trunkHeight + crown * 0.55, crown * 0.2, 0.72],
    [-crown * 0.45, trunkHeight + crown * 0.6, -crown * 0.35, 0.78],
  ];
  const color = CROWN_COLORS[Math.floor(random() * CROWN_COLORS.length)];
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  for (const [bx, by, bz, bs] of blobs) {
    const wx = tree.x + bx * c + bz * sn;
    const wz = tree.z - bx * sn + bz * c;
    const r = crown * bs;
    out.crowns.push(instanceMatrix(wx, y + by, wz, random() * 6, r, r * 0.9, r));
    out.crownColors.push(color);
  }

  if (fruitTree) {
    for (let k = 0; k < 9; k++) {
      const a = random() * Math.PI * 2;
      const h = trunkHeight + crown * (0.35 + random() * 0.8);
      const reach = crown * (0.85 + random() * 0.15);
      out.fruit.push(instanceMatrix(tree.x + Math.cos(a) * reach, y + h, tree.z + Math.sin(a) * reach, 0, 0.024 * s));
    }
  }
}

/** All Stage 1 trees — scattered round trees, poplar windbreaks, and a
 * small orchard of fruit trees — in three instanced draw calls. */
export function Trees() {
  const batches = useMemo(() => {
    const random = createRandom(1101);
    const out: TreeBatches = { trunks: [], crowns: [], crownColors: [], fruit: [] };
    for (const tree of TREES) addTree(tree, random, out);

    const world = new THREE.Vector2();
    const rect = { x: ORCHARD.x, z: ORCHARD.z, width: 0, depth: 0, rotationY: ORCHARD.rotationY };
    for (let row = 0; row < ORCHARD.rows; row++) {
      for (let col = 0; col < ORCHARD.columns; col++) {
        const lx = (col - (ORCHARD.columns - 1) / 2) * ORCHARD.spacing;
        const lz = (row - (ORCHARD.rows - 1) / 2) * ORCHARD.spacing;
        rectToWorld(rect, lx, lz, world);
        addTree({ kind: "fruit", x: world.x, z: world.y, scale: 0.95 + random() * 0.15 }, random, out);
      }
    }
    return out;
  }, []);

  return (
    <group>
      <InstancedBatch geometry={TRUNK_GEOMETRY} material={TRUNK_MATERIAL} matrices={batches.trunks} />
      <InstancedBatch
        geometry={CROWN_GEOMETRY}
        material={CROWN_MATERIAL}
        matrices={batches.crowns}
        colors={batches.crownColors}
      />
      <InstancedBatch geometry={FRUIT_GEOMETRY} material={FRUIT_MATERIAL} matrices={batches.fruit} />
    </group>
  );
}
