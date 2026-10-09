import { buildPowerView, type PowerView } from "../state/power";
import { powerNote } from "../state/powerNote";
import { el } from "./dom";
import { createDiagram, createPanel } from "./powerParts";
import { createSpeech } from "./speech";
import type { Scene, SceneContext } from "./scene";

import "./styles/power.css";

const pounds = (n: number | null): string => (n === null ? "--" : `£${n.toFixed(2)}`);
const one = (n: number | null): string => (n === null ? "--" : String(Number(n.toFixed(1))));

function rateDetail(view: PowerView): string {
  if (view.offPeak === true) return "Cheap rate now";
  return view.nextRate === null ? "" : `Next ${one(view.nextRate)}p`;
}

function carDetail(view: PowerView): string {
  if (view.carPlugged === null) return "";
  if (!view.carPlugged) return "Not plugged in";
  return (view.car ?? 0) >= 0.5 ? "Charging" : "Plugged in";
}

/** Where power comes from and where it goes: solar, grid, house and car, plus what it costs. */
export function createPowerScene(): Scene {
  const element = Object.assign(el("section", "scene"), { id: "s-power" });
  const diagram = createDiagram();
  const rate = createPanel("Rate now", "rate");
  const used = createPanel("Used today", "used");
  const solar = createPanel("Solar today", "solar");
  const car = createPanel("Car", "car");
  const strip = el("div", "strip mono");
  strip.append(rate.element, used.element, solar.element, car.element);
  const speech = createSpeech();
  element.append(diagram.element, strip, speech.element);

  return {
    id: "power",
    label: "Energy",
    element,
    update({ entities, config, speak }: SceneContext): void {
      const view = buildPowerView(entities, config.power);
      diagram.update(view);
      rate.update(one(view.rate), "p", rateDetail(view));
      used.update(pounds(view.cost), "", view.usage === null ? "" : `${one(view.usage)} kWh`);
      const total = view.solarToday === null ? null : view.solarToday + (view.solarLeft ?? 0);
      solar.update(one(view.solarToday), "kWh", view.solarLeft === null ? "" : `${one(view.solarLeft)} kWh still to come`, total ? (100 * (view.solarToday ?? 0)) / total : null);
      car.update(view.carCharge === null ? "--" : `${Math.round(view.carCharge)}`, view.carCharge === null ? "" : "%", carDetail(view), view.carCharge);
      speech.say(powerNote(view, config.personality), speak);
    },
  };
}
