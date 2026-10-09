import { describe, expect, it } from "vitest";
import { shouldReload } from "./update";

describe("shouldReload", () => {
  it("reloads when the build changed", () => {
    expect(shouldReload("100", "200")).toBe(true);
  });

  it("stays when it is the same build", () => {
    expect(shouldReload("100", "100")).toBe(false);
  });

  it("stays when the server cannot be reached", () => {
    expect(shouldReload("100", null)).toBe(false);
  });
});
