import type { MusicInfo } from "../state/musicInfo";

/** The parts of a MusicBrainz recording that HAB reads. */
export interface Recording {
  title: string;
  score: number;
  "first-release-date"?: string;
  "artist-credit"?: { name: string; artist: { id: string } }[];
}

/** The parts of a MusicBrainz artist that HAB reads. */
export interface ArtistRecord {
  type?: string | null;
  area?: { name: string } | null;
  "begin-area"?: { name: string } | null;
  "life-span"?: { begin?: string | null } | null;
  genres?: { name: string; count: number }[];
}

/** "Song (Radio Edit)" and "Song - 2009 Remaster" both become "Song". */
export function cleanTitle(title: string): string {
  return title.replace(/\s*[-–(\[].*$/, "").trim();
}

/** The main artist of "Artist, Guest". */
export function mainArtist(artist: string): string {
  return (artist.split(",")[0] ?? artist).trim();
}

const same = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();
const yearOf = (date: string | null | undefined): number | null => {
  const year = Number.parseInt(date ?? "", 10);
  return Number.isNaN(year) ? null : year;
};

/**
 * Picks the original recording: a close match for the title and artist, with the earliest release date.
 * Live versions and re-releases come later, so the earliest date is the original.
 */
export function pickOriginal(recordings: Recording[], title: string, artist: string): { recording: Recording; artistId: string } | null {
  const wanted = cleanTitle(title);
  const candidates = recordings
    .filter((r) => r.score >= 95 && same(r.title, wanted) && r["first-release-date"])
    .map((recording) => ({ recording, credit: (recording["artist-credit"] ?? []).find((c) => same(c.name, artist)) }))
    .filter((c): c is { recording: Recording; credit: NonNullable<typeof c.credit> } => c.credit !== undefined)
    .sort((a, b) => (a.recording["first-release-date"] ?? "").localeCompare(b.recording["first-release-date"] ?? ""));
  const best = candidates[0];
  return best ? { recording: best.recording, artistId: best.credit.artist.id } : null;
}

/** Turns a recording and an artist record into the facts HAB keeps. */
export function toInfo(recording: Recording, artist: ArtistRecord): MusicInfo {
  const solo = artist.type === "Person";
  const genres = [...(artist.genres ?? [])].sort((a, b) => b.count - a.count).slice(0, 3).map((g) => g.name);
  return {
    releaseYear: yearOf(recording["first-release-date"]),
    artistFrom: artist.area?.name ?? null,
    artistCity: artist["begin-area"]?.name ?? null,
    artistKind: artist.type ? (solo ? "solo artist" : "group") : null,
    artistYear: yearOf(artist["life-span"]?.begin),
    genres,
  };
}
