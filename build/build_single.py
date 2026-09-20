#!/usr/bin/env python3
"""
Fold the app into one file: dist/patta.html

Why bother, when frontend/ already works? Because a single file can be
emailed to a judge, opened from a USB stick, hosted anywhere, or
published as a Claude Artifact — and because a demo that depends on a
dev server is a demo that can fail on stage.

    python3 build/build_single.py

The modules are concatenated in dependency order with their import and
export keywords removed. No bundler, no node_modules, no build step to
explain to anyone.
"""

from __future__ import annotations

import base64
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "frontend"
OUT = ROOT / "dist" / "patta.html"

# Dependency order matters: a module may only use what is above it.
MODULES = ["config.js", "i18n.js", "data.js", "prompt.js", "api.js", "app.js"]

IMPORT_LINE = re.compile(r"^\s*import\s+.*?from\s+['\"].*?['\"];?\s*$", re.MULTILINE)
EXPORT_KW = re.compile(r"^export\s+", re.MULTILINE)


def flatten_js() -> str:
    chunks = []
    for name in MODULES:
        source = (SRC / "js" / name).read_text(encoding="utf-8")
        source = IMPORT_LINE.sub("", source)
        source = EXPORT_KW.sub("", source)
        chunks.append(f"/* ── {name} ─────────────────────────────── */\n{source.strip()}\n")
    return "\n".join(chunks)


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def main() -> int:
    html = (SRC / "index.html").read_text(encoding="utf-8")
    css = (SRC / "css" / "app.css").read_text(encoding="utf-8")
    js = flatten_js()

    html = html.replace(
        '<link rel="stylesheet" href="./css/app.css">',
        f"<style>\n{css}\n</style>",
    )
    html = html.replace(
        '<script type="module" src="./js/app.js"></script>',
        f'<script type="module">\nwindow.__PATTA_SINGLE_FILE__ = true;\n{js}\n</script>',
    )

    # A manifest and a service worker need real files next to the page,
    # so the single-file build drops them and inlines the icon instead.
    html = html.replace('<link rel="manifest" href="./manifest.webmanifest">\n', "")
    html = html.replace('href="./icons/icon.svg"', f'href="{data_uri(SRC / "icons" / "icon.svg")}"')
    html = html.replace(
        '<link rel="apple-touch-icon" href="./icons/icon-192.png">',
        f'<link rel="apple-touch-icon" href="{data_uri(SRC / "icons" / "icon-192.png")}">',
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")

    size = OUT.stat().st_size / 1024
    print(f"{OUT.relative_to(ROOT)}  —  {size:.0f} KB, no external files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
