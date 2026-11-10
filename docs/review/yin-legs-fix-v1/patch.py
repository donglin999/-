#!/usr/bin/env python3
"""殷红缨腿部修正：原图上半身原样保留，只取候选图的下半身（48%～56% 高度之间渐变过渡），再按原抠图规则（白底、四边连通、封闭纯白块）去背景。
输出：<候选>-patched.png（白底）、<候选>-cut.png（透明，原尺寸）、<候选>-480.webp（游戏尺寸 480x640）。
用法：python3 patch.py raw/fix1.png ..."""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__))
ref = Image.open(os.path.join(HERE, 'ref-cn.png')).convert('RGB')
W, H = ref.size

def matte(im, tol=10):
    a = np.asarray(im.convert('RGB')).astype(int)
    d = np.abs(a - 255).max(axis=2)
    lab, _ = ndimage.label(d <= tol)
    seeds = set(np.unique(np.concatenate([lab[0], lab[:, 0], lab[:, -1], lab[-1]]))) - {0}
    bg = np.isin(lab, list(seeds))
    pl, _ = ndimage.label(d <= 3)
    for i, sl in enumerate(ndimage.find_objects(pl), 1):
        if 150 < (pl[sl] == i).sum() < 8000: bg |= pl == i     # 袖裙之间封闭的纯白空隙（上次在菜单立绘里手工去过的那种）
    al = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7))
    o = im.convert('RGBA'); o.putalpha(al); return o

for p in sys.argv[1:]:
    fx = Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS)
    y = np.arange(H)[:, None] / H
    w = np.clip((y - 0.48) / 0.08, 0, 1)[..., None]
    out = Image.fromarray((np.asarray(ref) * (1 - w) + np.asarray(fx) * w).astype(np.uint8))
    n = os.path.splitext(os.path.basename(p))[0]
    out.save(os.path.join(HERE, n + '-patched.png'))
    cut = matte(out); cut.save(os.path.join(HERE, n + '-cut.png'))
    cut.resize((480, 640), Image.LANCZOS).save(os.path.join(HERE, n + '-480.webp'), lossless=True)
    print(n)
