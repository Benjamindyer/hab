# HAB (Home Assistant Bot)

A screen and assistant front end for Home Assistant. It is made for a wall tablet: a calm, designed display for the clock, weather, music and (soon) timers, power and home controls, with a personality you can tune. The look is retro sci-fi: monochrome, with a four-bar "slab" that reacts to voice and music.

**Status: early development.** Home, Weather, Energy and Music screens work with live data. Timers, home controls and voice are designed but not built. Not yet tested by anyone but the author.

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
7. HAB now appears in the Home Assistant sidebar. Clicking it opens HAB as the whole page (see the note below). Use the browser's Back button to return to Home Assistant.

### Put it on the tablet

1. On the tablet open `http://YOUR-HOME-ASSISTANT-ADDRESS/hab_static/index.html` (for example `http://homeassistant.local:8123/hab_static/index.html`).
2. Sign in to Home Assistant once and allow the page. Use a normal (non-admin) Home Assistant user for a wall tablet.
3. On an iPad: tap **Share**, then **Add to Home Screen**, and open HAB from the new icon. It runs full screen. (untested)
4. Stop the tablet sleeping: **Settings, Display & Brightness, Auto-Lock, Never**. HAB also asks the browser to keep the screen on, but iPadOS may ignore that. (untested)

### What you get at first

With no settings saved, HAB works out what you have and fills in its own: the first weather entity, the first heating (climate) entity and the first Spotify player. You get the ambient screen and, if Spotify is set up in Home Assistant, the Music screen. It never turns on a language model by itself.

### The energy screen

Choose **Energy** in the menu. It shows solar, grid, house and car power, with dotted lines that move while power flows, plus the electricity rate now, what today has cost, solar made today and the car's charge. Choose the sensors in Setup, under Energy (or in a `power` section of `hab.config.json`, see `hab.config.example.json`). Every sensor is optional, and a missing one shows `--`. The house figure is grid plus solar, so surplus solar sent to the grid is not subtracted.

### The weather screen

Touch the outside temperature on the home screen, or choose **Weather** in the menu. It shows the temperature now, wind, humidity, pressure, UV and the next sunrise or sunset, a chart of the next day hour by hour (the temperature curve, rain bars, and the wind with an arrow showing where it blows), and the next five days. Touch a day to open it: wind, humidity, UV and rain for the day, and its hour-by-hour chart when that day is within the next two days. Swipe left or right for the other days, and touch to close. The forecast comes from your Home Assistant weather entity. It needs a weather integration that supports forecasts, such as the default Met.no.

### Controlling music by touch

On the Music screen's Now playing page, **tap** to pause or play, **swipe left** for the next track and **swipe right** for the previous one. The small buttons and the volume knob are there too. The Library and Speakers pages are reached with the tabs at the top. On the home screen, a small now playing widget appears under the date while music plays or is paused. Touch it to open the Music screen. While music is playing, HAB stays on the Music screen until you choose to leave it.

### Connect music and a language model

HAB never asks for a password or key. You connect services in Home Assistant, and HAB uses them.

- **Spotify:** add the Spotify integration in Home Assistant (it needs your own Spotify developer app; Home Assistant walks you through it). Start a song on any device once, so HAB can read and save your playlists.
- **Language model comments:** optional, and off until you turn them on. Add a model in Home Assistant (for example Anthropic, OpenAI, Google or Ollama), then choose its AI Task on the Setup page. What is sent, what it costs and how to set it up are explained in [docs/LANGUAGE-MODELS.md](docs/LANGUAGE-MODELS.md).

### Changing settings

Sign in to HAB as a Home Assistant **administrator** (the sidebar item, or the address above on your own phone or computer). A **Setup** button appears in the menu that shows when you touch the screen. It lets you:

- name the assistant and set its humour and honesty,
- choose the weather and heating entities and the room name,
- choose the Spotify player, the speaker to start on, and favourite playlists (paste a link from Spotify's Share menu),
- show facts about the playing track (release year, where the artist is from, genres) from MusicBrainz,
- choose a voice device,
- turn on language model comments by choosing an AI Task entity, and optionally let the model add what it knows about the music.

Press **Save**. The settings are stored in Home Assistant, so every tablet uses them. **Use automatic settings** goes back to HAB's own guess. The wall tablet signs in as a normal user and never sees Setup. (The Setup page is tested in pieces, not yet end to end on a real install.)

If you host the app yourself with a `hab.config.json` file (see [docs/INSTALL.md](docs/INSTALL.md)), that file overrides saved settings.

### Updating

HACS shows a new version when one is released. Download it and restart Home Assistant. An open tablet reloads itself within five minutes of a new build. (untested)

### Troubleshooting

- **A page saying "HAB could not start":** read the message. It names the problem.
- **"Invalid redirect URI" inside Home Assistant:** that was an earlier version, which framed HAB inside Home Assistant. Home Assistant's sign-in page cannot run inside a frame. Update HAB (version 0.1.1 or later) so the sidebar item opens HAB as the whole page.
- **Signed out again and again:** the browser may be blocking storage (a private window does this). Use a normal window.
- **"Lost connection" banner:** the tablet cannot reach Home Assistant. It reconnects by itself when it can.
- **No Music screen or no playlists:** Spotify must be set up in Home Assistant, and a device must be playing once so playlists can be read.
- **Blank page after an update:** reload the page.

### By hand

Copy `custom_components/hab` into your Home Assistant `config/custom_components` folder and restart. Or host the app yourself: see [docs/INSTALL.md](docs/INSTALL.md).

## Privacy

HAB never asks for a password or key. Sign-ins stay in Home Assistant. The optional language model comments are off by default (see [docs/LANGUAGE-MODELS.md](docs/LANGUAGE-MODELS.md)). When you turn them on, a short list of facts (for example the track name and the room temperature) goes to the model you picked in Home Assistant.

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
