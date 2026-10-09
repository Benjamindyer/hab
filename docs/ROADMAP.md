# HAB roadmap

Status on 2026-10-09. Tags: [Certain] [Likely] [Guessing].

## Done

- Web app with live data: Ambient and Music (playing, library, speakers) scenes, sign-in, reconnect banner, optional language model comments with a safe fallback. 125 app tests. [Certain]
- Production build that runs from a sub-folder, Home Screen app files, self-update check. [Certain]
- Home Assistant integration: one-click setup, serves the app, sidebar item, stored settings. 13 tests in a test Home Assistant. [Certain]
- CI: app checks, integration tests, hassfest. [Certain]

## Next

### M3. Useful in a kitchen every day
1. Timers on a HA `timer` entity: one tap to start, big countdown, rings until dismissed.
2. Home controls for a room: light, scenes, heating.
3. Spotify tabs: albums, recently played, liked songs, artists.
4. Power scene on real entities. Built (Energy screen, sensors set in the config file). Setup page entry still to come.
5. Dimming and night mode.
6. Voice scene, once a voice device is available to test.
7. Personality with a real language model.

Pass: a week of daily use at home, a list of faults, and a non-technical family member can start a timer and play music unaided.

### M4. Easy for others to install
- HACS install tested on a clean HA.
- Setup page: first version built (name, dials, weather, heating, Spotify, favourites, voice device, language model). Still to come: the Connections page (SPEC 6.7) and settings for scenes, rooms and power.
- Screens stored in HA, so a replacement tablet needs no setup.
- Documentation with screenshots.

### M5. Public beta
- Accessibility pass. Performance budget on an iPad and an Android tablet. Security review. Translations file.

## Risks

- Safari may sleep a wall tablet or end the page. Fallbacks exist (Guided Access, Auto-Lock off) and are untried. [Guessing]
- Voice timers may be invisible to HAB. The fallback is HA timer helpers with custom sentences. [Likely]
- Spotify browsing needs an active device. HAB keeps a saved copy. [Certain]
- Home Assistant changes. HAB uses public interfaces only. Not proven over time. [Guessing]
- Scope. Order matters more than completeness: timers and music first.
