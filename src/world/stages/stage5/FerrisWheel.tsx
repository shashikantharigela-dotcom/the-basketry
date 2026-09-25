import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "../../../store/useSceneStore";
import { BasketEmblem } from "../common/BasketEmblem";
import { InstancedBatch } from "../common/InstancedBatch";
import { instanceMatrix } from "../common/placement";
import { paveY, resolve } from "./stage5Geometry";
import { FERRIS_RADIUS, FERRIS_WHEEL } from "./stage5Layout";

/**
 * The exhibition's landmark: a large Ferris wheel lit with warm bulbs along
 * its rims and spokes, slowly turning, its gondolas hanging level in brand
 * red and white. It faces the road (local +Z), its axle along local Z.
 */

const R = FERRIS_RADIUS;
const HUB_Y = R + 0.5;
const SPOKES = 16;
const RIM_GAP = 0.2;

const STEEL = new THREE.MeshStandardMaterial({ color: "#eeebe4", roughness: 0.35, metalness: 0.55 });
const STEEL_DARK = new THREE.MeshStandardMaterial({ color: "#8c9095", roughness: 0.4, metalness: 0.6 });
const RED = new THREE.MeshStandardMaterial({ color: "#d0161e", roughness: 0.5, metalness: 0.1 });
const WHITE = new THREE.MeshStandardMaterial({ color: "#f6f2ea", roughness: 0.55, metalness: 0.05 });
const GLASS = new THREE.MeshStandardMaterial({ color: "#fff1d6", roughness: 0.3, metalness: 0, emissive: "#ffcf86", emissiveIntensity: 0.55 });
const BULB = new THREE.MeshStandardMaterial({ color: "#fff3d6", roughness: 0.3, metalness: 0, emissive: "#ffc56b", emissiveIntensity: 1.8 });
const BASE = new THREE.MeshStandardMaterial({ color: "#d9d0c0", roughness: 0.85, metalness: 0 });
const BOX = new THREE.BoxGeometry(1, 1, 1);
const DOT = new THREE.SphereGeometry(1, 6, 4);
const RIM = new THREE.TorusGeometry(R, 0.028, 6, 72);
const INNER_RIM = new THREE.TorusGeometry(R * 0.5, 0.018, 6, 48);

/** A thin strut between two points (local space). */
function strut(a: THREE.Vector3, b: THREE.Vector3, thickness: number): THREE.Matrix4 {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return new THREE.Matrix4().compose(mid, q, new THREE.Vector3(thickness, dir.length(), thickness));
}

