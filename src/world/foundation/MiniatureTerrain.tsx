import { useMemo } from "react";
import * as THREE from "three";
import { isNarrowViewport } from "../../hooks/useIsMobile";
import { TERRAIN_CENTER, TERRAIN_HALF_SIZE, distanceToRoad, groundHeight, smoothstep, terrainHeight } from "./sRoad";
import { TERRAIN_ZONES } from "../stages/worldZones";
import { meadowAmount, patchNoise } from "./landNoise";

const lod = isNarrowViewport();
// Roughly one vertex every 0.5 units on desktop, 1 unit on mobile.
const SEGMENTS_X = lod ? 60 : 120;
const SEGMENTS_Z = lod ? 128 : 256;

// One continuous natural landscape: warm cream earth as the base, hills
// lifting toward pale sunlit cream, soft sage-grass meadows and darker
// tilled-earth patches drifting across it at a few scales, and a dry
// earth shoulder along the road. The brand red is kept for accents
// (roofs, mountains, produce) — never the ground itself.
const EARTH_LOW = new THREE.Color("#cdb591");
const EARTH_HIGH = new THREE.Color("#efe4cc");
const GRASS = new THREE.Color("#a9b077");
const GRASS_DEEP = new THREE.Color("#8f9d60");
const SOIL = new THREE.Color("#bb9b73");
const VERGE_COLOR = new THREE.Color("#bea27a");

// Optional per-stage tints (see stages/worldZones.ts) — blended gently
// over the shared landscape, never replacing it.
const ZONE_COLORS = TERRAIN_ZONES.map((zone) => ({
  zone,
  low: new THREE.Color(zone.palette.low),
  high: new THREE.Color(zone.palette.high),
  verge: new THREE.Color(zone.palette.verge),
}));

/** 0–1 weight of a zone at world z: 1 inside [zTo, zFrom], fading outside. */
function zoneWeight(zone: (typeof TERRAIN_ZONES)[number], z: number): number {
  return smoothstep(zone.zTo - zone.fade, zone.zTo, z) * (1 - smoothstep(zone.zFrom, zone.zFrom + zone.fade, z));
}

const TERRAIN_MATERIAL = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.92,
  metalness: 0.02,
});

function buildTerrainGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(
    TERRAIN_HALF_SIZE.x * 2,
    TERRAIN_HALF_SIZE.y * 2,
    SEGMENTS_X,
    SEGMENTS_Z
  );
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(TERRAIN_CENTER.x, 0, TERRAIN_CENTER.y);

  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const sample = new THREE.Color();
  const zoneSample = new THREE.Color();

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const roadDistance = distanceToRoad(x, z);
    const y = terrainHeight(x, z, roadDistance);
    position.setY(i, y);

    const relief = THREE.MathUtils.clamp((y - groundHeight(x, z)) / 1.6, 0, 1);
    sample.copy(EARTH_LOW).lerp(EARTH_HIGH, relief * 0.85);
    // Meadows: large soft grass patches with deeper-green cores, thinning
    // on the sunlit hilltops.
    const meadow = meadowAmount(x, z) * (1 - relief * 0.45);
    sample.lerp(GRASS, meadow * 0.75);
    sample.lerp(GRASS_DEEP, smoothstep(0.7, 0.95, patchNoise(x, z, 2.2, 7.4)) * meadow * 0.5);
    // Darker tilled / damp earth patches for variety.
    sample.lerp(SOIL, smoothstep(0.62, 0.85, patchNoise(x, z, 1.6, 11.8)) * (1 - meadow) * 0.45);
    // A dry earth shoulder hugging the road edge.
    const verge = (1 - THREE.MathUtils.smoothstep(roadDistance, 0.9, 2.2)) * 0.55;
    sample.lerp(VERGE_COLOR, verge);
    for (const { zone, low, high, verge: vergeColor } of ZONE_COLORS) {
      const weight = zoneWeight(zone, z);
      if (weight <= 0) continue;
      zoneSample.copy(low).lerp(high, relief).lerp(vergeColor, verge);
      sample.lerp(zoneSample, weight * 0.35);
    }
    colors[i * 3] = sample.r;
    colors[i * 3 + 1] = sample.g;
    colors[i * 3 + 2] = sample.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** The rounded miniature landscape the S-road runs across: a single
 * softly-domed slab with rolling hills, a flat verge along the road, and
 * edges that roll off like a tabletop diorama. */
export function MiniatureTerrain() {
  const geometry = useMemo(() => buildTerrainGeometry(), []);
  return <mesh geometry={geometry} material={TERRAIN_MATERIAL} receiveShadow />;
}
