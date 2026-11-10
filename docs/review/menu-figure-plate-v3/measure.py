#!/usr/bin/env python3
"""背景板量化检查：每张量主色相、饱和度、明度、冷暖、上下明暗分布（地平线附近）、左右重心；再两两比差异。
用法：python3 measure.py <目录> <后缀>    例：python3 measure.py ../menu-figure-plate-v2 -mid.png
只量中间 76% 区域（四边会淡出成纸色，不算）。差异门槛（两张至少满足一条才算“不一样”）：
  主色相差 ≥ 25°，或明度均值差 ≥ 8，或饱和度均值差 ≥ 8，或冷暖比差 ≥ 0.25，或左右重心差 ≥ 0.12。"""
import sys, os, json, colorsys, itertools
import numpy as np
from PIL import Image

KEYS = ['hero-village', 'hero-modern', 'hero-guiyun', 'ye', 'suzhi', 'yinhongying', 'peizhigu', 'censhuang']
NAME = {'hero-village': '萧白村衣', 'hero-modern': '萧白现代装', 'hero-guiyun': '萧白归云谷', 'ye': '叶蘅', 'suzhi': '苏芷',
        'yinhongying': '殷红缨', 'peizhigu': '裴知古', 'censhuang': '岑霜'}

def metrics(path):
    im = Image.open(path).convert('RGB').resize((256, 256), Image.BOX)
    a = np.asarray(im).astype(np.float32) / 255
    m = int(256 * 0.12); a = a[m:-m, m:-m]
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in a.reshape(-1, 3)]).reshape(a.shape)
    h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]
    w = s * (v > 0.15)  # 色相按饱和度加权
    ang = np.deg2rad(h)
    hue = (np.rad2deg(np.arctan2((np.sin(ang) * w).sum(), (np.cos(ang) * w).sum())) + 360) % 360
    warm = float((w * ((h < 70) | (h > 330))).sum() / max(1e-6, w.sum()))
    rows = v.mean(1); top, bot = float(rows[: len(rows) // 3].mean()), float(rows[-len(rows) // 3:].mean())
    dark = 1 - v
    cols = dark.mean(0); cx = float((cols * np.arange(len(cols))).sum() / cols.sum() / len(cols))
    return {'hue': round(float(hue), 1), 'sat': round(float(s.mean() * 100), 1), 'val': round(float(v.mean() * 100), 1),
            'warm': round(warm, 2), 'top_bot': round((top - bot) * 100, 1), 'cx': round(cx, 3)}

def differ(a, b):
    dh = abs(a['hue'] - b['hue']); dh = min(dh, 360 - dh)
    why = []
    if dh >= 25: why.append('色相差 %.0f°' % dh)
    if abs(a['val'] - b['val']) >= 8: why.append('明度差 %.0f' % abs(a['val'] - b['val']))
    if abs(a['sat'] - b['sat']) >= 8: why.append('饱和度差 %.0f' % abs(a['sat'] - b['sat']))
    if abs(a['warm'] - b['warm']) >= 0.25: why.append('冷暖差 %.2f' % abs(a['warm'] - b['warm']))
    if abs(a['cx'] - b['cx']) >= 0.12: why.append('重心差 %.2f' % abs(a['cx'] - b['cx']))
    return why

if __name__ == '__main__':
    d, suf = sys.argv[1], sys.argv[2]
    M = {k: metrics(os.path.join(d, k + suf)) for k in KEYS if os.path.exists(os.path.join(d, k + suf))}
    print('| 人物 | 主色相 | 饱和度 | 明度 | 暖色占比 | 上下明暗差 | 左右重心 |')
    print('| --- | --- | --- | --- | --- | --- | --- |')
    for k, m in M.items(): print('| %s | %.0f° | %.0f | %.0f | %.2f | %+.0f | %.2f |' % (NAME[k], m['hue'], m['sat'], m['val'], m['warm'], m['top_bot'], m['cx']))
    same = [(x, y) for x, y in itertools.combinations(M, 2) if not differ(M[x], M[y])]
    total = len(list(itertools.combinations(M, 2)))
    print('\n两两比较 %d 对，达不到差异门槛的 %d 对：%s' % (total, len(same), '、'.join('%s—%s' % (NAME[x], NAME[y]) for x, y in same) or '无'))
    json.dump({'metrics': M, 'same_pairs': same, 'pairs': total}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'measure_%s.json' % os.path.basename(os.path.normpath(d))), 'w'), ensure_ascii=False, indent=1)
    sys.exit(1 if same else 0)
