import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { createRandom } from "../stages/common/placement";

/** How much the range follows the camera horizontally: close to 1 = very
 * slow parallax, i.e. reads as very far away, and it always stays inside
 * the camera's far plane / backdrop sphere wherever the drive goes. */
const PARALLAX_FOLLOW = 0.9;
const RING_RADIUS = 128;
const BASE_Y = -30;
const PEAK_COUNT = 14;
const GRID = 72;

// THE BASKETRY red as a distant brand accent: the base dissolves into the
// warm horizon haze (atmospheric perspective), the slopes rise into red.
// Matches the sky's horizon band, so the mountain bases dissolve into it.
const HAZE = new THREE.Color("#f4e2cf");
/** Direction the (baked) sunlight comes from — matches the scene's key light. */
const SUN_DIR = new THREE.Vector3(-7, 12, -5).normalize();
const BODY = new THREE.Color("#d05a52");
const PEAK = new THREE.Color("#c8383a");

/** A smooth massif: a broad bell-shaped rise with a couple of soft
 * ridges, built on a dense grid so it shades smoothly (no facets). */
function buildMountain(random: () => number, width: number, height: number): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(width * 3, width * 2, GRID, GRID);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  const colors: number[] = [];
  const color = new THREE.Color();
  const phase = random() * 10;
  const shoulder = { x: (random() - 0.5) * width * 0.9, z: (random() - 0.5) * width * 0.4, h: 0.45 + random() * 0.3 };
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const main = Math.exp(-((x * x) / (width * width * 0.55) + (z * z) / (width * width * 0.3)));
    const sx = x - shoulder.x;
    const sz = z - shoulder.z;
    const side = shoulder.h * Math.exp(-((sx * sx) / (width * width * 0.25) + (sz * sz) / (width * width * 0.2)));
    const ridges = 1 + 0.06 * Math.sin(x * 0.25 + phase) * Math.cos(z * 0.3 - phase);
    const t = Math.max(main, side) * ridges;
    position.setY(i, t * height);
  }
  geometry.computeVertexNormals();

  // Unlit material with soft sun shading baked in: sunlit faces slightly
  // brighter, shaded faces slightly deeper — while the hazy base keeps the
  // exact sky colour, so the range never reads as a murky shape.
  const normal = geometry.attributes.normal;
  const n = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    const t = position.getY(i) / height;
    n.fromBufferAttribute(normal, i);
    const light = 0.86 + 0.24 * Math.max(0, n.dot(SUN_DIR));
    const redness = THREE.MathUtils.smoothstep(t, 0.25, 0.85);
    color.copy(BODY).lerp(PEAK, THREE.MathUtils.smoothstep(t, 0.7, 1)).multiplyScalar(light);
    color.lerp(HAZE, 1 - redness);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

const MATERIAL = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, toneMapped: false });

/** A ring of soft, distant red mountains around the whole world — the
 * brand's red as a far background accent rather than the ground itself. */
export function DistantMountains() {
  const groupRef = useRef<Group>(null);

  const peaks = useMemo(() => {
    const random = createRandom(2024);
    return Array.from({ length: PEAK_COUNT }, (_, i) => {
      const angle = (i / PEAK_COUNT) * Math.PI * 2 + (random() - 0.5) * 0.25;
      const radius = RING_RADIUS + (random() - 0.5) * 22;
      const width = 34 + random() * 18;
      const height = 26 + random() * 10;
      return {
        geometry: buildMountain(random, width, height),
        position: [Math.sin(angle) * radius, BASE_Y, Math.cos(angle) * radius] as [number, number, number],
        rotationY: random() * Math.PI * 2,
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.set(state.camera.position.x * PARALLAX_FOLLOW, 0, state.camera.position.z * PARALLAX_FOLLOW);
  });

  return (
    <group ref={groupRef}>
      {peaks.map((peak, i) => (
        <mesh key={i} geometry={peak.geometry} material={MATERIAL} position={peak.position} rotation={[0, peak.rotationY, 0]} />
      ))}
    </group>
  );
}
