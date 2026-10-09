import { callService, type Connection } from "home-assistant-js-websocket";
import type { ServiceRunner } from "../state/services";

/** Lets the rest of the app call Home Assistant services without knowing about the connection. */
export function createServiceRunner(connection: Connection): ServiceRunner {
  return async (call) => {
    await callService(connection, call.domain, call.service, call.data ?? {}, { entity_id: call.entityId });
  };
}
