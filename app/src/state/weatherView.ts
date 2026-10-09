import { compassPoint } from "./compass";
import type { Entity } from "./entities";
import type { DayPoint, HourPoint } from "./forecast";
import { conditionLabel } from "./weather";

export interface WeatherView {
  temp: number | null;
  /** The raw Home Assistant condition, for choosing a symbol. */
  code: string | null;
  condition: string | null;
  high: number | null;
  low: number | null;
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windFrom: string | null;
  windBearing: number | null;
  uv: number | null;
  /** The next day's worth of hours, starting from the current hour. */
  hours: HourPoint[];
  /** Today and the days after, up to five. */
  days: DayPoint[];
  sunrise: Date | null;
  sunset: Date | null;
}

const num = (e: Entity | undefined, key: string): number | null => {
  const v = e?.attributes[key];
  return typeof v === "number" ? v : null;
};

const date = (e: Entity | undefined, key: string): Date | null => {
  const v = e?.attributes[key];
  const d = typeof v === "string" ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

const sameDay = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function highAndLow(today: DayPoint | undefined, hours: HourPoint[], now: Date): { high: number | null; low: number | null } {
  const temps = hours.filter((h) => sameDay(h.at, now)).map((h) => h.temp);
  return {
    high: today?.high ?? (temps.length > 0 ? Math.max(...temps) : null),
    low: today?.low ?? (temps.length > 0 ? Math.min(...temps) : null),
  };
}

function windOf(weather: Entity | undefined): Pick<WeatherView, "windSpeed" | "windFrom" | "windBearing"> {
  const bearing = num(weather, "wind_bearing");
  return { windSpeed: num(weather, "wind_speed"), windFrom: bearing === null ? null : compassPoint(bearing), windBearing: bearing };
}

/** Everything the weather screen shows, from the weather entity, the forecast and the sun. */
export function buildWeatherView(
  weather: Entity | undefined,
  forecast: { hourly: HourPoint[]; daily: DayPoint[] },
  sun: Entity | undefined,
  now: Date,
): WeatherView {
  const hours = forecast.hourly.filter((h) => h.at.getTime() >= now.getTime() - 30 * 60 * 1000).slice(0, 24);
  return {
    temp: num(weather, "temperature"),
    code: weather?.state ?? null,
    condition: conditionLabel(weather?.state),
    ...highAndLow(forecast.daily.find((d) => sameDay(d.at, now)), hours, now),
    humidity: num(weather, "humidity"),
    pressure: num(weather, "pressure"),
    ...windOf(weather),
    uv: num(weather, "uv_index"),
    hours,
    days: forecast.daily.filter((d) => d.at.getTime() >= startOfDay(now)).slice(0, 5),
    sunrise: date(sun, "next_rising"),
    sunset: date(sun, "next_setting"),
  };
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whichever of sunrise and sunset comes first from now, for the details panel. */
export function nextSunEvent(view: Pick<WeatherView, "sunrise" | "sunset">, now: Date): { label: "Sunrise" | "Sunset"; at: Date } | null {
  const events = [
    { label: "Sunrise" as const, at: view.sunrise },
    { label: "Sunset" as const, at: view.sunset },
  ].flatMap((e) => (e.at && e.at.getTime() > now.getTime() ? [{ label: e.label, at: e.at }] : []));
  events.sort((a, b) => a.at.getTime() - b.at.getTime());
  return events[0] ?? null;
}
