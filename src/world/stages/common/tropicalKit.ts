import * as THREE from "three";
import { groundY, instanceMatrix } from "./placement";

/**
 * Shared stylized tropical vegetation — banana plants, coconut palms and
 * flowering bougainvillea — built into instanced batches, in the same
 * soft miniature style as the tree kit (see treeKit.ts).
 */

/** A drooping leaf/frond blade along local +X (length 1), tapered at both
 * ends, sagging downward toward the tip. Width is set per instance by Z scale. */
function buildBlade(segments: number, sag: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const half = Math.sin(Math.PI * Math.min(1, t * 1.05)) * 0.5 + 0.02;
    const y = -sag * t * t;
    // Slight V-fold along the midrib.
    positions.push(t, y, -half, t, y + 0.06 * half, 0, t, y, half);
    if (i < segments) {
      const a = i * 3;
      indices.push(a, a + 1, a + 3, a + 1, a + 4, a + 3, a + 1, a + 2, a + 4, a + 2, a + 5, a + 4);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export const BANANA_LEAF_GEOMETRY = buildBlade(8, 0.35);
export const PALM_FROND_GEOMETRY = buildBlade(10, 0.55);
export const STEM_GEOMETRY = new THREE.CylinderGeometry(0.7, 1, 1, 8);
STEM_GEOMETRY.translate(0, 0.5, 0);
export const BLOB_GEOMETRY = new THREE.IcosahedronGeometry(1, 1);
export const DOT_GEOMETRY = new THREE.SphereGeometry(1, 6, 4);

export const LEAF_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.7,
  metalness: 0,
  side: THREE.DoubleSide,
});
export const STEM_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
export const FLOWER_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.55, metalness: 0 });

const BANANA_GREENS = [new THREE.Color("#7fae47"), new THREE.Color("#8fbd52"), new THREE.Color("#6f9e3e")];
const PALM_GREENS = [new THREE.Color("#5f8d3a"), new THREE.Color("#6e9a40"), new THREE.Color("#557f33")];
const BANANA_STEM = new THREE.Color("#8aa55a");
const PALM_TRUNK = new THREE.Color("#8b7153");
const COCONUT = new THREE.Color("#6b7a33");
const SHRUB_GREENS = [new THREE.Color("#4f7a36"), new THREE.Color("#5c8a3c"), new THREE.Color("#467032")];
const BOUGAINVILLEA = [new THREE.Color("#d63f8c"), new THREE.Color("#e0569e"), new THREE.Color("#c42f7a"), new THREE.Color("#ef7fb5")];

export interface TropicalBatches {
  stems: THREE.Matrix4[];
  stemColors: THREE.Color[];
  bananaLeaves: THREE.Matrix4[];
  bananaLeafColors: THREE.Color[];
  fronds: THREE.Matrix4[];
  frondColors: THREE.Color[];
  blobs: THREE.Matrix4[];
  blobColors: THREE.Color[];
  dots: THREE.Matrix4[];
  dotColors: THREE.Color[];
}

export function createTropicalBatches(): TropicalBatches {
  return {
    stems: [],
    stemColors: [],
    bananaLeaves: [],
    bananaLeafColors: [],
    fronds: [],
    frondColors: [],
    blobs: [],
    blobColors: [],
    dots: [],
    dotColors: [],
  };
}

const q = new THREE.Quaternion();
const e = new THREE.Euler();
const p = new THREE.Vector3();
const s = new THREE.Vector3();

function blade(out: THREE.Matrix4[], x: number, y: number, z: number, yaw: number, lift: number, length: number, width: number) {
  // Local +X is the blade direction: yaw around Y, then tilt up by `lift`.
  e.set(0, yaw, lift, "YXZ");
  q.setFromEuler(e);
  out.push(new THREE.Matrix4().compose(p.set(x, y, z), q, s.set(length, length, width)));
}

/** A clump of banana plants: a few green pseudostems, each crowned with
 * broad arching leaves. ~2.5–3.5 m tall at 0.22 units / metre. */
export function addBanana(x: number, z: number, scale: number, random: () => number, out: TropicalBatches, y = groundY(x, z)) {
  const stems = 1 + Math.floor(random() * 2);
  for (let k = 0; k < stems; k++) {
    const ox = x + (k === 0 ? 0 : (random() - 0.5) * 0.14 * scale);
    const oz = z + (k === 0 ? 0 : (random() - 0.5) * 0.14 * scale);
    const h = (0.42 + random() * 0.14) * scale * (k === 0 ? 1 : 0.75);
    out.stems.push(instanceMatrix(ox, y - 0.01, oz, 0, 0.028 * scale, h, 0.028 * scale));
    out.stemColors.push(BANANA_STEM);
    const leaves = 6 + Math.floor(random() * 3);
    const color = BANANA_GREENS[Math.floor(random() * BANANA_GREENS.length)];
    for (let i = 0; i < leaves; i++) {
      const yaw = (i / leaves) * Math.PI * 2 + random() * 0.5;
      const lift = 0.45 + random() * 0.55;
      blade(out.bananaLeaves, ox, y + h, oz, yaw, lift, (0.3 + random() * 0.1) * scale, (0.12 + random() * 0.03) * scale);
      out.bananaLeafColors.push(color);
    }
  }
}

