import { describe, expect, it } from "vitest";
import type { HourPoint } from "./forecast";
import { rainOutlook, weatherFacts, weatherKey, weatherNote } from "./weatherNote";
import type { WeatherView } from "./weatherView";

const hour = (h: number, rain: number): HourPoint => ({ at: new Date(2026, 9, 9, h), temp: 15, rain, condition: "x", windSpeed: null });
const base: WeatherView = {
  temp: 17.2, code: "rainy", condition: "rainy", high: 17.2, low: 13, humidity: 83, pressure: 1010, windSpeed: 48.6, windFrom: "WSW",
  windBearing: 254, uv: 1, hours: [], days: [{ at: new Date(2026, 9, 9), high: 17, low: 13, rain: 0, condition: "rainy", humidity: null, windSpeed: null, windBearing: null, uv: null }, { at: new Date(2026, 9, 10), high: 15.4, low: 11, rain: 0, condition: "sunny", humidity: null, windSpeed: null, windBearing: null, uv: null }],
  sunrise: null, sunset: null,
};
const now = new Date(2026, 9, 9, 16, 20);
const plain = { humour: 0, honesty: 0 };

describe("rainOutlook", () => {
  it("is null with no forecast", () => {
    expect(rainOutlook(base)).toBeNull();
  });

  it("says when rain eases", () => {
    expect(rainOutlook({ ...base, hours: [hour(16, 1), hour(17, 0.5), hour(18, 0), hour(19, 0)] })).toBe("rain easing around 18:00");
  });

  it("says when rain starts", () => {
    expect(rainOutlook({ ...base, hours: [hour(16, 0), hour(17, 0), hour(18, 0.6)] })).toBe("rain from 18:00");
  });

  it("says when it stays dry, and when it never stops", () => {
    expect(rainOutlook({ ...base, hours: [hour(16, 0), hour(17, 0.1)] })).toBe("no rain in the next twelve hours");
    expect(rainOutlook({ ...base, hours: Array.from({ length: 12 }, (_, i) => hour(16 + i, 1)) })).toBe("rain for the next twelve hours");
  });
});

describe("weatherNote", () => {
  it("states the weather, the rain and tomorrow", () => {
    const view = { ...base, hours: [hour(16, 1), hour(17, 0)] };
    expect(weatherNote(view, plain)).toBe("Rainy, 17 degrees. Rain easing around 17:00. Tomorrow: sunny, 15 at best.");
  });

  it("adds the wind when honest and it is strong, and a remark when funny", () => {
    const note = weatherNote(base, { humour: 100, honesty: 100 });
    expect(note).toContain("Wind is 49 km/h from the WSW.");
    expect(note).toContain("Rain. Nobody is surprised.");
  });

  it("leaves the wind out when it is mild", () => {
    expect(weatherNote({ ...base, windSpeed: 10 }, { humour: 0, honesty: 100 })).not.toContain("Wind");
  });

});

describe("weatherNote with little to say", () => {
  it("copes with nothing known", () => {
    const empty = { ...base, temp: null, condition: null, days: [] };
    expect(weatherNote(empty, plain)).toBe("No weather information yet.");
  });
});

describe("weatherFacts and weatherKey", () => {
  it("lists the facts, with words for tomorrow", () => {
    const facts = weatherFacts({ ...base, hours: [hour(16, 0)] }, now);
    expect(facts).toMatchObject({ partOfDay: "afternoon", conditionNow: "rainy", temperatureC: 17, todayHighC: 17, windKmh: 49, windFrom: "WSW", tomorrow: "sunny, high of 15" });
  });

  it("keeps the same key within the hour and changes it with the weather", () => {
    expect(weatherKey(base, now)).toBe(weatherKey(base, new Date(2026, 9, 9, 16, 55)));
    expect(weatherKey(base, now)).not.toBe(weatherKey({ ...base, code: "sunny" }, now));
    expect(weatherKey(base, now)).not.toBe(weatherKey(base, new Date(2026, 9, 9, 17, 5)));
  });
});
