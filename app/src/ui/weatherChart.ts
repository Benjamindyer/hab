import type { HourPoint } from "../state/forecast";
import { chartGeometry, type ChartGeometry } from "../state/hourlyChart";

const BOX = { width: 1000, height: 150, barHeight: 34, pad: 24 };
const TOTAL_HEIGHT = BOX.height + BOX.barHeight + 30;

const line = (g: ChartGeometry): string => g.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

function marker(label: string, point: { x: number; y: number }, above: boolean): string {
  const anchor = point.x < 60 ? "start" : point.x > 940 ? "end" : "middle";
  return `<circle cx="${point.x}" cy="${point.y}" r="3.2" class="c-dot"/><text x="${point.x}" y="${point.y + (above ? -10 : 18)}" text-anchor="${anchor}" class="c-temp">${label}</text>`;
}

/** The hourly chart as SVG: a temperature line, rain bars underneath, and hours along the bottom. */
export function hourlyChartSvg(hours: HourPoint[]): string {
  const g = chartGeometry(hours, BOX);
  if (g.points.length < 2) return "";
  const last = g.points[g.points.length - 1];
  const first = g.points[0];
  const area = `${line(g)} L${last?.x ?? 0} ${BOX.height} L${first?.x ?? 0} ${BOX.height} Z`;
  const bars = g.bars
    .filter((b) => b.height > 0.5)
    .map((b) => `<rect x="${(b.x - 7).toFixed(1)}" y="${(BOX.height + BOX.barHeight - b.height).toFixed(1)}" width="14" height="${b.height.toFixed(1)}" class="c-rain"/>`)
    .join("");
  const labels = g.labels.map((l) => `<text x="${l.x.toFixed(1)}" y="${TOTAL_HEIGHT - 4}" text-anchor="middle" class="c-hour">${l.text}</text>`).join("");
  const marks = [g.warmest && marker(`${Math.round(g.warmest.temp)}°`, g.warmest, true), g.coolest && g.coolest !== g.warmest ? marker(`${Math.round(g.coolest.temp)}°`, g.coolest, false) : ""].join("");
  return `<svg viewBox="-10 0 1020 ${TOTAL_HEIGHT}" preserveAspectRatio="none" role="img" aria-label="Temperature and rain for the next day">
    <defs><linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3ee" stop-opacity="0.22"/><stop offset="1" stop-color="#cfe3ee" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#wfill)"/><path d="${line(g)}" class="c-line"/>${bars}${marks}${labels}</svg>`;
}
