export interface Immersion {
  /** True when the details should fade away and the cover grow. */
  hidden(trackKey: string | null, playing: boolean, nowMs: number): boolean;
  /** A touch brings the details back for a while. */
  touch(nowMs: number): void;
}

/**
 * After a track has played for a few seconds the title and controls fade and the cover grows.
 * A new track brings the details back, and so does a touch. Paused or stopped always shows them.
 */
export function createImmersion(hideAfterMs = 3000, touchHoldMs = 6000): Immersion {
  let current: string | null = null;
  let since = 0;
  let lastTouch = Number.NEGATIVE_INFINITY;
  return {
    hidden(trackKey, playing, nowMs) {
      if (!playing || trackKey === null) {
        current = null;
        return false;
      }
      if (trackKey !== current) {
        current = trackKey;
        since = nowMs;
      }
      return nowMs - since >= hideAfterMs && nowMs - lastTouch >= touchHoldMs;
    },
    touch(nowMs) {
      lastTouch = nowMs;
    },
  };
}
