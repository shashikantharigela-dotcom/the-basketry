import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { Crate } from "../common/HarvestKit";
import { CRATE, PRODUCE, PRODUCE_GEOMETRY, fillProduce } from "../common/harvest";
import { createRandom } from "../common/placement";
import { HALL, LOADING_CANOPY, RED_CANOPY, SILOS } from "./stage2Layout";
import { TERRACE_TOP } from "./stage2Geometry";

// Cream walls and a brand-red standing-seam metal roof (the reference's
// signature), galvanised steel for the silos and the loading canopy.
const WALL = new THREE.MeshStandardMaterial({ color: "#f1e8d6", roughness: 0.8, metalness: 0 });
const GABLE = new THREE.MeshStandardMaterial({ color: "#f1e8d6", roughness: 0.8, metalness: 0, side: THREE.DoubleSide });
const PLINTH = new THREE.MeshStandardMaterial({ color: "#d9cbb0", roughness: 0.95, metalness: 0 });
const ROOF_RED = new THREE.MeshStandardMaterial({ color: "#c41a1f", roughness: 0.45, metalness: 0.25 });
const SEAM_RED = new THREE.MeshStandardMaterial({ color: "#a8141a", roughness: 0.4, metalness: 0.3 });
const FRAME = new THREE.MeshStandardMaterial({ color: "#6d5a48", roughness: 0.6, metalness: 0.2 });
const GLASS = new THREE.MeshStandardMaterial({
  color: "#6f6a64",
  roughness: 0.08,
  metalness: 0.2,
  transparent: true,
  opacity: 0.35,
});
const SKYLIGHT = new THREE.MeshStandardMaterial({ color: "#c9d3d6", roughness: 0.15, metalness: 0.25 });
const INTERIOR = new THREE.MeshStandardMaterial({ color: "#8a6a4c", roughness: 0.9, metalness: 0 });
const INTERIOR_GLOW = new THREE.MeshStandardMaterial({
  color: "#f3d7a6",
  emissive: "#f0b86a",
  emissiveIntensity: 0.35,
  roughness: 0.8,
  metalness: 0,
});
const STEEL = new THREE.MeshStandardMaterial({ color: "#d9dcdf", roughness: 0.38, metalness: 0.3 });
const STEEL_DARK = new THREE.MeshStandardMaterial({ color: "#9ba0a4", roughness: 0.45, metalness: 0.3 });
const CANOPY_GREY = new THREE.MeshStandardMaterial({ color: "#a3a4a0", roughness: 0.5, metalness: 0.25 });
const SHELF = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });

const SEAM_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);

/** Gabled roof pitch geometry shared by the panels, seams and skylights. */
function roofFrame(depth: number, rise: number, overhang: number) {
  const angle = Math.atan(rise / (depth / 2));
  const run = depth / 2 + overhang;
  return { angle, run, slant: run / Math.cos(angle) };
}

