import type { WeatherView } from "../state/weatherView";
import { nextSunEvent } from "../state/weatherView";
import { el, setText } from "./dom";
import { weatherIcon } from "./weatherIcons";

export interface Part {
  element: HTMLElement;
  update(view: WeatherView, now: Date): void;
}

const hhmm = (d: Date): string => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const whole = (n: number | null): string => (n === null ? "--" : String(Math.round(n)));

/** The big temperature, the condition with its symbol, and today's high and low. */
export function createCurrent(): Part {
  const element = el("div", "w-now");
  const temp = el("div", "w-temp mono");
  const row = el("div", "w-cond");
  const symbol = row.appendChild(el("span", "w-symbol"));
  const word = row.appendChild(el("span", "w-word"));
  const range = el("div", "w-range mono");
  element.append(temp, row, range);
  return {
    element,
    update(view) {
      setText(temp, `${whole(view.temp)}°`);
      setText(word, view.condition ?? "");
      const icon = weatherIcon(view.code);
      if (symbol.dataset["code"] !== (view.code ?? "")) {
        symbol.dataset["code"] = view.code ?? "";
        symbol.innerHTML = icon;
      }
      setText(range, view.high === null ? "" : `High ${whole(view.high)}°   Low ${whole(view.low)}°`);
    },
  };
}

function pair(label: string): { box: HTMLElement; value: HTMLElement } {
  const box = el("div", "w-pair");
  box.append(el("span", "w-label", label));
  const value = box.appendChild(el("span", "w-value mono"));
  return { box, value };
}

/** Wind (with an arrow showing where it blows to), humidity, pressure, UV and the next sunrise or sunset. */
export function createDetails(): Part {
  const element = el("div", "w-details");
  const wind = pair("Wind");
  const arrow = el("span", "w-arrow");
  arrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v15M6 12l6 7 6-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  wind.value.append(arrow);
  const windText = wind.value.appendChild(el("span"));
  const humidity = pair("Humidity");
  const pressure = pair("Pressure");
  const uv = pair("UV");
  const sun = pair("Sun");
  element.append(wind.box, humidity.box, pressure.box, uv.box, sun.box);
  return {
    element,
    update(view, now) {
      setText(windText, view.windSpeed === null ? "--" : `${whole(view.windSpeed)} km/h ${view.windFrom ?? ""}`);
      arrow.style.transform = `rotate(${view.windBearing ?? 0}deg)`;
      arrow.hidden = view.windBearing === null;
      setText(humidity.value, view.humidity === null ? "--" : `${whole(view.humidity)}%`);
      setText(pressure.value, view.pressure === null ? "--" : `${whole(view.pressure)} hPa`);
      setText(uv.value, view.uv === null ? "--" : view.uv.toFixed(1));
      const event = nextSunEvent(view, now);
      setText(sun.value, event ? `${event.label} ${hhmm(event.at)}` : "--");
    },
  };
}
