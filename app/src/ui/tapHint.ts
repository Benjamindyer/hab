import { el } from "./dom";

export interface TapHint {
  element: HTMLElement;
  /** Shows a symbol over the cover for a moment, so a tap or swipe is seen to have worked. */
  flash(svgMarkup: string): void;
}

/** A symbol that appears over the cover and fades, to answer a tap. */
export function createTapHint(): TapHint {
  const element = el("div", "tap-hint");
  return {
    element,
    flash(svgMarkup) {
      element.innerHTML = svgMarkup;
      element.classList.remove("show");
      void element.offsetWidth;
      element.classList.add("show");
    },
  };
}
