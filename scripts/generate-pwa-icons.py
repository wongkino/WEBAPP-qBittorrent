#!/usr/bin/env python3
"""Deprecated — use scripts/generate-pwa-icons.mjs (rasterizes public/icon.svg)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    script = ROOT / "scripts" / "generate-pwa-icons.mjs"
    print("Forwarding to generate-pwa-icons.mjs (SVG → PNG)…", file=sys.stderr)
    raise SystemExit(subprocess.call(["node", str(script)], cwd=ROOT))


if __name__ == "__main__":
    main()
