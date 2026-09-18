import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./CameraRig";
import { EcosystemScene } from "../scenes/EcosystemScene";

export function ExperienceCanvas() {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      camera={{ fov: 42, near: 0.1, far: 120, position: [0.6, 1.4, 13] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f20d16"]} />
      <fog attach="fog" args={["#b90710", 9, 30]} />

      <ambientLight intensity={0.5} color="#fff8ed" />
      <directionalLight position={[6, 8, 5]} intensity={1.3} color="#ffffff" />
      <directionalLight position={[-6, 3, -4]} intensity={0.35} color="#b90710" />
      <pointLight position={[-3, 2, -10]} intensity={8} color="#ffffff" />
      <pointLight position={[0, 2.5, -28]} intensity={6} color="#ffffff" />

      <CameraRig />
      <EcosystemScene />
    </Canvas>
  );
}
