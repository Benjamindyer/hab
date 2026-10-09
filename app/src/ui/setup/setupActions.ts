import { fromDraft, type Draft } from "../../config/draft";
import type { SettingsService } from "../../config/settings";

export interface SetupState {
  draft: Draft | undefined;
  settings: SettingsService | undefined;
}

/** Saves or clears the settings, then reloads so the screen uses them. Reports problems in plain words. */
export function createActions(state: SetupState, say: (text: string, bad?: boolean) => void): { save(): void; clear(): void } {
  const run = async (task: (settings: SettingsService) => Promise<void>): Promise<void> => {
    if (!state.settings) return;
    try {
      await task(state.settings);
      say("Saved. Reloading...");
      setTimeout(() => location.reload(), 800);
    } catch (error) {
      say(error instanceof Error ? error.message : String(error), true);
    }
  };
  return {
    save: () => { void run(async (settings) => settings.save(fromDraft(requireDraft(state)))); },
    clear: () => { void run((settings) => settings.clear()); },
  };
}

function requireDraft(state: SetupState): Draft {
  if (!state.draft) throw new Error("The settings have not loaded yet.");
  return state.draft;
}
