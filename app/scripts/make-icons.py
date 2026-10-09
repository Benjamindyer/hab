"""Draws the HAB icons (the four-bar slab) into public/icons. Run: python3 scripts/make-icons.py"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
BG = (6, 7, 10)
TOP, BOTTOM = (217, 214, 204), (74, 74, 71)


def draw(size: int) -> Image.Image:
    scale = 4  # draw large, then shrink, for smooth edges
    s = size * scale
    img = Image.new("RGB", (s, s), BG)
    d = ImageDraw.Draw(img)
    bar_w, gap = s * 0.11, s * 0.035
    heights = [0.46, 0.50, 0.44, 0.52]
    total = 4 * bar_w + 3 * gap
    left = (s - total) / 2
    for i, h in enumerate(heights):
        x0 = left + i * (bar_w + gap)
        top, bottom = s * (0.5 - h / 2), s * (0.5 + h / 2)
        for y in range(int(top), int(bottom)):
            t = (y - top) / (bottom - top)
            colour = tuple(int(TOP[c] + (BOTTOM[c] - TOP[c]) * t) for c in range(3))
            d.line([(x0, y), (x0 + bar_w, y)], fill=colour)
    return img.resize((size, size), Image.LANCZOS)


OUT.mkdir(parents=True, exist_ok=True)
for name, size in [("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)]:
    draw(size).save(OUT / name)
    print("wrote", name)

# Home Assistant shows this icon on the integration's page.
BRAND = OUT.parent.parent.parent / "custom_components" / "hab" / "brand"
BRAND.mkdir(parents=True, exist_ok=True)
draw(256).save(BRAND / "icon.png")
print("wrote brand/icon.png")
