import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { BasketEmblem } from "../common/BasketEmblem";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import type { RoadPlacement } from "../common/roadPlacement";
import { BUNTING_POLE_POSITIONS, paveY, resolve } from "./stage4Geometry";
import {
  BANNERS,
  BASKET_DISPLAYS,
  CANOPY,
  CANOPY_SIZE,
  CARTON_STACKS,
  DISPLAY_TABLES,
  HAND_TRUCK,
  PARASOLS,
  PLINTHS,
} from "./stage4Layout";

/**
 * The established THE BASKETRY consumer activation on the plaza: a large red
 * canopy with a U of fully stocked shelves and a tasting counter across its
 * front, product display tables with jar pyramids and sample trays, white
 * and red display plinths, woven basket displays, parasols, standee banners,
 * bunting, and stock arriving from the parked truck. Brand red and white with
 * the existing basket emblem — no text, no new logo.
 *
 * All the products are gathered into a few shared instanced batches.
 */

const RED = new THREE.MeshStandardMaterial({ color: "#d0161e", roughness: 0.55, metalness: 0.02, side: THREE.DoubleSide });
const RED_DARK = new THREE.MeshStandardMaterial({ color: "#a50f16", roughness: 0.6, metalness: 0.02, side: THREE.DoubleSide });
const WHITE = new THREE.MeshStandardMaterial({ color: "#f6f2ea", roughness: 0.6, metalness: 0, side: THREE.DoubleSide });
const FRAME = new THREE.MeshStandardMaterial({ color: "#c9ccd0", roughness: 0.4, metalness: 0.5 });
const WOOD = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });
const WOOD_DARK = new THREE.MeshStandardMaterial({ color: "#8c6440", roughness: 0.85, metalness: 0 });
const TINTED = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4, metalness: 0.05 });
const LID = new THREE.MeshStandardMaterial({ color: "#c8161d", roughness: 0.45, metalness: 0.1 });
const CARTON = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const WICKER = new THREE.MeshStandardMaterial({ color: "#c49a5c", roughness: 0.9, metalness: 0 });
const PRODUCE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.65, metalness: 0 });
const STRING = new THREE.MeshStandardMaterial({ color: "#e9e1d0", roughness: 0.8, metalness: 0 });
const PENNANT = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7, metalness: 0, side: THREE.DoubleSide });
const MAT = new THREE.MeshStandardMaterial({ color: "#efe7d6", roughness: 0.95, metalness: 0 });

const BOX = new THREE.BoxGeometry(1, 1, 1);
/** Canopy shelf units: three along the back wall, one down each side. */
const BACK_SHELVES = [-0.55, 0, 0.55];
const SIDE_SHELF_Z = -0.05;
const JAR = new THREE.CylinderGeometry(1, 1, 1, 12);
const BASKET = new THREE.CylinderGeometry(1, 0.78, 1, 14);
const LUMP = new THREE.IcosahedronGeometry(1, 0);
const PENNANT_GEOMETRY = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0, -1, 0], 3));
  g.setIndex([0, 2, 1]);
  g.computeVertexNormals();
  return g;
})();

// Jars (honey, pickles, spice blends, ghee) and packs in warm natural colours.
const JAR_COLORS = [
  new THREE.Color("#e3a33c"),
  new THREE.Color("#c9572c"),
  new THREE.Color("#f0e2c2"),
  new THREE.Color("#b5452a"),
  new THREE.Color("#d9b44a"),
];
const PACK_COLORS = [
  new THREE.Color("#f2ead8"),
  new THREE.Color("#c8161d"),
  new THREE.Color("#e3b04b"),
  new THREE.Color("#9aa64f"),
  new THREE.Color("#b1462b"),
];
const PRODUCE_COLORS = [
  new THREE.Color("#f0a92e"),
  new THREE.Color("#c3261c"),
  new THREE.Color("#8f3f5c"),
  new THREE.Color("#e2a126"),
  new THREE.Color("#7fa04a"),
];
const CARTON_COLORS = [new THREE.Color("#c79b62"), new THREE.Color("#bf9258"), new THREE.Color("#d2a871")];
const PENNANT_COLORS = [new THREE.Color("#d0161e"), new THREE.Color("#f6f2ea"), new THREE.Color("#e8892b")];

