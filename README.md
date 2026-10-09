# HAB (Home Assistant Bot)

A screen and assistant front end for Home Assistant. It is made for a wall tablet: a calm, designed display for the clock, weather, music and (soon) timers, power and home controls, with a personality you can tune. The look is retro sci-fi: monochrome, with a four-bar "slab" that reacts to voice and music.

**Status: early development.** Ambient and Music screens work with live data. Timers, home controls, power and voice are designed but not built. Not yet tested by anyone but the author.

## Install

HAB has two parts that install together: a Home Assistant integration (served by Home Assistant, so there is nothing else to run) and the web app it serves.

**Not yet tested on a real Home Assistant install by anyone but the author's test setup.** Steps marked (untested) have not been tried end to end. Please report what you find.

### What you need

- Home Assistant with [HACS](https://hacs.xyz) installed. The integration is tested against Home Assistant 2026.2 in an automated test, and the author runs 2026.10. Older versions are untested.
- A tablet with a current browser. An iPad with Safari is the main target. (untested on iPad)
- Optional: the Spotify integration for music, a weather integration and a heating (climate) entity for the ambient screen, an AI Task integration for language model comments.

### Install with HACS

1. In Home Assistant open **HACS**.
2. Open the menu (three dots, top right) and choose **Custom repositories**.
3. Paste `https://github.com/Benjamindyer/hab`, set the type to **Integration**, and press **Add**.
4. Search for **HAB** in HACS, open it and press **Download**.
5. **Restart Home Assistant** (Settings, System, Restart).
6. Go to **Settings, Devices & services, Add integration**, search for **HAB** and add it. There is nothing to fill in.
7. HAB now appears in the Home Assistant sidebar. (untested in the sidebar frame)

### Put it on the tablet

1. On the tablet open `http://YOUR-HOME-ASSISTANT-ADDRESS/hab_static/index.html` (for example `http://homeassistant.local:8123/hab_static/index.html`).
2. Sign in to Home Assistant once and allow the page. Use a normal (non-admin) Home Assistant user for a wall tablet.
3. On an iPad: tap **Share**, then **Add to Home Screen**, and open HAB from the new icon. It runs full screen. (untested)
4. Stop the tablet sleeping: **Settings, Display & Brightness, Auto-Lock, Never**. HAB also asks the browser to keep the screen on, but iPadOS may ignore that. (untested)

### What you get at first

With no settings saved, HAB works out what you have and fills in its own: the first weather entity, the first heating (climate) entity and the first Spotify player. You get the ambient screen and, if Spotify is set up in Home Assistant, the Music screen. It never turns on a language model by itself.

### Connect music and a language model

HAB never asks for a password or key. You connect services in Home Assistant, and HAB uses them.

- **Spotify:** add the Spotify integration in Home Assistant (it needs your own Spotify developer app; Home Assistant walks you through it). Start a song on any device once, so HAB can read and save your playlists.
- **Language model comments:** add an AI Task capable integration in Home Assistant (for example OpenAI, Anthropic, Google or Ollama). Then name its `ai_task` entity in the settings file (see below). Off until you do.

### Changing settings

A settings page inside HAB is planned but does not exist yet. Until then, to choose entities, add favourite playlists, name the assistant or turn on a language model, use the file method in [docs/INSTALL.md](docs/INSTALL.md), which hosts the app from `/config/www` with a `hab.config.json`.

### Updating

HACS shows a new version when one is released. Download it and restart Home Assistant. An open tablet reloads itself within five minutes of a new build. (untested)

### Troubleshooting

- **A page saying "HAB could not start":** read the message. It names the problem.
- **Signed out again and again:** the browser may be blocking storage (a private window does this). Use a normal window.
- **"Lost connection" banner:** the tablet cannot reach Home Assistant. It reconnects by itself when it can.
- **No Music screen or no playlists:** Spotify must be set up in Home Assistant, and a device must be playing once so playlists can be read.
- **Blank page after an update:** reload the page.

### By hand

Copy `custom_components/hab` into your Home Assistant `config/custom_components` folder and restart. Or host the app yourself: see [docs/INSTALL.md](docs/INSTALL.md).

## Privacy

HAB never asks for a password or key. Sign-ins stay in Home Assistant. The optional LLM comments are off by default. When you turn them on, a short list of facts (for example the track name and the room temperature) goes to the model you picked in Home Assistant.

## Develop

```bash
cd app
npm install
npm run dev        # the app, against your Home Assistant
npm run check      # types, lint, tests
npm run build:integration   # puts the built app into custom_components/hab/frontend
```

For development against a Home Assistant at another address, put `{ "haUrl": "http://homeassistant.local:8123", ... }` in `app/public/hab.config.json` (see `hab.config.example.json`). That file is not committed.

Integration tests: `pip install -r requirements-test.txt && pytest tests`.

See docs/SPEC.md for what HAB is meant to be, docs/ROADMAP.md for the plan, docs/ARCHITECTURE.md for how the code is organised, docs/RESEARCH.md for the evidence behind the decisions, and CONTRIBUTING.md if you want to help.

## Licence

Apache-2.0. See LICENSE.
