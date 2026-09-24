import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";
import { RED_WORLD_SKY, type SkyStops } from "./skyStops";

// A proper skybox, not a flat plane: a huge sphere that recenters on the
// camera every frame, so it's impossible to see an edge or seam no matter
// how oblique a given shot's viewing angle is. Vertex colors run
// top-to-bottom through the given gradient stops.
const RADIUS = 160;
const WIDTH_SEGMENTS = 32;
const HEIGHT_SEGMENTS = 48;

function buildGradientGeometry(stops: SkyStops): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(RADIUS, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
  const stopColors = stops.map(([t, color]) => [t, new THREE.Color(color)] as const);
  const sample = new THREE.Color();
  const colors: number[] = [];
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i); // -RADIUS (straight down) .. +RADIUS (straight up)
    const t = (RADIUS - y) / (2 * RADIUS); // 0 at top, 1 at bottom
    let k = 0;
    while (k < stopColors.length - 2 && t > stopColors[k + 1][0]) k++;
    const [t0, c0] = stopColors[k];
    const [t1, c1] = stopColors[Math.min(k + 1, stopColors.length - 1)];
    sample.copy(c0).lerp(c1, t1 > t0 ? THREE.MathUtils.clamp((t - t0) / (t1 - t0), 0, 1) : 0);
    colors.push(sample.r, sample.g, sample.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}
const BACKDROP_MATERIAL = new THREE.MeshBasicMaterial({
  vertexColors: true,
  fog: false,
  side: THREE.BackSide,
  toneMapped: false,
});

/** A skybox sphere that always stays centered on the camera. */
export function Backdrop({ stops = RED_WORLD_SKY }: { stops?: SkyStops }) {
  const meshRef = useRef<Mesh>(null);
  const geometry = useMemo(() => buildGradientGeometry(stops), [stops]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(state.camera.position);
  });

  return <mesh ref={meshRef} geometry={geometry} material={BACKDROP_MATERIAL} />;
}
