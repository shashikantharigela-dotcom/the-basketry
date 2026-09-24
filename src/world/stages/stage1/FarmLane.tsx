import { useMemo } from "react";
import * as THREE from "three";
import { groundY } from "../common/placement";
import { FARM_LANE } from "./stage1Layout";

const LANE_WIDTH = 0.46;
const LANE_LIFT = 0.018;
const SEGMENTS = 60;

const LANE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#dcc9a4",
  roughness: 0.98,
  metalness: 0,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
});

/** A gravel farm lane from the road's inner edge up to the yard,
 * draped over the terrain. It starts at the road edge, never on it. */
export function FarmLane() {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      FARM_LANE.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      "centripetal"
    );
    const positions: number[] = [];
    const indices: number[] = [];
    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    for (let i = 0; i <= SEGMENTS; i++) {
      const u = i / SEGMENTS;
      curve.getPointAt(u, point);
      curve.getTangentAt(u, tangent);
      // Slightly flared where it meets the road, like a real farm entrance.
      const half = (LANE_WIDTH / 2) * (1 + 0.35 * (1 - Math.min(1, u * 4)));
      for (const side of [-1, 1]) {
        const x = point.x - tangent.z * half * side;
        const z = point.z + tangent.x * half * side;
        positions.push(x, groundY(x, z) + LANE_LIFT, z);
      }
      if (i < SEGMENTS) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const lane = new THREE.BufferGeometry();
    lane.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    lane.setIndex(indices);
    lane.computeVertexNormals();
    return lane;
  }, []);

  return <mesh geometry={geometry} material={LANE_MATERIAL} receiveShadow />;
}
