import type { Facts } from "./llm";

const NUMBER = /\d+(?:\.\d+)?/g;
const MAX_LENGTH = 220;

const UNITS: Record<string, number> = {
  two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const WORDS = new RegExp(`\\b(?:(${Object.keys(TENS).join("|")})(?:[- ](${Object.entries(UNITS).filter(([, n]) => n < 10).map(([w]) => w).join("|")}))?|(${Object.keys(UNITS).join("|")}))\\b`, "gi");

/** Numbers written as words, such as "twenty-three". "One" is left out because it is also a pronoun. */
function wordNumbersIn(text: string): number[] {
  return [...text.matchAll(WORDS)].map(([, tens, unit, single]) => {
    if (single) return UNITS[single.toLowerCase()] ?? 0;
    return (TENS[(tens ?? "").toLowerCase()] ?? 0) + (unit ? (UNITS[unit.toLowerCase()] ?? 0) : 0);
  });
}

const DECADE = /\b(?:twenties|thirties|forties|fifties|sixties|seventies|eighties|nineties|noughties|aughts)\b/gi;

const numbersIn = (text: string): number[] => (text.match(NUMBER) ?? []).map(Number);

function factNumbers(facts: Facts): number[] {
  return Object.values(facts).flatMap((value) => (value === null ? [] : numbersIn(String(value))));
}

/** A decade such as "nineties" is a claim about the music. It is fine only if the facts already say it. */
function decadesAreGrounded(text: string, facts: Facts): boolean {
  const known = Object.values(facts).join(" ").toLowerCase();
  return (text.match(DECADE) ?? []).every((word) => known.includes(word.toLowerCase()));
}

/** A number in the reply, in digits or in words, is fine if the facts contain it or a value that rounds to it. */
export function numbersAreGrounded(text: string, facts: Facts): boolean {
  const known = factNumbers(facts);
  return [...numbersIn(text), ...wordNumbersIn(text)].every((n) => known.some((fact) => fact === n || Math.round(fact) === n));
}

/** Checks a model reply before it reaches the screen. A reply that fails is thrown away. */
export function isAcceptable(text: string, facts: Facts): boolean {
  if (text.length === 0 || text.length > MAX_LENGTH) return false;
  if (/[\n\r]/.test(text)) return false;
  return numbersAreGrounded(text, facts) && decadesAreGrounded(text, facts);
}
