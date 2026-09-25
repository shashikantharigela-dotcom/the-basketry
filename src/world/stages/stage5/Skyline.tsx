import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, instanceMatrix } from "../common/placement";
import { lowestGround } from "./stage5Geometry";
import { SKYLINE } from "./stage5Layout";

/**
 * The city beyond the exhibition: slender towers along the far side of the
 * plateau, their windows warmly lit for the evening — the event sits inside
 * a modern city, not in a field.
 */

const BOX = new THREE.BoxGeometry(1, 1, 1);
const BODY = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5, metalness: 0.2 });
const LIT = new THREE.MeshStandardMaterial({ color: "#fff1d0", roughness: 0.3, metalness: 0, emissive: "#ffc778", emissiveIntensity: 0.9 });
const DARK = new THREE.MeshStandardMaterial({ color: "#44535e", roughness: 0.25, metalness: 0.3 });
const CROWN = new THREE.MeshStandardMaterial({ color: "#d9d6cf", roughness: 0.6, metalness: 0.2 });

export function Skyline() {
  const built = useMemo(() => {
    const random = createRandom(5401);
    const bodies: THREE.Matrix4[] = [];
    const tones: THREE.Color[] = [];
    const lit: THREE.Matrix4[] = [];
    const dark: THREE.Matrix4[] = [];
    const crowns: THREE.Matrix4[] = [];
    const floorH = 0.34;
    for (const t of SKYLINE) {
      const base = lowestGround(t.x, t.z, t.w, t.d) - 0.3;
      const h = t.h + 0.3;
      bodies.push(instanceMatrix(t.x, base + h / 2, t.z, 0, t.w, h, t.d));
      tones.push(new THREE.Color(t.tone));
      crowns.push(instanceMatrix(t.x, base + h + 0.08, t.z, 0, t.w * 0.7, 0.16, t.d * 0.7));
      // Windows on all four faces, most of them lit.
      const floors = Math.floor((h - 0.6) / floorH);
      for (const face of [0, 1, 2, 3]) {
        const along = face % 2 === 0 ? t.w : t.d;
        const cols = Math.max(3, Math.floor(along / 0.22));
        for (let f = 0; f < floors; f++) {
          for (let c = 0; c < cols; c++) {
            const a = -along / 2 + (along / cols) * (c + 0.5);
            const y = base + 0.6 + f * floorH + floorH * 0.5;
            const [x, z] =
              face === 0 ? [t.x + a, t.z + t.d / 2 + 0.004] : face === 1 ? [t.x + t.w / 2 + 0.004, t.z + a] : face === 2 ? [t.x + a, t.z - t.d / 2 - 0.004] : [t.x - t.w / 2 - 0.004, t.z + a];
            const m = face % 2 === 0 ? instanceMatrix(x, y, z, 0, (along / cols) * 0.72, floorH * 0.5, 0.01) : instanceMatrix(x, y, z, 0, 0.01, floorH * 0.5, (along / cols) * 0.72);
            (random() < 0.5 ? lit : dark).push(m);
          }
        }
      }
    }
    return { bodies, tones, lit, dark, crowns };
  }, []);
  return (
    <group name="stage5-skyline">
      <InstancedBatch geometry={BOX} material={BODY} matrices={built.bodies} colors={built.tones} />
      <InstancedBatch geometry={BOX} material={LIT} matrices={built.lit} castShadow={false} />
      <InstancedBatch geometry={BOX} material={DARK} matrices={built.dark} castShadow={false} />
      <InstancedBatch geometry={BOX} material={CROWN} matrices={built.crowns} />
    </group>
  );
}
