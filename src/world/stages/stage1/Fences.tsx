import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { groundY } from "../common/placement";
import { FENCES } from "./stage1Layout";

const POST_SPACING = 0.42;
// ≈1.1 m timber post-and-rail fence.
const POST_HEIGHT = 0.25;
const RAIL_HEIGHTS = [0.1, 0.2];

const POST_GEOMETRY = new THREE.BoxGeometry(0.024, POST_HEIGHT, 0.024);
POST_GEOMETRY.translate(0, POST_HEIGHT / 2, 0);
const RAIL_GEOMETRY = new THREE.BoxGeometry(0.012, 0.018, 1);
const FENCE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#9b7755", roughness: 0.85, metalness: 0 });

const FORWARD = new THREE.Vector3(0, 0, 1);

/** Post-and-rail fences along the given polylines, following the terrain:
 * posts stand vertical, rails tilt with the slope between them. */
export function Fences() {
  const { posts, rails } = useMemo(() => {
    const postMatrices: THREE.Matrix4[] = [];
    const railMatrices: THREE.Matrix4[] = [];
    const quaternion = new THREE.Quaternion();
    const direction = new THREE.Vector3();

    for (const line of FENCES) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < line.length - 1; i++) {
        const [ax, az] = line[i];
        const [bx, bz] = line[i + 1];
        const steps = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / POST_SPACING));
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const x = ax + (bx - ax) * t;
          const z = az + (bz - az) * t;
          points.push(new THREE.Vector3(x, groundY(x, z) - 0.02, z));
        }
      }
      const [lx, lz] = line[line.length - 1];
      points.push(new THREE.Vector3(lx, groundY(lx, lz) - 0.02, lz));

      points.forEach((p) => postMatrices.push(new THREE.Matrix4().makeTranslation(p.x, p.y, p.z)));
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        direction.subVectors(b, a);
        const length = direction.length();
        quaternion.setFromUnitVectors(FORWARD, direction.normalize());
        for (const h of RAIL_HEIGHTS) {
          railMatrices.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + h, (a.z + b.z) / 2),
              quaternion,
              new THREE.Vector3(1, 1, length)
            )
          );
        }
      }
    }
    return { posts: postMatrices, rails: railMatrices };
  }, []);

  return (
    <group>
      <InstancedBatch geometry={POST_GEOMETRY} material={FENCE_MATERIAL} matrices={posts} />
      <InstancedBatch geometry={RAIL_GEOMETRY} material={FENCE_MATERIAL} matrices={rails} />
    </group>
  );
}
