import type { HourPoint } from "../state/forecast";
import { chartGeometry, type ChartGeometry, type ChartPoint } from "../state/hourlyChart";
import { el } from "./dom";

// The chart is four rows, top to bottom: the temperature curve, rain bars, a wind row and the hours.
const ROWS = { curve: 130, rain: 34, wind: 36, hours: 26 };
const BOX = { width: 1000, height: ROWS.curve, barHeight: ROWS.rain, pad: 22 };
const TOTAL = ROWS.curve + ROWS.rain + ROWS.wind + ROWS.hours;
const ARROW = '<svg viewBox="0 0 24 24"><path d="M12 3v15M6 12l6 7 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const pct = (value: number, of: number): string => `${((value / of) * 100).toFixed(2)}%`;
const path = (g: ChartGeometry): string => g.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

/** The curve and its soft fill. It is stretched to fit, so nothing with a shape of its own is drawn in it. */
function curve(g: ChartGeometry): HTMLElement {
  const box = el("div", "hc-curve");
  const last = g.points[g.points.length - 1];
  const first = g.points[0];
  box.style.height = pct(ROWS.curve, TOTAL);
  box.innerHTML = `<svg viewBox="0 0 ${BOX.width} ${ROWS.curve}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3ee" stop-opacity="0.22"/><stop offset="1" stop-color="#cfe3ee" stop-opacity="0"/></linearGradient></defs>
    <path d="${path(g)} L${last?.x ?? 0} ${ROWS.curve} L${first?.x ?? 0} ${ROWS.curve} Z" fill="url(#wfill)"/><path d="${path(g)}" class="c-line"/></svg>`;
  return box;
}

/** A dot on the curve with its temperature, drawn as ordinary page elements so they keep their shape. */
function marker(point: ChartPoint, above: boolean): HTMLElement[] {
  const left = pct(point.x, BOX.width);
  const top = pct(point.y, TOTAL);
  const dot = el("span", "hc-dot");
  const label = el("span", above ? "hc-temp above" : "hc-temp below", `${Math.round(point.temp)}°`);
  for (const node of [dot, label]) {
    node.style.left = left;
    node.style.top = top;
  }
  if (point.x < 70) label.classList.add("edge-left");
  if (point.x > BOX.width - 70) label.classList.add("edge-right");
  return [dot, label];
}

function rainRow(g: ChartGeometry): HTMLElement[] {
  const base = el("i", "hc-baseline");
  base.style.top = pct(ROWS.curve + ROWS.rain, TOTAL);
  const wettest = g.bars.reduce((a, b) => (b.mm > a.mm ? b : a), { x: 0, height: 0, mm: 0 });
  const bars = g.bars
    .filter((b) => b.height > 0.5)
    .map((b) => {
      const bar = el("i", "hc-rain");
      bar.style.left = pct(b.x, BOX.width);
      bar.style.height = pct(b.height, TOTAL);
      bar.style.bottom = pct(ROWS.wind + ROWS.hours, TOTAL);
      return bar;
    });
  const note = wettest.mm >= 0.2 ? el("span", "hc-mm mono", `${wettest.mm.toFixed(1)} mm`) : el("span", "hc-dry", "No rain");
  note.style.top = pct(ROWS.curve + 2, TOTAL);
  if (wettest.mm >= 0.2) note.style.left = pct(wettest.x, BOX.width);
  else note.classList.add("at-end");
  return [base, ...bars, note];
}

function windRow(g: ChartGeometry): HTMLElement[] {
  const items = g.winds.map((w) => {
    const item = el("span", "hc-wind mono");
    item.style.left = pct(w.x, BOX.width);
    item.style.top = pct(ROWS.curve + ROWS.rain + 6, TOTAL);
    const arrow = el("span", "hc-arrow");
    arrow.innerHTML = ARROW;
    arrow.style.transform = `rotate(${w.bearing ?? 0}deg)`;
    arrow.hidden = w.bearing === null;
    item.append(arrow, el("span", "", String(Math.round(w.speed))));
    return item;
  });
  return items;
}

function hourLabels(g: ChartGeometry): HTMLElement[] {
  return g.labels.map((l) => {
    const label = el("span", "hc-hour mono", l.text);
    label.style.left = pct(l.x, BOX.width);
    return label;
  });
}

/** The hourly chart: a temperature curve with its warmest and coolest points, rain, wind, and the hours along the bottom. */
export function buildHourlyChart(hours: HourPoint[]): HTMLElement | null {
  const g = chartGeometry(hours, BOX);
  if (g.points.length < 2) return null;
  const chart = el("div", "hc");
  chart.setAttribute("role", "img");
  chart.setAttribute("aria-label", "Temperature, rain and wind for the next day");
  chart.append(curve(g), ...rainRow(g), ...windRow(g), ...hourLabels(g));
  if (g.warmest) chart.append(...marker(g.warmest, true));
  if (g.coolest && g.coolest !== g.warmest) chart.append(...marker(g.coolest, false));
  return chart;
}
