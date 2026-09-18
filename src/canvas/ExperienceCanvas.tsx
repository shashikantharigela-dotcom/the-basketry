import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./CameraRig";
import { Backdrop } from "./Backdrop";
import { EcosystemScene } from "../scenes/EcosystemScene";

export function ExperienceCanvas() {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      camera={{ fov: 42, near: 0.1, far: 260, position: [-0.8, 1.5, 14.5] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f20d16"]} />
      <fog attach="fog" args={["#b90710", 9, 34]} />

      {/* Soft ambient gradient (warm red sky, near-black ground) instead of
          a single flat ambient fill — reinforces the Red World's vertical
          depth alongside the Backdrop and fog. */}
      <hemisphereLight args={["#ff5147", "#3d0509", 0.55]} />
      <ambientLight intensity={0.2} color="#fff8ed" />
      <directionalLight position={[6, 8, 5]} intensity={1.25} color="#ffffff" />
      <directionalLight position={[-6, 3, -4]} intensity={0.3} color="#b90710" />
      <pointLight position={[-3, 2, -10]} intensity={7} color="#ffffff" />
      <pointLight position={[0, 2.5, -28]} intensity={6} color="#ffffff" />
      <pointLight position={[0, 2.5, -52]} intensity={6} color="#ffffff" />
      <pointLight position={[0, 2.5, -78]} intensity={6} color="#ffffff" />
      <pointLight position={[0, 2.5, -103]} intensity={6} color="#ffffff" />

      <Backdrop />
      <CameraRig />
      <EcosystemScene />
    </Canvas>
  );
}
