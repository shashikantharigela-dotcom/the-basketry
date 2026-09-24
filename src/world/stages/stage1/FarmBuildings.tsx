import { useMemo } from "react";
import * as THREE from "three";
import { groundY } from "../common/placement";
import { FARM_BUILDING, SILO, TOOL_SHED } from "./stage1Layout";

// Warm, natural materials with a single brand-red accent on the roofs.
const WALL = new THREE.MeshStandardMaterial({ color: "#f3ead9", roughness: 0.85, metalness: 0 });
const GABLE = new THREE.MeshStandardMaterial({ color: "#f3ead9", roughness: 0.85, metalness: 0, side: THREE.DoubleSide });
const ROOF = new THREE.MeshStandardMaterial({ color: "#c9171e", roughness: 0.55, metalness: 0.05 });
const TIMBER = new THREE.MeshStandardMaterial({ color: "#7b563a", roughness: 0.8, metalness: 0 });
const DOOR = new THREE.MeshStandardMaterial({ color: "#9a6b43", roughness: 0.75, metalness: 0 });
const STONE = new THREE.MeshStandardMaterial({ color: "#d8cab0", roughness: 0.95, metalness: 0 });
const GLASS = new THREE.MeshStandardMaterial({ color: "#3a3431", roughness: 0.15, metalness: 0.3 });
const SILO_BODY = new THREE.MeshStandardMaterial({ color: "#e7dfcf", roughness: 0.5, metalness: 0.25 });
const SHED_WALL = new THREE.MeshStandardMaterial({ color: "#b58659", roughness: 0.85, metalness: 0 });

// Workshop proportions (≈10 m x 7 m, 3.6 m eaves) at the world's 0.22 units / meter.
const W = 2.2;
const D = 1.5;
const PLINTH = 0.06;
const WALL_H = 0.8;
const RIDGE_RISE = 0.5;
const OVERHANG = 0.12;

function Window({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh material={TIMBER} castShadow>
        <boxGeometry args={[0.27, 0.23, 0.02]} />
      </mesh>
      <mesh material={GLASS} position={[0, 0, 0.008]}>
        <boxGeometry args={[0.22, 0.18, 0.012]} />
      </mesh>
      <mesh material={TIMBER} position={[0, 0, 0.016]}>
        <boxGeometry args={[0.018, 0.18, 0.006]} />
      </mesh>
      <mesh material={TIMBER} position={[0, -0.135, 0.02]} castShadow>
        <boxGeometry args={[0.3, 0.025, 0.05]} />
      </mesh>
    </group>
  );
}

/** The producer's workshop: plinth, cream walls, timber corners, a
 * brand-red gabled roof, barn door, windows and a chimney. */
