// Copies the built web app into the Home Assistant integration, ready to ship through HACS.
// Settings files are left out: they belong to one house and never go into the integration.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const from = join(here, "..", "dist");
const to = join(here, "..", "..", "custom_components", "hab", "frontend");

if (!existsSync(from)) throw new Error("Run npm run build first: app/dist does not exist.");
rmSync(to, { recursive: true, force: true });
mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true, filter: (source) => !/hab\.config(\.example)?\.json$/.test(source) });
console.log(`Copied ${from} to ${to}`);
