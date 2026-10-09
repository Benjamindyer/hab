const LABELS: Record<string, string> = {
  "clear-night": "clear",
  cloudy: "cloudy",
  exceptional: "unusual",
  fog: "foggy",
  hail: "hailing",
  lightning: "stormy",
  "lightning-rainy": "stormy",
  partlycloudy: "partly cloudy",
  pouring: "pouring",
  rainy: "rainy",
  snowy: "snowy",
  "snowy-rainy": "sleety",
  sunny: "sunny",
  windy: "windy",
  "windy-variant": "windy",
};

/** Turns a Home Assistant weather state into a short word for display. */
export function conditionLabel(state: string | undefined): string | null {
  if (!state) return null;
  return LABELS[state] ?? null;
}
