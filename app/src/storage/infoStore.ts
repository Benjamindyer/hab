import type { InfoStore } from "../music/infoLookup";
import type { MusicInfo } from "../state/musicInfo";

const KEY = "hab.musicinfo";

/** Keeps looked-up facts in the browser. If storage is blocked, lookups are simply repeated. */
export function createInfoStore(): InfoStore {
  return {
    load(): Record<string, MusicInfo | null> {
      try {
        const saved = localStorage.getItem(KEY);
        return saved ? (JSON.parse(saved) as Record<string, MusicInfo | null>) : {};
      } catch {
        return {};
      }
    },
    save(entries): void {
      try {
        localStorage.setItem(KEY, JSON.stringify(entries));
      } catch {
        // Storage can be full or blocked. The facts are looked up again next time.
      }
    },
  };
}
