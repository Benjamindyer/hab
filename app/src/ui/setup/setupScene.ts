import { toDraft } from "../../config/draft";
import type { SettingsService } from "../../config/settings";
import { el, setText } from "../dom";
import type { Scene, SceneContext } from "../scene";
import { createActions, type SetupState } from "./setupActions";
import { buildForm } from "./setupForm";

import "../styles/setup.css";

const SOURCE_NOTE: Record<SettingsService["source"], string> = {
  file: "A settings file (hab.config.json) is in use, so saved settings are ignored. Remove that file to use this page.",
  stored: "Using the settings saved in Home Assistant.",
  auto: "Using automatic settings, guessed from your Home Assistant. Save to keep your own.",
};

/** Owner-only settings. Saved in Home Assistant, so every screen picks them up. */
export function createSetupScene(): Scene {
  const element = el("section", "scene");
  element.id = "s-setup";
  const body = el("div", "setup-body");
  const status = el("div", "setup-status");
  const save = el("button", "btn", "Save");
  const reset = el("button", "btn", "Use automatic settings");
  const bar = el("div", "setup-bar");
  bar.append(status, reset, save);
  element.append(body, bar);
  const state: SetupState = { draft: undefined, settings: undefined };
  let confirmReset = false;

  const say = (text: string, bad = false): void => {
    setText(status, text);
    status.classList.toggle("bad", bad);
  };
  const actions = createActions(state, say);
  save.addEventListener("click", actions.save);
  reset.addEventListener("click", () => {
    if (confirmReset) return actions.clear();
    confirmReset = true;
    reset.textContent = "Tap again to confirm";
  });

  return {
    id: "setup",
    label: "Setup",
    element,
    update(context: SceneContext): void {
      if (!context.settings) return;
      state.settings = context.settings;
      if (!state.draft) {
        state.draft = toDraft(context.config);
        body.append(el("div", "setup-title", "Setup"), el("div", "setup-source", ""), ...buildForm(state.draft, context.entities));
      }
      setText(body.querySelector<HTMLElement>(".setup-source") ?? status, SOURCE_NOTE[context.settings.source]);
    },
  };
}