/** Shared product batches, filled in world space. */
interface Stock {
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

/** A local frame at a placement on the paving: local → world instance matrices. */
function localFrame(place: RoadPlacement, lift = 0) {
  const { x, z, yaw } = resolve(place);
  const y = paveY(x, z) + lift;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return {
    x,
    y,
    z,
    yaw,
    at: (lx: number, ly: number, lz: number, sx: number, sy = sx, sz = sx, extraYaw = 0) =>
      instanceMatrix(x + lx * c + lz * s, y + ly, z - lx * s + lz * c, yaw + extraYaw, sx, sy, sz),
  };
}

function pick<T>(list: T[], random: () => number): T {
  return list[Math.floor(random() * list.length)];
}

/** A jar with a red lid, standing at local (lx, ly = its base, lz). */
function addJar(stock: Stock, f: ReturnType<typeof localFrame>, lx: number, ly: number, lz: number, random: () => number, h = 0.05) {
  stock.jars.push(f.at(lx, ly + h / 2, lz, 0.019, h, 0.019));
  stock.jarColors.push(pick(JAR_COLORS, random));
  stock.lids.push(f.at(lx, ly + h + 0.005, lz, 0.02, 0.01, 0.02));
}

/** A pyramid of jars on a surface at height `top`, centred at (cx, cz). */
function addJarPyramid(stock: Stock, f: ReturnType<typeof localFrame>, cx: number, cz: number, top: number, rows: number, random: () => number) {
  for (let layer = 0; layer < rows; layer++) {
    const n = rows - layer;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < Math.max(1, n - 1); j++) {
        addJar(stock, f, cx + (i - (n - 1) / 2) * 0.042, top + layer * 0.06, cz + (j - (n - 2) / 2) * 0.042, random);
      }
    }
  }
}

