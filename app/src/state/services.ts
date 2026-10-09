/** One Home Assistant service call, described as plain data so it can be planned and tested. */
export interface ServiceCall {
  domain: string;
  service: string;
  entityId: string;
  data?: Record<string, unknown>;
  /** Pause after this call, for devices that need a moment before the next one. */
  waitAfterMs?: number;
}

/** Sends a service call to Home Assistant. */
export type ServiceRunner = (call: ServiceCall) => Promise<void>;
