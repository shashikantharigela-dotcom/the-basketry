import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { BasketEmblem } from "../common/BasketEmblem";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom } from "../common/placement";
import {
  addBasket,
  addCartonStack,
  addCups,
  addJar,
  addJarPyramid,
  addPack,
  createStock,
  makeFrame,
  PRODUCE_COLORS,
  stockShelf,
  type Stock,
} from "./EventStock";
import { DECKS, eventSurfaceY, resolve, type Deck } from "./stage5Geometry";
import { EVENT_BANNERS, EVENT_CARTONS, PARASOL_TABLES } from "./stage5Layout";

/**
 * The exhibition's activations — distinct layouts in one brand language:
 *   A  red canopy: U of stocked shelves, tasting counter
 *   B  open exhibition booth: red back wall, shelves, product tables
 *   C  large white marquee: product showcase with plinths, warm-lit inside
 *   D  small community demo stall: a cooking demo
 *   E  small red sampling stall
 * plus white pagoda tents, parasol tasting tables, standee banners and
 * stock by the trucks. Brand red and white with the basket emblem only.
 */

const RED = new THREE.MeshStandardMaterial({ color: "#d0161e", roughness: 0.55, metalness: 0.02, side: THREE.DoubleSide });
const RED_DARK = new THREE.MeshStandardMaterial({ color: "#a50f16", roughness: 0.6, metalness: 0.02, side: THREE.DoubleSide });
const WHITE = new THREE.MeshStandardMaterial({ color: "#f6f2ea", roughness: 0.6, metalness: 0, side: THREE.DoubleSide });
const CANVAS = new THREE.MeshStandardMaterial({
  color: "#fbf7ef",
  roughness: 0.7,
  metalness: 0,
  side: THREE.DoubleSide,
  emissive: "#ffe2b0",
  emissiveIntensity: 0.12,
});
const GLOW = new THREE.MeshStandardMaterial({ color: "#fff1d6", roughness: 0.4, metalness: 0, emissive: "#ffd79a", emissiveIntensity: 0.9 });
const FRAME = new THREE.MeshStandardMaterial({ color: "#c9ccd0", roughness: 0.4, metalness: 0.5 });
const WOOD = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });
const WOOD_DARK = new THREE.MeshStandardMaterial({ color: "#8c6440", roughness: 0.85, metalness: 0 });
const DECK = new THREE.MeshStandardMaterial({ color: "#cbb99c", roughness: 0.85, metalness: 0 });
const STEEL_DARK = new THREE.MeshStandardMaterial({ color: "#2f3236", roughness: 0.5, metalness: 0.5 });
const TINTED = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4, metalness: 0.05 });
const LID = new THREE.MeshStandardMaterial({ color: "#c8161d", roughness: 0.45, metalness: 0.1 });
const CARTON = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const WICKER = new THREE.MeshStandardMaterial({ color: "#c49a5c", roughness: 0.9, metalness: 0 });
const PRODUCE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.65, metalness: 0 });

const BOX = new THREE.BoxGeometry(1, 1, 1);
const JAR = new THREE.CylinderGeometry(1, 1, 1, 12);
const BASKET = new THREE.CylinderGeometry(1, 0.78, 1, 14);
const LUMP = new THREE.IcosahedronGeometry(1, 0);
const SHELF_LEVELS = [0.09, 0.2, 0.31, 0.42, 0.53];

/** A pyramid roof stretched to a w × d footprint. */
function pyramidRoof(w: number, d: number, h: number): THREE.BufferGeometry {
  const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1, true);
  g.rotateY(Math.PI / 4);
  g.scale(w, h, d);
  return g;
}

