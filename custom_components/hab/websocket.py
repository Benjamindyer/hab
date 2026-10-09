"""The commands the web app uses to read, save and clear its settings."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .validation import validate_config


@websocket_api.websocket_command({vol.Required("type"): "hab/config/get"})
@websocket_api.async_response
async def ws_get_config(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Send the saved settings. Any signed-in user may read them, so a wall tablet can start up."""
    config = await hass.data[DOMAIN]["store"].async_load()
    connection.send_result(msg["id"], {"config": config})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "hab/config/set", vol.Required("config"): dict})
@websocket_api.async_response
async def ws_set_config(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Save new settings. Only an administrator may change them."""
    problem = validate_config(msg["config"])
    if problem:
        connection.send_error(msg["id"], "invalid_config", problem)
        return
    await hass.data[DOMAIN]["store"].async_save(msg["config"])
    connection.send_result(msg["id"], {"config": msg["config"]})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "hab/config/clear"})
@websocket_api.async_response
async def ws_clear_config(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Forget the saved settings. Only an administrator may do this."""
    await hass.data[DOMAIN]["store"].async_clear()
    connection.send_result(msg["id"], {"config": None})


def async_register_commands(hass: HomeAssistant) -> None:
    """Make the commands available to the web app."""
    websocket_api.async_register_command(hass, ws_get_config)
    websocket_api.async_register_command(hass, ws_set_config)
    websocket_api.async_register_command(hass, ws_clear_config)
