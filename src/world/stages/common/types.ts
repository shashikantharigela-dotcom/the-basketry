/** A rotated rectangle on the ground plane (world x/z, yaw about +Y). */
export interface Rect {
  x: number;
  z: number;
  /** Size along the rect's local X. */
  width: number;
  /** Size along the rect's local Z. */
  depth: number;
  rotationY: number;
}

export type TreeKind = "round" | "poplar" | "fruit" | "orange" | "cypress";

export interface TreeSpec {
  kind: TreeKind;
  x: number;
  z: number;
  scale: number;
  /** Ground height to stand on (e.g. a terrace top); defaults to the terrain. */
  y?: number;
}

export type CropKind = "greens" | "wheat" | "sprouts" | "tomatoes" | "squash";

/** A cultivated field: a rotated rect of crop rows. */
export interface FieldSpec extends Rect {
  kind: CropKind;
}
