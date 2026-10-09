function hash(text: string): number {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

/** A repeatable background for a playlist tile, made from its name. We have no real cover art for idle playlists. */
export function coverBackground(seed: string): string {
  const hue = hash(seed) % 360;
  const rings = `radial-gradient(circle at 70% 35%, hsl(${(hue + 160) % 360} 70% 70% / 0.85) 0 7%, transparent 7.5%)`;
  const glow = `radial-gradient(circle at 70% 35%, #ffffff22 0 22%, transparent 22.5% 30%, #ffffff18 30.5% 31%, transparent 31.5%)`;
  const base = `linear-gradient(135deg, hsl(${hue} 45% 14%), hsl(${(hue + 40) % 360} 55% 36%))`;
  return `${rings}, ${glow}, ${base}`;
}
