import { useMemo } from "react";
import * as THREE from "three";
import { InstancedBatch } from "../common/InstancedBatch";
import { createRandom, groundY, instanceMatrix } from "../common/placement";
import { HEDGES } from "./stage1Layout";

const HEDGE_SPACING = 0.2;
const BUSH_GEOMETRY = new THREE.IcosahedronGeometry(1, 1);
const FLOWER_GEOMETRY = new THREE.SphereGeometry(1, 6, 4);
const FOLIAGE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, metalness: 0 });
const FLOWER = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6, metalness: 0 });

const HEDGE_COLORS = [new THREE.Color("#5f7f3f"), new THREE.Color("#6f8e48"), new THREE.Color("#678a44")];
const FLOWER_COLORS = [new THREE.Color("#fff6e6"), new THREE.Color("#f0c64e")];

/** Low, softly irregular hedgerows along the lane and the yard edge,
 * with a few wildflowers at their foot — the planting that makes the
 * farm feel grown into its land rather than placed on it. */
export function FarmPlanting() {
  const batches = useMemo(() => {
    const random = createRandom(6262);
    const bushes: THREE.Matrix4[] = [];
    const bushColors: THREE.Color[] = [];
    const flowers: THREE.Matrix4[] = [];
    const flowerColors: THREE.Color[] = [];

    for (const line of HEDGES) {
      for (let i = 0; i < line.length - 1; i++) {
        const [ax, az] = line[i];
        const [bx, bz] = line[i + 1];
        const steps = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / HEDGE_SPACING));
        for (let s = 0; s < steps; s++) {
          const t = (s + random() * 0.4) / steps;
          const x = ax + (bx - ax) * t + (random() - 0.5) * 0.05;
          const z = az + (bz - az) * t + (random() - 0.5) * 0.05;
          const r = 0.075 + random() * 0.04;
          bushes.push(instanceMatrix(x, groundY(x, z) + r * 0.55, z, random() * 6, r * 1.1, r * 0.85, r));
          bushColors.push(HEDGE_COLORS[Math.floor(random() * HEDGE_COLORS.length)]);
          if (random() < 0.45) {
            const fx = x + (random() - 0.5) * 0.2;
            const fz = z + (random() - 0.5) * 0.2;
            flowers.push(instanceMatrix(fx, groundY(fx, fz) + 0.02, fz, 0, 0.011 + random() * 0.005));
            flowerColors.push(FLOWER_COLORS[Math.floor(random() * FLOWER_COLORS.length)]);
          }
        }
      }
    }
    return { bushes, bushColors, flowers, flowerColors };
  }, []);

  return (
    <group>
      <InstancedBatch geometry={BUSH_GEOMETRY} material={FOLIAGE} matrices={batches.bushes} colors={batches.bushColors} />
      <InstancedBatch
        geometry={FLOWER_GEOMETRY}
        material={FLOWER}
        matrices={batches.flowers}
        colors={batches.flowerColors}
        castShadow={false}
      />
    </group>
  );
}
