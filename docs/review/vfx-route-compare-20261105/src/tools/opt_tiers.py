#!/usr/bin/env python3
"""优化路线三档的具体参数：格子、锚点、缩放、时间轴（12fps 一拍 ≈ 0.083s，按拍持帧）。"""
import sys, os, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_opt import *

def lum(c): a = np.asarray(c.convert('RGB')).astype(np.int32); return a.max(-1)
def bbox(c, thr=40, alpha=False):
    a = np.asarray(c)[..., 3] if alpha else lum(c); ys, xs = np.where(a > thr); return xs.min(), ys.min(), xs.max(), ys.max()
def root_right(c, thr=120):
    """最右侧的亮点（锋根／剑尖）"""
    L = lum(c); ys, xs = np.where(L > thr); i = xs.argmax(); return xs[i], ys[i]
def rot(c, deg, center):
    return c.rotate(deg, resample=Image.BICUBIC, center=center)
def fade(t0, t1):
    return lambda t: max(0.0, min(1.0, 1 - (t - t0) / (t1 - t0)))

def low():
    P = palette(['dust']); C = cells(os.path.join(O, 'raw/low_hit.png'), 2, 2)
    x0, y0, x1, y1 = bbox(C[0], 60, alpha=True); anc = ((x0 + x1) / 2 + 20, (y0 + y1) / 2)   # 团块中心（略偏右，受力点在右侧）
    sc = 52 / 280.0
    fr = [prep(c, 'alpha', sc, P, anc) for c in C]
    tr = [{'frames': [f[0] for f in fr], 'anchor': [f[1] for f in fr], 'at': (140, 257), 'mode': 'alpha',
           'keys': [(0, 0.067, 0, 1), (0.067, 0.167, 1, 1), (0.167, 0.3, 2, 1), (0.3, 0.46, 3, fade(0.3, 0.46))]}]
    return build('low', tr, 'staff-hit', (140, 283), 0.6)

def mid():
    P = palette(['wind'])
    C = cells(os.path.join(O, 'raw/mid_thrust2.png'), 4, 1)
    rx, ry = root_right(C[2]); ang = math.degrees(math.atan2(12, 235))
    C = [rot(c, -ang, (rx, ry)) for c in C]                      # 轻微下倾，对准乌魁胸口
    L = lum(C[2]).astype(np.float64); col = L[:, : rx // 2].sum(0); sx = col.argmax()  # 左半边最亮的一列＝命中星芒
    sc = 235.0 / (rx - sx)
    th = [prep(c, 'add', sc, P, (rx, ry)) for c in C]
    G = cells(os.path.join(O, 'raw/mid_guard.png'), 2, 2); x0, y0, x1, y1 = bbox(G[1], 60); ga = ((x0 + x1) / 2, (y0 + y1) / 2)
    gs = 84.0 / (y1 - y0); gd = [prep(c, 'add', gs, P, ga) for c in G]
    tr = [{'frames': [f[0] for f in th], 'anchor': [f[1] for f in th], 'at': (402, 228), 'mode': 'add',
           'keys': [(0, 0.17, 0, 1), (0.17, 0.33, 1, 1), (0.33, 0.5, 2, 1), (0.5, 0.75, 3, fade(0.55, 0.75))]},
          {'frames': [f[0] for f in gd], 'anchor': [f[1] for f in gd], 'at': (465, 246), 'mode': 'add',
           'keys': [(0.29, 0.37, 0, 1), (0.37, 0.55, 1, 1), (0.55, 0.72, 2, 1), (0.72, 0.9, 3, fade(0.72, 0.9))]}]
    return build('mid', tr, 'short-edge', (402, 228), 0.95)

def high():
    P = palette(['jiangqing', 'gold', 'darkred'])
    C = cells(os.path.join(O, 'raw/high_fan.png'), 2, 2)
    rx, ry = root_right(C[2]); x0, _, _, _ = bbox(C[2], 60); sc = 345.0 / (rx - x0)
    ang = math.degrees(math.atan2(18, 240))
    C = [rot(c, -ang, root_right(c)) for c in C]
    fan = [prep(c, 'add', sc, P, root_right(c)) for c in C]
    H = cells(os.path.join(O, 'raw/high_hit.png'), 2, 2); x0, y0, x1, y1 = bbox(H[1], 80); ha = ((x0 + x1) / 2, (y0 + y1) / 2)
    hs = 40.0 / (x1 - x0); hit = [prep(c, 'add', hs, P, ha) for c in H]
    T = [(402 - 162, 228 + 2), (402 - 235, 228 + 12), (402 - 325, 228 + 39)]
    tr = [{'frames': [f[0] for f in fan], 'anchor': [f[1] for f in fan], 'at': (402, 228), 'mode': 'add',
           'keys': [(0.26, 0.35, 0, 0.8), (0.35, 0.44, 1, 0.8), (0.44, 0.72, 2, 0.8), (0.72, 1.02, 3, lambda t: 0.8 * fade(0.78, 1.02)(t))]},
          {'frames': [f[0] for f in hit], 'anchor': [f[1] for f in hit], 'at': T, 'mode': 'add',
           'keys': [(0.52, 0.57, 0, 1), (0.57, 0.72, 1, 1), (0.72, 0.86, 2, 1), (0.86, 1.04, 3, fade(0.9, 1.04))]}]
    return build('high', tr, 'fan-edge', (402, 228), 1.25)

if __name__ == '__main__':
    for k in sys.argv[1:]: print(k, {'low': low, 'mid': mid, 'high': high}[k]())