/** A deck's local frame: children in deck-local coordinates, standing on its top. */
function OnDeck({ deck, children }: { deck: Deck; children: ReactNode }) {
  return (
    <group position={[deck.x, deck.top, deck.z]} rotation={[0, deck.yaw, 0]}>
      <mesh material={DECK} position={[0, -deck.drop / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[deck.width + 0.06, deck.drop, deck.depth + 0.06]} />
      </mesh>
      {children}
    </group>
  );
}

function Legs({ w, d, h }: { w: number; d: number; h: number }) {
  return (
    <>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={FRAME} position={[(sx * w) / 2, h / 2, (sz * d) / 2]} castShadow>
            <boxGeometry args={[0.024, h, 0.024]} />
          </mesh>
        ))
      )}
    </>
  );
}

/** Scalloped valance round an eave (red panels + white piping by default). */
function Valance({ w, d, y, panel = RED_DARK, piping = WHITE }: { w: number; d: number; y: number; panel?: THREE.Material; piping?: THREE.Material }) {
  return (
    <>
      {[0, 1, 2, 3].map((k) => {
        const span = k % 2 === 0 ? w : d;
        const reach = k % 2 === 0 ? d : w;
        return (
          <group key={k} rotation={[0, (k * Math.PI) / 2, 0]}>
            <mesh material={panel} position={[0, y - 0.03, reach / 2 + 0.01]} castShadow>
              <boxGeometry args={[span + 0.04, 0.085, 0.008]} />
            </mesh>
            <mesh material={piping} position={[0, y - 0.075, reach / 2 + 0.011]}>
              <boxGeometry args={[span + 0.04, 0.009, 0.009]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function ShelfUnit({ x, z, turn, length }: { x: number; z: number; turn: number; length: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, turn, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} material={WOOD_DARK} position={[(s * length) / 2, 0.29, 0]} castShadow>
          <boxGeometry args={[0.02, 0.58, 0.1]} />
        </mesh>
      ))}
      {SHELF_LEVELS.map((y) => (
        <mesh key={y} material={WOOD} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[length, 0.012, 0.1]} />
        </mesh>
      ))}
    </group>
  );
}

/** A counter: brand-red front with emblems, white top. */
function Counter({ z, width, emblems = 3 }: { z: number; width: number; emblems?: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh material={RED} position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.2, 0.2]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.212, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.04, 0.014, 0.24]} />
      </mesh>
      {Array.from({ length: emblems }, (_, i) => (emblems === 1 ? 0 : -width * 0.32 + (i * width * 0.64) / (emblems - 1))).map((x) => (
        <BasketEmblem key={x} position={[x, 0.12, 0.105]} rotation={[Math.PI / 2, 0, 0]} scale={0.032} />
      ))}
    </group>
  );
}

function ProductTable({ x, z, turn = 0 }: { x: number; z: number; turn?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, turn, 0]}>
      <mesh material={WHITE} position={[0, 0.176, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.016, 0.3]} />
      </mesh>
      <mesh material={RED} position={[0, 0.11, 0.151]}>
        <boxGeometry args={[0.56, 0.12, 0.004]} />
      </mesh>
      <BasketEmblem position={[0, 0.11, 0.156]} rotation={[Math.PI / 2, 0, 0]} scale={0.026} />
      {[-0.25, 0.25].map((lx) => (
        <mesh key={lx} material={FRAME} position={[lx, 0.084, 0]} castShadow>
          <boxGeometry args={[0.016, 0.168, 0.26]} />
        </mesh>
      ))}
    </group>
  );
}

function Plinth({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh material={WHITE} position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.32, 0.26]} />
      </mesh>
      <mesh material={RED} position={[0, 0.33, 0]} castShadow>
        <boxGeometry args={[0.28, 0.02, 0.28]} />
      </mesh>
      <BasketEmblem position={[0, 0.19, 0.132]} rotation={[Math.PI / 2, 0, 0]} scale={0.045} />
    </group>
  );
}

// --- A: red canopy ------------------------------------------------------------

