import { describe, expect, it } from "vitest";
import { isAcceptable, numbersAreGrounded } from "./guard";

const facts = { room: "Kitchen", indoor: 22, outside: 17.6, time: "15:10", track: "77 Strings" };

describe("numbersAreGrounded", () => {
  it("accepts numbers that are in the facts", () => {
    expect(numbersAreGrounded("It is 22 degrees at 15:10.", facts)).toBe(true);
  });

  it("accepts a rounded version of a fact", () => {
    expect(numbersAreGrounded("About 18 outside.", facts)).toBe(true);
  });

  it("rejects an invented number", () => {
    expect(numbersAreGrounded("It is 31 degrees.", facts)).toBe(false);
  });

  it("accepts text with no numbers", () => {
    expect(numbersAreGrounded("Nothing to report.", facts)).toBe(true);
  });

  it("checks numbers written as words", () => {
    expect(numbersAreGrounded("Twenty-two degrees in the kitchen.", facts)).toBe(true);
    expect(numbersAreGrounded("About eighteen outside.", facts)).toBe(true);
    expect(numbersAreGrounded("Thirty-one degrees in the kitchen.", facts)).toBe(false);
    expect(numbersAreGrounded("It is five past the hour.", facts)).toBe(false);
  });

  it("does not mistake the word one for a number", () => {
    expect(numbersAreGrounded("No one is home. Quiet as one could wish.", facts)).toBe(true);
  });

  it("finds numbers inside text facts, such as a track name", () => {
    expect(numbersAreGrounded("Playing 77 Strings.", facts)).toBe(true);
  });
});

describe("isAcceptable", () => {
  it("accepts a short plain line", () => {
    expect(isAcceptable("Warm in here, wet out there.", facts)).toBe(true);
  });

  it("rejects empty, long or multi-line replies", () => {
    expect(isAcceptable("", facts)).toBe(false);
    expect(isAcceptable("x".repeat(300), facts)).toBe(false);
    expect(isAcceptable("One.\nTwo.", facts)).toBe(false);
  });

  it("rejects a reply with an invented number", () => {
    expect(isAcceptable("Only 5 degrees tonight.", facts)).toBe(false);
  });
});
