import type { MusicInfo, MusicInfoSource } from "../state/musicInfo";
import { mainArtist, cleanTitle, pickOriginal, toInfo, type ArtistRecord, type Recording } from "./parse";

const BASE = "https://musicbrainz.org/ws/2";
// MusicBrainz asks for no more than one request a second.
const SPACING_MS = 1100;
const RETRY_MS = 2500;

type Sleep = (ms: number) => Promise<void>;
const realSleep: Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

interface RecordingSearch {
  recordings?: Recording[];
}

/**
 * Looks up a track in MusicBrainz, a free open music database. Requests go one at a time, spaced
 * out as MusicBrainz asks. Only the track and artist names are sent.
 */
export function createMusicBrainz(sleep: Sleep = realSleep, fetcher: typeof fetch = (...a) => fetch(...a)): MusicInfoSource {
  let queue: Promise<unknown> = Promise.resolve();

  async function request<T>(url: string): Promise<T> {
    const response = await fetcher(url);
    if (response.status === 503) {
      await sleep(RETRY_MS);
      return request<T>(url);
    }
    if (!response.ok) throw new Error(`MusicBrainz answered ${response.status}`);
    return (await response.json()) as T;
  }

  /** Runs requests one after another with a pause between them. */
  function inLine<T>(url: string): Promise<T> {
    const result = queue.then(() => sleep(SPACING_MS)).then(() => request<T>(url));
    queue = result.catch(() => undefined);
    return result;
  }

  return {
    async lookup(title, artist): Promise<MusicInfo | null> {
      const name = mainArtist(artist).replace(/"/g, "");
      const wanted = cleanTitle(title).replace(/"/g, "");
      if (!name || !wanted) return null;
      const query = encodeURIComponent(`recording:"${wanted}" AND artist:"${name}"`);
      const found = await inLine<RecordingSearch>(`${BASE}/recording/?query=${query}&fmt=json&limit=25`);
      const original = pickOriginal(found.recordings ?? [], title, name);
      if (!original) return null;
      const record = await inLine<ArtistRecord>(`${BASE}/artist/${original.artistId}?inc=genres&fmt=json`);
      return toInfo(original.recording, record);
    },
  };
}
