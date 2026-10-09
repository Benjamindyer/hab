import type { SceneId } from "../state/scene";
import { el } from "./dom";

export interface Nav {
  element: HTMLElement;
  setActive(id: SceneId): void;
  wake(): void;
}

const HIDE_AFTER_MS = 6000;

/** A quiet row of scene names. It fades away when the screen is left alone. */
export function createNav(items: { id: SceneId; label: string }[], onPick: (id: SceneId) => void): Nav {
  const element = el("nav", "nav");
  const buttons = new Map<SceneId, HTMLButtonElement>();
  for (const item of items) {
    const button = el("button", "nav-item", item.label);
    button.addEventListener("click", () => onPick(item.id));
    buttons.set(item.id, button);
    element.append(button);
  }
  let timer: number | undefined;
  return {
    element,
    setActive: (id) => buttons.forEach((button, key) => button.classList.toggle("on", key === id)),
    wake() {
      element.classList.add("awake");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => element.classList.remove("awake"), HIDE_AFTER_MS);
    },
  };
}
