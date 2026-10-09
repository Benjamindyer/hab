import { el, mmss, renderWhenChanged, setText } from "./dom";
import type { MusicView } from "../state/music";
import { createRecord } from "./record";

export interface NowHandlers {
  onPlayPause(): void;
  onSkip(direction: "next" | "previous"): void;
  onVolume(level: number): void;
}

export interface NowPanel {
  elements: HTMLElement[];
  update(view: MusicView): void;
}

const PLAY = '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
const PREV = '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>';
const NEXT = '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5l11 7L4 19z"/></svg>';
const VOLUME_STEPS = 12;

function iconButton(svg: string, label: string, onClick: () => void, main = false): HTMLButtonElement {
  const button = el("button", main ? "ic main" : "ic");
  button.innerHTML = svg;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", onClick);
  return button;
}

const progressPercent = (view: MusicView): number =>
  view.duration && view.duration > 0 ? (100 * (view.position ?? 0)) / view.duration : 0;

const sourceLabel = (view: MusicView): string => `${view.source ?? "Spotify"} \u00B7 Spotify`;

function volumeBars(onVolume: (level: number) => void): HTMLElement {
  const bars = el("div", "bars");
  bars.addEventListener("click", (event) => {
    const index = [...bars.children].indexOf(event.target as Element);
    if (index >= 0) onVolume((index + 1) / VOLUME_STEPS);
  });
  return bars;
}

/** Swaps the play and pause icon only when the state really changes, so a tap is never lost to a redraw. */
function showPlayState(button: HTMLButtonElement, playing: boolean): void {
  const state = playing ? "pause" : "play";
  if (button.dataset["state"] === state) return;
  button.dataset["state"] = state;
  button.innerHTML = playing ? PAUSE : PLAY;
}

function renderVolume(bars: HTMLElement, level: number): void {
  const lit = Math.round(level * VOLUME_STEPS);
  renderWhenChanged(bars, String(lit), () =>
    Array.from({ length: VOLUME_STEPS }, (_, i) => {
      const bar = el("i", i < lit ? "on" : "");
      bar.style.height = `${30 + i * 6}%`;
      return bar;
    }),
  );
}

/** The part of the music screen that shows the cover, the record, the track and its controls. */
export function createNowPanel(handlers: NowHandlers): NowPanel {
  const record = createRecord();
  const source = el("div", "src");
  const title = el("div", "ttl");
  const artist = el("div", "artist");
  const fill = el("b");
  const position = el("span", "", "0:00");
  const duration = el("span", "", "0:00");
  const play = iconButton(PLAY, "Play or pause", handlers.onPlayPause, true);
  const bars = volumeBars(handlers.onVolume);

  const info = el("div", "info");
  info.append(source, title, artist);
  const progress = el("div", "prog");
  progress.append(fill);
  const times = el("div", "times mono");
  times.append(position, duration);
  const controls = el("div", "tr");
  controls.append(iconButton(PREV, "Previous", () => handlers.onSkip("previous")), play, iconButton(NEXT, "Next", () => handlers.onSkip("next")));
  const volume = el("div", "vol");
  volume.append(el("span", "k", "Volume"), bars);
  const row = el("div", "control-row");
  row.append(el("div"), controls, volume);
  const player = el("div", "player");
  player.append(progress, times, row);

  return {
    elements: [record.disc, record.sleeve, info, player],
    update(view) {
      record.update(view);
      setText(source, sourceLabel(view));
      setText(title, view.title ?? "");
      setText(artist, view.artist ?? "");
      fill.style.width = `${progressPercent(view)}%`;
      setText(position, mmss(view.position ?? 0));
      setText(duration, mmss(view.duration ?? 0));
      showPlayState(play, view.mode === "playing");
      renderVolume(bars, view.volume ?? 0);
    },
  };
}
