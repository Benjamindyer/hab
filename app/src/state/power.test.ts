import { describe, expect, it } from "vitest";
import { buildPowerView, kilowatts, rateTone } from "./power";
import { fakeStore } from "./testing";

describe("kilowatts", () => {
  it("turns watts into kilowatts and leaves kilowatts alone", () => {
    expect(kilowatts({ id: "a", state: "362", attributes: { unit_of_measurement: "W" } })).toBeCloseTo(0.362);
    expect(kilowatts({ id: "a", state: "0.13", attributes: { unit_of_measurement: "kW" } })).toBeCloseTo(0.13);
  });

  it("is null for missing or unavailable sensors", () => {
    expect(kilowatts(undefined)).toBeNull();
    expect(kilowatts({ id: "a", state: "unavailable", attributes: {} })).toBeNull();
  });
});

describe("buildPowerView", () => {
  const store = fakeStore([
    { id: "sensor.grid", state: "362", attributes: { unit_of_measurement: "W" } },
    { id: "sensor.solar", state: "45", attributes: { unit_of_measurement: "W" } },
    { id: "sensor.rate", state: "0.289251", attributes: {} },
    { id: "binary_sensor.plug", state: "on", attributes: {} },
    { id: "sensor.cost", state: "6.03", attributes: {} },
  ]);

  it("adds grid and solar to get the house", () => {
    const view = buildPowerView(store, { grid: "sensor.grid", solar: "sensor.solar" });
    expect(view.house).toBeCloseTo(0.407);
    expect(view.empty).toBe(false);
  });

  it("gives the rate in pence and reads flags", () => {
    const view = buildPowerView(store, { rate: "sensor.rate", carPlug: "binary_sensor.plug", cost: "sensor.cost" });
    expect(view.rate).toBeCloseTo(28.9251);
    expect(view.carPlugged).toBe(true);
    expect(view.cost).toBe(6.03);
    expect(view.house).toBeNull();
  });

  it("is empty with no config", () => {
    expect(buildPowerView(store, undefined).empty).toBe(true);
  });
});

describe("rateTone", () => {
  it("is cheap off-peak, dear above 25p and normal otherwise", () => {
    expect(rateTone({ rate: 6.5, offPeak: true })).toBe("cheap");
    expect(rateTone({ rate: 28.9, offPeak: false })).toBe("dear");
    expect(rateTone({ rate: 18, offPeak: false })).toBe("normal");
    expect(rateTone({ rate: null, offPeak: null })).toBe("normal");
  });
});
