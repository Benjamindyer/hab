import { describe, expect, it } from "vitest";
import { dayTitle, hoursOnDay, parseDaily, parseHourly } from "./forecast";

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

  it("reads the wind, humidity and UV for the day", () => {
    const [day] = parseDaily([{ datetime: "2026-10-10T11:00:00+00:00", temperature: 15.4, humidity: 63, wind_speed: 35.6, wind_bearing: 281.6, uv_index: 2.4 }]);
    expect(day).toMatchObject({ humidity: 63, windSpeed: 35.6, windBearing: 281.6, uv: 2.4 });
  });

  it("allows a missing low", () => {
    expect(parseDaily([{ datetime: "2026-10-09T11:00:00+00:00", temperature: 10 }])[0]?.low).toBeNull();
  });
});

describe("hoursOnDay and dayTitle", () => {
  const hour = (d: number, h: number) => ({ at: new Date(2026, 9, d, h), temp: 10, rain: 0, condition: "x", windSpeed: null });
  const now = new Date(2026, 9, 9, 16);

  it("picks the hours that fall on a day", () => {
    const hours = [hour(9, 23), hour(10, 0), hour(10, 12), hour(11, 1)];
    expect(hoursOnDay(hours, new Date(2026, 9, 10)).map((h) => h.at.getHours())).toEqual([0, 12]);
  });

  it("names today and tomorrow, then gives the weekday and date", () => {
    expect(dayTitle(new Date(2026, 9, 9, 11), now)).toBe("Today");
    expect(dayTitle(new Date(2026, 9, 10, 11), now)).toBe("Tomorrow");
    expect(dayTitle(new Date(2026, 9, 12, 11), now)).toBe("Monday 12 October");
  });
});
