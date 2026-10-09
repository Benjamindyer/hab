/** A Home Assistant entity, reduced to what HAB needs. */
export interface Entity {
  id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export type Unsubscribe = () => void;

/** What the rest of the app may know about Home Assistant. Nothing else leaks out of `ha/`. */
export interface EntityStore {
  all(): Entity[];
  get(id: string): Entity | undefined;
  subscribe(listener: () => void): Unsubscribe;
  /** Resolves once Home Assistant has sent the first full list of entities. */
  whenReady(): Promise<void>;
}
