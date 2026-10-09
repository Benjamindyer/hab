import type { HabConfig } from "./config";
import type { ResolvedConfig } from "./resolve";

/** What the settings page can do. Only an administrator is given one. */
export interface SettingsService {
  /** Where the settings in use came from. A file overrides saved settings. */
  source: ResolvedConfig["source"];
  save(config: HabConfig): Promise<void>;
  /** Forget saved settings, so HAB goes back to guessing them. */
  clear(): Promise<void>;
}
