import type { HourPoint } from "./forecast";
import type { Facts } from "./llm";
import { partOfDay } from "./musicNote";
import { quipFor, type Personality } from "./personality";
import { conditionLabel } from "./weather";
import type { WeatherView } from "./weatherView";

const RAIN_MM = 0.2;
const LOOK_AHEAD_HOURS = 12;
const STRONG_WIND_KMH = 40;

const round = (n: number): number => Math.round(n);
const clock = (d: Date): string => `${String(d.getHours()).padStart(2, "0")}:00`;

const wet = (hour: HourPoint | undefined): boolean => (hour?.rain ?? 0) >= RAIN_MM;
const clockOf = (hour: HourPoint | undefined): string => (hour ? clock(hour.at) : "later");

/** Says when rain starts or stops in the next twelve hours, or that none is expected. Null when there is no forecast. */
export function rainOutlook(view: WeatherView): string | null {
  const hours = view.hours.slice(0, LOOK_AHEAD_HOURS);
  const first = hours[0];
  if (!first) return null;
  const change = hours.findIndex((h) => wet(h) !== wet(first));
  const at = clockOf(hours[change]);
  if (wet(first)) return change < 0 ? "rain for the next twelve hours" : `rain easing around ${at}`;
  return change < 0 ? "no rain in the next twelve hours" : `rain from ${at}`;
}

function tomorrow(view: WeatherView): { condition: string; high: number } | null {
  const next = view.days[1];
  const condition = next ? conditionLabel(next.condition) : null;
  return next && condition ? { condition, high: round(next.high) } : null;
}

/** The facts a model may use for the weather line. */
export function weatherFacts(view: WeatherView, now: Date): Facts {
  const next = tomorrow(view);
  return {
    partOfDay: partOfDay(now.getHours()),
    conditionNow: view.condition,
    temperatureC: view.temp === null ? null : round(view.temp),
    todayHighC: view.high === null ? null : round(view.high),
    todayLowC: view.low === null ? null : round(view.low),
    windKmh: view.windSpeed === null ? null : round(view.windSpeed),
    windFrom: view.windFrom,
    rainOutlook: rainOutlook(view),
    tomorrow: next ? `${next.condition}, high of ${next.high}` : null,
  };
}

/** Changes when there is something new to say: a new hour, a change of weather, a degree or a change in the rain outlook. */
export function weatherKey(view: WeatherView, now: Date): string {
  return [now.getHours(), view.code ?? "-", view.temp === null ? "-" : round(view.temp), rainOutlook(view) ?? "-"].join("|");
}

const capital = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

const nowSentence = (view: WeatherView): string | null =>
  view.condition && view.temp !== null ? `${capital(view.condition)}, ${round(view.temp)} degrees.` : null;

const rainSentence = (view: WeatherView): string | null => {
  const rain = rainOutlook(view);
  return rain ? `${capital(rain)}.` : null;
};

const tomorrowSentence = (view: WeatherView): string | null => {
  const next = tomorrow(view);
  return next ? `Tomorrow: ${next.condition}, ${next.high} at best.` : null;
};

const windSentence = (view: WeatherView, dials: Personality): string | null => {
  const strong = view.windSpeed !== null && view.windSpeed >= STRONG_WIND_KMH && view.windFrom !== null;
  return dials.honesty >= 50 && strong && view.windSpeed !== null ? `Wind is ${round(view.windSpeed)} km/h from the ${view.windFrom}.` : null;
};

const quipSentence = (view: WeatherView, dials: Personality): string | null =>
  dials.humour >= 50 && view.condition ? (quipFor(view.condition) ?? null) : null;

/** The fixed line for the weather screen. Every sentence is true of the data. Honesty adds the wind, humour a dry remark. */
export function weatherNote(view: WeatherView, dials: Personality): string {
  const parts = [nowSentence(view), rainSentence(view), tomorrowSentence(view), windSentence(view, dials), quipSentence(view, dials)];
  const said = parts.filter((part): part is string => part !== null);
  return said.length > 0 ? said.join(" ") : "No weather information yet.";
}
