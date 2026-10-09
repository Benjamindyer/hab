import { chooseRoom, playFavourite, playPause, setVolume, skip } from "../state/musicActions";
import type { MusicView } from "../state/music";
import type { ServiceCall } from "../state/services";
import type { NowHandlers } from "./musicNow";
import type { Sender } from "./musicSender";
import type { MusicPage } from "../state/musicPage";

/** What the music screen knows right now. Shared so the controls always act on the latest values. */
export interface MusicState {
  view: MusicView | undefined;
  room: string | null;
}

export interface MusicControls {
  now: NowHandlers;
  chooseRoom(room: string): void;
  play(uri: string, name: string): void;
}

/** Turns taps on the music screen into service calls for the Spotify player. */
export function createControls(sender: Sender, state: MusicState, go: (page: MusicPage) => void): MusicControls {
  const withPlayer = (build: (id: string, view: MusicView) => ServiceCall[]): void => {
    const id = sender.context()?.config.music?.player;
    if (id && state.view) sender.send(build(id, state.view));
  };
  return {
    now: {
      onPlayPause: () => withPlayer((id, view) => playPause(id, view)),
      onSkip: (direction) => withPlayer((id) => skip(id, direction)),
      onVolume: (level) => withPlayer((id) => setVolume(id, level)),
    },
    chooseRoom(room) {
      state.room = room;
      const playing = state.view?.mode === "playing" || state.view?.mode === "paused";
      if (playing) withPlayer((id) => chooseRoom(id, room));
      go(playing ? "now" : "library");
    },
    play(uri, name) {
      go("now");
      withPlayer((id, view) => playFavourite(id, view, { name, uri }, state.room));
    },
  };
}
