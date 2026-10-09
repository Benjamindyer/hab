# HAB research notes

What was learned before building. Tags: [Certain] read or tested first-hand, [Likely] from reliable but indirect sources, [Guessing] needs a test. Dates are 2026-10-09 unless stated. This is a record of findings, not a verdict on anyone's work.

## Similar projects

HAB is written from Home Assistant's public interfaces and its own design. It does not copy code from the projects below. Their READMEs and issue lists were read to learn what users need.

- **Voice Satellite** (HACS integration, AGPL-3.0). Turns a browser into an Assist satellite with browser-side wake word, timers, skins and a screensaver. [Certain, from its README]
- **Kiosk Satellite** (Android app). A kiosk browser that is also an Assist satellite, with on-device wake word, timers and photo screensavers. Android only. Its licence (CC BY-NC-ND 4.0) is not an open-source licence. [Certain, from its README]
- **View Assist** (HA configuration). Assist visuals built from dashboards, sentences and scripts for Android devices. [Certain, from its README]

Where HAB differs: an iPad-friendly web app, a display that follows a separate voice device, one designed screen instead of an overlay on a dashboard, and an open licence. [Likely]

## Lessons from their issue lists [Certain for the themes, counts omitted]

- Microphone capture on tablets is the most common problem: weak or silent input, different behaviour per device, iPadOS audio quirks. A display-only HAB avoids it by leaving the microphone to the voice device.
- Browser wake word costs CPU and needs the screen on. Another reason to use a dedicated voice device.
- Audio routing: announcements on the wrong device, repeated or dropped playback.
- Short commands ("stop") are easily missed by voice activity detection.
- Timer details matter: no upper limit, cancelling an expired timer, paused timers, an always-visible timer.
- Reconnect handling needs care. The HA WebSocket library can reuse command ids after a reconnect, so subscriptions must be checked and renewed.
- Relying on private HA internals risks breaking on every release.

## Home Assistant facts

- Browsers allow the microphone only on HTTPS. [Certain]
- A voice device without a screen can still be shown on a display: the `assist_satellite` entity has four states, `idle`, `listening`, `processing` and `responding`, with matching automation triggers. [Certain, from the developer docs]
- Pipeline events (transcript, reply text) go back over the WebSocket that started the run, so a second display client probably does not receive them. [Likely]
- Voice timers live on the voice device. HA exposes no public way for another client to list them. [Likely, from a developer's write-up and a community thread]
- `ai_task.generate_data` takes `task_name` and `instructions` (required), plus optional `entity_id`, `structure` and `attachments`, and returns data. [Certain, read from a running HA]
- `auth/current_user` reports whether the signed-in user is an admin. [Certain]
- A page served from another address can sign in to HA with HA's normal login. The library does not save the login unless the app stores it. [Certain]
- The HA integration pieces HAB uses exist and work: static path registration, the built-in iframe panel, WebSocket commands with admin-only checks, and storage. [Certain, tested in a test HA]

## Spotify through Home Assistant [Certain unless marked]

- While a device is active, `media_player/browse_media` returns the library: Playlists, Artists, Albums, Liked songs, Podcasts, Recently played, Top Artists, Top Tracks. Playlists come with titles, playable URIs and cover images.
- While nothing is playing the same call is refused ("Player does not support browsing media"), and the player offers only device selection. HAB saves the library to show when idle.
- The player's source list is the owner's Spotify Connect devices, including smart speakers, TVs and computers. These are the rooms.
- A Spotify login of HAB's own is impractical: redirect addresses must be HTTPS (or `127.0.0.1`), and a shared development app is reported to be limited to about five users with a Premium owner. [Likely, partly third-party reports for 2026]
- Spotify Canvas (looping video) is not in the Web API. [Likely] Audio analysis (beats, tempo) is closed to new apps since November 2024. [Certain, Spotify's blog] So HAB cannot sync visuals to the beat. Colours taken from cover art, and a calm non-synced animation, are possible.

## What people use smart displays and speakers for [Likely, mostly 2017 to 2020 US surveys, none for screen devices]

- Voice assistants: music, weather, general questions, alarms and timers, news, shopping lists. Smart home control varies from about 6% to about 31% in different surveys. Ordering products is rare.
- Screen devices (from reviews and listings, not usage data): photo frame and ambient mode, morning routines, recipes and timers, touch controls, bedtime sounds.
- Home Assistant wall tablets (community posts): show only what matters now, a family hub with calendar and chores, big room scenes instead of entity lists, a separate admin view. Some households will not use a wall tablet at all.
- Gaps people report when replacing a commercial speaker: microphone range and quality. Music has largely been solved by Music Assistant.
