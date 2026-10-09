interface Played {
  title: string;
  artist: string;
}

export interface ListeningHistory {
  /** Note what is playing. Repeats of the same track are ignored. */
  record(title: string | null, artist: string | null): void;
  /** How many of the latest tracks, counting this one, are by the same main artist. */
  sameArtistInARow(): number;
}

const KEEP = 12;

/** The first name in "Artist, Guest": the main artist. */
const mainArtist = (artist: string): string => (artist.split(",")[0] ?? artist).trim().toLowerCase();

/** Remembers the tracks HAB has seen play, so a line can say "third track by the same artist in a row". */
export function createListeningHistory(): ListeningHistory {
  const played: Played[] = [];
  return {
    record(title, artist) {
      if (!title || !artist) return;
      if (played[played.length - 1]?.title === title) return;
      played.push({ title, artist });
      if (played.length > KEEP) played.shift();
    },
    sameArtistInARow() {
      const last = played[played.length - 1];
      if (!last) return 0;
      let count = 0;
      for (let i = played.length - 1; i >= 0; i--) {
        if (mainArtist(played[i]?.artist ?? "") !== mainArtist(last.artist)) break;
        count += 1;
      }
      return count;
    },
  };
}
