import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { Crate } from "../common/HarvestKit";
import { CRATE, PRODUCE, PRODUCE_GEOMETRY, fillProduce } from "../common/harvest";
import { createRandom } from "../common/placement";
import { HALL, LOADING_CANOPY, RED_CANOPY, SILOS } from "./stage2Layout";
import { TERRACE_TOP } from "./stage2Geometry";

// Cream lime plaster with a terracotta base band, a red corrugated roof,
// maroon door frames and dark-blue solar panels.
const PLASTER = new THREE.MeshStandardMaterial({ color: "#f0e5cf", roughness: 0.9, metalness: 0 });
const GABLE = new THREE.MeshStandardMaterial({ color: "#f0e5cf", roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
const BASE_BAND = new THREE.MeshStandardMaterial({ color: "#a8563a", roughness: 0.9, metalness: 0 });
const PLINTH = new THREE.MeshStandardMaterial({ color: "#d8c9aa", roughness: 0.95, metalness: 0 });
const ROOF_RED = new THREE.MeshStandardMaterial({ color: "#c0352b", roughness: 0.5, metalness: 0.2 });
const RIB_RED = new THREE.MeshStandardMaterial({ color: "#a82b23", roughness: 0.45, metalness: 0.25 });
const FRAME = new THREE.MeshStandardMaterial({ color: "#7a2e22", roughness: 0.6, metalness: 0.05 });
const POST = new THREE.MeshStandardMaterial({ color: "#efe6d4", roughness: 0.8, metalness: 0 });
const INTERIOR = new THREE.MeshStandardMaterial({ color: "#8a6a4c", roughness: 0.9, metalness: 0 });
const INTERIOR_GLOW = new THREE.MeshStandardMaterial({
  color: "#f3d7a6",
  emissive: "#f0b86a",
  emissiveIntensity: 0.4,
  roughness: 0.8,
  metalness: 0,
});
const SHELF = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });
const SOLAR_CELL = new THREE.MeshStandardMaterial({ color: "#1f3566", roughness: 0.25, metalness: 0.35 });
const SOLAR_FRAME = new THREE.MeshStandardMaterial({ color: "#c9ccd0", roughness: 0.4, metalness: 0.5 });
const TANK = new THREE.MeshStandardMaterial({ color: "#26282a", roughness: 0.55, metalness: 0.05 });
const STEEL = new THREE.MeshStandardMaterial({ color: "#d9dcdf", roughness: 0.38, metalness: 0.3 });
const STEEL_DARK = new THREE.MeshStandardMaterial({ color: "#9ba0a4", roughness: 0.45, metalness: 0.3 });
const CANOPY_WHITE = new THREE.MeshStandardMaterial({ color: "#ecebe6", roughness: 0.5, metalness: 0.2 });

const BOX = new THREE.BoxGeometry(1, 1, 1);

const DOORWAYS = [-1.55, -0.52, 0.52, 1.55];
const DOOR_WIDTH = 0.46;
const DOOR_HEIGHT = 0.54;