function ActivationA() {
  const { a: deck } = DECKS;
  const { width: w, depth: d } = deck;
  const leg = 0.56;
  const roof = useMemo(() => pyramidRoof(w + 0.05, d + 0.05, 0.26), [w, d]);
  return (
    <OnDeck deck={deck}>
      <Legs w={w} d={d} h={leg} />
      <mesh geometry={roof} material={RED} position={[0, leg + 0.15, 0]} castShadow receiveShadow />
      <Valance w={w} d={d} y={leg} />
      <BasketEmblem position={[0, leg + 0.36, 0]} scale={0.07} />
      <mesh material={RED_DARK} position={[0, leg / 2 + 0.02, -d / 2 + 0.02]} receiveShadow>
        <boxGeometry args={[w - 0.05, leg - 0.05, 0.01]} />
      </mesh>
      {[-0.55, 0, 0.55].map((x) => (
        <ShelfUnit key={x} x={x} z={-d / 2 + 0.14} turn={0} length={0.46} />
      ))}
      {[-1, 1].map((side) => (
        <ShelfUnit key={side} x={side * (w / 2 - 0.12)} z={-0.05} turn={Math.PI / 2} length={0.5} />
      ))}
      <Counter z={d / 2 - 0.12} width={1.42} />
      <mesh material={GLOW} position={[0, leg - 0.02, 0]}>
        <boxGeometry args={[w * 0.6, 0.01, 0.08]} />
      </mesh>
    </OnDeck>
  );
}

function stockA(stock: Stock, random: () => number) {
  const { a: deck } = DECKS;
  const f = makeFrame(deck.x, deck.top, deck.z, deck.yaw);
  const { width: w, depth: d } = deck;
  for (const cx of [-0.55, 0, 0.55]) stockShelf(stock, f, cx, -d / 2 + 0.14, 0, 0.46, SHELF_LEVELS, random);
  for (const side of [-1, 1]) stockShelf(stock, f, side * (w / 2 - 0.12), -0.05, Math.PI / 2, 0.5, SHELF_LEVELS, random);
  for (let i = 0; i < 14; i++) {
    const lx = -0.66 + i * 0.1015;
    if (Math.abs(lx) > 0.14) addJar(stock, f, lx, 0.224, d / 2 - 0.16, random, random() < 0.5 ? 0.05 : 0.04);
  }
  addCups(stock, f, -0.6, 0.11, 12, 0.225, d / 2 - 0.06);
}

// --- B: open exhibition booth ---------------------------------------------------

