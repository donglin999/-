"""主角战斗动作表：由 s_hero_bright 朝左站立帧（1 倍像素 29×47）逐像素变形生成。
输出 assets/b_hero.webp：1 行 × 18 帧，单元 49×47 像素（×3 = 147×141），脚底基线与原表一致、人物水平居中。
帧：0-3 待机（战斗架势呼吸） 4-8 出招（蓄 → 突进 → 斩 → 收势 → 回位） 9 受击 10 运功
    11-12 冲刺前倾 13-14 破防跪地（喘息两帧） 15 倒地 16-17 胜利举剑（17 剑尖闪光）
（0-10 与旧 s_hero_battle.webp 完全一致；旧表不再输出。）预览：review/battle_v2/D/b_hero.png
用法（仓库根目录）：python3 tools_fx/hero_battle.py
"""
import sys as _s
_s.exit('battle v3：我方战斗表已改由 tools_fx/rig/ 帧动画管线生成（见 docs/anim-pipeline.md），本脚本停用，避免覆盖 assets/b_*.webp')

import numpy as np
from PIL import Image

SRC, DST = 'assets/s_hero_bright.webp', 'assets/b_hero.webp'
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bsprite as bs
CW, CH, PX = 87, 141, 3
OW = 49                      # 输出单元宽（像素），左右给剑刃与前倾留空
FEET = 46                    # 脚底行
WAIST = 31                   # 此行以下（下摆/腿）不参与上身位移

src = Image.open(SRC).convert('RGBA')
base = np.array(src.crop((0, CH, CW, 2 * CH)))[1::PX, 1::PX].copy()   # 行 1 = 朝左，列 0 = 站立
h, w, _ = base.shape
PADL = (OW - w) // 2
canvas0 = np.zeros((h, OW, 4), np.uint8)
canvas0[:, PADL:PADL + w] = base

OUT = np.array([34, 22, 30, 255], np.uint8)       # 描边
STEEL = np.array([222, 232, 242, 255], np.uint8)
STEEL2 = np.array([150, 166, 190, 255], np.uint8)
GUARD = np.array([196, 150, 70, 255], np.uint8)
SLEEVE = np.array([236, 228, 206, 255], np.uint8)
SKIN = np.array([240, 196, 160, 255], np.uint8)


def shear(img, k, top=0):
    """整体前倾/后仰：第 y 行水平平移 round(k*(FEET-y)/FEET)，脚不动。k<0 向左（朝前）"""
    out = np.zeros_like(img)
    for y in range(h):
        dx = int(round(k * (FEET - y) / FEET))
        if dx >= 0: out[y, dx:] = img[y, :OW - dx]
        else: out[y, :OW + dx] = img[y, -dx:]
    return out


def bob(img, dy, below=WAIST):
    """上身（WAIST 以上）下沉/上提 dy 像素，腰部接缝用原行补齐"""
    if dy == 0: return img.copy()
    out = img.copy()
    up = img[:below].copy()
    out[:below] = 0
    if dy > 0:
        out[dy:below + dy] = np.where(up[..., 3:] > 0, up, out[dy:below + dy])
        out[below:below + dy] = np.where(img[below:below + dy][..., 3:] > 0, img[below:below + dy], out[below:below + dy])
    else:
        out[:below + dy] = up[-dy:]
        out[below + dy:below] = img[below + dy:below]
    return out


def px(img, x, y, c):
    if 0 <= x < OW and 0 <= y < h: img[y, x] = c


def blade(img, x0, y0, dx, dy, n):
    """从手部 (x0,y0) 沿 (dx,dy) 画 n 像素剑刃：亮面 + 暗面 + 描边，护手横在起点"""
    for i in range(n):
        x, y = int(round(x0 + dx * i)), int(round(y0 + dy * i))
        px(img, x, y, STEEL if i < n - 1 else STEEL2)
        px(img, x - int(round(dy)), y + int(round(dx)), STEEL2)
    for s in (-1, 1):   # 护手
        px(img, x0 - int(round(dy * s)), y0 + int(round(dx * s)), GUARD)
    px(img, int(round(x0 - dx)), int(round(y0 - dy)), OUT)   # 剑柄尾


