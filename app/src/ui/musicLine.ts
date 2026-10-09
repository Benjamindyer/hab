import type { ListeningHistory } from "../state/listening";
import type { MusicView } from "../state/music";
import { factsSentence } from "../state/musicInfo";
import { musicFacts, musicKey, musicNote, partOfDay, type MusicExtras } from "../state/musicNote";
import type { SceneContext } from "./scene";

export interface MusicLine {
  text: string;
  /** True when the text is facts from the music database, so the screen can credit it. */
  fromDatabase: boolean;
}

/**
 * The line for the music screen. With music facts on, it is those facts in plain words, or the fixed line
 * when the database knows nothing. With them off, it is the model's line if one is set up, or the fixed line.
 */
export function musicLine(context: SceneContext, view: MusicView, history: ListeningHistory): MusicLine {
  // Record first: the count belongs to the key, and a key that changes after the first look would
  // throw away the model's line and leave the fixed one on screen until the next request is allowed.
  if (view.mode === "playing") history.record(view.title, view.artist);
  const extras: MusicExtras = { partOfDay: partOfDay(context.now.getHours()), sameArtistInARow: history.sameArtistInARow() };
  const fallback = musicNote(view, context.config.personality, extras);
  if (view.mode !== "playing") return { text: fallback, fromDatabase: false };
  if (context.musicInfo) {
    // With music facts on, the screen shows facts or the fixed line. The model is not asked, which also saves its cost.
    const found = context.musicInfo.get(view.title, view.artist);
    const facts = found.status === "ready" ? factsSentence(view.title, view.artist, found.info) : null;
    return facts ? { text: facts, fromDatabase: true } : { text: fallback, fromDatabase: false };
  }
  const request = { kind: "music" as const, key: musicKey(view, extras), fallback, facts: musicFacts(view, extras) };
  return { text: context.commentary.line(request, context.config.personality), fromDatabase: false };
}
