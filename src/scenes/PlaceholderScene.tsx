import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { STAGES } from "../narrative/narrativeConfig";

function SpinningMesh({
  position,
  children,
  speed = 0.15,
}: {
  position: [number, number, number];
  children: React.ReactNode;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * speed;
    ref.current.rotation.x += delta * speed * 0.4;
  });

  return (
    <mesh ref={ref} position={position}>
      {children}
    </mesh>
  );
}

export function PlaceholderScene() {
  const [products, brand, basketry] = STAGES;

  return (
    <group>
      {/* PRODUCTS — scattered, matte, not yet part of anything */}
      <SpinningMesh position={products.objectPosition} speed={0.25}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.1} />
      </SpinningMesh>

      {/* BRAND — a white structural form, still isolated, reading against the red world */}
      <SpinningMesh position={brand.objectPosition} speed={0.18}>
        <torusKnotGeometry args={[0.75, 0.24, 128, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.15} />
      </SpinningMesh>

      {/* THE BASKETRY — the dark structural hub the whole story converges on,
          rimmed in white with a faint warm highlight */}
      <group position={basketry.objectPosition}>
        <SpinningMesh position={[0, 0, 0]} speed={0.1}>
          <sphereGeometry args={[1.1, 48, 48]} />
          <meshStandardMaterial
            color="#171717"
            roughness={0.2}
            metalness={0.35}
            emissive="#fff8ed"
            emissiveIntensity={0.06}
          />
        </SpinningMesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.7, 0.05, 16, 64]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      </group>

      {/* Ground plane — a dark horizon that recedes into the red fog rather
          than reading as a lit studio floor */}
      <mesh position={[0, -2, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#171717" roughness={0.95} />
      </mesh>
    </group>
  );
}
