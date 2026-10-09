import { typingDuration, visibleLength } from "../state/typing";
import { el } from "./dom";

const MS_PER_CHAR = 22;
const CAP_MS = 2400;
const TICK_MS = 30;
const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface Speech {
  element: HTMLElement;
  /**
   * Says a line. It is typed out beside the slab, and `onSpeak` is told how long it will take, so the slab
   * can move while it "talks". Saying the line already shown does nothing.
   */
  say(text: string, onSpeak?: (ms: number) => void): void;
}

/** The line of text that seems to come from the slab. It types itself out when it changes. */
export function createSpeech(): Speech {
  const element = el("div", "speech");
  let target = "";
  let timer: number | undefined;

  const finish = (): void => {
    window.clearInterval(timer);
    timer = undefined;
    element.textContent = target;
    element.classList.remove("typing");
  };

  return {
    element,
    say(text, onSpeak) {
      if (text === target) return;
      target = text;
      window.clearInterval(timer);
      if (calm || text === "") return finish();
      const started = performance.now();
      element.classList.add("typing");
      onSpeak?.(typingDuration(text.length, MS_PER_CHAR, CAP_MS));
      timer = window.setInterval(() => {
        const shown = visibleLength(text.length, performance.now() - started, MS_PER_CHAR);
        element.textContent = text.slice(0, shown);
        if (shown >= text.length) finish();
      }, TICK_MS);
    },
  };
}
