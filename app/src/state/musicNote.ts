import type { Facts } from "./llm";
import type { MusicView } from "./music";
import type { Personality } from "./personality";

/** Things worked out from what HAB has seen and the clock. All of it is true, and a line may use it. */
export interface MusicExtras {
  /** For example "late night". */
  partOfDay: string;
  sameArtistInARow: number;
}

const ORDINALS = ["", "", "second", "third", "fourth", "fifth", "sixth"];

/** A time of day in words, from the hour. */
export function partOfDay(hour: number): string {
  if (hour >= 23 || hour < 5) return "late night";
  if (hour < 9) return "early morning";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/** A remark that is true and needs no model: only said when honesty is high enough to point things out. */
function remark(view: MusicView, dials: Personality, extras: MusicExtras): string {
  if (view.mode !== "playing" || dials.honesty < 50) return "";
  const nth = ORDINALS[Math.min(extras.sameArtistInARow, ORDINALS.length - 1)];
  if (extras.sameArtistInARow >= 3 && view.artist) return ` That is the ${nth ?? "latest"} track in a row by ${view.artist.split(",")[0]}.`;
  return extras.partOfDay === "late night" && dials.humour >= 50 ? " It is very late for this." : "";
}

/**
 * One line for the music screen. Every sentence is true of the data.
 * With nothing playing, honesty explains why. While playing, a remark appears only when there is
 * something real to point out, such as the same artist again and again.
 */
export function musicNote(view: MusicView, dials: Personality, extras: MusicExtras): string {
  if (view.mode === "unavailable") return "Spotify is not connected to Home Assistant.";
  if (view.mode === "idle") {
    const why = dials.honesty >= 50 ? " Spotify cannot play until a speaker is chosen." : "";
    return `Nothing is playing.${why}`;
  }
  const where = view.source ? ` on ${view.source}` : "";
  const what = view.title ? `${view.title}${view.artist ? ` by ${view.artist}` : ""}` : "Spotify";
  const state = view.mode === "paused" ? "Paused" : "Playing";
  return `${state} ${what}${where}.${remark(view, dials, extras)}`;
}

/** The facts the model may use for the music line. */
export function musicFacts(view: MusicView, extras: MusicExtras): Facts {
  return {
    track: view.title,
    artist: view.artist,
    speaker: view.source,
    state: view.mode,
    partOfDay: extras.partOfDay,
    sameArtistInARow: extras.sameArtistInARow,
  };
}

/** Changes with the track, the speaker and the run of tracks, not with the second. */
export function musicKey(view: MusicView, extras: MusicExtras): string {
  return [view.title ?? "-", view.artist ?? "-", view.source ?? "-", view.mode, extras.partOfDay, extras.sameArtistInARow].join("|");
}
