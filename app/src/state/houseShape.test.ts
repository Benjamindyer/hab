import { describe, expect, it } from "vitest";
import { cellOnFace, onFace } from "./houseShape";

describe("onFace", () => {
  it("finds the corners and the middle", () => {
    expect(onFace({ origin: [0, 0], across: [10, 0], up: [0, 20] }, 0, 0)).toEqual([0, 0]);
    expect(onFace({ origin: [0, 0], across: [10, 0], up: [0, 20] }, 1, 1)).toEqual([10, 20]);
    expect(onFace({ origin: [0, 0], across: [10, 0], up: [0, 20] }, 0.5, 0.5)).toEqual([5, 10]);
  });
});

const firstX = (cell: readonly (readonly [number, number])[]): number => cell[0]?.[0] ?? 0;

describe("cellOnFace", () => {
  const face = { origin: [0, 0] as const, across: [100, 0] as const, up: [0, 100] as const };

  it("stays inside the face", () => {
    const corners = cellOnFace(face, { col: 0, row: 0, cols: 4, rows: 2 });
    for (const [x, y] of corners) {
      expect(x).toBeGreaterThan(0);
      expect(y).toBeGreaterThan(0);
    }
  });

  it("puts later columns further along", () => {
    const first = cellOnFace(face, { col: 0, row: 0, cols: 4, rows: 2 });
    const last = cellOnFace(face, { col: 3, row: 0, cols: 4, rows: 2 });
    expect(firstX(last)).toBeGreaterThan(firstX(first));
  });
});
