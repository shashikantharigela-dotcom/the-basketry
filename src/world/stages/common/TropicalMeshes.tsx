import { InstancedBatch } from "./InstancedBatch";
import {
  BANANA_LEAF_GEOMETRY,
  BLOB_GEOMETRY,
  DOT_GEOMETRY,
  FLOWER_MATERIAL,
  LEAF_MATERIAL,
  PALM_FROND_GEOMETRY,
  STEM_GEOMETRY,
  STEM_MATERIAL,
  type TropicalBatches,
} from "./tropicalKit";

/** Renders tropical vegetation batches (see tropicalKit.ts) as a few instanced draw calls. */
export function TropicalMeshes({ batches, castShadow = true }: { batches: TropicalBatches; castShadow?: boolean }) {
  return (
    <group>
      <InstancedBatch geometry={STEM_GEOMETRY} material={STEM_MATERIAL} matrices={batches.stems} colors={batches.stemColors} castShadow={castShadow} />
      <InstancedBatch
        geometry={BANANA_LEAF_GEOMETRY}
        material={LEAF_MATERIAL}
        matrices={batches.bananaLeaves}
        colors={batches.bananaLeafColors}
        castShadow={castShadow}
      />
      <InstancedBatch geometry={PALM_FROND_GEOMETRY} material={LEAF_MATERIAL} matrices={batches.fronds} colors={batches.frondColors} castShadow={castShadow} />
      <InstancedBatch geometry={BLOB_GEOMETRY} material={STEM_MATERIAL} matrices={batches.blobs} colors={batches.blobColors} castShadow={castShadow} />
      <InstancedBatch geometry={DOT_GEOMETRY} material={FLOWER_MATERIAL} matrices={batches.dots} colors={batches.dotColors} castShadow={false} />
    </group>
  );
}
