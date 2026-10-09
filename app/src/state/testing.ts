import type { Entity, EntityStore } from "./entities";

/** A store with fixed entities, for tests. */
export function fakeStore(entities: Entity[]): EntityStore {
  const byId = new Map(entities.map((e) => [e.id, e]));
  return {
    all: () => entities,
    get: (id) => byId.get(id),
    subscribe: () => () => undefined,
    whenReady: async () => undefined,
  };
}
