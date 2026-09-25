import { useMemo } from "react";
import * as THREE from "three";
import { BasketEmblem } from "../common/BasketEmblem";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { apronY, BUNTING_POLE_POSITIONS, resolvePlacement } from "./stage3Geometry";
import {
  A_FRAME,
  BANNERS,
  CANOPY,
  CARTON_STACKS,
  COUNTER,
  PARASOLS,
  SHELVES,
  SIDE_TABLE,
  STALL_POTS,
  type ApronPlacement,
} from "./stage3Layout";

// THE BASKETRY brand: red and white, with the basket emblem. No text, no invented logo.
const RED = new THREE.MeshStandardMaterial({ color: "#d0161e", roughness: 0.55, metalness: 0.02, side: THREE.DoubleSide });
const RED_DARK = new THREE.MeshStandardMaterial({ color: "#a50f16", roughness: 0.6, metalness: 0.02, side: THREE.DoubleSide });
const WHITE = new THREE.MeshStandardMaterial({ color: "#f6f2ea", roughness: 0.6, metalness: 0, side: THREE.DoubleSide });
const FRAME = new THREE.MeshStandardMaterial({ color: "#c9ccd0", roughness: 0.4, metalness: 0.5 });
const WOOD = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });
const WOOD_DARK = new THREE.MeshStandardMaterial({ color: "#8c6440", roughness: 0.85, metalness: 0 });
const CARTON = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const PRODUCT = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4, metalness: 0.05 });
const BOARD = new THREE.MeshStandardMaterial({ color: "#2f302d", roughness: 0.9, metalness: 0 });
const TERRACOTTA = new THREE.MeshStandardMaterial({ color: "#b8603f", roughness: 0.85, metalness: 0 });
const LEAF = new THREE.MeshStandardMaterial({ color: "#5d8c3e", roughness: 0.8, metalness: 0 });
const PENNANT = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7, metalness: 0, side: THREE.DoubleSide });
const STRING = new THREE.MeshStandardMaterial({ color: "#e9e1d0", roughness: 0.8, metalness: 0 });

const BOX = new THREE.BoxGeometry(1, 1, 1);
const JAR = new THREE.CylinderGeometry(1, 1, 1, 12);
const PENNANT_GEOMETRY = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0, -1, 0], 3));
  g.setIndex([0, 2, 1]);
  g.computeVertexNormals();
  return g;
})();

const CARTON_COLORS = [new THREE.Color("#c79b62"), new THREE.Color("#bf9258"), new THREE.Color("#d2a871")];
// Packaged products: jars and boxes in warm natural colours with red caps / labels.
const PRODUCT_COLORS = [
  new THREE.Color("#e3b04b"),
  new THREE.Color("#c9572c"),
  new THREE.Color("#f2ead8"),
  new THREE.Color("#9aa64f"),
  new THREE.Color("#b1462b"),
];
const PENNANT_COLORS = [new THREE.Color("#d0161e"), new THREE.Color("#f6f2ea"), new THREE.Color("#e8892b")];

/** A placement resolved onto the apron, as a group transform. */
function At({ place, children }: { place: ApronPlacement; children: React.ReactNode }) {
  const { x, z, yaw } = resolvePlacement(place);
  return (
    <group position={[x, apronY(x, z), z]} rotation={[0, yaw, 0]}>
      {children}
    </group>
  );
}

