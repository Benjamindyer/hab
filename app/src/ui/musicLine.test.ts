import { describe, expect, it } from "vitest";
import type { Commentary, CommentRequest } from "../state/commentary";
import { createListeningHistory } from "../state/listening";
import type { MusicView } from "../state/music";
import type { MusicInfo, MusicInfoLookup } from "../state/musicInfo";
import { musicLine } from "./musicLine";
import type { SceneContext } from "./scene";

const view: MusicView = {
  mode: "playing", title: "Rocks", artist: "Primal Scream", album: null, art: null, position: 10, duration: 200,
  volume: 0.5, source: "kitchen", sources: [], favourites: [],
};

function contextWith(requests: CommentRequest[], musicInfo: MusicInfoLookup | null = null): SceneContext {
  const commentary: Commentary = {
    line(request) { requests.push(request); return "LINE"; },
    settled: async () => undefined,
  };
  return { now: new Date(2026, 9, 9, 15, 0), config: { personality: { humour: 50, honesty: 50 } }, commentary, musicInfo } as unknown as SceneContext;
}

describe("musicLine", () => {
  it("asks for the same line on every redraw, so the model's answer is kept", () => {
    const requests: CommentRequest[] = [];
    const history = createListeningHistory();
    const context = contextWith(requests);
    musicLine(context, view, history);
    musicLine(context, view, history);
    musicLine(context, view, history);
    expect(new Set(requests.map((r) => r.key)).size).toBe(1);
  });

  it("asks for a new line when the track changes", () => {
    const requests: CommentRequest[] = [];
    const history = createListeningHistory();
    const context = contextWith(requests);
    musicLine(context, view, history);
    musicLine(context, { ...view, title: "Other" }, history);
    expect(new Set(requests.map((r) => r.key)).size).toBe(2);
  });

  it("shows the fixed line, and asks for nothing, when nothing plays", () => {
    const requests: CommentRequest[] = [];
    const result = musicLine(contextWith(requests), { ...view, mode: "idle" }, createListeningHistory());
    expect(result.text).toContain("Nothing is playing");
    expect(requests).toHaveLength(0);
  });

  it("shows the database facts in plain words, and credits them", () => {
    const info: MusicInfo = { releaseYear: 1994, artistFrom: "United Kingdom", artistCity: "Glasgow", artistKind: "group", artistYear: 1982, genres: [] };
    const lookup: MusicInfoLookup = { get: () => ({ status: "ready", info }) };
    const requests: CommentRequest[] = [];
    const result = musicLine(contextWith(requests, lookup), view, createListeningHistory());
    expect(result.fromDatabase).toBe(true);
    expect(result.text).toContain("Rocks was first released in 1994.");
    expect(requests).toHaveLength(0);
  });

  it("does not ask the model while facts are being fetched or when there are none", () => {
    const requests: CommentRequest[] = [];
    const pending = musicLine(contextWith(requests, { get: () => ({ status: "pending" }) }), view, createListeningHistory());
    const none = musicLine(contextWith(requests, { get: () => ({ status: "ready", info: null }) }), view, createListeningHistory());
    expect(requests).toHaveLength(0);
    expect(pending.text).toContain("Playing Rocks");
    expect(none.fromDatabase).toBe(false);
  });
});