function ActivationB() {
  const { b: deck } = DECKS;
  const { width: w, depth: d } = deck;
  const wallH = 0.62;
  return (
    <OnDeck deck={deck}>
      {/* Red back wall with the emblem, white side returns. */}
      <mesh material={RED} position={[0, wallH / 2, -d / 2 + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[w, wallH, 0.03]} />
      </mesh>
      <BasketEmblem position={[0, wallH * 0.82, -d / 2 + 0.045]} rotation={[Math.PI / 2, 0, 0]} scale={0.07} />
      {[-1, 1].map((side) => (
        <mesh key={side} material={WHITE} position={[(side * w) / 2, wallH / 2, -d * 0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.03, wallH, d * 0.7]} />
        </mesh>
      ))}
      {/* Header fascia across the open front on two posts. */}
      {[-1, 1].map((side) => (
        <mesh key={side} material={WHITE} position={[side * (w / 2 - 0.02), wallH / 2 + 0.05, d / 2 - 0.04]} castShadow>
          <boxGeometry args={[0.04, wallH + 0.1, 0.04]} />
        </mesh>
      ))}
      <mesh material={RED} position={[0, wallH + 0.08, d / 2 - 0.04]} castShadow>
        <boxGeometry args={[w + 0.02, 0.1, 0.04]} />
      </mesh>
      {[-0.5, 0, 0.5].map((x) => (
        <BasketEmblem key={x} position={[x, wallH + 0.08, d / 2 - 0.015]} rotation={[Math.PI / 2, 0, 0]} scale={0.03} />
      ))}
      <mesh material={GLOW} position={[0, wallH + 0.025, d / 2 - 0.07]}>
        <boxGeometry args={[w * 0.8, 0.012, 0.03]} />
      </mesh>
      {/* Shelving along the back wall, product tables at the front. */}
      {[-0.5, 0, 0.5].map((x) => (
        <ShelfUnit key={x} x={x} z={-d / 2 + 0.1} turn={0} length={0.44} />
      ))}
      <ProductTable x={-0.4} z={d / 2 - 0.25} />
      <ProductTable x={0.4} z={d / 2 - 0.25} />
    </OnDeck>
  );
}

function stockB(stock: Stock, random: () => number) {
  const { b: deck } = DECKS;
  const f = makeFrame(deck.x, deck.top, deck.z, deck.yaw);
  const { depth: d } = deck;
  for (const cx of [-0.5, 0, 0.5]) stockShelf(stock, f, cx, -d / 2 + 0.1, 0, 0.44, SHELF_LEVELS, random);
  for (const tx of [-0.4, 0.4]) {
    addJarPyramid(stock, f, tx - 0.12, d / 2 - 0.27, 0.184, 3, random);
    for (let i = 0; i < 3; i++) addPack(stock, f, tx + 0.1 + (i - 1) * 0.045, 0.184, d / 2 - 0.3, random);
    addCups(stock, f, tx - 0.2, 0.05, 5, 0.184, d / 2 - 0.15);
  }
}

// --- C: large white marquee --------------------------------------------------------

function ActivationC() {
  const { c: deck } = DECKS;
  const { width: w, depth: d } = deck;
  const leg = 0.62;
  const peak = useMemo(() => pyramidRoof(w / 3 + 0.02, d + 0.05, 0.42), [w, d]);
  return (
    <OnDeck deck={deck}>
      <Legs w={w} d={d} h={leg} />
      {[-1, 0, 1].map((i) => (
        <mesh key={i} geometry={peak} material={CANVAS} position={[(i * w) / 3, leg + 0.23, 0]} castShadow receiveShadow />
      ))}
      <Valance w={w} d={d} y={leg} panel={CANVAS} piping={RED} />
      {/* Canvas walls on the back and sides; the front stands open. */}
      <mesh material={CANVAS} position={[0, leg / 2, -d / 2]} receiveShadow>
        <boxGeometry args={[w, leg, 0.01]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} material={CANVAS} position={[(side * w) / 2, leg / 2, -d * 0.2]} receiveShadow>
          <boxGeometry args={[0.01, leg, d * 0.6]} />
        </mesh>
      ))}
      {/* A red display wall with the emblem, warm light strips overhead. */}
      <mesh material={RED} position={[0, 0.3, -d / 2 + 0.03]} receiveShadow>
        <boxGeometry args={[w * 0.5, 0.5, 0.02]} />
      </mesh>
      <BasketEmblem position={[0, 0.36, -d / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={0.07} />
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} material={GLOW} position={[x, leg - 0.03, 0]}>
          <boxGeometry args={[0.5, 0.012, 0.05]} />
        </mesh>
      ))}
      {/* The showcase: plinths along the back, a long table at the front. */}
      {[-0.85, -0.3, 0.3, 0.85].map((x) => (
        <Plinth key={x} x={x} z={-d / 2 + 0.3} />
      ))}
      <ProductTable x={-0.5} z={0.35} />
      <ProductTable x={0.5} z={0.35} />
      {[-1, 1].map((side) => (
        <ShelfUnit key={side} x={side * (w / 2 - 0.12)} z={0.05} turn={Math.PI / 2} length={0.46} />
      ))}
    </OnDeck>
  );
}

