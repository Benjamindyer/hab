import { parseConfig, type HabConfig } from "./config";
import { toSpotifyUri } from "./spotifyLink";

export interface DraftFavourite {
  name: string;
  /** Whatever the owner pasted: a Spotify link or uri. */
  link: string;
}

/** The settings as a form holds them. Every choice is text, and empty means "not set". */
export interface Draft {
  name: string;
  humour: number;
  honesty: number;
  room: string;
  weather: string;
  climate: string;
  player: string;
  defaultRoom: string;
  favourites: DraftFavourite[];
  llm: string;
  satellite: string;
}

function musicDraft(config: HabConfig): Pick<Draft, "player" | "defaultRoom" | "favourites"> {
  const music = config.music;
  return {
    player: music?.player ?? "",
    defaultRoom: music?.room ?? "",
    favourites: (music?.favourites ?? []).map((f) => ({ name: f.name, link: f.uri })),
  };
}

export function toDraft(config: HabConfig): Draft {
  return {
    name: config.personality.name ?? "",
    humour: config.personality.humour,
    honesty: config.personality.honesty,
    room: config.ambient.room,
    weather: config.ambient.weather ?? "",
    climate: config.ambient.climate ?? "",
    ...musicDraft(config),
    llm: config.llm?.personality ?? "",
    satellite: config.satellite ?? "",
  };
}

const text = (key: string, value: string): Record<string, string> => (value.trim() ? { [key]: value.trim() } : {});

function favouritesFrom(draft: Draft): { name: string; uri: string }[] {
  const rows = draft.favourites.filter((f) => f.name.trim() || f.link.trim());
  return rows.map((row, index) => {
    const uri = toSpotifyUri(row.link);
    if (!uri) throw new Error(`"${row.name.trim() || `Favourite ${index + 1}`}" is not a Spotify link. Paste a link from Spotify's Share menu.`);
    return { name: row.name.trim() || `Favourite ${index + 1}`, uri };
  });
}

/** Turns the form back into settings. Throws a plain message the owner can act on. */
export function fromDraft(draft: Draft): HabConfig {
  const music = draft.player
    ? { player: draft.player, favourites: favouritesFrom(draft), ...text("room", draft.defaultRoom) }
    : undefined;
  return parseConfig({
    personality: { humour: draft.humour, honesty: draft.honesty, ...text("name", draft.name) },
    ambient: { room: draft.room.trim() || "Home", ...text("weather", draft.weather), ...text("climate", draft.climate) },
    ...(music && { music }),
    ...(draft.llm && { llm: { personality: draft.llm } }),
    ...text("satellite", draft.satellite),
  });
}
