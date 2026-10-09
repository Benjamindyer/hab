import { describe, expect, it } from "vitest";
import { compassPoint } from "./compass";

describe("compassPoint", () => {
  it("names the main points", () => {
    expect(compassPoint(0)).toBe("N");
    expect(compassPoint(90)).toBe("E");
    expect(compassPoint(180)).toBe("S");
    expect(compassPoint(270)).toBe("W");
  });

  it("names the points between", () => {
    expect(compassPoint(254.2)).toBe("WSW");
    expect(compassPoint(281.6)).toBe("WNW");
    expect(compassPoint(45)).toBe("NE");
  });

  it("wraps around", () => {
    expect(compassPoint(359)).toBe("N");
    expect(compassPoint(-90)).toBe("W");
    expect(compassPoint(720)).toBe("N");
  });
});
