import { describe, expect, it } from "vitest";
import { extractText } from "./aiTask";

describe("extractText", () => {
  it("accepts plain text", () => {
    expect(extractText("Hello.")).toBe("Hello.");
  });

  it("takes the first text value from an object", () => {
    expect(extractText({ comment: "Hello." })).toBe("Hello.");
  });

  it("throws when there is no text", () => {
    expect(() => extractText({ n: 1 })).toThrow(/no text/);
    expect(() => extractText(undefined)).toThrow(/no text/);
  });
});
