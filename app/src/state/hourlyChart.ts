import type { HourPoint } from "./forecast";

export interface ChartPoint {
  x: number;
  y: number;
  temp: number;
  at: Date;
}

export interface ChartBar {
  x: number;
  height: number;
  mm: number;
}

export interface ChartGeometry {
  points: ChartPoint[];
  bars: ChartBar[];
  /** Every third hour, for the axis. */
  labels: { x: number; text: string }[];
  /** The wind at every third hour, for the wind row. */
  winds: { x: number; speed: number; bearing: number | null }[];
  /** The warmest and coolest points, to label. */
  warmest: ChartPoint | null;
  coolest: ChartPoint | null;
}

export interface ChartBox {
  width: number;
  /** The height for the temperature line. */
  height: number;
  /** The height for the rain bars, under the line. */
  barHeight: number;
  /** Space kept clear above and below the line so labels fit. */
  pad: number;
}

const MIN_RAIN_SCALE_MM = 2;

/** Works out where everything goes on the hourly chart, so drawing it is only a matter of joining the points. */
export function chartGeometry(hours: HourPoint[], box: ChartBox): ChartGeometry {
  if (hours.length === 0) return { points: [], bars: [], labels: [], winds: [], warmest: null, coolest: null };
  const temps = hours.map((h) => h.temp);
  const low = Math.min(...temps);
  const span = Math.max(...temps) - low || 1;
  const step = hours.length > 1 ? box.width / (hours.length - 1) : 0;
  const maxRain = Math.max(MIN_RAIN_SCALE_MM, ...hours.map((h) => h.rain));
  const points = hours.map((h, i) => ({ x: i * step, y: box.pad + (1 - (h.temp - low) / span) * (box.height - 2 * box.pad), temp: h.temp, at: h.at }));
  return {
    points,
    bars: hours.map((h, i) => ({ x: i * step, height: (h.rain / maxRain) * box.barHeight, mm: h.rain })),
    labels: hours.flatMap((h, i) => (h.at.getHours() % 3 === 0 ? [{ x: i * step, text: String(h.at.getHours()).padStart(2, "0") }] : [])),
    winds: hours.flatMap((h, i) => (h.at.getHours() % 3 === 0 && h.windSpeed !== null ? [{ x: i * step, speed: h.windSpeed, bearing: h.windBearing }] : [])),
    warmest: points.reduce((a, b) => (b.temp > a.temp ? b : a)),
    coolest: points.reduce((a, b) => (b.temp < a.temp ? b : a)),
  };
}
