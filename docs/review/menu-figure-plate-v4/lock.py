#!/usr/bin/env python3
"""把背景板的颜色收进菜单底图的色板（palette.json，从 assets/ui/jianghu-v4/background.webp 聚类取的 20 色）。
做法：保留每个像素的明度（深浅、笔触都不变），色相换成色板在同一明度上的色相，饱和度不超过色板在该明度上的饱和度。
这样画面里只剩底图那一族颜色：纸白、暖灰、赭黄、墨褐。
用法：python3 lock.py <输入目录> <后缀> <输出目录>"""
import sys, os, json, colorsys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(HERE, 'palette.json')))
pv = np.array([c['val'] for c in P], float) / 100
ph = np.array([c['hue'] for c in P], float)
ps = np.array([c['sat'] for c in P], float) / 100
o = np.argsort(pv); pv, ph, ps = pv[o], ph[o], ps[o]

def curve(v, arr):
    return np.interp(v, pv, arr)

def lock(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(-1); mn = a.min(-1); v = mx
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    # 原色相
    hh = np.zeros_like(v)
    d = np.maximum(mx - mn, 1e-6)
    hh = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    deg = hh * 360
    # 底图里有色彩的像素色相全在 15°～60°；低饱和（≤10%）的灰保留原冷暖倾向，其余色相收进 15°～60°
    LO, HI, GREY = 15, 60, 0.10
    inside = (deg >= LO) & (deg <= HI)
    near = np.where(np.minimum(np.abs(deg - LO), 360 - np.abs(deg - LO)) < np.minimum(np.abs(deg - HI), 360 - np.abs(deg - HI)), LO, HI)
    deg2 = np.where(inside, deg, near)
    smax = np.maximum(curve(v, ps) * 1.15, GREY)   # 每个明度上底图出现过的最大饱和度
    grey = s <= GREY
    h = np.where(grey, hh, deg2 / 360)
    s2 = np.where(grey, s, np.minimum(s, smax))
    # HSV → RGB（向量化）
    i = np.floor(h * 6).astype(int) % 6; f = h * 6 - np.floor(h * 6)
    p_ = v * (1 - s2); q = v * (1 - f * s2); t = v * (1 - (1 - f) * s2)
    out = np.zeros_like(a)
    for k, (x, y, z) in enumerate([(v, t, p_), (q, v, p_), (p_, v, t), (p_, q, v), (t, p_, v), (v, p_, q)]):
        m = i == k
        out[..., 0][m], out[..., 1][m], out[..., 2][m] = x[m], y[m], z[m]
    return Image.fromarray((out * 255).clip(0, 255).astype(np.uint8), 'RGB')

if __name__ == '__main__':
    src, suf, dst = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if f.endswith(suf):
            lock(Image.open(os.path.join(src, f))).save(os.path.join(dst, f[: -len(suf)] + '.png'))
            print('锁色', f)
