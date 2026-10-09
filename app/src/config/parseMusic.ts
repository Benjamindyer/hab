export interface Favourite {
  name: string;
  uri: string;
}

export interface MusicConfig {
  player: string;
  /** The Spotify device to start on when nothing is playing, for example "kitchen". */
  room?: string;
  favourites: Favourite[];
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function parseFavourite(raw: unknown): Favourite {
  if (!isObject(raw) || typeof raw["name"] !== "string" || typeof raw["uri"] !== "string") {
    throw new Error("Each music favourite needs a name and a uri, for example spotify:playlist:...");
  }
  return { name: raw["name"], uri: raw["uri"] };
}

/** Checks the optional music section of the config. */
export function parseMusic(raw: unknown): MusicConfig | undefined {
  if (raw === undefined) return undefined;
  if (!isObject(raw) || typeof raw["player"] !== "string") {
    throw new Error("music.player must be a media player entity id.");
  }
  const favourites = Array.isArray(raw["favourites"]) ? raw["favourites"].map(parseFavourite) : [];
  return { player: raw["player"], favourites, ...(typeof raw["room"] === "string" && { room: raw["room"] }) };
}
