import type { AuthData } from "home-assistant-js-websocket";

const KEY = "hab.tokens";

/** Reads the saved login, or undefined if there is none or storage is blocked. */
export async function loadTokens(): Promise<AuthData | undefined> {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? (JSON.parse(saved) as AuthData) : undefined;
  } catch {
    return undefined;
  }
}

/** Saves the login so the tablet stays signed in. Passing null signs out. */
export function saveTokens(data: AuthData | null): void {
  try {
    if (data) localStorage.setItem(KEY, JSON.stringify(data));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage can be blocked, for example in a private window. The app still works until reload.
  }
}
