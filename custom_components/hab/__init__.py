"""HAB: a screen and assistant front end for Home Assistant."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .panel import async_add_sidebar_item, async_serve_frontend, remove_sidebar_item
from .storage import ConfigStore
from .websocket import async_register_commands


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set HAB up: serve the app, add the sidebar item and open the settings commands."""
    state = hass.data.setdefault(DOMAIN, {})
    state["store"] = ConfigStore(hass)
    if not state.get("commands_registered"):
        async_register_commands(hass)
        state["commands_registered"] = True
    await async_serve_frontend(hass)
    await async_add_sidebar_item(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove HAB's sidebar item. The settings stay in storage."""
    remove_sidebar_item(hass)
    return True
