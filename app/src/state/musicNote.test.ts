import { describe, expect, it } from "vitest";
import type { MusicView } from "./music";
import { musicFacts, musicKey, musicNote } from "./musicNote";

const base: MusicView = {
  mode: "idle", title: null, artist: null, art: null, position: null, duration: null,
  volume: null, source: null, sources: [], favourites: [],
};
const plain = { humour: 0, honesty: 0 };

describe("musicNote", () => {
  it("says nothing is playing", () => {
    expect(musicNote(base, plain)).toBe("Nothing is playing.");
  });

  it("explains why when honesty is high", () => {
    expect(musicNote(base, { humour: 0, honesty: 100 })).toContain("until a speaker is chosen");
  });

  it("names the track and the room", () => {
    const view = { ...base, mode: "playing" as const, title: "Slow Orbit", artist: "Cassini Hours", source: "kitchen" };
    expect(musicNote(view, plain)).toBe("Playing Slow Orbit by Cassini Hours on kitchen.");
  });

  it("only remarks on music that is playing", () => {
    const playing = { ...base, mode: "playing" as const, title: "X" };
    expect(musicNote(playing, { humour: 100, honesty: 0 })).toContain("Bold choice.");
    expect(musicNote({ ...playing, mode: "paused" }, { humour: 100, honesty: 0 })).not.toContain("Bold");
  });

  it("reports a missing player", () => {
    expect(musicNote({ ...base, mode: "unavailable" }, plain)).toContain("not connected");
  });
});

describe("music facts and key", () => {
  const view = { ...base, mode: "playing" as const, title: "Ripcord", artist: "Radiohead", source: "kitchen" };

  it("lists only the track, artist, speaker and state", () => {
    expect(musicFacts(view)).toEqual({ track: "Ripcord", artist: "Radiohead", speaker: "kitchen", state: "playing" });
  });

  it("changes with the track and not with the position", () => {
    expect(musicKey(view)).toBe(musicKey({ ...view, position: 99 }));
    expect(musicKey(view)).not.toBe(musicKey({ ...view, title: "Other" }));
  });
});
