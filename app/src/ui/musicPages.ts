import { describeDevice } from "../state/devices";
import { el, setText } from "./dom";
import type { LibraryPanel } from "./musicLibrary";
import type { NowPanel } from "./musicNow";
import type { Picker } from "./musicPicker";
import type { PagerPage } from "./pager";

export interface MusicPages {
  pages: PagerPage[];
  /** The Now playing page, where taps and swipes control the music. */
  nowElement: HTMLElement;
  /** Shows where music will play, on the library page. */
  setRoom(room: string | null): void;
}

/** Lays the three music pages out, in swipe order: the track that is playing, the library, then the speakers. */
export function buildPages(now: NowPanel, picker: Picker, panel: LibraryPanel, goToSpeakers: () => void): MusicPages {
  const where = el("button", "where-chip");
  where.addEventListener("click", goToSpeakers);
  const library = el("div", "library-page");
  library.append(el("div", "page-title", "Playlists"), where, panel.element);
  const nowPage = el("div", "now-layout");
  nowPage.append(...now.elements);
  return {
    nowElement: nowPage,
    pages: [
      { id: "now", label: "Now playing", element: nowPage },
      { id: "library", label: "Library", element: library },
      { id: "speakers", label: "Speakers", element: picker.element },
    ],
    setRoom: (room) => setText(where, room ? `Playing in ${describeDevice(room).label}` : "Choose a speaker"),
  };
}
