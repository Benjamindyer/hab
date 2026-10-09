export interface LlmConfig {
  /** The AI Task entity that writes the screen comments, for example ai_task.claude. */
  personality?: string;
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
  return typeof entity === "string" ? { personality: entity } : {};
}
