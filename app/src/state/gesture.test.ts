import { describe, expect, it } from "vitest";
import { classifyGesture } from "./gesture";

describe("classifyGesture", () => {
  it("is a tap for a quick touch that hardly moves", () => {
    expect(classifyGesture(2, -3, 120)).toBe("tap");
  });

  it("is not a tap when held for long or when it moved", () => {
    expect(classifyGesture(0, 0, 900)).toBeNull();
    expect(classifyGesture(30, 0, 100)).not.toBe("tap");
  });

  it("is a swipe left or right for a clear sideways flick", () => {
    expect(classifyGesture(-120, 10, 250)).toBe("swipe-left");
    expect(classifyGesture(120, -10, 250)).toBe("swipe-right");
  });

  it("ignores a short slide, a slow drag and mostly vertical movement", () => {
    expect(classifyGesture(40, 0, 200)).toBeNull();
    expect(classifyGesture(120, 0, 1500)).toBeNull();
    expect(classifyGesture(100, 90, 250)).toBeNull();
  });
});
