#!/usr/bin/env python3
"""试样后期：
A（分层）：模型出的整图 → 背景按菜单底图色板压饱和度（只动饱和度，同 v4 tone.py 的上限）→ 原立绘原样叠回 → 裁成立绘区比例 1200x1072。
B（整张）：模型出的整图直接裁成 1200x1072（人物和背景分不开，没法只压背景）。
并量背景配色：有色像素中色相在 13～62° 的比例、饱和度均值（A 量的是叠人物前、去掉人物区域的背景；B 只能整张量）。
用法：python3 finish.py <名字> <A|B> <原图> [立绘抠图]"""
import sys, json, os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(HERE, '../menu-figure-plate-v4/palette.json')))
pv = np.array([c['val'] for c in P], float) / 100; ps = np.array([c['sat'] for c in P], float) / 100
o = np.argsort(pv); pv, ps = pv[o], ps[o]
import importlib.util
spec = importlib.util.spec_from_file_location('tone', os.path.join(HERE, '../menu-figure-plate-v4/tone.py')); tone = importlib.util.module_from_spec(spec); spec.loader.exec_module(tone)

def clamp_sat(img):
    a = np.asarray(img.convert('RGB')).astype(np.float32) / 255
    h, s, v = tone.rgb2hsv(a)
    s2 = np.minimum(s, np.maximum(np.interp(v, pv, ps) * 1.15, 0.06))
    return Image.fromarray((tone.hsv2rgb(h, s2, v) * 255).clip(0, 255).astype(np.uint8))

def palette_stats(img, mask=None):
    a = np.asarray(img.convert('RGB')).astype(np.float32) / 255
    h, s, v = tone.rgb2hsv(a); h = h * 360
    m = np.ones(s.shape, bool) if mask is None else ~mask
    col = (s > 0.10) & m
    return round(float(((h >= 13) & (h <= 62) & col).sum() / max(1, col.sum())), 3), round(float(s[m].mean() * 100), 1)

def crop(img, W=1200):
    x = (img.width - W) // 2; return img.crop((x, 0, x + W, img.height))

if __name__ == '__main__':
    name, kind, raw = sys.argv[1:4]
    r = Image.open(raw).convert('RGB').resize((1280, 1072), Image.LANCZOS)
    res = {}
    if kind == 'A':
        cut = Image.open(sys.argv[4]).convert('RGBA'); mask = np.asarray(cut)[..., 3] > 16
        res['before'] = palette_stats(r, mask)
        bg = clamp_sat(r); res['after'] = palette_stats(bg, mask)
        out = bg.convert('RGBA'); out.alpha_composite(cut); out = out.convert('RGB')
    else:
        res['before'] = palette_stats(r); out = r
    crop(out).save(os.path.join(HERE, name + '-final.png'))
    print(name, kind, '背景色相在底图范围内的比例、饱和度：', res)
