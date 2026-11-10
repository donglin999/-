#!/usr/bin/env python3
"""原版截图与 Godot 截图并排对比：输出左右拼图（左原版、右 Godot），并计算逐像素差（0–255）的平均值与差>24 像素占比。
用法：python3 tools/compare.py 原版.png godot.png 输出.png [标题]  → 打印 JSON 一行"""
import sys, json
from PIL import Image, ImageChops, ImageDraw, ImageFont
a = Image.open(sys.argv[1]).convert('RGB'); b = Image.open(sys.argv[2]).convert('RGB')
if b.size != a.size: b = b.resize(a.size, Image.LANCZOS)
d = ImageChops.difference(a, b).convert('L')
hist = d.histogram(); n = a.size[0] * a.size[1]
mean = sum(i * c for i, c in enumerate(hist)) / n
big = sum(hist[25:]) / n
W, H = a.size
out = Image.new('RGB', (W * 2 + 12, H + 40), (20, 16, 12))
out.paste(a, (0, 40)); out.paste(b, (W + 12, 40))
dr = ImageDraw.Draw(out)
try: f = ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc', 22)
except Exception: f = None
title = sys.argv[4] if len(sys.argv) > 4 else ''
dr.text((10, 8), f'原版（网页）  {title}', fill=(240, 220, 170), font=f)
dr.text((W + 22, 8), f'Godot   平均差 {mean:.1f} / 差>24 占 {big*100:.1f}%', fill=(240, 220, 170), font=f)
out.save(sys.argv[3])
print(json.dumps({'mean': round(mean, 2), 'big': round(big, 4)}))
