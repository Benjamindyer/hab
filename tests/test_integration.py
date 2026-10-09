"""Tests that run HAB inside a real (test) Home Assistant. Run: pytest tests"""

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hab.const import DOMAIN, PANEL_PATH, STATIC_URL

# Lets the test Home Assistant load custom_components/hab.
pytestmark = pytest.mark.usefixtures("enable_custom_integrations")

GOOD = {"personality": {"humour": 60, "honesty": 75}, "ambient": {"room": "Kitchen"}}


async def _setup(hass) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, data={}, title="HAB")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_setup_adds_the_sidebar_item(hass):
    await _setup(hass)
    panels = hass.data["frontend_panels"]
    assert PANEL_PATH in panels
    assert panels[PANEL_PATH].config == {"url": f"{STATIC_URL}/index.html"}
    assert panels[PANEL_PATH].require_admin is False


async def test_unload_removes_the_sidebar_item(hass):
    entry = await _setup(hass)
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_PATH not in hass.data["frontend_panels"]


async def test_settings_start_empty(hass, hass_ws_client):
    await _setup(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hab/config/get"})
    reply = await client.receive_json()
    assert reply["success"] is True
    assert reply["result"] == {"config": None}


async def test_admin_can_save_and_read_settings(hass, hass_ws_client):
    await _setup(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hab/config/set", "config": GOOD})
    assert (await client.receive_json())["success"] is True
    await client.send_json({"id": 2, "type": "hab/config/get"})
    assert (await client.receive_json())["result"] == {"config": GOOD}


async def test_invalid_settings_are_refused(hass, hass_ws_client):
    await _setup(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hab/config/set", "config": {"personality": {}}})
    reply = await client.receive_json()
    assert reply["success"] is False
    assert reply["error"]["code"] == "invalid_config"


async def test_a_normal_user_can_read_but_not_save(hass, hass_ws_client, hass_read_only_access_token):
    await _setup(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json({"id": 1, "type": "hab/config/get"})
    assert (await client.receive_json())["success"] is True
    await client.send_json({"id": 2, "type": "hab/config/set", "config": GOOD})
    reply = await client.receive_json()
    assert reply["success"] is False
    assert reply["error"]["code"] == "unauthorized"


async def test_the_web_app_is_served(hass, hass_client):
    await _setup(hass)
    client = await hass_client()
    response = await client.get(f"{STATIC_URL}/index.html")
    assert response.status == 200
    assert "HAB" in await response.text()


async def test_admin_can_clear_saved_settings(hass, hass_ws_client):
    await _setup(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hab/config/set", "config": GOOD})
    assert (await client.receive_json())["success"] is True
    await client.send_json({"id": 2, "type": "hab/config/clear"})
    assert (await client.receive_json())["success"] is True
    await client.send_json({"id": 3, "type": "hab/config/get"})
    assert (await client.receive_json())["result"] == {"config": None}


async def test_a_normal_user_cannot_clear_settings(hass, hass_ws_client, hass_read_only_access_token):
    await _setup(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json({"id": 1, "type": "hab/config/clear"})
    reply = await client.receive_json()
    assert reply["success"] is False
    assert reply["error"]["code"] == "unauthorized"
