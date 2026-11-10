#!/usr/bin/env python3
"""棍击命中（丙版）成品：关键帧条 → 锚点对齐 → 锁色带 → 持帧。不叠火星（木杵打肉不出火星，R-特效-03）。"""
import sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_opt import *
from opt_tiers import fade

def flash_anchor(c):
    """格内最亮、最白的一团（接触点闪白）的中心"""
    a = np.asarray(c).astype(np.int32); w = (a[..., :3].min(-1) > 230) & (a[..., 3] > 200)
    ys, xs = np.where(w); return (float(np.median(xs)), float(np.median(ys))) if len(xs) > 20 else None

def staff(scale=0.2, at=(149, 271), name='staff'):
    P = palette(['dust']); C = cells(os.path.join(S, 'staff_kf/raw/staff_strip.png'), 2, 2)
    a0 = flash_anchor(C[0]); anc = [a0, flash_anchor(C[1]) or a0, a0, a0]
    fr = [prep(c, 'alpha', scale, P, an) for c, an in zip(C, anc)]
    tr = [{'frames': [f[0] for f in fr], 'anchor': [f[1] for f in fr], 'at': at, 'mode': 'alpha',
           'keys': [(0, 0.084, 0, 1), (0.084, 0.167, 1, 1), (0.167, 0.3, 2, 1), (0.3, 0.46, 3, fade(0.32, 0.46))]}]
    return build(name, tr, None, None, 0.6)

if __name__ == '__main__':
    print(staff())
