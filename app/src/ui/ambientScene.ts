import { ambientFacts, ambientKey, buildAmbientView } from "../state/ambient";
import { buildMusicView } from "../state/music";
import { nowPlayingSummary } from "../state/nowPlaying";
import { setText } from "./dom";
import { createNowPlayingWidget } from "./nowPlayingWidget";
import type { Scene, SceneContext } from "./scene";

const degrees = (value: number | null): string => (value === null ? "--" : `${value.toFixed(1)}°`);

function readout(side: "left" | "right"): { box: HTMLElement; label: HTMLElement; value: HTMLElement } {
  const box = document.createElement("div");
  box.className = `readout ${side}`;
  const label = box.appendChild(document.createElement("span"));
  const value = box.appendChild(document.createElement("strong"));
  value.className = "mono";
  return { box, label, value };
}

function textBlock(className: string): HTMLElement {
  const block = document.createElement("div");
  block.className = className;
  return block;
}

/** Idle screen: clock, date, two readouts and one line of personality. */
export function createAmbientScene(): Scene {
  const element = document.createElement("section");
  element.id = "s-ambient";
  element.className = "scene";
  const indoor = readout("left");
  const outside = readout("right");
  const clock = textBlock("clock mono");
  const date = textBlock("date");
  const note = textBlock("note");
  const widget = createNowPlayingWidget();
  element.append(indoor.box, outside.box, clock, date, widget.element, note);

  return {
    id: "ambient",
    element,
    update({ entities, config, now, commentary, haUrl, navigate }: SceneContext): void {
      const music = config.music ? buildMusicView(entities, config.music, now, haUrl) : null;
      widget.update(music ? nowPlayingSummary(music) : null, () => navigate("music"));
      const view = buildAmbientView(entities, config.ambient, config.personality, now);
      setText(indoor.label, view.room);
      setText(indoor.value, degrees(view.indoor));
      setText(outside.label, "Outside");
      setText(outside.value, view.outside === null ? "--" : `${degrees(view.outside)} ${view.condition ?? ""}`);
      setText(clock, view.time);
      setText(date, view.date);
      const request = { kind: "ambient" as const, key: ambientKey(view), fallback: view.note, facts: ambientFacts(view) };
      setText(note, commentary.line(request, config.personality));
    },
  };
}
