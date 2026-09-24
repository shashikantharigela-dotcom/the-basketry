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
