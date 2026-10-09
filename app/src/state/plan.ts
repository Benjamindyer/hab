import type { ServiceCall, ServiceRunner } from "./services";

export type Sleep = (ms: number) => Promise<void>;

const realSleep: Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs service calls one after another, honouring each call's wait. Stops at the first failure. */
export async function runPlan(run: ServiceRunner, calls: ServiceCall[], sleep: Sleep = realSleep): Promise<void> {
  for (const call of calls) {
    await run(call);
    if (call.waitAfterMs) await sleep(call.waitAfterMs);
  }
}
