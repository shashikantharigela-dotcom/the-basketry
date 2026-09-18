import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Group, Mesh, BufferGeometry, Material } from "three";
import { getStage, getStageLocalProgress } from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";
import { isNarrowViewport } from "../hooks/useIsMobile";

const lod = isNarrowViewport();

const CORE_GEOMETRY = new THREE.SphereGeometry(1.1, lod ? 28 : 48, lod ? 28 : 48);
const RING_GEOMETRY = new THREE.TorusGeometry(1.42, 0.055, 16, lod ? 48 : 96);
const SPOKE_GEOMETRY = new THREE.CylinderGeometry(0.045, 0.045, 1, 8);

const CORE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#171717",
  roughness: 0.22,
  metalness: 0.45,
  emissive: "#fff8ed",
  emissiveIntensity: 0.05,
});

const RING_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.28, metalness: 0.2 });

// Brighter and thicker than a plain structural spoke, with a soft white
// glow — reads as a freshly resolved connection, not just a static rod.
const SPOKE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.22,
  metalness: 0.15,
  emissive: "#ffffff",
  emissiveIntensity: 0.3,
});

const WHITE_NODE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.18, metalness: 0.1 });
const DARK_NODE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.3, metalness: 0.4 });
const ACCENT_NODE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.22,
  metalness: 0.15,
  emissive: "#f20d16",
  emissiveIntensity: 0.35,
});

// Six distinct ecosystem nodes — deliberately not six identical spheres,
// so the hub reads as engineered participants (products, brands,
// businesses, consumers, plus two supporting nodes) rather than electrons
// around a nucleus.
const NODE_GEOMETRIES: BufferGeometry[] = [
  new THREE.BoxGeometry(0.39, 0.39, 0.39),
  new THREE.CapsuleGeometry(0.16, 0.25, 4, 8),
  new RoundedBoxGeometry(0.37, 0.37, 0.37, 2, 0.08),
  new THREE.CylinderGeometry(0.18, 0.18, 0.41, 16),
  new THREE.ConeGeometry(0.23, 0.39, 16),
  new THREE.IcosahedronGeometry(0.25, 0),
];

const NODE_MATERIALS: Material[] = [
  WHITE_NODE_MATERIAL,
  DARK_NODE_MATERIAL,
  ACCENT_NODE_MATERIAL,
  WHITE_NODE_MATERIAL,
  DARK_NODE_MATERIAL,
  ACCENT_NODE_MATERIAL,
];

// A tighter, tilted-ring radius (rather than a wide atomic orbit) so the
// six nodes read as a compact, engineered ecosystem hub.
const ORBIT_RADIUS = 1.9;
const ORBIT_NODE_COUNT = 6;
const RING_TILT = 0.32;
const UP = new THREE.Vector3(0, 1, 0);

/** The central ecosystem hub — the experience's visual climax: a dark
 * core, two tumbling white rings, six distinct orbiting participant nodes
 * riding a single stable tilted ring (not an atomic wobble), and thicker,
 * softly glowing spokes that extend from the core to each node as this
 * stage's local progress advances — the Disconnected Journey's broken
 * lines visibly resolving into one connected system. */
export function BasketryHub() {
  const stage = getStage("basketry");
  const ringOuterRef = useRef<Mesh>(null);
  const ringInnerRef = useRef<Mesh>(null);
  const ringGroupRef = useRef<Group>(null);
  const nodeRefs = useRef<Array<Group | null>>([]);
  const spokeRefs = useRef<Array<Mesh | null>>([]);

  const orbitAngles = useMemo(
    () => Array.from({ length: ORBIT_NODE_COUNT }, (_, i) => (i / ORBIT_NODE_COUNT) * Math.PI * 2),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const progress = useSceneStore.getState().progress;
    const localProgress = getStageLocalProgress(stage, progress);
    const spokeReveal = THREE.MathUtils.smoothstep(localProgress, 0.15, 0.65);

    if (ringOuterRef.current) ringOuterRef.current.rotation.z = t * 0.08;
    if (ringInnerRef.current) ringInnerRef.current.rotation.x = t * -0.11;
    if (ringGroupRef.current) ringGroupRef.current.rotation.y = t * 0.06;

    orbitAngles.forEach((baseAngle, i) => {
      const angle = baseAngle + t * 0.1;
      const x = Math.cos(angle) * ORBIT_RADIUS;
      const z = Math.sin(angle) * ORBIT_RADIUS;

      const node = nodeRefs.current[i];
      if (node) {
        node.position.set(x, 0, z);
        node.rotation.y = angle;
      }

      const spoke = spokeRefs.current[i];
      if (spoke) {
        const nodePosition = new THREE.Vector3(x, 0, z);
        const direction = nodePosition.clone().normalize();
        const distance = nodePosition.length() * spokeReveal;
        spoke.quaternion.setFromUnitVectors(UP, direction);
        spoke.position.copy(direction.multiplyScalar(distance / 2));
        spoke.scale.set(1, Math.max(0.001, distance), 1);
      }
    });
  });

  return (
    <group position={stage.anchor} scale={1.4}>
      <mesh geometry={CORE_GEOMETRY} material={CORE_MATERIAL} />
      <mesh ref={ringOuterRef} geometry={RING_GEOMETRY} material={RING_MATERIAL} rotation={[Math.PI / 2, 0, 0]} />
      <mesh
        ref={ringInnerRef}
        geometry={RING_GEOMETRY}
        material={RING_MATERIAL}
        rotation={[Math.PI / 2.6, 0.4, 0]}
        scale={0.78}
      />

      {/* A single rigid, tilted ring carries all six nodes and their
          spokes — a stable structure rotating together, not independent
          orbits wobbling like an atom. */}
      <group ref={ringGroupRef} rotation={[RING_TILT, 0, 0]}>
        {orbitAngles.map((_, i) => (
          <group
            key={`node-${i}`}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
          >
            <mesh geometry={NODE_GEOMETRIES[i]} material={NODE_MATERIALS[i]} />
          </group>
        ))}

        {orbitAngles.map((_, i) => (
          <mesh
            key={`spoke-${i}`}
            ref={(el) => {
              spokeRefs.current[i] = el;
            }}
            geometry={SPOKE_GEOMETRY}
            material={SPOKE_MATERIAL}
          />
        ))}
      </group>
    </group>
  );
}
