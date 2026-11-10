# -*- coding: utf-8 -*-
"""把生图写错的小字在原位改正：品级印“两”→“丙”，“回风身法”→“回岚身法”。
用法：python3 fixglyph.py <图> <输出> <x0,y0,x1,y1:字> ...   坐标是整图像素；只在框内找字迹、按原字颜色和高度重写。"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
FONT = '/System/Library/Fonts/Supplemental/Songti.ttc'

def fix(im, box, txt):
    x0, y0, x1, y1 = box
    a = np.asarray(im).astype(int)
    reg = a[y0:y1, x0:x1]
    lum = reg.mean(2)
    ink = lum < lum.max() - 70
    ys, xs = np.where(ink)
    gy0, gy1, gx0, gx1 = ys.min(), ys.max(), xs.min(), xs.max()
    col = tuple(int(c) for c in np.median(reg[ink], 0))
    bg = tuple(int(c) for c in np.median(reg[~ink], 0))
    d = ImageDraw.Draw(im)
    d.rectangle((x0 + gx0 - 1, y0 + gy0 - 1, x0 + gx1 + 1, y0 + gy1 + 1), fill=bg)
    h = gy1 - gy0 + 2
    f = ImageFont.truetype(FONT, int(h * 1.05), index=1)
    w = d.textlength(txt, font=f)
    cx = x0 + (gx0 + gx1) / 2
    bb = d.textbbox((0, 0), txt, font=f)
    d.text((cx - w / 2, y0 + gy0 - bb[1] - 0.5), txt, font=f, fill=col)

if __name__ == '__main__':
    im = Image.open(sys.argv[1]).convert('RGB')
    for spec in sys.argv[3:]:
        b, t = spec.split(':')
        fix(im, tuple(int(v) for v in b.split(',')), t)
    im.save(sys.argv[2])
