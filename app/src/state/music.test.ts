import { describe, expect, it } from "vitest";
import { fakeStore } from "./testing";
import type { MusicConfig } from "../config/parseMusic";
import { buildMusicView, modeFor, resolveArt, targetRoom } from "./music";

const config: MusicConfig = { player: "media_player.spotify", favourites: [{ name: "Morning", uri: "spotify:playlist:a" }] };
const now = new Date("2026-10-09T12:00:30Z");

describe("modeFor", () => {
  it("maps player states", () => {
    expect(modeFor("playing")).toBe("playing");
    expect(modeFor("buffering")).toBe("playing");
    expect(modeFor("paused")).toBe("paused");
    expect(modeFor("idle")).toBe("idle");
    expect(modeFor("off")).toBe("idle");
    expect(modeFor("unavailable")).toBe("unavailable");
    expect(modeFor(undefined)).toBe("unavailable");
  });
});

describe("resolveArt", () => {
  it("puts the HA address in front of Home Assistant paths", () => {
    expect(resolveArt("/api/x?token=1", "http://ha/")).toBe("http://ha/api/x?token=1");
  });
  it("leaves full addresses alone", () => {
    expect(resolveArt("https://i.scdn.co/a.jpg", "http://ha")).toBe("https://i.scdn.co/a.jpg");
    expect(resolveArt(null, "http://ha")).toBeNull();
  });
});

describe("buildMusicView", () => {
  it("shows the idle player with its devices and the favourites", () => {
    const store = fakeStore([{ id: "media_player.spotify", state: "idle", attributes: { source_list: ["kitchen", "Bedroom"] } }]);
    const view = buildMusicView(store, config, now, "http://ha");
    expect(view.mode).toBe("idle");
    expect(view.sources).toEqual(["kitchen", "Bedroom"]);
    expect(view.favourites).toHaveLength(1);
  });

  it("moves the position forward while playing", () => {
    const store = fakeStore([{
      id: "media_player.spotify",
      state: "playing",
      attributes: { media_position: 60, media_duration: 200, media_position_updated_at: "2026-10-09T12:00:00Z", media_title: "Slow Orbit" },
    }]);
    const view = buildMusicView(store, config, now, "http://ha");
    expect(view.position).toBe(90);
    expect(view.title).toBe("Slow Orbit");
  });

  it("holds the position while paused and never passes the end", () => {
    const attributes = { media_position: 190, media_duration: 200, media_position_updated_at: "2026-10-09T12:00:00Z" };
    const paused = buildMusicView(fakeStore([{ id: "media_player.spotify", state: "paused", attributes }]), config, now, "http://ha");
    const playing = buildMusicView(fakeStore([{ id: "media_player.spotify", state: "playing", attributes }]), config, now, "http://ha");
    expect(paused.position).toBe(190);
    expect(playing.position).toBe(200);
  });

  it("is unavailable when the player is missing", () => {
    expect(buildMusicView(fakeStore([]), config, now, "http://ha").mode).toBe("unavailable");
  });
});

describe("targetRoom", () => {
  const base = buildMusicView(fakeStore([{ id: "media_player.spotify", state: "idle", attributes: { source_list: ["Bedroom"] } }]), config, now, "http://ha");

  it("prefers where it is playing, then the last choice, then the default, then the first device", () => {
    expect(targetRoom({ ...base, source: "kitchen" }, "Lounge", { ...config, room: "x" })).toBe("kitchen");
    expect(targetRoom(base, "Lounge", { ...config, room: "x" })).toBe("Lounge");
    expect(targetRoom(base, null, { ...config, room: "x" })).toBe("x");
    expect(targetRoom(base, null, config)).toBe("Bedroom");
  });
});

describe("buildMusicView sources", () => {
  it("lists the device that is playing even when Spotify has not listed it", () => {
    const store = fakeStore([{ id: "media_player.spotify", state: "playing", attributes: { source: "iPhone", source_list: ["kitchen"] } }]);
    expect(buildMusicView(store, config, now, "http://ha").sources).toEqual(["iPhone", "kitchen"]);
  });
});
