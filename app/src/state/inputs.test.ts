import { describe, expect, it } from "vitest";
import { fakeStore } from "./testing";
import type { EntityStore } from "./entities";
import { deriveInputs, musicSeed, toVoiceState } from "./inputs";


describe("toVoiceState", () => {
  it("accepts the four satellite states", () => {
    expect(toVoiceState("listening")).toBe("listening");
    expect(toVoiceState("responding")).toBe("responding");
  });

  it("treats anything else as idle", () => {
    expect(toVoiceState("unavailable")).toBe("idle");
    expect(toVoiceState(undefined)).toBe("idle");
  });
});

describe("deriveInputs", () => {
  it("is idle when no satellite is configured", () => {
    expect(deriveInputs(fakeStore([]), undefined, null).voice).toBe("idle");
  });

  it("follows the configured satellite", () => {
    const store = fakeStore([{ id: "assist_satellite.kitchen", state: "processing", attributes: {} }]);
    expect(deriveInputs(store, "assist_satellite.kitchen", "power").voice).toBe("processing");
  });
});

describe("musicSeed", () => {
  const playing = (attributes: Record<string, unknown>): EntityStore =>
    fakeStore([{ id: "media_player.s", state: "playing", attributes }]);

  it("uses the track title while playing", () => {
    expect(musicSeed(playing({ media_title: "Ripcord" }), "media_player.s")).toBe("Ripcord");
  });

  it("falls back to the player when there is no title", () => {
    expect(musicSeed(playing({}), "media_player.s")).toBe("media_player.s");
  });

  it("is null when paused, idle or not configured", () => {
    const paused = fakeStore([{ id: "media_player.s", state: "paused", attributes: {} }]);
    expect(musicSeed(paused, "media_player.s")).toBeNull();
    expect(musicSeed(playing({}), undefined)).toBeNull();
  });
});
