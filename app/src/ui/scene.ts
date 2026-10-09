import type { HabConfig } from "../config/config";
import type { SettingsService } from "../config/settings";
import type { Commentary } from "../state/commentary";
import type { EntityStore } from "../state/entities";
import type { MediaBrowser } from "../state/library";
import type { ForecastCache } from "../state/forecastCache";
import type { MusicInfoLookup } from "../state/musicInfo";
import type { SceneId } from "../state/scene";
import type { ServiceRunner } from "../state/services";

/** What a scene is given each time it redraws. */
export interface SceneContext {
  entities: EntityStore;
  config: HabConfig;
  now: Date;
  haUrl: string;
  run: ServiceRunner;
  browser: MediaBrowser;
  commentary: Commentary;
  /** Present only for an administrator. */
  settings: SettingsService | null;
  /** Present only when the owner turned on music facts. */
  musicInfo: MusicInfoLookup | null;
  forecast: ForecastCache;
  /** Moves the screen to another scene, as if the user had chosen it. */
  navigate(scene: SceneId): void;
}

/** Every scene is a self-contained module with this shape. */
export interface Scene {
  id: SceneId;
  /** Label for the scene switcher. Scenes without one are not listed. */
  label?: string;
  element: HTMLElement;
  update(context: SceneContext): void;
}