/** Red pop-up canopy: four slim legs, a pyramid roof and a scalloped valance. */
function Canopy() {
  const size = 0.95;
  const legH = 0.5;
  const roofH = 0.2;
  const roof = useMemo(() => {
    const g = new THREE.ConeGeometry(size * 0.72, roofH, 4, 1, true);
    g.rotateY(Math.PI / 4);
    return g;
  }, []);
  return (
    <At place={CANOPY}>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={FRAME} position={[(sx * size) / 2, legH / 2, (sz * size) / 2]} castShadow>
            <boxGeometry args={[0.022, legH, 0.022]} />
          </mesh>
        ))
      )}
      <mesh geometry={roof} material={RED} position={[0, legH + roofH / 2 + 0.02, 0]} castShadow receiveShadow />
      {/* Valance: red panels round the eave, white piping. */}
      {[0, 1, 2, 3].map((k) => (
        <group key={k} rotation={[0, (k * Math.PI) / 2, 0]}>
          <mesh material={RED_DARK} position={[0, legH - 0.015, size / 2 + 0.005]} castShadow>
            <boxGeometry args={[size + 0.02, 0.07, 0.008]} />
          </mesh>
          <mesh material={WHITE} position={[0, legH - 0.052, size / 2 + 0.006]}>
            <boxGeometry args={[size + 0.02, 0.008, 0.009]} />
          </mesh>
        </group>
      ))}
      <BasketEmblem position={[0, legH + roofH + 0.06, 0]} scale={0.045} />
      {/* Emblem on the front valance. */}
      <BasketEmblem position={[0, legH - 0.012, size / 2 + 0.03]} rotation={[Math.PI / 2, 0, 0]} scale={0.022} />
    </At>
  );
}

/** A slatted display shelf unit, part-stocked with jars and boxed products. */
function Shelf({ place, seed }: { place: ApronPlacement; seed: number }) {
  const items = useMemo(() => {
    const random = createRandom(seed);
    const jars: THREE.Matrix4[] = [];
    const jarColors: THREE.Color[] = [];
    const boxes: THREE.Matrix4[] = [];
    const boxColors: THREE.Color[] = [];
    for (const [level, y] of [0.12, 0.25, 0.38].entries()) {
      // The top shelf is still being filled.
      const count = level === 2 ? 3 : 6;
      for (let i = 0; i < count; i++) {
        const x = -0.14 + i * 0.056;
        if (random() < 0.55) {
          jars.push(instanceMatrix(x, y + 0.028, 0, 0, 0.019, 0.055, 0.019));
          jarColors.push(PRODUCT_COLORS[Math.floor(random() * PRODUCT_COLORS.length)]);
        } else {
          boxes.push(instanceMatrix(x, y + 0.03, 0, 0, 0.042, 0.06, 0.03));
          boxColors.push(PRODUCT_COLORS[Math.floor(random() * PRODUCT_COLORS.length)]);
        }
      }
    }
    return { jars, jarColors, boxes, boxColors };
  }, [seed]);
  return (
    <At place={place}>
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} material={WOOD_DARK} position={[x, 0.22, 0]} castShadow>
          <boxGeometry args={[0.02, 0.44, 0.1]} />
        </mesh>
      ))}
      {[0.12, 0.25, 0.38].map((y) => (
        <mesh key={y} material={WOOD} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.012, 0.1]} />
        </mesh>
      ))}
      <InstancedBatch geometry={JAR} material={PRODUCT} matrices={items.jars} colors={items.jarColors} />
      <InstancedBatch geometry={BOX} material={PRODUCT} matrices={items.boxes} colors={items.boxColors} />
    </At>
  );
}

/** The sampling / demo counter: white top, brand-red front with the emblem,
 * a few sample jars and a small tasting tray. */
function Counter() {
  return (
    <At place={COUNTER}>
      <mesh material={RED} position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.2, 0.18]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.205, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.012, 0.21]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.1, 0.091]}>
        <boxGeometry args={[0.6, 0.03, 0.002]} />
      </mesh>
      <BasketEmblem position={[0, 0.13, 0.1]} rotation={[Math.PI / 2, 0, 0]} scale={0.03} />
      {[-0.22, -0.15, 0.16, 0.23].map((x, i) => (
        <mesh key={x} geometry={JAR} position={[x, 0.24, -0.02]} scale={[0.02, 0.055, 0.02]} castShadow>
          <meshStandardMaterial color={PRODUCT_COLORS[i].getStyle()} roughness={0.4} />
        </mesh>
      ))}
      <mesh material={WOOD} position={[0, 0.216, 0.02]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.008, 20]} />
      </mesh>
      {[-0.03, 0, 0.03].map((x) => (
        <mesh key={x} position={[x, 0.225, 0.02]} scale={0.012} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#e3b04b" roughness={0.5} />
        </mesh>
      ))}
    </At>
  );
}

