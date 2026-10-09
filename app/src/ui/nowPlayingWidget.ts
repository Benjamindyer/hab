import type { NowPlayingSummary } from "../state/nowPlaying";
import { el, setText } from "./dom";
import { PAUSE } from "./icons";

import "./styles/widget.css";

export interface NowPlayingWidget {
  element: HTMLElement;
  /** Shows the track, or hides the widget when there is none. A touch opens the music screen. */
  update(summary: NowPlayingSummary | null, open: () => void): void;
}

/** A small cover with a record peeking out, the track and its artist. It sits on the home screen while music plays. */
export function createNowPlayingWidget(): NowPlayingWidget {
  const element = el("button", "np");
  element.setAttribute("aria-label", "Open the music screen");
  const record = el("div", "np-record");
  const cover = el("img", "np-cover");
  const text = el("div", "np-text");
  const title = text.appendChild(el("div", "np-title"));
  const artist = text.appendChild(el("div", "np-artist"));
  const state = el("div", "np-state");
  state.append(el("i"), el("i"), el("i"));
  const paused = el("div", "np-paused");
  paused.innerHTML = PAUSE;
  const art = el("div", "np-art");
  art.append(record, cover);
  element.append(art, text, state, paused);
  let handler: () => void = () => undefined;
  element.addEventListener("click", () => handler());

  return {
    element,
    update(summary, open) {
      handler = open;
      element.classList.toggle("show", summary !== null);
      if (!summary) return;
      setText(title, summary.title);
      setText(artist, summary.artist ?? "");
      if (summary.art && cover.getAttribute("src") !== summary.art) cover.src = summary.art;
      cover.hidden = !summary.art;
      element.classList.toggle("playing", summary.playing);
    },
  };
}