def arm(img, x0, y0, x1, y1):
    """伸出的袖子 + 手：两像素粗，描边"""
    n = max(abs(x1 - x0), abs(y1 - y0))
    for i in range(n + 1):
        t = i / max(n, 1)
        x, y = int(round(x0 + (x1 - x0) * t)), int(round(y0 + (y1 - y0) * t))
        px(img, x, y - 1, OUT); px(img, x, y + 2, OUT)
        px(img, x, y, SLEEVE); px(img, x, y + 1, SLEEVE)
    px(img, x1 - 1, y1, SKIN); px(img, x1 - 1, y1 + 1, SKIN); px(img, x1 - 2, y1, OUT); px(img, x1 - 2, y1 + 1, OUT)


def frame(k=0, dy=0, sword=None):
    src = canvas0
    if sword:   # 出剑帧：擦掉原图左下垂握的剑鞘（第 32-38 行、身体前方），避免出现两把剑
        src = canvas0.copy()
        src[32:39, :PADL + 9] = 0
    img = bob(src, dy)
    img = shear(img, k)
    if sword:
        (ax, ay), (bx, by), (dx, dy2), n = sword
        arm(img, ax, ay, bx, by)
        blade(img, bx - 2, by, dx, dy2, n)
    return img


SH = PADL + 9           # 肩部 x（朝左一侧）
FR = [
    frame(0, 0), frame(-1, 1), frame(-1, 1), frame(0, 0),                       # 0-3 待机：前倾 1 像素的呼吸
    frame(3, 1),                                                                # 4 蓄：后仰下沉
    frame(-4, 0, ((SH - 2, 22), (SH - 7, 23), (-1, .35), 12)),                 # 5 突进：剑斜指前下
    frame(-6, 0, ((SH - 4, 21), (SH - 11, 21), (-1, 0), 15)),                  # 6 斩：臂与剑水平伸直
    frame(-5, 1, ((SH - 3, 22), (SH - 9, 24), (-.8, .6), 13)),                 # 7 收势：剑尖下压
    frame(-2, 1),                                                               # 8 回位
    frame(4, 2),                                                                # 9 受击：后仰
    frame(0, -1),                                                               # 10 运功：挺身
    frame(-5, 1),                                                               # 11 冲刺：前倾
    frame(-7, 2),                                                               # 12 冲刺：更低更前
]


def kneel(breath=0):
    """破防：腿压缩成跪姿，上身前倾、头低垂"""
    img = bs.squash_rows(canvas0, WAIST, FEET + 1, 9)
    img = bs.bob(img, 1 + breath, 26)          # 头肩再塌 1-2 像素
    return shear(img, -3)


def win(glint=False):
    img = canvas0.copy()
    img[32:39, :PADL + 9] = 0                  # 擦掉垂握的剑鞘
    img = bob(img, -1)
    arm(img, SH, 22, SH - 4, 17)
    blade(img, SH - 6, 17, 0, -1, 14)
    if glint:
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)): px(img, SH - 6 + dx, 3 + dy, STEEL)
        px(img, SH - 6, 3, np.array([255, 255, 255, 255], np.uint8))
    return img


def dead():
    return bs.place(bs.lie(canvas0, 'r'), OW, h)


FR += [kneel(0), kneel(1), dead(), win(), win(True)]
LABELS = ['idle0', 'idle1', 'idle2', 'idle3', 'atk-wind', 'atk-lunge', 'atk-slash', 'atk-follow', 'atk-back', 'hurt', 'cast',
          'dash0', 'dash1', 'brk0', 'brk1', 'dead', 'win0', 'win1']

sheet = Image.new('RGBA', (OW * PX * len(FR), h * PX))
for i, f in enumerate(FR):
    sheet.paste(Image.fromarray(f).resize((OW * PX, h * PX), Image.NEAREST), (i * OW * PX, 0))
sheet.save(DST, lossless=True)
print(DST, sheet.size, 'cell', (OW * PX, h * PX), 'frames', len(FR))
bs.preview(FR, LABELS, 'review/battle_v2/D/b_hero.png')