/** A folding table half-arranged with product boxes, a carton opened beside it. */
function SideTable() {
  return (
    <At place={SIDE_TABLE}>
      <mesh material={WHITE} position={[0, 0.17, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.015, 0.22]} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} material={FRAME} position={[x, 0.085, 0]} castShadow>
          <boxGeometry args={[0.015, 0.17, 0.19]} />
        </mesh>
      ))}
      {[-0.14, -0.07, 0.0].map((x, i) => (
        <mesh key={x} geometry={BOX} position={[x, 0.21, 0]} scale={[0.045, 0.065, 0.032]} castShadow>
          <meshStandardMaterial color={PRODUCT_COLORS[i + 1].getStyle()} roughness={0.5} />
        </mesh>
      ))}
      <mesh geometry={BOX} position={[0.3, 0.045, 0.06]} scale={[0.12, 0.09, 0.1]} castShadow>
        <meshStandardMaterial color="#c79b62" roughness={0.85} />
      </mesh>
    </At>
  );
}

/** White market parasol on a pole with a weighted base. */
function Parasol({ place }: { place: ApronPlacement }) {
  return (
    <At place={place}>
      <mesh material={FRAME} position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.6, 8]} />
      </mesh>
      <mesh material={WOOD_DARK} position={[0, 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.025, 14]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.6, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.36, 0.12, 12, 1, true]} />
      </mesh>
    </At>
  );
}

/** Tall standee banner: white face, brand-red band top and bottom, basket emblem. */
function Banner({ place }: { place: ApronPlacement }) {
  return (
    <At place={place}>
      <mesh material={FRAME} position={[0, 0.3, -0.01]} castShadow>
        <boxGeometry args={[0.012, 0.6, 0.012]} />
      </mesh>
      <mesh material={WOOD_DARK} position={[0, 0.01, -0.01]} castShadow>
        <boxGeometry args={[0.16, 0.02, 0.08]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.34, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.5, 0.008]} />
      </mesh>
      <mesh material={RED} position={[0, 0.555, 0.001]}>
        <boxGeometry args={[0.2, 0.07, 0.009]} />
      </mesh>
      <mesh material={RED} position={[0, 0.125, 0.001]}>
        <boxGeometry args={[0.2, 0.07, 0.009]} />
      </mesh>
      <BasketEmblem position={[0, 0.37, 0.01]} rotation={[Math.PI / 2, 0, 0]} scale={0.05} />
    </At>
  );
}

/** Blank A-frame board (no text). */
function AFrame() {
  return (
    <At place={A_FRAME}>
      {[-1, 1].map((s) => (
        <group key={s} rotation={[s * 0.22, 0, 0]}>
          <mesh material={WOOD} position={[0, 0.1, s * 0.022]} castShadow>
            <boxGeometry args={[0.15, 0.2, 0.01]} />
          </mesh>
          <mesh material={BOARD} position={[0, 0.1, s * 0.028]}>
            <boxGeometry args={[0.125, 0.17, 0.002]} />
          </mesh>
        </group>
      ))}
    </At>
  );
}

