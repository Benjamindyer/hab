import { describe, expect, it } from "vitest";
import { createLibrary, type LibraryStore, type MediaBrowser, type MediaItem } from "./library";

const item = (id: string, canPlay = true): MediaItem => ({ id, title: id, type: "spotify://playlist", thumbnail: null, canPlay });

function memoryStore(initial: MediaItem[] = []): LibraryStore & { saved: MediaItem[] } {
  const holder = { saved: initial };
  return { load: () => holder.saved, save: (items) => { holder.saved = items; }, get saved() { return holder.saved; } };
}

const browserOf = (items: MediaItem[]): MediaBrowser & { calls: number } => {
  const b = { calls: 0, browse: async () => { b.calls += 1; return items; } };
  return b;
};

describe("library", () => {
  it("loads playlists when a device is active, keeps the playable ones and saves a copy", async () => {
    const store = memoryStore();
    const library = createLibrary(browserOf([item("a"), item("b", false)]), store);
    await library.refresh("media_player.s", true);
    expect(library.get().status).toBe("ready");
    expect(library.get().items.map((i) => i.id)).toEqual(["a"]);
    expect(store.saved).toHaveLength(1);
  });

  it("asks for a device when idle with nothing saved", async () => {
    const browser = browserOf([item("a")]);
    const library = createLibrary(browser, memoryStore());
    await library.refresh("media_player.s", false);
    expect(library.get().status).toBe("needs-device");
    expect(browser.calls).toBe(0);
  });

  it("shows the saved copy when idle", async () => {
    const library = createLibrary(browserOf([]), memoryStore([item("saved")]));
    await library.refresh("media_player.s", false);
    expect(library.get().status).toBe("ready");
    expect(library.get().items[0]?.id).toBe("saved");
  });

  it("does not ask again until the copy is stale", async () => {
    let now = 0;
    const browser = browserOf([item("a")]);
    const library = createLibrary(browser, memoryStore(), () => now);
    await library.refresh("p", true);
    now = 60_000;
    await library.refresh("p", true);
    expect(browser.calls).toBe(1);
    now = 11 * 60_000;
    await library.refresh("p", true);
    expect(browser.calls).toBe(2);
  });

  it("keeps the saved copy and reports the error when Home Assistant refuses", async () => {
    const failing: MediaBrowser = { browse: async () => { throw new Error("not supported"); } };
    const library = createLibrary(failing, memoryStore([item("saved")]));
    await library.refresh("p", true);
    expect(library.get().status).toBe("ready");
    expect(library.get().error).toBe("not supported");
  });

  it("reports an error when there is nothing saved either", async () => {
    const failing: MediaBrowser = { browse: async () => { throw new Error("boom"); } };
    const library = createLibrary(failing, memoryStore());
    await library.refresh("p", true);
    expect(library.get().status).toBe("error");
  });
});
