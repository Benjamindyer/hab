const LINK = /open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|artist|track|show|episode)\/([A-Za-z0-9]+)/;
const URI = /^spotify:(playlist|album|artist|track|show|episode):[A-Za-z0-9]+$/;

/**
 * Turns what a person pastes into a Spotify uri. It accepts a share link from the Spotify app
 * or website, or a uri that is already right. Returns null for anything else.
 */
export function toSpotifyUri(text: string): string | null {
  const value = text.trim();
  if (URI.test(value)) return value;
  const found = LINK.exec(value);
  return found ? `spotify:${found[1]}:${found[2]}` : null;
}
