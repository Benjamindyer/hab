# HAB (Home Assistant Bot)

A screen and assistant front end for Home Assistant. It is made for a wall tablet: a calm, designed display for the clock, weather, music and (soon) timers, power and home controls, with a personality you can tune. The look is retro sci-fi: monochrome, with a four-bar "slab" that reacts to voice and music.

**Status: early development.** Ambient and Music screens work with live data. Timers, home controls, power and voice are designed but not built. Not yet tested by anyone but the author.

## Install

### With HACS

1. HACS, three dots, Custom repositories. Add this repository, category Integration.
2. Download HAB, then restart Home Assistant.
3. Settings, Devices and services, Add integration, HAB.
4. Open HAB from the sidebar, or open `http://YOUR-HOME-ASSISTANT/hab_static/index.html` on the tablet and sign in once.
5. On an iPad: Share, Add to Home Screen, for a full screen app.

HAB works out what you have (weather, heating, Spotify) and fills in its own settings. To choose them yourself, see docs/INSTALL.md.

### By hand

Copy `custom_components/hab` into your Home Assistant `config/custom_components` folder and restart. Or follow INSTALL.md to host the app in `/config/www`.

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