function buildStock(): Stock {
  const random = createRandom(4401);
  const stock: Stock = {
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

  // Canopy shelves: a U of shelf units, every level stocked.
  const canopy = localFrame(CANOPY);
  const { width: w, depth: d } = CANOPY_SIZE;
  const shelfLevels = [0.09, 0.2, 0.31, 0.42, 0.53];
  const stockShelf = (cx: number, cz: number, turn: number, length: number) => {
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    for (const y of shelfLevels) {
      const count = Math.floor(length / 0.046);
      for (let i = 0; i < count; i++) {
        const along = -length / 2 + 0.023 + i * 0.046;
        const lx = cx + along * c;
        const lz = cz - along * s;
        if (random() < 0.62) addJar(stock, canopy, lx, y + 0.006, lz, random, 0.048);
        else {
          stock.packs.push(canopy.at(lx, y + 0.036, lz, 0.038, 0.06, 0.03, turn));
          stock.packColors.push(pick(PACK_COLORS, random));
        }
      }
    }
  };
  for (const cx of BACK_SHELVES) stockShelf(cx, -d / 2 + 0.14, 0, 0.46);
  for (const side of [-1, 1]) stockShelf(side * (w / 2 - 0.12), SIDE_SHELF_Z, Math.PI / 2, 0.5);

  // Tasting counter: jars along the back edge, sample cups and trays in front.
  for (let i = 0; i < 14; i++) {
    const lx = -0.66 + i * 0.1015;
    if (Math.abs(lx) < 0.16) continue;
    addJar(stock, canopy, lx, 0.224, d / 2 - 0.16, random, random() < 0.5 ? 0.05 : 0.04);
  }
  for (let i = 0; i < 12; i++) {
    stock.cups.push(canopy.at(-0.6 + i * 0.11, 0.232, d / 2 - 0.06 + (i % 2) * 0.02, 0.01, 0.014, 0.01));
  }

  // Display tables: two jar pyramids, packs and a row of sample cups.
  for (const table of DISPLAY_TABLES) {
    const f = localFrame(table);
    addJarPyramid(stock, f, -0.16, -0.02, 0.184, 3, random);
    addJarPyramid(stock, f, 0.17, -0.02, 0.184, 2, random);
    for (let i = 0; i < 4; i++) {
      stock.packs.push(f.at(0.02 + (i - 1.5) * 0.045, 0.214, 0.1, 0.036, 0.058, 0.028));
      stock.packColors.push(pick(PACK_COLORS, random));
    }
    for (let i = 0; i < 5; i++) stock.cups.push(f.at(-0.24 + i * 0.05, 0.192, 0.12, 0.01, 0.014, 0.01));
  }

  // Plinths: a jar pyramid on each.
  for (const plinth of PLINTHS) {
    const f = localFrame(plinth);
    addJarPyramid(stock, f, 0, 0, 0.36, 3, random);
  }

  // Basket displays: three baskets on a tiered stand.
  for (const display of BASKET_DISPLAYS) {
    const f = localFrame(display);
    const spots: Array<[number, number, number]> = [
      [-0.15, 0.12, 0.05],
      [0.15, 0.12, 0.05],
      [0, 0.2, -0.06],
    ];
    spots.forEach(([bx, by, bz], i) => {
      stock.baskets.push(f.at(bx, by + 0.025, bz, 0.08, 0.05, 0.08));
      const color = PRODUCE_COLORS[(i + BASKET_DISPLAYS.indexOf(display)) % PRODUCE_COLORS.length];
      for (let k = 0; k < 8; k++) {
        const a = random() * Math.PI * 2;
        const r = random() * 0.05;
        stock.produce.push(f.at(bx + Math.cos(a) * r, by + 0.055 + random() * 0.012, bz + Math.sin(a) * r, 0.022, 0.018, 0.022));
        stock.produceColors.push(color);
      }
    });
  }

  // Stock from the truck: pallets of cartons, some half unloaded.
  for (const stack of CARTON_STACKS) {
    const f = localFrame(stack);
    if (stack.pallet) stock.pallets.push(f.at(0, 0.02, 0, 0.28, 0.04, 0.24));
    const base = stack.pallet ? 0.04 : 0;
    for (let i = 0; i < stack.count; i++) {
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
  return stock;
}

/** A placement resolved onto the paving, as a group transform. */
function At({ place, children }: { place: RoadPlacement; children: ReactNode }) {
  const { x, z, yaw } = resolve(place);
  return (
    <group position={[x, paveY(x, z), z]} rotation={[0, yaw, 0]}>
      {children}
    </group>
  );
}

/** The large red canopy: pyramid roof, valance with emblems, a red back
 * wall, U of shelf units and a long tasting counter across the front. */
function BigCanopy() {
  const { width: w, depth: d, leg } = CANOPY_SIZE;
  const roofH = 0.26;
  const roof = useMemo(() => {
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1, true);
    g.rotateY(Math.PI / 4);
    g.scale(w + 0.05, roofH, d + 0.05);
    return g;
  }, [w, d]);
  const shelfLevels = [0.09, 0.2, 0.31, 0.42, 0.53];
  const shelf = (key: string, cx: number, cz: number, turn: number, length: number) => (
    <group key={key} position={[cx, 0, cz]} rotation={[0, turn, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} material={WOOD_DARK} position={[(s * length) / 2, 0.29, 0]} castShadow>
          <boxGeometry args={[0.02, 0.58, 0.1]} />
        </mesh>
      ))}
      {shelfLevels.map((y) => (
        <mesh key={y} material={WOOD} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[length, 0.012, 0.1]} />
        </mesh>
      ))}
    </group>
  );
  return (
    <At place={CANOPY}>
      <mesh material={MAT} position={[0, 0.003, 0]} receiveShadow>
        <boxGeometry args={[w - 0.04, 0.004, d - 0.04]} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={FRAME} position={[(sx * w) / 2, leg / 2, (sz * d) / 2]} castShadow>
            <boxGeometry args={[0.028, leg, 0.028]} />
          </mesh>
        ))
      )}
      <mesh geometry={roof} material={RED} position={[0, leg + roofH / 2 + 0.02, 0]} castShadow receiveShadow />
      {[0, 1, 2, 3].map((k) => {
        const span = k % 2 === 0 ? w : d;
        const reach = k % 2 === 0 ? d : w;
        return (
          <group key={k} rotation={[0, (k * Math.PI) / 2, 0]}>
            <mesh material={RED_DARK} position={[0, leg - 0.025, reach / 2 + 0.01]} castShadow>
              <boxGeometry args={[span + 0.05, 0.1, 0.008]} />
            </mesh>
            <mesh material={WHITE} position={[0, leg - 0.077, reach / 2 + 0.011]}>
              <boxGeometry args={[span + 0.05, 0.01, 0.009]} />
            </mesh>
          </group>
        );
      })}
      <BasketEmblem position={[0, leg + roofH + 0.08, 0]} scale={0.07} />
      {[-0.55, 0, 0.55].map((x) => (
        <BasketEmblem key={x} position={[x, leg - 0.022, d / 2 + 0.035]} rotation={[Math.PI / 2, 0, 0]} scale={0.03} />
      ))}
      {/* Red back wall behind the shelves, with the emblem. */}
      <mesh material={RED_DARK} position={[0, leg / 2 + 0.02, -d / 2 + 0.02]} receiveShadow>
        <boxGeometry args={[w - 0.05, leg - 0.05, 0.01]} />
      </mesh>
      {BACK_SHELVES.map((cx) => shelf(`b${cx}`, cx, -d / 2 + 0.14, 0, 0.46))}
      {[-1, 1].map((side) => shelf(`s${side}`, side * (w / 2 - 0.12), SIDE_SHELF_Z, Math.PI / 2, 0.5))}
      {/* Tasting counter: red front with emblems, white top. */}
      <group position={[0, 0, d / 2 - 0.12]}>
        <mesh material={RED} position={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.42, 0.2, 0.2]} />
        </mesh>
        <mesh material={WHITE} position={[0, 0.212, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.46, 0.014, 0.24]} />
        </mesh>
        <mesh material={WHITE} position={[0, 0.03, 0.101]}>
          <boxGeometry args={[1.4, 0.025, 0.002]} />
        </mesh>
        {[-0.45, 0, 0.45].map((x) => (
          <BasketEmblem key={x} position={[x, 0.12, 0.11]} rotation={[Math.PI / 2, 0, 0]} scale={0.034} />
        ))}
        {/* Tasting trays. */}
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} material={WOOD} position={[x, 0.223, 0.03]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.008, 18]} />
          </mesh>
        ))}
      </group>
    </At>
  );
}

