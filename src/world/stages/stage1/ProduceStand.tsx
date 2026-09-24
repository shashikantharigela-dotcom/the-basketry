import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY, instanceMatrix } from "../common/placement";
import { HAY_BALES, PRODUCE_STAND } from "./stage1Layout";

const WOOD = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });
const WOOD_DARK = new THREE.MeshStandardMaterial({ color: "#8c6440", roughness: 0.85, metalness: 0 });
const WICKER = new THREE.MeshStandardMaterial({ color: "#c99a5c", roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
const CANVAS_RED = new THREE.MeshStandardMaterial({ color: "#cf1f24", roughness: 0.7, metalness: 0 });
const CANVAS_CREAM = new THREE.MeshStandardMaterial({ color: "#f5ecdc", roughness: 0.75, metalness: 0 });
const HAY = new THREE.MeshStandardMaterial({ color: "#dcb866", roughness: 0.95, metalness: 0 });
const PRODUCE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4, metalness: 0 });

const PRODUCE_GEOMETRY = new THREE.SphereGeometry(1, 10, 8);
const PRODUCE_COLORS = [
  new THREE.Color("#d42a1f"),
  new THREE.Color("#e8892b"),
  new THREE.Color("#8fb04d"),
  new THREE.Color("#e9c649"),
];

const BASKET_GEOMETRY = new THREE.LatheGeometry(
  [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.034, 0),
    new THREE.Vector2(0.042, 0.02),
    new THREE.Vector2(0.05, 0.05),
  ],
  18
);

// Crate: ≈0.6 m x 0.35 m x 0.45 m.
const CRATE = { w: 0.13, h: 0.075, d: 0.1 };

