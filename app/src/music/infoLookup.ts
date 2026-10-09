import type { InfoResult, MusicInfo, MusicInfoLookup, MusicInfoSource } from "../state/musicInfo";
import { cleanTitle, mainArtist } from "./parse";

/** Keeps answers between visits. A null answer means the database had nothing for that track. */
export interface InfoStore {
  load(): Record<string, MusicInfo | null>;
  save(entries: Record<string, MusicInfo | null>): void;
}

export interface InfoLookupHandle extends MusicInfoLookup {
  /** Resolves when lookups in flight have finished. Used by tests. */
  settled(): Promise<void>;
}

const KEEP = 200;
const RETRY_AFTER_MS = 10 * 60 * 1000;

const keyFor = (title: string, artist: string): string => `${mainArtist(artist).toLowerCase()}|${cleanTitle(title).toLowerCase()}`;

/**
 * Answers from memory at once. A track it has not seen is looked up in the background, and the answer
 * is kept. A failed lookup (no network, for example) is tried again after ten minutes.
 */
export function createInfoLookup(source: MusicInfoSource, store: InfoStore, clock: () => number = Date.now): InfoLookupHandle {
  const known = new Map<string, MusicInfo | null>(Object.entries(store.load()));
  const inFlight = new Map<string, Promise<void>>();
  const failedAt = new Map<string, number>();

  const remember = (key: string, info: MusicInfo | null): void => {
    known.delete(key);
    known.set(key, info);
    while (known.size > KEEP) known.delete(known.keys().next().value as string);
    store.save(Object.fromEntries(known));
  };

  const fetchIt = (key: string, title: string, artist: string): Promise<void> =>
    source
      .lookup(title, artist)
      .then((info) => remember(key, info))
      .catch(() => { failedAt.set(key, clock()); })
      .finally(() => { inFlight.delete(key); });

  return {
    get(title, artist): InfoResult {
      if (!title || !artist) return { status: "ready", info: null };
      const key = keyFor(title, artist);
      if (known.has(key)) return { status: "ready", info: known.get(key) ?? null };
      if (inFlight.has(key)) return { status: "pending" };
      const failed = failedAt.get(key);
      if (failed !== undefined && clock() - failed < RETRY_AFTER_MS) return { status: "ready", info: null };
      inFlight.set(key, fetchIt(key, title, artist));
      return { status: "pending" };
    },
    settled: async () => { await Promise.all([...inFlight.values()]); },
  };
}
