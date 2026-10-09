import { describe, expect, it } from "vitest";
import { parseConfig } from "./config";
import { fromDraft, toDraft, type Draft } from "./draft";

const full = parseConfig({
  personality: { humour: 60, honesty: 75, name: "Robo" },
  ambient: { room: "Kitchen", weather: "weather.home", climate: "climate.kitchen" },
  music: { player: "media_player.spotify", room: "kitchen", favourites: [{ name: "Morning", uri: "spotify:playlist:abc" }] },
  llm: { personality: "ai_task.model", musicKnowledge: true, musicLookup: true },
  satellite: "assist_satellite.kitchen",
});

describe("draft", () => {
  it("round-trips a full config", () => {
    expect(fromDraft(toDraft(full))).toEqual(full);
  });

  it("leaves out what is not chosen", () => {
    const draft: Draft = { ...toDraft(full), name: "", weather: "", climate: "", player: "", llm: "", musicKnowledge: false, musicLookup: false, satellite: "" };
    const config = fromDraft(draft);
    expect(config.music).toBeUndefined();
    expect(config.llm).toBeUndefined();
    expect(config.satellite).toBeUndefined();
    expect(config.ambient).toEqual({ room: "Kitchen" });
    expect(config.personality.name).toBeUndefined();
  });

  it("turns pasted Spotify share links into uris", () => {
    const draft = { ...toDraft(full), favourites: [{ name: "Chill", link: "https://open.spotify.com/playlist/xyz789?si=q" }] };
    expect(fromDraft(draft).music?.favourites).toEqual([{ name: "Chill", uri: "spotify:playlist:xyz789" }]);
  });

  it("names an unnamed favourite and skips empty rows", () => {
    const draft = { ...toDraft(full), favourites: [{ name: "", link: "spotify:album:abc" }, { name: "", link: "" }] };
    expect(fromDraft(draft).music?.favourites).toEqual([{ name: "Favourite 1", uri: "spotify:album:abc" }]);
  });

  it("explains a favourite that is not a Spotify link", () => {
    const draft = { ...toDraft(full), favourites: [{ name: "Bad", link: "https://example.com" }] };
    expect(() => fromDraft(draft)).toThrow(/"Bad" is not a Spotify link/);
  });

  it("falls back to Home when the room is empty", () => {
    expect(fromDraft({ ...toDraft(full), room: "  " }).ambient.room).toBe("Home");
  });
});
