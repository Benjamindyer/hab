import { describe, expect, it } from "vitest";
import { createCommentary, type CommentRequest } from "./commentary";
import type { TextGenerator } from "./llm";

const dials = { humour: 60, honesty: 75 };
const request = (key: string, over: Partial<CommentRequest> = {}): CommentRequest => ({
  kind: "ambient", key, fallback: "Fallback line.", facts: { indoor: 22 }, ...over,
});

function fake(reply: string | Error): TextGenerator & { calls: number } {
  const g = {
    calls: 0,
    async generate() {
      g.calls += 1;
      if (reply instanceof Error) throw reply;
      return reply;
    },
  };
  return g;
}

describe("createCommentary", () => {
  it("always gives the fallback when there is no model", () => {
    expect(createCommentary(null).line(request("a"), dials)).toBe("Fallback line.");
  });

  it("shows the fallback first, then the model's line once it arrives", async () => {
    const commentary = createCommentary(fake("Warm in here."));
    expect(commentary.line(request("a"), dials)).toBe("Fallback line.");
    await commentary.settled();
    expect(commentary.line(request("a"), dials)).toBe("Warm in here.");
  });

  it("drops a reply with an invented number and does not ask again for the same thing", async () => {
    const generator = fake("It is 41 degrees.");
    const commentary = createCommentary(generator);
    commentary.line(request("a"), dials);
    await commentary.settled();
    expect(commentary.line(request("a"), dials)).toBe("Fallback line.");
    expect(commentary.line(request("a"), dials)).toBe("Fallback line.");
    expect(generator.calls).toBe(1);
  });

  it("spaces requests out", async () => {
    let now = 0;
    const generator = fake("Fine.");
    const commentary = createCommentary(generator, { clock: () => now, minGapMs: 1000 });
    commentary.line(request("a"), dials);
    await commentary.settled();
    now = 500;
    commentary.line(request("b"), dials);
    expect(generator.calls).toBe(1);
    now = 1500;
    commentary.line(request("b"), dials);
    await commentary.settled();
    expect(generator.calls).toBe(2);
  });

});

describe("createCommentary failures and changes", () => {
  it("falls back and waits after a failure", async () => {
    let now = 0;
    const generator = fake(new Error("offline"));
    const commentary = createCommentary(generator, { clock: () => now, minGapMs: 0, backoffMs: 5000 });
    expect(commentary.line(request("a"), dials)).toBe("Fallback line.");
    await commentary.settled();
    now = 1000;
    commentary.line(request("a"), dials);
    expect(generator.calls).toBe(1);
    now = 6000;
    commentary.line(request("a"), dials);
    await commentary.settled();
    expect(generator.calls).toBe(2);
  });

  it("asks again when the dials change", async () => {
    const generator = fake("Fine.");
    const commentary = createCommentary(generator, { minGapMs: 0 });
    commentary.line(request("a"), dials);
    await commentary.settled();
    commentary.line(request("a"), { humour: 10, honesty: 75 });
    await commentary.settled();
    expect(generator.calls).toBe(2);
  });

  it("keeps ambient and music lines apart", async () => {
    const commentary = createCommentary(fake("Line."), { minGapMs: 0 });
    commentary.line(request("a"), dials);
    await commentary.settled();
    expect(commentary.line(request("a", { kind: "music", fallback: "Music fallback." }), dials)).toBe("Music fallback.");
  });
});
