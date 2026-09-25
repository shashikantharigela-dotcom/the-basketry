import { useMemo } from "react";
import * as THREE from "three";
import { BasketEmblem } from "../common/BasketEmblem";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { apronY, BUNTING_POLE_POSITIONS, FRONT_POT_POSITIONS, resolvePlacement } from "./stage3Geometry";
import {
  A_FRAME,
  BANNERS,
  BASKET_TABLE,
  BRANDED_CASES,
  CANOPY,
  CARTON_STACKS,
  DISPLAY_CRATE,
  OPEN_CARTONS,
  PARASOLS,
  PRODUCT_TABLE,
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
const WICKER = new THREE.MeshStandardMaterial({ color: "#c49a5c", roughness: 0.9, metalness: 0 });
const PRODUCE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.65, metalness: 0 });
const MAT = new THREE.MeshStandardMaterial({ color: "#efe7d6", roughness: 0.95, metalness: 0 });

const BOX = new THREE.BoxGeometry(1, 1, 1);
const JAR = new THREE.CylinderGeometry(1, 1, 1, 12);
const BASKET = new THREE.CylinderGeometry(1, 0.78, 1, 14);
const PRODUCE_GEOMETRY = new THREE.IcosahedronGeometry(1, 0);
const POT = new THREE.CylinderGeometry(1, 0.76, 1, 12);
const LEAF_BALL = new THREE.IcosahedronGeometry(1, 1);
const LEAF_GREENS = [new THREE.Color("#5d8c3e"), new THREE.Color("#4f7d34"), new THREE.Color("#6f9a45")];
const BLOOM = new THREE.Color("#d8457a");
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
// Loose produce in the baskets: mangoes, chillies, onions, turmeric, rice.
const PRODUCE_COLORS = [
  new THREE.Color("#f0a92e"),
  new THREE.Color("#c3261c"),
  new THREE.Color("#8f3f5c"),
  new THREE.Color("#e2a126"),
  new THREE.Color("#efe6cf"),
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

/** Red pop-up canopy (wider than deep, like a market gazebo), with its
 * display shelves along the back and the sampling counter at the front,
 * over a light floor mat. Local frame: +z faces the road, x runs along it. */
const CANOPY_W = 1.5;
const CANOPY_D = 1.0;
const CANOPY_LEG = 0.52;
const CANOPY_ROOF = 0.22;

function Canopy() {
  const roof = useMemo(() => {
    // A unit square pyramid, stretched to the canopy's footprint.
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1, true);
    g.rotateY(Math.PI / 4);
    g.scale(CANOPY_W + 0.04, CANOPY_ROOF, CANOPY_D + 0.04);
    return g;
  }, []);
  const eave = CANOPY_LEG;
  return (
    <At place={CANOPY}>
      <mesh material={MAT} position={[0, 0.003, 0]} receiveShadow>
        <boxGeometry args={[CANOPY_W - 0.04, 0.004, CANOPY_D - 0.04]} />
      </mesh>
      <mesh material={RED} position={[0, 0.0055, 0]} receiveShadow>
        <boxGeometry args={[CANOPY_W - 0.12, 0.002, CANOPY_D - 0.12]} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={FRAME} position={[(sx * CANOPY_W) / 2, eave / 2, (sz * CANOPY_D) / 2]} castShadow>
            <boxGeometry args={[0.024, eave, 0.024]} />
          </mesh>
        ))
      )}
      <mesh geometry={roof} material={RED} position={[0, eave + CANOPY_ROOF / 2 + 0.02, 0]} castShadow receiveShadow />
      {/* Valance: red panels round the eave, white piping. */}
      {[0, 1, 2, 3].map((k) => {
        const span = k % 2 === 0 ? CANOPY_W : CANOPY_D;
        const reach = k % 2 === 0 ? CANOPY_D : CANOPY_W;
        return (
          <group key={k} rotation={[0, (k * Math.PI) / 2, 0]}>
            <mesh material={RED_DARK} position={[0, eave - 0.02, reach / 2 + 0.01]} castShadow>
              <boxGeometry args={[span + 0.04, 0.085, 0.008]} />
            </mesh>
            <mesh material={WHITE} position={[0, eave - 0.064, reach / 2 + 0.011]}>
              <boxGeometry args={[span + 0.04, 0.009, 0.009]} />
            </mesh>
          </group>
        );
      })}
      <BasketEmblem position={[0, eave + CANOPY_ROOF + 0.07, 0]} scale={0.055} />
      {/* Emblems on the front valance. */}
      {[-0.45, 0, 0.45].map((x) => (
        <BasketEmblem key={x} position={[x, eave - 0.018, CANOPY_D / 2 + 0.035]} rotation={[Math.PI / 2, 0, 0]} scale={0.026} />
      ))}
      {/* A red back wall behind the shelves. */}
      <mesh material={RED_DARK} position={[0, eave / 2 + 0.02, -CANOPY_D / 2 + 0.01]} receiveShadow>
        <boxGeometry args={[CANOPY_W - 0.04, eave - 0.04, 0.008]} />
      </mesh>
      <BasketEmblem position={[0, eave * 0.78, -CANOPY_D / 2 + 0.03]} rotation={[Math.PI / 2, 0, 0]} scale={0.05} />
      {[-0.5, 0, 0.5].map((x, i) => (
        <Shelf key={x} x={x} z={-CANOPY_D / 2 + 0.1} seed={3320 + i} fill={i === 2 ? 0.55 : 1} />
      ))}
      <Counter z={CANOPY_D / 2 - 0.1} />
    </At>
  );
}

