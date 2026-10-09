import { describe, expect, it } from "vitest";
import { pageIndex } from "./pager";

describe("pageIndex", () => {
  it("is the first page at the start", () => {
    expect(pageIndex(0, 800, 3)).toBe(0);
  });

  it("switches page when more than halfway", () => {
    expect(pageIndex(390, 800, 3)).toBe(0);
    expect(pageIndex(410, 800, 3)).toBe(1);
    expect(pageIndex(1600, 800, 3)).toBe(2);
  });

  it("stays inside the pages", () => {
    expect(pageIndex(5000, 800, 3)).toBe(2);
    expect(pageIndex(-50, 800, 3)).toBe(0);
    expect(pageIndex(100, 0, 3)).toBe(0);
  });
});