export function FerrisWheel() {
  const place = useMemo(() => {
    const { x, z, yaw } = resolve(FERRIS_WHEEL);
    return { x, y: paveY(x, z), z, yaw };
  }, []);
  const wheelRef = useRef<THREE.Group>(null);
  const gondolaRefs = useRef<Array<THREE.Group | null>>([]);

  // The turning part: rims, spokes, cross bars, bulbs (in the wheel's plane).
  const turning = useMemo(() => {
    const spokes: THREE.Matrix4[] = [];
    const bulbs: THREE.Matrix4[] = [];
    for (let i = 0; i < SPOKES; i++) {
      const a = (i / SPOKES) * Math.PI * 2;
      const tip = new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0);
      for (const side of [-1, 1]) {
        spokes.push(strut(new THREE.Vector3(0, 0, side * 0.12), tip.clone().setZ(side * RIM_GAP), 0.016));
        for (let k = 1; k <= 5; k++) {
          const t = k / 6;
          bulbs.push(instanceMatrix(tip.x * t, tip.y * t, side * (0.12 + (RIM_GAP - 0.12) * t), 0, 0.02));
        }
      }
      // Cross bar between the two rims, where a gondola hangs.
      spokes.push(strut(tip.clone().setZ(-RIM_GAP), tip.clone().setZ(RIM_GAP), 0.02));
    }
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      for (const side of [-1, 1]) bulbs.push(instanceMatrix(Math.cos(a) * R, Math.sin(a) * R, side * (RIM_GAP + 0.03), 0, 0.024));
    }
    return { spokes, bulbs };
  }, []);

  // The fixed A-frame supports and the boarding platform.
  const frame = useMemo(() => {
    const legs: THREE.Matrix4[] = [];
    const hub = new THREE.Vector3(0, HUB_Y, 0);
    for (const side of [-1, 1]) {
      for (const fx of [-1, 1]) {
        legs.push(strut(new THREE.Vector3(fx * 1.25, 0.08, side * 0.55), hub.clone().setZ(side * 0.3), 0.07));
      }
      legs.push(strut(new THREE.Vector3(-0.72, 1.3, side * 0.47), new THREE.Vector3(0.72, 1.3, side * 0.47), 0.04));
    }
    return { legs };
  }, []);

  const gondolaColors = useMemo(() => Array.from({ length: SPOKES }, (_, i) => (i % 3 === 2 ? WHITE : RED)), []);

  useFrame((state) => {
    const angle = state.clock.elapsedTime * 0.05 * useSceneStore.getState().motionScale;
    if (wheelRef.current) wheelRef.current.rotation.z = angle;
    gondolaRefs.current.forEach((g, i) => {
      if (!g) return;
      const a = (i / SPOKES) * Math.PI * 2 + angle;
      g.position.set(Math.cos(a) * R, HUB_Y + Math.sin(a) * R, 0);
    });
  });

  return (
    <group position={[place.x, place.y, place.z]} rotation={[0, place.yaw, 0]} name="stage5-ferris-wheel">
      {/* Boarding platform with a red trim and the emblem. */}
      <mesh material={BASE} position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.1, 1.5]} />
      </mesh>
      <mesh material={RED} position={[0, 0.1, 0.751]}>
        <boxGeometry args={[3.0, 0.03, 0.01]} />
      </mesh>
      <mesh material={WHITE} position={[0, 0.25, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.3, 0.3]} />
      </mesh>
      <mesh material={RED} position={[0, 0.41, 0.55]} castShadow>
        <boxGeometry args={[0.76, 0.03, 0.36]} />
      </mesh>
      <BasketEmblem position={[0, 0.26, 0.702]} rotation={[Math.PI / 2, 0, 0]} scale={0.05} />
      <InstancedBatch geometry={BOX} material={STEEL_DARK} matrices={frame.legs} />
      {/* Hub. */}
      <mesh material={RED} position={[0, HUB_Y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.7, 18]} />
      </mesh>
      <group ref={wheelRef} position={[0, HUB_Y, 0]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh geometry={RIM} material={STEEL} position={[0, 0, side * RIM_GAP]} castShadow />
            <mesh geometry={INNER_RIM} material={STEEL} position={[0, 0, side * (RIM_GAP * 0.7)]} />
          </group>
        ))}
        <InstancedBatch geometry={BOX} material={STEEL} matrices={turning.spokes} />
        <InstancedBatch geometry={DOT} material={BULB} matrices={turning.bulbs} castShadow={false} />
      </group>
      {/* Gondolas hang level from the turning rim. */}
      {gondolaColors.map((material, i) => (
        <group
          key={i}
          ref={(g) => {
            gondolaRefs.current[i] = g;
          }}
          position={[Math.cos((i / SPOKES) * Math.PI * 2) * R, HUB_Y + Math.sin((i / SPOKES) * Math.PI * 2) * R, 0]}
        >
          <mesh material={STEEL_DARK} position={[0, -0.07, 0]}>
            <boxGeometry args={[0.015, 0.14, 0.015]} />
          </mesh>
          <mesh material={material} position={[0, -0.26, 0]} castShadow>
            <boxGeometry args={[0.24, 0.2, 0.22]} />
          </mesh>
          <mesh material={GLASS} position={[0, -0.24, 0]}>
            <boxGeometry args={[0.245, 0.08, 0.2]} />
          </mesh>
          <mesh material={material} position={[0, -0.13, 0]} castShadow>
            <coneGeometry args={[0.17, 0.08, 4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