/** A slatted display shelf unit (canopy frame), stocked with jars and boxed
 * products; `fill` < 1 leaves the top shelves still being stocked. */
const SHELF_LEVELS = [0.08, 0.19, 0.3, 0.41];

function Shelf({ x, z, seed, fill }: { x: number; z: number; seed: number; fill: number }) {
  const items = useMemo(() => {
    const random = createRandom(seed);
    const jars: THREE.Matrix4[] = [];
    const jarColors: THREE.Color[] = [];
    const boxes: THREE.Matrix4[] = [];
    const boxColors: THREE.Color[] = [];
    SHELF_LEVELS.forEach((y, level) => {
      const full = level / SHELF_LEVELS.length < fill;
      const count = full ? 7 : 2;
      for (let i = 0; i < count; i++) {
        const lx = -0.165 + i * 0.055;
        const color = PRODUCT_COLORS[Math.floor(random() * PRODUCT_COLORS.length)];
        if (level % 2 === 0 ? random() < 0.7 : random() < 0.3) {
          jars.push(instanceMatrix(lx, y + 0.029, 0, 0, 0.019, 0.052, 0.019));
          jarColors.push(color);
        } else {
          boxes.push(instanceMatrix(lx, y + 0.032, 0, 0, 0.042, 0.058, 0.032));
          boxColors.push(color);
        }
      }
    });
    return { jars, jarColors, boxes, boxColors };
  }, [seed, fill]);
  return (
    <group position={[x, 0, z]}>
      {[-0.2, 0.2].map((sx) => (
        <mesh key={sx} material={WOOD_DARK} position={[sx, 0.235, 0]} castShadow>
          <boxGeometry args={[0.02, 0.47, 0.11]} />
        </mesh>
      ))}
      {SHELF_LEVELS.map((y) => (
        <mesh key={y} material={WOOD} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.012, 0.11]} />
        </mesh>
      ))}
      <InstancedBatch geometry={JAR} material={PRODUCT} matrices={items.jars} colors={items.jarColors} />
      <InstancedBatch geometry={BOX} material={PRODUCT} matrices={items.boxes} colors={items.boxColors} />
    </group>
  );
}

/** The sampling / demo counter: white top, brand-red front with emblems,
 * sample jars and product boxes, and a tasting tray. */