/** A product display table: white top, red skirt with the emblem. */
function DisplayTable({ place }: { place: RoadPlacement }) {
  return (
    <At place={place}>
      <mesh material={WHITE} position={[0, 0.176, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.016, 0.34]} />
      </mesh>
      <mesh material={RED} position={[0, 0.11, 0.171]}>
        <boxGeometry args={[0.66, 0.12, 0.004]} />
      </mesh>
      <BasketEmblem position={[0, 0.11, 0.176]} rotation={[Math.PI / 2, 0, 0]} scale={0.028} />
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} material={FRAME} position={[x, 0.084, 0]} castShadow>
          <boxGeometry args={[0.018, 0.168, 0.3]} />
        </mesh>
      ))}
    </At>
  );
}

/** A white display plinth with a red top band and the emblem. */
function Plinth({ place }: { place: RoadPlacement }) {
  return (
    <At place={place}>
      <mesh material={WHITE} position={[0, 0.17, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.34, 0.3]} />
      </mesh>
      <mesh material={RED} position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.32, 0.02, 0.32]} />
      </mesh>
      <mesh material={RED} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.305, 0.04, 0.305]} />
      </mesh>
      <BasketEmblem position={[0, 0.2, 0.152]} rotation={[Math.PI / 2, 0, 0]} scale={0.05} />
    </At>
  );
}

/** A two-tier wooden stand for the basket displays. */
function BasketStand({ place }: { place: RoadPlacement }) {
  return (
    <At place={place}>
      <mesh material={WOOD} position={[0, 0.11, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.02, 0.16]} />
      </mesh>
      <mesh material={WOOD} position={[0, 0.19, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.02, 0.14]} />
      </mesh>
      {[-0.23, 0.23].map((x) => (
        <mesh key={x} material={WOOD_DARK} position={[x, 0.1, 0]} castShadow>
          <boxGeometry args={[0.02, 0.2, 0.26]} />
        </mesh>
      ))}
    </At>
  );
}

function Parasol({ place }: { place: RoadPlacement }) {
  return (
    <At place={place}>
      <mesh material={FRAME} position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.72, 8]} />
      </mesh>
      <mesh material={WOOD_DARK} position={[0, 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.025, 14]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.72, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.46, 0.14, 12, 1, true]} />
      </mesh>
    </At>
  );
}

/** Tall standee banner: white face, red bands, basket emblem (no text). */
function Banner({ place }: { place: RoadPlacement }) {
  return (
    <At place={place}>
      <mesh material={FRAME} position={[0, 0.37, -0.01]} castShadow>
        <boxGeometry args={[0.012, 0.74, 0.012]} />
      </mesh>
      <mesh material={WOOD_DARK} position={[0, 0.01, -0.01]} castShadow>
        <boxGeometry args={[0.18, 0.02, 0.09]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.62, 0.008]} />
      </mesh>
      <mesh material={RED} position={[0, 0.69, 0.001]}>
        <boxGeometry args={[0.24, 0.08, 0.009]} />
      </mesh>
      <mesh material={RED} position={[0, 0.15, 0.001]}>
        <boxGeometry args={[0.24, 0.08, 0.009]} />
      </mesh>
      <BasketEmblem position={[0, 0.45, 0.01]} rotation={[Math.PI / 2, 0, 0]} scale={0.06} />
    </At>
  );
}

