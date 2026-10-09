export interface LlmConfig {
  /** The AI Task entity that writes the screen comments, for example ai_task.claude. */
  personality?: string;
  /**
   * Let the model add what it knows about an artist or song. Off by default, because a model
   * can be wrong about music and HAB cannot check it.
   */
  musicKnowledge?: boolean;
  /**
   * Look up facts about the track and artist in MusicBrainz, a free open music database, and let the
   * model use them. Sends the track and artist names to musicbrainz.org. Off by default.
   */
  musicLookup?: boolean;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/** Checks the optional llm section of the config. */
export function parseLlm(raw: unknown): LlmConfig | undefined {
  if (raw === undefined) return undefined;
  if (!isObject(raw)) throw new Error("llm must be an object, for example { \"personality\": \"ai_task.your_model\" }.");
  const entity = raw["personality"];
  if (entity !== undefined && (typeof entity !== "string" || !entity.startsWith("ai_task."))) {
    throw new Error("llm.personality must be an AI Task entity id that starts with ai_task.");
  }
  const knowledge = optionalBoolean(raw, "musicKnowledge");
  const lookup = optionalBoolean(raw, "musicLookup");
  return {
    ...(typeof entity === "string" && { personality: entity }),
    ...(knowledge !== undefined && { musicKnowledge: knowledge }),
    ...(lookup !== undefined && { musicLookup: lookup }),
  };
}

function optionalBoolean(raw: Record<string, unknown>, key: string): boolean | undefined {
  const value = raw[key];
  if (value !== undefined && typeof value !== "boolean") throw new Error(`llm.${key} must be true or false.`);
  return value;
}