/** A coconut palm: a slender, gently curving trunk with a crown of long
 * drooping fronds and a cluster of coconuts. ~10–13 m tall. */
export function addPalm(x: number, z: number, scale: number, random: () => number, out: TropicalBatches, y = groundY(x, z)) {
  const height = (2.2 + random() * 0.6) * scale;
  const lean = (0.08 + random() * 0.12) * (random() < 0.5 ? -1 : 1);
  const leanYaw = random() * Math.PI * 2;
  const segments = 4;
  let cx = x;
  let cz = z;
  let cy = y - 0.02;
  const segLength = height / segments;
  for (let i = 0; i < segments; i++) {
    const tilt = lean * (i + 1) * 0.6;
    e.set(tilt, leanYaw, 0, "YXZ");
    q.setFromEuler(e);
    const r = (0.05 - i * 0.006) * scale;
    out.stems.push(new THREE.Matrix4().compose(p.set(cx, cy, cz), q, s.set(r, segLength * 1.02, r)));
    out.stemColors.push(PALM_TRUNK);
    const up = new THREE.Vector3(0, segLength, 0).applyQuaternion(q);
    cx += up.x;
    cy += up.y;
    cz += up.z;
  }
  const fronds = 9 + Math.floor(random() * 3);
  const color = PALM_GREENS[Math.floor(random() * PALM_GREENS.length)];
  for (let i = 0; i < fronds; i++) {
    const yaw = (i / fronds) * Math.PI * 2 + random() * 0.4;
    const lift = 0.15 + random() * 0.45;
    blade(out.fronds, cx, cy, cz, yaw, lift, (0.75 + random() * 0.25) * scale, (0.13 + random() * 0.04) * scale);
    out.frondColors.push(color);
  }
  for (let i = 0; i < 4; i++) {
    const a = random() * Math.PI * 2;
    out.dots.push(instanceMatrix(cx + Math.cos(a) * 0.05 * scale, cy - 0.05 * scale, cz + Math.sin(a) * 0.05 * scale, 0, 0.035 * scale));
    out.dotColors.push(COCONUT);
  }
}

/** A mounded bougainvillea shrub smothered in magenta-pink bracts. */
export function addBougainvillea(x: number, z: number, scale: number, random: () => number, out: TropicalBatches, y = groundY(x, z)) {
  const lobes = 2 + Math.floor(random() * 2);
  for (let i = 0; i < lobes; i++) {
    const ox = x + (random() - 0.5) * 0.16 * scale;
    const oz = z + (random() - 0.5) * 0.16 * scale;
    const r = (0.1 + random() * 0.05) * scale;
    const cy = y + r * 0.8;
    out.blobs.push(instanceMatrix(ox, cy, oz, random() * 6, r * 1.1, r * 0.9, r));
    out.blobColors.push(SHRUB_GREENS[Math.floor(random() * SHRUB_GREENS.length)]);
    const color = BOUGAINVILLEA[Math.floor(random() * BOUGAINVILLEA.length)];
    const flowers = 14 + Math.floor(random() * 8);
    for (let k = 0; k < flowers; k++) {
      // Scatter on the upper/outer surface of the lobe.
      const a = random() * Math.PI * 2;
      const el = random() * 1.2 - 0.2;
      const fx = ox + Math.cos(a) * Math.cos(el) * r * 1.05;
      const fy = cy + Math.sin(el) * r * 0.9;
      const fz = oz + Math.sin(a) * Math.cos(el) * r * 1.0;
      out.dots.push(instanceMatrix(fx, fy, fz, 0, (0.016 + random() * 0.008) * scale));
      out.dotColors.push(color);
    }
  }
}

/** A generic flowering shrub (smaller blooms, any colour set). */
export function addFloweringShrub(
  x: number,
  z: number,
  scale: number,
  random: () => number,
  out: TropicalBatches,
  blooms: THREE.Color[],
  y = groundY(x, z)
) {
  const r = (0.08 + random() * 0.04) * scale;
  const cy = y + r * 0.75;
  out.blobs.push(instanceMatrix(x, cy, z, random() * 6, r * 1.15, r * 0.85, r));
  out.blobColors.push(SHRUB_GREENS[Math.floor(random() * SHRUB_GREENS.length)]);
  const color = blooms[Math.floor(random() * blooms.length)];
  for (let k = 0; k < 10; k++) {
    const a = random() * Math.PI * 2;
    const el = random() * 1.1;
    out.dots.push(
      instanceMatrix(x + Math.cos(a) * Math.cos(el) * r * 1.05, cy + Math.sin(el) * r * 0.8, z + Math.sin(a) * Math.cos(el) * r, 0, 0.013 * scale)
    );
    out.dotColors.push(color);
  }
}
