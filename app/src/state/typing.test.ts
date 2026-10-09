import { describe, expect, it } from "vitest";
import { typingDuration, visibleLength } from "./typing";

describe("visibleLength", () => {
  it("starts with the first character and grows with time", () => {
    expect(visibleLength(100, 0, 20)).toBe(1);
    expect(visibleLength(100, 200, 20)).toBe(11);
  });

  it("never passes the end", () => {
    expect(visibleLength(10, 10_000, 20)).toBe(10);
  });

  it("copes with empty text and odd times", () => {
    expect(visibleLength(0, 500, 20)).toBe(0);
    expect(visibleLength(10, -50, 20)).toBe(1);
  });
});

describe("typingDuration", () => {
  it("is the length times the pace, up to a cap", () => {
    expect(typingDuration(50, 20, 2000)).toBe(1000);
    expect(typingDuration(500, 20, 2000)).toBe(2000);
  });
});
