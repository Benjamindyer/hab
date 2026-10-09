import type { Entity } from "../state/entities";
import type { HabConfig } from "./config";

const firstIn = (entities: Entity[], domain: string, keep: (e: Entity) => boolean = () => true): Entity | undefined =>
  entities.find((e) => e.id.startsWith(`${domain}.`) && keep(e));

/**
 * A first guess at the settings, made from what Home Assistant has. It never turns on an LLM,
 * because that sends information to a model provider and the owner must choose that.
 */
export function autoConfig(entities: Entity[]): HabConfig {
  const weather = firstIn(entities, "weather");
  const climate = firstIn(entities, "climate");
  const spotify = firstIn(entities, "media_player", (e) => e.id.includes("spotify"));
  const satellite = firstIn(entities, "assist_satellite");
  return {
    personality: { humour: 50, honesty: 50 },
    ambient: {
      room: "Home",
      ...(weather && { weather: weather.id }),
      ...(climate && { climate: climate.id }),
    },
    ...(spotify && { music: { player: spotify.id, favourites: [] } }),
    ...(satellite && { satellite: satellite.id }),
  };
}
