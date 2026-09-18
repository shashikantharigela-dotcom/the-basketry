import * as THREE from "three";

const WIDTH = 240;
const HEIGHT = 150;
const HEIGHT_SEGMENTS = 24;

function buildGradientGeometry(): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, 1, HEIGHT_SEGMENTS);
  const top = new THREE.Color("#f20d16");
  const mid = new THREE.Color("#b90710");
  const bottom = new THREE.Color("#171717");
  const sample = new THREE.Color();
  const colors: number[] = [];
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const t = (HEIGHT / 2 - y) / HEIGHT; // 0 at top, 1 at bottom
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
  depthWrite: false,
  toneMapped: false,
});

/** A large, fixed gradient plane far behind the whole dolly track: vivid
 * red atmosphere up top, a deep-red transition, and cinematic black lower
 * down — depth in the Red World itself rather than a flat single color. */
export function Backdrop() {
  return <mesh geometry={BACKDROP_GEOMETRY} material={BACKDROP_MATERIAL} position={[0, 4, -70]} />;
}
