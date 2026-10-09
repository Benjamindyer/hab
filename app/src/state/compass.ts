const POINTS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

/** The compass point the wind is coming from, for example 254 degrees is WSW. */
export function compassPoint(bearing: number): string {
  const index = Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16;
  return POINTS[index] ?? "N";
}
