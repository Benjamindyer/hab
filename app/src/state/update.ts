/** True when the server has a different build from the one running, so the screen should reload. */
export function shouldReload(current: string, latest: string | null): boolean {
  return latest !== null && latest !== current;
}
