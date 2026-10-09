import { describe, expect, it } from "vitest";
import { toSpotifyUri } from "./spotifyLink";

describe("toSpotifyUri", () => {
  it("keeps a uri that is already right", () => {
    expect(toSpotifyUri("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M")).toBe("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M");
  });

  it("turns a share link into a uri and ignores the tracking part", () => {
    expect(toSpotifyUri("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123")).toBe("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M");
  });

  it("handles albums and the country prefix", () => {
    expect(toSpotifyUri("https://open.spotify.com/intl-gb/album/4aawyAB9vmqN3uQ7FjRGTy")).toBe("spotify:album:4aawyAB9vmqN3uQ7FjRGTy");
  });

  it("trims spaces", () => {
    expect(toSpotifyUri("  spotify:album:abc  ")).toBe("spotify:album:abc");
  });

  it("rejects anything else", () => {
    expect(toSpotifyUri("https://example.com/playlist/abc")).toBeNull();
    expect(toSpotifyUri("")).toBeNull();
    expect(toSpotifyUri("spotify:user:abc")).toBeNull();
  });
});
