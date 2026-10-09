/** The sensors the Energy screen reads. Each one is optional, and a missing one is simply left out. */
export interface PowerConfig {
  /** Power drawn from the grid, in W or kW. */
  grid?: string;
  /** Power from solar panels, in W or kW. */
  solar?: string;
  /** Power going into the car, in W or kW. */
  car?: string;
  /** On while a car is plugged in. */
  carPlug?: string;
  /** How full the car battery is, in percent. */
  carCharge?: string;
  /** The price now, per kWh, in pounds. */
  rate?: string;
  /** The price in the next half hour, per kWh, in pounds. */
  nextRate?: string;
  /** On while the cheap rate is running. */
  offPeak?: string;
  /** What today has cost so far, in pounds. */
  cost?: string;
  /** Electricity used so far today, in kWh. */
  usage?: string;
  /** Solar energy made so far today, in kWh. */
  solarToday?: string;
  /** Solar energy still forecast for today, in kWh. */
  solarLeft?: string;
}

export const POWER_KEYS = [
  "grid", "solar", "car", "carPlug", "carCharge", "rate", "nextRate", "offPeak", "cost", "usage", "solarToday", "solarLeft",
] as const;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/** Checks the optional power section of the config. */
export function parsePower(raw: unknown): PowerConfig | undefined {
  if (raw === undefined) return undefined;
  if (!isObject(raw)) throw new Error("power must be an object of entity ids, for example { \"grid\": \"sensor.house_demand\" }.");
  const result: PowerConfig = {};
  for (const key of POWER_KEYS) {
    const value = raw[key];
    if (value === undefined) continue;
    if (typeof value !== "string") throw new Error(`power.${key} must be an entity id.`);
    result[key] = value;
  }
  return result;
}
