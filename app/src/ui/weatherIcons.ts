const OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">';
const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
const SMALL_SUN = '<circle cx="8" cy="8" r="3"/><path d="M8 2v1M2 8h1M3.8 3.8l.7.7M12.2 3.8l-.7.7"/>';
const MOON = '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>';
const CLOUD = '<path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 9.5a4.2 4.2 0 0 1 0 8.5z"/>';
const HIGH_CLOUD = '<path d="M7 15a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 6.5a4.2 4.2 0 0 1 0 8.5z"/>';
const RAIN = '<path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>';
const HEAVY_RAIN = '<path d="M7 17l-1.2 4M10.5 17l-1.2 4M14 17l-1.2 4M17.5 17l-1.2 4"/>';
const SNOW = '<path d="M8 18v3M12 17v3M16 18v3M6.8 19.5h2.4M10.8 18.5h2.4M14.8 19.5h2.4"/>';
const BOLT = '<path d="M12.5 14l-2.5 4h3l-1 4"/>';
const FOG = '<path d="M5 10h14M3 14h18M6 18h12"/>';
const WIND = '<path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5M3 14h15a2.5 2.5 0 1 1-2.5 2.5M3 19h7"/>';
const HAIL = '<path d="M8 18v.5M12 17v.5M16 18v.5M10 20.5v.5M14 20.5v.5"/>';

const SYMBOLS: Record<string, string> = {
  sunny: SUN,
  "clear-night": MOON,
  cloudy: CLOUD,
  partlycloudy: SMALL_SUN + CLOUD.replace("M7 18", "M9 20"),
  rainy: HIGH_CLOUD + RAIN,
  pouring: HIGH_CLOUD + HEAVY_RAIN,
  snowy: HIGH_CLOUD + SNOW,
  "snowy-rainy": HIGH_CLOUD + SNOW,
  lightning: HIGH_CLOUD + BOLT,
  "lightning-rainy": HIGH_CLOUD + BOLT,
  fog: FOG,
  hail: HIGH_CLOUD + HAIL,
  windy: WIND,
  "windy-variant": WIND,
};

/** A line drawing for a Home Assistant weather condition. Unknown conditions get a plain cloud. */
export function weatherIcon(condition: string | null | undefined): string {
  return `${OPEN}${SYMBOLS[condition ?? ""] ?? CLOUD}</svg>`;
}
