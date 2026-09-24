import { useEffect, useMemo } from "react";
import * as THREE from "three";

export interface InstancedBatchProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  matrices: THREE.Matrix4[];
  /** Optional per-instance color (multiplied with the material color). */
  colors?: THREE.Color[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/** One draw call for many copies of the same small mesh — crops, fence
 * posts, leaves, produce — so a densely dressed stage stays cheap. */
export function InstancedBatch({
  geometry,
  material,
  matrices,
  colors,
  castShadow = true,
  receiveShadow = true,
}: InstancedBatchProps) {
  const mesh = useMemo(() => {
    const instanced = new THREE.InstancedMesh(geometry, material, Math.max(1, matrices.length));
    instanced.count = matrices.length;
    matrices.forEach((matrix, i) => instanced.setMatrixAt(i, matrix));
    colors?.forEach((color, i) => instanced.setColorAt(i, color));
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    instanced.computeBoundingSphere();
    return instanced;
  }, [geometry, material, matrices, colors]);

  useEffect(() => () => mesh.dispose(), [mesh]);

  return <primitive object={mesh} castShadow={castShadow} receiveShadow={receiveShadow} />;
}
