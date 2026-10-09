import { describe, expect, it } from "vitest";
import { chooseScene, type SceneInputs } from "./scene";

const quiet: SceneInputs = { voice: "idle", ringingTimer: false, activeAlert: false, requested: null };

describe("chooseScene", () => {
  it("shows ambient when nothing is happening", () => {
    expect(chooseScene(quiet)).toBe("ambient");
  });

  it("shows the scene the user picked", () => {
    expect(chooseScene({ ...quiet, requested: "power" })).toBe("power");
  });

  it("shows voice while the satellite is not idle", () => {
    expect(chooseScene({ ...quiet, voice: "listening", requested: "music" })).toBe("voice");
  });

  it("lets a ringing timer beat voice", () => {
    expect(chooseScene({ ...quiet, voice: "responding", ringingTimer: true })).toBe("timers");
  });

  it("interrupts a chosen scene with an alert", () => {
    expect(chooseScene({ ...quiet, activeAlert: true, requested: "home" })).toBe("alerts");
  });

  it("lets voice beat an alert", () => {
    expect(chooseScene({ ...quiet, voice: "processing", activeAlert: true })).toBe("voice");
  });
});
