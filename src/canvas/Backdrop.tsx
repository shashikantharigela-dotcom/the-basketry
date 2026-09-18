import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";

// A proper skybox, not a flat plane: a huge sphere that recenters on the
// camera every frame, so it's impossible to see an edge or seam no matter
// how oblique a given keyframe's viewing angle is. Vertex colors run
// top-to-bottom: vivid red atmosphere, a deep-red transition, cinematic
// black — depth in the Red World itself rather than a flat single color.
const RADIUS = 160;
const WIDTH_SEGMENTS = 32;
const HEIGHT_SEGMENTS = 24;

function buildGradientGeometry(): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(RADIUS, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
  const top = new THREE.Color("#f20d16");
  const mid = new THREE.Color("#b90710");
  const bottom = new THREE.Color("#171717");
  const sample = new THREE.Color();
  const colors: number[] = [];
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i); // -RADIUS (straight down) .. +RADIUS (straight up)
    const t = (RADIUS - y) / (2 * RADIUS); // 0 at top, 1 at bottom
    if (t < 0.45) {
      sample.copy(top).lerp(mid, t / 0.45);
    } else {
      sample.copy(mid).lerp(bottom, (t - 0.45) / 0.55);
    }
    colors.push(sample.r, sample.g, sample.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

const BACKDROP_GEOMETRY = buildGradientGeometry();
const BACKDROP_MATERIAL = new THREE.MeshBasicMaterial({
  vertexColors: true,
  fog: false,
  side: THREE.BackSide,
  toneMapped: false,
});

/** A skybox sphere that always stays centered on the camera. */
export function Backdrop() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(state.camera.position);
  });

  return <mesh ref={meshRef} geometry={BACKDROP_GEOMETRY} material={BACKDROP_MATERIAL} />;
}
