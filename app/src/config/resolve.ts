import type { Entity } from "../state/entities";
import { autoConfig } from "./autoConfig";
import { parseConfig, type HabConfig } from "./config";

export interface ConfigSources {
  /** From hab.config.json next to the app, if there is one. */
  file: HabConfig | null;
  /** Saved by the HAB integration in Home Assistant, if installed and set. */
  stored: unknown;
  entities: Entity[];
}

export interface ResolvedConfig {
  config: HabConfig;
  source: "file" | "stored" | "auto";
  /** Set when a saved config was ignored because it was not valid. */
  problem?: string;
}

/** Chooses the settings: a file wins, then settings saved in Home Assistant, then a guess. */
export function resolveConfig({ file, stored, entities }: ConfigSources): ResolvedConfig {
  if (file) return { config: file, source: "file" };
  if (stored !== null && stored !== undefined) {
    try {
      return { config: parseConfig(stored), source: "stored" };
    } catch (error) {
      const problem = error instanceof Error ? error.message : String(error);
      return { config: autoConfig(entities), source: "auto", problem };
    }
  }
  return { config: autoConfig(entities), source: "auto" };
}
