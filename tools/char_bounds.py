#!/usr/bin/env python3
"""离线算出每个人物帧的不透明轮廓（对应原版 scene.js charBounds：alpha≥48 的上下左右边界，
并去掉身体下方占比 ≤2%、间隔 ≥3px 的孤立残片），写进 game/data/runtime/bounds.json。
原版在浏览器里逐帧 getImageData 现算；这里预先算好，运行时零开销。"""
import json, os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(HERE, '../game')
SRC = os.path.join(HERE, '../../xiaojianghu-legacy-prologue')
img = json.load(open(os.path.join(GAME, 'data/runtime/img.json')))
cache, out = {}, {}
missing = set()
for k, v in img.items():
    if not k[:2] in ('c_', 'w_', 'r_', 'i_', 'f_') or 'sheet' not in v:
        continue
    p = os.path.join(SRC, v['sheet'])
    if not os.path.exists(p):
        missing.add(v['sheet']); continue
    if p not in cache:
        cache[p] = Image.open(p).convert('RGBA').getchannel('A')
    a = cache[p]
    x, y, w, h = v['r']
    crop = a.crop((x, y, x + w, y + h)).load()
    top, bottom, left, right = h, 0, w, 0
    bands, band, total = [], None, 0
    for yy in range(h):
        cnt = 0
        for xx in range(w):
            if crop[xx, yy] >= 48:
                cnt += 1
                top = min(top, yy); bottom = max(bottom, yy + 1); left = min(left, xx); right = max(right, xx + 1)
        if cnt:
            total += cnt
            if band is None:
                band = [yy, yy + 1, 0]; bands.append(band)
            band[1] = yy + 1; band[2] += cnt
        else:
            band = None
    raw = bottom
    body = max(bands, key=lambda b: b[2]) if bands else None
    tail = [b for b in bands if body and b[0] >= body[1]]
    if tail and all(b[0] - body[1] >= 3 for b in tail) and sum(b[2] for b in tail) <= total * .02:
        bottom = body[1]
    if top == h:
        top = 0
    out[k] = [top, bottom or h, left if left != w else 0, right or w, 1 if bottom < raw else 0]
json.dump(out, open(os.path.join(GAME, 'data/runtime/bounds.json'), 'w'))
print('帧', len(out), '缺图', sorted(missing))
