import { describe, expect, it } from "vitest";
import { fakeStore } from "./testing";
import { ambientFacts, ambientKey, buildAmbientView } from "./ambient";


const now = new Date(2026, 9, 9, 14, 4);
const dials = { humour: 0, honesty: 0 };
const config = { room: "Kitchen", weather: "weather.home", climate: "climate.kitchen" };

describe("buildAmbientView", () => {
  it("formats the clock and date", () => {
    const view = buildAmbientView(fakeStore([]), config, dials, now);
    expect(view.time).toBe("14:04");
    expect(view.date).toBe("Friday 9 October");
  });

  it("reads indoor and outside temperature and the weather", () => {
    const store = fakeStore([
      { id: "climate.kitchen", state: "heat", attributes: { current_temperature: 22, temperature: 17 } },
      { id: "weather.home", state: "rainy", attributes: { temperature: 18 } },
    ]);
    const view = buildAmbientView(store, config, dials, now);
    expect(view.indoor).toBe(22);
    expect(view.outside).toBe(18);
    expect(view.condition).toBe("rainy");
  });

  it("shows nulls when entities are missing", () => {
    const view = buildAmbientView(fakeStore([]), config, dials, now);
    expect(view.indoor).toBeNull();
    expect(view.condition).toBeNull();
  });
});

describe("ambient facts and key", () => {
  const view = { time: "14:04", date: "x", room: "Kitchen", indoor: 22.4, outside: 17.6, condition: "rainy", note: "n" };

  it("lists only the facts the model may use", () => {
    expect(ambientFacts(view)).toEqual({ time: "14:04", room: "Kitchen", roomTemperatureC: 22.4, outsideTemperatureC: 17.6, weather: "rainy" });
  });

  it("stays the same within the hour and changes with the hour or the weather", () => {
    expect(ambientKey(view)).toBe(ambientKey({ ...view, time: "14:59" }));
    expect(ambientKey(view)).not.toBe(ambientKey({ ...view, time: "15:00" }));
    expect(ambientKey(view)).not.toBe(ambientKey({ ...view, condition: "sunny" }));
  });
});
