import { describe, expect, it } from "vitest";
import { parseConfig } from "./config";

const valid = {
  personality: { humour: 60, honesty: 75 },
  ambient: { room: "Kitchen", weather: "weather.home", climate: "climate.kitchen" },
  satellite: "assist_satellite.kitchen",
};

describe("parseConfig", () => {
  it("accepts a complete config", () => {
    expect(parseConfig(valid)).toEqual(valid);
  });

  it("makes entities optional", () => {
    const config = parseConfig({ personality: valid.personality, ambient: { room: "Hall" } });
    expect(config.ambient).toEqual({ room: "Hall" });
    expect(config.satellite).toBeUndefined();
  });

  it("rejects dials outside 0 to 100", () => {
    expect(() => parseConfig({ ...valid, personality: { humour: 120, honesty: 5 } })).toThrow(/0 to 100/);
  });

  it("rejects a missing room name", () => {
    expect(() => parseConfig({ ...valid, ambient: {} })).toThrow(/room/);
  });

  it("rejects something that is not an object", () => {
    expect(() => parseConfig("nope")).toThrow(/JSON object/);
  });
});

describe("parseConfig music", () => {
  it("accepts a music section with favourites", () => {
    const config = parseConfig({
      ...valid,
      music: { player: "media_player.spotify", room: "kitchen", favourites: [{ name: "Morning", uri: "spotify:playlist:abc" }] },
    });
    expect(config.music?.favourites).toEqual([{ name: "Morning", uri: "spotify:playlist:abc" }]);
    expect(config.music?.room).toBe("kitchen");
  });

  it("leaves music out when not configured", () => {
    expect(parseConfig(valid).music).toBeUndefined();
  });

  it("rejects a favourite without a uri", () => {
    expect(() => parseConfig({ ...valid, music: { player: "media_player.s", favourites: [{ name: "x" }] } })).toThrow(/uri/);
  });
});

describe("parseConfig llm and name", () => {
  it("accepts an AI Task entity and a persona name", () => {
    const config = parseConfig({ ...valid, personality: { humour: 60, honesty: 75, name: "Robo" }, llm: { personality: "ai_task.model" } });
    expect(config.llm?.personality).toBe("ai_task.model");
    expect(config.personality.name).toBe("Robo");
  });

  it("leaves the llm out when not configured", () => {
    expect(parseConfig(valid).llm).toBeUndefined();
  });

  it("rejects an entity that is not an AI Task", () => {
    expect(() => parseConfig({ ...valid, llm: { personality: "conversation.home_assistant" } })).toThrow(/ai_task/);
  });
});

describe("parseConfig haUrl", () => {
  it("accepts an address for Home Assistant", () => {
    expect(parseConfig({ ...valid, haUrl: "http://homeassistant.local:8123" }).haUrl).toBe("http://homeassistant.local:8123");
  });

  it("leaves it out when HAB is served by Home Assistant", () => {
    expect(parseConfig(valid).haUrl).toBeUndefined();
  });
});
