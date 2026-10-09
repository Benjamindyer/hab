import { describe, expect, it } from "vitest";
import type { MusicView } from "./music";
import { nowPlayingSummary } from "./nowPlaying";

const view: MusicView = {
  mode: "playing", title: "Rocks", artist: "Primal Scream", album: null, art: "http://x/a.jpg", position: 1, duration: 100,
  volume: 0.5, source: "kitchen", sources: [], favourites: [],
};

describe("nowPlayingSummary", () => {
  it("summarises a track that is playing", () => {
    expect(nowPlayingSummary(view)).toEqual({ title: "Rocks", artist: "Primal Scream", art: "http://x/a.jpg", playing: true });
  });

  it("still shows a paused track, marked as not playing", () => {
    expect(nowPlayingSummary({ ...view, mode: "paused" })?.playing).toBe(false);
  });

  it("is hidden when idle, unavailable or without a title", () => {
    expect(nowPlayingSummary({ ...view, mode: "idle" })).toBeNull();
    expect(nowPlayingSummary({ ...view, mode: "unavailable" })).toBeNull();
    expect(nowPlayingSummary({ ...view, title: null })).toBeNull();
  });
});
