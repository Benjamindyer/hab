export interface HourPoint {
  at: Date;
  temp: number;
  /** Rain in millimetres for the hour. */
  rain: number;
  condition: string;
  windSpeed: number | null;
  windBearing: number | null;
}

export interface DayPoint {
  at: Date;
  high: number;
  low: number | null;
  rain: number;
  condition: string;
  humidity: number | null;
  windSpeed: number | null;
  windBearing: number | null;
  uv: number | null;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function dateOf(item: Record<string, unknown>): Date | null {
  const raw = item["datetime"];
  const date = typeof raw === "string" ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/** Reads Home Assistant's hourly forecast. Entries that are missing a time or temperature are skipped. */
export function parseHourly(raw: unknown): HourPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): HourPoint[] => {
    if (!isRecord(item)) return [];
    const at = dateOf(item);
    const temp = num(item["temperature"]);
    if (!at || temp === null) return [];
    return [{ at, temp, rain: num(item["precipitation"]) ?? 0, condition: String(item["condition"] ?? ""), windSpeed: num(item["wind_speed"]), windBearing: num(item["wind_bearing"]) }];
  });
}

/** Reads Home Assistant's daily forecast. The temperature is the day's high. */
export function parseDaily(raw: unknown): DayPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): DayPoint[] => {
    if (!isRecord(item)) return [];
    const at = dateOf(item);
    const high = num(item["temperature"]);
    if (!at || high === null) return [];
    return [{
      at,
      high,
      low: num(item["templow"]),
      rain: num(item["precipitation"]) ?? 0,
      condition: String(item["condition"] ?? ""),
      humidity: num(item["humidity"]),
      windSpeed: num(item["wind_speed"]),
      windBearing: num(item["wind_bearing"]),
      uv: num(item["uv_index"]),
    }];
  });
}

const sameDay = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** The hours of the forecast that fall on a given day. */
export function hoursOnDay(hours: HourPoint[], day: Date): HourPoint[] {
  return hours.filter((h) => sameDay(h.at, day));
}

/** "Today", "Tomorrow", or the weekday and date, for the title of a day. */
export function dayTitle(day: Date, now: Date): string {
  if (sameDay(day, now)) return "Today";
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (sameDay(day, tomorrow)) return "Tomorrow";
  return day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
