import * as THREE from "three";
import { getRoadPoint, getRoadTangent, groundHeight } from "../../foundation/sRoad";
import { ECO_BUILDINGS, ESTATE, GARDEN, LOOP_JOIN_ANGLE, PLAZA, ROAD_ENTRY_U, type EcoBuilding } from "./stage6Layout";

/**
 * Stage 6 geometry: the estate follows the land (it falls toward the rim),
 * layered a few centimetres apart — lawn, plaza paving, the arrival loop —
 * all above the road surface, so the road's unused tail beyond the arrival
 * lies hidden beneath the estate while its visible end flows into the loop.
 */

const LAWN_LIFT = 0.07;
const PAVE_LIFT = 0.08;
const LOOP_LIFT = 0.09;
const ROAD_LIFT = 0.04;

export const lawnY = (x: number, z: number) => groundHeight(x, z) + LAWN_LIFT;
export const plazaY = (x: number, z: number) => groundHeight(x, z) + PAVE_LIFT;
export const loopY = (x: number, z: number) => groundHeight(x, z) + LOOP_LIFT;

/** A surface draped over an x/z rectangle, with vertical skirts on all four sides. */
function drapedRect(
  b: { minX: number; maxX: number; minZ: number; maxZ: number },
  surface: (x: number, z: number) => number,
  step: number,
  skirt: number
): THREE.BufferGeometry {
  const nx = Math.max(2, Math.ceil((b.maxX - b.minX) / step));
  const nz = Math.max(2, Math.ceil((b.maxZ - b.minZ) / step));
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const at = (i: number, j: number) => {
    const x = b.minX + ((b.maxX - b.minX) * i) / nx;
    const z = b.minZ + ((b.maxZ - b.minZ) * j) / nz;
    return [x, surface(x, z), z] as const;
  };
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const [x, y, z] = at(i, j);
      positions.push(x, y, z);
      uvs.push(x, z);
    }
  }
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      indices.push(a, a + nx + 1, a + 1, a + 1, a + nx + 1, a + nx + 2);
    }
  }
  // Skirts round the edge.
  const edge: Array<readonly [number, number, number]> = [];
  for (let i = 0; i <= nx; i++) edge.push(at(i, 0));
  for (let j = 1; j <= nz; j++) edge.push(at(nx, j));
  for (let i = nx - 1; i >= 0; i--) edge.push(at(i, nz));
  for (let j = nz - 1; j >= 0; j--) edge.push(at(0, j));
  const base = positions.length / 3;
  edge.forEach(([x, y, z]) => {
    positions.push(x, y, z, x, y - skirt, z);
    uvs.push(x, z, x, z);
  });
  for (let k = 0; k < edge.length - 1; k++) {
    const a = base + k * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** A draped annulus (or disc when inner = 0) round the garden centre. */
function drapedRing(inner: number, outer: number, surface: (x: number, z: number) => number, segments = 72): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const rings = inner > 0 ? [inner, (inner + outer) / 2, outer] : [0.001, outer * 0.5, outer];
  for (let s = 0; s <= segments; s++) {
    const a = (s / segments) * Math.PI * 2;
    for (const r of rings) {
      const x = GARDEN.x + Math.cos(a) * r;
      const z = GARDEN.z + Math.sin(a) * r;
      positions.push(x, surface(x, z), z);
      uvs.push(x, z);
    }
  }
  const n = rings.length;
  for (let s = 0; s < segments; s++) {
    for (let k = 0; k < n - 1; k++) {
      const a = s * n + k;
      indices.push(a, a + 1, a + n, a + 1, a + n + 1, a + n);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export const ESTATE_LAWN_GEOMETRY = drapedRect(ESTATE, lawnY, 0.4, 0.5);
export const PLAZA_GEOMETRY = drapedRect(PLAZA, plazaY, 0.35, 0.12);
export const GARDEN_LAWN_GEOMETRY = drapedRing(0, GARDEN.lawn, (x, z) => plazaY(x, z) + 0.006);
export const LOOP_GEOMETRY = drapedRing(GARDEN.loopInner, GARDEN.loopOuter, loopY, 96);

// --- The road's arrival: a ribbon from the road's end into the loop ---------------

const ROAD_HALF = 0.8;

/** The arrival connector: a cubic curve leaving the road on its own heading and
 * meeting the loop tangentially, ramping gently from road to plaza level. */
export const ARRIVAL_CURVE = (() => {
  const start = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  getRoadPoint(ROAD_ENTRY_U, start);
  getRoadTangent(ROAD_ENTRY_U, tangent);
  tangent.y = 0;
  tangent.normalize();
  const r = (GARDEN.loopInner + GARDEN.loopOuter) / 2;
  const end = new THREE.Vector3(GARDEN.x + Math.cos(LOOP_JOIN_ANGLE) * r, 0, GARDEN.z + Math.sin(LOOP_JOIN_ANGLE) * r);
  // Joining the loop along its circle (the direction of increasing angle,
  // which continues the road's south-easterly heading).
  const endDir = new THREE.Vector3(-Math.sin(LOOP_JOIN_ANGLE), 0, Math.cos(LOOP_JOIN_ANGLE));
  const flatStart = start.clone().setY(0);
  return new THREE.CubicBezierCurve3(
    flatStart,
    flatStart.clone().addScaledVector(tangent, 1.4),
    end.clone().addScaledVector(endDir, -1.4),
    end
  );
})();

function ribbon(curve: THREE.Curve<THREE.Vector3>, halfWidth: number, liftFrom: number, liftTo: number, steps = 40, across = 6): THREE.BufferGeometry {
  // Subdivided across its width too, so it follows the curving ground
  // instead of cutting a chord below the plaza.
  const positions: number[] = [];
  const indices: number[] = [];
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    curve.getPoint(s, p);
    curve.getTangent(s, t);
    const side = new THREE.Vector3(-t.z, 0, t.x).normalize();
    const lift = THREE.MathUtils.lerp(liftFrom, liftTo, THREE.MathUtils.smoothstep(s, 0, 0.12));
    for (let k = 0; k <= across; k++) {
      const o = (k / across - 0.5) * 2 * halfWidth;
      const x = p.x + side.x * o;
      const z = p.z + side.z * o;
      positions.push(x, groundHeight(x, z) + lift, z);
    }
    if (i < steps) {
      for (let k = 0; k < across; k++) {
        const a = i * (across + 1) + k;
        const b = a + across + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export const ARRIVAL_ROAD_GEOMETRY = ribbon(ARRIVAL_CURVE, ROAD_HALF * 0.9, ROAD_LIFT + 0.004, LOOP_LIFT + 0.002);

// --- Buildings ------------------------------------------------------------------

export interface BuildingFrame {
  /** Centre (world), facing yaw (local +Z toward the plaza), frontage width and depth. */
  x: number;
  z: number;
  yaw: number;
  width: number;
  depth: number;
  /** Level floor of the building: just above the highest paving under it. */
  floor: number;
  /** How far its plinth drops to the lowest ground under it. */
  plinth: number;
  toWorld: (lx: number, lz: number) => [number, number];
}

export function buildingFrame(b: EcoBuilding): BuildingFrame {
  const x = (b.minX + b.maxX) / 2;
  const z = (b.minZ + b.maxZ) / 2;
  const yaw = b.faces === "s" ? Math.PI : b.faces === "w" ? -Math.PI / 2 : 0;
  const width = b.faces === "w" ? b.maxZ - b.minZ : b.maxX - b.minX;
  const depth = b.faces === "w" ? b.maxX - b.minX : b.maxZ - b.minZ;
  let high = -Infinity;
  let low = Infinity;
  for (const cx of [b.minX, b.maxX]) {
    for (const cz of [b.minZ, b.maxZ]) {
      high = Math.max(high, groundHeight(cx, cz));
      low = Math.min(low, groundHeight(cx, cz));
    }
  }
  const floor = high + PAVE_LIFT + 0.04;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return { x, z, yaw, width, depth, floor, plinth: floor - low + 0.25, toWorld: (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c] };
}

export const BUILDING_FRAMES = ECO_BUILDINGS.map(buildingFrame);
