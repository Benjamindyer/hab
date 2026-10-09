"""Adding HAB takes one click: there is nothing to enter."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class HabConfigFlow(ConfigFlow, domain=DOMAIN):
    """Create the single HAB entry."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Ask the owner to confirm, then create the entry."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            return self.async_create_entry(title="HAB", data={})
        return self.async_show_form(step_id="user")
