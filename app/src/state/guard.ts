import type { Facts } from "./llm";

const NUMBER = /\d+(?:\.\d+)?/g;
const MAX_LENGTH = 220;

const numbersIn = (text: string): number[] => (text.match(NUMBER) ?? []).map(Number);

function factNumbers(facts: Facts): number[] {
  return Object.values(facts).flatMap((value) => (value === null ? [] : numbersIn(String(value))));
}

/** A number in the reply is fine if the facts contain it, or contain a value that rounds to it. */
export function numbersAreGrounded(text: string, facts: Facts): boolean {
  const known = factNumbers(facts);
  return numbersIn(text).every((n) => known.some((fact) => fact === n || Math.round(fact) === n));
}

/** Checks a model reply before it reaches the screen. A reply that fails is thrown away. */
export function isAcceptable(text: string, facts: Facts): boolean {
  if (text.length === 0 || text.length > MAX_LENGTH) return false;
  if (/[\n\r]/.test(text)) return false;
  return numbersAreGrounded(text, facts);
}
