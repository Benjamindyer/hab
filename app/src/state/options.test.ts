import { describe, expect, it } from "vitest";
import { deviceOptions, entityOptions } from "./options";

const entity = (id: string, name?: string) => ({ id, state: "on", attributes: name ? { friendly_name: name } : {} });

describe("entityOptions", () => {
  it("lists one kind, with names, sorted", () => {
    const options = entityOptions([entity("weather.b", "Beta"), entity("light.x"), entity("weather.a", "Alpha")], "weather");
    expect(options).toEqual([
      { value: "weather.a", label: "Alpha (weather.a)" },
      { value: "weather.b", label: "Beta (weather.b)" },
    ]);
  });

  it("uses the id when there is no name", () => {
    expect(entityOptions([entity("climate.hall")], "climate")).toEqual([{ value: "climate.hall", label: "climate.hall" }]);
  });

  it("does not match a longer domain name", () => {
    expect(entityOptions([entity("media_player_group.x")], "media_player")).toEqual([]);
  });
});

describe("deviceOptions", () => {
  it("lists a player's devices", () => {
    const player = { id: "media_player.s", state: "idle", attributes: { source_list: ["kitchen", "Bedroom"] } };
    expect(deviceOptions(player).map((o) => o.value)).toEqual(["kitchen", "Bedroom"]);
  });

  it("is empty with no player or no list", () => {
    expect(deviceOptions(undefined)).toEqual([]);
    expect(deviceOptions({ id: "x", state: "idle", attributes: {} })).toEqual([]);
  });
});
