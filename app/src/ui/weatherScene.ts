import { buildWeatherView } from "../state/weatherView";
import { weatherFacts, weatherKey, weatherNote } from "../state/weatherNote";
import { el, renderWhenChanged } from "./dom";
import type { Scene, SceneContext } from "./scene";
import { buildHourlyChart } from "./weatherChart";
import { createDayOverlay } from "./weatherDetail";
import { createSpeech } from "./speech";
import { dayColumns } from "./weatherDays";
import { createCurrent, createDetails } from "./weatherParts";

import "./styles/weather.css";

/** The weather: the temperature now, the next day hour by hour, and the next few days. */
export function createWeatherScene(): Scene {
  const element = Object.assign(el("section", "scene"), { id: "s-weather" });
  const current = createCurrent();
  const details = createDetails();
  const top = el("div", "w-top");
  top.append(current.element, details.element);
  const chart = el("div", "w-chart");
  const days = el("div", "w-days");
  const speech = createSpeech();
  const overlay = createDayOverlay();
  element.append(top, chart, days, speech.element, overlay.element);

  return {
    id: "weather",
    label: "Weather",
    element,
    update({ entities, config, now, commentary, forecast, speak }: SceneContext): void {
      const id = config.ambient.weather;
      if (!id) return speech.say("Choose a weather entity in Setup to see the weather here.", speak);
      const data = forecast.get(id);
      const view = buildWeatherView(entities.get(id), data, entities.get("sun.sun"), now);
      current.update(view, now);
      details.update(view, now);
      renderWhenChanged(chart, view.hours.map((h) => `${h.at.getTime()}:${h.temp}:${h.rain}`).join("|"), () => {
        const chartElement = buildHourlyChart(view.hours);
        return chartElement ? [chartElement] : [];
      });
      renderWhenChanged(days, `${now.getDate()}|${view.days.map((d) => `${d.high}${d.low}${d.rain}${d.condition}`).join("|")}`, () => dayColumns(view.days, now, overlay.open));
      overlay.update(view.days, data.hourly, now);
      const request = { kind: "weather" as const, key: weatherKey(view, now), fallback: weatherNote(view, config.personality), facts: weatherFacts(view, now), hold: data.status === "loading" };
      speech.say(commentary.line(request, config.personality), speak);
    },
  };
}
