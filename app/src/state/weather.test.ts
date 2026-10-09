import { describe, expect, it } from "vitest";
import { conditionLabel } from "./weather";

describe("conditionLabel", () => {
  it("translates known states", () => {
    expect(conditionLabel("partlycloudy")).toBe("partly cloudy");
    expect(conditionLabel("rainy")).toBe("rainy");
  });

  it("returns null for unknown or missing states", () => {
    expect(conditionLabel("unavailable")).toBeNull();
    expect(conditionLabel(undefined)).toBeNull();
  });
});
