import * as THREE from "three";
import { groundY } from "../common/placement";
import { FIGURES } from "./stage1Layout";

// Stylized, faceless miniature figures (~1.8 m tall at 0.22 units / meter) —
// scale reference and a quiet sign of the people behind the products.
const SKIN = new THREE.MeshStandardMaterial({ color: "#d9a882", roughness: 0.7, metalness: 0 });
const TROUSERS = new THREE.MeshStandardMaterial({ color: "#5b4a3b", roughness: 0.85, metalness: 0 });
const STRAW = new THREE.MeshStandardMaterial({ color: "#e4c67e", roughness: 0.85, metalness: 0 });
const WOOD = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });
const WICKER = new THREE.MeshStandardMaterial({ color: "#c99a5c", roughness: 0.9, metalness: 0 });
const PRODUCE = new THREE.MeshStandardMaterial({ color: "#d42a1f", roughness: 0.4, metalness: 0 });

const shirtMaterials = new Map<string, THREE.MeshStandardMaterial>();
function shirtMaterial(color: string): THREE.MeshStandardMaterial {
  let material = shirtMaterials.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0 });
    shirtMaterials.set(color, material);
  }
  return material;
}

type Pose = (typeof FIGURES)[number]["pose"];

function Figure({ x, z, yaw, pose, shirt }: { x: number; z: number; yaw: number; pose: Pose; shirt: string }) {
  const body = shirtMaterial(shirt);
  // Arms: forward for carrying, one lowered holding a basket, or relaxed.
  const armPitch = pose === "carry" ? -1.15 : 0.08;
  const leftArmPitch = pose === "basket" ? 0.05 : armPitch;
  const rightArmPitch = pose === "basket" ? -0.35 : armPitch;

  return (
    <group position={[x, groundY(x, z) - 0.005, z]} rotation={[0, yaw, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} material={TROUSERS} position={[s * 0.021, 0.085, 0]} castShadow>
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
      <mesh material={STRAW} position={[0, 0.362, 0]} castShadow>
        <cylinderGeometry args={[0.058, 0.058, 0.005, 20]} />
      </mesh>
      <mesh material={STRAW} position={[0, 0.378, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.031, 0.03, 16]} />
      </mesh>

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

/** A handful of producers at work around the yard — supporting cast, never the focus. */
export function Figures() {
  return (
    <group>
      {FIGURES.map((figure, i) => (
        <Figure key={i} {...figure} />
      ))}
    </group>
  );
}