/** The long processing and packing hall — the facility's heart. */
function ProcessingHall() {
  const { length: L, depth: D, wallHeight: H } = HALL;
  const plinth = 0.05;
  const rise = 0.42;
  const overhang = 0.12;
  const wallTop = plinth + H;
  const { angle, run, slant } = roofFrame(D, rise, overhang);

  const { gable, seams, interior } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-D / 2, 0);
    shape.lineTo(D / 2, 0);
    shape.lineTo(0, rise);
    shape.closePath();
    const gableGeometry = new THREE.ShapeGeometry(shape);
    gableGeometry.rotateY(-Math.PI / 2);

    // Standing seams: thin ribs running down each roof slope.
    const seamMatrices: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    for (const side of [-1, 1]) {
      q.setFromEuler(new THREE.Euler(side * angle, 0, 0));
      for (let x = -L / 2 - 0.08; x <= L / 2 + 0.08; x += 0.11) {
        const centerZ = (side * run) / 2;
        const centerY = wallTop + rise - (run / 2) * Math.tan(angle) + 0.035;
        seamMatrices.push(
          new THREE.Matrix4().compose(new THREE.Vector3(x, centerY, centerZ), q, new THREE.Vector3(0.012, 0.018, slant))
        );
      }
    }

    // A glimpse of produce crates on shelves inside the open bay.
    const random = createRandom(7070);
    const produce = { matrices: [] as THREE.Matrix4[], colors: [] as THREE.Color[] };
    const crates = [] as Array<{ x: number; y: number; z: number; yaw: number }>;
    for (const shelfY of [plinth + 0.02, plinth + 0.3]) {
      for (const cx of [-0.18, 0, 0.18]) {
        const crate = { x: cx, y: shelfY, z: 0, yaw: (random() - 0.5) * 0.1 };
        crates.push(crate);
        fillProduce(random, produce, crate.x, crate.y + CRATE.h - 0.008, crate.z, crate.yaw, 3, 2, 0.04, 0.04);
      }
    }
    return { gable: gableGeometry, seams: seamMatrices, interior: { crates, produce } };
  }, [D, L, angle, rise, run, slant, wallTop]);

  // Front (+z local, facing the yard): a long storefront of glass on the
  // left, an open bay showing produce inside, and a door.
  const bayX = 0.95;
  const bayWidth = 0.78;
  const bayHeight = 0.62;

  return (
    <group position={[HALL.x, TERRACE_TOP, HALL.z]} rotation={[0, HALL.rotationY, 0]}>
      <mesh material={PLINTH} position={[0, plinth / 2 - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[L + 0.08, plinth + 0.04, D + 0.08]} />
      </mesh>
      {/* Walls, with the open bay cut as a recess on the front. */}
      <mesh material={WALL} position={[(-L / 2 + bayX - bayWidth / 2) / 2, plinth + H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bayX - bayWidth / 2 + L / 2, H, D]} />
      </mesh>
      <mesh material={WALL} position={[L / 2 - (L / 2 - bayX - bayWidth / 2) / 2, plinth + H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[L / 2 - bayX - bayWidth / 2, H, D]} />
      </mesh>
      <mesh material={WALL} position={[bayX, plinth + bayHeight + (H - bayHeight) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bayWidth, H - bayHeight, D]} />
      </mesh>
      <mesh material={WALL} position={[bayX, plinth + bayHeight / 2, -D / 4]} castShadow receiveShadow>
        <boxGeometry args={[bayWidth, bayHeight, D / 2]} />
      </mesh>
      {/* Warm-lit interior of the open bay, with shelves of crates. */}
      <group position={[bayX, 0, 0.14]}>
        <mesh material={INTERIOR_GLOW} position={[0, plinth + bayHeight / 2, -0.12]}>
          <boxGeometry args={[bayWidth - 0.02, bayHeight, 0.02]} />
        </mesh>
        <mesh material={INTERIOR} position={[0, plinth + 0.005, 0.1]} receiveShadow>
          <boxGeometry args={[bayWidth - 0.02, 0.01, D / 2 - 0.02]} />
        </mesh>
        <mesh material={SHELF} position={[0, plinth + 0.29, -0.05]} castShadow>
          <boxGeometry args={[0.62, 0.015, 0.14]} />
        </mesh>
        <group position={[0, 0, -0.05]}>
          {interior.crates.map((crate, i) => (
            <Crate key={i} {...crate} />
          ))}
          <InstancedBatch
            geometry={PRODUCE_GEOMETRY}
            material={PRODUCE}
            matrices={interior.produce.matrices}
            colors={interior.produce.colors}
          />
        </group>
      </group>
      <mesh material={FRAME} position={[bayX, plinth + bayHeight + 0.02, D / 2 + 0.01]} castShadow>
        <boxGeometry args={[bayWidth + 0.06, 0.04, 0.03]} />
      </mesh>

      {/* Storefront glazing along the front's left half. */}
      {[-1.65, -1.05, -0.45, 0.15].map((x) => (
        <group key={x} position={[x, plinth + 0.36, D / 2 + 0.008]}>
          <mesh material={FRAME}>
            <boxGeometry args={[0.52, 0.56, 0.015]} />
          </mesh>
          {/* Warm-lit interior seen through tinted glass. */}
          <mesh material={INTERIOR_GLOW} position={[0, 0, 0.009]}>
            <boxGeometry args={[0.47, 0.51, 0.004]} />
          </mesh>
          <mesh material={INTERIOR} position={[0, -0.13, 0.012]}>
            <boxGeometry args={[0.47, 0.18, 0.004]} />
          </mesh>
          <mesh material={GLASS} position={[0, 0, 0.016]}>
            <boxGeometry args={[0.47, 0.51, 0.004]} />
          </mesh>
          <mesh material={FRAME} position={[0, 0, 0.02]}>
            <boxGeometry args={[0.015, 0.51, 0.006]} />
          </mesh>
        </group>
      ))}
      {/* Rear windows. */}
      {[-1.3, 0, 1.3].map((x) => (
        <group key={x} position={[x, plinth + 0.5, -D / 2 - 0.008]} rotation={[0, Math.PI, 0]}>
          <mesh material={FRAME}>
            <boxGeometry args={[0.4, 0.26, 0.015]} />
          </mesh>
          <mesh material={GLASS} position={[0, 0, 0.006]}>
            <boxGeometry args={[0.36, 0.22, 0.01]} />
          </mesh>
        </group>
      ))}
      {/* Side door on the north gable. */}
      <mesh material={FRAME} position={[L / 2 + 0.008, plinth + 0.26, 0.2]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.26, 0.52, 0.02]} />
      </mesh>

      {/* Gables and the red standing-seam roof. */}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={gable} material={GABLE} position={[(side * L) / 2, wallTop, 0]} castShadow />
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          material={ROOF_RED}
          position={[0, wallTop + rise - (run / 2) * Math.tan(angle) + 0.02, (side * run) / 2]}
          rotation={[side * angle, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[L + 0.28, 0.04, slant]} />
        </mesh>
      ))}
      <InstancedBatch geometry={SEAM_GEOMETRY} material={SEAM_RED} matrices={seams} />
      <mesh material={SEAM_RED} position={[0, wallTop + rise + 0.045, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, L + 0.3, 10]} />
      </mesh>
      {/* Skylights on the yard-facing slope. */}
      {[-1.4, -0.6, 0.2, 1.0].map((x) => (
        <group
          key={x}
          position={[x, wallTop + rise - (run * 0.45) * Math.tan(angle) + 0.065, run * 0.45]}
          rotation={[angle, 0, 0]}
        >
          <mesh material={STEEL_DARK} castShadow>
            <boxGeometry args={[0.4, 0.03, 0.3]} />
          </mesh>
          <mesh material={SKYLIGHT} position={[0, 0.012, 0]}>
            <boxGeometry args={[0.35, 0.02, 0.25]} />
          </mesh>
        </group>
      ))}
      {/* Rooftop vent on the ridge. */}
      <group position={[1.35, wallTop + rise, -0.18]}>
        <mesh material={STEEL} position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.28, 16]} />
        </mesh>
        <mesh material={STEEL} position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.04, 16]} />
        </mesh>
        <mesh material={STEEL_DARK} position={[0, 0.34, 0]} castShadow>
          <coneGeometry args={[0.12, 0.06, 16]} />
        </mesh>
      </group>
    </group>
  );
}

