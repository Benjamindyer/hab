import { describe, expect, it } from "vitest";
import type { MusicView } from "./music";
import { chooseRoom, playFavourite, playPause, setVolume, skip, uriType } from "./musicActions";

const P = "media_player.spotify";
const view = (over: Partial<MusicView>): MusicView => ({
  mode: "idle", title: null, artist: null, album: null, art: null, position: null, duration: null,
  volume: null, source: null, sources: [], favourites: [], ...over,
});
const fav = { name: "Morning", uri: "spotify:playlist:abc" };

describe("music actions", () => {
  it("finds the content type in a Spotify uri", () => {
    expect(uriType("spotify:playlist:abc")).toBe("playlist");
    expect(uriType("spotify:album:xyz")).toBe("album");
    expect(uriType("something else")).toBe("music");
  });

  it("toggles play and pause", () => {
    expect(playPause(P, view({ mode: "playing" }))[0]?.service).toBe("media_pause");
    expect(playPause(P, view({ mode: "paused" }))[0]?.service).toBe("media_play");
  });

  it("skips and keeps volume between 0 and 1", () => {
    expect(skip(P, "next")[0]?.service).toBe("media_next_track");
    expect(skip(P, "previous")[0]?.service).toBe("media_previous_track");
    expect(setVolume(P, 1.7)[0]?.data).toEqual({ volume_level: 1 });
    expect(setVolume(P, -1)[0]?.data).toEqual({ volume_level: 0 });
  });

  it("moves playback to a room", () => {
    expect(chooseRoom(P, "kitchen")[0]?.data).toEqual({ source: "kitchen" });
  });

  it("wakes the device first when nothing is playing", () => {
    const plan = playFavourite(P, view({ mode: "idle" }), fav, "kitchen");
    expect(plan.map((c) => c.service)).toEqual(["select_source", "play_media"]);
    expect(plan[0]?.waitAfterMs).toBeGreaterThan(0);
    expect(plan[1]?.data).toEqual({ media_content_id: fav.uri, media_content_type: "playlist" });
  });

  it("goes straight to play when already on the right device", () => {
    const plan = playFavourite(P, view({ mode: "playing", source: "kitchen" }), fav, "kitchen");
    expect(plan.map((c) => c.service)).toEqual(["play_media"]);
  });

  it("switches device when playing somewhere else", () => {
    const plan = playFavourite(P, view({ mode: "playing", source: "Bedroom" }), fav, "kitchen");
    expect(plan).toHaveLength(2);
  });
});
