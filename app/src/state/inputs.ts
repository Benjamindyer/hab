import type { EntityStore } from "./entities";
import type { SceneId, SceneInputs, VoiceState } from "./scene";

const VOICE_STATES: readonly VoiceState[] = ["idle", "listening", "processing", "responding"];

/** Maps an assist_satellite state to a voice state. Anything unexpected counts as idle. */
export function toVoiceState(raw: string | undefined): VoiceState {
  return VOICE_STATES.find((state) => state === raw) ?? "idle";
}

/** Reads what the scene choice depends on from the live entities. */
export function deriveInputs(
  store: EntityStore,
  satelliteId: string | undefined,
  requested: SceneId | null,
): SceneInputs {
  const satellite = satelliteId ? store.get(satelliteId) : undefined;
  return {
    voice: toVoiceState(satellite?.state),
    ringingTimer: false,
    activeAlert: false,
    requested,
  };
}

/** A name for the track playing right now, used to give it its own dance. Null when nothing plays. */
export function musicSeed(store: EntityStore, playerId: string | undefined): string | null {
  const player = playerId ? store.get(playerId) : undefined;
  if (player?.state !== "playing") return null;
  const title = player.attributes["media_title"];
  return typeof title === "string" && title ? title : playerId ?? null;
}
