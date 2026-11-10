#!/usr/bin/env python3
"""优化路线整理脚本：生图关键帧条 → 切格 → 去底（黑底转加色／透明底保留）→ 按锚点对齐、按目标尺寸缩放 →
锁调色板（不抖动）、alpha 量化 5 阶 → 按 12fps 节拍排时间轴 → 叠上 pixelfx 引擎算的火星与光（同一份代码关掉主形）。
输出：opt/frames/<档>/add_###.png（加色层，640×360 特效像素）与 alpha_###.png（普通混合层），frames.json。"""
import json, os, sys
import numpy as np
from PIL import Image
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
O = os.path.join(S, 'opt'); PFX = os.path.join(S, 'ext/pixelfx/records/opt/xjh')
FW, FH, FPS = 640, 360, 30
RAMP = {
  'wind': ["#0f3a2a", "#1f6a4c", "#3fae84", "#7fe3b5", "#c2f5dd", "#f2fff8", "#ffffff"],
  'jiangqing': ["#1a0c1e", "#3a1a3a", "#2c5a78", "#4f9ab8", "#a8dcec", "#f0fbff", "#ffffff"],
  'gold': ["#2e1608", "#7a4218", "#c47a26", "#eeb64e", "#ffe39a", "#fffbea"],
  'darkred': ["#3a0a10", "#7a1a24", "#b8323c"],
  'dust': ["#1d1620", "#4a3a3c", "#6e5a5a", "#8a6a48", "#c9a477", "#e6c896", "#f6ead2", "#ffc98a", "#ffffff"],
}
hexrgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def palette(names):
    P = [(0, 0, 0)]
    for n in names: P += [hexrgb(h) for h in RAMP[n]]
    return np.array(P, dtype=np.int32)

def lock(rgb, P):
    """每个像素换成调色板里最近的颜色（不抖动）"""
    a = rgb.reshape(-1, 3).astype(np.int32)
    d = ((a[:, None, :] - P[None, :, :]) ** 2).sum(-1)
    return P[d.argmin(1)].reshape(rgb.shape).astype(np.uint8)

def cells(path, rows, cols):
    im = Image.open(path).convert('RGBA'); w, h = im.width // cols, im.height // rows
    return [im.crop((c * w, r * h, (c + 1) * w, (r + 1) * h)) for r in range(rows) for c in range(cols)]

def prep(cell, mode, scale, P, anchor_px):
    """cell：原格；scale：原图像素→特效像素；anchor_px：锚点在原格里的像素坐标。返回 (特效像素图, 锚点在小图里的坐标)"""
    w, h = max(1, round(cell.width * scale)), max(1, round(cell.height * scale))
    small = cell.resize((w, h), Image.BOX)
    A = np.asarray(small).astype(np.float32)
    if mode == 'add':
        rgb = A[..., :3]; lum = rgb.max(-1)
        rgb[lum < 18] = 0                      # 近黑全透明（加色时不留灰雾）
        out = lock(rgb.astype(np.uint8), P); img = Image.fromarray(out, 'RGB')
    else:
        al = A[..., 3] / 255.0; al = np.round(al * 4) / 4; al[al < 0.25] = 0
        rgb = lock(A[..., :3].astype(np.uint8), P)
        img = Image.fromarray(np.dstack([rgb, (al * 255).astype(np.uint8)]), 'RGBA')
    return img, (anchor_px[0] * scale, anchor_px[1] * scale)

def place(canvas, img, at, anchor, mode, k=1.0):
    x, y = round(at[0] - anchor[0]), round(at[1] - anchor[1])
    if mode == 'add':
        L = np.zeros((FH, FW, 3), np.float32); tmp = Image.new('RGB', (FW, FH)); tmp.paste(img, (x, y))
        canvas['add'] += np.asarray(tmp).astype(np.float32) * k
    else:
        if k < 1:
            a = np.asarray(img).copy(); a[..., 3] = (a[..., 3] * k).astype(np.uint8); img = Image.fromarray(a, 'RGBA')
        lay = Image.new('RGBA', (FW, FH), (0, 0, 0, 0)); lay.paste(img, (x, y)); canvas['alpha'] = Image.alpha_composite(canvas['alpha'], lay)

def pfx_layer(name):
    J = json.load(open(os.path.join(PFX, name, name + '.json'))); sheet = Image.open(os.path.join(PFX, name, name + '.png')).convert('RGBA')
    fr = [sheet.crop((f['frame']['x'], f['frame']['y'], f['frame']['x'] + f['frame']['w'], f['frame']['y'] + f['frame']['h'])) for f in J['frames']]
    pv = J['meta']['pixelfx']['pivot']; return fr, (pv[0], pv[1]) if isinstance(pv, list) else (pv['x'], pv['y'])

def build(tier, tracks, pfx, pfx_at, dur):
    """tracks：[{frames:[img…], anchor:[(x,y)…], at:(x,y) 或 [(x,y)…], mode, keys:[(t0,t1,帧号, 透明度0..1)…]}]"""
    out = os.path.join(O, 'frames', tier); os.makedirs(out, exist_ok=True)
    pf, ppv = pfx_layer(pfx); n = int(round(dur * FPS)) + 1; names_a, names_l = [], []
    for i in range(n):
        t = i / FPS; cv = {'add': np.zeros((FH, FW, 3), np.float32), 'alpha': Image.new('RGBA', (FW, FH), (0, 0, 0, 0))}
        for tr in tracks:
            ats = tr['at'] if isinstance(tr['at'], list) else [tr['at']]
            for (t0, t1, j, k) in tr['keys']:
                if t0 <= t < t1:
                    kk = k(t) if callable(k) else k
                    for at in ats: place(cv, tr['frames'][j], at, tr['anchor'][j], tr['mode'], kk)
        if i < len(pf):
            lay = Image.new('RGBA', (FW, FH), (0, 0, 0, 0)); lay.paste(pf[i], (round(pfx_at[0] - ppv[0]), round(pfx_at[1] - ppv[1]))); cv['alpha'] = Image.alpha_composite(cv['alpha'], lay)
        Image.fromarray(np.clip(cv['add'], 0, 255).astype(np.uint8)).save(os.path.join(out, 'add_%03d.png' % i))
        cv['alpha'].save(os.path.join(out, 'alpha_%03d.png' % i)); names_a.append('alpha_%03d.png' % i); names_l.append('add_%03d.png' % i)
    json.dump({'fps': FPS, 'pivot': [0, 0], 'frames': names_a, 'add': names_l}, open(os.path.join(out, 'frames.json'), 'w'))
    return n
