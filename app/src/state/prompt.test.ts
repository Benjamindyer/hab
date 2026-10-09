import { describe, expect, it } from "vitest";
import { buildInstructions } from "./prompt";

const facts = { room: "Kitchen", indoor: 22 };

describe("buildInstructions", () => {
  it("includes the name, the situation and the facts", () => {
    const text = buildInstructions("ambient", facts, { humour: 50, honesty: 50 }, "Robo");
    expect(text).toContain("You are Robo");
    expect(text).toContain("home screen is idle");
    expect(text).toContain('{"room":"Kitchen","indoor":22}');
  });

  it("forbids inventing facts", () => {
    expect(buildInstructions("music", facts, { humour: 0, honesty: 0 }, "X")).toContain("Never invent facts");
  });

  it("forbids claims about the music that the facts do not contain", () => {
    expect(buildInstructions("music", facts, { humour: 0, honesty: 0 }, "X")).toContain("no year, decade, genre");
  });

  it("gives honesty an example that fits the kind of line", () => {
    expect(buildInstructions("music", facts, { humour: 0, honesty: 100 }, "X")).toContain("the same artist playing again and again");
    expect(buildInstructions("ambient", facts, { humour: 0, honesty: 100 }, "X")).toContain("a room warmer than its heating target");
  });

  it("tells a gentle line what to leave out", () => {
    expect(buildInstructions("music", facts, { humour: 0, honesty: 0 }, "X")).toContain("repeats of the same artist or the time of day");
  });

  it("describes the dials in words", () => {
    expect(buildInstructions("music", facts, { humour: 0, honesty: 100 }, "X")).toMatch(/No jokes.*Be blunt/s);
    expect(buildInstructions("music", facts, { humour: 100, honesty: 0 }, "X")).toMatch(/Clearly funny.*Be gentle/s);
  });
});
