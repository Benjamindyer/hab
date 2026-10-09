/** A repeatable number from text, so the same track always dances the same way. */
function hash(text: string): number {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * How fast the slab sways, in cycles per second. We have no tempo data from Spotify,
 * so each track gets its own steady pace. The sway is half the beat of a 84 to 132 bpm track: slow enough to feel calm.
 */
export function tempoFor(seed: string): number {
  return 0.7 + ((hash(seed) % 100) / 100) * 0.4;
}

export interface Dance {
  /** Bar height as a fraction of full height. */
  height: number;
  /** Vertical offset in percent. */
  lift: number;
  /** Tilt in degrees. */
  tilt: number;
}

/** One bar's pose at a moment in time. Small movements: it should be felt more than watched. */
export function dancePose(seed: string, seconds: number, index: number): Dance {
  const phase = seconds * tempoFor(seed) * Math.PI * 2 - index * 0.9;
  const sway = Math.sin(phase);
  return {
    height: 0.965 + 0.025 * Math.sin(phase + index),
    lift: -0.7 * (0.5 + 0.5 * sway),
    tilt: 0.45 * sway * (index % 2 === 0 ? 1 : -1),
  };
}
