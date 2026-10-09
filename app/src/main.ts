import { buildDeps } from "./bootstrap";
import { loadFileConfig } from "./config/load";
import { resolveConfig } from "./config/resolve";
import { connectToHa } from "./ha/connect";
import { createConnectionStatus } from "./ha/connectionStatus";
import { createEntityStore } from "./ha/entityStore";
import { fetchStoredConfig } from "./ha/storedConfig";
import { mountApp } from "./ui/app";
import { mountConnectionBanner } from "./ui/banner";
import { mountInspector } from "./ui/inspector";
import { showStatus } from "./ui/status";
import { startUpdateCheck } from "./ui/updater";
import { keepScreenAwake } from "./ui/wakeLock";

const root = document.getElementById("app");

async function start(app: HTMLElement): Promise<void> {
  showStatus(app, "HAB", "Loading...");
  const file = await loadFileConfig();
  const haUrl = file?.haUrl ?? location.origin;
  showStatus(app, "HAB", `Connecting to Home Assistant at ${haUrl}...`);
  const connection = await connectToHa(haUrl);
  if (import.meta.env.DEV) Object.assign(window, { habConnection: connection });
  const entities = createEntityStore(connection);
  await entities.whenReady();
  if (new URLSearchParams(location.search).has("debug")) {
    mountInspector(app, entities);
    return;
  }
  const stored = file ? null : await fetchStoredConfig(connection);
  const { config } = resolveConfig({ file, stored, entities: entities.all() });
  mountApp(app, buildDeps(connection, entities, config, haUrl));
  mountConnectionBanner(document.body, createConnectionStatus(connection));
  keepScreenAwake();
  startUpdateCheck();
}

if (root) {
  const app = root;
  start(app).catch((error: unknown) => {
    showStatus(app, "HAB could not start", error instanceof Error ? error.message : String(error));
  });
}
