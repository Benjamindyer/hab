import type { Personality } from "./personality";
import type { PowerView } from "./power";

const kw = (n: number): string => String(Number(n.toFixed(1)));
const SOLAR_MEANINGFUL = 0.1;
const CAR_CHARGING = 0.5;
const DEAR_RATE = 25;

function useLine(view: PowerView): string {
  if (view.house === null) return "I cannot see how much the house is using.";
  const base = `The house is using ${kw(view.house)} kilowatts`;
  if (view.solar !== null && view.solar >= SOLAR_MEANINGFUL) return `${base}, and the sun is giving ${kw(view.solar)} of it.`;
  return `${base}, nearly all from the grid.`;
}

function quip(view: PowerView, dials: Personality): string | null {
  if (dials.humour < 50) return null;
  if (view.car !== null && view.car >= CAR_CHARGING) return "The car is drinking.";
  if (view.rate !== null && view.rate >= DEAR_RATE && view.offPeak === false) return "This is the expensive part of the day.";
  if (view.offPeak === true) return "Cheap electricity. Run something.";
  return null;
}

/** The line under the Energy screen. It is worked out from the numbers, so it never invents any. */
export function powerNote(view: PowerView, dials: Personality): string {
  if (view.empty) return "Choose your energy sensors in the config to see them here.";
  return [useLine(view), quip(view, dials)].filter(Boolean).join(" ");
}
