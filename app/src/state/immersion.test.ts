import { describe, expect, it } from "vitest";
import { createImmersion } from "./immersion";

describe("createImmersion", () => {
  it("shows the details at first and hides them after a few seconds of the same track", () => {
    const immersion = createImmersion(3000, 6000);
    expect(immersion.hidden("a", true, 0)).toBe(false);
    expect(immersion.hidden("a", true, 2999)).toBe(false);
    expect(immersion.hidden("a", true, 3000)).toBe(true);
  });

  it("brings the details back for a new track", () => {
    const immersion = createImmersion(3000, 6000);
    immersion.hidden("a", true, 0);
    expect(immersion.hidden("a", true, 4000)).toBe(true);
    expect(immersion.hidden("b", true, 4100)).toBe(false);
    expect(immersion.hidden("b", true, 7100)).toBe(true);
  });

  it("brings them back on a touch, and hides them again after the hold", () => {
    const immersion = createImmersion(3000, 6000);
    immersion.hidden("a", true, 0);
    expect(immersion.hidden("a", true, 4000)).toBe(true);
    immersion.touch(5000);
    expect(immersion.hidden("a", true, 5100)).toBe(false);
    expect(immersion.hidden("a", true, 10999)).toBe(false);
    expect(immersion.hidden("a", true, 11000)).toBe(true);
  });

  it("always shows them when paused or stopped, and starts the count again after", () => {
    const immersion = createImmersion(3000, 6000);
    immersion.hidden("a", true, 0);
    expect(immersion.hidden("a", false, 5000)).toBe(false);
    expect(immersion.hidden(null, false, 5100)).toBe(false);
    expect(immersion.hidden("a", true, 6000)).toBe(false);
    expect(immersion.hidden("a", true, 9000)).toBe(true);
  });
});
