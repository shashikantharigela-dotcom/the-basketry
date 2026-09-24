import { Component, Suspense } from "react";
import type { ReactNode } from "react";
import { Clone, useGLTF } from "@react-three/drei";

export interface GLBModelProps {
  /** Path to a .glb/.gltf file under public/, e.g. "/models/products/bottle.glb". */
  src?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  visible?: boolean;
  /** Cast shadows from every mesh in the model. */
  castShadow?: boolean;
  /** Rendered in place of the model while it's missing or fails to load. */
  fallback?: ReactNode;
}

interface ModelErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
}

/** Catches a failed/missing GLTFLoader fetch so one bad asset path can't
 * take down the whole scene — falls back to `fallback` (nothing, by
 * default) instead of crashing the render tree. */
class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[GLBModel] failed to load model:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function LoadedModel({
  src,
  position,
  rotation,
  scale,
  visible,
  castShadow,
}: Required<Pick<GLBModelProps, "src">> & Omit<GLBModelProps, "src" | "fallback">) {
  const { scene } = useGLTF(src);
  return (
    <Clone
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      visible={visible}
      castShadow={castShadow}
    />
  );
}

/**
 * Reusable GLB/glTF loader for premium 3D assets (Phase 2). Drop-in
 * replacement for the procedural placeholder meshes: same position/
 * rotation/scale/visible props, but backed by a real model file.
 *
 * Not wired into any scene yet — this is scaffolding only. A missing or
 * unreachable `src` renders nothing rather than throwing, so a scene can
 * reference an asset that hasn't landed yet without breaking.
 */
export function GLBModel({
  src,
  position,
  rotation,
  scale,
  visible = true,
  castShadow = false,
  fallback = null,
}: GLBModelProps) {
  if (!src) return fallback;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <LoadedModel
          src={src}
          position={position}
          rotation={rotation}
          scale={scale}
          visible={visible}
          castShadow={castShadow}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}
