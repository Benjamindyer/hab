import { describe, expect, it } from "vitest";
import { runPlan } from "./plan";
import type { ServiceCall } from "./services";

const call = (service: string, waitAfterMs?: number): ServiceCall => ({
  domain: "media_player",
  service,
  entityId: "media_player.x",
  ...(waitAfterMs !== undefined && { waitAfterMs }),
});

describe("runPlan", () => {
  it("runs calls in order and waits where asked", async () => {
    const log: string[] = [];
    await runPlan(
      async (c) => { log.push(c.service); },
      [call("a", 500), call("b")],
      async (ms) => { log.push(`wait ${ms}`); },
    );
    expect(log).toEqual(["a", "wait 500", "b"]);
  });

  it("stops at the first failure", async () => {
    const log: string[] = [];
    const run = async (c: ServiceCall): Promise<void> => {
      log.push(c.service);
      if (c.service === "a") throw new Error("no active device");
    };
    await expect(runPlan(run, [call("a"), call("b")])).rejects.toThrow("no active device");
    expect(log).toEqual(["a"]);
  });
});
