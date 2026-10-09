import type { Connection } from "home-assistant-js-websocket";
import type { ForecastKind, ForecastSource } from "../state/forecastCache";

interface ForecastReply {
  response?: Record<string, { forecast?: unknown }>;
}

/** Asks Home Assistant for a weather forecast with the weather.get_forecasts service. */
export function createForecastSource(connection: Connection): ForecastSource {
  return {
    async forecast(entityId: string, kind: ForecastKind): Promise<unknown> {
      const reply = await connection.sendMessagePromise<ForecastReply>({
        type: "call_service",
        domain: "weather",
        service: "get_forecasts",
        service_data: { type: kind },
        target: { entity_id: entityId },
        return_response: true,
      });
      return reply.response?.[entityId]?.forecast;
    },
  };
}
