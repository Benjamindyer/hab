import type { Entity } from "./entities";

export interface Option {
  value: string;
  label: string;
}

/** Entities of one kind, as choices for a form, in name order. */
export function entityOptions(entities: Entity[], domain: string): Option[] {
  return entities
    .filter((e) => e.id.startsWith(`${domain}.`))
    .map((e) => {
      const name = e.attributes["friendly_name"];
      return { value: e.id, label: typeof name === "string" && name ? `${name} (${e.id})` : e.id };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** The Spotify devices a player lists, as choices. */
export function deviceOptions(player: Entity | undefined): Option[] {
  const list = player?.attributes["source_list"];
  if (!Array.isArray(list)) return [];
  return list.filter((d): d is string => typeof d === "string").map((d) => ({ value: d, label: d }));
}
