import { describe, expect, it } from "vitest";
import { factsSentence, type MusicInfo } from "./musicInfo";

const info: MusicInfo = { releaseYear: 1996, artistFrom: "United Kingdom", artistCity: "West Midlands", artistKind: "group", artistYear: 1988, genres: ["alternative rock", "britpop"] };

describe("factsSentence", () => {
  it("says when it came out, who the artist is and the genres", () => {
    expect(factsSentence("One To Another", "The Charlatans", info)).toBe(
      "One To Another was first released in 1996. The Charlatans formed in 1988 in West Midlands, United Kingdom. Genres: alternative rock, britpop.",
    );
  });

  it("says born for a solo artist and uses only the main artist", () => {
    const solo = { ...info, artistKind: "solo artist", artistYear: 1977, artistCity: "Bedale" };
    expect(factsSentence("Jacques Your Body", "Les Rythmes Digitales, Guest", solo)).toContain("Les Rythmes Digitales was born in 1977 in Bedale, United Kingdom.");
  });

  it("leaves out what is unknown", () => {
    const sparse: MusicInfo = { releaseYear: null, artistFrom: "United States", artistCity: null, artistKind: "group", artistYear: null, genres: [] };
    expect(factsSentence("X", "Y", sparse)).toBe("Y are from United States.");
  });

  it("says nothing when nothing is known", () => {
    expect(factsSentence("X", "Y", { releaseYear: null, artistFrom: null, artistCity: null, artistKind: null, artistYear: null, genres: [] })).toBeNull();
    expect(factsSentence("X", "Y", null)).toBeNull();
  });
});
