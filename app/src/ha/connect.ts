import { createConnection, ERR_INVALID_AUTH, getAuth, type Connection } from "home-assistant-js-websocket";
import { loadTokens, saveTokens } from "./tokenStorage";

/** Removes the one-time login code from the address bar so a reload cannot reuse it. */
function cleanAddressBar(): void {
  if (location.search.includes("auth_callback")) history.replaceState(null, "", location.pathname);
}

/**
 * Connects to Home Assistant. On first use the browser is sent to the HA login page
 * and returns here with a token. The token is kept so the tablet stays signed in.
 * If the saved token is rejected, it is cleared and the login starts again.
 */
export async function connectToHa(hassUrl: string): Promise<Connection> {
  const auth = await getAuth({ hassUrl, saveTokens, loadTokens });
  cleanAddressBar();
  try {
    return await createConnection({ auth });
  } catch (error) {
    if (error !== ERR_INVALID_AUTH) throw error;
    saveTokens(null);
    location.replace(location.pathname);
    return new Promise<Connection>(() => undefined);
  }
}
