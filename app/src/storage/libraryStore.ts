import type { LibraryStore, MediaItem } from "../state/library";

const KEY = "hab.library.playlists";

/** Keeps the library copy in the browser. If storage is blocked, the app still works without it. */
export function createLibraryStore(): LibraryStore {
  return {
    load(): MediaItem[] {
      try {
        const saved = localStorage.getItem(KEY);
        return saved ? (JSON.parse(saved) as MediaItem[]) : [];
      } catch {
        return [];
      }
    },
    save(items: MediaItem[]): void {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {
        // Storage can be full or blocked. The next load simply fetches again.
      }
    },
  };
}
