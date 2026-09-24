import { BASKET_GEOMETRY, CRATE, WICKER, WOOD, WOOD_DARK, type Placed } from "./harvest";

export function Crate({ x, y, z, yaw }: Placed) {
  const { w, h, d } = CRATE;
  const t = 0.008;
  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      <mesh material={WOOD_DARK} position={[0, t / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, t, d]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`x${s}`} material={WOOD} position={[(s * (w - t)) / 2, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[t, h, d]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <group key={`z${s}`} position={[0, 0, (s * (d - t)) / 2]}>
          {[0.2, 0.5, 0.8].map((f) => (
            <mesh key={f} material={WOOD} position={[0, h * f, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, h * 0.22, t]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function Basket({ x, y, z }: Placed) {
  return (
    <group position={[x, y, z]}>
      <mesh geometry={BASKET_GEOMETRY} material={WICKER} castShadow receiveShadow />
      <mesh material={WOOD_DARK} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.05, 0.005, 6, 20]} />
      </mesh>
    </group>
  );
}

