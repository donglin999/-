#!/usr/bin/env python3
"""单体素材抠图：raw_scene/props/<key>.png（品红底）→ raw_scene/cut/<key>.png（透明底、裁切，保持原分辨率）。
物件表 sheet_*：按连通块拆成 raw_scene/cut/<key>_<i>.png（按行优先编号，并输出 raw_scene/cut/<key>_index.png 编号预览）。

用法：python3 tools_scene/cut_props.py [key...]
抠图：品红度 m = min(R,B) - G，m>70 且 R、B 都高 → 背景；边缘 2px 内残留的品红色相像素做去色（去品红晕边），
再去掉面积 < 0.2% 的碎块。像素化在 build_scene.py 里按目标尺寸做（先预乘 alpha 再 BOX 缩小，避免品红渗色）。
"""
import os, sys, glob
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'raw_scene', 'props')
DST = os.path.join(ROOT, 'raw_scene', 'cut')


def key_out(im):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g
    bg = (m > 70) & (r > 120) & (b > 120)
    # 只保留与图像边缘连通的背景（物件内部偶有品红/紫色花饰时不误删）+ 大块封闭品红区（窗洞透出的底色）
    lab, n = ndi.label(bg)
    keep = np.zeros(n + 1, bool)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    keep[edge] = True
    sizes = ndi.sum(np.ones_like(lab), lab, index=np.arange(n + 1))
    keep[sizes > 400] = True
    pure = (m > 110) & (r > 190) & (b > 190)          # 纯品红：任何大小都算背景（亭子/栏杆缝隙里透出的底色）
    keep[np.unique(lab[pure])] = True
    keep[0] = False
    bg = keep[lab]
    alpha = (~bg).astype(np.uint8) * 255
    # 去品红晕边：背景 2px 邻域内、带品红色相的像素 → 去掉品红分量
    near = ndi.binary_dilation(bg, iterations=2) & ~bg
    mag = near & (m > 15)
    out = a.copy()
    gg = out[..., 1]
    avg = ((out[..., 0] + out[..., 2]) // 2)
    fix = np.where(mag, np.minimum(avg, gg + 10), 0)
    for c in (0, 2):
        out[..., c] = np.where(mag, np.minimum(out[..., c], gg + 25), out[..., c])
    # 严重品红的边缘像素直接透明
    alpha[near & (m > 45)] = 0
    # 物件内部残留的品红/紫晕（树叶缝、凳下阴影）：品红度高且偏蓝紫 → 透明（桃花粉 min(R,B)-G≈40，不受影响）
    alpha[(m > 55) & (b > 120)] = 0
    rgba = np.dstack([np.clip(out, 0, 255).astype(np.uint8), alpha])
    return rgba


def clean_small(rgba, frac=0.002):
    al = rgba[..., 3] > 0
    lab, n = ndi.label(ndi.binary_closing(al, iterations=2))
    if n == 0: return rgba
    sizes = ndi.sum(al, lab, index=np.arange(1, n + 1))
    tot = al.sum()
    for i, s in enumerate(sizes, 1):
        if s < tot * frac: rgba[lab == i, 3] = 0
    return rgba


def trim(rgba, pad=2):
    ys, xs = np.nonzero(rgba[..., 3])
    if not len(ys): return rgba
    y0, y1, x0, x1 = max(0, ys.min() - pad), ys.max() + pad + 1, max(0, xs.min() - pad), xs.max() + pad + 1
    return rgba[y0:y1, x0:x1]


DIL = {'sheet_trees': 4}


def split_sheet(rgba, key):
    al = rgba[..., 3] > 0
    grp = ndi.binary_dilation(al, iterations=DIL.get(key, 14))      # 树叶/蒸汽等碎片并入同一物件
    lab, n = ndi.label(grp)
    objs = []
    for i in range(1, n + 1):
        m = (lab == i) & al
        if m.sum() < al.sum() * 0.008: continue
        ys, xs = np.nonzero(m)
        objs.append((ys.min(), xs.min(), ys.max(), xs.max(), m))
    # 行优先排序：按中心 y 分行（行距阈值 = 平均高度的一半）
    if not objs: return []
    hs = np.mean([o[2] - o[0] for o in objs])
    objs.sort(key=lambda o: ((o[0] + o[2]) / 2) // (hs * .8) * 10000 + (o[1] + o[3]) / 2)
    res = []
    for j, (y0, x0, y1, x1, m) in enumerate(objs):
        sub = rgba.copy(); sub[..., 3] = np.where(m, sub[..., 3], 0)
        res.append((f'{key}_{j}', trim(sub[y0:y1 + 1, x0:x1 + 1].copy()), (x0, y0, x1, y1)))
    return res


def main(keys):
    os.makedirs(DST, exist_ok=True)
    files = sorted(glob.glob(os.path.join(SRC, '*.png')))
    for f in files:
        k = os.path.basename(f)[:-4]
        if keys and k not in keys: continue
        if k.endswith('_noref'): continue
        rgba = clean_small(key_out(Image.open(f)))
        if k.startswith('sheet_'):
            parts = split_sheet(rgba, k)
            prev = Image.fromarray(rgba).convert('RGBA'); d = ImageDraw.Draw(prev)
            for name, sub, (x0, y0, x1, y1) in parts:
                Image.fromarray(sub).save(os.path.join(DST, name + '.png'))
                d.rectangle((x0, y0, x1, y1), outline=(0, 255, 255, 255), width=3)
                d.text((x0 + 4, y0 + 4), name.split('_')[-1], fill=(255, 255, 0, 255))
            bgc = Image.new('RGBA', prev.size, (60, 60, 60, 255)); bgc.alpha_composite(prev)
            bgc.convert('RGB').save(os.path.join(DST, k + '_index.png'))
            print(k, '→', len(parts), 'parts')
        else:
            sub = trim(rgba)
            Image.fromarray(sub).save(os.path.join(DST, k + '.png'))
            print(k, sub.shape[1], 'x', sub.shape[0])


if __name__ == '__main__':
    main(sys.argv[1:])
