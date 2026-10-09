import { describe, expect, it } from "vitest";
import { activeRequest } from "./navigation";

describe("activeRequest", () => {
  it("keeps the picked scene while the screen is in use", () => {
    expect(activeRequest("music", 1000, 5000, 60000)).toBe("music");
  });

  it("goes back to the default after the timeout", () => {
    expect(activeRequest("music", 1000, 70000, 60000)).toBeNull();
  });

  it("stays empty when nothing was picked", () => {
    expect(activeRequest(null, 1000, 2000, 60000)).toBeNull();
  });
});
