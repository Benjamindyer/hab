import { KNOB_MAX_DEGREES, KNOB_MIN_DEGREES, levelToDegrees, pointToLevel } from "../state/knob";
import { el } from "./dom";

export interface VolumeKnob {
  element: HTMLElement;
  /** Shows the volume HA reports. Ignored while it is being turned, and for a moment after. */
  set(level: number): void;
}

const NS = "http://www.w3.org/2000/svg";
const TICKS = 21;
const SEND_EVERY_MS = 200;
const SETTLE_MS = 2000;

function svg(tag: string, attributes: Record<string, string>): SVGElement {
  const node = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

function tickMarks(): SVGElement[] {
  return Array.from({ length: TICKS }, (_, i) => {
    const degrees = KNOB_MIN_DEGREES + (i / (TICKS - 1)) * (KNOB_MAX_DEGREES - KNOB_MIN_DEGREES);
    const tick = svg("line", { x1: "50", y1: "5", x2: "50", y2: i % 5 === 0 ? "13" : "10", class: "tick", transform: `rotate(${degrees} 50 50)` });
    tick.dataset["i"] = String(i);
    return tick;
  });
}

/**
 * A rotary volume knob, like the one on a record player. Drag round it, or touch where you want
 * the volume. It is quiet until it is touched.
 */
export function createVolumeKnob(onVolume: (level: number) => void): VolumeKnob {
  const element = el("div", "knob");
  element.setAttribute("role", "slider");
  element.setAttribute("aria-label", "Volume");
  const dial = svg("svg", { viewBox: "0 0 100 100" });
  const ticks = tickMarks();
  const cap = svg("circle", { cx: "50", cy: "50", r: "31", class: "cap" });
  const pointer = svg("line", { x1: "50", y1: "26", x2: "50", y2: "40", class: "pointer" });
  dial.append(...ticks, cap, pointer);
  const readout = el("div", "knob-readout mono", "");
  element.append(dial, readout);

  let level = 0;
  let lastTouched = Number.NEGATIVE_INFINITY;
  let lastSent = 0;

  const show = (value: number): void => {
    level = value;
    pointer.setAttribute("transform", `rotate(${levelToDegrees(value)} 50 50)`);
    ticks.forEach((tick, i) => tick.classList.toggle("lit", i / (TICKS - 1) <= value + 0.001));
    element.setAttribute("aria-valuenow", String(Math.round(value * 100)));
    readout.textContent = String(Math.round(value * 100));
  };

  const turnTo = (event: PointerEvent, final: boolean): void => {
    const box = element.getBoundingClientRect();
    show(pointToLevel(event.clientX - (box.left + box.width / 2), event.clientY - (box.top + box.height / 2)));
    lastTouched = Date.now();
    if (final || lastTouched - lastSent >= SEND_EVERY_MS) {
      lastSent = lastTouched;
      onVolume(level);
    }
  };

  element.addEventListener("pointerdown", (event) => {
    element.setPointerCapture(event.pointerId);
    element.classList.add("active");
    turnTo(event, false);
  });
  element.addEventListener("pointermove", (event) => {
    if (element.hasPointerCapture(event.pointerId)) turnTo(event, false);
  });
  const release = (event: PointerEvent): void => {
    if (!element.hasPointerCapture(event.pointerId)) return;
    turnTo(event, true);
    element.classList.remove("active");
  };
  element.addEventListener("pointerup", release);
  element.addEventListener("pointercancel", release);

  show(0);
  return { element, set: (value) => { if (Date.now() - lastTouched > SETTLE_MS) show(value); } };
}
