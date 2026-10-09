import type { Draft } from "../../config/draft";
import type { EntityStore } from "../../state/entities";
import { deviceOptions, entityOptions } from "../../state/options";
import { el } from "../dom";
import { createFavouritesEditor } from "./favourites";
import { checkboxInput, dialInput, row, section, selectInput, textInput } from "./fields";

function assistant(draft: Draft): HTMLElement {
  const box = section("Assistant", "Its name and character. The dials change how it words things.");
  box.append(
    row("Name", textInput(draft.name, (v) => { draft.name = v; }, "Assistant")),
    row("Humour", dialInput(draft.humour, (v) => { draft.humour = v; }), "0 is plain, 100 is jokey."),
    row("Honesty", dialInput(draft.honesty, (v) => { draft.honesty = v; }), "0 is gentle, 100 is blunt. It never lies at any setting."),
  );
  return box;
}

function home(draft: Draft, entities: EntityStore): HTMLElement {
  const all = entities.all();
  const box = section("Home screen");
  box.append(
    row("Room name", textInput(draft.room, (v) => { draft.room = v; }, "Kitchen"), "Shown beside the room temperature."),
    row("Weather", selectInput(entityOptions(all, "weather"), draft.weather, (v) => { draft.weather = v; })),
    row("Room heating", selectInput(entityOptions(all, "climate"), draft.climate, (v) => { draft.climate = v; }), "Gives the room temperature."),
  );
  return box;
}

function music(draft: Draft, entities: EntityStore): HTMLElement {
  const box = section("Music", "Connect Spotify in Home Assistant first. HAB never asks for a Spotify login.");
  const devices = el("datalist");
  devices.id = "hab-devices";
  const fill = (): void => devices.replaceChildren(...deviceOptions(entities.get(draft.player)).map((o) => Object.assign(el("option"), { value: o.value })));
  const defaultRoom = textInput(draft.defaultRoom, (v) => { draft.defaultRoom = v; }, "kitchen");
  defaultRoom.setAttribute("list", devices.id);
  const player = selectInput(entityOptions(entities.all(), "media_player"), draft.player, (v) => { draft.player = v; fill(); });
  fill();
  box.append(
    row("Spotify player", player),
    row("Speaker to start on", defaultRoom, "One of your Spotify devices."),
    row("Favourites", createFavouritesEditor(draft), "Shown first on the library page."),
    devices,
  );
  return box;
}

function extras(draft: Draft, entities: EntityStore): HTMLElement {
  const all = entities.all();
  const box = section("Voice and language model");
  box.append(
    row("Voice device", selectInput(entityOptions(all, "assist_satellite"), draft.satellite, (v) => { draft.satellite = v; }), "Its state drives the listening animation."),
    row("Language model for comments", selectInput(entityOptions(all, "ai_task"), draft.llm, (v) => { draft.llm = v; }),
      "Off unless you choose one. When on, a short list of facts (track, room temperature, time) is sent to the model you set up in Home Assistant, which may be a cloud service. See docs/LANGUAGE-MODELS.md in the HAB repository."),
    row("Music facts", checkboxInput("Look up facts about the track and artist", draft.musicLookup, (v) => { draft.musicLookup = v; }),
      "Finds the release year, where the artist is from and the genre in MusicBrainz, a free open music database, and lets the model use them. Sends the track and artist names to musicbrainz.org."),
    row("Music knowledge", checkboxInput("Let the model add what it knows about the artist or song", draft.musicKnowledge, (v) => { draft.musicKnowledge = v; }),
      "Makes music lines more interesting. A model can be wrong about music and HAB cannot check it, so this is off unless you turn it on."),
  );
  return box;
}

/** The whole settings form. It edits the draft in place. */
export function buildForm(draft: Draft, entities: EntityStore): HTMLElement[] {
  return [assistant(draft), home(draft, entities), music(draft, entities), extras(draft, entities)];
}
