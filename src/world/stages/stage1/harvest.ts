import * as THREE from "three";

/** Shared harvest materials, geometry and sizes — crates, baskets and
 * produce look identical at the stand, on the pallet and in the orchard. */

export const WOOD = new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.8, metalness: 0 });
export const WOOD_DARK = new THREE.MeshStandardMaterial({ color: "#8c6440", roughness: 0.85, metalness: 0 });
export const WICKER = new THREE.MeshStandardMaterial({
  color: "#c99a5c",
  roughness: 0.9,
  metalness: 0,
  side: THREE.DoubleSide,
});
export const PRODUCE = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4, metalness: 0 });

export const PRODUCE_GEOMETRY = new THREE.SphereGeometry(1, 10, 8);
export const PRODUCE_COLORS = [
  new THREE.Color("#d42a1f"),
  new THREE.Color("#e8892b"),
  new THREE.Color("#8fb04d"),
  new THREE.Color("#e9c649"),
];

export const BASKET_GEOMETRY = new THREE.LatheGeometry(
  [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.034, 0),
    new THREE.Vector2(0.042, 0.02),
    new THREE.Vector2(0.05, 0.05),
  ],
  18
);

// Crate: ≈0.6 m x 0.35 m x 0.45 m.
export const CRATE = { w: 0.13, h: 0.075, d: 0.1 };

export interface Placed {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

/** Fills a crate/basket top with a small grid of produce, as instance
 * matrices in the caller's local space. */
export function fillProduce(
  random: () => number,
  out: { matrices: THREE.Matrix4[]; colors: THREE.Color[] },
  cx: number,
  cy: number,
  cz: number,
  yaw: number,
  nx: number,
  nz: number,
  sx: number,
  sz: number,
  color = PRODUCE_COLORS[Math.floor(random() * PRODUCE_COLORS.length)]
): void {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  for (let i = 0; i < nx; i++) {
    for (let k = 0; k < nz; k++) {
      const lx = (i - (nx - 1) / 2) * sx + (random() - 0.5) * 0.006;
      const lz = (k - (nz - 1) / 2) * sz + (random() - 0.5) * 0.006;
      const r = 0.019 + random() * 0.004;
      position.set(cx + lx * c + lz * s, cy + (random() - 0.5) * 0.006, cz - lx * s + lz * c);
      out.matrices.push(new THREE.Matrix4().compose(position, quaternion, scale.set(r, r, r)));
      out.colors.push(color);
    }
  }
}
