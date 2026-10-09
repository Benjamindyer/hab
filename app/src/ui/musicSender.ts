import { runPlan } from "../state/plan";
import type { ServiceCall } from "../state/services";
import type { SceneContext } from "./scene";

const MESSAGE_MS = 6000;

export interface Sender {
  bind(context: SceneContext): void;
  context(): SceneContext | undefined;
  send(calls: ServiceCall[]): void;
  /** A recent error to show instead of the usual line, or null. */
  notice(): string | null;
}

/** Sends service calls for the music screen and remembers a failure long enough to be read. */
export function createSender(): Sender {
  let current: SceneContext | undefined;
  let message = { text: "", until: 0 };
  return {
    bind: (context) => { current = context; },
    context: () => current,
    send(calls) {
      if (!current) return;
      runPlan(current.run, calls).catch((error: unknown) => {
        const reason = error instanceof Error ? error.message : String(error);
        message = { text: `Spotify said no: ${reason}`, until: Date.now() + MESSAGE_MS };
      });
    },
    notice: () => (message.until > Date.now() ? message.text : null),
  };
}