/** The producer's building: modest, practical, single-storey. */
function ProducerBuilding() {
  const { length: L, depth: D, wallHeight: H, verandahDepth: V } = HALL;
  const plinth = 0.05;
  const rise = 0.4;
  const overhang = 0.1;
  const wallTop = plinth + H;
  const angle = Math.atan(rise / (D / 2));
  const run = D / 2 + overhang;
  const slant = run / Math.cos(angle);
  const ridgeY = wallTop + rise;

  // Verandah lean-to: from just under the eaves down to its posts.
  const verandahTopY = wallTop - 0.06;
  const verandahLowY = 0.56;
  const verandahAngle = Math.atan((verandahTopY - verandahLowY) / V);
  const verandahSlant = (V + 0.08) / Math.cos(verandahAngle);

  const built = useMemo(() => {
    /** Point on the front (local +z) slope, `d` along it from the ridge. */
    const onFrontSlope = (d: number, lift: number): [number, number] => [
      d * Math.cos(angle) + lift * Math.sin(angle),
      ridgeY - d * Math.sin(angle) + lift * Math.cos(angle),
    ];
    const shape = new THREE.Shape();
    shape.moveTo(-D / 2, 0);
    shape.lineTo(D / 2, 0);
    shape.lineTo(0, rise);
    shape.closePath();
    const gable = new THREE.ShapeGeometry(shape);
    gable.rotateY(-Math.PI / 2);

    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();

    // Corrugation ribs down both main slopes and the verandah roof.
    const ribs: THREE.Matrix4[] = [];
    for (const side of [-1, 1]) {
      q.setFromEuler(new THREE.Euler(side * angle, 0, 0));
      for (let x = -L / 2 - 0.1; x <= L / 2 + 0.1; x += 0.07) {
        const y = ridgeY - (run / 2) * Math.tan(angle) + 0.03;
        ribs.push(new THREE.Matrix4().compose(v.set(x, y, (side * run) / 2), q, sc.set(0.012, 0.012, slant)));
      }
    }
    q.setFromEuler(new THREE.Euler(verandahAngle, 0, 0));
    for (let x = -L / 2; x <= L / 2; x += 0.07) {
      ribs.push(
        new THREE.Matrix4().compose(
          v.set(x, (verandahTopY + verandahLowY) / 2 + 0.03, D / 2 + V / 2),
          q,
          sc.set(0.012, 0.012, verandahSlant)
        )
      );
    }

    // Solar panels: three arrays of 4 × 2 panels on the front slope.
    const cells: THREE.Matrix4[] = [];
    const frames: THREE.Matrix4[] = [];
    const panelW = 0.23;
    const panelH = 0.36;
    q.setFromEuler(new THREE.Euler(angle, 0, 0));
    for (const arrayX of [-1.35, 0, 1.35]) {
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 2; row++) {
          const x = arrayX + (col - 1.5) * (panelW + 0.018);
          const [z, y] = onFrontSlope(0.14 + (row + 0.5) * (panelH + 0.02), 0.045);
          frames.push(new THREE.Matrix4().compose(v.set(x, y, z), q, sc.set(panelW + 0.014, 0.018, panelH + 0.014)));
          const [cz, cy] = onFrontSlope(0.14 + (row + 0.5) * (panelH + 0.02), 0.052);
          cells.push(new THREE.Matrix4().compose(v.set(x, cy, cz), q, sc.set(panelW, 0.012, panelH)));
        }
      }
    }

    // Verandah posts.
    const posts: THREE.Matrix4[] = [];
    for (let x = -L / 2 + 0.08; x <= L / 2 - 0.07; x += (L - 0.16) / 6) {
      posts.push(new THREE.Matrix4().compose(v.set(x, plinth + (verandahLowY - plinth) / 2, D / 2 + V - 0.04), new THREE.Quaternion(), sc.set(0.045, verandahLowY - plinth, 0.045)));
    }

    // A glimpse of produce crates on shelves inside each doorway.
    const random = createRandom(7171);
    const produce = { matrices: [] as THREE.Matrix4[], colors: [] as THREE.Color[] };
    const crates: Array<{ x: number; y: number; z: number; yaw: number }> = [];
    for (const dx of DOORWAYS) {
      for (const shelfY of [plinth + 0.02, plinth + 0.27]) {
        for (const ox of [-0.09, 0.09]) {
          const crate = { x: dx + ox, y: shelfY, z: D / 2 - 0.165, yaw: (random() - 0.5) * 0.08 };
          crates.push(crate);
          fillProduce(random, produce, crate.x, crate.y + CRATE.h - 0.008, crate.z, crate.yaw, 3, 2, 0.04, 0.04);
        }
      }
    }
    return { gable, ribs, cells, frames, posts, crates, produce };
  }, [D, L, V, angle, rise, ridgeY, run, slant, verandahAngle, verandahLowY, verandahSlant, verandahTopY]);

  // Front wall: solid piers between the DOORWAYS, a lintel band above them.
  const piers: Array<[number, number]> = [];
  const edges = [-L / 2, ...DOORWAYS.flatMap((x) => [x - DOOR_WIDTH / 2, x + DOOR_WIDTH / 2]), L / 2];
  for (let i = 0; i < edges.length; i += 2) piers.push([edges[i], edges[i + 1]]);

  return (
    <group position={[HALL.x, TERRACE_TOP, HALL.z]} rotation={[0, HALL.rotationY, 0]}>
      {/* Plinth under the building and the verandah floor. */}
      <mesh material={PLINTH} position={[0, plinth / 2 - 0.02, V / 2]} castShadow receiveShadow>
        <boxGeometry args={[L + 0.1, plinth + 0.04, D + V + 0.08]} />
      </mesh>
      {/* Back and side walls. */}
      <mesh material={PLASTER} position={[0, plinth + H / 2, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[L, H, D - 0.24]} />
      </mesh>
      {/* Front wall piers, and the band above the DOORWAYS. */}
      {piers.map(([a, b], i) => (
        <mesh key={i} material={PLASTER} position={[(a + b) / 2, plinth + H / 2, D / 2 - 0.12]} castShadow receiveShadow>
          <boxGeometry args={[b - a, H, 0.24]} />
        </mesh>
      ))}
      {DOORWAYS.map((x) => (
        <group key={x}>
          <mesh material={PLASTER} position={[x, plinth + DOOR_HEIGHT + (H - DOOR_HEIGHT) / 2, D / 2 - 0.12]} castShadow receiveShadow>
            <boxGeometry args={[DOOR_WIDTH, H - DOOR_HEIGHT, 0.24]} />
          </mesh>
          {/* Warm-lit interior, maroon frame. */}
          <mesh material={INTERIOR_GLOW} position={[x, plinth + DOOR_HEIGHT / 2, D / 2 - 0.232]}>
            <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, 0.02]} />
          </mesh>
          <mesh material={INTERIOR} position={[x, plinth + 0.004, D / 2 - 0.12]} receiveShadow>
            <boxGeometry args={[DOOR_WIDTH, 0.008, 0.22]} />
          </mesh>
          <mesh material={SHELF} position={[x, plinth + 0.26, D / 2 - 0.165]} castShadow>
            <boxGeometry args={[DOOR_WIDTH - 0.04, 0.012, 0.12]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} material={FRAME} position={[x + (s * (DOOR_WIDTH + 0.03)) / 2, plinth + DOOR_HEIGHT / 2, D / 2 + 0.005]} castShadow>
              <boxGeometry args={[0.03, DOOR_HEIGHT, 0.03]} />
            </mesh>
          ))}
          <mesh material={FRAME} position={[x, plinth + DOOR_HEIGHT + 0.015, D / 2 + 0.005]} castShadow>
            <boxGeometry args={[DOOR_WIDTH + 0.06, 0.03, 0.03]} />
          </mesh>
        </group>
      ))}
      {built.crates.map((crate, i) => (
        <Crate key={i} {...crate} />
      ))}
      <InstancedBatch geometry={PRODUCE_GEOMETRY} material={PRODUCE} matrices={built.produce.matrices} colors={built.produce.colors} />
      {/* Terracotta base band round the building. */}
      <mesh material={BASE_BAND} position={[0, plinth + 0.04, 0]}>
        <boxGeometry args={[L + 0.012, 0.08, D + 0.012]} />
      </mesh>
      {/* Small windows on the sides and back. */}
      {[
        [L / 2 + 0.006, 0.45, 0.2, Math.PI / 2],
        [-L / 2 - 0.006, 0.45, -0.1, -Math.PI / 2],
        [-1.2, 0.5, -D / 2 - 0.006, Math.PI],
        [1.2, 0.5, -D / 2 - 0.006, Math.PI],
      ].map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
          <mesh material={FRAME}>
            <boxGeometry args={[0.3, 0.24, 0.02]} />
          </mesh>
          <mesh material={INTERIOR} position={[0, 0, 0.004]}>
            <boxGeometry args={[0.24, 0.18, 0.02]} />
          </mesh>
        </group>
      ))}

      {/* Gables and the red corrugated roof. */}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={built.gable} material={GABLE} position={[(side * L) / 2, wallTop, 0]} castShadow />
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          material={ROOF_RED}
          position={[0, ridgeY - (run / 2) * Math.tan(angle) + 0.015, (side * run) / 2]}
          rotation={[side * angle, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[L + 0.24, 0.03, slant]} />
        </mesh>
      ))}
      <mesh material={RIB_RED} position={[0, ridgeY + 0.035, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, L + 0.26, 10]} />
      </mesh>
      {/* Verandah lean-to roof and posts. */}
      <mesh
        material={ROOF_RED}
        position={[0, (verandahTopY + verandahLowY) / 2 + 0.012, D / 2 + V / 2]}
        rotation={[verandahAngle, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[L + 0.1, 0.025, verandahSlant]} />
      </mesh>
      <mesh material={POST} position={[0, verandahLowY - 0.02, D / 2 + V - 0.04]} castShadow>
        <boxGeometry args={[L, 0.04, 0.05]} />
      </mesh>
      <InstancedBatch geometry={BOX} material={POST} matrices={built.posts} />
      <InstancedBatch geometry={BOX} material={RIB_RED} matrices={built.ribs} />

      {/* Solar panels on the front slope — clearly visible from the road. */}
      <InstancedBatch geometry={BOX} material={SOLAR_FRAME} matrices={built.frames} />
      <InstancedBatch geometry={BOX} material={SOLAR_CELL} matrices={built.cells} castShadow={false} />

      {/* Rooftop utilities: a black water tank on its stand, and a vent box. */}
      <group position={[1.75, ridgeY - 0.1, -0.28]}>
        {[
          [-0.12, -0.12],
          [0.12, -0.12],
          [-0.12, 0.12],
          [0.12, 0.12],
        ].map(([sx, sz], i) => (
          <mesh key={i} material={STEEL_DARK} position={[sx, 0.08, sz]} castShadow>
            <boxGeometry args={[0.02, 0.22, 0.02]} />
          </mesh>
        ))}
        <mesh material={STEEL_DARK} position={[0, 0.19, 0]} castShadow>
          <boxGeometry args={[0.3, 0.02, 0.3]} />
        </mesh>
        <mesh material={TANK} position={[0, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.24, 20]} />
        </mesh>
        <mesh material={TANK} position={[0, 0.455, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.11, 0.04, 20]} />
        </mesh>
      </group>
      <mesh material={PLASTER} position={[-1.9, ridgeY + 0.06, -0.12]} castShadow>
        <boxGeometry args={[0.16, 0.2, 0.16]} />
      </mesh>
      <mesh material={STEEL} position={[-1.9, ridgeY + 0.17, -0.12]} castShadow>
        <boxGeometry args={[0.2, 0.02, 0.2]} />
      </mesh>
    </group>
  );
}