function Bunting() {
  const built = useMemo(() => {
    const random = createRandom(4501);
    const pennants: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const strings: THREE.Matrix4[] = [];
    const poleHeight = 0.78;
    const q = new THREE.Quaternion();
    const zAxis = new THREE.Vector3(0, 0, 1);
    const tops = BUNTING_POLE_POSITIONS.map((p) => p.clone().setY(p.y + poleHeight));
    for (let i = 0; i < tops.length - 1; i++) {
      const a = tops[i];
      const b = tops[i + 1];
      const span = a.distanceTo(b);
      const count = Math.max(4, Math.round(span / 0.14));
      const prev = new THREE.Vector3();
      for (let k = 0; k <= count; k++) {
        const t = k / count;
        const p = new THREE.Vector3().lerpVectors(a, b, t);
        p.y -= Math.sin(Math.PI * t) * span * 0.06;
        if (k > 0) {
          const dir = new THREE.Vector3().subVectors(p, prev);
          q.setFromUnitVectors(zAxis, dir.clone().normalize());
          const mid = prev.clone().add(p).multiplyScalar(0.5);
          strings.push(new THREE.Matrix4().compose(mid, q, new THREE.Vector3(0.004, 0.004, dir.length())));
          pennants.push(instanceMatrix(mid.x, mid.y, mid.z, Math.atan2(dir.x, dir.z) + Math.PI / 2, 0.08, 0.09, 1, 0, (random() - 0.5) * 0.1));
          colors.push(PENNANT_COLORS[(i * 7 + k) % PENNANT_COLORS.length]);
        }
        prev.copy(p);
      }
    }
    const poles = BUNTING_POLE_POSITIONS.map((p) => instanceMatrix(p.x, p.y + poleHeight / 2, p.z, 0, 0.013, poleHeight, 0.013));
    return { pennants, colors, strings, poles };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={BOX} material={WOOD_DARK} matrices={built.poles} />
      <InstancedBatch geometry={BOX} material={STRING} matrices={built.strings} castShadow={false} />
      <InstancedBatch geometry={PENNANT_GEOMETRY} material={PENNANT} matrices={built.pennants} colors={built.colors} castShadow={false} />
    </group>
  );
}

/** A red sack trolley with cartons, on its way from the truck. */
function HandTruck() {
  return (
    <At place={HAND_TRUCK}>
      <group rotation={[-0.45, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} material={RED} position={[s * 0.045, 0.14, 0]} castShadow>
            <boxGeometry args={[0.01, 0.28, 0.01]} />
          </mesh>
        ))}
        {[0, 1].map((k) => (
          <mesh key={k} geometry={BOX} position={[0, 0.05 + k * 0.088, 0.045]} scale={[0.085, 0.085, 0.08]} castShadow>
            <meshStandardMaterial color={k === 0 ? "#c79b62" : "#d2a871"} roughness={0.85} />
          </mesh>
        ))}
      </group>
      {[-1, 1].map((s) => (
        <mesh key={s} material={FRAME} position={[s * 0.055, 0.02, -0.01]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.014, 12]} />
        </mesh>
      ))}
    </At>
  );
}

export function ConsumerActivation() {
  const stock = useMemo(() => buildStock(), []);
  return (
    <group name="stage4-activation">
      <BigCanopy />
      {DISPLAY_TABLES.map((table, i) => (
        <DisplayTable key={i} place={table} />
      ))}
      {PLINTHS.map((plinth, i) => (
        <Plinth key={i} place={plinth} />
      ))}
      {BASKET_DISPLAYS.map((display, i) => (
        <BasketStand key={i} place={display} />
      ))}
      {PARASOLS.map((parasol, i) => (
        <Parasol key={i} place={parasol} />
      ))}
      {BANNERS.map((banner, i) => (
        <Banner key={i} place={banner} />
      ))}
      <Bunting />
      <HandTruck />

      <InstancedBatch geometry={JAR} material={TINTED} matrices={stock.jars} colors={stock.jarColors} />
      <InstancedBatch geometry={JAR} material={LID} matrices={stock.lids} castShadow={false} />
      <InstancedBatch geometry={BOX} material={TINTED} matrices={stock.packs} colors={stock.packColors} />
      <InstancedBatch geometry={JAR} material={WHITE} matrices={stock.cups} castShadow={false} />
      <InstancedBatch geometry={BOX} material={CARTON} matrices={stock.cartons} colors={stock.cartonColors} />
      <InstancedBatch geometry={BOX} material={RED} matrices={stock.tape} castShadow={false} />
      <InstancedBatch geometry={BOX} material={WOOD} matrices={stock.pallets} />
      <InstancedBatch geometry={BASKET} material={WICKER} matrices={stock.baskets} />
      <InstancedBatch geometry={LUMP} material={PRODUCE} matrices={stock.produce} colors={stock.produceColors} />
    </group>
  );
}
