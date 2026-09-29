# -*- coding: utf-8 -*-
"""「破势」演出素材（工作流 F，见 docs/battle-v3.md）。

字体：Google Fonts 开源毛笔字体（SIL OFL 1.1），下载到 raw_battle/F/fonts/：
  · 志莽行书 Zhi Mang Xing —— 大字「破」（行草，粗重有力）
  · 马善政楷书 Ma Shan Zheng —— 朱印「势」与小印「破」（字形端正，小尺寸仍可辨）
流程：高分辨率渲染字形 → 沿笔势方向做线积分卷积（LIC）得到飞白丝纹 → 干湿分区刻出飞白、毛边、墨色浓淡
      → 按面积平均降采样到「美术像素」（游戏里每美术像素 = 画布 3×3，最近邻放大）→ 量化为 4 阶墨色。
输出（透明底 webp，均为美术像素分辨率，运行时整数倍最近邻放大）：
  assets/fx_poshi_po.webp     大字「破」 128×128
  assets/fx_poshi_band.webp   飞白笔刷横扫带（白色 + alpha，运行时染色）336×64
  assets/fx_poshi_seal.webp   朱红方印「势」（阴文）44×44
  assets/fx_poshi_seal_s.webp 小朱印「破」16×16（POSHI.seal 用）
  assets/fx_poshi_ink.webp    墨点飞溅 8 帧横排，每帧 32×32
预览：raw_battle/F/preview_*.png
用法：python3 tools_fx/poshi_gen.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'raw_battle', 'F')
FONT_PO = os.path.join(RAW, 'fonts', 'ZhiMangXing-Regular.ttf')
FONT_SEAL = os.path.join(RAW, 'fonts', 'MaShanZheng-Regular.ttf')
ASSETS = os.path.join(ROOT, 'assets')
rng = np.random.default_rng(20260928)

INK = np.array([[14, 10, 9], [34, 27, 24], [62, 54, 49], [104, 94, 86]], float)   # 浓 → 淡
VERM = np.array([[196, 38, 28], [160, 26, 20], [226, 70, 48]], float)             # 朱砂 主/暗/亮


def lowfreq(h, w, cell, seed_rng=rng):
    n = seed_rng.random((h // cell + 3, w // cell + 3))
    z = ndi.zoom(n, cell, order=3)[:h, :w]
    z = (z - z.min()) / (np.ptp(z) + 1e-9)
    return z


def glyph_mask(ch, font, size, box, dx=0, dy=0, fit=0):
    F = ImageFont.truetype(font, size)
    im = Image.new('L', (box, box), 0)
    d = ImageDraw.Draw(im)
    l, t, r, b = d.textbbox((0, 0), ch, font=F)
    if fit:   # 按字形外框缩放到占满 fit 比例
        F = ImageFont.truetype(font, int(size * fit * box / max(r - l, b - t)))
        l, t, r, b = d.textbbox((0, 0), ch, font=F)
    d.text(((box - (r - l)) / 2 - l + dx, (box - (b - t)) / 2 - t + dy), ch, font=F, fill=255)
    return np.asarray(im, float) / 255


def stroke_dirs(mask, sigma):
    """笔势方向场：用平滑后 mask 的结构张量取主方向（沿笔画走向）。"""
    m = ndi.gaussian_filter(mask, sigma)
    gy, gx = np.gradient(m)
    s = sigma * 1.6
    jxx = ndi.gaussian_filter(gx * gx, s)
    jyy = ndi.gaussian_filter(gy * gy, s)
    jxy = ndi.gaussian_filter(gx * gy, s)
    ang = 0.5 * np.arctan2(2 * jxy, jxx - jyy)   # 梯度主方向
    ang = ang + np.pi / 2                          # 转 90° → 笔画方向
    # 平坦区域（笔画内部远离边缘）方向不可靠：混入一个默认的「横向略上扬」方向
    coh = np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2)
    coh = coh / (coh.max() + 1e-9)
    w = np.clip(coh * 6, 0, 1)
    vx = np.cos(ang) * w + np.cos(-0.35) * (1 - w)
    vy = np.sin(ang) * w + np.sin(-0.35) * (1 - w)
    n = np.hypot(vx, vy) + 1e-9
    return vx / n, vy / n


def lic(noise, vx, vy, steps=26, step=2.0):
    h, w = noise.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    acc = noise.copy()
    cnt = 1.0
    for sgn in (1, -1):
        px, py = xx.copy(), yy.copy()
        for _ in range(steps):
            ix = np.clip(px, 0, w - 1).astype(int)
            iy = np.clip(py, 0, h - 1).astype(int)
            dx, dy = vx[iy, ix], vy[iy, ix]
            px += sgn * dx * step
            py += sgn * dy * step
            acc += ndi.map_coordinates(noise, [py, px], order=1, mode='nearest')
            cnt += 1
    out = acc / cnt
    out = (out - out.mean()) / (out.std() + 1e-9)
    return out


def brushify(mask, grain, dry_amt, rough, seed, dry_slope=0.0):
    """mask(0..1 高分辨率) → (alpha 布尔, 墨色等级 0..3)。grain：飞白丝纹宽度（高分辨率像素）。"""
    r = np.random.default_rng(seed)
    h, w = mask.shape
    # 毛边：轻微模糊 + 细噪声扰动阈值
    fine = ndi.gaussian_filter(r.random((h, w)), 1.2)
    fine = (fine - fine.mean()) / (fine.std() + 1e-9)
    m = ndi.gaussian_filter(mask, 1.5) + rough * fine * 0.12
    ink = m > 0.5
    # 飞白：LIC 丝纹 × 干笔分区
    vx, vy = stroke_dirs(mask, sigma=grain * 1.5)
    base = r.random((h // grain + 2, w // grain + 2))
    base = ndi.zoom(base, grain, order=0)[:h, :w]
    streak = lic(base, vx, vy, steps=int(grain * 3.5), step=2.0)
    dry = lowfreq(h, w, max(8, h // 5), r)
    yy, xx = np.mgrid[0:h, 0:w]
    dry = dry * (1 - dry_slope) + dry_slope * np.clip((xx / w * .75 + yy / h * .45) - .1, 0, 1)   # 行笔向右下渐干
    dry = (dry - dry.min()) / (np.ptp(dry) + 1e-9)
    # 距边缘近的地方更容易干（笔锋收尾、侧锋）
    dist = ndi.distance_transform_edt(ink)
    edge = np.clip(1 - dist / (grain * 5), 0, 1)
    dryness = np.clip((dry - (1 - dry_amt)) / max(dry_amt, 1e-3), 0, 1) * (0.55 + 0.45 * edge)
    holes = streak < (-1.7 + 2.4 * dryness)
    holes &= dryness > 0.2
    ink2 = ink & ~holes
    # 去掉孤立噪点
    ink2 = ndi.binary_opening(ink2, iterations=1) | (ink & (dist > grain * 3) & (dryness < .35))
    # 墨色：湿处浓，干处淡；飞白两侧的丝更淡
    tone = -0.35 + dryness * 1.1 + np.clip(-streak, 0, None) * dryness * 0.5
    tone += (lowfreq(h, w, max(6, h // 9), r) - .5) * .6
    return ink2, tone


def downsample(ink, tone, f, thr=0.5):
    h, w = ink.shape
    H, W = h // f, w // f
    a = ink[:H * f, :W * f].reshape(H, f, W, f).mean(axis=(1, 3))
    t = (tone * ink)[:H * f, :W * f].reshape(H, f, W, f).sum(axis=(1, 3)) / np.maximum(1, ink[:H * f, :W * f].reshape(H, f, W, f).sum(axis=(1, 3)))
    # 覆盖率低的像素（飞白边缘）墨色更淡
    t = t + (1 - a) * 0.9
    alpha = a > thr
    lv = np.clip(np.round(t), 0, 3).astype(int)
    return alpha, lv


def to_rgba(alpha, lv, pal):
    h, w = alpha.shape
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = pal[lv].astype(np.uint8)
    out[..., 3] = alpha * 255
    return out


def save(arr, name, preview_scale=3, bg=(58, 52, 60)):
    im = Image.fromarray(arr, 'RGBA')
    p = os.path.join(ASSETS, name + '.webp')
    im.save(p, lossless=True, quality=100, method=6)
    pv = Image.new('RGBA', (im.width * preview_scale, im.height * preview_scale), bg + (255,))
    pv.alpha_composite(im.resize(pv.size, Image.NEAREST))
    pv.save(os.path.join(RAW, 'preview_' + name + '.png'))
    print('wrote', p, im.size)
    return im


# ── 1. 大字「破」 ──
def make_po(art=128, f=8):
    box = art * f
    m = glyph_mask('破', FONT_PO, box, box, fit=.94)
    m = ndi.grey_dilation(m, size=(9, 9))            # 略加粗：像素化后笔画不细碎
    ink, tone = brushify(m, grain=f + 2, dry_amt=.54, rough=1.0, seed=7, dry_slope=.55)
    alpha, lv = downsample(ink, tone, f)
    # 清掉单像素孤点
    lab, n = ndi.label(alpha)
    sizes = ndi.sum(alpha, lab, range(1, n + 1))
    for i, s in enumerate(sizes):
        if s < 3:
            alpha[lab == i + 1] = False
    return save(to_rgba(alpha, lv, INK), 'fx_poshi_po')


# ── 2. 飞白横扫带（白色，运行时染色） ──
def make_band(W=336, H=64, f=6):
    h, w = H * f, W * f
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    u = xx / w
    # 笔触轮廓：起笔圆钝（左）、收笔拖尾变细（右），上下缘有抖动
    cy = h * .5 + np.sin(u * 5.2 + .6) * h * .05 - (u - .5) * h * .08
    half = h * .42 * np.clip(np.minimum(u / .05, 1), 0, 1) ** .5 * (1 - np.clip((u - .55) / .45, 0, 1) ** 1.6 * .85)
    jit = (lowfreq(1, w, 23)[0] - .5) * h * .12
    top = cy - half + jit
    jit2 = (lowfreq(1, w, 31)[0] - .5) * h * .12
    bot = cy + half + jit2
    m = ((yy > top) & (yy < bot)).astype(float)
    r = np.random.default_rng(11)
    # 横向丝纹：每行一个随机值，沿 x 方向拉长，越往右越干
    rows = r.random(h // (f - 1) + 2)
    rows = np.repeat(rows, f - 1)[:h][:, None]
    streak = rows + (lowfreq(h, w, f * 3, r) - .5) * .5 + (lowfreq(h, w, f * 14, r) - .5) * .35
    dry = np.clip((u - .4) / .6, 0, 1) ** 1.3 * .85 + (lowfreq(h, w, f * 20, r) - .5) * .45
    edge = np.abs(yy - cy) / np.maximum(half, 1)
    holes = streak < dry * .8 - .08 + np.clip(edge - .62, 0, 1) * 1.3
    ink = (m > 0) & ~holes
    a = ink.reshape(H, f, W, f).mean(axis=(1, 3)) > .5
    lv = np.zeros_like(a, int)
    out = np.zeros((H, W, 4), np.uint8)
    out[..., :3] = 255
    out[..., 3] = a * 255
    return save(out, 'fx_poshi_band')


# ── 3. 朱印（阴文：朱底白字） ──
def seal_img(ch, art, f, border, seed, font=FONT_SEAL, glyph=.8, dy=0):
    box = art * f
    r = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:box, 0:box].astype(float)
    pad = border * f
    # 略不规整的方形：四边各自抖动
    wob = lambda n: (lowfreq(1, box, box // 6, r)[0] - .5) * f * 1.4
    t, b_, l, rt = wob(0), wob(1), wob(2), wob(3)
    sq = (yy > pad * .35 + t[xx.astype(int)]) & (yy < box - pad * .35 + b_[xx.astype(int)]) & \
         (xx > pad * .35 + l[yy.astype(int)]) & (xx < box - pad * .35 + rt[yy.astype(int)])
    sq &= ~(((np.abs(xx - box / 2) > box / 2 - pad * 1.1) & (np.abs(yy - box / 2) > box / 2 - pad * 1.1)))  # 圆角
    g = glyph_mask(ch, font, int(box * glyph), box, dy=dy * f)
    g = ndi.grey_dilation(g, size=(max(1, f // 2),) * 2)
    white = g > .5
    # 磨损：印泥不均 → 朱底上随机斑驳缺口，边缘更多
    wear = lowfreq(box, box, f * 2, r) * .6 + r.random((box, box)) * .4
    dist = ndi.distance_transform_edt(sq)
    edgek = np.clip(1 - dist / (f * 2.5), 0, 1)
    holes = wear < .12 + edgek * .32
    red = sq & ~white & ~holes
    a = red.reshape(art, f, art, f).mean(axis=(1, 3))
    alpha = a > .5
    tone = lowfreq(art, art, 5, r)
    lv = np.where(tone > .72, 2, np.where(tone < .22, 1, 0))
    lv[(a > .5) & (a < .8)] = 1
    return to_rgba(alpha, lv, VERM)


def make_seal():
    return save(seal_img('势', 44, 10, 3.2, 5, glyph=.78), 'fx_poshi_seal', 4)


# ── 4. 小印「破」：16×16 手工像素字（字体在 12px 下笔画粘连，故手摆），朱底留白 ──
SMALL = [      # 12×12「破」：左「石」右「皮」；'#' 留白
    '........#...',
    '#####.######',
    '..#...#.#..#',
    '.#....#.#...',
    '.####.#.#...',
    '##..#.#####.',
    '#...#.#...#.',
    '.####.##.#..',
    '......#.##..',
    '.....#..##..',
    '....#..#..#.',
    '......#....#',
]


def make_seal_s(n=16):
    out = np.zeros((n, n, 4), np.uint8)
    r = np.random.default_rng(3)
    cream = (255, 236, 214, 255)
    for y in range(n):
        for x in range(n):
            if (x in (0, n - 1)) and (y in (0, n - 1)):
                continue                                           # 圆角
            if x in (0, n - 1) or y in (0, n - 1):
                out[y, x] = VERM[1].tolist() + [255]               # 暗朱边
                continue
            gy, gx = y - 2, x - 2
            if 0 <= gy < 12 and 0 <= gx < 12 and SMALL[gy][gx] == '#':
                out[y, x] = cream
            else:
                out[y, x] = (VERM[2] if r.random() < .1 else VERM[0]).tolist() + [255]
    return save(out, 'fx_poshi_seal_s', 8)


# ── 5. 墨点飞溅（8 帧） ──
def make_ink(n=8, cell=32, f=8):
    sheet = np.zeros((cell, cell * n, 4), np.uint8)
    for k in range(n):
        r = np.random.default_rng(100 + k)
        box = cell * f
        yy, xx = np.mgrid[0:box, 0:box].astype(float)
        c = box / 2
        m = np.zeros((box, box))
        # 主墨团：噪声扰动的圆
        R0 = box * r.uniform(.12, .2)
        ang = np.arctan2(yy - c, xx - c)
        rr = np.hypot(xx - c, yy - c)
        wob = sum(r.uniform(.05, .18) * np.sin(ang * j + r.uniform(0, 6)) for j in (3, 5, 7))
        m = np.maximum(m, (rr < R0 * (1 + wob)).astype(float))
        # 方向性拖尾 + 卫星墨点
        d = r.uniform(0, 2 * np.pi)
        for i in range(r.integers(5, 10)):
            a = d + r.normal(0, .5)
            dist = R0 * r.uniform(1.1, 2.6)
            rad = R0 * r.uniform(.08, .32) * (1.3 - dist / (R0 * 2.8))
            px, py = c + np.cos(a) * dist, c + np.sin(a) * dist
            m = np.maximum(m, (np.hypot(xx - px, yy - py) < rad).astype(float))
            # 连接细丝
            if r.random() < .5:
                t = np.clip(((xx - c) * np.cos(a) + (yy - c) * np.sin(a)) / dist, 0, 1)
                lx, ly = c + np.cos(a) * dist * t, c + np.sin(a) * dist * t
                w = rad * .45 + (1 - t) * R0 * .35
                m = np.maximum(m, (np.hypot(xx - lx, yy - ly) < w).astype(float))
        for i in range(r.integers(4, 9)):
            a = r.uniform(0, 2 * np.pi)
            dist = R0 * r.uniform(1.6, 3.4)
            px, py = c + np.cos(a) * dist, c + np.sin(a) * dist
            m = np.maximum(m, (np.hypot(xx - px, yy - py) < R0 * r.uniform(.05, .12)).astype(float))
        m = ndi.gaussian_filter(m, 2)
        a = m.reshape(cell, f, cell, f).mean(axis=(1, 3))
        alpha = a > .42
        tone = lowfreq(cell, cell, 6, r)
        lv = np.where(a > .85, 0, 1)
        lv[tone > .8] = np.minimum(lv[tone > .8] + 1, 2)
        sheet[:, k * cell:(k + 1) * cell] = to_rgba(alpha, lv, INK)
    return save(sheet, 'fx_poshi_ink')


if __name__ == '__main__':
    make_po()
    make_band()
    make_seal()
    make_seal_s()
    make_ink()
