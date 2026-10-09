import type { DayPoint } from "../state/forecast";
import { conditionLabel } from "../state/weather";
import { el } from "./dom";
import { weatherIcon } from "./weatherIcons";

const dayName = (d: DayPoint, today: Date): string => {
  const same = d.at.getFullYear() === today.getFullYear() && d.at.getMonth() === today.getMonth() && d.at.getDate() === today.getDate();
  return same ? "Today" : d.at.toLocaleDateString("en-GB", { weekday: "short" });
};

/** One column for a day: its name, a symbol, a bar from the low to the high on a shared scale, and the rain if any. */
function column(day: DayPoint, today: Date, scale: { low: number; high: number }, open: () => void): HTMLElement {
  const { low, high } = scale;
  const span = high - low || 1;
  const box = el("button", "day");
  box.addEventListener("click", open);
  const range = el("div", "range");
  const bar = range.appendChild(el("i"));
  bar.style.left = `${(((day.low ?? day.high) - low) / span) * 100}%`;
  bar.style.right = `${((high - day.high) / span) * 100}%`;
  const symbol = el("div", "day-icon");
  symbol.innerHTML = weatherIcon(day.condition);
  symbol.title = conditionLabel(day.condition) ?? "";
  const temps = el("div", "day-temps mono", `${day.low === null ? "" : `${Math.round(day.low)}° `}${Math.round(day.high)}°`);
  box.append(el("div", "day-name", dayName(day, today)), symbol, range, temps);
  if (day.rain >= 0.2) box.append(el("div", "day-rain mono", `${day.rain.toFixed(1)} mm`));
  return box;
}

/** The next few days side by side, sharing one temperature scale so they can be compared at a glance. Touching one opens it. */
export function dayColumns(days: DayPoint[], today: Date, open: (index: number) => void): HTMLElement[] {
  if (days.length === 0) return [];
  const low = Math.min(...days.map((d) => d.low ?? d.high));
  const high = Math.max(...days.map((d) => d.high));
  return days.map((d, i) => column(d, today, { low, high }, () => open(i)));
}
