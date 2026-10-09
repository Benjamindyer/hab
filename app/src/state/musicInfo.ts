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

const joined = (parts: (string | null)[]): string => parts.filter((part): part is string => part !== null).join(", ");

/** "The Charlatans formed in 1988 in West Midlands, United Kingdom." */
function aboutArtist(artist: string, info: MusicInfo): string | null {
  const when = info.artistYear === null ? null : `${info.artistKind === "solo artist" ? "was born" : "formed"} in ${info.artistYear}`;
  const place = joined([info.artistCity, info.artistFrom]);
  if (when === null && place === "") return null;
  return `${artist} ${when ?? "are from"}${place ? ` ${when === null ? "" : "in "}${place}` : ""}.`;
}

/**
 * The facts as one plain sentence or two for the screen, or null when the database knows nothing useful.
 * Every word comes from the database or from what Spotify reports, so nothing here is invented.
 */
export function factsSentence(title: string | null, artist: string | null, info: MusicInfo | null): string | null {
  if (!info) return null;
  const about = artist ? aboutArtist(artist.split(",")[0]?.trim() ?? artist, info) : null;
  const released = title && info.releaseYear !== null ? `${title} was first released in ${info.releaseYear}.` : null;
  const genres = info.genres.length > 0 ? `Genres: ${info.genres.join(", ")}.` : null;
  const parts = [released, about, genres].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(" ") : null;
}
