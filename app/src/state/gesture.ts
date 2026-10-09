export type Gesture = "tap" | "swipe-left" | "swipe-right" | null;

const TAP_MOVE_PX = 12;
const TAP_MS = 400;
const SWIPE_MIN_PX = 50;
const SWIPE_MS = 700;
/** A swipe must be clearly more sideways than up or down, so scrolling is not mistaken for it. */
const SIDEWAYS = 1.5;

/** Reads a touch from where it started to where it ended: a quick small movement is a tap, a clear sideways flick is a swipe. */
export function classifyGesture(dx: number, dy: number, ms: number): Gesture {
  if (Math.abs(dx) <= TAP_MOVE_PX && Math.abs(dy) <= TAP_MOVE_PX && ms <= TAP_MS) return "tap";
  if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) >= Math.abs(dy) * SIDEWAYS && ms <= SWIPE_MS) {
    return dx < 0 ? "swipe-left" : "swipe-right";
  }
  return null;
}
