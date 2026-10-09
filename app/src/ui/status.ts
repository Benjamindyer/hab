import { el } from "./dom";

import "./styles/base.css";
import "./styles/status.css";

/** A full-screen message for the moments before the app is running: connecting, or something is wrong. */
export function showStatus(root: HTMLElement, title: string, detail = ""): void {
  const box = el("div", "status");
  box.append(el("div", "status-title", title));
  if (detail) box.append(el("div", "status-detail", detail));
  root.replaceChildren(box);
}