function stockC(stock: Stock, random: () => number) {
  const { c: deck } = DECKS;
  const f = makeFrame(deck.x, deck.top, deck.z, deck.yaw);
  const { width: w, depth: d } = deck;
  for (const x of [-0.85, -0.3, 0.3, 0.85]) addJarPyramid(stock, f, x, -d / 2 + 0.3, 0.34, 3, random);
  for (const tx of [-0.5, 0.5]) {
    addJarPyramid(stock, f, tx - 0.1, 0.33, 0.184, 3, random);
    addBasket(stock, f, tx + 0.16, 0.184, 0.34, PRODUCE_COLORS[tx < 0 ? 0 : 2], random);
    addCups(stock, f, tx - 0.22, 0.05, 4, 0.184, 0.46);
  }
  for (const side of [-1, 1]) stockShelf(stock, f, side * (w / 2 - 0.12), 0.05, Math.PI / 2, 0.46, SHELF_LEVELS, random);
}

// --- D: small community demo stall ---------------------------------------------------

function SmallCanopy({ deck, children }: { deck: Deck; children?: ReactNode }) {
  const { width: w, depth: d } = deck;
  const leg = 0.5;
  const roof = useMemo(() => pyramidRoof(w + 0.04, d + 0.04, 0.2), [w, d]);
  return (
    <OnDeck deck={deck}>
      <Legs w={w} d={d} h={leg} />
      <mesh geometry={roof} material={RED} position={[0, leg + 0.12, 0]} castShadow receiveShadow />
      <Valance w={w} d={d} y={leg} />
      <BasketEmblem position={[0, leg + 0.27, 0]} scale={0.05} />
      {children}
    </OnDeck>
  );
}

function ActivationD() {
  const { d: deck } = DECKS;
  return (
    <SmallCanopy deck={deck}>
      <Counter z={deck.depth / 2 - 0.14} width={0.9} emblems={1} />
      {/* The demo: a cooktop, a pan and bowls on the counter, a blank menu board behind. */}
      <mesh material={STEEL_DARK} position={[-0.15, 0.232, deck.depth / 2 - 0.16]} castShadow>
        <boxGeometry args={[0.2, 0.025, 0.14]} />
      </mesh>
      <mesh material={STEEL_DARK} position={[-0.15, 0.255, deck.depth / 2 - 0.16]} castShadow>
        <cylinderGeometry args={[0.05, 0.045, 0.02, 16]} />
      </mesh>
      {[0.08, 0.2, 0.32].map((x) => (
        <mesh key={x} material={WHITE} position={[x, 0.235, deck.depth / 2 - 0.15]} castShadow>
          <cylinderGeometry args={[0.03, 0.02, 0.025, 14]} />
        </mesh>
      ))}
      <mesh material={STEEL_DARK} position={[0, 0.34, -deck.depth / 2 + 0.05]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
      </mesh>
    </SmallCanopy>
  );
}

function stockD(stock: Stock, random: () => number) {
  const { d: deck } = DECKS;
  const f = makeFrame(deck.x, deck.top, deck.z, deck.yaw);
  for (let i = 0; i < 4; i++) addJar(stock, f, 0.1 + i * 0.07, 0.224, deck.depth / 2 - 0.24, random);
  addCups(stock, f, -0.35, 0.045, 4, 0.224, deck.depth / 2 - 0.08);
}

function ActivationE() {
  const { e: deck } = DECKS;
  return (
    <SmallCanopy deck={deck}>
      <Counter z={deck.depth / 2 - 0.14} width={0.82} emblems={1} />
      <ShelfUnit x={0} z={-deck.depth / 2 + 0.1} turn={0} length={0.6} />
    </SmallCanopy>
  );
}

function stockE(stock: Stock, random: () => number) {
  const { e: deck } = DECKS;
  const f = makeFrame(deck.x, deck.top, deck.z, deck.yaw);
  stockShelf(stock, f, 0, -deck.depth / 2 + 0.1, 0, 0.6, SHELF_LEVELS, random);
  addJarPyramid(stock, f, -0.18, deck.depth / 2 - 0.16, 0.224, 2, random);
  addCups(stock, f, 0.05, 0.05, 5, 0.224, deck.depth / 2 - 0.12);
}

// --- Pagoda tents ----------------------------------------------------------------

function PagodaTent({ deck }: { deck: Deck }) {
  const { width: w, depth: d } = deck;
  const leg = 0.55;
  const roof = useMemo(() => pyramidRoof(w + 0.04, d + 0.04, 0.5), [w, d]);
  return (
    <OnDeck deck={deck}>
      <Legs w={w} d={d} h={leg} />
      <mesh geometry={roof} material={CANVAS} position={[0, leg + 0.26, 0]} castShadow receiveShadow />
      <Valance w={w} d={d} y={leg} panel={CANVAS} piping={RED} />
      <mesh material={CANVAS} position={[0, leg / 2, -d / 2]} receiveShadow>
        <boxGeometry args={[w, leg, 0.01]} />
      </mesh>
      <mesh material={GLOW} position={[0, leg - 0.03, 0]}>
        <boxGeometry args={[w * 0.5, 0.012, 0.05]} />
      </mesh>
      <ProductTable x={0} z={d / 2 - 0.22} />
    </OnDeck>
  );
}

function stockPagodas(stock: Stock, random: () => number) {
  DECKS.pagodas.forEach((deck, i) => {
    const f = makeFrame(deck.x, deck.top, deck.z, deck.yaw);
    addJarPyramid(stock, f, -0.1, deck.depth / 2 - 0.24, 0.184, 3, random);
    addBasket(stock, f, 0.16, 0.184, deck.depth / 2 - 0.22, PRODUCE_COLORS[(i + 1) % PRODUCE_COLORS.length], random);
  });
}

// --- Parasol tasting tables, banners, stock by the trucks ---------------------------------

function ParasolTable({ x, z, yaw }: { x: number; z: number; yaw: number }) {
  const y = eventSurfaceY(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      <mesh material={FRAME} position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.72, 8]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.72, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.44, 0.14, 12, 1, true]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.17, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.016, 18]} />
      </mesh>
      <mesh material={RED} position={[0, 0.085, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.06, 0.17, 10]} />
      </mesh>
    </group>
  );
}

