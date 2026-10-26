# -*- coding: utf-8 -*-
"""同一人不同档立绘的脸框配准（2026-10-21 用户：同一人不同表情档忽大忽小）。
做法：以本人“平常”档的人工核对锚点为准，把它的头部（脸框上下左右放宽）当模板，在别的档里按缩放＋平移做归一化互相关，
找到最像的位置，就能把锚点换算到那张图上。比自动量肤色可靠：眼镜、胡子、张嘴、举手都不影响。
以工作区根目录运行：python3 tools_scene/qihe/register_faces.py 参考图 锚点y0,y1,cx 待测图...（输出每张的 y0 y1 cx 与匹配分）"""
from pathlib import Path
import sys
import numpy as np
from PIL import Image

DS = 4   # 降采样倍数


def gray(path, k=1.0):
    im = Image.open(path).convert('RGBA'); w, h = im.size
    im = im.resize((max(8, int(w / DS * k)), max(8, int(h / DS * k))), Image.LANCZOS)
    a = np.asarray(im).astype(float) / 255; g = a[..., :3].mean(-1) * a[..., 3] + .5 * (1 - a[..., 3])
    return g


def ncc(img, tpl):
    H, W = img.shape; h, w = tpl.shape
    if h > H or w > W: return None
    t = tpl - tpl.mean(); tn = np.sqrt((t ** 2).sum()) or 1
    F = np.fft.rfft2(img, s=(H + h, W + w)); T = np.fft.rfft2(t[::-1, ::-1], s=(H + h, W + w))
    num = np.fft.irfft2(F * T, s=(H + h, W + w))[h - 1:H, w - 1:W]
    S = np.pad(img, ((1, 0), (1, 0))).cumsum(0).cumsum(1); S2 = np.pad(img ** 2, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    win = lambda A: A[h:, w:] - A[:-h, w:] - A[h:, :-w] + A[:-h, :-w]
    s1, s2 = win(S), win(S2); var = np.maximum(s2 - s1 ** 2 / (h * w), 1e-9)
    return num / (np.sqrt(var) * tn)


def register(ref, anchor, target, scales=None):
    y0, y1, cx = anchor; g = gray(ref); H, W = g.shape; fh = (y1 - y0) * H; fw = fh * 1.0
    ty0, ty1 = int(max(0, y0 * H - .55 * fh)), int(min(H, y1 * H + .08 * fh)); tx0, tx1 = int(max(0, cx * W - .95 * fw)), int(min(W, cx * W + .95 * fw))
    tpl = g[ty0:ty1, tx0:tx1]
    best = None
    def tryk(k):
        nonlocal best
        img = gray(target, k); r = ncc(img, tpl)
        if r is None: return
        i = np.unravel_index(r.argmax(), r.shape); sc = r[i]
        if best is None or sc > best[0]: best = (sc, k, i[0], i[1], img.shape)
    for k in (scales or np.arange(.70, 1.46, .02)): tryk(k)
    k0 = best[1]
    for k in np.arange(k0 - .02, k0 + .021, .005): tryk(k)
    sc, k, oy, ox, (h2, w2) = best
    # 参考图模板左上角 (tx0,ty0) 对应到目标图（缩放 k 后）的 (ox,oy)；目标图原始尺寸下比例坐标：
    ny0 = (oy + (y0 * H - ty0)) / h2; ny1 = (oy + (y1 * H - ty0)) / h2; ncx = (ox + (cx * W - tx0)) / w2
    return dict(y0=round(ny0, 4), y1=round(ny1, 4), cx=round(ncx, 4), score=round(float(sc), 3), k=round(float(k), 3))


if __name__ == '__main__':
    ref = sys.argv[1]; anc = tuple(float(v) for v in sys.argv[2].split(','))
    for t in sys.argv[3:]: print(Path(t).name, register(ref, anc, t))
