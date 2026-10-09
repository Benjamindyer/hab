import { describe, expect, it } from "vitest";
import type { MusicView } from "./music";
import { musicFacts, musicKey, musicNote, partOfDay, type MusicExtras } from "./musicNote";

const base: MusicView = {
  mode: "idle", title: null, artist: null, album: null, art: null, position: null, duration: null,
  volume: null, source: null, sources: [], favourites: [],
};
const plain = { humour: 0, honesty: 0 };
const calm: MusicExtras = { partOfDay: "afternoon", sameArtistInARow: 1 };

describe("musicNote", () => {
  it("says nothing is playing", () => {
    expect(musicNote(base, plain, calm)).toBe("Nothing is playing.");
  });

  it("explains why when honesty is high", () => {
    expect(musicNote(base, { humour: 0, honesty: 100 }, calm)).toContain("until a speaker is chosen");
  });

  it("names the track and the room", () => {
    const view = { ...base, mode: "playing" as const, title: "Slow Orbit", artist: "Cassini Hours", source: "kitchen" };
    expect(musicNote(view, plain, calm)).toBe("Playing Slow Orbit by Cassini Hours on kitchen.");
  });

  it("says nothing extra when there is nothing to point out", () => {
    const playing = { ...base, mode: "playing" as const, title: "X", artist: "Blur" };
    expect(musicNote(playing, { humour: 100, honesty: 100 }, calm)).toBe("Playing X by Blur.");
  });

  it("points out the same artist again and again, only when honesty is high", () => {
    const playing = { ...base, mode: "playing" as const, title: "X", artist: "Blur, Guest" };
    const repeated = { ...calm, sameArtistInARow: 3 };
    expect(musicNote(playing, { humour: 0, honesty: 100 }, repeated)).toContain("third track in a row by Blur.");
    expect(musicNote(playing, { humour: 0, honesty: 0 }, repeated)).toBe("Playing X by Blur, Guest.");
  });

  it("does not remark on a paused track", () => {
    const paused = { ...base, mode: "paused" as const, title: "X", artist: "Blur" };
    expect(musicNote(paused, { humour: 100, honesty: 100 }, { ...calm, sameArtistInARow: 5 })).toBe("Paused X by Blur.");
  });

  it("mentions the lateness when honest and funny", () => {
    const playing = { ...base, mode: "playing" as const, title: "X", artist: "Blur" };
    expect(musicNote(playing, { humour: 100, honesty: 100 }, { ...calm, partOfDay: "late night" })).toContain("very late");
  });

  it("reports a missing player", () => {
    expect(musicNote({ ...base, mode: "unavailable" }, plain, calm)).toContain("not connected");
  });
});

describe("music facts and key", () => {
  const view = { ...base, mode: "playing" as const, title: "Ripcord", artist: "Radiohead", source: "kitchen" };

  it("lists only the track, artist, speaker and state", () => {
    expect(musicFacts(view, calm)).toEqual({
      track: "Ripcord",
      artist: "Radiohead",
      album: null,
      speaker: "kitchen",
      state: "playing",
      partOfDay: "afternoon",
      sameArtistInARow: 1,
    });
  });

  it("changes with the track and not with the position", () => {
    expect(musicKey(view, calm)).toBe(musicKey({ ...view, position: 99 }, calm));
    expect(musicKey(view, calm)).not.toBe(musicKey({ ...view, title: "Other" }, calm));
  });
});

describe("partOfDay", () => {
  it("names the time of day", () => {
    expect(partOfDay(2)).toBe("late night");
    expect(partOfDay(7)).toBe("early morning");
    expect(partOfDay(10)).toBe("morning");
    expect(partOfDay(15)).toBe("afternoon");
    expect(partOfDay(20)).toBe("evening");
    expect(partOfDay(23)).toBe("late night");
  });
});
