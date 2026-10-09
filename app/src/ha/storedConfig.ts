import type { Connection } from "home-assistant-js-websocket";

interface StoredConfigResult {
  config: unknown;
}

/** Asks the HAB integration for the settings saved in Home Assistant. Null when it is not installed or has none. */
export async function fetchStoredConfig(connection: Connection): Promise<unknown> {
  try {
    const result = await connection.sendMessagePromise<StoredConfigResult>({ type: "hab/config/get" });
    return result.config ?? null;
  } catch {
    return null;
  }
}
