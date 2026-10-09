import { describe, expect, it } from "vitest";
import { cleanTitle, mainArtist, pickOriginal, toInfo, type Recording } from "./parse";

interface RecOptions {
  score?: number;
  artist?: string;
  id?: string;
}

const rec = (title: string, date: string | undefined, { score = 100, artist = "Primal Scream", id = "a1" }: RecOptions = {}): Recording => ({
  title,
  score,
  ...(date && { "first-release-date": date }),
  "artist-credit": [{ name: artist, artist: { id } }],
});

describe("cleanTitle and mainArtist", () => {
  it("strips edits and remasters", () => {
    expect(cleanTitle("Rocks - 2013 Remaster")).toBe("Rocks");
    expect(cleanTitle("Jacques Your Body (Make Me Sweat)")).toBe("Jacques Your Body");
    expect(cleanTitle("Jayou")).toBe("Jayou");
  });

  it("takes the first artist", () => {
    expect(mainArtist("Groove Armada, Gramma Funk")).toBe("Groove Armada");
  });
});

describe("pickOriginal", () => {
  it("chooses the earliest release of a close match", () => {
    const found = pickOriginal([rec("Rocks", "2001-05-01"), rec("Rocks", "1994-03-14"), rec("Rocks", "1999")], "Rocks", "Primal Scream");
    expect(found?.recording["first-release-date"]).toBe("1994-03-14");
    expect(found?.artistId).toBe("a1");
  });

  it("ignores weak matches, other titles, other artists and undated recordings", () => {
    const list = [rec("Rocks", "1990", { score: 80 }), rec("Rock", "1991"), rec("Rocks", "1992", { artist: "Someone Else" }), rec("Rocks", undefined)];
    expect(pickOriginal(list, "Rocks", "Primal Scream")).toBeNull();
  });

  it("matches names without minding case", () => {
    expect(pickOriginal([rec("ROCKS", "1994", { artist: "primal scream" })], "Rocks", "Primal Scream")).not.toBeNull();
  });
});

describe("toInfo", () => {
  it("builds the facts for a group", () => {
    const info = toInfo(rec("Rocks", "1994-03-14"), {
      type: "Group",
      area: { name: "United Kingdom" },
      "begin-area": { name: "Glasgow" },
      "life-span": { begin: "1982" },
      genres: [{ name: "electronic", count: 1 }, { name: "alternative rock", count: 5 }],
    });
    expect(info).toEqual({ releaseYear: 1994, artistFrom: "United Kingdom", artistCity: "Glasgow", artistKind: "group", artistYear: 1982, genres: ["alternative rock", "electronic"] });
  });

  it("calls a person a solo artist and reads a full date", () => {
    const info = toInfo(rec("X", "1997-12-11"), { type: "Person", "life-span": { begin: "1977-09-09" } });
    expect(info.artistKind).toBe("solo artist");
    expect(info.artistYear).toBe(1977);
  });

  it("copes with an empty artist record", () => {
    expect(toInfo(rec("X", undefined), {})).toEqual({ releaseYear: null, artistFrom: null, artistCity: null, artistKind: null, artistYear: null, genres: [] });
  });
});
