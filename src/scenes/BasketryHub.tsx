import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import { getStage, getStageLocalProgress } from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";
import { isNarrowViewport } from "../hooks/useIsMobile";

const lod = isNarrowViewport();

const CORE_GEOMETRY = new THREE.SphereGeometry(1, lod ? 28 : 48, lod ? 28 : 48);
const RING_GEOMETRY = new THREE.TorusGeometry(1.65, 0.035, 16, lod ? 48 : 96);
const NODE_GEOMETRY = new THREE.IcosahedronGeometry(0.28, 1);
const SPOKE_GEOMETRY = new THREE.CylinderGeometry(0.025, 0.025, 1, 8);

const CORE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#171717",
  roughness: 0.25,
  metalness: 0.4,
  emissive: "#fff8ed",
  emissiveIntensity: 0.05,
});

const RING_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.2 });
const NODE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2, metalness: 0.1 });
const ACCENT_NODE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f20d16",
  roughness: 0.25,
  metalness: 0.15,
  emissive: "#f20d16",
  emissiveIntensity: 0.35,
});
const SPOKE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.1 });

const ORBIT_RADIUS = 2.6;
// Six orbiting nodes: PRODUCTS, BRANDS, BUSINESSES, CONSUMERS, plus two
// supporting ecosystem nodes — represented conceptually through position
// and material rather than labels, which stay in the DOM per stage 7.
const ORBIT_NODE_COUNT = 6;
const UP = new THREE.Vector3(0, 1, 0);

/** The central ecosystem hub: a dark core, tumbling white rings, six
 * orbiting participant nodes, and spokes that extend from the core to each
 * node as this stage's local progress advances — the Disconnected
 * Journey's broken lines resolving into one connected system. */
export function BasketryHub() {
  const stage = getStage("basketry");
  const ringOuterRef = useRef<Mesh>(null);
  const ringInnerRef = useRef<Mesh>(null);
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

    orbitAngles.forEach((baseAngle, i) => {
      const angle = baseAngle + t * 0.12;
      const y = Math.sin(angle * 2) * 0.35;
      const x = Math.cos(angle) * ORBIT_RADIUS;
      const z = Math.sin(angle) * ORBIT_RADIUS;

      const node = nodeRefs.current[i];
      if (node) {
        node.position.set(x, y, z);
        node.rotation.y = angle;
      }

      const spoke = spokeRefs.current[i];
      if (spoke) {
        const nodePosition = new THREE.Vector3(x, y, z);
        const direction = nodePosition.clone().normalize();
        const distance = nodePosition.length() * spokeReveal;
        spoke.quaternion.setFromUnitVectors(UP, direction);
        spoke.position.copy(direction.multiplyScalar(distance / 2));
        spoke.scale.set(1, Math.max(0.001, distance), 1);
      }
    });
  });

  return (
    <group position={stage.anchor}>
      <mesh geometry={CORE_GEOMETRY} material={CORE_MATERIAL} />
      <mesh ref={ringOuterRef} geometry={RING_GEOMETRY} material={RING_MATERIAL} rotation={[Math.PI / 2, 0, 0]} />
      <mesh
        ref={ringInnerRef}
        geometry={RING_GEOMETRY}
        material={RING_MATERIAL}
        rotation={[Math.PI / 2.6, 0.4, 0]}
        scale={0.8}
      />

      {orbitAngles.map((_, i) => (
        <group
          key={`node-${i}`}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
        >
          <mesh geometry={NODE_GEOMETRY} material={i % 3 === 0 ? ACCENT_NODE_MATERIAL : NODE_MATERIAL} />
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
  );
}
