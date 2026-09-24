import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "../../store/useSceneStore";
import { smoothstep } from "./sRoad";

/**
 * A subtle miniature / diorama lens (tilt-shift), after the approved
 * Stage 2 reference: a horizontal band of the frame stays sharp while the
 * nearest foreground and the far background gently soften.
 *
 * Implemented as a lightweight final pass rather than a full effect
 * composer, so the approved look is preserved exactly: the scene renders
 * to the screen as usual (the renderer's own tone mapping and colour
 * handling, incl. the un-tone-mapped sky and mountains), the finished
 * frame is copied to a texture, and a variable-radius blur is drawn back
 * over it outside the sharp band only — pixels inside the band are
 * returned untouched.
 *
 * In screen space (y from -1 at the bottom to +1 at the top) the band is
 * sharp within `offset ± (focusArea - feather)`, and blur ramps up over
 * `feather` beyond it. The settings ease with scroll:
 *  - the rest of the journey (incl. Stage 1): a wide band and a small
 *    radius — only the very top and bottom edges soften;
 *  - Stage 2: a slightly tighter band that still holds both the product
 *    evaluation and the truck sharp, with a little more softness.
 */
const BASELINE = { offset: -0.08, focusArea: 1.2, feather: 0.34, radius: 2.2 };
const STAGE2 = { offset: -0.15, focusArea: 0.95, feather: 0.42, radius: 3.4 };

function stage2Weight(progress: number): number {
  return smoothstep(0.22, 0.29, progress) * (1 - smoothstep(0.44, 0.5, progress));
}

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// 16-tap golden-angle disc; radius (in pixels) grows with distance from the band.
const FRAGMENT = /* glsl */ `
uniform sampler2D tFrame;
uniform vec2 texel;
uniform float offset;
uniform float focusArea;
uniform float feather;
uniform float maxRadius;
varying vec2 vUv;

void main() {
  vec4 sharp = texture2D(tFrame, vUv);
  float y = vUv.y * 2.0 - 1.0;
  float edge = max(focusArea - feather, 0.0);
  float amount = smoothstep(edge, edge + max(feather, 1e-4), abs(y - offset));
  if (amount <= 0.001) {
    gl_FragColor = sharp;
    return;
  }
  float radius = amount * maxRadius;
  vec4 sum = sharp;
  float total = 1.0;
  for (int i = 0; i < 16; i++) {
    float fi = float(i) + 0.5;
    float r = sqrt(fi / 16.0) * radius;
    float a = fi * 2.39996323;
    vec2 o = vec2(cos(a), sin(a)) * r * texel;
    sum += texture2D(tFrame, vUv + o);
    total += 1.0;
  }
  gl_FragColor = sum / total;
}
`;

interface Lens {
  quadScene: THREE.Scene;
  quadCamera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  texture: THREE.FramebufferTexture | null;
  bufferSize: THREE.Vector2;
}

function createLens(): Lens {
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      tFrame: { value: null },
      texel: { value: new THREE.Vector2() },
      offset: { value: BASELINE.offset },
      focusArea: { value: BASELINE.focusArea },
      feather: { value: BASELINE.feather },
      maxRadius: { value: BASELINE.radius },
    },
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  return {
    quadScene,
    quadCamera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    material,
    texture: null,
    bufferSize: new THREE.Vector2(),
  };
}

const drawingBuffer = new THREE.Vector2();

export function MiniatureLens() {
  const lensRef = useRef<Lens | null>(null);

  useEffect(
    () => () => {
      const lens = lensRef.current;
      if (!lens) return;
      lens.texture?.dispose();
      lens.material.dispose();
      lensRef.current = null;
    },
    []
  );

  // Priority 1: takes over rendering — the scene first, then the lens pass.
  useFrame((state) => {
    const { gl, scene, camera } = state;
    gl.render(scene, camera);

    if (!lensRef.current) lensRef.current = createLens();
    const lens = lensRef.current;
    const uniforms = lens.material.uniforms;

    // (Re)create the frame copy whenever the drawing-buffer size changes.
    gl.getDrawingBufferSize(drawingBuffer);
    if (!lens.texture || !lens.bufferSize.equals(drawingBuffer)) {
      lens.texture?.dispose();
      lens.bufferSize.copy(drawingBuffer);
      lens.texture = new THREE.FramebufferTexture(drawingBuffer.x, drawingBuffer.y);
      lens.texture.minFilter = THREE.LinearFilter;
      lens.texture.magFilter = THREE.LinearFilter;
      uniforms.tFrame.value = lens.texture;
      uniforms.texel.value.set(1 / drawingBuffer.x, 1 / drawingBuffer.y);
    }

    const w = stage2Weight(useSceneStore.getState().progress);
    uniforms.offset.value = THREE.MathUtils.lerp(BASELINE.offset, STAGE2.offset, w);
    uniforms.focusArea.value = THREE.MathUtils.lerp(BASELINE.focusArea, STAGE2.focusArea, w);
    uniforms.feather.value = THREE.MathUtils.lerp(BASELINE.feather, STAGE2.feather, w);
    uniforms.maxRadius.value = THREE.MathUtils.lerp(BASELINE.radius, STAGE2.radius, w) * gl.getPixelRatio();

    gl.copyFramebufferToTexture(lens.texture);
    const autoClear = gl.autoClear;
    gl.autoClear = false;
    gl.render(lens.quadScene, lens.quadCamera);
    gl.autoClear = autoClear;
  }, 1);

  return null;
}
