import { describe, expect, it } from "vitest";
import { parseConfig } from "./config";
import { resolveConfig } from "./resolve";

const valid = { personality: { humour: 10, honesty: 20 }, ambient: { room: "Hall" } };

describe("resolveConfig", () => {
  it("prefers the file", () => {
    const file = parseConfig(valid);
    expect(resolveConfig({ file, stored: valid, entities: [] }).source).toBe("file");
  });

  it("uses settings saved in Home Assistant when there is no file", () => {
    const result = resolveConfig({ file: null, stored: valid, entities: [] });
    expect(result.source).toBe("stored");
    expect(result.config.ambient.room).toBe("Hall");
  });

  it("guesses when nothing is saved", () => {
    expect(resolveConfig({ file: null, stored: null, entities: [] }).source).toBe("auto");
  });

  it("guesses, and says why, when the saved settings are not valid", () => {
    const result = resolveConfig({ file: null, stored: { nope: true }, entities: [] });
    expect(result.source).toBe("auto");
    expect(result.problem).toMatch(/personality/);
  });
});
