/** The knob turns from -135 degrees (quiet, bottom left) through the top to +135 degrees (loud, bottom right). */
export const KNOB_MIN_DEGREES = -135;
export const KNOB_MAX_DEGREES = 135;

const SWEEP = KNOB_MAX_DEGREES - KNOB_MIN_DEGREES;

/** Where the pointer on the knob points for a volume from 0 to 1. */
export function levelToDegrees(level: number): number {
  return KNOB_MIN_DEGREES + Math.min(1, Math.max(0, level)) * SWEEP;
}

/**
 * The volume for a touch at (dx, dy) from the centre of the knob, with y pointing down.
 * Straight up is the middle. The gap at the bottom is not part of the dial, so a touch there goes to
 * whichever end is nearer.
 */
export function pointToLevel(dx: number, dy: number): number {
  const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const clamped = Math.min(KNOB_MAX_DEGREES, Math.max(KNOB_MIN_DEGREES, degrees));
  return (clamped - KNOB_MIN_DEGREES) / SWEEP;
}