function Counter({ z }: { z: number }) {
  const items = useMemo(() => {
    const random = createRandom(3331);
    const jars: THREE.Matrix4[] = [];
    const jarColors: THREE.Color[] = [];
    for (let i = 0; i < 12; i++) {
      const lx = -0.56 + i * 0.1 + (random() - 0.5) * 0.02;
      if (Math.abs(lx) < 0.12) continue; // the tasting tray
      const tall = random() < 0.5;
      jars.push(instanceMatrix(lx, 0.214 + (tall ? 0.03 : 0.022), -0.03 + (random() - 0.5) * 0.03, 0, 0.02, tall ? 0.06 : 0.044, 0.02));
      jarColors.push(PRODUCT_COLORS[Math.floor(random() * PRODUCT_COLORS.length)]);
    }
    return { jars, jarColors };
  }, []);
  return (
    <group position={[0, 0, z]}>
      <mesh material={RED} position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.26, 0.2, 0.18]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.205, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.012, 0.21]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.03, 0.091]}>
        <boxGeometry args={[1.24, 0.025, 0.002]} />
      </mesh>
      {[-0.4, 0, 0.4].map((x) => (
        <BasketEmblem key={x} position={[x, 0.12, 0.1]} rotation={[Math.PI / 2, 0, 0]} scale={0.032} />
      ))}
      <InstancedBatch geometry={JAR} material={PRODUCT} matrices={items.jars} colors={items.jarColors} />
      <mesh material={WOOD} position={[0, 0.216, 0.02]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.008, 20]} />
      </mesh>
      {[-0.035, 0, 0.035, -0.015, 0.02].map((x, i) => (
        <mesh key={i} position={[x, 0.226, 0.02 + (i > 2 ? 0.03 : -0.01)]} scale={0.013} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={i % 2 ? "#c9572c" : "#e3b04b"} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** A low wooden table of woven baskets heaped with produce (THE BASKETRY's
 * own motif), under a parasol. */
function BasketTable() {
  const built = useMemo(() => {
    const random = createRandom(3341);
    const baskets: THREE.Matrix4[] = [];
    const produce: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const spots: Array<[number, number]> = [
      [-0.19, -0.05],
      [0, -0.06],
      [0.19, -0.05],
      [-0.1, 0.08],
      [0.1, 0.08],
    ];
    spots.forEach(([bx, bz], i) => {
      const r = 0.07;
      baskets.push(instanceMatrix(bx, 0.19, bz, 0, r, 0.05, r));
      const color = PRODUCE_COLORS[i % PRODUCE_COLORS.length];
      for (let k = 0; k < 7; k++) {
        const a = random() * Math.PI * 2;
        const d = random() * r * 0.65;
        produce.push(instanceMatrix(bx + Math.cos(a) * d, 0.218 + random() * 0.012, bz + Math.sin(a) * d, 0, 0.022, 0.018, 0.022));
        colors.push(color);
      }
    });
    return { baskets, produce, colors };
  }, []);
  return (
    <At place={BASKET_TABLE}>
      <mesh material={WOOD} position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.02, 0.34]} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={WOOD_DARK} position={[sx * 0.28, 0.075, sz * 0.14]} castShadow>
            <boxGeometry args={[0.02, 0.15, 0.02]} />
          </mesh>
        ))
      )}
      <InstancedBatch geometry={BASKET} material={WICKER} matrices={built.baskets} />
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={built.produce} colors={built.colors} />
      {/* A basket and a sack of grain on the ground beside the table. */}
      <mesh geometry={BASKET} material={WICKER} position={[0.38, 0.035, 0.1]} scale={[0.08, 0.07, 0.08]} castShadow />
      <mesh material={MAT} position={[-0.38, 0.06, 0.08]} scale={[0.07, 0.06, 0.055]} castShadow>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
    </At>
  );
}

/** A white display table of packed products under the second parasol. */
function ProductTable() {
  const built = useMemo(() => {
    const random = createRandom(3351);
    const boxes: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 8; i++) {
        const lx = -0.245 + i * 0.07;
        const tall = (i + row) % 3 === 0;
        boxes.push(instanceMatrix(lx, 0.185 + (tall ? 0.04 : 0.03), -0.06 + row * 0.12, 0, 0.048, tall ? 0.08 : 0.06, 0.036));
        colors.push(PRODUCT_COLORS[Math.floor(random() * PRODUCT_COLORS.length)]);
      }
    }
    return { boxes, colors };
  }, []);
  return (
    <At place={PRODUCT_TABLE}>
      <mesh material={WHITE} position={[0, 0.17, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.02, 0.32]} />
      </mesh>
      <mesh material={RED} position={[0, 0.12, 0.161]}>
        <boxGeometry args={[0.62, 0.08, 0.004]} />
      </mesh>
      <BasketEmblem position={[0, 0.12, 0.166]} rotation={[Math.PI / 2, 0, 0]} scale={0.026} />
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} material={FRAME} position={[x, 0.08, 0]} castShadow>
          <boxGeometry args={[0.018, 0.16, 0.28]} />
        </mesh>
      ))}
      <InstancedBatch geometry={BOX} material={PRODUCT} matrices={built.boxes} colors={built.colors} />
    </At>
  );
}

/** A big white branded display crate on a pallet, products on top. */
function DisplayCrate() {
  return (
    <At place={DISPLAY_CRATE}>
      <mesh material={WOOD} position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.04, 0.3]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.24, 0.26]} />
      </mesh>
      <mesh material={RED} position={[0, 0.275, 0]}>
        <boxGeometry args={[0.302, 0.012, 0.262]} />
      </mesh>
      <BasketEmblem position={[0, 0.17, 0.132]} rotation={[Math.PI / 2, 0, 0]} scale={0.05} />
      <BasketEmblem position={[0.152, 0.17, 0]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={0.045} />
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={x} geometry={BOX} position={[x, 0.315, 0]} scale={[0.05, 0.07, 0.04]} castShadow>
          <meshStandardMaterial color={PRODUCT_COLORS[i].getStyle()} roughness={0.5} />
        </mesh>
      ))}
    </At>
  );
}

/** Cartons opened for unpacking: flaps folded out, products showing on top,
 * a few set out on the ground beside them. */
