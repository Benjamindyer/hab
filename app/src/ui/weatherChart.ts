import type { HourPoint } from "../state/forecast";
import { chartGeometry, type ChartGeometry, type ChartPoint } from "../state/hourlyChart";
import { el } from "./dom";

const BOX = { width: 1000, height: 150, barHeight: 34, pad: 24 };
const LABEL_ROOM = 28;
const TOTAL = BOX.height + BOX.barHeight + LABEL_ROOM;

const pct = (value: number, of: number): string => `${((value / of) * 100).toFixed(2)}%`;
const path = (g: ChartGeometry): string => g.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

/** The curve and its soft fill. It is stretched to fit, so nothing with a shape of its own is drawn in it. */
function curve(g: ChartGeometry): HTMLElement {
  const box = el("div", "hc-curve");
  const last = g.points[g.points.length - 1];
  const first = g.points[0];
  box.style.height = pct(BOX.height, TOTAL);
  box.innerHTML = `<svg viewBox="0 0 ${BOX.width} ${BOX.height}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3ee" stop-opacity="0.22"/><stop offset="1" stop-color="#cfe3ee" stop-opacity="0"/></linearGradient></defs>
    <path d="${path(g)} L${last?.x ?? 0} ${BOX.height} L${first?.x ?? 0} ${BOX.height} Z" fill="url(#wfill)"/><path d="${path(g)}" class="c-line"/></svg>`;
  return box;
}

/** A dot on the curve with its temperature, drawn as ordinary page elements so they keep their shape. */
function marker(point: ChartPoint, above: boolean): HTMLElement[] {
  const left = pct(point.x, BOX.width);
  const top = pct(point.y, TOTAL);
  const dot = el("span", "hc-dot");
  dot.style.left = left;
  dot.style.top = top;
  const label = el("span", above ? "hc-temp above" : "hc-temp below", `${Math.round(point.temp)}°`);
  label.style.left = left;
  label.style.top = top;
  if (point.x < 70) label.classList.add("edge-left");
  if (point.x > BOX.width - 70) label.classList.add("edge-right");
  return [dot, label];
}

function rainBars(g: ChartGeometry): HTMLElement[] {
  return g.bars
    .filter((b) => b.height > 0.5)
    .map((b) => {
      const bar = el("i", "hc-rain");
      bar.style.left = pct(b.x, BOX.width);
      bar.style.height = pct(b.height, TOTAL);
      bar.style.bottom = pct(LABEL_ROOM, TOTAL);
      return bar;
    });
}

function hourLabels(g: ChartGeometry): HTMLElement[] {
  return g.labels.map((l) => {
    const label = el("span", "hc-hour mono", l.text);
    label.style.left = pct(l.x, BOX.width);
    return label;
  });
}

/** The hourly chart: a temperature curve, the warmest and coolest points, rain bars under it, and the hours along the bottom. */
export function buildHourlyChart(hours: HourPoint[]): HTMLElement | null {
  const g = chartGeometry(hours, BOX);
  if (g.points.length < 2) return null;
  const chart = el("div", "hc");
  chart.setAttribute("role", "img");
  chart.setAttribute("aria-label", "Temperature and rain for the next day");
  chart.append(curve(g), ...rainBars(g), ...hourLabels(g));
  if (g.warmest) chart.append(...marker(g.warmest, true));
  if (g.coolest && g.coolest !== g.warmest) chart.append(...marker(g.coolest, false));
  return chart;
}
