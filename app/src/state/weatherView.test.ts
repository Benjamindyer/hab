import { describe, expect, it } from "vitest";
import type { Entity } from "./entities";
import type { DayPoint, HourPoint } from "./forecast";
import { buildWeatherView, nextSunEvent } from "./weatherView";

const now = new Date(2026, 9, 9, 16, 20);
const weather: Entity = {
  id: "weather.home", state: "rainy",
  attributes: { temperature: 17.2, humidity: 83, pressure: 1010.7, wind_speed: 48.6, wind_bearing: 254.2, uv_index: 0.9 },
};
const hour = (h: number, temp: number): HourPoint => ({ at: new Date(2026, 9, 9, h), temp, rain: 0, condition: "cloudy", windSpeed: null });
const day = (d: number, high: number, low: number | null = 10): DayPoint => ({ at: new Date(2026, 9, d, 11), high, low, rain: 0, condition: "sunny" });
const sun: Entity = { id: "sun.sun", state: "above_horizon", attributes: { next_rising: "2026-10-10T06:19:47+00:00", next_setting: "2026-10-09T17:25:32+00:00" } };

describe("buildWeatherView", () => {
  it("reads the current weather", () => {
    const view = buildWeatherView(weather, { hourly: [], daily: [] }, undefined, now);
    expect(view).toMatchObject({ temp: 17.2, code: "rainy", condition: "rainy", humidity: 83, pressure: 1010.7, windSpeed: 48.6, windFrom: "WSW", uv: 0.9 });
  });

  it("takes today's high and low from the daily forecast", () => {
    const view = buildWeatherView(weather, { hourly: [], daily: [day(8, 9), day(9, 17.2, 13), day(10, 15.4, 11.5)] }, undefined, now);
    expect(view.high).toBe(17.2);
    expect(view.low).toBe(13);
    expect(view.days.map((d) => d.high)).toEqual([17.2, 15.4]);
  });

  it("falls back to the hours when there is no daily forecast", () => {
    const view = buildWeatherView(weather, { hourly: [hour(16, 17), hour(18, 14), hour(20, 12)], daily: [] }, undefined, now);
    expect(view.high).toBe(17);
    expect(view.low).toBe(12);
  });

  it("starts the hours from the current hour and shows at most a day of them", () => {
    const hourly = Array.from({ length: 40 }, (_, i) => ({ at: new Date(2026, 9, 9, 10 + i), temp: i, rain: 0, condition: "x", windSpeed: null }));
    const view = buildWeatherView(weather, { hourly, daily: [] }, undefined, now);
    expect(view.hours).toHaveLength(24);
    expect(view.hours[0]?.at.getHours()).toBe(16);
  });

  it("reads the sunrise and sunset", () => {
    const view = buildWeatherView(weather, { hourly: [], daily: [] }, sun, now);
    expect(view.sunrise?.toISOString()).toBe("2026-10-10T06:19:47.000Z");
    expect(view.sunset?.toISOString()).toBe("2026-10-09T17:25:32.000Z");
  });

  it("copes with a missing weather entity", () => {
    const view = buildWeatherView(undefined, { hourly: [], daily: [] }, undefined, now);
    expect(view.temp).toBeNull();
    expect(view.condition).toBeNull();
    expect(view.windFrom).toBeNull();
  });
});

describe("nextSunEvent", () => {
  const rise = new Date(2026, 9, 10, 6, 20);
  const set = new Date(2026, 9, 9, 17, 25);

  it("picks whichever comes first", () => {
    expect(nextSunEvent({ sunrise: rise, sunset: set }, now)?.label).toBe("Sunset");
    expect(nextSunEvent({ sunrise: rise, sunset: set }, new Date(2026, 9, 9, 20))?.label).toBe("Sunrise");
  });

  it("ignores times already gone, and gives nothing when there are none", () => {
    expect(nextSunEvent({ sunrise: null, sunset: set }, new Date(2026, 9, 9, 20))).toBeNull();
    expect(nextSunEvent({ sunrise: null, sunset: null }, now)).toBeNull();
  });
});
