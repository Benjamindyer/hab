# HAB spec (draft 0.2)

HAB = Home Assistant Bot. This is the plan for what HAB is. Evidence behind it is in RESEARCH.md. Claims are tagged [Certain], [Likely] or [Guessing]. Nothing marked [Guessing] should be built on without a test.

## 1. What HAB is

An open-source screen for the home. It runs as a web app served by Home Assistant (HA) on any tablet. It is designed, not assembled from widgets: HAB owns the whole screen, and the screen changes with what is happening. It makes timers, music, weather, power and home control effortless, and it speaks through the HA Assist pipeline (for example with the HA Voice Preview Edition) using whichever language model the owner chooses.

## 2. Principles

1. Visuals first. Every state is designed. No grid of cards.
2. Glanceable from across the room. Big type, strong contrast.
3. One tap or one sentence for anything common, timers above all. The test: if someone can do it with a commercial smart speaker, they can do it with HAB.
4. Quiet by default. Show what matters now. Notifications first, controls second.
5. Work with what HA already does. Use public interfaces. Do not break on HA upgrades.
6. Fail visibly and kindly. Always say when something is disconnected, and why.
7. Open source, easy to fork, easy to theme.
8. It has a personality. Voice, screen wording, sounds and animation share one character, tuned by the owner with dials.
9. Local first. A cloud language model is the owner's choice, never a requirement.

## 3. Users

- Family members who never touch HA. They are the main users.
- The HA owner, who installs and configures HAB.
- Forkers and theme makers.
- Later: people with no voice device.

## 4. Architecture

- **Web app.** Runs full screen in a tablet browser. Talks to HA over the WebSocket API. [Certain, built]
- **HA integration** (`custom_components/hab`, installed with HACS). Serves the web app, adds a sidebar item, stores settings in HA. Later: pairing screens to voice devices, timers, conversation text. [Certain, first part built]
- **Voice device.** Wake word, microphone and speaker belong to the voice device, for example the HA Voice Preview Edition. The tablet is a display only. [Certain, design decision]
- **Language model.** Chosen in HA. HAB uses HA's AI Task service for screen comments and HA's conversation agent for the assistant. [Likely]
- **Distribution.** HACS first. See ARCHITECTURE.md for the layers inside the app.

## 5. Screen model

HAB is a set of full-screen scenes. One state machine chooses between them.

1. **Ambient.** Idle. Time, date, weather, room temperature and one line of personality. [Built]
2. **Music.** Three swipeable pages: now playing, your library (playlists), and where to play. [Built, Spotify through HA]
3. **Voice.** Listening, thinking, speaking, error. A large visual that follows the voice state. [Designed]
4. **Timers.** One or many. Big countdown, rings until dismissed. [Designed]
5. **Home.** Room by room control with scenes, light and heating. No entity lists. [Designed]
6. **Power.** Solar, grid, battery, car and house as a flow diagram, with tariff and cost. [Designed]
7. **Alerts.** Doorbell, parcel, washing done, security. Appear over any scene, then go away. [Designed]
8. **Cooking.** Recipe steps and several timers. [Idea]
9. **Setup.** Pairing, theme, language model, rooms. Admin only. [Designed]

Rules: a ringing timer wins, then voice, then an alert, then the scene the user picked. After two minutes without a touch the screen returns to Ambient. [Built, tested]

## 6. Features

### 6.1 Day one
- Voice state visuals from the voice device's `assist_satellite` entity.
- Timers: start by tap or voice, several at once, pause, cancel, add a minute, ring until dismissed.
- Clock, date, weather, next calendar event.
- Music from any HA `media_player`, including Spotify and Music Assistant: art, transport, volume, library, rooms.
- Shopping list (HA `todo` entity).
- Home control: lights, heating, scenes, by room.
- Alerts the owner chooses.
- Personality dials (humour, honesty), applied to screen wording and to language model comments.
- A visible state when the link to HA is lost.
- Dimming on a schedule.

### 6.2 Soon
- Recipes and cooking mode. Questions answered by the language model as rich cards.
- Routines: good morning, goodnight, leaving home.
- Cameras (doorbell pop-up). Intercom and announcements between screens.
- Energy history and cheapest-time prompts.
- Family profiles, chores, reminders. Presence wake.
- Tablet microphone mode, for people with no voice device.

### 6.3 Later or never
Ordering products, video apps, phone calls, third-party skills.

## 6.4 Connections to Home Assistant

HAB reads and controls HA through the WebSocket API and suggests defaults by entity type.

| HA thing | What HAB does with it | Scene |
|---|---|---|
| `assist_satellite` | Voice state | Voice |
| `timer`, voice timers | Countdowns, ringing | Timers |
| `media_player` | Now playing, volume, library, rooms | Music |
| `weather` | Outside readout, mood | Ambient |
| `calendar` | Next event | Ambient |
| `todo` | Shopping list | Home |
| `light`, `switch`, `scene`, `climate`, `cover`, `lock`, `fan` | Room control | Home |
| `sensor` with device class power, energy, battery, monetary | Power view | Power |
| `binary_sensor`, `person` | Alerts, presence | Alerts |
| `camera` | Doorbell pop-up | Alerts |
| `ai_task`, `conversation` | Screen comments, assistant | Setup |

[Likely] Checked against a real HA only for weather, climate, light, media_player, todo, timer and ai_task.

