#!/usr/bin/env python3
"""素材预览拼图：python3 tools_scene/contact.py <输出.png> <png...>（灰底，每格 ≤360px，带文件名）"""
import sys, os
from PIL import Image, ImageDraw
out, fs = sys.argv[1], sys.argv[2:]
C = 360; cols = min(5, len(fs)); rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * C, rows * (C + 16)), (90, 96, 90)); d = ImageDraw.Draw(sheet)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGBA'); im.thumbnail((C - 8, C - 8))
    x, y = (i % cols) * C, (i // cols) * (C + 16)
    sheet.paste(im, (x + (C - im.width) // 2, y + (C - im.height) // 2), im)
    d.text((x + 4, y + C), os.path.basename(f)[:-4], fill=(255, 255, 255))
sheet.save(out)
