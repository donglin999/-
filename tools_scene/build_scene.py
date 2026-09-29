#!/usr/bin/env python3
"""程序排布场景：地面程序化铺装 + 单体素材（raw_scene/cut/*.png）按布局摆放 → 底图 / 素材图集 / 精确碰撞 mask / 深度排序表。

用法（仓库根目录）：python3 tools_scene/build_scene.py [street]
输出：
  assets/m_<scene>_v2.webp         底图（源像素 = 世界 1/3，地面 + 投影 + 全部素材已烘焙）
  assets/m_<scene>_v2_props.webp   素材图集（运行时按底边 y 与角色深度排序重画，实现屋檐/树冠遮挡）
  js/story.js 中 // <scene:<id>> … // </scene:<id>> 之间的数据块（gw/gh/mask/props，自动替换，勿手改）
  review/scene_v3/<scene>_layout_dbg.png  调试叠图（绿=可走，红=素材占地，黄线=排序底边，蓝=出口）
  raw_scene/<scene>_anchors.json   布局中命名的锚点（格坐标），供 story.js 摆 NPC / 出口参考

坐标：全部以源像素（map px）标注，世界坐标 = ×3，格 = 世界 / 40。
可走区 = WALK 多边形并集 − 各素材占地（footprint）− BLOCK；占地规则见 place() 的 fp 参数：
  'band:D'   触地列（最低不透明像素距底边 ≤ 6px 的列）的 x 范围 × 底部 D 像素高（建筑/摊位）
  'trunk'    触地列中段的小椭圆（树）
  'rect:x0,y0,x1,y1'  素材局部坐标（0~1 比例）矩形，可多个用 ; 分隔
  'none'     不挡路（地面装饰）
排序：sort 缺省 = 素材底边 y；'flat' = 永远在人物之下（不进运行时表）；数值 = 相对底边的偏移（负数 = 更早被人物盖住，如戏台台面）。
"""
import os, sys, json, re, base64, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
CUT = os.path.join(ROOT, 'raw_scene', 'cut')
K = 3            # 世界像素 / 源像素
TS = 40          # 格
MASK_PX = 8      # mask 每位世界像素

# ───────────── 地面调色（取自旧版明亮街市地图） ─────────────
STONE = [(137, 143, 123), (142, 150, 128), (149, 157, 134), (155, 164, 140), (160, 173, 149)]
MORTAR = (112, 113, 104)
PLAZA = [(150, 150, 132), (158, 157, 138), (165, 163, 143), (171, 170, 150)]
EARTH = [(168, 155, 113), (176, 162, 118), (181, 166, 121), (188, 174, 126)]
EARTH_D = (143, 134, 104)
EARTH_L = (199, 187, 141)
GRASS = [(106, 128, 62), (126, 146, 72), (88, 108, 52)]
MEADOW = [(96, 118, 60), (106, 128, 64), (116, 138, 70), (88, 108, 56)]
WATER = [(84, 112, 112), (92, 122, 120), (100, 131, 127)]
WATER_HI = (150, 176, 164)
HALL = [(118, 112, 100), (124, 118, 105), (112, 107, 96), (130, 123, 109)]   # 殿内方砖（旧庙，偏暗的青灰砖）


def load_cut(name, crop=None):
    im = Image.open(os.path.join(CUT, name + '.png')).convert('RGBA')
    if crop:
        W, H = im.size
        c = [int(v * (W if i % 2 == 0 else H)) if isinstance(v, float) and v <= 1 else int(v) for i, v in enumerate(crop)]
        im = im.crop(c)
        a = np.asarray(im)[..., 3]
        ys, xs = np.nonzero(a)
        im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    return im


