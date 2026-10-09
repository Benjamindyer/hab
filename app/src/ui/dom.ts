/** Creates an element with a class and optional text. Keeps scene code short. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Replaces the children of a container only when the key changes, so taps are never lost to a redraw. */
export function renderWhenChanged(container: HTMLElement, key: string, build: () => HTMLElement[]): void {
  if (container.dataset["key"] === key) return;
  container.dataset["key"] = key;
  container.replaceChildren(...build());
}

export const mmss = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

/** Sets text only when it changed. Rewriting identical text every second makes the screen flicker. */
export function setText(node: HTMLElement, text: string): void {
  if (node.textContent !== text) node.textContent = text;
}
