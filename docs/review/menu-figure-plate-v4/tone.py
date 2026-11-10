#!/usr/bin/env python3
"""按规格把背景板的明暗调子调到目标值（只动深浅，不动色相）：
明度 v' = 目标均值 + (v - 当前均值) × 目标对比 / 当前对比（只按画面中间 76% 计算均值和对比）；
饱和度不超过底图在同一明度上出现过的最大值（palette.json），所以不会出现底图没有的颜色。
用法：python3 tone.py <输入目录> <输出目录>"""
import sys, os, json
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SATK = {'peizhigu': 0.75}   # 个别图饱和度再收一点（裴知古黄昏暖光偏浓）
TARGET = {  # 目标：明度均值、对比（明度标准差），单位 %
    'hero-village': (82, 9), 'hero-modern': (70, 4), 'hero-guiyun': (84, 14), 'ye': (72, 13),
    'suzhi': (90, 6), 'yinhongying': (66, 19), 'peizhigu': (52, 18), 'censhuang': (60, 8),
}
P = json.load(open(os.path.join(HERE, 'palette.json')))
pv = np.array([c['val'] for c in P], float) / 100; ps = np.array([c['sat'] for c in P], float) / 100
o = np.argsort(pv); pv, ps = pv[o], ps[o]

def rgb2hsv(a):
    mx = a.max(-1); mn = a.min(-1); d = np.maximum(mx - mn, 1e-6)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return h, s, mx

def hsv2rgb(h, s, v):
    i = np.floor(h * 6).astype(int) % 6; f = h * 6 - np.floor(h * 6)
    p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s)
    out = np.zeros(h.shape + (3,))
    for k, (x, y, z) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        m = i == k; out[..., 0][m], out[..., 1][m], out[..., 2][m] = x[m], y[m], z[m]
    return out

def tone(path, key):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255
    h, s, v = rgb2hsv(a)
    n = a.shape[0]; m = int(n * 0.12); c = v[m:-m, m:-m]
    tm, tc = TARGET[key][0] / 100, TARGET[key][1] / 100
    v2 = np.clip(tm + (v - c.mean()) * (tc / max(c.std(), 1e-3)), 0.2, 1.0)
    s2 = np.minimum(s * SATK.get(key, 1.0), np.maximum(np.interp(v2, pv, ps) * 1.15, 0.06))
    return Image.fromarray((hsv2rgb(h, s2, v2) * 255).clip(0, 255).astype(np.uint8))

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
    for k in TARGET:
        p = os.path.join(src, k + '.png')
        if os.path.exists(p): tone(p, k).save(os.path.join(dst, k + '.png'))
