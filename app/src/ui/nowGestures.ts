import type { MusicView } from "../state/music";
import { attachGestures } from "./gestures";
import { NEXT, PAUSE, PLAY, PREV } from "./icons";
import type { NowHandlers } from "./musicNow";
import { createTapHint } from "./tapHint";

const NUDGE_MS = 300;

/**
 * Makes the Now playing page a touch surface: a tap pauses or plays, a swipe left skips to the next
 * track and a swipe right goes back. A symbol and a small nudge show that the touch was understood.
 */
export function wireNowGestures(page: HTMLElement, getView: () => MusicView | undefined, now: NowHandlers): void {
  const hint = createTapHint();
  page.append(hint.element);
  const nudge = (side: "left" | "right"): void => {
    page.classList.add(`nudge-${side}`);
    setTimeout(() => page.classList.remove(`nudge-${side}`), NUDGE_MS);
  };
  attachGestures(page, {
    onTap() {
      hint.flash(getView()?.mode === "playing" ? PAUSE : PLAY);
      now.onPlayPause();
    },
    onSwipeLeft() {
      hint.flash(NEXT);
      nudge("left");
      now.onSkip("next");
    },
    onSwipeRight() {
      hint.flash(PREV);
      nudge("right");
      now.onSkip("previous");
    },
  });
}
