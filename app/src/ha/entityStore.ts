import { subscribeEntities, type Connection, type HassEntities } from "home-assistant-js-websocket";
import type { Entity, EntityStore } from "../state/entities";

function toEntities(raw: HassEntities): Map<string, Entity> {
  const entities = new Map<string, Entity>();
  for (const [id, item] of Object.entries(raw)) {
    entities.set(id, { id, state: item.state, attributes: item.attributes });
  }
  return entities;
}

/** Keeps a live copy of every entity and tells listeners when it changes. */
export function createEntityStore(connection: Connection): EntityStore {
  let entities = new Map<string, Entity>();
  const listeners = new Set<() => void>();
  let markReady: () => void = () => undefined;
  const ready = new Promise<void>((resolve) => { markReady = resolve; });

  subscribeEntities(connection, (raw) => {
    entities = toEntities(raw);
    markReady();
    listeners.forEach((listener) => listener());
  });

  return {
    whenReady: () => ready,
    all: () => [...entities.values()],
    get: (id) => entities.get(id),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
