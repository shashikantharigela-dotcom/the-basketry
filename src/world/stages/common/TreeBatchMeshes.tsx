import { InstancedBatch } from "./InstancedBatch";
import {
  CROWN_GEOMETRY,
  CROWN_MATERIAL,
  FRUIT_GEOMETRY,
  FRUIT_MATERIAL,
  ORANGE_FRUIT_MATERIAL,
  TRUNK_GEOMETRY,
  TRUNK_MATERIAL,
  type TreeBatches,
} from "./treeKit";

/** Renders a set of tree batches as three instanced draw calls. */
export function TreeBatchMeshes({ batches, castShadow = true }: { batches: TreeBatches; castShadow?: boolean }) {
  return (
    <group>
      <InstancedBatch geometry={TRUNK_GEOMETRY} material={TRUNK_MATERIAL} matrices={batches.trunks} castShadow={castShadow} />
      <InstancedBatch
        geometry={CROWN_GEOMETRY}
        material={CROWN_MATERIAL}
        matrices={batches.crowns}
        colors={batches.crownColors}
        castShadow={castShadow}
      />
      {batches.fruit.length > 0 && (
        <InstancedBatch geometry={FRUIT_GEOMETRY} material={FRUIT_MATERIAL} matrices={batches.fruit} castShadow={castShadow} />
      )}
      {batches.orangeFruit.length > 0 && (
        <InstancedBatch
          geometry={FRUIT_GEOMETRY}
          material={ORANGE_FRUIT_MATERIAL}
          matrices={batches.orangeFruit}
          castShadow={castShadow}
        />
      )}
    </group>
  );
}
