import type { MusicConfig, Favourite } from "../config/parseMusic";
import type { Entity, EntityStore } from "./entities";

export type MusicMode = "unavailable" | "idle" | "paused" | "playing";

export interface MusicView {
  mode: MusicMode;
  title: string | null;
  artist: string | null;
  art: string | null;
  position: number | null;
  duration: number | null;
  volume: number | null;
  source: string | null;
  sources: string[];
  favourites: Favourite[];
}

const text = (e: Entity | undefined, key: string): string | null => {
  const v = e?.attributes[key];
  return typeof v === "string" && v ? v : null;
};
const num = (e: Entity | undefined, key: string): number | null => {
  const v = e?.attributes[key];
  return typeof v === "number" ? v : null;
};

export function modeFor(state: string | undefined): MusicMode {
  if (state === "playing" || state === "buffering") return "playing";
  if (state === "paused") return "paused";
  if (state === undefined || state === "unavailable" || state === "unknown") return "unavailable";
  return "idle";
}

/** Makes a picture address usable from the tablet: Home Assistant paths need the HA address in front. */
export function resolveArt(picture: string | null, haUrl: string): string | null {
  if (!picture) return null;
  return picture.startsWith("/") ? `${haUrl.replace(/\/$/, "")}${picture}` : picture;
}

/** Where the track is now: the last reported position plus the time since it was reported. */
export function currentPosition(player: Entity | undefined, mode: MusicMode, now: Date): number | null {
  const position = num(player, "media_position");
  if (position === null) return null;
  const duration = num(player, "media_duration");
  const reported = Date.parse(text(player, "media_position_updated_at") ?? "");
  const elapsed = mode === "playing" && !Number.isNaN(reported) ? (now.getTime() - reported) / 1000 : 0;
  const total = position + Math.max(0, elapsed);
  return duration === null ? total : Math.min(total, duration);
}

/** Turns the Spotify player and the clock into everything the music screen shows. */
export function buildMusicView(store: EntityStore, config: MusicConfig, now: Date, haUrl: string): MusicView {
  const player = store.get(config.player);
  const mode = modeFor(player?.state);
  const listed = player?.attributes["source_list"];
  const source = text(player, "source");
  const known = Array.isArray(listed) ? listed.filter((s): s is string => typeof s === "string") : [];
  return {
    mode,
    title: text(player, "media_title"),
    artist: text(player, "media_artist"),
    art: resolveArt(text(player, "entity_picture"), haUrl),
    position: currentPosition(player, mode, now),
    duration: num(player, "media_duration"),
    volume: num(player, "volume_level"),
    source,
    sources: source && !known.includes(source) ? [source, ...known] : known,
    favourites: config.favourites,
  };
}

/** The room to play in: where it is playing now, else the last one chosen, else the configured default. */
export function targetRoom(view: MusicView, chosen: string | null, config: MusicConfig): string | null {
  return view.source ?? chosen ?? config.room ?? view.sources[0] ?? null;
}
