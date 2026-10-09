import type { SceneId } from "./scene";

/** The scene the user picked by hand, forgotten after a period with no touch. */
export function activeRequest(requested: SceneId | null, lastTouch: number, now: number, timeoutMs: number): SceneId | null {
  return now - lastTouch > timeoutMs ? null : requested;
}
