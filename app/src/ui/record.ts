import type { MusicView } from "../state/music";
import { el } from "./dom";

export interface VinylCover {
  /** The sleeve with the cover on it. */
  sleeve: HTMLElement;
  /** The record that slides out of the sleeve and spins, with the cover as its label. */
  disc: HTMLElement;
  update(view: MusicView): void;
}

/**
 * The cover and a record. While music plays the record slides out of the sleeve and spins,
 * with the cover as its label. Paused, it stays out and stops. With nothing playing it slips back in.
 */
export function createRecord(): VinylCover {
  const sleeve = el("div", "art-frame");
  const cover = sleeve.appendChild(el("img"));
  const disc = el("div", "record");
  const spinner = disc.appendChild(el("div", "disc"));
  const label = spinner.appendChild(el("img", "label"));
  spinner.append(el("div", "hole"));
  let shown = "";

  return {
    sleeve,
    disc,
    update(view) {
      const art = view.art ?? "";
      if (art !== shown) {
        shown = art;
        cover.src = art;
        label.src = art;
      }
      cover.hidden = label.hidden = art === "";
      const active = view.mode === "playing" || view.mode === "paused";
      disc.classList.toggle("out", active);
      spinner.classList.toggle("still", view.mode !== "playing");
    },
  };
}
