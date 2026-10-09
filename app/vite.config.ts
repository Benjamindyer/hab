import { defineConfig, type Plugin } from "vitest/config";

const buildId = String(Date.now());

/** Writes version.json next to the app so a running screen can notice a new version and reload. */
function versionFile(): Plugin {
  return {
    name: "hab-version-file",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ build: buildId }) });
    },
  };
}

export default defineConfig({
  // Relative paths, so the app works from any folder, such as /local/hab/ on Home Assistant.
  base: "./",
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  plugins: [versionFile()],
  server: { port: 5173 },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
