import { describe, expect, it } from "vitest";
import type { MusicInfo, MusicInfoSource } from "../state/musicInfo";
import { createInfoLookup, type InfoStore } from "./infoLookup";

const info: MusicInfo = { releaseYear: 1994, artistFrom: "United Kingdom", artistCity: "Glasgow", artistKind: "group", artistYear: 1982, genres: [] };

function memoryStore(initial: Record<string, MusicInfo | null> = {}): InfoStore & { saved: Record<string, MusicInfo | null> } {
  const holder = { saved: initial };
  return { load: () => holder.saved, save: (e) => { holder.saved = e; }, get saved() { return holder.saved; } };
}

function source(result: MusicInfo | null | Error): MusicInfoSource & { calls: number } {
  const s = { calls: 0, async lookup() { s.calls += 1; if (result instanceof Error) throw result; return result; } };
  return s;
}

describe("createInfoLookup", () => {
  it("says pending, then gives the answer once it arrives", async () => {
    const lookup = createInfoLookup(source(info), memoryStore());
    expect(lookup.get("Rocks", "Primal Scream")).toEqual({ status: "pending" });
    await lookup.settled();
    expect(lookup.get("Rocks", "Primal Scream")).toEqual({ status: "ready", info });
  });

  it("asks once for the same track, however it is written", async () => {
    const src = source(info);
    const lookup = createInfoLookup(src, memoryStore());
    lookup.get("Rocks - 2013 Remaster", "Primal Scream, Guest");
    lookup.get("Rocks", "primal scream");
    await lookup.settled();
    expect(src.calls).toBe(1);
  });

  it("keeps a 'nothing found' answer and does not ask again", async () => {
    const src = source(null);
    const lookup = createInfoLookup(src, memoryStore());
    lookup.get("X", "Y");
    await lookup.settled();
    expect(lookup.get("X", "Y")).toEqual({ status: "ready", info: null });
    expect(src.calls).toBe(1);
  });

  it("saves answers and uses saved ones", async () => {
    const store = memoryStore();
    const first = createInfoLookup(source(info), store);
    first.get("Rocks", "Primal Scream");
    await first.settled();
    expect(Object.keys(store.saved)).toEqual(["primal scream|rocks"]);
    const second = createInfoLookup(source(null), store);
    expect(second.get("Rocks", "Primal Scream")).toEqual({ status: "ready", info });
  });

  it("gives up quietly on a failure, and tries again after ten minutes", async () => {
    let now = 0;
    const src = source(new Error("offline"));
    const lookup = createInfoLookup(src, memoryStore(), () => now);
    lookup.get("X", "Y");
    await lookup.settled();
    expect(lookup.get("X", "Y")).toEqual({ status: "ready", info: null });
    expect(src.calls).toBe(1);
    now = 11 * 60 * 1000;
    expect(lookup.get("X", "Y")).toEqual({ status: "pending" });
    await lookup.settled();
    expect(src.calls).toBe(2);
  });

  it("has nothing to look up without a title or artist", () => {
    expect(createInfoLookup(source(info), memoryStore()).get(null, "A")).toEqual({ status: "ready", info: null });
  });
});