function Workshop() {
  const { gable, slope, panelLength, panelY, run } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-D / 2, 0);
    shape.lineTo(D / 2, 0);
    shape.lineTo(0, RIDGE_RISE);
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateY(-Math.PI / 2);
    const angle = Math.atan(RIDGE_RISE / (D / 2));
    const r = D / 2 + OVERHANG;
    const length = r / Math.cos(angle);
    return {
      gable: geometry,
      slope: angle,
      run: r,
      panelLength: length,
      panelY: PLINTH + WALL_H + RIDGE_RISE - (r / 2) * Math.tan(angle) + 0.03,
    };
  }, []);

  const wallTop = PLINTH + WALL_H;
  const doorH = 0.58;
  const doorW = 0.56;
  const brace = Math.atan2(doorH, doorW);

  return (
    <group
      position={[FARM_BUILDING.x, groundY(FARM_BUILDING.x, FARM_BUILDING.z), FARM_BUILDING.z]}
      rotation={[0, FARM_BUILDING.rotationY, 0]}
    >
      <mesh material={STONE} position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 0.1, 0.16, D + 0.1]} />
      </mesh>
      <mesh material={WALL} position={[0, PLINTH + WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, WALL_H, D]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={gable} material={GABLE} position={[(side * W) / 2, wallTop, 0]} castShadow />
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          material={ROOF}
          position={[0, panelY, (side * run) / 2]}
          rotation={[side * slope, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[W + 0.26, 0.05, panelLength]} />
        </mesh>
      ))}
      <mesh material={ROOF} position={[0, wallTop + RIDGE_RISE + 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, W + 0.28, 10]} />
      </mesh>
      {[
        [-W / 2, -D / 2],
        [W / 2, -D / 2],
        [-W / 2, D / 2],
        [W / 2, D / 2],
      ].map(([cx, cz], i) => (
        <mesh key={i} material={TIMBER} position={[cx, PLINTH + WALL_H / 2, cz]} castShadow>
          <boxGeometry args={[0.06, WALL_H, 0.06]} />
        </mesh>
      ))}
      {/* Barn door with an X-brace, facing the lane. */}
      <group position={[0, PLINTH + doorH / 2, D / 2 + 0.015]}>
        <mesh material={DOOR} castShadow>
          <boxGeometry args={[doorW, doorH, 0.03]} />
        </mesh>
        {[brace, -brace].map((r, i) => (
          <mesh key={i} material={WALL} position={[0, 0, 0.018]} rotation={[0, 0, r]}>
            <boxGeometry args={[Math.hypot(doorW, doorH) - 0.06, 0.03, 0.008]} />
          </mesh>
        ))}
        <mesh material={TIMBER} position={[0, doorH / 2 + 0.03, 0.01]} castShadow>
          <boxGeometry args={[doorW + 0.12, 0.05, 0.05]} />
        </mesh>
      </group>
      {/* A plain red board over the door — the producer's sign, no text. */}
      <mesh material={ROOF} position={[0, PLINTH + doorH + 0.14, D / 2 + 0.012]} castShadow>
        <boxGeometry args={[0.52, 0.1, 0.02]} />
      </mesh>
      <Window position={[-0.72, PLINTH + 0.46, D / 2 + 0.01]} />
      <Window position={[0.72, PLINTH + 0.46, D / 2 + 0.01]} />
      <Window position={[-0.55, PLINTH + 0.46, -D / 2 - 0.01]} rotationY={Math.PI} />
      <Window position={[0.55, PLINTH + 0.46, -D / 2 - 0.01]} rotationY={Math.PI} />
      <Window position={[W / 2 + 0.01, PLINTH + 0.46, 0]} rotationY={Math.PI / 2} />
      <mesh material={STONE} position={[0.62, wallTop + RIDGE_RISE * 0.7, -0.28]} castShadow>
        <boxGeometry args={[0.13, 0.42, 0.13]} />
      </mesh>
    </group>
  );
}

function Silo() {
  const y = groundY(SILO.x, SILO.z);
  const height = 1.4;
  const radius = 0.3;
  return (
    <group position={[SILO.x, y, SILO.z]}>
      <mesh material={STONE} position={[0, 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius + 0.06, radius + 0.08, 0.12, 24]} />
      </mesh>
      <mesh material={SILO_BODY} position={[0, height / 2 + 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 28]} />
      </mesh>
      {[0.35, 0.75, 1.15].map((h) => (
        <mesh key={h} material={TIMBER} position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius + 0.004, 0.008, 6, 32]} />
        </mesh>
      ))}
      <mesh material={ROOF} position={[0, height + 0.06, 0]} castShadow>
        <sphereGeometry args={[radius + 0.02, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
}

function ToolShed() {
  const y = groundY(TOOL_SHED.x, TOOL_SHED.z);
  return (
    <group position={[TOOL_SHED.x, y, TOOL_SHED.z]} rotation={[0, TOOL_SHED.rotationY, 0]}>
      <mesh material={STONE} position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[0.78, 0.1, 0.62]} />
      </mesh>
      <mesh material={SHED_WALL} position={[0, 0.27, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.46, 0.54]} />
      </mesh>
      <mesh material={ROOF} position={[0, 0.54, 0]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.84, 0.04, 0.7]} />
      </mesh>
      <mesh material={TIMBER} position={[0.12, 0.22, 0.275]} castShadow>
        <boxGeometry args={[0.2, 0.34, 0.02]} />
      </mesh>
    </group>
  );
}

/** The producer's buildings, set level on the yard pad inside the bend. */
export function FarmBuildings() {
  return (
    <group>
      <Workshop />
      <Silo />
      <ToolShed />
    </group>
  );
}
