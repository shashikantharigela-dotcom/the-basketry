import { useMemo } from "react";
import * as THREE from "three";
import { groundAt, roadOffsetLine, TERRACE_OUTLINE, TERRACE_TOP, TERRACE_WALL_LINE } from "./stage2Geometry";
import { TERRACE } from "./stage2Layout";

// Lime-plastered, cream-washed compound wall with a terracotta base band
// and a slightly proud coping — the familiar low wall round an Indian yard.
const FLOOR = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
const PLASTER = new THREE.MeshStandardMaterial({ color: "#efe5d0", roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
const COPING = new THREE.MeshStandardMaterial({ color: "#f7f0e2", roughness: 0.85, metalness: 0 });
const BASE_BAND = new THREE.MeshStandardMaterial({ color: "#a8563a", roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
const SKIRT = new THREE.MeshStandardMaterial({ color: "#e2d5bb", roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
const GATE_POST = new THREE.MeshStandardMaterial({ color: "#f3ebdb", roughness: 0.85, metalness: 0 });

const PARAPET = 0.13;
const THICKNESS = 0.07;
const BAND_HEIGHT = 0.05;
const STEPS = 60;
/** Gate opening in the road-facing wall, as a fraction along it. */
const GATE: [number, number] = [0.46, 0.53];

/** Courtyard floor: warm lime-plaster / pressed-earth tone with a soft
 * worn variation baked into vertex colours. */
function buildFloor(): THREE.BufferGeometry {
  const shape = new THREE.Shape(TERRACE_OUTLINE.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geometry = new THREE.ShapeGeometry(shape, 24);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, TERRACE_TOP, 0);
  const position = geometry.attributes.position;
  const colors: number[] = [];
  const base = new THREE.Color("#dfcca8");
  const warm = new THREE.Color("#d2ba92");
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const t = 0.5 + 0.5 * Math.sin(x * 0.9) * Math.cos(z * 0.7);
    c.copy(base).lerp(warm, t * 0.55);
    colors.push(c.r, c.g, c.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Plain plastered faces down the non-road sides of the courtyard. */
function buildSkirt(): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const outline = TERRACE_OUTLINE;
  const wallSegments = TERRACE_WALL_LINE.length - 1;
  for (let i = wallSegments; i < outline.length; i++) {
    const [ax, az] = outline[i];
    const [bx, bz] = outline[(i + 1) % outline.length];
    const base = positions.length / 3;
    positions.push(ax, TERRACE_TOP, az, ax, groundAt(ax, az) - 0.4, az, bx, TERRACE_TOP, bz, bx, groundAt(bx, bz) - 0.4, bz);
    indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

interface WallGeometry {
  wall: THREE.BufferGeometry;
  coping: THREE.BufferGeometry;
  band: THREE.BufferGeometry;
  gatePosts: Array<[number, number]>;
}

/** The road-facing compound wall: outer face down to the ground, a low
 * parapet above the courtyard floor, coping on top and a terracotta base
 * band — built as ribbons following the road curve, with a gate opening. */
function buildWall(): WallGeometry {
  const outer = roadOffsetLine(TERRACE.roadUFrom, TERRACE.roadUTo, TERRACE.roadOffset, STEPS);
  const inner = roadOffsetLine(TERRACE.roadUFrom, TERRACE.roadUTo, TERRACE.roadOffset + THICKNESS, STEPS);
  const copeOut = roadOffsetLine(TERRACE.roadUFrom, TERRACE.roadUTo, TERRACE.roadOffset - 0.012, STEPS);
  const copeIn = roadOffsetLine(TERRACE.roadUFrom, TERRACE.roadUTo, TERRACE.roadOffset + THICKNESS + 0.012, STEPS);
  const bandLine = roadOffsetLine(TERRACE.roadUFrom, TERRACE.roadUTo, TERRACE.roadOffset - 0.004, STEPS);
  const top = TERRACE_TOP + PARAPET;

  const wall = { positions: [] as number[], indices: [] as number[] };
  const coping = { positions: [] as number[], indices: [] as number[] };
  const band = { positions: [] as number[], indices: [] as number[] };
  const quad = (
    target: { positions: number[]; indices: number[] },
    a: THREE.Vector3Tuple,
    b: THREE.Vector3Tuple,
    c: THREE.Vector3Tuple,
    d: THREE.Vector3Tuple
  ) => {
    const base = target.positions.length / 3;
    target.positions.push(...a, ...b, ...c, ...d);
    target.indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  };

  const inGate = (i: number) => {
    const t = (i + 0.5) / STEPS;
    return t > GATE[0] && t < GATE[1];
  };

  for (let i = 0; i < STEPS; i++) {
    const [ox0, oz0] = outer[i];
    const [ox1, oz1] = outer[i + 1];
    const [ix0, iz0] = inner[i];
    const [ix1, iz1] = inner[i + 1];
    const g0 = groundAt(ox0, oz0) - 0.05;
    const g1 = groundAt(ox1, oz1) - 0.05;
    if (inGate(i)) {
      // The opening: the wall face drops to the courtyard floor level.
      quad(wall, [ox0, TERRACE_TOP, oz0], [ox0, g0, oz0], [ox1, TERRACE_TOP, oz1], [ox1, g1, oz1]);
      quad(band, [ox0, g0 + BAND_HEIGHT + 0.05, oz0], [ox0, g0, oz0], [ox1, g1 + BAND_HEIGHT + 0.05, oz1], [ox1, g1, oz1]);
      continue;
    }
    // Outer face (road side), parapet inner face, and top.
    quad(wall, [ox0, top, oz0], [ox0, g0, oz0], [ox1, top, oz1], [ox1, g1, oz1]);
    quad(wall, [ix0, top, iz0], [ix0, TERRACE_TOP, iz0], [ix1, top, iz1], [ix1, TERRACE_TOP, iz1]);
    const [cox0, coz0] = copeOut[i];
    const [cox1, coz1] = copeOut[i + 1];
    const [cix0, ciz0] = copeIn[i];
    const [cix1, ciz1] = copeIn[i + 1];
    quad(coping, [cox0, top + 0.02, coz0], [cix0, top + 0.02, ciz0], [cox1, top + 0.02, coz1], [cix1, top + 0.02, ciz1]);
    quad(coping, [cox0, top + 0.02, coz0], [cox0, top - 0.005, coz0], [cox1, top + 0.02, coz1], [cox1, top - 0.005, coz1]);
    quad(coping, [cix0, top + 0.02, ciz0], [cix0, top - 0.005, ciz0], [cix1, top + 0.02, ciz1], [cix1, top - 0.005, ciz1]);
    // Terracotta base band a hair proud of the outer face.
    const [bx0, bz0] = bandLine[i];
    const [bx1, bz1] = bandLine[i + 1];
    quad(band, [bx0, g0 + BAND_HEIGHT + 0.05, bz0], [bx0, g0, bz0], [bx1, g1 + BAND_HEIGHT + 0.05, bz1], [bx1, g1, bz1]);
  }

  const toGeometry = (data: { positions: number[]; indices: number[] }) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(data.positions, 3));
    geometry.setIndex(data.indices);
    geometry.computeVertexNormals();
    return geometry;
  };

  const gateStart = Math.floor(GATE[0] * STEPS);
  const gateEnd = Math.ceil(GATE[1] * STEPS);
  const post = (i: number): [number, number] => {
    const [ox, oz] = outer[i];
    const [ix, iz] = inner[i];
    return [(ox + ix) / 2, (oz + iz) / 2];
  };
  return {
    wall: toGeometry(wall),
    coping: toGeometry(coping),
    band: toGeometry(band),
    gatePosts: [post(gateStart), post(gateEnd)],
  };
}

/** The raised producer courtyard and its low plastered compound wall along
 * the road — the homely enclosure the whole Stage 2 facility sits in. */
export function Terrace() {
  const { floor, skirt, wall } = useMemo(() => ({ floor: buildFloor(), skirt: buildSkirt(), wall: buildWall() }), []);
  return (
    <group>
      <mesh geometry={floor} material={FLOOR} receiveShadow />
      <mesh geometry={skirt} material={SKIRT} receiveShadow castShadow />
      <mesh geometry={wall.wall} material={PLASTER} receiveShadow castShadow />
      <mesh geometry={wall.coping} material={COPING} receiveShadow castShadow />
      <mesh geometry={wall.band} material={BASE_BAND} receiveShadow />
      {wall.gatePosts.map(([x, z], i) => (
        <group key={i} position={[x, TERRACE_TOP, z]}>
          <mesh material={GATE_POST} position={[0, (PARAPET + 0.07) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.11, PARAPET + 0.07, 0.11]} />
          </mesh>
          <mesh material={COPING} position={[0, PARAPET + 0.08, 0]} castShadow>
            <boxGeometry args={[0.14, 0.025, 0.14]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
