/** The two dials, each from 0 to 100. */
export interface Personality {
  humour: number;
  honesty: number;
  /** What the assistant is called. Optional, and the owner can change it. */
  name?: string;
}

export interface AmbientFacts {
  hour: number;
  room: string;
  indoor: number | null;
  target: number | null;
  outside: number | null;
  condition: string | null;
}

const QUIPS: Record<string, string> = {
  rainy: "Rain. Nobody is surprised.",
  pouring: "Rain. Nobody is surprised.",
  sunny: "Suspiciously nice.",
  cloudy: "Grey, but dependable.",
  foggy: "Visibility is a rumour.",
  snowy: "Biscuits are advised.",
};

/** A dry remark for a kind of weather, or undefined when there is none. */
export const quipFor = (condition: string): string | undefined => QUIPS[condition];

const fmt = (n: number): string => String(Number(n.toFixed(1)));

function greeting(hour: number): string {
  if (hour < 5) return "It is very late.";
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

function heatingLine(facts: AmbientFacts): string | null {
  const { indoor, target } = facts;
  if (indoor === null || target === null) return null;
  const verdict = indoor > target ? " The room is above target." : "";
  return `The radiator target is ${fmt(target)}.${verdict}`;
}

/**
 * One line for the ambient screen. Honesty adds blunt facts, humour adds a quip.
 * Every sentence states something that is true of the data. Nothing is invented.
 */
export function ambientNote(facts: AmbientFacts, dials: Personality): string {
  const parts = [greeting(facts.hour)];
  if (facts.indoor !== null) parts.push(`${facts.room} is ${fmt(facts.indoor)} degrees.`);
  if (facts.outside !== null && facts.condition) {
    parts.push(`Outside it is ${fmt(facts.outside)} and ${facts.condition}.`);
  }
  const heating = dials.honesty >= 50 ? heatingLine(facts) : null;
  if (heating) parts.push(heating);
  const quip = dials.humour >= 50 && facts.condition ? QUIPS[facts.condition] : undefined;
  if (quip) parts.push(quip);
  return parts.join(" ");
}
