import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";

// A proper skybox, not a flat plane: a huge sphere that recenters on the
// camera every frame, so it's impossible to see an edge or seam no matter
// how oblique a given shot's viewing angle is. Vertex colors run
// top-to-bottom: vivid red atmosphere fading to a deeper red — the Red
// World never drops to black, top or bottom.
const RADIUS = 160;
const WIDTH_SEGMENTS = 32;
const HEIGHT_SEGMENTS = 24;

function buildGradientGeometry(): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(RADIUS, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
  const top = new THREE.Color("#f20d16");
  const bottom = new THREE.Color("#7a0710");
  const sample = new THREE.Color();
  const colors: number[] = [];
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i); // -RADIUS (straight down) .. +RADIUS (straight up)
    const t = (RADIUS - y) / (2 * RADIUS); // 0 at top, 1 at bottom
    sample.copy(top).lerp(bottom, t);
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
