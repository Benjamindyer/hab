import type { Connection } from "home-assistant-js-websocket";

export interface ConnectionStatus {
  subscribe(listener: (online: boolean) => void): void;
}

/** Tells the app when the link to Home Assistant drops and when it comes back. */
export function createConnectionStatus(connection: Connection): ConnectionStatus {
  return {
    subscribe(listener) {
      connection.addEventListener("disconnected", () => listener(false));
      connection.addEventListener("ready", () => listener(true));
      connection.addEventListener("reconnect-error", () => listener(false));
    },
  };
}
