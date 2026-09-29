"""同伴战斗动作表（工作流 D）：从 s_{char}_bright 朝左站立帧（1 倍像素）逐像素变形生成。
  suzhi → assets/b_suzhi.webp  1 行 × 16 帧，单元 48×47（×3 = 144×141）
    0-3 待机呼吸  4-5 冲刺前倾  6 出手-蓄（手收到身后）7 出手-甩针（臂前伸+三枚银针）8 出手-收
    9 受击  10 运功（双手合于胸前、挺身）  11-12 破防跪坐（喘息）  13 倒地  14-15 胜利（举针，15 针尖闪光）
  大黄 b_dog 由 foe_battle.py 生成（生图 → 像素化，mirror 为朝左）。
用法（仓库根目录）：python3 tools_fx/party_battle.py [suzhi]
预览：review/battle_v2/D/b_{char}.png
"""
import sys as _s
_s.exit('battle v3：我方战斗表已改由 tools_fx/rig/ 帧动画管线生成（见 docs/anim-pipeline.md），本脚本停用，避免覆盖 assets/b_*.webp')

import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bsprite as bs

C = lambda *v: np.array([*v, 255], np.uint8)
SILVER, WHITE = C(226, 236, 246), C(255, 255, 255)


def arm(img, x0, y0, x1, y1, sleeve, skin, out=bs.OUT):
    """两像素粗的袖臂 + 手（带上下描边），终点为手"""
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    pts = [(int(round(x0 + (x1 - x0) * i / n)), int(round(y0 + (y1 - y0) * i / n))) for i in range(n + 1)]
    H, W = img.shape[:2]
    put = lambda x, y, c: (0 <= x < W and 0 <= y < H) and img.__setitem__((y, x), c)
    ol = lambda x, y: (0 <= x < W and 0 <= y < H) and img[y, x, 3] == 0 and img.__setitem__((y, x), out)   # 描边只落在透明处
    for x, y in pts:
        ol(x, y - 1); ol(x, y + 2)
    for x, y in pts:
        put(x, y, sleeve); put(x, y + 1, sleeve)
    sx = -1 if x1 < x0 else 1
    put(x1, y1, skin); put(x1, y1 + 1, skin); ol(x1 + sx, y1); ol(x1 + sx, y1 + 1)


def suzhi():
    base = bs.load_frame('suzhi')
    OW, H = 48, base.shape[0]
    b0 = bs.place(base, OW, H, dx=3)            # 略偏右，给前方出手留空
    x0 = bs.bbox(b0)[0]                         # 脸前沿
    SL, SK = C(214, 232, 196), C(246, 214, 180)
    WAIST = 30
    sh = lambda img, k: bs.shear(img, k, H - 1)
    idle = [b0, bs.bob(b0, 1, WAIST), bs.bob(b0, 1, WAIST), bs.bob(b0, -1, WAIST) if False else b0.copy()]
    idle[3] = sh(b0, -1)

    def wind():
        img = sh(bs.bob(b0, 1, WAIST), 2)
        arm(img, x0 + 7, 22, x0 + 12, 25, SL, SK)
        return img

    def throw(k=-3, reach=8, needles=True):
        img = sh(b0, k)
        ax = x0 + 8 + int(round(k * .5))
        arm(img, ax, 21, ax - reach - 3, 20, SL, SK)
        if needles:
            hx = ax - reach - 4
            for j, (dy, ln) in enumerate(((-2, 5), (0, 6), (2, 5))):
                for i in range(ln):
                    x = hx - 1 - i - j % 2
                    if 0 <= x < OW: img[20 + dy, x] = SILVER if i < ln - 1 else WHITE
        return img

    def cast():
        img = bs.bob(b0, -1, WAIST)
        arm(img, x0 + 6, 22, x0 + 3, 24, SL, SK)
        for x, y in ((x0 + 1, 21), (x0 + 3, 20), (x0 + 1, 26)):
            img[y, x] = C(200, 255, 220)
        return img

    def kneel(br):
        img = bs.squash_rows(b0, WAIST + 2, H, 8)
        img = bs.bob(img, 1 + br, 24)
        return sh(img, -2)

    def win(gl):
        img = bs.bob(b0, -1, WAIST)
        arm(img, x0 + 6, 21, x0 + 3, 14, SL, SK)
        for i in range(4): img[10 - i, x0 + 2 + (i % 2) * 0] = SILVER
        if gl:
            for dx, dy in ((0, 0), (-1, 0), (1, 0), (0, -1), (0, 1)): img[6 + dy, x0 + 2 + dx] = WHITE
        return img

    FR = idle + [sh(b0, -4), sh(bs.bob(b0, 1, WAIST), -6), wind(), throw(), throw(-2, 7, False), sh(bs.bob(b0, 1, WAIST), 3),
                 cast(), kneel(0), kneel(1), bs.place(bs.lie(b0, 'r'), OW, H), win(False), win(True)]
    labels = ['idle0', 'idle1', 'idle2', 'idle3', 'dash0', 'dash1', 'atk-wind', 'atk-throw', 'atk-follow', 'hurt', 'cast',
              'brk0', 'brk1', 'dead', 'win0', 'win1']
    print('suzhi', bs.save_sheet(FR, 'assets/b_suzhi.webp'), len(FR))
    bs.preview(FR, labels, 'review/battle_v2/D/b_suzhi.png')



if __name__ == '__main__':
    for n in sys.argv[1:] or ['suzhi']:
        globals()[n]()
