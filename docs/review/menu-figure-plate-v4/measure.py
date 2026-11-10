#!/usr/bin/env python3
"""背景板第四版量化检查（同一套底图颜色，差异靠明暗和构图）。
配色合规：有色像素（饱和度 >10%）里色相落在底图范围 15°～60° 的比例，要求 ≥ 95%；饱和度均值不超过底图的 1.5 倍。
差异：明度均值、对比（明度标准差）、雾与留白（很亮且几乎无色的像素占比）、左右重心、上下明暗差；
两张至少满足一条才算“不一样”：明度差 ≥ 8，对比差 ≥ 5，留白差 ≥ 0.12，重心差 ≥ 0.10，上下明暗差之差 ≥ 10。
用法：python3 measure.py <目录> <后缀>"""
import sys, os, json, colorsys, itertools
import numpy as np
from PIL import Image

KEYS = ['hero-village', 'hero-modern', 'hero-guiyun', 'ye', 'suzhi', 'yinhongying', 'peizhigu', 'censhuang']
NAME = {'hero-village': '萧白村衣', 'hero-modern': '萧白现代装', 'hero-guiyun': '萧白归云谷', 'ye': '叶蘅', 'suzhi': '苏芷',
        'yinhongying': '殷红缨', 'peizhigu': '裴知古', 'censhuang': '岑霜'}
HERE = os.path.dirname(os.path.abspath(__file__))

def hsv_of(path, crop=0.12):
    im = Image.open(path).convert('RGB').resize((256, 256), Image.BOX)
    a = np.asarray(im).astype(np.float32) / 255
    if crop: m = int(256 * crop); a = a[m:-m, m:-m]
    return np.array([colorsys.rgb_to_hsv(*p) for p in a.reshape(-1, 3)]).reshape(a.shape)

def metrics(path):
    hsv = hsv_of(path); h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]
    col = s > 0.10
    inside = float(((h >= 13) & (h <= 62) & col).sum() / max(1, col.sum()))
    rows = v.mean(1)
    dark = 1 - v; cols = dark.mean(0)
    return {'val': round(float(v.mean() * 100), 1), 'con': round(float(v.std() * 100), 1),
            'mist': round(float(((v > 0.88) & (s < 0.10)).mean()), 2),
            'cx': round(float((cols * np.arange(len(cols))).sum() / cols.sum() / len(cols)), 3),
            'tb': round(float((rows[: len(rows) // 3].mean() - rows[-len(rows) // 3:].mean()) * 100), 1),
            'sat': round(float(s.mean() * 100), 1), 'in_palette': round(inside, 3)}

def differ(a, b):
    w = []
    if abs(a['val'] - b['val']) >= 8: w.append('明度')
    if abs(a['con'] - b['con']) >= 5: w.append('对比')
    if abs(a['mist'] - b['mist']) >= 0.12: w.append('留白')
    if abs(a['cx'] - b['cx']) >= 0.10: w.append('重心')
    if abs(a['tb'] - b['tb']) >= 10: w.append('上下明暗')
    return w

if __name__ == '__main__':
    d, suf = sys.argv[1], sys.argv[2]
    page = metrics(os.path.join(HERE, 'ref-page-bg.png'))
    M = {k: metrics(os.path.join(d, k + suf)) for k in KEYS if os.path.exists(os.path.join(d, k + suf))}
    print('底图本身：饱和度 %.0f，色相在范围内 %.0f%%\n' % (page['sat'], page['in_palette'] * 100))
    print('| 人物 | 明度 | 对比 | 留白 | 左右重心 | 上下明暗差 | 饱和度 | 色相在底图范围内 |')
    print('| --- | --- | --- | --- | --- | --- | --- | --- |')
    bad = []
    for k, m in M.items():
        ok = m['in_palette'] >= 0.95 and m['sat'] <= page['sat'] * 1.5 + 2
        if not ok: bad.append(NAME[k])
        print('| %s | %.0f | %.0f | %.2f | %.2f | %+.0f | %.0f | %.0f%%%s |' % (NAME[k], m['val'], m['con'], m['mist'], m['cx'], m['tb'], m['sat'], m['in_palette'] * 100, '' if ok else ' ✗'))
    same = [(x, y) for x, y in itertools.combinations(M, 2) if not differ(M[x], M[y])]
    print('\n配色超出底图的：%s' % ('、'.join(bad) or '无'))
    print('两两比较 %d 对，拉不开的 %d 对：%s' % (len(list(itertools.combinations(M, 2))), len(same), '、'.join('%s—%s' % (NAME[x], NAME[y]) for x, y in same) or '无'))
    json.dump({'page': page, 'metrics': M, 'same_pairs': same, 'off_palette': bad}, open(os.path.join(HERE, 'measure_%s.json' % os.path.basename(os.path.normpath(d))), 'w'), ensure_ascii=False, indent=1)
    sys.exit(1 if same or bad else 0)
