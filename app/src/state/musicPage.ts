import type { MusicMode } from "./music";

export type MusicPage = "speakers" | "library" | "now";

/** The page to show when the player changes state: the track while playing, otherwise the library. */
export function defaultPage(mode: MusicMode): MusicPage {
  return mode === "playing" || mode === "paused" ? "now" : "library";
}

/** True when the player moved between playing and not playing, so the screen should follow. */
export function activityChanged(before: MusicMode | null, after: MusicMode): boolean {
  if (before === null) return true;
  return (before === "playing" || before === "paused") !== (after === "playing" || after === "paused");
}

export interface PageFollower {
  /** The page to move to now, or null to stay where the user is. */
  next(mode: MusicMode, nowMs: number): MusicPage | null;
}

/**
 * Moves the screen when music starts or stops, but only once the change has lasted a few seconds.
 * Spotify reports a brief idle between tracks, and that must not throw the user off the page they chose.
 */
export function createPageFollower(stableMs = 3000): PageFollower {
  let settled: MusicMode | null = null;
  let candidate: MusicMode | null = null;
  let since = 0;
  return {
    next(mode, nowMs) {
      if (settled === null) {
        settled = mode;
        return defaultPage(mode);
      }
      if (!activityChanged(settled, mode)) {
        candidate = null;
        return null;
      }
      if (candidate === null || activityChanged(candidate, mode)) {
        candidate = mode;
        since = nowMs;
        return null;
      }
      if (nowMs - since < stableMs) return null;
      settled = mode;
      candidate = null;
      return defaultPage(mode);
    },
  };
}
