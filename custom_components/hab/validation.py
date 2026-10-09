"""Checks the settings HAB stores. No Home Assistant imports, so it can be tested on its own."""

from __future__ import annotations

import json
from typing import Any

from .const import MAX_CONFIG_BYTES


def _is_dial(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and 0 <= value <= 100


def validate_config(config: Any) -> str | None:
    """Return a plain message describing the first problem, or None if the settings are fine."""
    if not isinstance(config, dict):
        return "The settings must be an object."
    if len(json.dumps(config)) > MAX_CONFIG_BYTES:
        return "The settings are too large."
    personality = config.get("personality")
    if not isinstance(personality, dict):
        return "personality must be an object."
    if not _is_dial(personality.get("humour")) or not _is_dial(personality.get("honesty")):
        return "personality.humour and personality.honesty must be numbers from 0 to 100."
    ambient = config.get("ambient")
    if not isinstance(ambient, dict) or not isinstance(ambient.get("room"), str):
        return "ambient.room must be text."
    return None
