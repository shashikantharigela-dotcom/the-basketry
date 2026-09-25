import { useMemo } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import fontData from "../../../assets/fonts/droid_sans_bold_signage.typeface.json?raw";
import { BUILDING_FRAMES, plazaY } from "./stage6Geometry";
import { SIGNS, type SignSpec } from "./stage6Layout";

/**
 * Physical 3D architectural signage for the destination: extruded cream
 * letters (Droid Sans Bold, bundled — see src/assets/fonts/NOTICE.txt)
 * standing proud of a dark sign fascia with a slim THE BASKETRY red accent
 * bar, mounted on the façades that face the final reveal camera. Real
 * geometry in the scene — no HTML, no overlay.
 */

const FONT = new FontLoader().parse(JSON.parse(fontData));

const LETTER = new THREE.MeshStandardMaterial({ color: "#fbf4e6", roughness: 0.35, metalness: 0.1, emissive: "#fff0d2", emissiveIntensity: 0.28 });
const FASCIA = new THREE.MeshStandardMaterial({ color: "#2e2b29", roughness: 0.55, metalness: 0.25 });
const ACCENT = new THREE.MeshStandardMaterial({ color: "#d0161e", roughness: 0.45, metalness: 0.1 });
const BRACKET = new THREE.MeshStandardMaterial({ color: "#8a8f93", roughness: 0.4, metalness: 0.6 });
const BACK = new THREE.MeshStandardMaterial({ color: "#efe8dc", roughness: 0.7, metalness: 0 });

const LINE_GAP = 1.28;

interface BuiltSign {
  spec: SignSpec;
  geometries: THREE.BufferGeometry[];
  /** Per-line vertical centre (sign-local). */
  lineY: number[];
  width: number;
  height: number;
  y: number;
}

function buildSign(spec: SignSpec): BuiltSign {
  // Measure each line at unit size, then fit the widest into the width.
  const unit = spec.lines.map((line) => {
    const g = new TextGeometry(line, { font: FONT, size: 1, depth: 0.1, curveSegments: 3 });
    g.computeBoundingBox();
    const w = g.boundingBox!.max.x - g.boundingBox!.min.x;
    g.dispose();
    return w;
  });
  const size = Math.min(spec.size, spec.width / Math.max(...unit));
  const depth = size * 0.12;
  const geometries = spec.lines.map((line) => {
    const g = new TextGeometry(line, { font: FONT, size, depth, curveSegments: 4 });
    g.computeBoundingBox();
    const b = g.boundingBox!;
    // Centre each line on its own cap height.
    g.translate(-(b.min.x + b.max.x) / 2, -size * 0.36, 0);
    return g;
  });
  const n = spec.lines.length;
  const lineY = spec.lines.map((_, i) => ((n - 1) / 2 - i) * size * LINE_GAP);
  const width = Math.max(...unit) * size;
  const height = size * (1 + (n - 1) * LINE_GAP);
  const base = spec.building !== undefined ? BUILDING_FRAMES[spec.building].floor : plazaY(spec.x, spec.z);
  return { spec, geometries, lineY, width, height, y: base + spec.y };
}

function Sign({ sign }: { sign: BuiltSign }) {
  const { spec, geometries, lineY, width, height, y } = sign;
  const padX = spec.main ? 0.4 : 0.2;
  const padY = spec.main ? 0.22 : 0.14;
  const w = width + padX * 2;
  const h = height + padY * 2;
  return (
    <group position={[spec.x, y, spec.z]} rotation={[0, spec.yaw, 0]}>
      {/* The fascia board, standing just off the façade on brackets. */}
      <mesh material={FASCIA} position={[0, 0, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.04]} />
      </mesh>
      <mesh material={ACCENT} position={[0, -h / 2 - 0.03, 0.03]} castShadow>
        <boxGeometry args={[w * (spec.main ? 1 : 0.7), spec.main ? 0.07 : 0.045, 0.05]} />
      </mesh>
      {spec.main && (
        <mesh material={ACCENT} position={[0, h / 2 + 0.03, 0.03]}>
          <boxGeometry args={[w, 0.04, 0.05]} />
        </mesh>
      )}
      {/* A cream back, so the sign is finished from behind too. */}
      <mesh material={BACK} position={[0, 0, -0.006]}>
        <boxGeometry args={[w + 0.02, h + 0.02, 0.01]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={BRACKET} position={[s * (w / 2 - 0.1), 0, -0.02]}>
          <boxGeometry args={[0.03, h * 0.8, 0.06]} />
        </mesh>
      ))}
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} material={LETTER} position={[0, lineY[i], 0.042]} castShadow />
      ))}
    </group>
  );
}

export function Signage() {
  const signs = useMemo(() => SIGNS.map(buildSign), []);
  return (
    <group name="stage6-signage">
      {signs.map((sign, i) => (
        <Sign key={i} sign={sign} />
      ))}
    </group>
  );
}
