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
  musicKnowledge: boolean;
  musicLookup: boolean;
  satellite: string;
}

function musicDraft(config: HabConfig): Pick<Draft, "player" | "defaultRoom" | "favourites" | "musicLookup"> {
  const music = config.music;
  return {
    player: music?.player ?? "",
    musicLookup: music?.lookup ?? false,
    defaultRoom: music?.room ?? "",
    favourites: (music?.favourites ?? []).map((f) => ({ name: f.name, link: f.uri })),
  };
}

function llmDraft(config: HabConfig): Pick<Draft, "llm" | "musicKnowledge"> {
  const llm = config.llm;
  return { llm: llm?.personality ?? "", musicKnowledge: llm?.musicKnowledge ?? false, };
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
    ...llmDraft(config),
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

function llmFrom(draft: Draft): Record<string, string | boolean> | undefined {
  const llm = { ...text("personality", draft.llm), ...(draft.musicKnowledge && { musicKnowledge: true }) };
  return Object.keys(llm).length > 0 ? llm : undefined;
}

/** Turns the form back into settings. Throws a plain message the owner can act on. */
export function fromDraft(draft: Draft): HabConfig {
  const music = draft.player
    ? { player: draft.player, favourites: favouritesFrom(draft), ...text("room", draft.defaultRoom), ...(draft.musicLookup && { lookup: true }) }
    : undefined;
  return parseConfig({
    personality: { humour: draft.humour, honesty: draft.honesty, ...text("name", draft.name) },
    ambient: { room: draft.room.trim() || "Home", ...text("weather", draft.weather), ...text("climate", draft.climate) },
    ...(music && { music }),
    ...(llmFrom(draft) && { llm: llmFrom(draft) }),
    ...text("satellite", draft.satellite),
  });
}
