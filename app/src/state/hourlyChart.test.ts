import { describe, expect, it } from "vitest";
import type { HourPoint } from "./forecast";
import { chartGeometry } from "./hourlyChart";

const hour = (h: number, temp: number, rain = 0): HourPoint => ({ at: new Date(2026, 9, 9, h), temp, rain, condition: "x", windSpeed: null });
const box = { width: 1000, height: 200, barHeight: 40, pad: 20 };

describe("chartGeometry", () => {
  it("spreads the hours across the width, warmest highest", () => {
    const g = chartGeometry([hour(15, 10), hour(16, 20), hour(17, 15)], box);
    expect(g.points.map((p) => p.x)).toEqual([0, 500, 1000]);
    expect(g.points[1]?.y).toBe(20);
    expect(g.points[0]?.y).toBe(180);
    expect(g.warmest?.temp).toBe(20);
    expect(g.coolest?.temp).toBe(10);
  });

  it("scales the rain bars, with a minimum scale so a drizzle stays small", () => {
    const g = chartGeometry([hour(15, 10, 0), hour(16, 10, 1), hour(17, 10, 4)], box);
    expect(g.bars.map((b) => b.height)).toEqual([0, 10, 40]);
    const drizzle = chartGeometry([hour(15, 10, 0.2), hour(16, 10)], box);
    expect(drizzle.bars[0]?.height).toBeCloseTo(4);
  });

  it("labels every third hour", () => {
    const g = chartGeometry([hour(14, 1), hour(15, 1), hour(16, 1), hour(17, 1), hour(18, 1)], box);
    expect(g.labels.map((l) => l.text)).toEqual(["15", "18"]);
  });

  it("copes with no hours, one hour and a flat line", () => {
    expect(chartGeometry([], box).points).toEqual([]);
    expect(chartGeometry([hour(15, 10)], box).points).toHaveLength(1);
    expect(chartGeometry([hour(15, 10), hour(16, 10)], box).points.every((p) => Number.isFinite(p.y))).toBe(true);
  });
});
