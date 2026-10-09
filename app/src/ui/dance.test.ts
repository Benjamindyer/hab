import { describe, expect, it } from "vitest";
import { dancePose, tempoFor } from "./dance";

describe("tempoFor", () => {
  it("is the same for the same track", () => {
    expect(tempoFor("Ripcord")).toBe(tempoFor("Ripcord"));
  });

  it("sways at half the beat of a 84 to 132 bpm track", () => {
    for (const seed of ["a", "Ripcord", "Yesterday Went Too Soon", "", "x".repeat(40)]) {
      const bpm = tempoFor(seed) * 120;
      expect(bpm).toBeGreaterThanOrEqual(84);
      expect(bpm).toBeLessThanOrEqual(132);
    }
  });
});

describe("dancePose", () => {
  it("keeps every movement small", () => {
    for (let t = 0; t < 10; t += 0.13) {
      for (let i = 0; i < 4; i++) {
        const pose = dancePose("Ripcord", t, i);
        expect(pose.height).toBeGreaterThanOrEqual(0.94);
        expect(pose.height).toBeLessThanOrEqual(0.99);
        expect(Math.abs(pose.lift)).toBeLessThanOrEqual(0.7);
        expect(Math.abs(pose.tilt)).toBeLessThanOrEqual(0.45);
      }
    }
  });

  it("moves the bars out of step with each other", () => {
    expect(dancePose("x", 1, 0).lift).not.toBe(dancePose("x", 1, 1).lift);
  });
});
