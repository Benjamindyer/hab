import type { Facts } from "./llm";
import type { Personality } from "./personality";

export type CommentKind = "ambient" | "music";

const SITUATION: Record<CommentKind, string> = {
  ambient: "The home screen is idle. Say one thing about the room, the weather or the time of day.",
  music: "Music is on. Say one thing about what is playing.",
};

function humourWords(humour: number): string {
  if (humour < 25) return "No jokes. Be plain.";
  if (humour < 60) return "A light touch of dry wit.";
  return "Clearly funny, in a dry understated way.";
}

function honestyWords(honesty: number): string {
  if (honesty < 25) return "Be gentle. Leave out anything unflattering.";
  if (honesty < 60) return "Be straightforward.";
  return "Be blunt. Say plainly what the facts show, even when it is unflattering.";
}

/** The instructions sent to the model. Facts are given as data, and the rules forbid inventing more. */
export function buildInstructions(kind: CommentKind, facts: Facts, dials: Personality, name: string): string {
  return [
    `You are ${name}, the assistant in a family home. You write one short line for the home screen.`,
    SITUATION[kind],
    `Humour ${dials.humour} out of 100: ${humourWords(dials.humour)}`,
    `Honesty ${dials.honesty} out of 100: ${honestyWords(dials.honesty)}`,
    "Rules: use only the facts below. Never invent facts, numbers, names or events.",
    "At most two short sentences and under 200 characters. Plain text only: no emoji, quotation marks or markdown. British English.",
    `Facts: ${JSON.stringify(facts)}`,
  ].join("\n");
}
