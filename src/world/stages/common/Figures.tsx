import * as THREE from "three";
import { groundY } from "./placement";

// Shared across stages.
// Stylized, faceless miniature figures (~1.8 m tall at 0.22 units / meter) —
// scale reference and a quiet sign of the people behind the products.
const SKIN = new THREE.MeshStandardMaterial({ color: "#d9a882", roughness: 0.7, metalness: 0 });
const DEFAULT_TROUSERS = new THREE.MeshStandardMaterial({ color: "#5b4a3b", roughness: 0.85, metalness: 0 });
const STRAW = new THREE.MeshStandardMaterial({ color: "#e4c67e", roughness: 0.85, metalness: 0 });
const WOOD = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });
const WICKER = new THREE.MeshStandardMaterial({ color: "#c99a5c", roughness: 0.9, metalness: 0 });
const PRODUCE = new THREE.MeshStandardMaterial({ color: "#d42a1f", roughness: 0.4, metalness: 0 });
const CLIPBOARD = new THREE.MeshStandardMaterial({ color: "#f4efe4", roughness: 0.6, metalness: 0 });
const CARTON = new THREE.MeshStandardMaterial({ color: "#c79b62", roughness: 0.85, metalness: 0 });
const TAPE = new THREE.MeshStandardMaterial({ color: "#c8161d", roughness: 0.6, metalness: 0 });

const shirtMaterials = new Map<string, THREE.MeshStandardMaterial>();
function shirtMaterial(color: string): THREE.MeshStandardMaterial {
  let material = shirtMaterials.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0 });
    shirtMaterials.set(color, material);
  }
  return material;
}

export type FigurePose = "carry" | "basket" | "stand" | "inspect" | "present" | "clipboard" | "carton";

export interface FigureSpec {
  x: number;
  z: number;
  /** Facing (radians about +Y); the figure faces its local +Z. */
  yaw: number;
  pose: FigurePose;
  shirt: string;
  hat?: "straw" | "cap" | "none";
  hatColor?: string;
  trousers?: string;
}

/** Arm pitch (left, right) per pose: forward to carry, one lowered with a
 * basket, forearms raised to inspect a product, one arm extended to
 * present, a clipboard held at the chest, or relaxed. */
const ARM_PITCH: Record<FigurePose, [number, number]> = {
  carry: [-1.15, -1.15],
  basket: [0.05, -0.35],
  stand: [0.08, 0.08],
  inspect: [-0.95, -0.95],
  present: [0.08, -1.25],
  clipboard: [-0.85, -0.2],
  carton: [-1.0, -1.0],
};

export function Figure({
  x,
  z,
  yaw,
  pose,
  shirt,
  hat = "straw",
  hatColor,
  trousers,
  surfaceY = groundY,
}: FigureSpec & { surfaceY?: (x: number, z: number) => number }) {
  const body = shirtMaterial(shirt);
  const legs = trousers ? shirtMaterial(trousers) : DEFAULT_TROUSERS;
  const hatMaterial = hatColor ? shirtMaterial(hatColor) : STRAW;
  const [leftArmPitch, rightArmPitch] = ARM_PITCH[pose];

  return (
    <group position={[x, surfaceY(x, z) - 0.005, z]} rotation={[0, yaw, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} material={legs} position={[s * 0.021, 0.085, 0]} castShadow>
          <capsuleGeometry args={[0.017, 0.14, 4, 8]} />
        </mesh>
      ))}
      <mesh material={body} position={[0, 0.235, 0]} castShadow>
        <capsuleGeometry args={[0.042, 0.075, 6, 12]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group
          key={s}
          position={[s * 0.056, 0.285, 0]}
          rotation={[s < 0 ? leftArmPitch : rightArmPitch, 0, s * 0.12]}
        >
          <mesh material={body} position={[0, -0.05, 0]} castShadow>
            <capsuleGeometry args={[0.013, 0.08, 4, 8]} />
          </mesh>
          <mesh material={SKIN} position={[0, -0.105, 0]} castShadow>
            <sphereGeometry args={[0.013, 8, 6]} />
          </mesh>
        </group>
      ))}
      <mesh material={SKIN} position={[0, 0.34, 0]} castShadow>
        <sphereGeometry args={[0.031, 14, 10]} />
      </mesh>
      {hat === "straw" && (
        <>
          <mesh material={hatMaterial} position={[0, 0.362, 0]} castShadow>
            <cylinderGeometry args={[0.058, 0.058, 0.005, 20]} />
          </mesh>
          <mesh material={hatMaterial} position={[0, 0.378, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.031, 0.03, 16]} />
          </mesh>
        </>
      )}
      {hat === "cap" && (
        <>
          <mesh material={hatMaterial} position={[0, 0.352, 0]} castShadow>
            <sphereGeometry args={[0.032, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={hatMaterial} position={[0, 0.352, 0.03]} castShadow>
            <boxGeometry args={[0.04, 0.004, 0.03]} />
          </mesh>
        </>
      )}

      {pose === "carry" && (
        <group position={[0, 0.215, 0.1]}>
          <mesh material={WOOD} castShadow>
            <boxGeometry args={[0.12, 0.06, 0.09]} />
          </mesh>
          {[-0.035, 0, 0.035].map((ox) => (
            <mesh key={ox} material={PRODUCE} position={[ox, 0.035, 0]} castShadow>
              <sphereGeometry args={[0.018, 8, 6]} />
            </mesh>
          ))}
        </group>
      )}
      {pose === "carton" && (
        // A cardboard product carton held in front, taped across the top.
        <group position={[0, 0.235, 0.1]}>
          <mesh material={CARTON} castShadow>
            <boxGeometry args={[0.11, 0.085, 0.09]} />
          </mesh>
          <mesh material={TAPE} position={[0, 0.0435, 0]}>
            <boxGeometry args={[0.112, 0.003, 0.022]} />
          </mesh>
        </group>
      )}
      {pose === "inspect" && (
        // Turning a sample over in both hands.
        <mesh material={PRODUCE} position={[0, 0.2, 0.1]} castShadow>
          <sphereGeometry args={[0.02, 8, 6]} />
        </mesh>
      )}
      {pose === "clipboard" && (
        <mesh material={CLIPBOARD} position={[-0.03, 0.23, 0.075]} rotation={[-0.5, 0.3, 0]} castShadow>
          <boxGeometry args={[0.055, 0.075, 0.006]} />
        </mesh>
      )}
      {pose === "basket" && (
        <group position={[0.07, 0.15, 0.04]}>
          <mesh material={WICKER} castShadow>
            <cylinderGeometry args={[0.04, 0.03, 0.045, 14]} />
          </mesh>
          <mesh material={PRODUCE} position={[0, 0.026, 0]} castShadow>
            <sphereGeometry args={[0.022, 8, 6]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** A group of figures — supporting cast, never the focus. */
export function Figures({
  figures,
  surfaceY,
}: {
  figures: FigureSpec[];
  surfaceY?: (x: number, z: number) => number;
}) {
  return (
    <group>
      {figures.map((figure, i) => (
        <Figure key={i} {...figure} surfaceY={surfaceY} />
      ))}
    </group>
  );
}
