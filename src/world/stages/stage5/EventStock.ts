import * as THREE from "three";
import { instanceMatrix } from "../common/placement";

/**
 * Product stock for the exhibition, gathered into shared instanced batches:
 * red-lidded jars, packs, sample cups, cartons, pallets, woven baskets and
 * produce. Every stall fills the same batches through a local frame.
 */

export const JAR_COLORS = [
  new THREE.Color("#e3a33c"),
  new THREE.Color("#c9572c"),
  new THREE.Color("#f0e2c2"),
  new THREE.Color("#b5452a"),
  new THREE.Color("#d9b44a"),
];
export const PACK_COLORS = [
  new THREE.Color("#f2ead8"),
  new THREE.Color("#c8161d"),
  new THREE.Color("#e3b04b"),
  new THREE.Color("#9aa64f"),
  new THREE.Color("#b1462b"),
];
export const PRODUCE_COLORS = [
  new THREE.Color("#f0a92e"),
  new THREE.Color("#c3261c"),
  new THREE.Color("#8f3f5c"),
  new THREE.Color("#e2a126"),
  new THREE.Color("#7fa04a"),
];
const CARTON_COLORS = [new THREE.Color("#c79b62"), new THREE.Color("#bf9258"), new THREE.Color("#d2a871")];

export interface Stock {
  jars: THREE.Matrix4[];
  jarColors: THREE.Color[];
  lids: THREE.Matrix4[];
  packs: THREE.Matrix4[];
  packColors: THREE.Color[];
  cups: THREE.Matrix4[];
  cartons: THREE.Matrix4[];
  cartonColors: THREE.Color[];
  tape: THREE.Matrix4[];
  pallets: THREE.Matrix4[];
  baskets: THREE.Matrix4[];
  produce: THREE.Matrix4[];
  produceColors: THREE.Color[];
}

export function createStock(): Stock {
  return {
    jars: [],
    jarColors: [],
    lids: [],
    packs: [],
    packColors: [],
    cups: [],
    cartons: [],
    cartonColors: [],
    tape: [],
    pallets: [],
    baskets: [],
    produce: [],
    produceColors: [],
  };
}

/** A local frame: (lx, ly, lz) in the frame → world instance matrices. */
export interface Frame {
  at: (lx: number, ly: number, lz: number, sx: number, sy?: number, sz?: number, extraYaw?: number) => THREE.Matrix4;
}

export function makeFrame(x: number, y: number, z: number, yaw: number): Frame {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return {
    at: (lx, ly, lz, sx, sy = sx, sz = sx, extraYaw = 0) =>
      instanceMatrix(x + lx * c + lz * s, y + ly, z - lx * s + lz * c, yaw + extraYaw, sx, sy, sz),
  };
}

function pick<T>(list: T[], random: () => number): T {
  return list[Math.floor(random() * list.length)];
}

/** A jar with a red lid standing at local (lx, base ly, lz). */
export function addJar(stock: Stock, f: Frame, lx: number, ly: number, lz: number, random: () => number, h = 0.05) {
  stock.jars.push(f.at(lx, ly + h / 2, lz, 0.019, h, 0.019));
  stock.jarColors.push(pick(JAR_COLORS, random));
  stock.lids.push(f.at(lx, ly + h + 0.005, lz, 0.02, 0.01, 0.02));
}

export function addPack(stock: Stock, f: Frame, lx: number, ly: number, lz: number, random: () => number, turn = 0) {
  stock.packs.push(f.at(lx, ly + 0.03, lz, 0.038, 0.06, 0.03, turn));
  stock.packColors.push(pick(PACK_COLORS, random));
}

/** A pyramid of jars on a surface at height `top`, centred at (cx, cz). */
export function addJarPyramid(stock: Stock, f: Frame, cx: number, cz: number, top: number, rows: number, random: () => number) {
  for (let layer = 0; layer < rows; layer++) {
    const n = rows - layer;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < Math.max(1, n - 1); j++) {
        addJar(stock, f, cx + (i - (n - 1) / 2) * 0.042, top + layer * 0.06, cz + (j - (n - 2) / 2) * 0.042, random);
      }
    }
  }
}

/** One shelf unit's worth of stock: jars and packs along every level. */
export function stockShelf(
  stock: Stock,
  f: Frame,
  cx: number,
  cz: number,
  turn: number,
  length: number,
  levels: number[],
  random: () => number,
  fill = 1
) {
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  levels.forEach((y, level) => {
    const count = Math.floor((length / 0.046) * (level / levels.length < fill ? 1 : 0.3));
    for (let i = 0; i < count; i++) {
      const along = -length / 2 + 0.023 + i * 0.046;
      const lx = cx + along * c;
      const lz = cz - along * s;
      if (random() < 0.62) addJar(stock, f, lx, y + 0.006, lz, random, 0.048);
      else addPack(stock, f, lx, y + 0.006, lz, random, turn);
    }
  });
}

export function addCups(stock: Stock, f: Frame, x0: number, dx: number, n: number, ly: number, lz: number) {
  for (let i = 0; i < n; i++) stock.cups.push(f.at(x0 + i * dx, ly + 0.007, lz + (i % 2) * 0.02, 0.01, 0.014, 0.01));
}

/** Cartons stacked in threes (on a pallet if asked). */
export function addCartonStack(stock: Stock, f: Frame, count: number, pallet: boolean, random: () => number) {
  if (pallet) stock.pallets.push(f.at(0, 0.02, 0, 0.28, 0.04, 0.24));
  const base = pallet ? 0.04 : 0;
  for (let i = 0; i < count; i++) {
    const layer = Math.floor(i / 3);
    const slot = i % 3;
    const lx = (slot - 1) * 0.09 + (random() - 0.5) * 0.01;
    const lz = (random() - 0.5) * 0.02;
    const y = base + 0.0425 + layer * 0.086;
    const r = (random() - 0.5) * 0.15;
    stock.cartons.push(f.at(lx, y, lz, 0.085, 0.085, 0.095, r));
    stock.cartonColors.push(pick(CARTON_COLORS, random));
    stock.tape.push(f.at(lx, y + 0.0435, lz, 0.087, 0.003, 0.022, r));
  }
}

/** A woven basket heaped with produce at local (bx, base by, bz). */
export function addBasket(stock: Stock, f: Frame, bx: number, by: number, bz: number, color: THREE.Color, random: () => number) {
  stock.baskets.push(f.at(bx, by + 0.025, bz, 0.075, 0.05, 0.075));
  for (let k = 0; k < 8; k++) {
    const a = random() * Math.PI * 2;
    const r = random() * 0.048;
    stock.produce.push(f.at(bx + Math.cos(a) * r, by + 0.055 + random() * 0.012, bz + Math.sin(a) * r, 0.021, 0.017, 0.021));
    stock.produceColors.push(color);
  }
}
