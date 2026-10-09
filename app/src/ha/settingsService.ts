import type { Connection } from "home-assistant-js-websocket";
import type { HabConfig } from "../config/config";
import type { ResolvedConfig } from "../config/resolve";
import type { SettingsService } from "../config/settings";

interface CurrentUser {
  is_admin: boolean;
}

/** True when the signed-in Home Assistant user is an administrator. */
export async function isAdmin(connection: Connection): Promise<boolean> {
  try {
    return (await connection.sendMessagePromise<CurrentUser>({ type: "auth/current_user" })).is_admin;
  } catch {
    return false;
  }
}

/** Saves and clears settings through the HAB integration. */
export function createSettingsService(connection: Connection, source: ResolvedConfig["source"]): SettingsService {
  return {
    source,
    async save(config: HabConfig) {
      await connection.sendMessagePromise({ type: "hab/config/set", config });
    },
    async clear() {
      await connection.sendMessagePromise({ type: "hab/config/clear" });
    },
  };
}