### Power
Goal: see where power comes from and goes, what it costs, and whether now is a good time to use it. Sources are found by device class, not integration name, so any setup works: solar generation, house load, grid import and export, home battery, electric vehicle, tariff (rate, off-peak flag, cost today) and a solar forecast.

### Music: rooms and library
- Rooms are the player's own device list. For Spotify through HA these are the Spotify Connect devices. [Certain]
- The library (playlists) is read through HA's media browsing. Spotify only allows that while a device is active, so HAB keeps a saved copy to show when idle. [Certain]
- HAB never asks for a Spotify login. The owner connects Spotify once in HA. See 6.7.

## 6.5 Setup in Home Assistant

HAB reads the owner's HA first and guesses. The owner confirms, not builds.

1. Install with HACS, then add the integration (one click, nothing to enter).
2. Open HAB from the sidebar, or the wall address on the tablet, and sign in to HA once.
3. With no saved settings HAB fills in its own: the first weather, heating and Spotify entities it finds. It never turns on a language model by itself. [Certain, built]
4. A setup page (admin only) lets the owner choose the assistant's name and dials, weather, heating, Spotify player, favourites, voice device and language model. [Certain, first version built] Rooms, scenes, house buttons, power sensors and alerts come with their screens.
5. Settings are stored in HA, so a replacement tablet picks up the same setup. [Certain, storage built]
6. The wall tablet signs in as a normal (non-admin) HA user.

## 6.6 Personality powered by a language model

Goal: the assistant's comments come from the owner's chosen model, not fixed templates.

- HAB uses HA's AI Task service, which writes text and does not control the house. [Certain, built]
- HAB sends facts, never screens: for example the track name, temperatures, time of day and the dial settings. The prompt forbids inventing anything. [Certain, built]
- A check on the way back drops any reply containing a number that is not in the facts. [Certain, built, tested]
- Fixed lines stay as the instant fallback. The model's line replaces them when it arrives. If the model is slow, off or wrong, nothing breaks. [Certain, built]
- It asks only when something changes, spaced at least two minutes apart, and waits five minutes after a failure. [Certain, built]
- Off by default. The owner picks the AI Task entity. A cloud model is labelled as cloud.
- Honesty means bluntness, not truthfulness. The assistant never lies.
- Not yet tested with a real model. [Certain]

## 6.7 Connections: adding language models, Spotify and other services

HA owns every login and key. HAB never asks for a password, token or API key.

- Passwords and keys never touch a tablet that anyone in the house can pick up.
- HA already knows how to connect each service. HAB stays small.
- Spotify's own rules make a shared HAB login impractical: redirect addresses must be HTTPS, and a shared development app is limited to a handful of users. See RESEARCH.md. [Likely]

How it will work (planned):
1. An owner-only Connections page, opened on a phone or computer.
2. One card per service showing Connected, Not set up or Needs attention.
3. "Not set up" opens HA's own add-integration screen for that service. [Likely] A link of the form `/config/integrations/dashboard/add?domain=...` is the intended route. Not yet tested.
4. Each card says what you need, what it costs and where data goes.
5. Once connected, HAB lists what it found and the owner chooses, for example which AI Task entity writes comments and which one answers questions.

Not planned for the first version: rebuilding HA's connection forms inside HAB.

## 7. Voice behaviour

- Wake word and listening belong to the voice device.
- The screen reacts to state changes quickly. A target of about 200 ms, to be measured. [Guessing]
- The screen shows what was heard and the reply when HAB can get them. Needs the integration to capture the conversation. Not designed yet.
- Timers by voice: "set a timer for 10 minutes", "how long is left", "cancel the timer". The route that makes this work is undecided. See 9.
- Short commands such as "stop" must work.

## 8. Quality bars

- Smooth animation on the target tablet. Not yet measured. [Guessing]
- Readable from 3 m. Accessible: contrast, reduced motion, large touch targets.
- Setup in under 10 minutes for someone who has HA and a voice device.
- Public HA interfaces only in the web app. Anything private is isolated in one module of the integration and covered by tests.
- A tested state machine. Reconnect, resubscribe and a visible lost-connection state from the start.
- CI that runs the tests. [Certain, built]
- SOLID, enforced by lint: files under 250 lines and functions under 50, with limits on complexity, nesting and parameters. [Certain, built]

## 9. Open decisions and risks

1. **Timers with a voice device.** Voice timers live on the device and are not visible to other clients. [Likely] Options: HA timer helpers with custom sentences, custom device firmware, a request to HA, or a HAB-owned timer handler. Test on real hardware first.
2. **Conversation text on screen.** A second client probably does not receive pipeline events. Needs a spike.
3. **Keeping a tablet awake.** The Wake Lock API is requested. iPadOS may ignore it. [Guessing]
4. **Visual direction.** Retro sci-fi, monochrome, with one warm alert colour. The four-bar "slab" is the character. Take the mood, not a studio's trademarks. [Certain, chosen]
5. **Persona name.** A setting, so owners can rename it.
6. **Licence.** Apache-2.0.
7. **Multi-screen homes.** The pairing model for several screens and several voice devices.
8. **Privacy.** A cloud model choice must be clear on screen and in setup.
9. **Name.** Not checked against existing projects. [Guessing]

## 10. Out of scope for v0.1

Native iOS and Android apps. Wake word on the tablet. Hosting language models. Video calls.
