import { shouldReload } from "../state/update";

const CHECK_EVERY_MS = 5 * 60 * 1000;

async function latestBuild(): Promise<string | null> {
  try {
    const response = await fetch("./version.json", { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as { build?: unknown };
    return typeof body.build === "string" ? body.build : null;
  } catch {
    return null;
  }
}

/** Reloads the screen when a newer build has been copied to the server. Does nothing in development. */
export function startUpdateCheck(): void {
  if (import.meta.env.DEV) return;
  setInterval(() => {
    void latestBuild().then((latest) => {
      if (shouldReload(__BUILD_ID__, latest)) location.reload();
    });
  }, CHECK_EVERY_MS);
}
