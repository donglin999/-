"""Pack the reviewed prone-Zhou cutout into the game's static 4x4 sprite format."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art_sources/zhou_prone_20260930.png"
TARGET = ROOT / "assets/s_zhou.webp"
CELL_W, CELL_H = 120, 141

im = Image.open(SOURCE).convert("RGBA")
alpha = im.getchannel("A").point(lambda value: 255 if value >= 48 else 0)
box = alpha.getbbox()
if not box:
    raise ValueError("Zhou cutout has no visible pixels")
im.putalpha(alpha)
cutout = im.crop(box)
width = 105
height = round(cutout.height * width / cutout.width)
cutout = cutout.resize((width, height), Image.Resampling.NEAREST)
cell = Image.new("RGBA", (CELL_W, CELL_H))
cell.alpha_composite(cutout, ((CELL_W - width) // 2, 122 - height))
sheet = Image.new("RGBA", (CELL_W * 4, CELL_H * 4))
for row in range(4):
    for col in range(4):
        sheet.alpha_composite(cell, (col * CELL_W, row * CELL_H))
sheet.save(TARGET, "WEBP", lossless=True, method=6)
print(f"{TARGET}: source {box}, cutout {width}x{height}, sheet {sheet.size}")
