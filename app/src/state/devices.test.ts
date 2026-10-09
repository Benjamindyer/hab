import { describe, expect, it } from "vitest";
import { describeDevice, kindWord } from "./devices";

describe("describeDevice", () => {
  it("capitalises the name", () => {
    expect(describeDevice("kitchen").label).toBe("Kitchen");
    expect(describeDevice("Living room").label).toBe("Living room");
  });

  it("recognises the kinds of device in a typical list", () => {
    expect(describeDevice("Living room TV").kind).toBe("tv");
    expect(describeDevice("Bedroom Fire TV Cube").kind).toBe("tv");
    expect(describeDevice("Kitchen echo show").kind).toBe("echo");
    expect(describeDevice("Everywhere").kind).toBe("group");
    expect(describeDevice("Bedroom").kind).toBe("speaker");
  });

  it("recognises computers and phones", () => {
    expect(describeDevice("Work MacBook Pro").kind).toBe("computer");
    expect(describeDevice("iPhone").kind).toBe("phone");
  });

  it("has a word for each kind", () => {
    expect(kindWord("group")).toBe("All speakers");
    expect(kindWord("tv")).toBe("TV");
  });
});
