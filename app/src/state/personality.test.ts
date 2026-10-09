import { describe, expect, it } from "vitest";
import { ambientNote, type AmbientFacts } from "./personality";

const facts: AmbientFacts = {
  hour: 14,
  room: "Kitchen",
  indoor: 22,
  target: 17,
  outside: 18,
  condition: "rainy",
};

describe("ambientNote", () => {
  it("keeps to plain facts when both dials are low", () => {
    expect(ambientNote(facts, { humour: 0, honesty: 0 })).toBe(
      "Good afternoon. Kitchen is 22 degrees. Outside it is 18 and rainy.",
    );
  });

  it("adds the heating fact when honesty is high", () => {
    const note = ambientNote(facts, { humour: 0, honesty: 100 });
    expect(note).toContain("The radiator target is 17. The room is above target.");
  });

  it("adds a quip when humour is high", () => {
    expect(ambientNote(facts, { humour: 100, honesty: 0 })).toContain("Rain. Nobody is surprised.");
  });

  it("leaves out anything it has no data for", () => {
    const note = ambientNote({ ...facts, indoor: null, outside: null, condition: null }, { humour: 100, honesty: 100 });
    expect(note).toBe("Good afternoon.");
  });

  it("changes the greeting through the day", () => {
    const at = (hour: number): string => ambientNote({ ...facts, hour, indoor: null, outside: null }, { humour: 0, honesty: 0 });
    expect(at(3)).toBe("It is very late.");
    expect(at(9)).toBe("Good morning.");
    expect(at(20)).toBe("Good evening.");
  });
});
