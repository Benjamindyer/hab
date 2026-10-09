import { describe, expect, it } from "vitest";
import { createForecastCache, type ForecastSource } from "./forecastCache";

const hour = [{ datetime: "2026-10-09T16:00:00+00:00", temperature: 17 }];
const day = [{ datetime: "2026-10-09T11:00:00+00:00", temperature: 17 }];

function source(fail = false): ForecastSource & { calls: number } {
  const s = {
    calls: 0,
    async forecast(_entity: string, kind: string) {
      s.calls += 1;
      if (fail) throw new Error("offline");
      return kind === "hourly" ? hour : day;
    },
  };
  return s;
}

describe("createForecastCache", () => {
  it("is loading at first, then ready with the parsed forecast", async () => {
    const cache = createForecastCache(source());
    expect(cache.get("weather.x").status).toBe("loading");
    await cache.settled();
    const data = cache.get("weather.x");
    expect(data.status).toBe("ready");
    expect(data.hourly[0]?.temp).toBe(17);
    expect(data.daily[0]?.high).toBe(17);
  });

  it("does not ask again until fifteen minutes have passed", async () => {
    let now = 0;
    const src = source();
    const cache = createForecastCache(src, () => now);
    cache.get("weather.x");
    await cache.settled();
    now = 10 * 60_000;
    cache.get("weather.x");
    await cache.settled();
    expect(src.calls).toBe(2);
    now = 16 * 60_000;
    cache.get("weather.x");
    await cache.settled();
    expect(src.calls).toBe(4);
  });

});

describe("createForecastCache after a failure", () => {
  it("reports an error when nothing has loaded, and retries after two minutes", async () => {
    let now = 0;
    const src = source(true);
    const cache = createForecastCache(src, () => now);
    cache.get("weather.x");
    await cache.settled();
    expect(cache.get("weather.x").status).toBe("error");
    now = 60_000;
    cache.get("weather.x");
    await cache.settled();
    expect(src.calls).toBe(2);
    now = 3 * 60_000;
    cache.get("weather.x");
    await cache.settled();
    expect(src.calls).toBe(4);
  });

  it("keeps the old forecast when a refresh fails", async () => {
    let now = 0;
    let failing = false;
    const cache = createForecastCache({ async forecast(_e, kind) { if (failing) throw new Error("x"); return kind === "hourly" ? hour : day; } }, () => now);
    cache.get("weather.x");
    await cache.settled();
    failing = true;
    now = 20 * 60_000;
    cache.get("weather.x");
    await cache.settled();
    const data = cache.get("weather.x");
    expect(data.status).toBe("ready");
    expect(data.hourly).toHaveLength(1);
  });
});