def pixelize(im, tw, flip=False, ncol=40, th=None):
    """预乘 alpha 的 BOX 缩小 → 硬 alpha → 每素材调色板量化（无抖动）；th 给定时按目标高度非等比缩放（柱身、吊桥）"""
    W, H = im.size
    th = th or max(1, round(H * tw / W))
    sm = im.convert('RGBa').resize((tw, th), Image.BOX).convert('RGBA')
    a = np.asarray(sm).copy()
    al = a[..., 3] >= 120
    rgb = Image.fromarray(a[..., :3])
    q = rgb.quantize(colors=ncol, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    out = np.dstack([np.asarray(q), (al * 255).astype(np.uint8)])
    img = Image.fromarray(out, 'RGBA')
    if flip: img = img.transpose(Image.FLIP_LEFT_RIGHT)
    return img


def value_noise(w, h, scale, seed):
    rng = np.random.default_rng(seed)
    gw, gh = w // scale + 2, h // scale + 2
    g = rng.random((gh, gw))
    return ndi.zoom(g, scale, order=1)[:h, :w]


FURN_MARGIN = 2   # 源像素（= 6 世界像素）
FURN_PREFIX = ('sheet_props', 'sheet_stalls', 'sheet_alley', 'sheet_river_2', 'sheet_river_3', 'sheet_river_4', 'sheet_river_5', 'sheet_river_6', 'sheet_river_7', 'sheet_war',
               'sheet_temple_3', 'sheet_temple_5', 'sheet_temple_6', 'sheet_temple_7', 'sheet_temple_9', 'sheet_mount_3', 'sheet_mount_4', 'sheet_mount_10', 'sheet_mount_11',
               'sheet_gate_2', 'sheet_gate_5', 'sheet_gate_7', 'sheet_bandit_2', 'sheet_bandit_7', 'sheet_bandit_8', 'sheet_cave_2', 'sheet_cave_3', 'sheet_cave_5',
               'sheet_cave_6', 'sheet_cave_7', 'sheet_cave_10', 'sheet_reed_3', 'sheet_reed_4', 'sheet_reed_5')


def is_furn(name):
    return name.startswith(FURN_PREFIX)


class Scene:
    def __init__(self, sid, w, h, seed=7):
        self.id, self.w, self.h = sid, w, h
        self.rng = random.Random(seed)
        self.ground = np.zeros((h, w, 3), np.uint8)
        self.mat = np.zeros((h, w), np.uint8)          # 0 泥地 1 石板 2 广场大石板
        self.items = []                                 # 摆放的素材
        self.walk = Image.new('L', (w, h), 0)
        self.block = Image.new('L', (w, h), 0)
        self.force = Image.new('L', (w, h), 0)         # 强制可走（在占地之后应用，如门洞）
        self.anchors = {}
        self.exits = []
        self.clear_mat = None                           # 该材质处底图透明（渡船场景：江面由运行时 under() 程序绘制并卷动）

    # ── 地面 ──
    def region(self, poly, mat):
        m = Image.new('L', (self.w, self.h), 0)
        ImageDraw.Draw(m).polygon(poly, fill=255)
        self.mat[np.asarray(m) > 0] = mat

    def rect(self, x0, y0, x1, y1, mat):
        self.region([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], mat)

    def paint_ground(self):
        w, h, R = self.w, self.h, self.rng
        n1 = value_noise(w, h, 9, 1); n2 = value_noise(w, h, 3, 2)
        e = (n1 * .7 + n2 * .3)
        idx = np.clip((e * len(EARTH)).astype(int), 0, len(EARTH) - 1)
        g = np.array(EARTH, np.uint8)[idx]
        rs = np.random.default_rng(3).random((h, w))
        g[rs < .035] = EARTH_D
        g[(rs > .975)] = EARTH_L
        # 小石子
        for _ in range(w * h // 900):
            x, y = R.randrange(w - 3), R.randrange(h - 2)
            g[y, x:x + 2] = (150, 144, 128); g[y + 1, x:x + 2] = (118, 112, 96)
        # 6 土路：更深的夯土色 + 车辙
        rm = self.mat == 6
        ROAD = [(154, 138, 100), (160, 144, 104), (148, 132, 96)]
        ri_ = np.clip((n2 * 3).astype(int), 0, 2)
        g[rm] = np.array(ROAD, np.uint8)[ri_][rm]
        g[rm & (rs < .05)] = (128, 116, 86); g[rm & (rs > .985)] = (178, 164, 122)
        # 3 水面（护城河）：横向波纹；4 草地
        rng4 = np.random.default_rng(4)                # 横向拉长的噪声 → 水面呈水平波带
        wn = ndi.zoom(rng4.random((h // 3 + 2, w // 18 + 2)), (3, 18), order=1)[:h, :w] * .75 + value_noise(w, h, 2, 6) * .25
        wi = np.clip((wn * len(WATER)).astype(int), 0, len(WATER) - 1)
        wm = self.mat == 3
        g[wm] = np.array(WATER, np.uint8)[wi][wm]
        for _ in range(int(wm.sum() / 90)):
            x, y = R.randrange(w - 8), R.randrange(h)
            if wm[y, x]:
                L = R.randrange(3, 8)
                for xx in range(L):
                    if wm[y, x + xx]: g[y, x + xx] = WATER_HI if R.random() < .7 else WATER[2]
        gm = self.mat == 4
        mi = np.clip((e * len(MEADOW)).astype(int), 0, len(MEADOW) - 1)
        g[gm] = np.array(MEADOW, np.uint8)[mi][gm]
        rs2 = np.random.default_rng(5).random((h, w))
        g[gm & (rs2 < .05)] = (72, 92, 46); g[gm & (rs2 > .97)] = (140, 160, 84)
        # 水岸：水面上沿 2px 深色石驳岸
        up = wm & ~np.roll(wm, 2, axis=0)
        g[up] = (96, 98, 90)
        # 7 洞内岩地：灰褐夯土 + 碎石；9 岩体 / 暗处（洞壁外、殿内屋架上方）；10 墙顶（殿内山墙/檐墙的顶面）
        cm = self.mat == 7
        CAVE = [(112, 101, 84), (120, 108, 90), (127, 115, 95), (106, 96, 80)]
        ci = np.clip((e * len(CAVE)).astype(int), 0, len(CAVE) - 1)
        g[cm] = np.array(CAVE, np.uint8)[ci][cm]
        g[cm & (rs < .05)] = (88, 80, 66); g[cm & (rs > .975)] = (146, 134, 110)
        km = self.mat == 9
        ROCK = [(52, 47, 42), (60, 54, 47), (46, 42, 38), (66, 59, 51)]
        ki = np.clip((value_noise(w, h, 5, 8) * len(ROCK)).astype(int), 0, len(ROCK) - 1)
        g[km] = np.array(ROCK, np.uint8)[ki][km]
        g[km & (rs < .04)] = (36, 32, 29)
        # 11 江滩湿泥（东岸芦苇荡）：深褐泥 + 水洼反光 + 零星螺壳
        mm = self.mat == 11
        MUD = [(104, 88, 66), (112, 95, 71), (98, 83, 62), (120, 102, 76)]
        mi_ = np.clip((e * len(MUD)).astype(int), 0, len(MUD) - 1)
        g[mm] = np.array(MUD, np.uint8)[mi_][mm]
        pud = mm & (value_noise(w, h, 7, 11) > .78)
        g[pud] = (126, 136, 128); g[pud & (rs > .6)] = (150, 160, 150)
        g[mm & (rs < .03)] = (78, 66, 50); g[mm & (rs > .985)] = (170, 160, 136)
        tm = self.mat == 10
        g[tm] = (54, 42, 33)
        g[tm & (rs < .06)] = (44, 34, 27); g[tm & (rs > .96)] = (66, 52, 40)
        self.ground = g
        for mat, pal, rh, wr in ((1, STONE, (6, 7), (9, 17)), (2, PLAZA, (9, 10), (13, 22)), (8, HALL, (7, 7), (11, 12))):
            self._slabs(mat, pal, rh, wr)
        # 石板与泥地交界：2px 路缘石
        st = (self.mat == 1) | (self.mat == 2)          # 殿内方砖（8）贴墙，不做路缘
        edge = st & ~ndi.binary_erosion(st, iterations=2)
        self.ground[edge] = (np.asarray(self.ground[edge], np.int16) * .72).astype(np.uint8)
        self.ground[st & ~ndi.binary_erosion(st, iterations=1)] = MORTAR

    def _slabs(self, mat, pal, rh, wr):
        R = self.rng; h, w = self.h, self.w
        m = self.mat == mat
        if not m.any(): return
        y = 0; row = 0
        while y < h:
            hh = rh[row % 2]; x = -R.randrange(wr[1]); row += 1
            while x < w:
                ww = R.randrange(*wr)
                c = np.array(pal[R.randrange(len(pal))], np.int16) + R.randrange(-4, 5)
                y0, y1, x0, x1 = y, min(h, y + hh), max(0, x), min(w, x + ww)
                if x1 > x0:
                    sl = (slice(y0, y1), slice(x0, x1)); mm = m[sl]
                    blk = np.broadcast_to(np.clip(c, 0, 255), (y1 - y0, x1 - x0, 3)).astype(np.uint8).copy()
                    blk[0, :] = np.clip(c + 10, 0, 255)                      # 上沿受光
                    blk[-1, :] = np.clip(c - 16, 0, 255)                     # 下沿阴影
                    blk[:, -1] = MORTAR                                      # 竖缝
                    if y1 - y0 > 1: blk[-1, :] = MORTAR if R.random() < .6 else blk[-1, :]
                    for _ in range(R.randrange(0, 3)):                       # 斑点
                        yy, xx = R.randrange(y1 - y0), R.randrange(x1 - x0)
                        blk[yy, xx] = np.clip(c - 22, 0, 255)
                    if R.random() < .07 and x1 - x0 > 6:                     # 裂纹
                        yy = R.randrange(1, max(2, y1 - y0 - 1))
                        for xx in range(2, x1 - x0 - 2): blk[min(y1 - y0 - 1, yy + (xx // 3) % 2), xx] = np.clip(c - 30, 0, 255)
                    g = self.ground[sl]; g[mm] = blk[mm]
                x += ww
            y += hh
        # 石缝里的小草
        for _ in range(int(m.sum() / 1400)):
            x, y = R.randrange(w), R.randrange(h)
            if m[y, x]: self.ground[y, x] = GRASS[R.randrange(3)]

    def backwall(self, x0, x1, y0):
        """低矮院墙（后墙）：y0 起 3px 黛瓦墙帽 + 6px 白墙 + 1px 墙脚，直接画进地面层（高度低于人物，不需要遮挡排序）"""
        R = self.rng
        for x in range(x0, x1):
            t = x % 4
            self.ground[y0, x] = (58, 66, 80) if t else (40, 46, 58)
            self.ground[y0 + 1, x] = (74, 84, 100) if t != 1 else (52, 60, 74)
            self.ground[y0 + 2, x] = (46, 52, 64)
            for yy in range(y0 + 3, y0 + 9):
                c = (226, 218, 196) if yy < y0 + 8 else (170, 160, 138)
                if R.random() < .04: c = (206, 198, 176)
                self.ground[yy, x] = c
            self.ground[y0 + 9, x] = (120, 112, 92)

    def pier(self, x0, y0, x1, y1, vertical=True):
        """木栈桥（水面高度，画进地面层）：横铺木板 + 两侧边梁 + 露出水面的桩 + 右侧水面阴影；可走区需另行 walk_rect"""
        R = self.rng; g = self.ground
        for y in range(y0, y1 + 1):                   # 右侧阴影
            for x in range(x1 + 1, min(self.w, x1 + 4)):
                if self.mat[y, x] == 3: g[y, x] = (np.asarray(g[y, x], np.int16) * .7).astype(np.uint8)
        for x in range(x0, x1 + 1):
            for y in range(y1 + 1, min(self.h, y1 + 3)):
                if self.mat[y, x] == 3: g[y, x] = (np.asarray(g[y, x], np.int16) * .72).astype(np.uint8)
        PL = [(150, 112, 70), (140, 104, 64), (160, 122, 78), (132, 98, 60)]
        if vertical:
            yy = y0
            while yy <= y1:
                c = np.array(PL[R.randrange(4)], np.int16)
                g[yy:yy + 3, x0:x1 + 1] = np.clip(c, 0, 255)
                g[yy, x0:x1 + 1] = np.clip(c + 14, 0, 255)
                if yy + 3 <= y1: g[yy + 3, x0:x1 + 1] = (72, 52, 34)
                for _ in range(2):                    # 钉子 / 木纹
                    xx = R.randrange(x0 + 2, x1 - 1); g[yy + 1, xx] = np.clip(c - 30, 0, 255)
                yy += 4
            g[y0:y1 + 1, x0:x0 + 2] = (96, 70, 44); g[y0:y1 + 1, x1 - 1:x1 + 1] = (86, 62, 38)
            for py in range(y0 + 6, y1, 22):          # 桩
                for px in (x0 - 2, x1 + 1):
                    g[py:py + 5, px:px + 2] = (70, 50, 32); g[py, px:px + 2] = (110, 84, 56)
        else:
            xx = x0
            while xx <= x1:
                c = np.array(PL[R.randrange(4)], np.int16)
                g[y0:y1 + 1, xx:xx + 3] = np.clip(c, 0, 255)
                g[y0:y1 + 1, xx] = np.clip(c + 14, 0, 255)
                if xx + 3 <= x1: g[y0:y1 + 1, xx + 3] = (72, 52, 34)
                xx += 4
            g[y0:y0 + 2, x0:x1 + 1] = (104, 76, 48); g[y1 - 1:y1 + 1, x0:x1 + 1] = (80, 58, 36)
        self.mat[y0:y1 + 1, x0:x1 + 1] = 5

    def rock_rim(self, inner=7, outer=9, width=3):
        """岩体与地面交界：岩体一侧 width px 由暗到亮的岩脚 + 1px 高光（洞壁、山崖）"""
        a = self.mat == outer; b = self.mat == inner
        for k in range(width, 0, -1):
            ring = a & ndi.binary_dilation(b, iterations=k) & ~ndi.binary_dilation(b, iterations=k - 1)
            self.ground[ring] = (np.array((92, 84, 72)) * (1 - .12 * k)).astype(np.uint8)
        top = b & ndi.binary_dilation(a, iterations=1)
        self.ground[top] = (np.asarray(self.ground[top], np.int16) * .8).astype(np.uint8)

    def tufts(self, n, box=None, near_mask=None):
        R = self.rng; x0, y0, x1, y1 = box or (0, 0, self.w, self.h)
        for _ in range(n):
            x, y = R.randrange(x0, x1 - 4), R.randrange(y0, y1 - 3)
            if self.mat[y, x] != 0: continue
            if near_mask is not None and not near_mask[y, x]: continue
            c = GRASS[R.randrange(3)]
            for dx, dy in ((0, 2), (1, 1), (1, 2), (2, 0), (2, 1), (2, 2), (3, 1), (3, 2), (4, 2)):
                if R.random() < .8: self.ground[y + dy, x + dx] = c if dy else GRASS[1]

    # ── 可走 / 阻挡 ──
    def walk_poly(self, poly): ImageDraw.Draw(self.walk).polygon(poly, fill=255)
    def walk_rect(self, x0, y0, x1, y1): self.walk_poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])
    def force_rect(self, x0, y0, x1, y1): ImageDraw.Draw(self.force).rectangle((x0, y0, x1, y1), fill=255)
    def block_rect(self, x0, y0, x1, y1): ImageDraw.Draw(self.block).rectangle((x0, y0, x1, y1), fill=255)
    def block_poly(self, poly): ImageDraw.Draw(self.block).polygon(poly, fill=255)

    # ── 素材 ──
    def place(self, name, x, base, width, fp='band:0.4', sort=None, crop=None, flip=False, shadow='drop', key=None, cx=False, ncol=40, weather=0, h=None):
        """x：左边（cx=True 时为中心）；base：底边 y（最低不透明像素所在行 +1）；width：目标宽（源像素）；
        weather：0~1 做旧（去饱和 + 压暗 + 偏土黄），用于兵火后的废宅等"""
        im = pixelize(load_cut(name, crop), width, flip, ncol, h)
        if weather:
            a_ = np.asarray(im).astype(np.float32); rgb = a_[..., :3]; gray = rgb.mean(axis=2, keepdims=True)
            rgb = rgb * (1 - weather * .7) + gray * weather * .7
            rgb = rgb * (1 - weather * .22) + np.array([96, 84, 64]) * weather * .22
            a_[..., :3] = np.clip(rgb, 0, 255); im = Image.fromarray(a_.astype(np.uint8), 'RGBA')
        a = np.asarray(im)[..., 3] > 0
        ys, xs = np.nonzero(a)
        im = im.crop((0, 0, im.width, ys.max() + 1)); a = a[:ys.max() + 1]
        H, W = a.shape
        if cx: x = int(round(x - W / 2))
        y = base - H
        it = dict(name=key or name, im=im, x=x, y=y, w=W, h=H, base=base, sort=sort, shadow=shadow)
        # 触地列
        low = np.array([np.nonzero(a[:, c])[0].max() if a[:, c].any() else -1 for c in range(W)])
        ground_cols = np.nonzero(low >= H - 6)[0]
        fpm = Image.new('L', (self.w, self.h), 0); d = ImageDraw.Draw(fpm)
        for spec in fp.split('|'):
            if spec == 'none': continue
            if spec.startswith('band'):
                D = float(spec.split(':')[1]); D = D * H if D <= 1 else D
                if len(ground_cols):
                    # 按连续触地段分别画（两根柱子之间留空）
                    segs = np.split(ground_cols, np.nonzero(np.diff(ground_cols) > 3)[0] + 1)
                    x0s, x1s = ground_cols.min(), ground_cols.max()
                    # 小型家具（桌凳/摊架/货箱/水缸…）：占地向下多留 FURN_MARGIN 像素，角色不会贴着/踩进家具图像（02 §2.4）
                    d.rectangle((x + x0s, base - D, x + x1s, base - 1 + (FURN_MARGIN if is_furn(name) else 0)), fill=255)
            elif spec.startswith('cols'):   # 只挡各触地段（柱子/桌腿），高 D
                D = float(spec.split(':')[1]); D = D * H if D <= 1 else D
                segs = np.split(ground_cols, np.nonzero(np.diff(ground_cols) > 3)[0] + 1)
                for s_ in segs:
                    if len(s_): d.rectangle((x + s_.min() - 1, base - D, x + s_.max() + 1, base - 1), fill=255)
            elif spec == 'solid':   # 每列从素材顶到该列最低不透明像素全部不可走（城墙/门楼/残墙）
                for c in range(W):
                    if low[c] >= 0: d.line((x + c, y, x + c, y + low[c]), fill=255)
            elif spec == 'trunk':
                mid = ground_cols[len(ground_cols) // 2] if len(ground_cols) else W // 2
                tw = max(4, min(10, len(ground_cols)))
                d.ellipse((x + mid - tw / 2 - 1, base - 5, x + mid + tw / 2 + 1, base), fill=255)
            elif spec.startswith('rect'):
                for r in spec[5:].split(';'):
                    x0, y0, x1, y1 = [float(v) for v in r.split(',')]
                    d.rectangle((x + x0 * W, y + y0 * H, x + x1 * W, y + y1 * H), fill=255)
        it['fp'] = np.asarray(fpm) > 0
        self.items.append(it)
        return it

    def anchor(self, name, x, y): self.anchors[name] = [round(x * K / TS, 2), round(y * K / TS, 2)]

    # ── 合成 ──
    def compose(self):
        g = Image.fromarray(self.ground).convert('RGBA')
        dark = np.asarray(g).astype(np.float32)
        sh = np.zeros((self.h, self.w), np.float32)
        for it in self.items:
            if it['shadow'] == 'none': continue
            a = np.asarray(it['im'])[..., 3] > 0
            if it['shadow'] == 'tree':
                low = [c for c in range(it['w']) if a[:, c].any() and np.nonzero(a[:, c])[0].max() >= it['h'] - 6]
                mid = it['x'] + (np.median(low) if low else it['w'] / 2)
                rx, ry = it['w'] * .42, max(4, it['h'] * .1)
                yy, xx = np.ogrid[:self.h, :self.w]
                e = ((xx - mid - 5) / rx) ** 2 + ((yy - it['base'] + 2) / ry) ** 2 < 1
                sh[e] = np.maximum(sh[e], .28)
            else:
                dx, dy = (4, 2) if it['shadow'] == 'drop' else (2, 1)
                m = np.zeros((self.h, self.w), bool)
                ys, xs = np.nonzero(a)
                keep = ys >= it['h'] * .35      # 只让下部投影（屋顶不投到街上太远）
                yy, xx = ys[keep] + it['y'] + dy, xs[keep] + it['x'] + dx
                ok = (yy >= 0) & (yy < self.h) & (xx >= 0) & (xx < self.w)
                m[yy[ok], xx[ok]] = True
                sh[m] = np.maximum(sh[m], .3)
        dark[..., :3] *= (1 - sh[..., None])
        base = Image.fromarray(dark.astype(np.uint8), 'RGBA')
        order = sorted(self.items, key=lambda it: (-1e9 if it['sort'] == 'flat' else it['base'] + (it['sort'] or 0)))
        for it in order:
            base.alpha_composite(it['im'], (it['x'], it['y'])) if it['x'] >= 0 and it['y'] >= 0 else base.paste(it['im'], (it['x'], it['y']), it['im'])
        self.bg = base.convert('RGB')
        # 可走 mask（源像素）
        wm = np.asarray(self.walk) > 0
        for it in self.items: wm &= ~it['fp']
        wm &= ~(np.asarray(self.block) > 0)
        wm |= np.asarray(self.force) > 0
        self.walkmask = wm
        return self.bg

    def atlas(self):
        """运行时深度排序表：非 flat 素材打进图集（货架式排布）"""
        items = [it for it in self.items if it['sort'] != 'flat']
        items_sorted = sorted(items, key=lambda it: -it['h'])
        AW = 1024; x = y = rowh = 0; pos = {}
        for it in items_sorted:
            if x + it['w'] > AW: x = 0; y += rowh + 1; rowh = 0
            pos[id(it)] = (x, y); x += it['w'] + 1; rowh = max(rowh, it['h'])
        at = Image.new('RGBA', (AW, max(1, y + rowh)), (0, 0, 0, 0))
        rows = []
        for it in items:
            ax, ay = pos[id(it)]
            at.paste(it['im'], (ax, ay))
            base = it['base'] + (it['sort'] or 0) if it['sort'] != 'flat' else -1
            rows.append([ax, ay, it['w'], it['h'], it['x'] * K, it['y'] * K, base * K])
        return at, rows

    def mask_bits(self):
        WW, WH = self.w * K, self.h * K
        mw, mh = WW // MASK_PX, WH // MASK_PX
        bits = np.zeros((mh, mw), np.uint8)
        for r in range(mh):
            for c in range(mw):
                x = min(self.w - 1, int((c + .5) * MASK_PX / K)); y = min(self.h - 1, int((r + .5) * MASK_PX / K))
                bits[r, c] = 1 if self.walkmask[y, x] else 0
        b = np.packbits(bits.flatten())
        return mw, mh, base64.b64encode(b.tobytes()).decode()

    def write(self, extra_js=''):
        sid = self.id
        bg = self.compose()
        if self.clear_mat is not None:
            cov = np.zeros((self.h, self.w), bool)
            for it in self.items:
                a_ = np.asarray(it['im'])[..., 3] > 0; y0, x0 = it['y'], it['x']
                ys, xs = np.nonzero(a_); ys, xs = ys + y0, xs + x0; ok_ = (ys >= 0) & (ys < self.h) & (xs >= 0) & (xs < self.w)
                cov[ys[ok_], xs[ok_]] = True
            al = np.where((self.mat == self.clear_mat) & ~cov, 0, 255).astype(np.uint8)
            Image.fromarray(np.dstack([np.asarray(bg), al]), 'RGBA').save(os.path.join(ROOT, 'assets', f'm_{sid}_v2.webp'), lossless=True, quality=100, method=6)
        else:
            bg.save(os.path.join(ROOT, 'assets', f'm_{sid}_v2.webp'), lossless=True, quality=100, method=6)
        at, rows = self.atlas()
        at.save(os.path.join(ROOT, 'assets', f'm_{sid}_v2_props.webp'), lossless=True, quality=100, method=6)
        mw, mh, d = self.mask_bits()
        gw, gh = self.w * K // TS, self.h * K // TS
        assert gw * TS == self.w * K and gh * TS == self.h * K, '地图尺寸需为 40/3 的整数倍（源像素宽高 ×3 能被 40 整除）'
        js = (f"Object.assign(SC.{sid},{{gw:{gw},gh:{gh},bg:'m_{sid}_v2',propImg:'m_{sid}_v2_props',propK:{K},"
              f"mask:{{w:{mw},h:{mh},d:\"{d}\"}},\n  props:{json.dumps(rows, separators=(',', ':'))}}});{extra_js}")
        p = os.path.join(ROOT, 'js', 'story.js'); s = open(p, encoding='utf-8').read()
        a, b = f'// <scene:{sid}>', f'// </scene:{sid}>'
        blk = f'{a} 由 tools_scene/build_scene.py 生成，勿手改\n{js}\n{b}'
        if a in s: s = re.sub(re.escape(a) + r'.*?' + re.escape(b), lambda m: blk, s, flags=re.S)
        else: s = s.rstrip('\n') + '\n\n' + blk + '\n'
        open(p, 'w', encoding='utf-8').write(s)
        json.dump(self.anchors, open(os.path.join(ROOT, 'raw_scene', f'{sid}_anchors.json'), 'w'), ensure_ascii=False, indent=1)
        # 调试叠图 ×2
        dbg = bg.convert('RGBA').resize((self.w * 2, self.h * 2), Image.NEAREST)
        ov = np.zeros((self.h, self.w, 4), np.uint8)
        ov[self.walkmask] = (40, 230, 90, 90)
        for it in self.items: ov[it['fp']] = (255, 40, 40, 110)
        ovi = Image.fromarray(ov, 'RGBA').resize((self.w * 2, self.h * 2), Image.NEAREST)
        dbg.alpha_composite(ovi); dd = ImageDraw.Draw(dbg)
        for it in self.items:
            if it['sort'] == 'flat': continue
            yb = (it['base'] + (it['sort'] or 0)) * 2
            dd.line((it['x'] * 2, yb, (it['x'] + it['w']) * 2, yb), fill=(255, 230, 0, 255), width=1)
        for n, (c, r) in self.anchors.items():
            X, Y = c * TS / K * 2, r * TS / K * 2
            dd.ellipse((X - 4, Y - 4, X + 4, Y + 4), fill=(0, 255, 255, 255)); dd.text((X + 6, Y - 6), n, fill=(255, 255, 255, 255))
        for (c0, r0, c1, r1) in self.exits:
            dd.rectangle((c0 * TS / K * 2, r0 * TS / K * 2, (c1 + 1) * TS / K * 2, (r1 + 1) * TS / K * 2), outline=(60, 140, 255, 255), width=2)
        # 格线（每 5 格）
        for c in range(0, gw + 1, 5): dd.line((c * TS / K * 2, 0, c * TS / K * 2, 6), fill=(255, 255, 255, 255)); dd.text((c * TS / K * 2 + 2, 8), str(c), fill=(255, 255, 255, 255))
        for r in range(0, gh + 1, 5): dd.line((0, r * TS / K * 2, 6, r * TS / K * 2), fill=(255, 255, 255, 255)); dd.text((8, r * TS / K * 2 + 2), str(r), fill=(255, 255, 255, 255))
        os.makedirs(os.path.join(ROOT, 'review', 'scene_v3'), exist_ok=True)
        dbg.convert('RGB').save(os.path.join(ROOT, 'review', 'scene_v3', f'{sid}_layout_dbg.png'))
        print(sid, f'{self.w}x{self.h} → world {self.w*K}x{self.h*K} ({gw}x{gh} 格)', 'props', len(rows), 'atlas', at.size, 'mask', mw, mh, 'walk%', round(self.walkmask.mean() * 100, 1))


# ═════════════════════════════ 襄阳城 · 街市 ═════════════════════════════
def street():
    S = Scene('street', 880, 520, seed=11)
    # ── 地面材质 ──
    S.rect(0, 0, 880, 40, 4)                      # 城外草岸
    S.rect(0, 40, 880, 100, 3)                    # 护城河
    S.rect(292, 150, 588, 300, 2)                 # 城门内广场（大石板）
    S.rect(0, 296, 880, 344, 1)                   # 东西大街
    S.rect(418, 120, 460, 176, 2)                 # 门洞
    S.rect(266, 344, 334, 520, 1)                 # 南巷（西）＝ 南大街北段：一直通到图外南门（docs/design/02 §4.2）
    S.rect(690, 344, 744, 488, 1)                 # 南巷（东）
    S.paint_ground()
    S.backwall(0, 268, 345); S.backwall(332, 692, 345); S.backwall(742, 880, 345)   # 大街南沿：南排房屋的后院墙
    # ── 城墙 + 城门楼（北侧） ──
    GT_W = 376
    gt = S.place('gate_tower', 440, 198, GT_W, cx=True, fp='solid', shadow='none', ncol=48)
    sc_ = GT_W / 1672
    # 两侧城墙：截取门楼图左/右端平直墙段（不含马道）交替镜像平铺到地图边缘；底边与门楼图中该段墙脚对齐
    full = np.asarray(load_cut('gate_tower'))[..., 3] > 0
    def seg_bottom(c0, c1): return max(np.nonzero(full[:, c])[0].max() for c in range(c0, c1))
    segw = int(round(GT_W * .158))
    wall_base = gt['y'] + int(round((seg_bottom(0, 250) + 1) * sc_))
    xL = gt['x']; i = 0
    while xL > 0:
        xL -= segw - 1
        S.place('gate_tower', xL, wall_base, segw, crop=(0, 0, .158, 1.0), flip=(i % 2 == 1), fp='solid', shadow='none', key='wall_l%d' % i); i += 1
    xR = gt['x'] + gt['w'] - 1; i = 0
    while xR < S.w:
        S.place('gate_tower', xR, wall_base, segw, crop=(.842, 0, 1.0, 1.0), flip=(i % 2 == 1), fp='solid', shadow='none', key='wall_r%d' % i); xR += segw - 1; i += 1
    gy = wall_base
    arch = (gt['x'] + int(GT_W * 760 / 1672), gt['x'] + int(GT_W * 912 / 1672))
    arch_b = gt['y'] + int(round((seg_bottom(760, 912) + 1) * sc_))
    S.gate = dict(arch=arch, gy=gy, arch_b=arch_b, base=gt['base'])
    # 排序底边取门楼正面墙脚 gy，而不是两侧马道的坡脚（base=198）：否则站在门洞前的人被整座门楼盖住（"被吞"）
    gt['sort'] = gy - gt['base']
    print('gate', S.gate, 'gt', gt['x'], gt['y'], gt['w'], gt['h'])
    # ── 可走区 ──
    S.walk_rect(300, gy - 2, 580, 300)            # 广场（门楼/马道占地由 solid 规则按列扣除）
    S.block_rect(arch[0] - 2, 0, arch[1] + 2, gy + 4)   # 门洞口封住（不让人站进拱券里）
    # 北门门洞不再可走：北门外即汉水码头，本章不开放（02 §4.2）；门洞由 solid 占地封住，两侧拒马 + 军士把守
    S.walk_rect(142, 262, 300, 300)               # 书场（戏台前）
    S.walk_rect(6, 298, 880, 342)                 # 东西大街（东端出口）
    S.walk_rect(268, 342, 332, 488)               # 南巷西
    S.walk_rect(692, 342, 742, 488)               # 南巷东
    S.walk_rect(8, 486, 872, 513)                 # 后街（南排店铺面朝的街）
    S.walk_rect(268, 486, 332, 520)               # 南大街出图（→ 南门）
    for tx, tb, tk, tw in ((40, 44, 'sheet_trees_2', 40), (150, 42, 'sheet_trees_1', 56), (700, 43, 'sheet_trees_2', 40), (820, 44, 'sheet_trees_1', 52), (610, 40, 'sheet_trees_5', 26), (230, 40, 'sheet_trees_5', 26)):
        S.place(tk, tx, tb, tw, cx=True, fp='none', shadow='tree', sort='flat')
    # 当铺屋后露出的树冠
    S.place('sheet_trees_1', 812, 214, 60, cx=True, fp='none', shadow='none', sort='flat')
    S.place('sheet_trees_4', 752, 212, 24, cx=True, fp='none', shadow='none', sort='flat')
    # 大街南沿院墙后的后院（不可达，只做填充；高度都低于院墙以北的街面，不会挡住街上的人）
    for k, x, bb, w_ in (('sheet_trees_5', 40, 374, 24), ('sheet_props_9', 96, 374, 22), ('sheet_props_1', 206, 372, 16), ('sheet_props_10', 236, 374, 22),
                         ('sheet_props_3', 356, 368, 22), ('sheet_trees_5', 578, 374, 22), ('sheet_props_2', 606, 372, 18), ('sheet_props_10', 650, 374, 22),
                         ('sheet_trees_5', 772, 374, 24), ('sheet_props_1', 816, 372, 16), ('sheet_props_9', 850, 374, 22)):
        S.place(k, x, bb, w_, cx=True, fp='none', shadow='small')
    S.tufts(90, (0, 356, S.w, 380))
    # 南侧后巷
    # ── 广场西：说书场（戏台 + 条凳）；东：摊贩 ──
    st = S.place('storystage', 150, 262, 116, crop=(0, 0, 1.0, .762), fp='band:0.52', sort=-24, shadow='drop')
    # 广场西侧：茶棚（柳三娘）
    th = S.place('teahouse', 302, 268, 104, fp='rect:0,0,1,1.03', shadow='drop')   # 整个亭子（含屋后）不可走，底边外留 3px：人不贴着桌凳站
    # 条凳（书场听众席，在大街北沿与戏台之间）
    for bx, by in ((160, 290), (216, 290)):
        S.place('storystage', bx, by, 44, crop=(0, .762, .48, .885), fp='rect:0,0.1,1,1.12', shadow='small', key='bench')
    # 广场东：菜摊 / 果摊（紧贴马道外侧）
    S.place('sheet_stalls_0', 530, 240, 50, fp='rect:0,0,1,1', shadow='drop')
    S.block_rect(520, 174, 590, 200)              # 右马道与菜摊之间的死角
    S.block_rect(466, 174, 600, 213)              # 东侧拒马—榜文—马道围出的死角
    S.block_rect(493, 226, 502, 266)              # 货担与井之间的窄缝
    S.block_rect(526, 236, 582, 262)              # 两个菜果摊之间的夹缝
    S.block_rect(575, 262, 594, 294)              # 果摊与马道/铁匠铺之间的夹缝
    S.place('sheet_stalls_1', 528, 290, 48, fp='rect:0,0.3,1,1.05', shadow='drop')
    # ── 大街北侧建筑（面朝大街，底边 298） ──
    S.place('medicine', 8, 298, 132, fp='band:0.5')
    # 说书场与药铺之间留出戏台：戏台放在药铺东侧
    S.place('smithy', 594, 298, 134, fp='band:0.5')
    S.place('pawnshop', 736, 298, 136, fp='band:0.5')
    # ── 大街南侧建筑（面朝南侧后巷，底边 486） ──
    S.place('cloth_shop', 4, 486, 136, fp='band:0.55')
    S.place('shop_a', 146, 486, 116, fp='band:0.55')
    S.place('inn', 338, 486, 214, fp='band:0.55')
    S.place('shop_b', 556, 486, 130, fp='band:0.55')
    S.place('residence', 748, 486, 128, fp='band:0.55')
    # ── 牌坊（广场南口，跨在大街北沿上） ──
    # （牌坊素材 paifang 已生成，广场里会挡住剧情站位，暂不摆放）
    # ── 树 / 杂物 ──
    S.place('sheet_trees_0', 286, 200, 60, cx=True, fp='trunk', shadow='tree')      # 门内西侧垂柳
    S.place('sheet_trees_2', 596, 200, 44, cx=True, fp='trunk', shadow='tree')      # 门内东侧小树
    S.place('sheet_props_0', 515, 262, 30, cx=True, fp='rect:0,0.35,1,1.06', shadow='drop')   # 公井：茶摊与菜摊取水
    S.place('sheet_war_5', 458, 252, 36, fp='rect:0.05,0.2,0.95,1', shadow='small', key='porter_pole')   # 老周撂下的货担（码头挑夫）
    S.place('sheet_war_4', 512, 206, 26, cx=True, fp='rect:0,0.7,1,1', shadow='small', key='notice')    # 城门榜文：严查细作
    S.place('sheet_war_1', 398, 214, 30, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='juma_w')    # 北门两侧拒马，中间留盘查通道
    S.place('sheet_war_1', 482, 214, 30, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='juma_e', flip=True)
    S.place('sheet_props_8', 312, 214, 11, cx=True, fp='band:0.2', shadow='small')  # 灯笼柱
    S.place('sheet_props_8', 568, 214, 11, cx=True, fp='band:0.2', shadow='small')
    S.place('sheet_props_7', 404, 196, 17, cx=True, fp='band:0.5', shadow='small')  # 石狮
    S.place('sheet_props_7', 476, 196, 17, cx=True, fp='band:0.5', shadow='small', flip=True)
    S.place('sheet_props_2', 734, 306, 20, fp='band:0.6', shadow='small')           # 当铺前酒桶
    S.place('sheet_props_3', 574, 304, 24, fp='band:0.6', shadow='small')           # 铁匠铺旁货箱
    # 大街西端：城防营征用的修城料场（砖垛 + 木料 + 拒马封路）——战前修城，西段暂不通行（02 §4.2）
    S.place('sheet_war_2', 4, 322, 30, fp='rect:0,0.3,1,1', shadow='small')         # 砖垛
    S.place('sheet_war_3', 2, 342, 40, fp='rect:0,0.3,1,1', shadow='small')         # 木料
    S.place('sheet_war_0', 36, 344, 40, fp='rect:0,0.35,1,1', shadow='small')       # 拒马
    # 城外草岸上的树（远景，不可达）
    for tx, tb, tk, tw in ((40, 44, 'sheet_trees_2', 40), (150, 42, 'sheet_trees_1', 56), (700, 43, 'sheet_trees_2', 40), (820, 44, 'sheet_trees_1', 52), (610, 40, 'sheet_trees_5', 26), (230, 40, 'sheet_trees_5', 26)):
        S.place(tk, tx, tb, tw, cx=True, fp='none', shadow='tree', sort='flat')
    # 当铺屋后露出的树冠
    S.place('sheet_trees_1', 812, 214, 60, cx=True, fp='none', shadow='none', sort='flat')
    S.place('sheet_trees_4', 752, 212, 24, cx=True, fp='none', shadow='none', sort='flat')
    # 南侧后巷
    S.place('sheet_trees_3', 236, 514, 44, cx=True, fp='trunk', shadow='tree')      # 桃树（后街西段人家门前）
    S.place('sheet_stalls_3', 610, 512, 50, fp='band:0.45', shadow='drop')          # 包子摊
    S.place('sheet_stalls_5', 170, 512, 52, fp='band:0.45', shadow='drop')          # 陶器摊
    S.place('sheet_props_1', 716, 506, 18, cx=True, fp='band:0.6', shadow='small')   # 水缸
    S.place('sheet_props_10', 84, 512, 26, fp='band:0.6', shadow='small')           # 竹筐
    S.place('sheet_trees_4', 862, 514, 26, cx=True, fp='trunk', shadow='tree')      # 竹
    S.place('sheet_trees_5', 18, 514, 26, cx=True, fp='band:0.6', shadow='tree')    # 灌木
    # 草丛：墙脚 / 建筑脚
    S.tufts(160, (0, gy - 4, S.w, gy + 14))
    S.tufts(120, (0, 480, S.w, 520))
    S.tufts(60, (266, 340, 334, 490)); S.tufts(40, (690, 340, 744, 490))
    # ── 锚点 ──
    S.exits = [(20, 38, 24, 38), (65, 22, 65, 25)]
    for n, (x, y) in dict(start=(300, 496), north_gate=(440, 212), zhou=(452, 238), suzhi=(430, 236), lady=(414, 262), liu=(372, 281), thug1=(350, 283),
                          oldman=(208, 267), smith=(662, 305), gossip=(820, 318), alley_in=(856, 320)).items(): S.anchor(n, x, y)
    return S


# ═════════════════════════════ 襄阳城 · 偏巷 ═════════════════════════════
def alley():
    """偏巷：西口—公井—巷尾一条主巷；南侧仅柴角、鸡场、土地龛三个有用途的短支区。
    功能和剧情位置见 docs/design/xiangyang-alley.md。沿用现有单体，不复用无剧情依据的废宅。"""
    S = Scene('alley', 800, 440, seed=23)
    S.rect(0, 244, 800, 312, 1)                   # 连续主巷，西口直达巷尾
    S.rect(280, 180, 450, 244, 2)                 # 公井与大黄所在的北侧小场
    S.rect(548, 192, 760, 244, 1)                 # 吴长老歇脚处
    S.rect(18, 312, 222, 402, 6)                  # 柴角／说书匣泼皮
    S.rect(352, 312, 574, 404, 6)                 # 围栏鸡场
    S.rect(646, 312, 774, 394, 6)                 # 小土地龛的藏银支角
    S.paint_ground()
    # 北侧仅保留有住户的院落。屋檐沿同一条立面排列，不另造北巷或废宅纵深。
    for i, (kind, x, width) in enumerate((('hut', 20, 118), ('residence', 156, 130), ('hut_b', 474, 115), ('residence', 624, 132))):
        S.place(kind, x, 222, width, fp='band:0.58', key='home%d' % i)
    S.place('sheet_trees_2', 748, 218, 43, cx=True, fp='trunk', shadow='tree', key='east_tree')
    # 公井：取水、街坊闲话、大黄避风；只摆能说明这些行动的物件。
    S.place('sheet_props_0', 331, 221, 34, cx=True, fp='band:0.5', shadow='drop', key='well')
    S.place('sheet_props_6', 286, 234, 26, fp='rect:0,0.1,1,1.06', shadow='small', key='well_bench')
    S.place('sheet_props_1', 404, 221, 15, cx=True, fp='band:0.6', shadow='small', key='dog_water')
    # 吴长老所在的檐下只留坐凳，不用官宅门楼替他讲身世。
    S.place('sheet_props_6', 584, 240, 27, fp='cols:4', shadow='small', key='beggar_bench')
    # 南侧三个短支区：柴角藏挖点和泼皮，鸡场可挑战，土地龛承接消息铺藏银。
    S.place('sheet_alley_1', 36, 373, 50, fp='band:0.55', shadow='drop', key='woodpile')
    S.place('sheet_alley_4', 136, 378, 56, fp='cols:5', shadow='small', key='drying_rack')
    S.place('sheet_alley_9', 91, 391, 32, fp='none', sort='flat', shadow='none', key='drying_mat')
    for i, x in enumerate((360, 400, 500, 540)):
        S.place('sheet_alley_6', x, 329, 39, fp='band:0.8', shadow='small', key='fence%d' % i)
    S.place('sheet_alley_0', 520, 391, 48, fp='band:0.6', shadow='drop', key='coop')
    S.place('sheet_props_10', 371, 390, 21, fp='band:0.6', shadow='small', key='chicken_feed')
    S.place('sheet_alley_2', 718, 362, 35, cx=True, fp='rect:0,0.3,1,1.05', shadow='drop', key='shrine')
    S.place('sheet_alley_8', 680, 372, 12, cx=True, fp='band:0.6', shadow='small', key='incense_jar')
    for a, b in ((0, 18), (222, 352), (574, 646), (774, 800)):
        S.backwall(a, b, 401)
    # 可走区按功能开放，背景房屋与南侧空地都不能任意穿行。
    S.walk_rect(0, 246, 792, 310)
    S.walk_rect(280, 192, 450, 247)
    S.walk_rect(548, 203, 760, 247)
    S.walk_rect(18, 310, 222, 401)
    S.walk_rect(352, 310, 574, 402)
    S.walk_rect(646, 310, 774, 393)
    S.tufts(110, (0, 65, 800, 150)); S.tufts(75, (0, 320, 800, 405))
    S.exits = [(0, 19, 0, 22)]
    for n, (x_, y_) in dict(arrive=(18, 272), well=(331, 233), dog=(404, 237), water_neighbor=(280, 235),
                             beggar=(648, 237), wood_corner=(180, 354), dig=(93, 383),
                             rooster=(456, 370), shrine=(718, 377), cache=(704, 379)).items(): S.anchor(n, x_, y_)
    return S


BOAT_W = 260      # 渡船源像素宽（主角 31 源像素高 → 船长约 8.4 个人高 ≈ 14 米；三个场景一致）

# ═════════════════════════════ 东津渡 · 西岸码头 ═════════════════════════════
def ferry():
    """60×33 格（800×440）：北半为江面（远岸草滩），近岸石砌码头 + 两条木栈桥（西桥泊乌篷船、东桥泊货船）；
    岸上：渡口草屋（西）、茶棚（中）、货栈（东）；西口土路接大地图；南沿芦苇灌木收边"""
    S = Scene('ferry', 800, 440, seed=31)
    S.rect(0, 0, 800, 22, 4)                      # 远岸草滩
    S.rect(0, 22, 800, 206, 3)                    # 江面
    S.rect(200, 206, 620, 248, 1)                 # 码头石板
    S.region([(0, 312), (120, 300), (260, 280), (380, 262), (420, 248), (470, 248), (440, 272), (300, 300), (140, 330), (0, 352)], 6)   # 西口土路 → 码头
    S.paint_ground()
    # 近岸驳岸：江面下沿 3px 石条
    for x in range(S.w):
        for y in range(203, 208):
            S.ground[y, x] = (118, 116, 104) if (x // 7 + y) % 3 else (92, 92, 84)
        S.ground[208, x] = (150, 146, 128)
    S.pier(252, 70, 284, 206)                     # 西栈桥
    S.pier(212, 56, 316, 78, vertical=False)      # 西桥 T 头
    S.pier(528, 96, 558, 206)                     # 东栈桥
    # 船（水面，不参与遮挡）
    # 渡船（汤老舵的船，西桥 T 头西侧，船头朝东靠着 T 头）：与渡船场景 crossing、东岸 ferry_e 同一条船、同一宽度 BOAT_W（02 §4.5）
    S.place('ferry_boat', 214 - BOAT_W, 100, BOAT_W, fp='none', shadow='none', sort='flat')
    S.place('junk', 562, 170, 120, fp='none', shadow='none', sort='flat')            # 货船（东桥东侧）
    # 远岸
    for tx, tk, tw in ((60, 'sheet_river_9', 44), (200, 'sheet_river_0', 30), (380, 'sheet_trees_2', 36), (470, 'sheet_river_1', 20), (650, 'sheet_river_9', 40), (760, 'sheet_river_0', 30)):
        S.place(tk, tx, 24, tw, cx=True, fp='none', shadow='none', sort='flat')
    # ── 岸上建筑 ──
    S.place('hut', 28, 306, 100, fp='rect:0,0,1,1')                                   # 渡口草屋（紧贴江岸，整块不可走，免得钻到屋后）
    S.place('teahouse', 330, 336, 100, fp='rect:0,0,1,1')                             # 路边茶棚
    S.place('shop_b', 652, 306, 136, fp='rect:0,0,1,1')                                # 货栈
    # 码头杂物
    S.place('sheet_river_4', 610, 240, 34, fp='band:0.6', shadow='small')              # 麻袋
    S.place('sheet_river_5', 580, 262, 30, fp='band:0.6', shadow='small')              # 货箱
    S.place('sheet_props_3', 212, 244, 26, fp='band:0.6', shadow='small')              # 木箱
    S.place('sheet_river_2', 244, 216, 10, cx=True, fp='band:0.4', shadow='small')     # 系船桩
    S.place('sheet_river_2', 566, 216, 10, cx=True, fp='band:0.4', shadow='small')
    S.place('sheet_river_8', 300, 214, 14, cx=True, fp='band:0.15', shadow='small')    # 渡口旗杆
    S.place('sheet_river_3', 150, 262, 44, fp='cols:5', shadow='small')                # 晒网架
    S.place('sheet_river_7', 470, 262, 40, fp='band:0.6', shadow='small')              # 倒扣小船
    S.place('sheet_river_6', 196, 268, 16, fp='band:0.6', shadow='small')              # 缆绳
    # 岸边 / 南沿植物
    S.place('sheet_river_9', 180, 218, 44, cx=True, fp='trunk', shadow='tree')         # 岸边垂柳
    S.place('sheet_trees_0', 640, 214, 56, cx=True, fp='trunk', shadow='tree')
    S.place('sheet_river_0', 12, 222, 30, cx=True, fp='band:0.5', shadow='none')
    S.place('sheet_river_1', 118, 214, 22, cx=True, fp='band:0.5', shadow='none')
    S.place('sheet_river_0', 700, 212, 28, cx=True, fp='band:0.5', shadow='none')
    x = 0
    for i, (k, w_) in enumerate([('sheet_river_0', 34), ('sheet_trees_5', 30), ('sheet_river_1', 22), ('sheet_trees_5', 28), ('sheet_river_0', 30)] * 6):
        S.place(k, x + 12, 438, w_, cx=True, fp='none', shadow='none', key='south%d' % i); x += 28
        if x > S.w: break
    S.place('sheet_trees_1', 560, 420, 60, cx=True, fp='trunk', shadow='tree')
    S.place('sheet_props_4', 520, 350, 40, fp='band:0.5', shadow='small')             # 板车
    S.place('sheet_props_9', 610, 372, 26, fp='band:0.6', shadow='small')             # 草垛
    S.place('sheet_props_9', 640, 380, 22, fp='band:0.6', shadow='small', key='hay2')
    S.place('sheet_river_0', 150, 392, 30, cx=True, fp='band:0.5', shadow='none', key='reed_s1')
    S.place('sheet_river_1', 176, 396, 22, cx=True, fp='band:0.5', shadow='none', key='reed_s2')
    S.place('sheet_trees_5', 740, 360, 28, cx=True, fp='band:0.6', shadow='tree')
    S.place('sheet_props_11', 96, 330, 8, cx=True, fp='band:0.3', shadow='small')      # 拴马石
    S.place('sheet_trees_2', 250, 424, 44, cx=True, fp='trunk', shadow='tree')
    # ── 可走区 ──
    S.walk_rect(6, 210, 794, 404)                 # 岸上
    S.walk_rect(0, 306, 6, 360)                   # 西口
    S.walk_rect(255, 66, 281, 210)                # 西栈桥
    S.walk_rect(215, 59, 313, 76)                 # 西桥 T 头
    S.walk_rect(531, 99, 555, 210)                # 东栈桥
    S.tufts(220, (0, 250, S.w, 410))
    S.exits = [(0, 23, 0, 26)]
    for n, (x_, y_) in dict(arrive=(22, 334), boatman=(262, 70), bandits=(282, 226), porter1=(650, 316), porter2=(676, 316)).items(): S.anchor(n, x_, y_)
    return S



# ═════════════════════════════ S1（2026-09）：旧 5 图按 v2 管线重建 ═════════════════════════════
# 布局与每件东西的理由见 docs/design/02 §4.1 / §4.1b / §4.3 / §4.6 / §4.7；素材见 gen_props.py「S1」段。
# 夜景 / 洞内由运行时 dark + lights 实现（素材与底图一律白昼光，10 §2），底图只做地面材质与投影。

def pillar(S, x, base, top, w=18, key='pillar', shadow='small'):
    """殿柱：柱础（原图下 20%）等比缩放 + 柱身（原图上 80%）按目标高度拉伸，保证柱子从柱础一直顶到梁架；
    两段共用柱础底边排序（人走到柱础以北即被柱身遮住）"""
    b = S.place('sheet_temple_0', x, base, w, cx=True, crop=(0, .8, 1.0, 1.0), fp='rect:0.1,0.3,0.9,1', shadow=shadow, key=key + '_b')
    sb = b['y'] + 3
    S.place('sheet_temple_0', x, sb, max(6, round(w * .7)), cx=True, crop=(0, .02, 1.0, .82), h=sb - top, fp='none', shadow='none', sort=base - sb, key=key + '_s')


def temple():
    """羊太傅庙 · 正殿内（48×27 格 = 640×360）：序章起点，夜，篝火。坐北朝南：北墙神龛羊祜像为视觉焦点，
    殿中篝火（僧人与孤儿生火取暖、夜景光源），南墙正中庙门（出庙向南）。尾声站位预留：老僧 (26.5,19.5) 篝火东、苏芷 (20.5,19.8) 篝火西。"""
    S = Scene('temple', 640, 360, seed=41)
    S.rect(0, 0, 640, 124, 9)                     # 后墙之上：梁架暗处
    S.rect(34, 118, 606, 338, 8)                  # 殿内方砖地
    S.rect(0, 0, 34, 360, 10); S.rect(606, 0, 640, 360, 10)   # 东西山墙（墙顶）
    S.rect(0, 336, 640, 360, 10)                  # 南檐墙（墙顶）
    S.rect(294, 336, 346, 360, 8)                 # 庙门门道
    S.paint_ground()
    # 墙顶内沿 2px 亮边（墙厚）+ 门道两侧门框
    g = S.ground
    g[118:338, 32:34] = (92, 74, 56); g[118:338, 606:608] = (92, 74, 56); g[334:336, 34:294] = (92, 74, 56); g[334:336, 346:606] = (92, 74, 56)
    g[336:360, 290:294] = (120, 86, 60); g[336:360, 346:350] = (120, 86, 60)
    g[354:356, 294:346] = (150, 140, 120)        # 门槛石
    # ── 北墙（殿内后墙：木构 + 剥落的粉墙 + 破棂窗），两段交替镜像拼满 ──
    S.place('temple_wall', 34, 122, 286, fp='solid', shadow='none', key='wall_w')
    S.place('temple_wall', 320, 122, 286, fp='solid', shadow='none', flip=True, key='wall_e')
    # ── 神龛 + 羊祜坐像 + 供桌（视觉焦点，正殿格局：坐北朝南居中） ──
    S.place('temple_shrine', 320, 172, 150, cx=True, fp='rect:0.08,0.5,0.92,1.02', shadow='drop', ncol=48)
    S.place('sheet_temple_4', 305, 190, 20, cx=True, fp='none', sort='flat', shadow='none', key='cushion_w')   # 拜垫
    S.place('sheet_temple_4', 335, 190, 20, cx=True, fp='none', sort='flat', shadow='none', key='cushion_e')
    S.place('sheet_temple_9', 220, 176, 24, cx=True, fp='rect:0,0.5,1,1.02', shadow='small', key='ding')     # 铜香鼎（神龛西侧）
    # ── 殿柱：内两根（金柱，夹着神龛）+ 前两根（檐柱，框住殿中空地），人绕到柱后被遮挡 ──
    pillar(S, 168, 184, 30, 18, 'pillar_nw'); pillar(S, 472, 184, 30, 18, 'pillar_ne')
    pillar(S, 104, 290, 0, 22, 'pillar_sw'); pillar(S, 536, 290, 0, 22, 'pillar_se')
    # ── 殿中篝火（带吊锅三脚架）：破庙无灯，生火取暖、煮粥；夜景主光源 ──
    S.place('sheet_temple_1', 320, 262, 46, cx=True, fp='rect:0.08,0.64,0.92,1.03', shadow='none', key='campfire')
    # 篝火西：主角的草席铺盖（孤儿/小乞/放羊娃都睡在火边）
    S.place('sheet_temple_2', 192, 264, 58, fp='none', sort='flat', shadow='none', key='bedroll')
    # 篝火东：老僧打坐的蒲团（尾声老僧坐在这里）
    S.place('sheet_temple_4', 353, 272, 22, cx=True, fp='none', sort='flat', shadow='none', key='cushion_monk')
    # ── 东侧：老僧的起居角——矮几（油灯、茶壶）、旧木箱（压着几卷旧书；消息"老和尚夜里点灯看一卷旧东西"，01 §5.3 #23） ──
    S.place('sheet_temple_3', 434, 224, 38, fp='rect:0,0.35,1,1', shadow='small', key='lamp_table')
    S.place('sheet_temple_5', 480, 222, 34, fp='rect:0,0.3,1,1', shadow='small', key='monk_chest')
    S.place('sheet_temple_7', 578, 262, 28, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='water_jar')    # 水缸（庙外古井挑来的水）
    # ── 西侧：柴垛（烧火用）；东北角：屋顶漏洞下掉落的碎瓦断椽（破庙，月光从这里漏进来） ──
    S.place('sheet_temple_6', 44, 252, 38, fp='rect:0,0.3,1,1', shadow='small', key='firewood')
    S.place('sheet_temple_6', 58, 226, 30, fp='rect:0,0.3,1,1', shadow='small', key='firewood2', flip=True)
    S.place('sheet_temple_8', 526, 172, 60, fp='rect:0.05,0.35,0.95,1', shadow='small', key='rubble')
    # ── 可走区 ──
    S.walk_rect(36, 124, 604, 334)
    S.walk_rect(296, 330, 344, 360)               # 庙门门道（出口）
    S.exits = [(22, 25, 25, 26)]
    for n, (x, y) in dict(start=(230, 257), altar=(320, 184), fire=(320, 268), door_in=(320, 320), monk_end=(353, 260), suzhi_end=(273, 264),
                          chest=(494, 228), moon=(556, 178)).items(): S.anchor(n, x, y)
    return S


def temple_out():
    """羊太傅庙外空地（54×30 格 = 720×400）：岘山北麓，夜。上方正中庙门（台阶 = 回庙出口），庙前小石坪 + 石香炉；
    西侧古井 + 菜畦（井水浇菜），东侧老僧煎药的药炉 + 晾药架（老僧在此等你、教学战）；石径从庙前向下出图（下山 · 大地图）；
    西南荒草里半截断碑（岘山堕泪碑的传说，支线"断碑"）；四周松柏、山石收边。"""
    S = Scene('temple_out', 720, 400, seed=43)
    S.rect(0, 0, 720, 400, 4)                                             # 山坡草地
    S.region([(150, 150), (570, 150), (610, 300), (110, 300)], 0)        # 庙前空地（夯土）
    S.rect(292, 168, 428, 208, 2)                                        # 庙前小石坪
    S.region([(338, 206), (382, 206), (388, 290), (378, 340), (390, 400), (346, 400), (334, 340), (340, 290)], 1)   # 下山石径
    S.paint_ground()
    # ── 远景：庙后山坡松林（不可达） ──
    for i, (tx, tb, tk, tw) in enumerate(((30, 60, 'sheet_mount_0', 80), (110, 46, 'sheet_bandit_5', 40), (180, 56, 'sheet_mount_1', 26), (230, 40, 'sheet_mount_0', 70),
                                          (500, 40, 'sheet_mount_0', 70), (560, 54, 'sheet_mount_1', 26), (620, 46, 'sheet_bandit_5', 40), (690, 62, 'sheet_mount_0', 80),
                                          (300, 20, 'sheet_bandit_5', 34), (420, 22, 'sheet_bandit_5', 34), (360, 12, 'sheet_mount_1', 22))):
        S.place(tk, tx, tb, tw, cx=True, fp='none', shadow='none', sort='flat', key='far%d' % i)
    S.tufts(160, (0, 0, S.w, 150))
    # ── 庙（正殿外观）：坐北朝南，台阶正中；排序线取门槛（台阶上的人画在庙前面，不被"吞"） ──
    hall = S.place('temple_hall', 360, 172, 194, cx=True, fp='rect:0,0,1,0.84|rect:0,0.84,0.33,1|rect:0.67,0.84,1,1', shadow='drop', ncol=48)
    door_y = hall['y'] + int(round(hall['h'] * 686 / 825))
    hall['sort'] = door_y - hall['base']
    S.place('sheet_mount_1', 244, 176, 24, cx=True, fp='trunk', shadow='tree', key='cypress_w')          # 庙前两株柏树
    S.place('sheet_mount_1', 476, 176, 24, cx=True, fp='trunk', shadow='tree', key='cypress_e', flip=True)
    S.place('sheet_temple_6', 470, 166, 26, fp='rect:0,0.3,1,1', shadow='small', key='firewood')     # 庙东墙根柴垛
    # ── 庙前：石香炉（祠庙常制，居中轴线） + 石径两侧石灯 ──
    S.place('sheet_mount_4', 360, 226, 30, cx=True, fp='rect:0.1,0.55,0.9,1.02', shadow='small', key='censer')
    S.place('sheet_mount_5', 318, 300, 12, cx=True, fp='rect:0,0.6,1,1', shadow='small', key='lantern_w')
    S.place('sheet_mount_5', 404, 300, 12, cx=True, fp='rect:0,0.6,1,1', shadow='small', key='lantern_e')
    # ── 西：古井 + 菜畦（老僧自种菜蔬，井水浇菜）+ 水桶 ──
    S.place('sheet_props_0', 196, 238, 34, cx=True, fp='rect:0,0.4,1,1.04', shadow='drop', key='well')
    S.place('sheet_mount_10', 92, 272, 62, fp='rect:0,0.25,1,1', shadow='small', key='veg')
    S.place('sheet_mount_10', 150, 214, 54, fp='rect:0,0.25,1,1', shadow='small', key='veg2', flip=True)
    S.place('sheet_props_2', 226, 248, 18, fp='rect:0,0.4,1,1', shadow='small', key='bucket')
    # ── 东：老僧的药炉 + 晾药架（老僧身中慢毒多年，常年煎药——01 §4.1 伏笔）；老僧站在炉边等你 ──
    S.place('sheet_mount_3', 452, 216, 24, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='stove')
    S.place('sheet_mount_11', 548, 204, 46, cx=True, fp='cols:5', shadow='small', key='herbs')
    # ── 西南荒草：半截断碑（岘山堕泪碑的传说）；东南：大石 ──
    S.place('sheet_mount_2', 150, 324, 22, cx=True, fp='rect:0.05,0.55,0.95,1', shadow='small', key='stele')
    S.place('sheet_mount_6', 560, 336, 58, cx=True, fp='rect:0.05,0.45,0.95,1', shadow='drop', key='rocks_se')
    S.place('sheet_mount_7', 604, 262, 22, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='rock_e')
    S.place('sheet_mount_7', 104, 330, 18, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='rock_w')
    # ── 收边：东西两侧山石松林、下方坡沿（前景，人走到树后被遮挡） ──
    for i, (k, x, b, w_, fp_) in enumerate((('sheet_mount_0', 40, 230, 86, 'trunk'), ('sheet_mount_6', 40, 300, 70, 'rect:0,0.3,1,1'), ('sheet_bandit_5', 24, 380, 44, 'trunk'),
                                            ('sheet_mount_0', 680, 236, 86, 'trunk'), ('sheet_bandit_6', 690, 310, 56, 'rect:0,0.3,1,1'), ('sheet_bandit_5', 700, 392, 44, 'trunk'),
                                            ('sheet_mount_0', 92, 404, 96, 'trunk'), ('sheet_mount_0', 628, 404, 96, 'trunk'), ('sheet_mount_6', 230, 404, 60, 'rect:0,0.3,1,1'),
                                            ('sheet_mount_6', 490, 404, 60, 'rect:0,0.3,1,1'), ('sheet_trees_5', 280, 398, 28, 'band:0.5'), ('sheet_trees_5', 440, 398, 28, 'band:0.5'),
                                            ('sheet_mount_8', 626, 176, 40, 'trunk'))):
        S.place(k, x, b, w_, cx=True, fp=fp_, shadow='tree' if 'mount_0' in k or 'bandit_5' in k else 'small', key='edge%d' % i)
    S.tufts(200, (0, 150, S.w, 400))
    # ── 可走区：庙前空地 + 台阶（出口）+ 石径出图 ──
    S.walk_poly([(150, 168), (570, 168), (612, 250), (620, 300), (560, 360), (420, 372), (398, 400), (340, 400), (320, 372), (160, 364), (104, 300), (110, 250)])
    S.walk_rect(330, door_y + 2, 390, 172)        # 台阶
    S.block_rect(0, 392, 334, 400); S.block_rect(386, 392, 720, 400)   # 下沿只留石径出口
    S.exits = [(25, 10, 28, 11), (25, 29, 28, 29)]
    print('temple_out door_y', door_y, 'steps', hall['x'] + int(hall['w'] * .335), hall['x'] + int(hall['w'] * .665))
    for n, (x, y) in dict(arrive=(360, 186), map_in=(362, 378), well=(196, 246), monk=(509, 219), stele=(172, 330), stove=(452, 224)).items(): S.anchor(n, x, y)
    return S


def gate():
    """襄阳城 · 南门外（60×36 格 = 800×480）：城在画面北方。上：南门城楼 + 城墙（外侧，无马道）；门前窄坪（军士守门洞）；
    护城河横贯（南宋襄阳三面环壕），吊桥居中；桥南头设卡盘查（拒马收窄路口、哨棚、军旗、榜文）；官道向南出图，桥南东西向大路通左右出口；
    路西：候验的盐商车队；路东：城外歇脚茶棚、饮马槽。"""
    S = Scene('gate', 800, 480, seed=47)
    S.rect(0, 0, 800, 100, 4)                     # 城墙后（城内）树梢与屋顶
    S.rect(0, 196, 800, 250, 0)                   # 城墙根（夯土）
    S.rect(340, 204, 460, 250, 2)                 # 门前石坪
    S.rect(0, 250, 800, 330, 3)                   # 护城河
    S.rect(0, 330, 800, 480, 4)                   # 城外草地
    S.region([(360, 330), (440, 330), (446, 392), (800, 392), (800, 430), (446, 430), (436, 480), (364, 480), (354, 430), (0, 430), (0, 392), (354, 392)], 6)   # 官道 + 东西大路
    S.rect(350, 330, 450, 364, 1)                 # 桥南头石板（盘查处）
    S.paint_ground()
    g = S.ground
    for x in range(S.w):                          # 护城河南岸石驳岸
        for y in range(330, 334): g[y, x] = (118, 116, 104) if (x // 7 + y) % 3 else (92, 92, 84)
        g[334, x] = (150, 146, 128)
    # ── 城内远景（墙后屋顶/树梢，不可达） ──
    for i, (k, x, b, w_) in enumerate((('residence', 20, 118, 110), ('hut_b', 150, 112, 90), ('shop_b', 250, 120, 110), ('residence', 480, 118, 110),
                                        ('hut_b', 600, 112, 90), ('residence', 700, 120, 110), ('sheet_trees_1', 110, 70, 60), ('sheet_trees_2', 560, 66, 44), ('sheet_trees_1', 760, 70, 60))):
        S.place(k, x, b, w_, fp='none', shadow='none', sort='flat', key='far%d' % i, cx=k.startswith('sheet'))
    # ── 南门（外侧）+ 两侧城墙 ──
    GW_ = 400
    gt = S.place('gate_south', 400, 206, GW_, cx=True, fp='solid', shadow='none', ncol=48)
    sc_ = GW_ / 1672
    full = np.asarray(load_cut('gate_south'))[..., 3] > 0
    seg_b = gt['y'] + int(round((max(np.nonzero(full[:, c])[0].max() for c in range(0, 200)) + 1) * sc_))
    segw = int(round(GW_ * .28))
    xL = gt['x']; i = 0
    while xL > 0:
        xL -= segw - 1
        S.place('gate_south', xL, seg_b, segw, crop=(0, 0, .28, 1.0), flip=(i % 2 == 1), fp='solid', shadow='none', key='wall_l%d' % i); i += 1
    xR = gt['x'] + gt['w'] - 1; i = 0
    while xR < S.w:
        S.place('gate_south', xR, seg_b, segw, crop=(.72, 0, 1.0, 1.0), flip=(i % 2 == 1), fp='solid', shadow='none', key='wall_r%d' % i); xR += segw - 1; i += 1
    arch = (gt['x'] + int(GW_ * 775 / 1672), gt['x'] + int(GW_ * 900 / 1672))
    # 排序线取门洞内 16px：走进门洞淡出时画在门楼前面，不被整座城楼盖住（02 §3.4）
    gt['sort'] = -16
    print('gate arch', arch, 'wall base', seg_b, 'gate', gt['x'], gt['y'], gt['w'], gt['h'])
    # ── 门前：军士守门洞（站位见 story.js）、两侧灯笼柱 ──
    S.place('sheet_props_8', 344, 214, 11, cx=True, fp='band:0.2', shadow='small', key='lamp_w')
    S.place('sheet_props_8', 456, 214, 11, cx=True, fp='band:0.2', shadow='small', key='lamp_e')
    # ── 吊桥（护城河上，放下时即桥面；桥面高度同地面，画在人物之下） ──
    br = S.place('moat_bridge', 400, 342, 60, cx=True, fp='none', shadow='none', sort='flat')
    # 桥两侧河沿沙袋（战前加固）
    S.place('sheet_war_7', 336, 250, 30, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='sand_nw')
    S.place('sheet_war_7', 464, 250, 30, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='sand_ne')
    # ── 桥南头关卡：两侧拒马把路收窄、哨棚、军旗、兵器架、城门榜文 ──
    S.place('sheet_war_0', 330, 366, 44, cx=True, fp='rect:0,0.35,1,1', shadow='small', key='juma_w')
    S.place('sheet_war_0', 470, 366, 44, cx=True, fp='rect:0,0.35,1,1', shadow='small', key='juma_e', flip=True)
    S.place('sheet_gate_0', 520, 380, 40, cx=True, fp='rect:0,0.35,1,1', shadow='drop', key='sentry')
    S.place('sheet_war_6', 552, 376, 22, cx=True, fp='rect:0,0.6,1,1', shadow='small', key='weapons')
    S.place('sheet_gate_1', 344, 336, 12, cx=True, fp='rect:0.2,0.9,0.8,1', shadow='small', key='flag_w')
    S.place('sheet_gate_1', 456, 336, 12, cx=True, fp='rect:0.2,0.9,0.8,1', shadow='small', key='flag_e', flip=True)
    S.place('sheet_war_4', 286, 386, 26, cx=True, fp='rect:0,0.7,1,1', shadow='small', key='notice')
    # ── 路西：候验的盐商车队（货车 + 挑箱）；路东：歇脚茶棚 + 桌凳、饮马槽、拴马石 ──
    S.place('sheet_gate_2', 196, 384, 52, cx=True, fp='rect:0.1,0.35,1,1', shadow='drop', key='salt_cart')
    S.place('sheet_gate_5', 250, 382, 34, cx=True, fp='rect:0,0.5,1,1', shadow='small', key='chests')
    S.place('sheet_river_4', 150, 380, 28, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='sacks')
    S.place('sheet_gate_6', 640, 384, 52, cx=True, fp='rect:0.05,0.55,0.95,1', shadow='drop', key='shelter')
    S.place('sheet_props_6', 596, 386, 28, cx=True, fp='rect:0,0.2,1,1.06', shadow='small', key='tea_table')
    S.place('sheet_gate_7', 700, 380, 34, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='trough')
    S.place('sheet_props_11', 726, 378, 8, cx=True, fp='band:0.3', shadow='small', key='tether')
    # 城墙根：修城料（砖垛、木料）——战前加固城墙（02 §1.2 战时痕迹）
    S.place('sheet_war_2', 60, 236, 30, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='bricks')
    S.place('sheet_war_3', 104, 238, 40, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='timber')
    S.place('sheet_war_2', 700, 236, 30, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='bricks2', flip=True)
    S.place('sheet_gate_4', 460, 454, 12, cx=True, fp='rect:0,0.5,1,1', shadow='small', key='milestone')   # 官道里程碑
    # ── 河岸柳、芦苇；下沿灌木小树 ──
    for i, (k, x, b, w_) in enumerate((('sheet_trees_0', 80, 358, 58), ('sheet_trees_0', 730, 360, 58), ('sheet_trees_0', 250, 356, 46))):
        S.place(k, x, b, w_, cx=True, fp='trunk', shadow='tree', key='willow%d' % i)
    for i, (k, x, b, w_) in enumerate((('sheet_river_0', 30, 330, 30), ('sheet_river_1', 160, 332, 22), ('sheet_river_0', 560, 330, 30), ('sheet_river_1', 620, 331, 22),
                                        ('sheet_river_1', 40, 252, 20), ('sheet_river_1', 700, 252, 20))):
        S.place(k, x, b, w_, cx=True, fp='none', shadow='none', sort='flat', key='reed%d' % i)
    for i, (k, x, b, w_, fp_) in enumerate((('sheet_trees_2', 60, 486, 48, 'trunk'), ('sheet_trees_5', 150, 478, 28, 'band:0.5'), ('sheet_trees_5', 270, 480, 26, 'band:0.5'),
                                            ('sheet_trees_2', 560, 488, 44, 'trunk'), ('sheet_trees_5', 640, 478, 28, 'band:0.5'), ('sheet_trees_1', 750, 488, 60, 'trunk'))):
        S.place(k, x, b, w_, cx=True, fp=fp_, shadow='tree' if fp_ == 'trunk' else 'small', key='south%d' % i)
    S.tufts(90, (0, 196, S.w, 250)); S.tufts(260, (0, 336, S.w, 480))
    # ── 可走区 ──
    S.walk_rect(4, 209, 796, 247)                 # 城墙根 / 门前石坪（墙脚以南）
    S.force_rect(arch[0] + 3, 196, arch[1] - 3, 209)   # 门洞口（出口）
    S.walk_rect(br['x'] + 11, 244, br['x'] + br['w'] - 11, 338)   # 吊桥桥面
    S.walk_rect(4, 336, 796, 474)                 # 城外（下沿灌木 fp 收边）
    S.walk_rect(0, 392, 800, 430)                 # 东西大路出图（左右出口）
    S.walk_rect(364, 470, 436, 480)               # 官道出图
    S.exits = [(29, 14, 30, 15), (27, 35, 32, 35), (0, 29, 0, 32), (59, 29, 59, 32)]
    for n, (x, y) in dict(arrive=(400, 222), map_in=(400, 447), soldier=(426, 350), guard_w=(372, 222), guard_e=(428, 222), notice=(286, 392),
                          merchant=(226, 396), porter=(250, 392), tea=(596, 396)).items(): S.anchor(n, x, y)
    return S


def bgate():
    """黑风寨 · 寨门（54×30 格 = 720×400）：城西南山中，夜。上：木寨墙横贯 + 寨门（两座望楼夹门），门前夯土场（火盆、拒马、守寨喽啰）；
    山道从寨门折向左下出图（下山 · 大地图）；场东：值夜草棚 + 酒坛（喽啰偷喝酒），场西：晾兽皮架；两侧山石松林；西侧枯树下埋着喽啰偷藏的酒（挖掘点）。"""
    S = Scene('bgate', 720, 400, seed=53)
    S.rect(0, 0, 720, 400, 4)
    S.region([(170, 170), (560, 170), (590, 250), (430, 262), (300, 262), (150, 240)], 0)   # 寨门前夯土场
    S.region([(344, 172), (378, 172), (384, 232), (358, 282), (298, 330), (236, 400), (182, 400), (250, 318), (316, 268), (344, 226)], 6)   # 山道
    S.rect(346, 60, 374, 176, 6)                  # 山道穿过寨门继续上山（门洞里看得见）
    S.paint_ground()
    # ── 远景：寨墙后的山林（不可达） ──
    for i, x in enumerate(range(-10, 740, 46)):
        S.place('sheet_bandit_5' if i % 3 else 'sheet_mount_0', x, 70 + (i * 13) % 22, 40 if i % 3 else 70, cx=True, fp='none', shadow='none', sort='flat', key='far%d' % i)
    # ── 木寨墙 + 寨门（望楼夹门；排序线取门洞内，穿门淡出时不被"吞"） ──
    gw_ = 310
    gt = S.place('bandit_gate', 360, 174, gw_, cx=True, fp='solid', shadow='none', ncol=48)
    gt['sort'] = -20
    op = (gt['x'] + int(gw_ * 596 / 1294), gt['x'] + int(gw_ * 696 / 1294))
    pw = int(round(1672 * gw_ / 1294 * .24 / .24 * .96))   # 寨墙与寨门同像素密度
    pw = 400
    S.place('palisade', gt['x'] + 30 - pw, 162, pw, fp='solid', shadow='none', key='pal_w')
    S.place('palisade', gt['x'] + gt['w'] - 30, 162, pw, fp='solid', shadow='none', key='pal_e', flip=True)
    print('bgate opening', op, 'gate', gt['x'], gt['y'], gt['w'], gt['h'])
    # ── 门前：火盆（夜哨）、拒马（防冲撞，中间留山道口）、兵器架 ──
    S.place('sheet_bandit_0', 318, 190, 14, cx=True, fp='rect:0,0.75,1,1', shadow='small', key='brazier_w')
    S.place('sheet_bandit_0', 404, 190, 14, cx=True, fp='rect:0,0.75,1,1', shadow='small', key='brazier_e')
    S.place('sheet_war_0', 278, 214, 46, cx=True, fp='rect:0,0.35,1,1', shadow='small', key='juma_w')
    S.place('sheet_war_0', 446, 214, 46, cx=True, fp='rect:0,0.35,1,1', shadow='small', key='juma_e', flip=True)
    S.place('sheet_bandit_9', 426, 184, 16, cx=True, fp='rect:0,0.7,1,1', shadow='small', key='spears')
    # ── 场东：值夜草棚 + 酒坛；场西：晾兽皮架、砍柴墩、柴堆 ──
    S.place('sheet_bandit_1', 522, 222, 60, cx=True, fp='rect:0,0.3,1,1', shadow='drop', key='shed')
    S.place('sheet_bandit_2', 566, 226, 24, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='jars')
    S.place('sheet_bandit_3', 190, 206, 50, cx=True, fp='cols:4', shadow='small', key='pelts')
    S.place('sheet_bandit_7', 214, 244, 16, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='stump')
    S.place('sheet_bandit_8', 168, 246, 24, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='logs')
    # ── 山道：骷髅警示牌；西侧枯树（树下埋酒） ──
    S.place('sheet_bandit_4', 402, 290, 16, cx=True, fp='rect:0.2,0.85,0.8,1', shadow='small', key='sign')
    S.place('sheet_mount_8', 128, 292, 42, cx=True, fp='trunk', shadow='small', key='deadtree')
    # ── 两侧山石松林（收边）+ 下沿 ──
    for i, (k, x, b, w_, fp_) in enumerate((('sheet_bandit_5', 40, 236, 44, 'trunk'), ('sheet_bandit_6', 70, 190, 56, 'rect:0,0.3,1,1'), ('sheet_mount_0', 34, 330, 86, 'trunk'),
                                            ('sheet_bandit_6', 110, 398, 60, 'rect:0,0.3,1,1'), ('sheet_bandit_5', 680, 230, 44, 'trunk'), ('sheet_mount_6', 640, 196, 60, 'rect:0,0.3,1,1'),
                                            ('sheet_mount_0', 660, 330, 90, 'trunk'), ('sheet_bandit_6', 560, 330, 56, 'rect:0,0.3,1,1'), ('sheet_bandit_5', 470, 360, 44, 'trunk'),
                                            ('sheet_mount_6', 380, 404, 64, 'rect:0,0.3,1,1'), ('sheet_bandit_5', 300, 404, 40, 'trunk'), ('sheet_mount_7', 470, 290, 22, 'rect:0,0.4,1,1'),
                                            ('sheet_bandit_5', 590, 408, 44, 'trunk'), ('sheet_mount_7', 60, 404, 26, 'rect:0,0.4,1,1'))):
        S.place(k, x, b, w_, cx=True, fp=fp_, shadow='tree' if fp_ == 'trunk' else 'small', key='edge%d' % i)
    S.tufts(260, (0, 170, S.w, 400))
    # ── 可走区 ──
    S.walk_poly([(150, 176), (580, 176), (610, 250), (600, 300), (520, 330), (420, 340), (330, 330), (260, 400), (160, 400), (100, 350), (96, 270), (120, 220)])
    S.force_rect(op[0] + 2, 150, op[1] - 2, 178)  # 寨门门洞（出口）
    S.block_rect(0, 392, 174, 400); S.block_rect(239, 392, 720, 400)   # 下沿只留山道出口
    S.exits = [(26, 11, 27, 12), (13, 29, 17, 29)]
    for n, (x, y) in dict(arrive=(362, 192), map_in=(212, 374), guard=(384, 196), dig=(144, 300), sentry=(302, 198)).items(): S.anchor(n, x, y)
    return S


def cave():
    """黑风寨 · 山洞聚义厅（54×30 格 = 720×400）：北壁正中虎皮交椅高台（寨主座位，视觉焦点）+ 两侧火盆，台前空出一片头目战场地；
    西：喽啰聚饮的长桌、酒坛；东：劫来的赃物（箱笼、兵器架）+ 账桌（赃物流水账）+ 挂在木架上的山川图（劫船路线）；
    西南阴湿洞角：巨蟒盘踞守着一只铁箍旧箱；东南：草铺；下方正中洞口石阶（回寨门）。"""
    S = Scene('cave', 720, 400, seed=59)
    S.rect(0, 0, 720, 400, 9)
    floor = [(40, 118), (680, 118), (704, 200), (690, 290), (640, 350), (430, 372), (412, 400), (308, 400), (290, 372), (96, 352), (28, 300), (16, 200)]
    S.region(floor, 7)
    S.paint_ground(); S.rock_rim(7, 9, 4)
    g = S.ground
    for i, y in enumerate(range(376, 400, 6)):    # 洞口石阶
        g[y:y + 2, 312 + i * 2:408 - i * 2] = (150, 138, 116); g[y + 2:y + 3, 312 + i * 2:408 - i * 2] = (84, 76, 64)
    # ── 北壁（岩壁 + 木撑），两段交替镜像 ──
    S.place('cave_wall', -60, 124, 452, fp='solid', shadow='none', key='wall_w')
    S.place('cave_wall', 328, 124, 452, fp='solid', shadow='none', flip=True, key='wall_e')
    # ── 虎皮交椅高台 + 两侧火盆（寨主座位；台前 18–36 列 × 13–22 行空出作头目战场地） ──
    S.place('sheet_cave_0', 360, 174, 80, cx=True, fp='rect:0,0.3,1,1.03', shadow='drop', key='throne')
    S.place('sheet_cave_1', 292, 178, 22, cx=True, fp='rect:0.1,0.6,0.9,1', shadow='small', key='brazier_w')
    S.place('sheet_cave_1', 428, 178, 22, cx=True, fp='rect:0.1,0.6,0.9,1', shadow='small', key='brazier_e')
    # ── 西：聚饮长桌 + 长凳 + 酒坛 ──
    S.place('sheet_cave_2', 124, 210, 72, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='feast')
    S.place('sheet_cave_3', 124, 236, 62, cx=True, fp='rect:0,0.2,1,1', shadow='small', key='bench')
    S.place('sheet_cave_5', 56, 198, 40, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='jars')
    S.place('sheet_cave_5', 210, 184, 30, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='jars2', flip=True)
    # ── 东：赃物（箱笼、兵器架）+ 账桌 + 山川图 ──
    S.place('sheet_cave_7', 556, 176, 58, cx=True, crop=(0, 0, 1.0, .49), fp='rect:0,0.3,1,1', shadow='small', key='loot')
    S.place('sheet_cave_4', 628, 174, 54, cx=True, fp='rect:0,0.6,1,1', shadow='small', key='weapons')
    S.place('sheet_cave_6', 530, 240, 62, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='ledger')
    S.place('sheet_cave_7', 626, 262, 46, cx=True, crop=(0, .5, 1.0, 1.0), fp='rect:0.1,0.8,0.9,1', shadow='small', key='hidemap')
    # 洞中偏西南：喽啰煮饭的火塘（吊锅），洞口内侧哨位（兵器架 + 货箱）
    S.place('sheet_temple_1', 232, 300, 38, cx=True, fp='rect:0.08,0.64,0.92,1.03', shadow='none', key='cookfire')
    S.place('sheet_bandit_9', 300, 352, 16, cx=True, fp='rect:0,0.7,1,1', shadow='small', key='post_rack')
    S.place('sheet_props_3', 452, 346, 26, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='post_crates')
    S.place('sheet_props_2', 238, 176, 22, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='barrels')          # 酒桶
    S.place('sheet_props_3', 470, 170, 26, cx=True, fp='rect:0,0.4,1,1', shadow='small', key='crates')           # 货箱（赃物）
    # ── 西南洞角：钟乳石 + 铁箍旧箱（巨蟒守着） ──
    S.place('sheet_cave_10', 70, 298, 36, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='old_chest')
    S.place('sheet_cave_9', 38, 272, 40, cx=True, fp='rect:0.1,0.5,0.9,1', shadow='small', key='stal_w')
    S.place('sheet_cave_9', 118, 350, 34, cx=True, fp='rect:0.1,0.5,0.9,1', shadow='small', key='stal_sw', flip=True)
    # ── 东南：草铺（喽啰睡处）；洞口两侧钟乳石 ──
    S.place('sheet_cave_8', 560, 324, 64, cx=True, fp='none', sort='flat', shadow='none', key='bed1')
    S.place('sheet_cave_8', 628, 300, 56, cx=True, fp='none', sort='flat', shadow='none', key='bed2', flip=True)
    S.place('sheet_cave_9', 276, 380, 36, cx=True, fp='rect:0.1,0.5,0.9,1', shadow='small', key='stal_gw')
    S.place('sheet_cave_9', 444, 380, 36, cx=True, fp='rect:0.1,0.5,0.9,1', shadow='small', key='stal_ge', flip=True)
    S.place('sheet_cave_9', 680, 240, 36, cx=True, fp='rect:0.1,0.5,0.9,1', shadow='small', key='stal_e')
    # ── 可走区 ──
    S.walk_poly([(44, 126), (676, 126), (694, 200), (682, 286), (632, 344), (428, 366), (410, 400), (310, 400), (292, 366), (100, 346), (36, 296), (26, 200)])
    S.block_rect(0, 392, 334, 400); S.block_rect(386, 392, 720, 400)   # 下沿只留洞口
    S.exits = [(25, 29, 28, 29)]
    for n, (x, y) in dict(arrive=(360, 360), chief=(360, 190), snake=(116, 304), ledger=(530, 248), hidemap=(626, 268), feast_w=(96, 244), feast_e=(156, 244), loot=(540, 196)).items(): S.anchor(n, x, y)
    return S



# ═════════════════════════════ 工作流 F：渡江（docs/design/01 §5.5、02 §4.5b / §4.5c）═════════════════════════════
def _periodic_noise(w, h, cells_x, cells_y, seed):
    """横向可平铺的值噪声（格点在 x 方向首尾相接）"""
    rng = np.random.default_rng(seed)
    g = rng.random((cells_y, cells_x))                # 纵横都首尾相接
    fx = np.arange(w) / w * cells_x; i0 = np.floor(fx).astype(int) % cells_x; i1 = (i0 + 1) % cells_x; tx = fx - np.floor(fx)
    fy = np.arange(h) / h * cells_y; j0 = np.floor(fy).astype(int) % cells_y; j1 = (j0 + 1) % cells_y; ty = (fy - np.floor(fy))[:, None]
    top = g[j0][:, i0] * (1 - tx) + g[j0][:, i1] * tx; bot = g[j1][:, i0] * (1 - tx) + g[j1][:, i1] * tx
    return top * (1 - ty) + bot * ty


def crossing_far():
    """渡船场景的运行时贴图 m_crossing_far.webp：
    行 0：远岸条带（400×52，横向无缝，含远山剪影 + 芦苇滩 + 柳树 + 渔家草屋，按远处缩小）；
    行 1：水匪快船（正向船头朝右 / 镜像船头朝左）；行 2：江面波纹贴图（200×200，横向无缝）。
    返回 (Image, js 片段)"""
    FW, FH = 400, 52
    strip = np.zeros((FH, FW, 4), np.uint8)
    xs = np.arange(FW)
    # 远山：两层周期正弦叠加（周期整除 FW，保证首尾相接），灰蓝雾色
    for layer, (base, amp, col) in enumerate(((20, 9, (122, 132, 140)), (28, 6, (104, 118, 112)))):
        hgt = base - amp * (np.sin(xs / FW * 2 * np.pi * (2 + layer) + layer) * .6 + np.sin(xs / FW * 2 * np.pi * (5 + layer * 2) + 1.3) * .4)
        for x in range(FW):
            y0 = int(max(0, hgt[x]))
            strip[y0:FH, x, :3] = col; strip[y0:FH, x, 3] = 255
    # 滩地
    n = _periodic_noise(FW, FH, 40, 3, 21)
    for y in range(36, FH):
        for x in range(FW):
            c = MEADOW[int(n[y, x] * 3.99)]
            strip[y, x, :3] = c; strip[y, x, 3] = 255
    strip[35, :, :3] = (84, 104, 56); strip[FH - 2:, :, :3] = (72, 90, 84)       # 滩沿 / 水线
    im = Image.fromarray(strip, 'RGBA')
    far = [('sheet_river_9', 30, 22), ('sheet_river_0', 70, 12), ('hut', 104, 30), ('sheet_river_1', 140, 9), ('sheet_trees_2', 180, 18),
           ('sheet_river_0', 214, 13), ('sheet_trees_0', 252, 20), ('sheet_river_1', 290, 10), ('sheet_river_9', 330, 24), ('sheet_river_0', 372, 12)]
    for k, cx, w_ in far:
        pim = pixelize(load_cut(k), w_, ncol=24)
        a_ = np.asarray(pim).astype(np.float32); a_[..., :3] = a_[..., :3] * .78 + np.array([110, 124, 128]) * .22   # 空气透视：偏雾色
        pim = Image.fromarray(a_.astype(np.uint8), 'RGBA')
        for dx in (0, -FW, FW):
            x0 = cx - pim.width // 2 + dx
            if x0 + pim.width > 0 and x0 < FW: im.alpha_composite(pim, (max(0, x0), FH - 4 - pim.height), (max(0, -x0), 0))
    # 快船（水匪），两个朝向
    sk = pixelize(load_cut('sheet_reed_2'), 84)
    skf = sk.transpose(Image.FLIP_LEFT_RIGHT)
    # 江面波纹贴图：横向无缝，水平波带 + 高光碎线
    TW, TH = 200, 200
    wn = _periodic_noise(TW, TH, 10, 40, 5) * .7 + _periodic_noise(TW, TH, 50, 50, 6) * .3
    wi = np.clip((wn * len(WATER)).astype(int), 0, len(WATER) - 1)
    wt = np.array(WATER, np.uint8)[wi]
    R_ = random.Random(9)
    for _ in range(300):
        x, y, L = R_.randrange(TW), R_.randrange(TH), R_.randrange(3, 9)
        for xx in range(L): wt[y, (x + xx) % TW] = WATER_HI if R_.random() < .7 else WATER[2]
    tile = Image.fromarray(np.dstack([wt, np.full((TH, TW), 255, np.uint8)]), 'RGBA')
    AW, AH = max(FW, TW), FH + 2 + sk.height + 2 + TH
    at = Image.new('RGBA', (AW, AH), (0, 0, 0, 0))
    at.paste(im, (0, 0)); y1 = FH + 2
    at.paste(sk, (0, y1)); at.paste(skf, (sk.width + 2, y1)); y2 = y1 + sk.height + 2
    at.paste(tile, (0, y2))
    at.save(os.path.join(ROOT, 'assets', 'm_crossing_far.webp'), lossless=True, quality=100, method=6)
    js = (f"\nSC.crossing.far={{img:'m_crossing_far',strip:[0,0,{FW},{FH}],skiff:[0,{y1},{sk.width},{sk.height}],skiffL:[{sk.width + 2},{y1},{sk.width},{sk.height}],"
          f"water:[0,{y2},{TW},{TH}],k:{K}}};")
    return js


def crossing():
    """渡船 · 江心（30×18 格 = 400×240）：一屏的短场景。汤老舵的渡船横在画面中下部（船头朝东 = 画面右，与航向一致），
    底图只有船（江面处透明）：江面波纹、远岸条带、船尾拖出的水痕由运行时 SC.crossing.under() 程序绘制并向西卷动（船在向东走）。
    甲板上可走；汤老舵在舱篷前撑篙，同伴（苏芷、大黄）以剧情 NPC 身份站在甲板上（02 §3.5，noFollow）。"""
    S = Scene('crossing', 400, 240, seed=71)
    S.rect(0, 0, 400, 240, 3)
    S.paint_ground()
    S.clear_mat = 3
    bx, bb = 70, 178                                           # 船左边 / 底边
    boat = S.place('ferry_boat', bx, bb, BOAT_W, fp='none', shadow='none', sort='flat')
    by = boat['y']
    # 甲板可走区（船体局部坐标，见 review/ferry/boat_grid.png：舱篷 45–95、甲板 98–216 × 19–45、船头缆绳水桶 218–245）
    S.walk_rect(bx + 98, by + 20, bx + 216, by + 45)
    S.exits = []
    for n, (x_, y_) in dict(start=(bx + 150, by + 34), boatman=(bx + 104, by + 28), suzhi=(bx + 205, by + 25), dog=(bx + 183, by + 41),
                            merchant=(bx + 121, by + 41), bow=(bx + 214, by + 31)).items(): S.anchor(n, x_, y_)
    S._extra_js = crossing_far() + f"\nSC.crossing.boat=[{bx * K},{by * K},{boat['w'] * K},{boat['h'] * K}];"
    return S


def ferry_e():
    """东津渡 · 东岸芦苇荡（黑风暗桩）（54×30 格 = 720×400）：江面在画面北侧（与西岸码头同一取景约定，02 §4.5c）。
    北：江面 + 汤老舵的渡船靠在一截木栈桥旁（上下船处，视觉焦点之一），东头芦苇湾里泊着三条快船（"江上多了三条生面孔的快船"）；
    江滩湿泥一条（北沿），滩东头竹搭放哨高台看江面；从栈桥下来，一条踩出来的泥路穿过芦苇折向东南，进到暗桩空地：
    北侧窝棚（浪里鳅住处、令牌所在）、东侧盖油布的赃货堆（等攒够一船夜里运走）、西侧晾网架与晒鱼架、当中火塘；四周芦苇收边。
    窝棚背后贴着江滩——从滩上绕到棚后能偷听（"放过"解法），但棚后与空地之间有芦苇隔开，不能从后面绕进空地。"""
    S = Scene('ferry_e', 720, 400, seed=83)
    S.rect(0, 0, 720, 400, 4)                                                    # 芦苇地
    S.region([(0, 0), (720, 0), (720, 98), (560, 104), (420, 96), (340, 104), (300, 104), (260, 100), (120, 90), (0, 96)], 3)   # 江面
    S.region([(0, 96), (120, 90), (260, 100), (300, 104), (340, 104), (420, 96), (560, 104), (720, 98), (720, 164), (600, 168), (470, 166),
              (380, 162), (300, 172), (200, 164), (0, 170)], 11)                # 江滩湿泥
    S.region([(296, 150), (352, 150), (362, 206), (396, 232), (400, 276), (344, 262), (300, 204)], 0)   # 踩出来的泥路
    S.region([(376, 180), (706, 180), (712, 346), (378, 350)], 0)                # 暗桩空地（夯实的土）
    S.paint_ground()
    S.pier(300, 54, 330, 106)                                                    # 上下船的木栈桥
    # ── 江面：渡船（与西岸、江心同一条船同一宽度）、三条快船、水中芦苇 ──
    S.place('ferry_boat', 300 - BOAT_W + 12, 92, BOAT_W, fp='none', shadow='none', sort='flat', key='ferry_boat')
    for i, (x, b, fl) in enumerate(((468, 72, False), (556, 90, True), (640, 64, False))):
        S.place('sheet_reed_2', x, b, 80, fp='none', shadow='none', sort='flat', flip=fl, key='skiff%d' % i)
    for i, (k, cx, b, w_) in enumerate((('sheet_reed_6', 440, 100, 50), ('sheet_river_0', 530, 104, 24), ('sheet_reed_6', 700, 100, 50), ('sheet_river_1', 24, 96, 18),
                                        ('sheet_river_0', 150, 94, 22), ('sheet_reed_6', 380, 98, 40))):
        S.place(k, cx, b, w_, cx=True, fp='none', shadow='none', key='wreed%d' % i, weather=.5 if k == 'sheet_reed_6' else 0)
    # ── 江滩：放哨高台（东，看江面）、插在泥里的网桩（西）、栈桥下的跳板 ──
    S.place('sheet_reed_1', 624, 160, 44, cx=True, fp='cols:4', shadow='small', key='tower')
    S.place('sheet_reed_8', 140, 150, 72, cx=True, fp='cols:3', shadow='small', key='stakes')
    S.place('sheet_reed_7', 314, 160, 46, cx=True, fp='none', shadow='none', sort='flat', key='planks')
    # ── 暗桩空地 ──
    S.place('sheet_reed_0', 520, 222, 104, cx=True, fp='rect:0.04,0.5,0.96,1', shadow='drop', key='shack')                    # 窝棚（浪里鳅住处）
    S.place('sheet_reed_3', 648, 256, 64, cx=True, fp='rect:0,0.25,1,1', shadow='small', key='loot')              # 赃货堆
    S.place('sheet_river_3', 414, 236, 40, cx=True, fp='cols:5', shadow='small', key='netrack')                   # 晾网架
    S.place('sheet_reed_4', 440, 290, 50, cx=True, fp='cols:4', shadow='small', key='fishrack')                   # 晒鱼架
    S.place('sheet_reed_5', 560, 300, 26, cx=True, fp='rect:0.1,0.55,0.9,1', shadow='none', key='fire')          # 火塘
    S.place('sheet_river_5', 690, 300, 26, cx=True, fp='rect:0,0.3,1,1', shadow='small', key='crates')           # 货箱
    # ── 可走区 ──
    S.walk_rect(8, 108, 712, 160)                 # 江滩
    S.walk_rect(303, 56, 327, 108)                # 栈桥
    S.walk_poly([(298, 156), (350, 156), (358, 208), (394, 234), (396, 274), (344, 260), (302, 204)])   # 泥路
    S.walk_rect(380, 186, 702, 344)               # 暗桩空地
    wm = np.asarray(S.walk) > 0
    # ── 芦苇收边：非可走的芦苇地上铺满芦苇（底边落在可走区外，站在芦苇北面的人被芦苇遮住） ──
    R_ = random.Random(5); kinds = (('sheet_reed_6', 52), ('sheet_river_0', 26), ('sheet_reed_6', 44), ('sheet_river_1', 18))
    i = 0
    for yb in range(186, 412, 22):
        for xc in range(-10, 740, 30):
            if R_.random() < .12: continue
            x_ = xc + R_.randrange(-12, 13) + (11 if (yb // 22) % 2 else 0); y_ = yb + R_.randrange(-4, 5)
            k, w_ = kinds[R_.randrange(4)]
            near = wm[max(0, y_ - 16):min(S.h, y_ + 6), max(0, x_ - w_ // 2 - 2):min(S.w, x_ + w_ // 2 + 2)]
            if near.any() or S.mat[min(S.h - 1, y_ - 1), min(S.w - 1, max(0, x_))] in (3, 11): continue
            S.place(k, x_, y_, w_, cx=True, fp='none', shadow='none', key='reed%d' % i, weather=.5 if k == 'sheet_reed_6' else 0); i += 1
    # 窝棚两侧的芦苇（隔开棚后江滩与空地）
    for j, (x_, b) in enumerate(((452, 184), (478, 182), (566, 184), (594, 182), (620, 184))):
        S.place('sheet_reed_6', x_, b, 40, cx=True, fp='band:0.4', shadow='none', key='shackreed%d' % j, weather=.5)
    S.tufts(200, (0, 100, S.w, 400))
    S.exits = []
    for n, (x_, y_) in dict(start=(314, 98), boatman=(318, 66), langli=(520, 238), eaves=(520, 152), steal=(522, 232), drunk=(540, 318),
                            pirate1=(478, 302), pirate2=(604, 296), sentry=(600, 152), loot=(648, 262)).items(): S.anchor(n, x_, y_)
    return S


if __name__ == '__main__':
    which = sys.argv[1:] or ['street']
    for w in which:
        sc = {'street': street, 'alley': alley, 'ferry': ferry, 'temple': temple, 'temple_out': temple_out, 'gate': gate, 'bgate': bgate, 'cave': cave, 'crossing': crossing, 'ferry_e': ferry_e}[w]()
        sc.write(getattr(sc, '_extra_js', ''))
