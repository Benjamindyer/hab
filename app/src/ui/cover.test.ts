import { describe, expect, it } from "vitest";
import { coverBackground } from "./cover";

describe("coverBackground", () => {
  it("gives the same look for the same name", () => {
    expect(coverBackground("Morning")).toBe(coverBackground("Morning"));
  });

  it("gives different looks for different names", () => {
    expect(coverBackground("Morning")).not.toBe(coverBackground("Evening"));
  });
});
