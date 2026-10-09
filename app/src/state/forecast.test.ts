import { describe, expect, it } from "vitest";
import { parseDaily, parseHourly } from "./forecast";

describe("parseHourly", () => {
  it("reads the time, temperature, rain, condition and wind", () => {
    const [first] = parseHourly([{ datetime: "2026-10-09T16:00:00+00:00", temperature: 17, precipitation: 0.4, condition: "rainy", wind_speed: 43.6 }]);
    expect(first?.temp).toBe(17);
    expect(first?.rain).toBe(0.4);
    expect(first?.condition).toBe("rainy");
    expect(first?.windSpeed).toBe(43.6);
    expect(first?.at.toISOString()).toBe("2026-10-09T16:00:00.000Z");
  });

  it("skips entries with no time or temperature and treats missing rain as none", () => {
    const points = parseHourly([{ temperature: 5 }, { datetime: "2026-10-09T16:00:00+00:00" }, { datetime: "2026-10-09T17:00:00+00:00", temperature: 9 }, "nope", null]);
    expect(points).toHaveLength(1);
    expect(points[0]?.rain).toBe(0);
    expect(points[0]?.windSpeed).toBeNull();
  });

  it("gives nothing for a reply that is not a list", () => {
    expect(parseHourly(undefined)).toEqual([]);
    expect(parseHourly({})).toEqual([]);
  });
});

describe("parseDaily", () => {
  it("reads the high, the low and the rain", () => {
    const [day] = parseDaily([{ datetime: "2026-10-09T11:00:00+00:00", temperature: 17.2, templow: 13, precipitation: 0.1, condition: "rainy" }]);
    expect(day).toMatchObject({ high: 17.2, low: 13, rain: 0.1, condition: "rainy" });
  });

  it("allows a missing low", () => {
    expect(parseDaily([{ datetime: "2026-10-09T11:00:00+00:00", temperature: 10 }])[0]?.low).toBeNull();
  });
});
