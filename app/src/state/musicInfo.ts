import type { Facts } from "./llm";

/** What a music database knows about a track and its artist. Every field may be missing. */
export interface MusicInfo {
  /** The year the track first came out. */
  releaseYear: number | null;
  /** The country the artist is from. */
  artistFrom: string | null;
  /** The city or town the artist began in. */
  artistCity: string | null;
  /** "group" or "solo artist". */
  artistKind: string | null;
  /** The year the group formed or the person was born. */
  artistYear: number | null;
  genres: string[];
}

/** Looks up facts about a track. Where they come from is the source's business. */
export interface MusicInfoSource {
  lookup(title: string, artist: string): Promise<MusicInfo | null>;
}

export type InfoResult = { status: "pending" } | { status: "ready"; info: MusicInfo | null };

/** Gives a cached answer at once, and fetches in the background when it has none. */
export interface MusicInfoLookup {
  get(title: string | null, artist: string | null): InfoResult;
}

const DECADES: Record<number, string> = { 192: "twenties", 193: "thirties", 194: "forties", 195: "fifties", 196: "sixties", 197: "seventies", 198: "eighties", 199: "nineties", 200: "two thousands", 201: "twenty tens", 202: "twenty twenties" };

/** The decade in words, from a year. */
export const decadeOf = (year: number): string | null => DECADES[Math.floor(year / 10)] ?? null;

/** The facts a model may use from the database. Fields that are unknown are left out. */
export function infoFacts(info: MusicInfo | null): Facts {
  if (!info) return {};
  const decade = info.releaseYear === null ? null : decadeOf(info.releaseYear);
  const kindYear = info.artistKind === "solo artist" ? "artistBornYear" : "artistFormedYear";
  const facts: Facts = {
    firstReleasedYear: info.releaseYear,
    releasedInTheDecade: decade,
    artistFrom: info.artistFrom,
    artistFromCity: info.artistCity,
    artistKind: info.artistKind,
    [kindYear]: info.artistYear,
    genres: info.genres.length > 0 ? info.genres.join(", ") : null,
  };
  return Object.fromEntries(Object.entries(facts).filter(([, value]) => value !== null));
}

export interface Readout {
  label: string;
  value: string;
}

/** The database facts as small label and value pairs for the screen. Unknown facts are left out. */
export function readoutsFor(info: MusicInfo | null): Readout[] {
  if (!info) return [];
  const place = [info.artistCity, info.artistFrom].filter((part): part is string => part !== null).join(", ");
  const born = info.artistKind === "solo artist" ? "Born" : "Formed";
  const pairs: [string, string | null][] = [
    ["Released", info.releaseYear === null ? null : String(info.releaseYear)],
    [born, info.artistYear === null ? null : String(info.artistYear)],
    ["From", place || null],
    ["Genre", info.genres.length > 0 ? info.genres.join(", ") : null],
  ];
  return pairs.flatMap(([label, value]) => (value === null ? [] : [{ label, value }]));
}
