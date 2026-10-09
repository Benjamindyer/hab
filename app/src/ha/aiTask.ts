import type { Connection } from "home-assistant-js-websocket";
import type { TextGenerator } from "../state/llm";

interface ServiceResult {
  response?: { data?: unknown };
}

/** Pulls the text out of whatever shape an AI Task integration returns. */
export function extractText(data: unknown): string {
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null) {
    const found = Object.values(data).find((value) => typeof value === "string");
    if (typeof found === "string") return found;
  }
  throw new Error("The AI Task returned no text.");
}

/** Asks whichever model the owner chose in Home Assistant, through the AI Task service. */
export function createAiTaskGenerator(connection: Connection, entityId: string): TextGenerator {
  return {
    async generate({ taskName, instructions }) {
      const result = await connection.sendMessagePromise<ServiceResult>({
        type: "call_service",
        domain: "ai_task",
        service: "generate_data",
        service_data: { task_name: taskName, instructions, entity_id: entityId },
        return_response: true,
      });
      return extractText(result.response?.data);
    },
  };
}
