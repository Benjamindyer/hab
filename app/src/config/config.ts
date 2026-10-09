import type { Personality } from "../state/personality";
import { parseLlm, type LlmConfig } from "./parseLlm";
import { parseMusic, type MusicConfig } from "./parseMusic";
import { parsePower, type PowerConfig } from "./parsePower";

export interface AmbientConfig {
  room: string;
  weather?: string;
  climate?: string;
}

/** Everything the owner chooses. Entity ids live here, never in the source code. */
export interface HabConfig {
  /** Where Home Assistant is. Leave out when HAB is served by Home Assistant itself. */
  haUrl?: string;
  personality: Personality;
  ambient: AmbientConfig;
  music?: MusicConfig;
  power?: PowerConfig;
  llm?: LlmConfig;
  satellite?: string;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isDial = (v: unknown): v is number => typeof v === "number" && v >= 0 && v <= 100;
const optionalText = (key: string, v: unknown): Record<string, string> => (typeof v === "string" ? { [key]: v } : {});

function parsePersonality(raw: unknown): Personality {
  if (!isObject(raw) || !isDial(raw["humour"]) || !isDial(raw["honesty"])) {
    throw new Error("personality.humour and personality.honesty must be numbers from 0 to 100.");
  }
  return { humour: raw["humour"], honesty: raw["honesty"], ...optionalText("name", raw["name"]) };
}

function parseAmbient(raw: unknown): AmbientConfig {
  if (!isObject(raw) || typeof raw["room"] !== "string") {
    throw new Error("ambient.room must be text, for example \"Kitchen\".");
  }
  return { room: raw["room"], ...optionalText("weather", raw["weather"]), ...optionalText("climate", raw["climate"]) };
}

/** Checks the shape of a loaded config. Throws a plain message the owner can act on. */
export function parseConfig(raw: unknown): HabConfig {
  if (!isObject(raw)) throw new Error("hab.config.json must be a JSON object.");
  const music = parseMusic(raw["music"]);
  const power = parsePower(raw["power"]);
  const llm = parseLlm(raw["llm"]);
  return {
    ...optionalText("haUrl", raw["haUrl"]),
    personality: parsePersonality(raw["personality"]),
    ambient: parseAmbient(raw["ambient"]),
    ...(music && { music }),
    ...(power && { power }),
    ...(llm && { llm }),
    ...optionalText("satellite", raw["satellite"]),
  };
}
