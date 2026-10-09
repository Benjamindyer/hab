import { describe, expect, it } from "vitest";
import type { PowerView } from "./power";
import { powerNote } from "./powerNote";

const base: PowerView = {
  grid: 0.36, solar: 0.05, car: 0, house: 0.41, carPlugged: true, carCharge: 90, rate: 29, nextRate: 6.5, offPeak: false,
  cost: 6, usage: 28, solarToday: 1.2, solarLeft: 0.1, empty: false,
};
const serious = { humour: 0, honesty: 50 };
const funny = { humour: 80, honesty: 50 };

describe("powerNote", () => {
  it("states the house use", () => {
    expect(powerNote(base, serious)).toBe("The house is using 0.4 kilowatts, nearly all from the grid.");
  });

  it("mentions solar once it is meaningful", () => {
    expect(powerNote({ ...base, solar: 1.5, house: 1.9 }, serious)).toContain("the sun is giving 1.5");
  });

  it("adds a quip only when humour is high", () => {
    expect(powerNote({ ...base, car: 7 }, funny)).toContain("The car is drinking.");
    expect(powerNote({ ...base, car: 7 }, serious)).not.toContain("drinking");
  });

  it("says so when it cannot see the house or has no sensors", () => {
    expect(powerNote({ ...base, house: null }, serious)).toContain("cannot see");
    expect(powerNote({ ...base, empty: true }, serious)).toContain("Choose your energy sensors");
  });
});
