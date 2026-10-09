import { describe, expect, it } from "vitest";
import { activityChanged, createPageFollower, defaultPage } from "./musicPage";

describe("defaultPage", () => {
  it("shows the track while playing or paused", () => {
    expect(defaultPage("playing")).toBe("now");
    expect(defaultPage("paused")).toBe("now");
  });

  it("shows the library otherwise", () => {
    expect(defaultPage("idle")).toBe("library");
    expect(defaultPage("unavailable")).toBe("library");
  });
});

describe("activityChanged", () => {
  it("counts the first look as a change", () => {
    expect(activityChanged(null, "idle")).toBe(true);
  });

  it("ignores play to pause", () => {
    expect(activityChanged("playing", "paused")).toBe(false);
  });

  it("notices starting and stopping", () => {
    expect(activityChanged("idle", "playing")).toBe(true);
    expect(activityChanged("paused", "idle")).toBe(true);
  });
});

describe("createPageFollower", () => {
  it("picks the right page the first time", () => {
    expect(createPageFollower().next("idle", 0)).toBe("library");
    expect(createPageFollower().next("playing", 0)).toBe("now");
  });

  it("ignores a short gap between tracks", () => {
    const follower = createPageFollower(3000);
    follower.next("playing", 0);
    expect(follower.next("idle", 1000)).toBeNull();
    expect(follower.next("playing", 2000)).toBeNull();
    expect(follower.next("playing", 9000)).toBeNull();
  });

  it("follows a change that lasts", () => {
    const follower = createPageFollower(3000);
    follower.next("playing", 0);
    expect(follower.next("idle", 1000)).toBeNull();
    expect(follower.next("idle", 3500)).toBeNull();
    expect(follower.next("idle", 4100)).toBe("library");
    expect(follower.next("idle", 5000)).toBeNull();
  });

  it("stays put when only play and pause change", () => {
    const follower = createPageFollower();
    follower.next("playing", 0);
    expect(follower.next("paused", 10000)).toBeNull();
  });
});
