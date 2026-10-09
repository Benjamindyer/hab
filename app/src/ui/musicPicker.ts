import { describeDevice, kindWord } from "../state/devices";
import type { MusicView } from "../state/music";
import { el, renderWhenChanged, setText } from "./dom";

export interface Picker {
  element: HTMLElement;
  update(view: MusicView, selectedRoom: string | null): void;
}

function roomTile(room: string, selected: boolean, onPick: () => void): HTMLButtonElement {
  const info = describeDevice(room);
  const tile = el("button", selected ? "tile on" : "tile");
  const bars = el("span", "eq");
  bars.append(el("i"), el("i"), el("i"), el("i"));
  tile.append(el("span", "tile-name", info.label), el("span", "tile-kind", kindWord(info.kind)), bars);
  tile.addEventListener("click", onPick);
  return tile;
}

/** The speakers page: a big title for the chosen place and a tile for every speaker. */
export function createPicker(onRoom: (room: string) => void): Picker {
  const element = el("div", "speakers");
  const whereName = el("div", "where-name");
  const rooms = el("div", "rooms");
  element.append(el("div", "where-label", "Play in"), whereName, rooms);

  return {
    element,
    update(view, selectedRoom) {
      setText(whereName, selectedRoom ? describeDevice(selectedRoom).label : "Choose a speaker");
      renderWhenChanged(rooms, `${view.sources.join("|")}#${selectedRoom}`, () =>
        view.sources.map((room) => roomTile(room, room === selectedRoom, () => onRoom(room))),
      );
    },
  };
}