/** Stacked cartons (some on pallets) — the stock coming off the truck. */
function CartonStacks() {
  const built = useMemo(() => {
    const random = createRandom(3303);
    const cartons: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const pallets: THREE.Matrix4[] = [];
    const tape: THREE.Matrix4[] = [];
    for (const stack of CARTON_STACKS) {
      const { x, z, yaw } = resolvePlacement(stack);
      const base = apronY(x, z) + (stack.pallet ? 0.04 : 0);
      if (stack.pallet) pallets.push(instanceMatrix(x, apronY(x, z) + 0.02, z, yaw, 0.28, 0.04, 0.24));
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      for (let i = 0; i < stack.count; i++) {
        const layer = Math.floor(i / 3);
        const slot = i % 3;
        const lx = (slot - 1) * 0.09 + (random() - 0.5) * 0.01;
        const lz = (random() - 0.5) * 0.02;
        const y = base + 0.0425 + layer * 0.086;
        const wx = x + lx * c + lz * s;
        const wz = z - lx * s + lz * c;
        const r = yaw + (random() - 0.5) * 0.15;
        cartons.push(instanceMatrix(wx, y, wz, r, 0.085, 0.085, 0.095));
        colors.push(CARTON_COLORS[Math.floor(random() * CARTON_COLORS.length)]);
        tape.push(instanceMatrix(wx, y + 0.0435, wz, r, 0.087, 0.003, 0.022));
      }
    }
    return { cartons, colors, pallets, tape };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={BOX} material={CARTON} matrices={built.cartons} colors={built.colors} />
      <InstancedBatch geometry={BOX} material={WOOD} matrices={built.pallets} />
      <InstancedBatch geometry={BOX} material={RED} matrices={built.tape} castShadow={false} />
    </group>
  );
}

/** Potted plants dressing the stall. */
function StallPots() {
  return (
    <group>
      {STALL_POTS.map((pot, i) => (
        <At key={i} place={pot}>
          <mesh material={TERRACOTTA} position={[0, 0.04, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.038, 0.08, 14]} />
          </mesh>
          <mesh material={LEAF} position={[0, 0.11, 0]} scale={[0.065, 0.06, 0.065]} castShadow>
            <icosahedronGeometry args={[1, 1]} />
          </mesh>
        </At>
      ))}
    </group>
  );
}

/** Festive bunting strung between poles along the back of the apron. */
function Bunting() {
  const built = useMemo(() => {
    const random = createRandom(3313);
    const pennants: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const strings: THREE.Matrix4[] = [];
    const poleHeight = 0.62;
    const q = new THREE.Quaternion();
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
        p.y -= Math.sin(Math.PI * t) * span * 0.08;
        if (k > 0) {
          const dir = new THREE.Vector3().subVectors(p, prev);
          q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
          strings.push(new THREE.Matrix4().compose(prev.clone().add(p).multiplyScalar(0.5), q, new THREE.Vector3(0.004, 0.004, dir.length())));
          const mid = prev.clone().add(p).multiplyScalar(0.5);
          const yaw = Math.atan2(dir.x, dir.z) + Math.PI / 2;
          pennants.push(instanceMatrix(mid.x, mid.y, mid.z, yaw, 0.07, 0.08, 1, 0, (random() - 0.5) * 0.1));
          colors.push(PENNANT_COLORS[(i * 7 + k) % PENNANT_COLORS.length]);
        }
        prev.copy(p);
      }
    }
    const poles = BUNTING_POLE_POSITIONS.map((p) => instanceMatrix(p.x, p.y + poleHeight / 2, p.z, 0, 0.012, poleHeight, 0.012));
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

/** The temporary THE BASKETRY activation being assembled on the apron. */
export function ActivationStall() {
  return (
    <group>
      <Canopy />
      {SHELVES.map((shelf, i) => (
        <Shelf key={i} place={shelf} seed={3320 + i} />
      ))}
      <Counter />
      <SideTable />
      {PARASOLS.map((parasol, i) => (
        <Parasol key={i} place={parasol} />
      ))}
      {BANNERS.map((banner, i) => (
        <Banner key={i} place={banner} />
      ))}
      <AFrame />
      <CartonStacks />
      <StallPots />
      <Bunting />
    </group>
  );
}
