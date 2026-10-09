import type { ListeningHistory } from "../state/listening";
import type { MusicView } from "../state/music";
import { infoFacts, type MusicInfo } from "../state/musicInfo";
import { musicFacts, musicKey, musicNote, partOfDay, type MusicExtras } from "../state/musicNote";
import type { SceneContext } from "./scene";

export interface MusicLine {
  text: string;
  /** What the music database knows, once it has answered. Null while waiting or when it knows nothing. */
  info: MusicInfo | null;
}

/** The line for the music screen, and the facts behind it. The fixed line shows until the model's is ready. */
export function musicLine(context: SceneContext, view: MusicView, history: ListeningHistory): MusicLine {
  // Record first: the count belongs to the key, and a key that changes after the first look would
  // throw away the model's line and leave the fixed one on screen until the next request is allowed.
  if (view.mode === "playing") history.record(view.title, view.artist);
  const extras: MusicExtras = { partOfDay: partOfDay(context.now.getHours()), sameArtistInARow: history.sameArtistInARow() };
  const fallback = musicNote(view, context.config.personality, extras);
  if (view.mode !== "playing") return { text: fallback, info: null };
  const found = context.musicInfo?.get(view.title, view.artist);
  const info = found?.status === "ready" ? found.info : null;
  const request = {
    kind: "music" as const,
    key: musicKey(view, extras),
    fallback,
    facts: { ...musicFacts(view, extras), ...infoFacts(info) },
    hold: found?.status === "pending",
  };
  return { text: context.commentary.line(request, context.config.personality), info };
}
