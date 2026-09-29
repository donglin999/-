"""立绘后处理：raw_por/p_*.png（纯白底）→ assets/p_*.webp（透明底，≤480×640）

1. 近白像素中与画面边缘连通的部分视为背景（墨线闭合，洪泛不会进入白衣内部）
2. 背景边缘 3px 过渡带：按"与白色混合"反推 alpha 并反预乘颜色，去掉白晕
3. 裁切到主体并缩放到 ≤480×640
用法：python3 tools_por/post_por.py [名字 ...]
"""
import os, sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage

SRC, DST = 'raw_por', 'assets'
WHITE_T = 236   # 三通道都 ≥ 此值视为"白"


def process(src, dst):
    im0 = Image.open(src)
    if im0.mode in ('RGBA', 'LA', 'P'):   # 异步接口有时直接返回透明底：先铺白底，保持"纯白底去背"的前提
        bgw = Image.new('RGBA', im0.size, (255, 255, 255, 255)); bgw.alpha_composite(im0.convert('RGBA')); im0 = bgw
    a = np.asarray(im0.convert('RGB')).astype(np.float32)
    h, w, _ = a.shape
    white = a.min(axis=2) >= WHITE_T
    lab, _ = ndimage.label(white)
    edge = np.unique(np.concatenate([lab[0], lab[:, 0], lab[:, -1]]))  # 上/左/右边缘（下缘是腰部截断）
    bg = np.isin(lab, edge[edge > 0])
    # 封闭的留白（臂弯、披风内侧等）：足够大、接近纯白且几乎无起伏的连通块也算背景；白衣有墨色晕染，不满足
    pure = a.min(axis=2) >= 246
    plab, pn = ndimage.label(pure & ~bg)
    if pn:
        idx = np.arange(1, pn + 1)
        area = ndimage.sum(np.ones_like(plab), plab, idx)
        mean = ndimage.mean(a.min(axis=2), plab, idx)
        std = ndimage.standard_deviation(a.mean(axis=2), plab, idx)
        hole = idx[(area > 600) & (mean > 250) & (std < 3.0)]
        # 小块留白（发丝/头巾飘带间隙）：面积小但四周被深色墨线/头发包围 → 也是背景；白衣高光四周是浅色布料，不满足
        small = idx[(area > 12) & (area <= 3000) & (mean > 248) & (std < 3.5)]
        if len(small):
            lab_s = np.where(np.isin(plab, small), plab, 0)
            ring = ndimage.binary_dilation(lab_s > 0, iterations=3) & (lab_s == 0)
            rl, _ = ndimage.label(ring | (lab_s > 0))
            dark = a.min(axis=2) < 150
            ids = np.unique(lab_s[lab_s > 0])
            if len(ids):
                # 每个小块周围环带中深色像素占比
                ring_lab = ndimage.grey_dilation(lab_s, size=7) * ring
                cnt = ndimage.sum(np.ones_like(ring_lab), ring_lab, ids)
                dk = ndimage.sum(dark, ring_lab, ids)
                keep = ids[(cnt > 0) & (dk / np.maximum(cnt, 1) > .35)]
                hole = np.concatenate([hole, keep])
        bg |= ndimage.binary_dilation(np.isin(plab, hole), iterations=1) & white
    # 去掉背景里的孤立杂点
    bg = ndimage.binary_closing(bg, iterations=1) | bg
    alpha = np.where(bg, 0.0, 1.0)
    # 过渡带：靠近背景的前景像素，按与白色的混合比例求 alpha
    band = ndimage.binary_dilation(bg, iterations=4) & ~bg
    darkness = (228 - a.min(axis=2)) / (228 - 150)   # 近白（≥228）直接全透明，去白晕
    alpha[band] = np.clip(darkness[band], 0, 1)
    # 去残留浅色毛边：紧贴透明区的浅色像素（min≥210）再剥两圈
    for _ in range(2):
        tr = alpha <= 0.02
        edge_px = ndimage.binary_dilation(tr, iterations=1) & ~tr & (a.min(axis=2) >= 210)
        alpha[edge_px] = 0
    aa = np.maximum(alpha, 1e-3)[..., None]
    rgb = np.where(band[..., None], (a - 255 * (1 - aa)) / aa, a)
    out = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
    im = Image.fromarray(out)
    im = im.crop(im.getbbox())
    s = min(480 / im.width, 640 / im.height, 1)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(dst, quality=90)
    print(dst, im.size)


if __name__ == '__main__':
    names = sys.argv[1:] or [os.path.basename(p)[2:-4] for p in sorted(glob.glob(f'{SRC}/p_*.png'))]
    for n in names:
        process(f'{SRC}/p_{n}.png', f'{DST}/p_{n}.webp')
