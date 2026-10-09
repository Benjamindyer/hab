export interface HourPoint {
  at: Date;
  temp: number;
  /** Rain in millimetres for the hour. */
  rain: number;
  condition: string;
  windSpeed: number | null;
}

export interface DayPoint {
  at: Date;
  high: number;
  low: number | null;
  rain: number;
  condition: string;
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
    return [{ at, temp, rain: num(item["precipitation"]) ?? 0, condition: String(item["condition"] ?? ""), windSpeed: num(item["wind_speed"]) }];
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
    return [{ at, high, low: num(item["templow"]), rain: num(item["precipitation"]) ?? 0, condition: String(item["condition"] ?? "") }];
  });
}
