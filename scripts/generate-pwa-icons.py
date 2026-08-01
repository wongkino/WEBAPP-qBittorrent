#!/usr/bin/env python3
"""Generate iOS / PWA PNG assets from the app icon design (see public/icon.svg)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * 0.21875)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=r, fill=(10, 132, 255, 255))
    inset = int(size * 0.285)
    inner = size - inset * 2
    ir = int(inner * 0.2545)
    d.rounded_rectangle(
        (inset, inset, inset + inner, inset + inner),
        radius=ir,
        fill=(255, 255, 255, 41),
        outline=(255, 255, 255, 89),
        width=max(1, size // 64),
    )
    cx, cy = size // 2, int(size * 0.39)
    h = int(size * 0.203)
    w = int(size * 0.265)
    d.polygon([(cx, cy), (cx + w, cy + h), (cx - w, cy + h)], fill=(255, 255, 255, 255))
    return img


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for name, size in (
        ("apple-touch-icon.png", 180),
        ("icon-192.png", 192),
        ("icon-512.png", 512),
    ):
        draw_icon(size).save(PUBLIC / name)

    w, h = 1290, 2796
    splash = Image.new("RGB", (w, h), (29, 29, 31))
    icon = draw_icon(256)
    splash.paste(icon, ((w - 256) // 2, (h - 256) // 2), icon)
    splash.save(PUBLIC / "apple-touch-startup-image.png")
    print(f"Wrote PNG assets under {PUBLIC}")


if __name__ == "__main__":
    main()
