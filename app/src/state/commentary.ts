import { isAcceptable } from "./guard";
import type { Facts, TextGenerator } from "./llm";
import type { Personality } from "./personality";
import { buildInstructions, type CommentKind } from "./prompt";

export interface CommentRequest {
  kind: CommentKind;
  /** Changes when there is something new to say. The same key means the same comment will do. */
  key: string;
  /** The line to show now, and whenever the model has nothing better. */
  fallback: string;
  facts: Facts;
}

export interface Commentary {
  line(request: CommentRequest, dials: Personality): string;
  /** Resolves when any request in flight has finished. Used by tests. */
  settled(): Promise<void>;
}

export interface CommentaryOptions {
  name?: string;
  clock?: () => number;
  minGapMs?: number;
  backoffMs?: number;
}

interface Entry {
  key: string;
  /** The model's line, or null when it was rejected and the fallback should stay. */
  text: string | null;
}

/** What is tracked for each kind of line, so the music line never waits on the home line. */
interface Pace {
  busy: Promise<void> | null;
  lastAsk: number;
  lastFail: number;
}

/**
 * Gives the screen a line from the model without ever depending on it. The fallback shows at once,
 * the model's line replaces it when it arrives, and requests are spaced out so a screen that
 * redraws every second does not ask every second.
 */
export function createCommentary(generator: TextGenerator | null, options: CommentaryOptions = {}): Commentary {
  const { name = "the assistant", clock = Date.now, minGapMs = 120_000, backoffMs = 300_000 } = options;
  const cache = new Map<CommentKind, Entry>();
  const pace = new Map<CommentKind, Pace>();
  const paceOf = (kind: CommentKind): Pace => {
    const found = pace.get(kind) ?? { busy: null, lastAsk: Number.NEGATIVE_INFINITY, lastFail: Number.NEGATIVE_INFINITY };
    pace.set(kind, found);
    return found;
  };

  async function ask(request: CommentRequest, dials: Personality, key: string): Promise<void> {
    if (!generator) return;
    try {
      const reply = await generator.generate({
        taskName: `HAB ${request.kind} comment`,
        instructions: buildInstructions(request.kind, request.facts, dials, name),
      });
      const text = reply.trim();
      cache.set(request.kind, { key, text: isAcceptable(text, request.facts) ? text : null });
    } catch {
      paceOf(request.kind).lastFail = clock();
    }
  }

  const due = (p: Pace): boolean => !p.busy && clock() - p.lastAsk >= minGapMs && clock() - p.lastFail >= backoffMs;

  return {
    line(request, dials) {
      if (!generator) return request.fallback;
      const key = `${request.key}|${dials.humour}/${dials.honesty}`;
      const hit = cache.get(request.kind);
      if (hit?.key === key) return hit.text ?? request.fallback;
      const p = paceOf(request.kind);
      if (due(p)) {
        p.lastAsk = clock();
        p.busy = ask(request, dials, key).finally(() => { p.busy = null; });
      }
      return request.fallback;
    },
    settled: async () => { await Promise.all([...pace.values()].map((p) => p.busy)); },
  };
}
