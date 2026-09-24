import { useMemo } from "react";
import * as THREE from "three";
import { addTree, createTreeBatches } from "../common/treeKit";
import { TreeBatchMeshes } from "../common/TreeBatchMeshes";
import { createRandom, rectToWorld } from "../common/placement";
import { ORCHARD, TREES } from "./stage1Layout";

/** All Stage 1 trees — scattered round trees, poplar windbreaks, and a
 * small orchard of fruit trees — in three instanced draw calls. */
export function Trees() {
  const batches = useMemo(() => {
    const random = createRandom(1101);
    const out = createTreeBatches();
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

  return <TreeBatchMeshes batches={batches} />;
}
