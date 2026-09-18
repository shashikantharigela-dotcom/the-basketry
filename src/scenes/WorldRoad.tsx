import { useMemo } from "react";
import * as THREE from "three";
import { WORLD_PATH_POINTS } from "../world/worldPath";

const ROAD_MATERIAL = new THREE.MeshStandardMaterial({ color: "#fff8ed", roughness: 0.8, metalness: 0.05 });
const LINE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f20d16", roughness: 0.4, metalness: 0.1 });
const UNIT_BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);

interface RoadSegment {
  position: [number, number, number];
  quaternion: THREE.Quaternion;
  length: number;
}

const FORWARD = new THREE.Vector3(0, 0, 1);

/** The continuous road the truck drives — straight paved segments
 * linking every waypoint in the world path, so every environment along
 * the journey is physically connected by an actual road, not floating
 * separately in space. */
export function WorldRoad() {
  const segments = useMemo<RoadSegment[]>(() => {
    const result: RoadSegment[] = [];
    for (let i = 0; i < WORLD_PATH_POINTS.length - 1; i++) {
      const start = new THREE.Vector3(...WORLD_PATH_POINTS[i]);
      const end = new THREE.Vector3(...WORLD_PATH_POINTS[i + 1]);
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(FORWARD, direction.clone().normalize());
      const midpoint = start.add(end).multiplyScalar(0.5);
      result.push({ position: [midpoint.x, midpoint.y, midpoint.z], quaternion, length });
    }
    return result;
  }, []);

  return (
    <group>
      {segments.map((segment, i) => (
        <group key={i} position={segment.position} quaternion={segment.quaternion}>
          <mesh geometry={UNIT_BOX_GEOMETRY} material={ROAD_MATERIAL} scale={[1.6, 0.06, segment.length]} />
          <mesh
            geometry={UNIT_BOX_GEOMETRY}
            material={LINE_MATERIAL}
            position={[0, 0.035, 0]}
            scale={[0.06, 0.01, segment.length * 0.7]}
          />
        </group>
      ))}
    </group>
  );
}