/** An open-sided canopy: steel posts carrying a single-pitch metal roof. */
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
      <mesh material={STEEL_DARK} position={[0, H + (D * pitch) / 2 - 0.02, 0]} rotation={[-pitch, 0, 0]} castShadow>
        <boxGeometry args={[L - 0.05, 0.03, D]} />
      </mesh>
      <mesh material={roof} position={[0, H + (D * pitch) / 2 + 0.01, 0]} rotation={[-pitch, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[L + 0.12, 0.025, D + 0.14]} />
      </mesh>
    </group>
  );
}

/** Twin galvanised silos on a shared base, with a ladder gantry. */
function Silos() {
  const radius = 0.34;
  const height = 1.45;
  const legs = 0.22;
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
          {[0.35, 0.7, 1.05, 1.4].map((h) => (
            <mesh key={h} material={STEEL_DARK} position={[0, legs + 0.11 + h, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius + 0.004, 0.008, 6, 36]} />
            </mesh>
          ))}
          <mesh material={STEEL} position={[0, legs + 0.11 + height + 0.1, 0]} castShadow>
            <coneGeometry args={[radius + 0.02, 0.2, 32]} />
          </mesh>
        </group>
      ))}
      {/* Ladder gantry between the silos: two uprights, a walkway and rungs. */}
      {(() => {
        const [ax, az] = SILOS[0];
        const [bx, bz] = SILOS[1];
        const mx = (ax + bx) / 2 - 0.32;
        const mz = (az + bz) / 2;
        const top = legs + 0.11 + height + 0.05;
        return (
          <group position={[mx, TERRACE_TOP, mz]}>
            {[-0.08, 0.08].map((dz) => (
              <mesh key={dz} material={STEEL_DARK} position={[0, top / 2, dz]} castShadow>
                <boxGeometry args={[0.018, top, 0.018]} />
              </mesh>
            ))}
            {Array.from({ length: 14 }, (_, k) => (
              <mesh key={k} material={STEEL_DARK} position={[0, 0.12 + k * 0.12, 0]}>
                <boxGeometry args={[0.012, 0.01, 0.16]} />
              </mesh>
            ))}
            <mesh material={STEEL_DARK} position={[0.3, top, 0]} castShadow>
              <boxGeometry args={[0.62, 0.02, 0.2]} />
            </mesh>
            <mesh material={STEEL_DARK} position={[0.3, top + 0.08, -0.1]}>
              <boxGeometry args={[0.62, 0.012, 0.012]} />
            </mesh>
          </group>
        );
      })()}
    </group>
  );
}

/** The producer's processing facility: hall, loading canopy, red canopy and silos. */
export function FacilityBuildings() {
  return (
    <group>
      <ProcessingHall />
      <Canopy spec={LOADING_CANOPY} roof={CANOPY_GREY} />
      <Canopy spec={RED_CANOPY} roof={ROOF_RED} />
      <Silos />
    </group>
  );
}
