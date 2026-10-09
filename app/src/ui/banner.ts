import type { ConnectionStatus } from "../ha/connectionStatus";
import { el } from "./dom";

/** A small warning at the top of the screen while the link to Home Assistant is down. */
export function mountConnectionBanner(parent: HTMLElement, status: ConnectionStatus): void {
  const banner = el("div", "banner", "Lost connection to Home Assistant. Reconnecting...");
  banner.hidden = true;
  parent.append(banner);
  status.subscribe((online) => { banner.hidden = online; });
}
