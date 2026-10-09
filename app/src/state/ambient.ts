import type { AmbientConfig } from "../config/config";
import type { Entity, EntityStore } from "./entities";
import type { Facts } from "./llm";
import { ambientNote, type Personality } from "./personality";
import { conditionLabel } from "./weather";

export interface AmbientView {
  time: string;
  date: string;
  room: string;
  indoor: number | null;
  target: number | null;
  outside: number | null;
  condition: string | null;
  note: string;
}

function numberAttr(entity: Entity | undefined, key: string): number | null {
  const value = entity?.attributes[key];
  return typeof value === "number" ? value : null;
}

const pad = (n: number): string => String(n).padStart(2, "0");

/** Turns live entities and the clock into everything the ambient screen shows. */
export function buildAmbientView(
  store: EntityStore,
  config: AmbientConfig,
  dials: Personality,
  now: Date,
): AmbientView {
  const weather = config.weather ? store.get(config.weather) : undefined;
  const climate = config.climate ? store.get(config.climate) : undefined;
  const indoor = numberAttr(climate, "current_temperature");
  const target = numberAttr(climate, "temperature");
  const outside = numberAttr(weather, "temperature");
  const condition = conditionLabel(weather?.state);
  const note = ambientNote(
    { hour: now.getHours(), room: config.room, indoor, target, outside, condition },
    dials,
  );
  return {
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    date: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(now),
    room: config.room,
    indoor,
    target,
    outside,
    condition,
    note,
  };
}

/** Says how the room compares with its heating target, worked out here so the model need not guess. */
function roomVersusTarget(indoor: number | null, target: number | null): string | null {
  if (indoor === null || target === null) return null;
  if (indoor > target) return "warmer than the heating target";
  return indoor < target ? "cooler than the heating target" : "at the heating target";
}

/** How far the room is from its target, worked out here because a reply may quote it. */
function degreesFromTarget(indoor: number | null, target: number | null): number | null {
  return indoor === null || target === null ? null : Math.round(Math.abs(indoor - target) * 10) / 10;
}

/** The facts the model may use for the ambient line. Nothing else about the house is sent. */
export function ambientFacts(view: AmbientView): Facts {
  return {
    time: view.time,
    room: view.room,
    roomTemperatureC: view.indoor,
    heatingTargetC: view.target,
    roomComparedWithTarget: roomVersusTarget(view.indoor, view.target),
    degreesFromTarget: degreesFromTarget(view.indoor, view.target),
    outsideTemperatureC: view.outside,
    weather: view.condition,
  };
}

/** Changes when there is something new to say: a new hour, new weather, or a degree of difference. */
export function ambientKey(view: AmbientView): string {
  const round = (n: number | null): string => (n === null ? "-" : String(Math.round(n)));
  return [view.time.slice(0, 2), view.condition ?? "-", round(view.indoor), round(view.outside)].join("|");
}
