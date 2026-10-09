export type SceneId = "ambient" | "voice" | "timers" | "music" | "home" | "power" | "alerts" | "setup";

export type VoiceState = "idle" | "listening" | "processing" | "responding";

/** Everything the scene choice depends on. Pure data, no Home Assistant types. */
export interface SceneInputs {
  voice: VoiceState;
  ringingTimer: boolean;
  activeAlert: boolean;
  /** The scene the user picked by hand, or null to show the default. */
  requested: SceneId | null;
}

/**
 * Picks the scene to show.
 * Order of priority: a ringing timer, then voice, then an alert, then the user's choice.
 */
export function chooseScene(inputs: SceneInputs): SceneId {
  if (inputs.ringingTimer) return "timers";
  if (inputs.voice !== "idle") return "voice";
  if (inputs.activeAlert) return "alerts";
  return inputs.requested ?? "ambient";
}
