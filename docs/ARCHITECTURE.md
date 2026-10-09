# Architecture

HAB has two parts: a web app (`app/`) and a Home Assistant integration (`custom_components/hab/`).

## The web app

TypeScript, strict mode, built with Vite. No UI framework. The code is split in three layers that depend only downwards:

```
ui/      draws things and reacts to taps. Scenes live here.
state/   the model and the rules. Plain logic, no browser and no Home Assistant types.
ha/      the only code that talks to Home Assistant (WebSocket, sign-in, services).
config/  reading and checking settings.
```

- `state/` knows nothing about Home Assistant or the browser, so it is easy to test. It talks to the outside through small interfaces: `EntityStore`, `ServiceRunner`, `MediaBrowser`, `TextGenerator`.
- `ha/` implements those interfaces. `bootstrap.ts` is the one place that joins them to the screens.
- Every scene has the same shape (`ui/scene.ts`): an element and an `update(context)` function. Adding a scene does not change existing ones.
- Taps become plain data (`ServiceCall`) that is planned in `state/` and sent by `ha/`. Planning is tested without a server.
- The language model is optional and never trusted. `state/commentary.ts` shows a fixed line first, asks the model when something changes, checks the reply (`state/guard.ts`) and falls back on any problem.

### Rules enforced by lint

Files under 250 lines, functions under 50, complexity 10, nesting 3, four parameters. These apply to all of `app/src`. See `app/eslint.config.js`.

### Where settings come from

1. `hab.config.json` next to the app, if present (development and standalone hosting).
2. Settings saved in Home Assistant by the integration (`hab/config/get`).
3. A guess made from the entities Home Assistant has (`config/autoConfig.ts`). It never enables a language model.

## The integration

Small and boring on purpose. It serves the built app at `/hab_static/`, adds a sidebar item that opens the app as the whole page (a framed app cannot sign in), and stores settings. Reading settings is open to any signed-in user so a wall tablet can start. Saving needs an administrator. It uses public Home Assistant interfaces only. Tests run inside a real test Home Assistant (`tests/`).

The built app is copied into `custom_components/hab/frontend/` by `npm run build:integration`, so HACS can install it without a build step.

## Privacy

Sign-ins and keys stay in Home Assistant. The app stores only its HA login token in the browser. When a language model is enabled, only a short list of facts goes to it. Nothing is sent anywhere else.
