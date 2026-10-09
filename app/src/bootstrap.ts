import type { Connection } from "home-assistant-js-websocket";
import type { HabConfig } from "./config/config";
import type { SettingsService } from "./config/settings";
import { createAiTaskGenerator } from "./ha/aiTask";
import { createMediaBrowser } from "./ha/mediaBrowser";
import { createServiceRunner } from "./ha/services";
import { createCommentary } from "./state/commentary";
import type { EntityStore } from "./state/entities";
import type { AppDeps } from "./ui/app";

/** Joins the Home Assistant pieces to the screens. This is the only place that knows about both. */
export interface Parts {
  connection: Connection;
  entities: EntityStore;
  config: HabConfig;
  haUrl: string;
  settings: SettingsService | null;
}

export function buildDeps({ connection, entities, config, haUrl, settings }: Parts): AppDeps {
  const model = config.llm?.personality;
  const generator = model ? createAiTaskGenerator(connection, model) : null;
  return {
    entities,
    config,
    haUrl,
    run: createServiceRunner(connection),
    browser: createMediaBrowser(connection),
    commentary: createCommentary(generator, { name: config.personality.name, musicKnowledge: config.llm?.musicKnowledge ?? false }),
    settings,
  };
}