function OpenCartons() {
  const built = useMemo(() => {
    const random = createRandom(3371);
    const cartons: THREE.Matrix4[] = [];
    const cartonColors: THREE.Color[] = [];
    const flaps: THREE.Matrix4[] = [];
    const items: THREE.Matrix4[] = [];
    const itemColors: THREE.Color[] = [];
    const place = (x: number, z: number, yaw: number, lx: number, lz: number) => {
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      return [x + lx * c + lz * s, z - lx * s + lz * c] as const;
    };
    for (const spot of OPEN_CARTONS) {
      const { x, z, yaw } = resolvePlacement(spot);
      const y = apronY(x, z);
      const color = CARTON_COLORS[Math.floor(random() * CARTON_COLORS.length)];
      cartons.push(instanceMatrix(x, y + 0.04, z, yaw, 0.1, 0.08, 0.09));
      cartonColors.push(color);
      // Four flaps folded out and down from the open top.
      for (const [lx, lz, w, d] of [
        [0.07, 0, 0.04, 0.09],
        [-0.07, 0, 0.04, 0.09],
        [0, 0.065, 0.1, 0.04],
        [0, -0.065, 0.1, 0.04],
      ] as const) {
        const [fx, fz] = place(x, z, yaw, lx, lz);
        flaps.push(instanceMatrix(fx, y + 0.078, fz, yaw, w, 0.004, d));
        cartonColors.push(color);
      }
      // Product tops inside, and a few set out beside the carton.
      for (let k = 0; k < 4; k++) {
        const [ix, iz] = place(x, z, yaw, (k % 2 ? 1 : -1) * 0.024, (k < 2 ? 1 : -1) * 0.022);
        items.push(instanceMatrix(ix, y + 0.085, iz, yaw, 0.04, 0.02, 0.036));
        itemColors.push(PRODUCT_COLORS[Math.floor(random() * PRODUCT_COLORS.length)]);
      }
      for (let k = 0; k < 3; k++) {
        const [ix, iz] = place(x, z, yaw, -0.03 + k * 0.045, 0.1);
        items.push(instanceMatrix(ix, y + 0.03, iz, yaw + (random() - 0.5) * 0.3, 0.036, 0.06, 0.028));
        itemColors.push(PRODUCT_COLORS[Math.floor(random() * PRODUCT_COLORS.length)]);
      }
    }
    return { boxes: [...cartons, ...flaps], cartonColors, items, itemColors };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={BOX} material={CARTON} matrices={built.boxes} colors={built.cartonColors} />
      <InstancedBatch geometry={BOX} material={PRODUCT} matrices={built.items} colors={built.itemColors} />
    </group>
  );
}

/** Branded product cases (white, red band) stacked beside the display crate. */
function BrandedCases() {
  const cases: Array<[number, number, number, number]> = [
    [-0.055, 0.035, 0, 0.05],
    [0.055, 0.035, 0.02, -0.08],
    [0, 0.105, 0.01, 0.12],
    [0.13, 0.035, -0.05, 0.3],
  ];
  return (
    <At place={BRANDED_CASES}>
      {cases.map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
          <mesh material={WHITE} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.07, 0.08]} />
          </mesh>
          <mesh material={RED}>
            <boxGeometry args={[0.102, 0.018, 0.082]} />
          </mesh>
        </group>
      ))}
    </At>
  );
}

/** A row of potted plants along the road edge of the apron. */
function FrontPots() {
  const built = useMemo(() => {
    const random = createRandom(3361);
    const pots: THREE.Matrix4[] = [];
    const leaves: THREE.Matrix4[] = [];
    const leafColors: THREE.Color[] = [];
    for (const [x, z] of FRONT_POT_POSITIONS) {
      const y = apronY(x, z);
      const s = 0.9 + random() * 0.35;
      pots.push(instanceMatrix(x, y + 0.04 * s, z, 0, 0.05 * s, 0.08 * s, 0.05 * s));
      leaves.push(instanceMatrix(x, y + 0.115 * s, z, random() * 6, 0.07 * s, 0.065 * s, 0.07 * s));
      leafColors.push(random() < 0.3 ? BLOOM : LEAF_GREENS[Math.floor(random() * LEAF_GREENS.length)]);
    }
    return { pots, leaves, leafColors };
  }, []);
  return (
    <group>
      <InstancedBatch geometry={POT} material={TERRACOTTA} matrices={built.pots} />
      <InstancedBatch geometry={LEAF_BALL} material={PRODUCE} matrices={built.leaves} colors={built.leafColors} />
    </group>
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
      <BasketTable />
      <ProductTable />
      <DisplayCrate />
      <OpenCartons />
      <BrandedCases />
      <FrontPots />
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
