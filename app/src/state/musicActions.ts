import type { Favourite } from "../config/parseMusic";
import type { MusicView } from "./music";
import type { ServiceCall } from "./services";

const call = (player: string, service: string, data?: Record<string, unknown>, waitAfterMs?: number): ServiceCall => ({
  domain: "media_player",
  service,
  entityId: player,
  ...(data && { data }),
  ...(waitAfterMs !== undefined && { waitAfterMs }),
});

/** A Spotify uri looks like spotify:playlist:abc. The middle part is the content type. */
export function uriType(uri: string): string {
  return /^spotify:([a-z]+):/.exec(uri)?.[1] ?? "music";
}

export const playPause = (player: string, view: MusicView): ServiceCall[] => [
  call(player, view.mode === "playing" ? "media_pause" : "media_play"),
];

export const skip = (player: string, direction: "next" | "previous"): ServiceCall[] => [
  call(player, direction === "next" ? "media_next_track" : "media_previous_track"),
];

export const setVolume = (player: string, level: number): ServiceCall[] => [
  call(player, "volume_set", { volume_level: Math.min(1, Math.max(0, level)) }),
];

/** Moves playback to a Spotify device. */
export const chooseRoom = (player: string, room: string): ServiceCall[] => [
  call(player, "select_source", { source: room }),
];

const WAKE_DEVICE_MS = 1500;

/**
 * Starts a favourite. When nothing is playing there, the device is chosen first and given a moment
 * to wake, because Spotify refuses to play with no active device.
 */
export function playFavourite(player: string, view: MusicView, favourite: Favourite, room: string | null): ServiceCall[] {
  const needsDevice = room !== null && (view.mode === "idle" || view.source !== room);
  const play = call(player, "play_media", {
    media_content_id: favourite.uri,
    media_content_type: uriType(favourite.uri),
  });
  return needsDevice ? [call(player, "select_source", { source: room }, WAKE_DEVICE_MS), play] : [play];
}
