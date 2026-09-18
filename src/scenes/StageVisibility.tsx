import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ReactNode } from "react";
import { getStage, getStageOpacity, type StageId } from "../narrative/narrativeConfig";
import { useSceneStore } from "../store/useSceneStore";

interface StageVisibilityProps {
  stageId: StageId;
  children: ReactNode;
}

/** Hides a stage's whole 3D group once scroll progress is far enough from
 * its own range — fog and camera framing alone aren't enough to keep a
 * neighboring stage's geometry from reading through in the background, so
 * each stage is fully hidden outside its own range (plus the same
 * crossfade window the DOM copy uses, so 3D and typography transition
 * together rather than cutting hard). */
export function StageVisibility({ stageId, children }: StageVisibilityProps) {
  const stage = getStage(stageId);
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = useSceneStore.getState().progress;
    groupRef.current.visible = getStageOpacity(stage, progress) > 0.01;
  });

  return <group ref={groupRef}>{children}</group>;
}
