import * as THREE from "three";
import { getRoadRight } from "../../foundation/sRoad";
import { roadOffsetPoint } from "../stage2/stage2Geometry";

// Shared across stages: placing things in road terms — position `u` along
// the S-road and lateral `offset` from its centerline (+ = right of travel).

export interface RoadPlacement {
  u: number;
  offset: number;
  /** Extra yaw relative to "facing the road". */
  yaw?: number;
}

const right = new THREE.Vector3();

/**
 * World x, z and yaw for a road-relative placement. Yaw 0 faces the road
 * from whichever side the placement is on, so a stall, a building front
 * or a person "facing the road" needs no per-side bookkeeping.
 */
export function resolveRoadPlacement(p: RoadPlacement): { x: number; z: number; yaw: number } {
  const [x, z] = roadOffsetPoint(p.u, p.offset);
  getRoadRight(p.u, right);
  const toRoad = p.offset >= 0 ? -1 : 1;
  return { x, z, yaw: Math.atan2(right.x * toRoad, right.z * toRoad) + (p.yaw ?? 0) };
}

export interface RoadStripOptions {
  uFrom: number;
  uTo: number;
  /** Offsets of the edge along the road side and the edge away from it. */
  near: number;
  far: number;
  /** Surface height at a world x/z (e.g. terrain + lift, or a level paving height). */
  surface: (x: number, z: number) => number;
  /** 0–0.5 of the length: ease the far edge in toward the near edge at both
   * ends, like a pull-off; 0 keeps the strip rectangular. */
  taper?: number;
  /** Depth of vertical kerb faces dropped from the chosen edges (hides the
   * gap to the ground below a raised pavement). */
  skirt?: number;
  skirtEdges?: { near?: boolean; far?: boolean; ends?: boolean };
  steps?: number;
}

/**
 * A surface strip following the road between two lateral offsets. UVs run
 * in world units (u along the road, v across it) for tiled paving textures.
 */
export function buildRoadStrip({
  uFrom,
  uTo,
  near,
  far,
  surface,
  taper = 0,
  skirt = 0,
  skirtEdges = {},
  steps = 40,
}: RoadStripOptions): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const nearEdge: THREE.Vector3[] = [];
  const farEdge: THREE.Vector3[] = [];
  const flip = far < near;
  let along = 0;
  let previous: [number, number] | null = null;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = uFrom + (uTo - uFrom) * t;
    const ease = taper > 0 ? Math.min(1, t / taper, (1 - t) / taper) : 1;
    const smooth = ease * ease * (3 - 2 * ease);
    const farOffset = taper > 0 ? near + (far - near) * (0.35 + 0.65 * smooth) : far;
    const nearPoint = roadOffsetPoint(u, near);
    if (previous) along += Math.hypot(nearPoint[0] - previous[0], nearPoint[1] - previous[1]);
    previous = nearPoint;
    for (const offset of [near, farOffset]) {
      const [x, z] = roadOffsetPoint(u, offset);
      const y = surface(x, z);
      positions.push(x, y, z);
      uvs.push(along, Math.abs(offset - near));
      (offset === near ? nearEdge : farEdge).push(new THREE.Vector3(x, y, z));
    }
    if (i < steps) {
      const a = i * 2;
      // Counter-clockwise seen from above, on either side of the road.
      if (!flip) indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      else indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  // Vertical kerb faces: a quad strip from the edge down by `skirt`.
  const addWall = (line: THREE.Vector3[], outwardFlip: boolean) => {
    const base = positions.length / 3;
    line.forEach((p, i) => {
      positions.push(p.x, p.y, p.z, p.x, p.y - skirt, p.z);
      uvs.push(i * 0.1, 0, i * 0.1, skirt);
    });
    for (let i = 0; i < line.length - 1; i++) {
      const a = base + i * 2;
      if (outwardFlip) indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      else indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  };
  if (skirt > 0) {
    if (skirtEdges.near) addWall(nearEdge, !flip);
    if (skirtEdges.far) addWall(farEdge, flip);
    if (skirtEdges.ends) {
      addWall([nearEdge[0], farEdge[0]], flip);
      addWall([nearEdge[nearEdge.length - 1], farEdge[farEdge.length - 1]], !flip);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
