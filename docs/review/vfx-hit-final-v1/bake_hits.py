#!/usr/bin/env python3
"""通用命中八种的成品烘焙（R-特效-01 优化路线第 5～7 步）。
关键帧条（2×2，透明底）→ 切格 → 按接触点锚定 → 缩到战斗特效像素（640×360 层）→ 锁色（每种从自己的条里取 24 色，不抖动）、
alpha 量化 5 阶 → 横排精灵表 → 写进 game/data/battle/fx_hits.json（12fps 持帧，末帧淡出）。
用法：python3 bake_hits.py   （输出 game/assets/fx/hits/<种>.png 和 fx_hits.json；预览 preview/<种>.png）"""
import json, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '../../../game'))
OUT = os.path.join(GAME, 'assets/fx/hits')
os.makedirs(OUT, exist_ok=True); os.makedirs(os.path.join(HERE, 'preview'), exist_ok=True)

# 种类：游戏里的命中类型、关键帧条、缩放（原格像素 → 特效像素）、概念图里力的方向（+1 朝右，-1 朝左）、节拍
F = 1 / 12  # 12fps 一拍
STD = [(0, F, 0, 1, 1), (F, 2 * F, 1, 1, 1), (2 * F, 3.6 * F, 2, 1, 1), (3.6 * F, 5.6 * F, 3, 1, 0)]
FAST = [(0, F, 0, 1, 1), (F, 2 * F, 1, 1, 1), (2 * F, 3 * F, 2, 1, 1), (3 * F, 4.4 * F, 3, 1, 0)]
KINDS = {
    '棍':   dict(strip=os.path.join(HERE, '../vfx-staff-hit-final-v1/staff_strip.png'), scale=0.2, dir=-1, keys=STD, stop=60, shake=4),
    '刀':   dict(strip='raw/blade.png', scale=0.2, dir=1, keys=STD, stop=50, shake=3),
    '咬':   dict(strip='raw/bite.png', scale=0.18, dir=1, keys=STD, stop=50, shake=3),
    '拳':   dict(strip='raw/fist.png', scale=0.2, dir=1, keys=STD, stop=55, shake=3),
    '剑':   dict(strip='raw/sword.png', scale=0.2, dir=1, keys=STD, stop=45, shake=2),
    '暗器': dict(strip='raw/needle.png', scale=0.18, dir=1, keys=FAST, stop=25, shake=1),
    '啄':   dict(strip='raw/rooster.png', scale=0.16, dir=-1, keys=STD, stop=40, shake=2, oy=0.32),
    '毒':   dict(strip='raw/snake.png', scale=0.16, dir=-1, keys=STD, stop=40, shake=2, oy=0.12),
}
NAME = {'棍': 'staff', '刀': 'blade', '咬': 'bite', '拳': 'fist', '剑': 'sword', '暗器': 'needle', '啄': 'rooster', '毒': 'snake'}

def cells(path):
    im = Image.open(path).convert('RGBA'); w, h = im.width // 2, im.height // 2
    return [im.crop((c * w, r * h, (c + 1) * w, (r + 1) * h)) for r in range(2) for c in range(2)]

def flash_anchor(c):
    """接触点：格内最白最亮的一团；没有就取格子正中"""
    a = np.asarray(c).astype(np.int32); w = (a[..., :3].min(-1) > 225) & (a[..., 3] > 200)
    ys, xs = np.where(w)
    return (float(np.median(xs)), float(np.median(ys))) if len(xs) > 20 else (c.width / 2, c.height / 2)

def palette_of(cs, n=24):
    """从四格不透明像素里取 n 色（中位切分），作为这一种的色带"""
    px = np.concatenate([np.asarray(c)[..., :3][np.asarray(c)[..., 3] > 60] for c in cs])
    if len(px) == 0: return np.array([[0, 0, 0]])
    im = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8), 'RGB').quantize(n, method=Image.MEDIANCUT)
    return np.array(im.getpalette()[:n * 3]).reshape(-1, 3)

def lock(rgb, P):
    a = rgb.reshape(-1, 3).astype(np.int32); d = ((a[:, None, :] - P[None, :, :]) ** 2).sum(-1)
    return P[d.argmin(1)].reshape(rgb.shape).astype(np.uint8)

def bake(kind, cfg):
    path = cfg['strip'] if os.path.isabs(cfg['strip']) else os.path.join(HERE, cfg['strip'])
    cs = cells(path)
    a0 = flash_anchor(cs[0]); anc = [a0] + [flash_anchor(c) if kind == '棍' and i == 1 else a0 for i, c in enumerate(cs[1:], 1)]
    P = palette_of(cs)
    s = cfg['scale']
    fw, fh = round(cs[0].width * s), round(cs[0].height * s)
    frames = []
    for c in cs:
        small = np.asarray(c.resize((fw, fh), Image.BOX)).astype(np.float32)
        al = np.round(small[..., 3] / 255 * 4) / 4; al[al < 0.25] = 0
        rgb = lock(small[..., :3].astype(np.uint8), P)
        frames.append(Image.fromarray(np.dstack([rgb, (al * 255).astype(np.uint8)]), 'RGBA'))
    sheet = Image.new('RGBA', (fw * 4, fh), (0, 0, 0, 0))
    for i, f in enumerate(frames): sheet.paste(f, (i * fw, 0))
    name = NAME[kind]
    sheet.save(os.path.join(OUT, name + '.png'))
    pv = Image.new('RGBA', (fw * 4 * 3, fh * 3), (40, 34, 28, 255))
    pv.alpha_composite(sheet.resize((fw * 4 * 3, fh * 3), Image.NEAREST)); pv.convert('RGB').save(os.path.join(HERE, 'preview', name + '.png'))
    dur = cfg['keys'][-1][1]
    return {'sheet': 'assets/fx/hits/%s.png' % name, 'fw': fw, 'fh': fh, 'n': 4,
            'anchor': [[round(a[0] * s, 1), round(a[1] * s, 1)] for a in anc],
            'keys': [[round(k[0], 4), round(k[1], 4), k[2], k[3], k[4]] for k in cfg['keys']], 'dur': round(dur, 4),
            'dir': cfg['dir'], 'oy': cfg.get('oy', 0), 'stop': cfg['stop'], 'shake': cfg['shake'], 'colors': int(len(P))}

if __name__ == '__main__':
    out = {'_说明': '通用命中成品（docs/review/vfx-hit-final-v1/bake_hits.py 生成，不手改）。dir＝概念图里力的方向，游戏按实际出手方向镜像；oy＝接触点从身体中心往下挪的比例（啄在膝、毒在腰胯）。'}
    for k, cfg in KINDS.items():
        p = cfg['strip'] if os.path.isabs(cfg['strip']) else os.path.join(HERE, cfg['strip'])
        if not os.path.exists(p): print('缺关键帧条', k, p); continue
        out[k] = bake(k, cfg); print(k, out[k]['fw'], out[k]['fh'], '锚点', out[k]['anchor'][0])
    json.dump(out, open(os.path.join(GAME, 'data/battle/fx_hits.json'), 'w'), ensure_ascii=False, indent=1)
