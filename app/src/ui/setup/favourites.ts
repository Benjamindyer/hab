import type { Draft, DraftFavourite } from "../../config/draft";
import { el } from "../dom";
import { textInput } from "./fields";

function favouriteRow(item: DraftFavourite, onRemove: () => void): HTMLElement {
  const box = el("div", "fav-row");
  const remove = el("button", "btn small", "Remove");
  remove.addEventListener("click", onRemove);
  box.append(
    textInput(item.name, (v) => { item.name = v; }, "Name"),
    textInput(item.link, (v) => { item.link = v; }, "Paste a Spotify link"),
    remove,
  );
  return box;
}

/** Playlists and albums to show first. The owner pastes a link from Spotify's Share menu. */
export function createFavouritesEditor(draft: Draft): HTMLElement {
  const box = el("div", "favs-editor");
  const render = (): void => {
    const add = el("button", "btn small", "Add a favourite");
    add.addEventListener("click", () => {
      draft.favourites.push({ name: "", link: "" });
      render();
    });
    box.replaceChildren(
      ...draft.favourites.map((item) =>
        favouriteRow(item, () => {
          draft.favourites.splice(draft.favourites.indexOf(item), 1);
          render();
        }),
      ),
      add,
    );
  };
  render();
  return box;
}
