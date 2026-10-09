import { describe, expect, it } from "vitest";
import { decadeOf, infoFacts, readoutsFor, type MusicInfo } from "./musicInfo";

const info: MusicInfo = { releaseYear: 1994, artistFrom: "United Kingdom", artistCity: "Glasgow", artistKind: "group", artistYear: 1982, genres: ["alternative rock", "electronic"] };

describe("infoFacts", () => {
  it("lists what the database knows, with the decade in words", () => {
    expect(infoFacts(info)).toEqual({
      firstReleasedYear: 1994,
      releasedInTheDecade: "nineties",
      artistFrom: "United Kingdom",
      artistFromCity: "Glasgow",
      artistKind: "group",
      artistFormedYear: 1982,
      genres: "alternative rock, electronic",
    });
  });

  it("calls the start year a birth year for a solo artist", () => {
    expect(infoFacts({ ...info, artistKind: "solo artist" })).toHaveProperty("artistBornYear", 1982);
  });

  it("leaves out what is unknown", () => {
    expect(infoFacts({ ...info, releaseYear: null, genres: [], artistCity: null })).toEqual({
      artistFrom: "United Kingdom",
      artistKind: "group",
      artistFormedYear: 1982,
    });
  });

  it("gives nothing when there is no information", () => {
    expect(infoFacts(null)).toEqual({});
  });
});

describe("decadeOf", () => {
  it("names the decade", () => {
    expect(decadeOf(1994)).toBe("nineties");
    expect(decadeOf(1969)).toBe("sixties");
    expect(decadeOf(2003)).toBe("two thousands");
    expect(decadeOf(1850)).toBeNull();
  });
});

describe("readoutsFor", () => {
  it("lists what is known as label and value pairs", () => {
    expect(readoutsFor(info)).toEqual([
      { label: "Released", value: "1994" },
      { label: "Formed", value: "1982" },
      { label: "From", value: "Glasgow, United Kingdom" },
      { label: "Genre", value: "alternative rock, electronic" },
    ]);
  });

  it("says Born for a solo artist and skips what is unknown", () => {
    expect(readoutsFor({ ...info, artistKind: "solo artist", releaseYear: null, genres: [], artistCity: null })).toEqual([
      { label: "Born", value: "1982" },
      { label: "From", value: "United Kingdom" },
    ]);
  });

  it("gives nothing without information", () => {
    expect(readoutsFor(null)).toEqual([]);
  });
});
