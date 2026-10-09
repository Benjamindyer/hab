import { describe, expect, it } from "vitest";
import { activeRequest } from "./navigation";

const base = { lastTouch: 1000, timeoutMs: 60000 };

describe("activeRequest", () => {
  it("keeps the picked scene while the screen is in use", () => {
    expect(activeRequest({ ...base, requested: "music", now: 5000 })).toBe("music");
  });

  it("goes back to the default after the timeout", () => {
    expect(activeRequest({ ...base, requested: "music", now: 70000 })).toBeNull();
  });

  it("stays empty when nothing was picked", () => {
    expect(activeRequest({ ...base, requested: null, now: 2000 })).toBeNull();
  });

  it("stays on the picked scene however long it is left, while it is held", () => {
    expect(activeRequest({ ...base, requested: "music", now: 9_000_000, hold: true })).toBe("music");
  });

  it("holding does nothing when no scene was picked", () => {
    expect(activeRequest({ ...base, requested: null, now: 9_000_000, hold: true })).toBeNull();
  });
});
