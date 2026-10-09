import type { Draft } from "../../config/draft";
import type { POWER_KEYS } from "../../config/parsePower";
import type { EntityStore } from "../../state/entities";
import { entityOptions } from "../../state/options";
import { row, section, selectInput } from "./fields";

type Key = (typeof POWER_KEYS)[number];

interface Choice {
  key: Key;
  label: string;
  domain: string;
  classes?: string[];
  hint?: string;
}

const CHOICES: Choice[] = [
  { key: "grid", label: "Grid power", domain: "sensor", classes: ["power"], hint: "What the house draws from the grid now." },
  { key: "solar", label: "Solar power", domain: "sensor", classes: ["power"] },
  { key: "car", label: "Car charger power", domain: "sensor", classes: ["power"] },
  { key: "carPlug", label: "Car plugged in", domain: "binary_sensor" },
  { key: "carCharge", label: "Car charge", domain: "sensor", classes: ["battery"], hint: "How full the car battery is, in percent." },
  { key: "rate", label: "Price now", domain: "sensor", hint: "Per kWh, in pounds." },
  { key: "nextRate", label: "Price next", domain: "sensor" },
  { key: "offPeak", label: "Cheap rate running", domain: "binary_sensor" },
  { key: "cost", label: "Cost today", domain: "sensor", classes: ["monetary"] },
  { key: "usage", label: "Used today", domain: "sensor", classes: ["energy"] },
  { key: "solarToday", label: "Solar made today", domain: "sensor", classes: ["energy"] },
  { key: "solarLeft", label: "Solar still to come", domain: "sensor", classes: ["energy"], hint: "From a solar forecast, if you have one." },
];

/** The Energy screen's sensors. Every one is optional. */
export function energy(draft: Draft, entities: EntityStore): HTMLElement {
  const all = entities.all();
  const box = section("Energy", "Choose the sensors for the Energy screen. Leave any you do not have as Not set.");
  for (const choice of CHOICES) {
    const options = entityOptions(all, choice.domain, choice.classes);
    box.append(row(choice.label, selectInput(options, draft.power[choice.key], (v) => { draft.power[choice.key] = v; }), choice.hint));
  }
  return box;
}
