"""Keeps HAB's settings in Home Assistant's own storage."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION


class ConfigStore:
    """Loads and saves the settings the owner chose for HAB."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)

    async def async_load(self) -> dict[str, Any] | None:
        """Return the saved settings, or None if nothing was saved yet."""
        return await self._store.async_load()

    async def async_save(self, config: dict[str, Any]) -> None:
        """Save the settings."""
        await self._store.async_save(config)
