# Hosting HAB yourself, with your own settings file

The normal way to install HAB is the HACS integration (see the README). This page is for two cases: you want to choose your own settings today (the settings page inside HAB is not built yet), or you do not want the integration.
Steps marked "not tested" have not been tried on a real Home Assistant yet.

## 1. Build

On the computer with the code:

```bash
cd app
npm install
npm run build
```

This makes the folder `app/dist`. It is small (about 90 KB).

## 2. Settings

Inside `app/dist` there is `hab.config.example.json`. Copy it to `hab.config.json` and edit it.

- `ambient`, `music`, `llm`: the entity ids from your Home Assistant. The entity inspector shows them: open the app with `?debug` on the end of the address.
- Leave out `haUrl` when HAB is served by Home Assistant itself. Only set it when HAB is hosted somewhere else.
- `hab.config.json` holds entity ids and nothing secret. Passwords and keys stay in Home Assistant.

## 3. Copy to Home Assistant

Copy the whole contents of `app/dist` into a folder called `hab` inside Home Assistant's `www` folder:

```
/config/www/hab/index.html
/config/www/hab/hab.config.json
/config/www/hab/assets/...
```

Ways to reach `/config`: the Samba share add-on, the File editor add-on, or Studio Code Server. If the `www` folder did not exist before, restart Home Assistant once so it starts serving it. (not tested)

HAB is then at `http://YOUR-HA-ADDRESS/local/hab/` (not tested on a real Home Assistant).

## 4. Open it on the tablet

1. Open that address in Safari on the iPad.
2. Sign in to Home Assistant once and allow the page.
3. Share button, then Add to Home Screen. HAB then opens full screen. (not tested)
4. Settings, Display and Brightness, Auto-Lock: Never, so the screen stays on. HAB also asks the browser to keep the screen awake, but iPadOS may ignore that. (not tested)

Use a normal (non-admin) Home Assistant user for the wall tablet.

## Updating

Build again and copy the new files over the old ones. A screen that is already open checks for a new build every 5 minutes and reloads itself.
