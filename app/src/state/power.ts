import type { PowerConfig } from "../config/parsePower";
import type { Entity, EntityStore } from "./entities";

export interface PowerView {
  /** Kilowatts drawn from the grid. */
  grid: number | null;
  /** Kilowatts from solar. */
  solar: number | null;
  /** Kilowatts into the car. */
  car: number | null;
  /** Grid plus solar: what the house is using, car included. */
  house: number | null;
  carPlugged: boolean | null;
  carCharge: number | null;
  /** Pence per kWh. */
  rate: number | null;
  nextRate: number | null;
  offPeak: boolean | null;
  /** Pounds spent today. */
  cost: number | null;
  usage: number | null;
  solarToday: number | null;
  solarLeft: number | null;
  /** True when the config names no sensors at all. */
  empty: boolean;
}

const UNKNOWN = new Set(["unknown", "unavailable", ""]);

function value(entity: Entity | undefined): number | null {
  if (!entity || UNKNOWN.has(entity.state)) return null;
  const n = Number(entity.state);
  return Number.isFinite(n) ? n : null;
}

/** Reads a power sensor in W or kW and returns kilowatts. */
export function kilowatts(entity: Entity | undefined): number | null {
  const n = value(entity);
  if (n === null) return null;
  return entity?.attributes["unit_of_measurement"] === "W" ? n / 1000 : n;
}

/** Reads a price in pounds per kWh and returns pence. */
function pence(entity: Entity | undefined): number | null {
  const n = value(entity);
  return n === null ? null : n * 100;
}

function flag(entity: Entity | undefined): boolean | null {
  if (!entity || UNKNOWN.has(entity.state)) return null;
  return entity.state === "on";
}

const sum = (a: number | null, b: number | null): number | null => (a === null && b === null ? null : (a ?? 0) + (b ?? 0));

type Reader = (id: string | undefined) => Entity | undefined;

const readFlows = (read: Reader, c: PowerConfig): Pick<PowerView, "grid" | "solar" | "car" | "house"> => {
  const grid = kilowatts(read(c.grid));
  const solar = kilowatts(read(c.solar));
  return { grid, solar, car: kilowatts(read(c.car)), house: sum(grid, solar) };
};

const readCar = (read: Reader, c: PowerConfig): Pick<PowerView, "carPlugged" | "carCharge"> => ({
  carPlugged: flag(read(c.carPlug)),
  carCharge: value(read(c.carCharge)),
});

const readMoney = (read: Reader, c: PowerConfig): Pick<PowerView, "rate" | "nextRate" | "offPeak" | "cost" | "usage"> => ({
  rate: pence(read(c.rate)),
  nextRate: pence(read(c.nextRate)),
  offPeak: flag(read(c.offPeak)),
  cost: value(read(c.cost)),
  usage: value(read(c.usage)),
});

/** Turns the owner's chosen sensors into everything the Energy screen shows. */
export function buildPowerView(store: EntityStore, config: PowerConfig | undefined): PowerView {
  const c = config ?? {};
  const read: Reader = (id) => (id ? store.get(id) : undefined);
  return {
    ...readFlows(read, c),
    ...readCar(read, c),
    ...readMoney(read, c),
    solarToday: value(read(c.solarToday)),
    solarLeft: value(read(c.solarLeft)),
    empty: Object.keys(c).length === 0,
  };
}

export type RateTone = "cheap" | "dear" | "normal";

const DEAR_PENCE = 25;

/** Says whether the price now is a cheap one, a dear one or neither. */
export function rateTone(view: Pick<PowerView, "rate" | "offPeak">): RateTone {
  if (view.offPeak === true) return "cheap";
  return view.rate !== null && view.rate >= DEAR_PENCE ? "dear" : "normal";
}
