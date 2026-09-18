import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./CameraRig";
import { PlaceholderScene } from "../scenes/PlaceholderScene";

export function ExperienceCanvas() {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 1.2, 10] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f20d16"]} />
      <fog attach="fog" args={["#b90710", 10, 30]} />

      <ambientLight intensity={0.55} color="#fff8ed" />
      <directionalLight position={[5, 6, 4]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-3, 2, -10]} intensity={10} color="#ffffff" />

      <CameraRig />
      <PlaceholderScene />
    </Canvas>
  );
}
