# Language models in HAB

HAB can use a language model (an LLM, the kind of AI behind chatbots) to write the short lines of personality on its screens. This is optional and **off by default**. HAB works fully without one.

## What it does

Without a model, HAB shows fixed lines it builds from your data: "Good afternoon. Kitchen is 22 degrees. Outside it is 17 and rainy." With a model, the line is written fresh, in the character you set with the Humour and Honesty dials.

It does **not** control your house, answer questions or speak. It writes one short line for the screen. (Voice answers come from your Home Assistant voice setup, which is separate.)

## What is sent, and to whom

When something changes, HAB sends a short list of facts and some instructions. For example:

- the time of day, the room name and room temperature, the outside temperature and the weather,
- the track name, artist, album and speaker, when music is playing, and how many tracks in a row share an artist,
- your Humour and Honesty settings and the assistant's name.

It sends nothing else: no camera images, no recordings, no list of your devices, no passwords or keys.

The facts go to **whichever model you set up in Home Assistant**. A cloud model (Anthropic, OpenAI, Google and similar) means your provider receives those facts. A model on your own computer (for example Ollama) keeps everything at home. HAB sends nothing anywhere else.

## How HAB keeps it safe

- **A fixed line always shows first.** The model's line replaces it when it arrives. If the model is slow, offline or out of credit, you keep the fixed line and nothing breaks.
- **It only asks when something changes**, such as a new track, a new hour, or different weather, and never more than once every two minutes. After a failure it waits five minutes.
- **The model is told to use only the facts it is given** and not to invent anything.
- **A check on every reply.** If a reply contains a number that is not in the facts, HAB throws it away and keeps the fixed line. It checks numbers written as digits and as words ("twenty-three"). A rounded value is accepted: 17.2 may be written as 17 or "seventeen". Replies that are too long or span several lines are dropped too.
- **Honesty means blunt, not untrue.** At a high honesty setting the line says plainly what the facts show. The assistant is never meant to lie at any setting.

A model can still be odd or wrong in ways these checks do not catch. If a line looks wrong, the fixed line is one setting away (see "Turning it off").

## Music facts from MusicBrainz (optional, off by default)

Turn on **Music facts** in Setup and HAB looks up each track in [MusicBrainz](https://musicbrainz.org), a free open music database. It finds the year the track first came out, where the artist is from, when the group formed (or the person was born) and the genre. HAB shows these beside the cover, and the model may use them, so its line can be interesting **and** true.

- **What is sent:** only the track title and the artist name, to musicbrainz.org. Nothing else. Answers are kept in the browser, so each track is looked up once.
- **How a match is chosen:** a close match for the title and artist, and the earliest release date, because live versions and re-releases come later. If there is no close match, HAB shows nothing rather than guessing.
- **Limits:** a database is only as good as its entries, and two songs with the same title by the same artist can be confused. Lookups run one a second, so facts appear a few seconds after a track starts.

## Music knowledge (optional, off by default)

By default a music line can only use the facts HAB gives it: the track, artist, album, speaker, time of day and how many tracks in a row share an artist. That keeps it true, but it can be plain.

You can switch on **Music knowledge** in Setup (under Voice and language model). The model may then add one short thing it knows about the artist or song, for example a remark about when it came out. **A model can be wrong about music, and HAB cannot check it.** The prompt asks the model to say nothing unless it is sure, but that is a request, not a guarantee. Years and decades are allowed in this mode. Other made-up numbers are still thrown away. Home screen lines never use this switch.

## Cost

Each line is one short request, and HAB spaces them out. For a cloud model this should be small, but it depends on the provider and the model you choose, so check your provider's pricing. A local model has no per-request cost, but needs a computer able to run it. HAB has no spending cap. Most providers let you set a limit on your account, and it is worth doing.

## Setting it up

You connect the model in Home Assistant, then tell HAB which one to use. HAB never asks for your key.

1. In Home Assistant go to **Settings, Devices & services, Add integration**.
2. Search for your provider and add it. Several are supported by Home Assistant itself, including Anthropic, OpenAI, Google Generative AI and Ollama.
3. Enter the key or address when Home Assistant asks. Home Assistant stores it.
4. Make sure the integration provides an **AI Task**. On the integration's page, look for an **Add AI task** button (the Anthropic integration offers it next to **Add conversation agent**). The wording can differ between versions and providers. You are looking for an entity whose name starts with `ai_task.`, for example `ai_task.claude_ai_task`.
5. Open HAB as a Home Assistant administrator, touch the screen, and choose **Setup**.
6. Under **Voice and language model**, set **Language model for comments** to your AI Task. Press **Save**.

Within a couple of minutes of a change on screen (a new track, a new hour) you should see the line change from the fixed one to the model's.

(Tested with Anthropic's integration and Claude Haiku 4.5 on Home Assistant 2026.10. A reply came back in about two seconds. Other providers have not been tried.)

## Turning it off

Open **Setup** and set **Language model for comments** to **Not set**, then **Save**. HAB goes straight back to the fixed lines. Removing the integration in Home Assistant does the same.

## Troubleshooting

- **The list in Setup is empty:** Home Assistant has no AI Task yet. Add a model integration and an AI Task (steps 1 to 4).
- **The line never changes:** wait a couple of minutes after something changes. HAB asks at most every two minutes. If it still stays the same, the model may be failing: check the integration's page in Home Assistant for errors, and your provider account for credit and limits. HAB hides failures on purpose and keeps the fixed line.
- **The line is the fixed one even though a model is set:** the model's reply may have been thrown away by the number check. That is working as designed.
- **You want a different tone:** change the Humour and Honesty dials in Setup.

## For developers

The prompt, the reply check and the request spacing are in `app/src/state/` (`prompt.ts`, `guard.ts`, `commentary.ts`). The Home Assistant call is `app/src/ha/aiTask.ts`. They use only the AI Task service and depend on no particular provider.
