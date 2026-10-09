import type { Favourite } from "../config/parseMusic";
import type { LibraryState, MediaItem } from "../state/library";
import { resolveArt } from "../state/music";
import { coverBackground } from "./cover";
import { el, renderWhenChanged, setText } from "./dom";

export interface LibraryPanel {
  element: HTMLElement;
  update(state: LibraryState, pinned: Favourite[], haUrl: string): void;
}

const MESSAGES = {
  empty: "Your playlists will appear here.",
  loading: "Loading your playlists...",
  "needs-device": "Start Spotify on any speaker once, and I will remember your playlists.",
} as const;

function tile(title: string, onPick: () => void): HTMLButtonElement {
  const button = el("button", "pl");
  button.append(el("span", "pl-name", title));
  button.addEventListener("click", onPick);
  return button;
}

function playlistTile(item: MediaItem, haUrl: string, onPlay: (uri: string, title: string) => void): HTMLButtonElement {
  const button = tile(item.title, () => onPlay(item.id, item.title));
  const art = resolveArt(item.thumbnail, haUrl);
  if (art) {
    const image = el("img");
    image.src = art;
    image.loading = "lazy";
    image.alt = "";
    button.prepend(image);
  } else {
    button.style.background = coverBackground(item.title);
  }
  return button;
}

function statusText(state: LibraryState): string | null {
  if (state.status === "ready") return null;
  if (state.status === "error") return `Could not load your playlists: ${state.error ?? "unknown error"}`;
  return MESSAGES[state.status];
}

/** A scrollable grid of the user's playlists, with any pinned favourites from the config first. */
export function createLibraryPanel(onPlay: (uri: string, title: string) => void): LibraryPanel {
  const element = el("div", "library");
  const message = el("p", "empty");
  const grid = el("div", "grid");
  element.append(message, grid);

  return {
    element,
    update(state, pinned, haUrl) {
      const text = statusText(state);
      setText(message, text ?? "");
      message.hidden = text === null;
      const key = `${pinned.map((p) => p.uri).join("|")}#${state.items.map((i) => i.id).join("|")}`;
      renderWhenChanged(grid, key, () => [
        ...pinned.map((fav) => {
          const pin = tile(fav.name, () => onPlay(fav.uri, fav.name));
          pin.style.background = coverBackground(fav.name);
          return pin;
        }),
        ...state.items.map((item) => playlistTile(item, haUrl, onPlay)),
      ]);
    },
  };
}
