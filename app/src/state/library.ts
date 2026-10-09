export interface MediaItem {
  id: string;
  title: string;
  type: string;
  thumbnail: string | null;
  canPlay: boolean;
}

/** Asks Home Assistant what is inside a media player's library. */
export interface MediaBrowser {
  browse(entityId: string, contentId: string, contentType: string): Promise<MediaItem[]>;
}

/** Keeps a copy of the library, so the screen can show it when Spotify is idle. */
export interface LibraryStore {
  load(): MediaItem[];
  save(items: MediaItem[]): void;
}

export type LibraryStatus = "empty" | "loading" | "ready" | "needs-device" | "error";

export interface LibraryState {
  status: LibraryStatus;
  items: MediaItem[];
  error: string | null;
}

export interface Library {
  get(): LibraryState;
  refresh(player: string, active: boolean): Promise<void>;
}

const PLAYLISTS = { id: "current_user_playlists", type: "spotify://current_user_playlists" };
const STALE_MS = 10 * 60 * 1000;

/**
 * Loads the user's playlists through Home Assistant. Spotify only lets us browse while a device is
 * active, so when idle we show the last copy we saved, or ask the user to start Spotify once.
 */
export function createLibrary(browser: MediaBrowser, store: LibraryStore, clock: () => number = Date.now): Library {
  let items = store.load();
  let status: LibraryStatus = items.length > 0 ? "ready" : "empty";
  let error: string | null = null;
  let fetchedAt = 0;

  async function fetchPlaylists(player: string): Promise<void> {
    status = "loading";
    try {
      const found = await browser.browse(player, PLAYLISTS.id, PLAYLISTS.type);
      items = found.filter((item) => item.canPlay);
      store.save(items);
      fetchedAt = clock();
      status = "ready";
      error = null;
    } catch (reason) {
      status = items.length > 0 ? "ready" : "error";
      error = reason instanceof Error ? reason.message : String(reason);
    }
  }

  return {
    get: () => ({ status, items, error }),
    async refresh(player, active) {
      if (status === "loading") return;
      if (!active) {
        if (items.length === 0) status = "needs-device";
        return;
      }
      if (items.length === 0 || clock() - fetchedAt > STALE_MS) await fetchPlaylists(player);
    },
  };
}
