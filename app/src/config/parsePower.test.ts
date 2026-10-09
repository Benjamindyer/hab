import { describe, expect, it } from "vitest";
import { parsePower } from "./parsePower";

describe("parsePower", () => {
  it("is optional", () => {
    expect(parsePower(undefined)).toBeUndefined();
  });

  it("keeps the entity ids it knows", () => {
    expect(parsePower({ grid: "sensor.a", solar: "sensor.b", extra: "x" })).toEqual({ grid: "sensor.a", solar: "sensor.b" });
  });

  it("rejects something that is not an object or an id", () => {
    expect(() => parsePower("sensor.a")).toThrow(/power/);
    expect(() => parsePower({ grid: 5 })).toThrow(/power\.grid/);
  });
});
