"""Serves the web app and adds HAB to Home Assistant's sidebar."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, FRONTEND_DIR, PANEL_ELEMENT, PANEL_ICON, PANEL_PATH, PANEL_TITLE, STATIC_URL


async def async_serve_frontend(hass: HomeAssistant) -> None:
    """Serve the built web app. Home Assistant allows a path to be added only once per run."""
    state = hass.data[DOMAIN]
    if state.get("static_registered"):
        return
    folder = Path(__file__).parent / FRONTEND_DIR
    await hass.http.async_register_static_paths([StaticPathConfig(STATIC_URL, str(folder), False)])
    state["static_registered"] = True


async def async_add_sidebar_item(hass: HomeAssistant) -> None:
    """Show HAB in the sidebar. Clicking it opens HAB as the whole page.

    Home Assistant's sign-in page reads the address of the top window, so it cannot run inside a
    frame. A custom panel runs in the top window and can move the page to HAB.
    """
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_ELEMENT,
        frontend_url_path=PANEL_PATH,
        module_url=f"{STATIC_URL}/panel.js",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        config={},
    )


def remove_sidebar_item(hass: HomeAssistant) -> None:
    """Take HAB out of the sidebar."""
    frontend.async_remove_panel(hass, PANEL_PATH)
