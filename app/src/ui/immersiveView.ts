import { createImmersion } from "../state/immersion";
import type { MusicView } from "../state/music";

export interface ImmersiveView {
  update(view: MusicView): void;
}

/** A few seconds into a track the title fades, the controls shrink and the cover grows. A touch brings it all back. */
export function createImmersiveView(element: HTMLElement): ImmersiveView {
  const immersion = createImmersion();
  element.addEventListener("pointerdown", () => immersion.touch(Date.now()));
  return {
    update(view) {
      const playing = view.mode === "playing";
      const key = playing ? `${view.title}|${view.artist}` : null;
      element.classList.toggle("immersive", immersion.hidden(key, playing, Date.now()));
    },
  };
}
