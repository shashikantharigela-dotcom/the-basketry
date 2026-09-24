import { useMemo } from "react";
import * as THREE from "three";
import { CropField } from "../common/CropField";
import { Fences } from "../common/Fences";
import { Hedgerows } from "../common/Hedgerows";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY, instanceMatrix, rectToWorld } from "../common/placement";
import { TreeBatchMeshes } from "../common/TreeBatchMeshes";
import { addTree, createTreeBatches } from "../common/treeKit";
import { BOULDERS, ORANGE_ORCHARD, STAGE2_FIELDS, STAGE2_TREES, YARD_TREES } from "./stage2Layout";
import { ROADSIDE_FENCES, TERRACE_TOP, WALL_PLANTING_LINES, roadOffsetLine } from "./stage2Geometry";
import { TERRACE } from "./stage2Layout";

const LIMESTONE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95, metalness: 0, flatShading: true });
const BOULDER_GEOMETRY = new THREE.DodecahedronGeometry(1, 1);
const BOULDER_COLORS = [new THREE.Color("#e2d5ba"), new THREE.Color("#d5c6a6"), new THREE.Color("#ebe0c9")];

/** Shrubs along the foot of the wall, between it and the roadside fence. */
const WALL_FOOT_LINES = [roadOffsetLine(TERRACE.roadUFrom + 0.004, TERRACE.roadUTo - 0.004, TERRACE.roadOffset - 0.28, 16)];

/** A low fence around the vegetable rows by the orchard. */
function fieldFence(): Array<[number, number]> {
  const field = STAGE2_FIELDS[0];
  const rect = { ...field, width: field.width + 0.4, depth: field.depth + 0.4 };
  const out = new THREE.Vector2();
  const corner = (sx: number, sz: number): [number, number] => {
    rectToWorld(rect, (sx * rect.width) / 2, (sz * rect.depth) / 2, out);
    return [out.x, out.y];
  };
  return [corner(1, -1), corner(-1, -1), corner(-1, 1), corner(1, 1), corner(1, 0.2)];
}

const terraceSurface = () => TERRACE_TOP;

const PLANTER_HEIGHT = 0.09;
const PLANTER = new THREE.MeshStandardMaterial({ color: "#d4c3a2", roughness: 0.9, metalness: 0 });

/** The landscape around the facility: crop terraces, an orange orchard,
 * cypresses and olive-like trees, limestone boulders, roadside fences and
 * planting that softens the retaining wall. */
export function Surroundings() {
  const { trees, boulders } = useMemo(() => {
    const random = createRandom(2420);
    const treeBatches = createTreeBatches();
    for (const tree of STAGE2_TREES) addTree(tree, random, treeBatches);
    const world = new THREE.Vector2();
    for (let row = 0; row < ORANGE_ORCHARD.rows; row++) {
      for (let col = 0; col < ORANGE_ORCHARD.columns; col++) {
        rectToWorld(
          { x: ORANGE_ORCHARD.x, z: ORANGE_ORCHARD.z, width: 0, depth: 0, rotationY: ORANGE_ORCHARD.rotationY },
          (col - (ORANGE_ORCHARD.columns - 1) / 2) * ORANGE_ORCHARD.spacing,
          (row - (ORANGE_ORCHARD.rows - 1) / 2) * ORANGE_ORCHARD.spacing,
          world
        );
        addTree({ kind: "orange", x: world.x, z: world.y, scale: 1.05 + random() * 0.15 }, random, treeBatches);
      }
    }
    // Small trees growing from planters on the yard.
    for (const [x, z, scale] of YARD_TREES) {
      addTree({ kind: "round", x, z, scale, y: TERRACE_TOP + PLANTER_HEIGHT }, random, treeBatches);
    }
    const boulderMatrices: THREE.Matrix4[] = [];
    const boulderColors: THREE.Color[] = [];
    for (const [x, z, size] of BOULDERS) {
      boulderMatrices.push(
        instanceMatrix(x, groundY(x, z) + size * 0.25, z, random() * 6, size * 1.3, size * 0.75, size, random() * 0.3)
      );
      boulderColors.push(BOULDER_COLORS[Math.floor(random() * BOULDER_COLORS.length)]);
    }
    return { trees: treeBatches, boulders: { matrices: boulderMatrices, colors: boulderColors } };
  }, []);

  const fences = useMemo(() => [...ROADSIDE_FENCES, fieldFence()], []);

  return (
    <group>
      {STAGE2_FIELDS.map((field, i) => (
        <CropField key={i} field={field} seed={200 + i} />
      ))}
      <TreeBatchMeshes batches={trees} />
      <InstancedBatch geometry={BOULDER_GEOMETRY} material={LIMESTONE} matrices={boulders.matrices} colors={boulders.colors} />
      <Fences lines={fences} />
      {YARD_TREES.map(([x, z], i) => (
        <mesh key={i} material={PLANTER} position={[x, TERRACE_TOP + PLANTER_HEIGHT / 2, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.22, PLANTER_HEIGHT, 20]} />
        </mesh>
      ))}
      <Hedgerows lines={WALL_PLANTING_LINES} seed={2440} surfaceY={terraceSurface} spacing={0.3} size={0.85} />
      <Hedgerows lines={WALL_FOOT_LINES} seed={2450} spacing={0.34} size={0.9} />
    </group>
  );
}
