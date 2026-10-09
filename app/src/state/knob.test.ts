import { describe, expect, it } from "vitest";
import { levelToDegrees, pointToLevel } from "./knob";

describe("levelToDegrees", () => {
  it("runs from quiet at the bottom left to loud at the bottom right", () => {
    expect(levelToDegrees(0)).toBe(-135);
    expect(levelToDegrees(0.5)).toBe(0);
    expect(levelToDegrees(1)).toBe(135);
  });

  it("stays on the dial", () => {
    expect(levelToDegrees(-1)).toBe(-135);
    expect(levelToDegrees(2)).toBe(135);
  });
});

describe("pointToLevel", () => {
  it("is half way when the touch is straight above the centre", () => {
    expect(pointToLevel(0, -10)).toBeCloseTo(0.5);
  });

  it("goes up as the touch moves clockwise", () => {
    expect(pointToLevel(10, 0)).toBeCloseTo(0.833, 2);
    expect(pointToLevel(-10, 0)).toBeCloseTo(0.167, 2);
  });

  it("goes to the nearer end in the gap at the bottom", () => {
    expect(pointToLevel(3, 10)).toBe(1);
    expect(pointToLevel(-3, 10)).toBe(0);
    expect(pointToLevel(0, 10)).toBe(1);
  });
});
