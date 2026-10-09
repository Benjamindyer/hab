"""Constants for the HAB integration."""

DOMAIN = "hab"

# Where the web app is served from. The app lives at /hab_static/index.html.
STATIC_URL = "/hab_static"
FRONTEND_DIR = "frontend"

# The sidebar item, shown as /hab inside Home Assistant.
PANEL_PATH = "hab"
PANEL_TITLE = "HAB"
PANEL_ICON = "mdi:robot-happy-outline"

STORAGE_KEY = "hab.config"
STORAGE_VERSION = 1

# Keeps a mistake or a misuse from filling storage. Real settings are a few kilobytes.
MAX_CONFIG_BYTES = 64 * 1024
