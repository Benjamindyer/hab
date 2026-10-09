import type { SceneId } from "./scene";

export interface RequestTimeout {
  requested: SceneId | null;
  /** When the screen was last touched, in milliseconds. */
  lastTouch: number;
  now: number;
  timeoutMs: number;
  /** True while the chosen scene should stay up however long it is left alone, for example music that is playing. */
  hold?: boolean;
}

/** The scene the user picked by hand, forgotten after a period with no touch, unless it should be held. */
export function activeRequest({ requested, lastTouch, now, timeoutMs, hold = false }: RequestTimeout): SceneId | null {
  if (hold) return requested;
  return now - lastTouch > timeoutMs ? null : requested;
}
