import { parseConfig, type HabConfig } from "./config";

/**
 * Reads hab.config.json from the folder the app is served from.
 * Returns null when there is none, which is normal when the HAB integration supplies the settings.
 */
export async function loadFileConfig(url = "./hab.config.json"): Promise<HabConfig | null> {
  const response = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  const body: unknown = await response.json().catch(() => null);
  return body === null ? null : parseConfig(body);
}
