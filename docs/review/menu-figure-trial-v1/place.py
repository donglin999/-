#!/usr/bin/env python3
"""按队伍页的实际摆法把立绘放到 1280x1072 画布（立绘区 440x370 的比例）：上留 6/370、下留 10/370，按包围盒外扩 8px 等比包含、底对齐、水平居中。
用法：python3 place.py <立绘png/webp> <输出> [--bg 纸色|none]"""
import sys
from PIL import Image
W, H = 1280, 1072
def place(src, bg=(243, 235, 225, 255)):
    im = Image.open(src).convert('RGBA'); x0, y0, x1, y1 = im.getbbox()
    x0, y0 = max(0, x0 - 8), max(0, y0 - 8); x1, y1 = min(im.width, x1 + 8), min(im.height, y1 + 8)
    im = im.crop((x0, y0, x1, y1))
    top, bot = round(6 / 370 * H), round(10 / 370 * H); bh = H - top - bot
    k = min(W / im.width, bh / im.height); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    can = Image.new('RGBA', (W, H), bg if bg else (0, 0, 0, 0))
    can.alpha_composite(im, ((W - im.width) // 2, H - bot - im.height))
    return can
if __name__ == '__main__':
    bg = None if '--bg' in sys.argv and sys.argv[sys.argv.index('--bg') + 1] == 'none' else (243, 235, 225, 255)
    place(sys.argv[1], bg).save(sys.argv[2])
