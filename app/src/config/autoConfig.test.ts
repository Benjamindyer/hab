import { describe, expect, it } from "vitest";
import type { Entity } from "../state/entities";
import { autoConfig } from "./autoConfig";

const entity = (id: string): Entity => ({ id, state: "on", attributes: {} });

describe("autoConfig", () => {
  it("picks the first weather, climate, Spotify player and voice satellite it finds", () => {
    const config = autoConfig([
      entity("light.hall"),
      entity("weather.home"),
      entity("weather.other"),
      entity("climate.kitchen"),
      entity("media_player.tv"),
      entity("media_player.spotify_ben"),
      entity("assist_satellite.kitchen"),
    ]);
    expect(config.ambient).toEqual({ room: "Home", weather: "weather.home", climate: "climate.kitchen" });
    expect(config.music?.player).toBe("media_player.spotify_ben");
    expect(config.satellite).toBe("assist_satellite.kitchen");
  });

  it("leaves out what Home Assistant does not have", () => {
    const config = autoConfig([entity("light.hall")]);
    expect(config.ambient).toEqual({ room: "Home" });
    expect(config.music).toBeUndefined();
    expect(config.satellite).toBeUndefined();
  });

  it("never turns on an LLM by itself", () => {
    expect(autoConfig([entity("ai_task.model")]).llm).toBeUndefined();
  });
});
