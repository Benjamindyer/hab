import { describe, expect, it } from "vitest";
import { createListeningHistory } from "./listening";

describe("listening history", () => {
  it("counts nothing before anything plays", () => {
    expect(createListeningHistory().sameArtistInARow()).toBe(0);
  });

  it("counts tracks by the same artist in a row", () => {
    const history = createListeningHistory();
    history.record("One", "Radiohead");
    history.record("Two", "Radiohead");
    history.record("Three", "Radiohead");
    expect(history.sameArtistInARow()).toBe(3);
  });

  it("ignores the same track reported again", () => {
    const history = createListeningHistory();
    history.record("One", "Radiohead");
    history.record("One", "Radiohead");
    expect(history.sameArtistInARow()).toBe(1);
  });

  it("starts again when the artist changes", () => {
    const history = createListeningHistory();
    history.record("One", "Radiohead");
    history.record("Two", "Radiohead");
    history.record("Three", "Blur");
    expect(history.sameArtistInARow()).toBe(1);
  });

  it("counts a guest track under the main artist", () => {
    const history = createListeningHistory();
    history.record("One", "Groove Armada");
    history.record("Two", "Groove Armada, Gramma Funk");
    expect(history.sameArtistInARow()).toBe(2);
  });

  it("ignores tracks with no title or artist", () => {
    const history = createListeningHistory();
    history.record(null, "Radiohead");
    history.record("One", null);
    expect(history.sameArtistInARow()).toBe(0);
  });
});
