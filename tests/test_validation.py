"""Tests for the settings check. Run: python3 -m unittest discover -s tests"""

import importlib.util
import sys
import types
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "custom_components" / "hab"

# Load validation.py without importing the Home Assistant package around it.
package = types.ModuleType("hab_pkg")
package.__path__ = [str(ROOT)]
sys.modules["hab_pkg"] = package
for name in ("const", "validation"):
    spec = importlib.util.spec_from_file_location(f"hab_pkg.{name}", ROOT / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[f"hab_pkg.{name}"] = module
    spec.loader.exec_module(module)

validate_config = sys.modules["hab_pkg.validation"].validate_config

GOOD = {"personality": {"humour": 50, "honesty": 50}, "ambient": {"room": "Kitchen"}}


class ValidateConfigTest(unittest.TestCase):
    def test_accepts_good_settings(self):
        self.assertIsNone(validate_config(GOOD))

    def test_rejects_non_objects(self):
        self.assertIn("object", validate_config("nope"))

    def test_rejects_dials_out_of_range(self):
        bad = {**GOOD, "personality": {"humour": 120, "honesty": 5}}
        self.assertIn("0 to 100", validate_config(bad))

    def test_rejects_boolean_dials(self):
        bad = {**GOOD, "personality": {"humour": True, "honesty": 5}}
        self.assertIn("0 to 100", validate_config(bad))

    def test_rejects_missing_room(self):
        self.assertIn("room", validate_config({**GOOD, "ambient": {}}))

    def test_rejects_huge_settings(self):
        huge = {**GOOD, "extra": "x" * 70000}
        self.assertIn("too large", validate_config(huge))


if __name__ == "__main__":
    unittest.main()
