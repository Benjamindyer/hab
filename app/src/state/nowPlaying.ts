import type { MusicView } from "./music";

export interface NowPlayingSummary {
  title: string;
  artist: string | null;
  art: string | null;
  playing: boolean;
}

/** What the small widget on the home screen shows. Null when nothing is playing or paused, so the widget is hidden. */
export function nowPlayingSummary(view: MusicView): NowPlayingSummary | null {
  if ((view.mode !== "playing" && view.mode !== "paused") || !view.title) return null;
  return { title: view.title, artist: view.artist, art: view.art, playing: view.mode === "playing" };
}