/** An open-sided canopy: slim posts carrying a single-pitch metal roof. */
function Canopy({
  spec,
  roof,
}: {
  spec: { x: number; z: number; rotationY: number; length: number; depth: number; height: number };
  roof: THREE.Material;
}) {
  const { length: L, depth: D, height: H } = spec;
  const pitch = 0.09;
  return (
    <group position={[spec.x, TERRACE_TOP, spec.z]} rotation={[0, spec.rotationY, 0]}>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            material={STEEL_DARK}
            position={[(sx * (L - 0.1)) / 2, (H + (sz < 0 ? D * pitch : 0)) / 2, (sz * (D - 0.1)) / 2]}
            castShadow
          >
            <boxGeometry args={[0.035, H + (sz < 0 ? D * pitch : 0), 0.035]} />
          </mesh>
        ))
      )}
      <mesh material={roof} position={[0, H + (D * pitch) / 2 + 0.01, 0]} rotation={[-pitch, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[L + 0.12, 0.025, D + 0.14]} />
      </mesh>
    </group>
  );
}

/** Two steel grain silos with a ladder. */
function Silos() {
  const radius = 0.32;
  const height = 1.35;
  const legs = 0.2;
  return (
    <group>
      {SILOS.map(([x, z], i) => (
        <group key={i} position={[x, TERRACE_TOP, z]}>
          {[0, 1, 2, 3].map((k) => (
            <mesh
              key={k}
              material={STEEL_DARK}
              position={[Math.cos((k * Math.PI) / 2 + 0.78) * radius * 0.8, legs / 2, Math.sin((k * Math.PI) / 2 + 0.78) * radius * 0.8]}
              castShadow
            >
              <boxGeometry args={[0.03, legs, 0.03]} />
            </mesh>
          ))}
          <mesh material={STEEL} position={[0, legs + 0.05, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[radius, 0.12, 28]} />
          </mesh>
          <mesh material={STEEL} position={[0, legs + 0.11 + height / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[radius, radius, height, 32]} />
          </mesh>
          {[0.35, 0.7, 1.05].map((h) => (
            <mesh key={h} material={STEEL_DARK} position={[0, legs + 0.11 + h, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius + 0.004, 0.008, 6, 36]} />
            </mesh>
          ))}
          <mesh material={STEEL} position={[0, legs + 0.11 + height + 0.1, 0]} castShadow>
            <coneGeometry args={[radius + 0.02, 0.2, 32]} />
          </mesh>
          {i === 0 && (
            <group position={[-radius - 0.02, 0, 0]}>
              {[-0.05, 0.05].map((dz) => (
                <mesh key={dz} material={STEEL_DARK} position={[0, (legs + height) / 2 + 0.1, dz]}>
                  <boxGeometry args={[0.014, legs + height + 0.2, 0.014]} />
                </mesh>
              ))}
              {Array.from({ length: 12 }, (_, k) => (
                <mesh key={k} material={STEEL_DARK} position={[0, 0.15 + k * 0.12, 0]}>
                  <boxGeometry args={[0.01, 0.008, 0.1]} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

/** The local producer's facility: building with verandah, loading canopy, store and silos. */
export function FacilityBuildings() {
  return (
    <group>
      <ProducerBuilding />
      <Canopy spec={LOADING_CANOPY} roof={CANOPY_WHITE} />
      <Canopy spec={RED_CANOPY} roof={ROOF_RED} />
      <Silos />
    </group>
  );
}
