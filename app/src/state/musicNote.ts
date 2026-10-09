import type { Facts } from "./llm";
import type { MusicView } from "./music";
import type { Personality } from "./personality";

/**
 * One line for the music screen. Every sentence is true of the data.
 * Honesty explains why nothing plays. Humour adds a remark about the music.
 */
export function musicNote(view: MusicView, dials: Personality): string {
  if (view.mode === "unavailable") return "Spotify is not connected to Home Assistant.";
  if (view.mode === "idle") {
    const why = dials.honesty >= 50 ? " Spotify cannot play until a speaker is chosen." : "";
    return `Nothing is playing.${why}`;
  }
  const where = view.source ? ` on ${view.source}` : "";
  const what = view.title ? `${view.title}${view.artist ? ` by ${view.artist}` : ""}` : "Spotify";
  const state = view.mode === "paused" ? "Paused" : "Playing";
  const remark = view.mode === "playing" && dials.humour >= 50 ? " Bold choice." : "";
  return `${state} ${what}${where}.${remark}`;
}

/** The facts the model may use for the music line. */
export function musicFacts(view: MusicView): Facts {
  return { track: view.title, artist: view.artist, speaker: view.source, state: view.mode };
}

/** Changes with the track and the speaker, not with the second. */
export function musicKey(view: MusicView): string {
  return [view.title ?? "-", view.artist ?? "-", view.source ?? "-", view.mode].join("|");
}
