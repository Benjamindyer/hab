"""Serves the web app and adds HAB to Home Assistant's sidebar."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, FRONTEND_DIR, PANEL_ICON, PANEL_PATH, PANEL_TITLE, STATIC_URL


async def async_serve_frontend(hass: HomeAssistant) -> None:
    """Serve the built web app. Home Assistant allows a path to be added only once per run."""
    state = hass.data[DOMAIN]
    if state.get("static_registered"):
        return
    folder = Path(__file__).parent / FRONTEND_DIR
    await hass.http.async_register_static_paths([StaticPathConfig(STATIC_URL, str(folder), False)])
    state["static_registered"] = True


def add_sidebar_item(hass: HomeAssistant) -> None:
    """Show HAB in the sidebar, inside Home Assistant's own page."""
    frontend.async_register_built_in_panel(
        hass,
        component_name="iframe",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_PATH,
        config={"url": f"{STATIC_URL}/index.html"},
        require_admin=False,
    )


def remove_sidebar_item(hass: HomeAssistant) -> None:
    """Take HAB out of the sidebar."""
    frontend.async_remove_panel(hass, PANEL_PATH)
