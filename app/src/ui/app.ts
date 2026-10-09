import type { HabConfig } from "../config/config";
import type { SettingsService } from "../config/settings";
import type { Commentary } from "../state/commentary";
import type { EntityStore } from "../state/entities";
import type { MediaBrowser } from "../state/library";
import type { MusicInfoLookup } from "../state/musicInfo";
import { deriveInputs, musicSeed } from "../state/inputs";
import { activeRequest } from "../state/navigation";
import { chooseScene, type SceneId } from "../state/scene";
import type { ServiceRunner } from "../state/services";
import { createAmbientScene } from "./ambientScene";
import { createMusicScene } from "./musicScene";
import { createNav } from "./nav";
import { createSetupScene } from "./setup/setupScene";
import type { Scene } from "./scene";
import { createSlab } from "./slab";

import "./styles/base.css";
import "./styles/slab.css";
import "./styles/ambient.css";
import "./styles/nav.css";

const IDLE_RETURN_MS = 120_000;

export interface AppDeps {
  entities: EntityStore;
  config: HabConfig;
  haUrl: string;
  run: ServiceRunner;
  browser: MediaBrowser;
  commentary: Commentary;
  settings: SettingsService | null;
  musicInfo: MusicInfoLookup | null;
}

/** Builds the stage, then redraws it whenever Home Assistant changes or each second. */
export function mountApp(root: HTMLElement, deps: AppDeps): void {
  const { entities, config, haUrl, run, browser, commentary, settings, musicInfo } = deps;
  const fallback = createAmbientScene();
  const scenes: Scene[] = [fallback, createMusicScene(), ...(settings ? [createSetupScene()] : [])];
  const slab = createSlab();
  let requested: SceneId | null = null;
  let lastTouch = Date.now();

  const pick = (id: SceneId): void => {
    requested = id === "ambient" ? null : id;
    lastTouch = Date.now();
    refresh();
  };

  const labelled = scenes.flatMap((s) => (s.label ? [{ id: s.id, label: s.label }] : []));
  const nav = createNav([{ id: "ambient", label: "Home" }, ...labelled], pick);

  const stage = document.createElement("div");
  stage.id = "stage";
  stage.append(slab.element, ...scenes.map((scene) => scene.element), nav.element);
  const touched = (): void => {
    lastTouch = Date.now();
    nav.wake();
  };
  stage.addEventListener("pointerdown", touched);
  stage.addEventListener("keydown", touched);
  stage.addEventListener("input", touched);
  root.replaceChildren(stage);

  function refresh(): void {
    // Music that is playing keeps the music screen up until the user chooses to leave it.
    const hold = requested === "music" && musicSeed(entities, config.music?.player) !== null;
    const picked = activeRequest({ requested, lastTouch, now: Date.now(), timeoutMs: IDLE_RETURN_MS, hold });
    const inputs = deriveInputs(entities, config.satellite, picked);
    const active = scenes.find((scene) => scene.id === chooseScene(inputs)) ?? fallback;
    scenes.forEach((scene) => scene.element.classList.toggle("active", scene === active));
    document.body.dataset["scene"] = active.id;
    document.body.dataset["voice"] = inputs.voice;
    nav.setActive(active.id);
    slab.setVoice(inputs.voice);
    slab.setMusic(musicSeed(entities, config.music?.player));
    active.update({ entities, config, now: new Date(), haUrl, run, browser, commentary, settings, musicInfo, navigate: pick });
  }

  entities.subscribe(refresh);
  setInterval(refresh, 1000);
  refresh();
}
