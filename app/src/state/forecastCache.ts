import { parseDaily, parseHourly, type DayPoint, type HourPoint } from "./forecast";

export type ForecastKind = "hourly" | "daily";

/** Asks Home Assistant for a weather forecast. */
export interface ForecastSource {
  forecast(entityId: string, kind: ForecastKind): Promise<unknown>;
}

export interface ForecastData {
  hourly: HourPoint[];
  daily: DayPoint[];
  status: "loading" | "ready" | "error";
}

export interface ForecastCache {
  /** What is known now. The first call also starts fetching, and later calls refresh it when it is old. */
  get(entityId: string): ForecastData;
  settled(): Promise<void>;
}

const FRESH_MS = 15 * 60 * 1000;
const RETRY_MS = 2 * 60 * 1000;

interface Entry {
  data: ForecastData;
  fetchedAt: number;
  failedAt: number;
  busy: Promise<void> | null;
}

/** Keeps the latest forecast and refreshes it every fifteen minutes. A failure keeps the old forecast and tries again in two. */
export function createForecastCache(source: ForecastSource, clock: () => number = Date.now): ForecastCache {
  const entries = new Map<string, Entry>();

  async function refresh(entityId: string, entry: Entry): Promise<void> {
    try {
      const [hourly, daily] = await Promise.all([source.forecast(entityId, "hourly"), source.forecast(entityId, "daily")]);
      entry.data = { hourly: parseHourly(hourly), daily: parseDaily(daily), status: "ready" };
      entry.fetchedAt = clock();
    } catch {
      entry.failedAt = clock();
      entry.data = { ...entry.data, status: entry.data.hourly.length > 0 ? "ready" : "error" };
    }
  }

  return {
    get(entityId) {
      let entry = entries.get(entityId);
      if (!entry) {
        entry = { data: { hourly: [], daily: [], status: "loading" }, fetchedAt: Number.NEGATIVE_INFINITY, failedAt: Number.NEGATIVE_INFINITY, busy: null };
        entries.set(entityId, entry);
      }
      const stale = clock() - entry.fetchedAt >= FRESH_MS && clock() - entry.failedAt >= RETRY_MS;
      if (!entry.busy && stale) {
        const current = entry;
        current.busy = refresh(entityId, current).finally(() => { current.busy = null; });
      }
      return entry.data;
    },
    settled: async () => { await Promise.all([...entries.values()].map((e) => e.busy)); },
  };
}
