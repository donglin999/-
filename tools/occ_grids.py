#!/usr/bin/env python3
"""离线生成遮挡判定用的不透明格（对应原版 scene.js occGrid：物件世界矩形按 6 世界像素切格，缩小采样后 alpha>64 记 1）。
输出 game/data/runtime/occ.json：{场景:{props:[base64…], fgp:[base64…], dims:{props:[[gw,gh]…], fgp:[…]}}}"""
import json, os, math, base64, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '../game')
sc = json.load(open(os.path.join(GAME, 'data/runtime/sc.json')))
img = json.load(open(os.path.join(GAME, 'data/runtime/img.json')))
paths = json.load(open(os.path.join(GAME, 'data/js/production-assets.json')))['PRODUCTION_ASSET_PATHS']
def path_of(k):
    if k in img and 'src' in img[k]: return os.path.join(GAME, img[k]['src'])
    if k in paths: return os.path.join(GAME, paths[k])
    p = os.path.join(GAME, 'assets', k + '.webp'); return p if os.path.exists(p) else None
CELL = 6
def grid(im, box, W, H):
    gw, gh = max(1, math.ceil(W / CELL)), max(1, math.ceil(H / CELL))
    a = im.crop(box).resize((gw, gh), Image.BOX)
    bits = (np.array(a) > 64).astype(np.uint8)
    return [gw, gh, base64.b64encode(bits.tobytes()).decode()]
out = {}
for sid, s in sc.items():
    o = {}
    if s.get('props') and s.get('propImg'):
        p = path_of(s['propImg'])
        if p:
            im = Image.open(p).convert('RGBA').getchannel('A'); k = s.get('propK') or 3
            o['props'] = [grid(im, (q[0], q[1], q[0] + q[2], q[1] + q[3]), q[2] * k, q[3] * k) for q in s['props']]
    if s.get('fgp') and s.get('fg'):
        p = path_of(s['fg'])
        if p:
            im = Image.open(p).convert('RGBA').getchannel('A'); WW = (s.get('gw') or 48) * 40; kf = im.width / WW
            o['fgp'] = [grid(im, (round(q[0] * kf), round(q[1] * kf), round((q[0] + q[2]) * kf), round((q[1] + q[3]) * kf)), q[2], q[3]) for q in s['fgp']]
    out[sid] = o
    print(sid, {k: len(v) for k, v in o.items()})
json.dump(out, open(os.path.join(GAME, 'data/runtime/occ.json'), 'w'))
