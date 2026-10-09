import { dayTitle, hoursOnDay, type DayPoint, type HourPoint } from "../state/forecast";
import { compassPoint } from "../state/compass";
import { conditionLabel } from "../state/weather";
import { el } from "./dom";
import { buildHourlyChart } from "./weatherChart";
import { dayColumns } from "./weatherDays";
import { weatherIcon } from "./weatherIcons";

const whole = (n: number | null): string => (n === null ? "--" : String(Math.round(n)));

function pair(label: string, value: string): HTMLElement {
  const box = el("div", "w-pair");
  box.append(el("span", "w-label", label), el("span", "w-value mono", value));
  return box;
}

function windText(day: DayPoint): string {
  if (day.windSpeed === null) return "--";
  return `${whole(day.windSpeed)} km/h${day.windBearing === null ? "" : ` ${compassPoint(day.windBearing)}`}`;
}

function header(day: DayPoint, now: Date): HTMLElement {
  const box = el("div", "d-head");
  const symbol = el("span", "w-symbol");
  symbol.innerHTML = weatherIcon(day.condition);
  const words = el("div", "d-words");
  words.append(el("div", "d-title", dayTitle(day.at, now)), el("div", "w-word", conditionLabel(day.condition) ?? ""));
  const temps = el("div", "d-temps mono", `${day.low === null ? "" : `${whole(day.low)}°  `}${whole(day.high)}°`);
  box.append(symbol, words, temps);
  return box;
}

export interface DayContext {
  days: DayPoint[];
  onJump(index: number): void;
}

/** The hours of the day as a chart. When the day is too far ahead for hours, the days side by side give some context instead. */
function chartBlock(hours: HourPoint[], day: DayPoint, now: Date, context: DayContext): HTMLElement {
  const box = el("div", "w-chart d-chart");
  const chart = hours.length >= 3 ? buildHourlyChart(hours) : null;
  if (chart) {
    box.append(chart);
    return box;
  }
  const strip = el("div", "w-days d-strip");
  const columns = dayColumns(context.days, now, context.onJump);
  columns.forEach((column, i) => column.classList.toggle("sel", context.days[i]?.at.getTime() === day.at.getTime()));
  strip.append(...columns);
  box.append(el("div", "d-note", "Hour by hour is only forecast for the next two days."), strip);
  return box;
}

/** Everything for one day: its name and weather, the wind, humidity, UV and rain, and the hours when they are forecast. */
export function dayDetail(day: DayPoint, hourly: HourPoint[], now: Date, context: DayContext): HTMLElement[] {
  const details = el("div", "w-details d-details");
  details.append(
    pair("Wind", windText(day)),
    pair("Humidity", day.humidity === null ? "--" : `${whole(day.humidity)}%`),
    pair("UV", day.uv === null ? "--" : day.uv.toFixed(1)),
    pair("Rain", day.rain >= 0.1 ? `${day.rain.toFixed(1)} mm` : "None"),
  );
  return [header(day, now), details, chartBlock(hoursOnDay(hourly, day.at), day, now, context), el("div", "d-hint", "Touch to close. Swipe for the other days.")];
}
