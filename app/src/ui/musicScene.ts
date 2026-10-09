import { createLibrary, type MediaBrowser } from "../state/library";
import { buildMusicView, targetRoom } from "../state/music";
import { createListeningHistory } from "../state/listening";
import { createPageFollower, type MusicPage } from "../state/musicPage";
import { createLibraryStore } from "../storage/libraryStore";
import { el } from "./dom";
import { createControls, type MusicState } from "./musicControls";
import { createImmersiveView } from "./immersiveView";
import { createLibraryPanel } from "./musicLibrary";
import { createNowPanel } from "./musicNow";
import { buildPages } from "./musicPages";
import { musicLine } from "./musicLine";
import { createPicker } from "./musicPicker";
import { wireNowGestures } from "./nowGestures";
import { createSender } from "./musicSender";
import { createSpeech } from "./speech";
import { createPager } from "./pager";
import type { Scene, SceneContext } from "./scene";

import "./styles/music.css";

/** Spotify, in three swipeable pages: where to play, your library, and what is playing. */
export function createMusicScene(): Scene {
  const element = Object.assign(el("section", "scene"), { id: "s-music" });
  const speech = createSpeech();
  const credit = el("div", "note-credit", "Facts from MusicBrainz");
  const sender = createSender();
  const browser: MediaBrowser = { browse: async (...args) => (await sender.context()?.browser.browse(...args)) ?? [] };
  const library = createLibrary(browser, createLibraryStore());
  const state: MusicState = { view: undefined, room: null };
  const go = (page: MusicPage): void => pager.goTo(page, true);
  const controls = createControls(sender, state, go);
  const now = createNowPanel(controls.now);
  const panel = createLibraryPanel(controls.play);
  const picker = createPicker(controls.chooseRoom);
  const layout = buildPages(now, picker, panel, () => go("speakers"));
  const pager = createPager(layout.pages, ["now"]);
  wireNowGestures(layout.nowElement, () => state.view, controls.now);
  element.append(pager.element, pager.tabs, speech.element, credit);
  const immersive = createImmersiveView(element);
  const history = createListeningHistory();
  const follower = createPageFollower();
  let firstDraw = true;

  const draw = (context: SceneContext, music: NonNullable<SceneContext["config"]["music"]>): void => {
    const view = buildMusicView(context.entities, music, context.now, context.haUrl);
    state.view = view;
    state.room = targetRoom(view, state.room, music);
    const page = follower.next(view.mode, Date.now());
    if (page) pager.goTo(page, !firstDraw);
    firstDraw = false;
    library.refresh(music.player, view.mode === "playing" || view.mode === "paused").catch(() => undefined);
    picker.update(view, state.room);
    layout.setRoom(state.room);
    panel.update(library.get(), music.favourites, context.haUrl);
    const line = musicLine(context, view, history);
    now.update(view);
    immersive.update(view);
    speech.say(sender.notice() ?? line.text, context.speak);
    credit.hidden = !line.fromDatabase || sender.notice() !== null;
  };

  return {
    id: "music",
    label: "Music",
    element,
    update(context: SceneContext): void {
      sender.bind(context);
      const music = context.config.music;
      if (music) draw(context, music);
      else speech.say("Music is not set up. Add a music section to hab.config.json.", context.speak);
    },
  };
}