function Banner({ x, z, yaw }: { x: number; z: number; yaw: number }) {
  const y = eventSurfaceY(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
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
    </group>
  );
}

export function Activations() {
  const stock = useMemo(() => {
    const random = createRandom(5101);
    const s = createStock();
    stockA(s, random);
    stockB(s, random);
    stockC(s, random);
    stockD(s, random);
    stockE(s, random);
    stockPagodas(s, random);
    for (const table of PARASOL_TABLES) {
      const { x, z, yaw } = resolve(table);
      const f = makeFrame(x, eventSurfaceY(x, z), z, yaw);
      addJarPyramid(s, f, -0.05, 0, 0.176, 2, random);
      addCups(s, f, 0.05, 0.04, 3, 0.176, 0.08);
    }
    for (const stack of EVENT_CARTONS) {
      const { x, z, yaw } = resolve(stack);
      addCartonStack(s, makeFrame(x, eventSurfaceY(x, z), z, yaw), stack.count, stack.pallet ?? false, random);
    }
    return s;
  }, []);
  const placed = useMemo(
    () => ({
      parasols: PARASOL_TABLES.map(resolve),
      banners: EVENT_BANNERS.map(resolve),
    }),
    []
  );

  return (
    <group name="stage5-activations">
      <ActivationA />
      <ActivationB />
      <ActivationC />
      <ActivationD />
      <ActivationE />
      {DECKS.pagodas.map((deck, i) => (
        <PagodaTent key={i} deck={deck} />
      ))}
      {placed.parasols.map((p, i) => (
        <ParasolTable key={i} {...p} />
      ))}
      {placed.banners.map((p, i) => (
        <Banner key={i} {...p} />
      ))}

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