interface Placed {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

/** Stand-local layout (local +z faces the road; x runs along the counter). */
const CRATES_ON_TABLE: Placed[] = [
  { x: -0.2, y: 0.215, z: 0.02, yaw: 0.05 },
  { x: 0.02, y: 0.215, z: 0.03, yaw: -0.04 },
];
const CRATES_ON_GROUND: Placed[] = [
  { x: 0.52, y: 0, z: 0.12, yaw: 0.2 },
  { x: 0.5, y: CRATE.h + 0.012, z: 0.12, yaw: 0.05 },
  { x: 0.68, y: 0, z: -0.05, yaw: -0.3 },
  { x: -0.55, y: 0, z: 0.2, yaw: 0.5 },
];
const BASKETS: Placed[] = [
  { x: 0.23, y: 0.215, z: 0.02, yaw: 0 },
  { x: -0.4, y: 0, z: 0.34, yaw: 0 },
  { x: 0.36, y: 0, z: 0.38, yaw: 0 },
];

function Crate({ x, y, z, yaw }: Placed) {
  const { w, h, d } = CRATE;
  const t = 0.008;
  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      <mesh material={WOOD_DARK} position={[0, t / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, t, d]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`x${s}`} material={WOOD} position={[(s * (w - t)) / 2, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[t, h, d]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <group key={`z${s}`} position={[0, 0, (s * (d - t)) / 2]}>
          {[0.2, 0.5, 0.8].map((f) => (
            <mesh key={f} material={WOOD} position={[0, h * f, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, h * 0.22, t]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Basket({ x, y, z }: Placed) {
  return (
    <group position={[x, y, z]}>
      <mesh geometry={BASKET_GEOMETRY} material={WICKER} castShadow receiveShadow />
      <mesh material={WOOD_DARK} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.05, 0.005, 6, 20]} />
      </mesh>
    </group>
  );
}

/** A farm-gate produce stand: counter, striped brand-red awning, crates
 * and baskets brimming with harvest — the "products" at their origin. */
export function ProduceStand() {
  const standY = groundY(PRODUCE_STAND.x, PRODUCE_STAND.z);

  // Every piece of produce (in crates and baskets) as one instanced batch,
  // positioned in stand-local space.
  const produce = useMemo(() => {
    const random = createRandom(4242);
    const matrices: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const fill = (cx: number, cy: number, cz: number, yaw: number, nx: number, nz: number, sx: number, sz: number) => {
      const color = PRODUCE_COLORS[Math.floor(random() * PRODUCE_COLORS.length)];
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      for (let i = 0; i < nx; i++) {
        for (let k = 0; k < nz; k++) {
          const lx = (i - (nx - 1) / 2) * sx + (random() - 0.5) * 0.006;
          const lz = (k - (nz - 1) / 2) * sz + (random() - 0.5) * 0.006;
          const r = 0.019 + random() * 0.004;
          matrices.push(instanceMatrix(cx + lx * c + lz * s, cy + (random() - 0.5) * 0.006, cz - lx * s + lz * c, 0, r));
          colors.push(color);
        }
      }
    };
    // Table crates and the lone ground crate (the stack's bottom crate is covered).
    for (const crate of [...CRATES_ON_TABLE, CRATES_ON_GROUND[3]]) {
      fill(crate.x, crate.y + CRATE.h - 0.008, crate.z, crate.yaw, 3, 2, 0.04, 0.04);
    }
    // Top crate of the stack.
    const top = CRATES_ON_GROUND[1];
    fill(top.x, top.y + CRATE.h - 0.008, top.z, top.yaw, 3, 2, 0.04, 0.04);
    for (const basket of BASKETS) fill(basket.x, basket.y + 0.045, basket.z, 0, 2, 2, 0.032, 0.032);
    return { matrices, colors };
  }, []);

  const stripes = 6;
  const awningWidth = 0.86;

  return (
    <group>
      <group position={[PRODUCE_STAND.x, standY, PRODUCE_STAND.z]} rotation={[0, PRODUCE_STAND.rotationY, 0]}>
        {/* Counter. */}
        <mesh material={WOOD} position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.03, 0.3]} />
        </mesh>
        <mesh material={WOOD_DARK} position={[0, 0.11, 0.14]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.16, 0.015]} />
        </mesh>
        {[
          [-0.34, -0.13],
          [0.34, -0.13],
          [-0.34, 0.13],
          [0.34, 0.13],
        ].map(([lx, lz], i) => (
          <mesh key={i} material={WOOD_DARK} position={[lx, 0.1, lz]} castShadow>
            <boxGeometry args={[0.025, 0.2, 0.025]} />
          </mesh>
        ))}
        {/* Awning posts + striped canopy. */}
        {[-0.4, 0.4].map((lx) => (
          <mesh key={lx} material={WOOD_DARK} position={[lx, 0.23, -0.17]} castShadow>
            <boxGeometry args={[0.022, 0.46, 0.022]} />
          </mesh>
        ))}
        <group position={[0, 0.45, 0]} rotation={[0.32, 0, 0]}>
          {Array.from({ length: stripes }, (_, i) => (
            <mesh
              key={i}
              material={i % 2 === 0 ? CANVAS_RED : CANVAS_CREAM}
              position={[-awningWidth / 2 + (awningWidth / stripes) * (i + 0.5), 0, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[awningWidth / stripes, 0.012, 0.44]} />
            </mesh>
          ))}
        </group>

        {[...CRATES_ON_TABLE, ...CRATES_ON_GROUND].map((crate, i) => (
          <Crate key={i} {...crate} />
        ))}
        {BASKETS.map((basket, i) => (
          <Basket key={i} {...basket} />
        ))}
        <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={produce.matrices} colors={produce.colors} />
      </group>

      {HAY_BALES.map(([x, z, yaw], i) => (
        <mesh
          key={i}
          material={HAY}
          position={[x, groundY(x, z) + 0.115, z]}
          rotation={[0, yaw, Math.PI / 2]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.12, 0.12, 0.2, 20]} />
        </mesh>
      ))}
    </group>
  );
}
