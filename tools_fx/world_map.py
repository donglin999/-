"""大地图 m_world.webp（工作流 S2：水墨舆图，见 docs/design/10 §S-03、02 §2.3）

地理按 01 §1.4 / 02 §2.1：汉水自西北来、绕襄阳城北、在城东折向东南；樊城在北岸隔江；
岘山（羊太傅庙）在城南偏东；东津渡在城东江边；黑风寨在城西南荆山余脉；后续章节地点（樊城、白河、
鹿门山、万山、隆中、往均州/当阳的路）只画淡墨轮廓。**图上不写任何字**——地名由 js/ui.js drawMap 叠字，
唯一的字是程序生成的朱印（开源毛笔字体，非生图）。

流程（仓库根目录为工作目录）：
  python3 tools_fx/world_map.py guide     # 程序画布局示意图 → raw_battle/S2/world_guide.png（1536×1024，中间 1536×864 为 16:9 可见区）
  python3 tools_fx/world_map.py gen       # 以示意图为参考图 edit → raw_battle/S2/world_raw.png（--force 覆盖）
  python3 tools_fx/world_map.py post      # 裁 16:9 → 1280×720，宣纸调色、暗角、朱印 → assets/m_world.webp
  python3 tools_fx/world_map.py check     # 在成图上画出 NODES/地标坐标 → review/map_v2/world_check.png
坐标：LAYOUT 中全部为 16:9 可见区的归一化坐标 (x,y)，与 js/ui.js NODES / MAP_MARKS 一一对应（改一处要同步另一处）。
UI 遮挡区：顶栏 y<.12、左侧地点列表 x<.21 且 .14<y<.76、底栏 y>.88 —— 地点不要落在这些区域。
"""
import argparse, json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools_common'))
RAW = os.path.join(ROOT, 'raw_battle', 'S2')
GUIDE = os.path.join(RAW, 'world_guide.png')
GEN = os.path.join(RAW, 'world_raw.png')
OUT = os.path.join(ROOT, 'assets', 'm_world.webp')
FONT_SEAL = os.path.join(ROOT, 'raw_battle', 'F', 'fonts', 'MaShanZheng-Regular.ttf')

GW, GH, BAND = 1536, 1024, 80          # 生图画布；上下各 80px 为 16:9 可见区之外的延伸
OW, OH = 1280, 720

# ── 布局（16:9 归一化坐标）──
HAN = [(-.02, .20), (.12, .23), (.26, .27), (.38, .32), (.48, .345), (.58, .35), (.66, .37),
       (.72, .42), (.745, .50), (.77, .60), (.82, .70), (.89, .80), (.97, .90), (1.03, .95)]   # 汉水中线
BAIHE = [(.70, -.02), (.69, .10), (.665, .20), (.655, .29), (.66, .355)]                       # 白河（樊城东，南流入汉）
CITY = (.515, .40, .615, .49)           # 襄阳城墙 x0,y0,x1,y1（东西略长）
FAN = (.47, .225, .545, .285)            # 樊城
MOUNTAINS = {   # 山体：(cx, cy, 宽, 高, 峰数, 浓淡 1=主 0.45=淡)
    'xianshan':  (.655, .64, .13, .10, 3, 1.0),    # 岘山（城南偏东）
    'heifeng':   (.33, .70, .20, .17, 5, 1.0),       # 黑风寨所在荆山余脉（城西南）
    'heifeng2':  (.25, .78, .14, .12, 3, .8),
    'wanshan':   (.40, .425, .07, .06, 2, .45),      # 万山（城西，第二章）
    'longzhong': (.31, .52, .10, .08, 3, .45),       # 隆中（城西，第二章）
    'lumen':     (.86, .58, .12, .10, 3, .45),       # 鹿门山（城东南汉水东岸，第五章）
    'north':     (.33, .12, .16, .07, 3, .35),       # 北岸远山
    'south':     (.52, .86, .18, .08, 3, .4),        # 南方远山（往当阳）
    'ne':        (.86, .20, .16, .07, 3, .35),       # 东北远山
}
ROADS = [   # 官道/山道（墨虚线）
    [(.565, .49), (.575, .54), (.595, .575), (.605, .59)],                 # 南门 → 岘山北麓（羊太傅庙）
    [(.60, .59), (.58, .70), (.55, .80), (.53, .92)],                      # 南下官道 → 往当阳
    [(.615, .445), (.66, .455), (.705, .465)],                             # 东门 → 东津渡
    [(.53, .49), (.47, .55), (.41, .62), (.36, .665)],                    # 西南山道 → 黑风寨
]
# 地点（与 js/ui.js NODES 同步）：第一章可去
NODES = {'xiangyang': (.565, .445), 'temple': (.605, .59), 'ferry': (.715, .47), 'bandit': (.355, .675)}
# 地标（与 js/ui.js MAP_MARKS 同步）：只叠淡墨字，不可点
MARKS = {'樊城': (.515, .18), '汉水': (.33, .235), '白河': (.715, .15), '岘山': (.66, .68), '万山': (.40, .40),
         '隆中': (.31, .50), '鹿门山': (.86, .56), '往均州': (.27, .145), '往当阳': (.53, .83)}


def g2(x, y):
    """16:9 归一化 → 生图画布像素"""
    return x * GW, BAND + y * (GH - 2 * BAND)


def smooth(pts, n=24):
    """Catmull-Rom 平滑折线"""
    P = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = map(np.array, P[i - 1:i + 3])
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(tuple(.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)))
    out.append(pts[-1])
    return out


def guide():
    """布局示意：宣纸底色、蓝色河道、褐色城墙、灰色山体、虚线道路。只给模型看方位，不追求好看。"""
    os.makedirs(RAW, exist_ok=True)
    im = Image.new('RGB', (GW, GH), (233, 220, 192))
    d = ImageDraw.Draw(im)
    han = [g2(*p) for p in smooth(HAN)]
    for w, c in ((58, (170, 190, 200)), (40, (120, 150, 170))):
        d.line(han, fill=c, width=w, joint='curve')
    d.line([g2(*p) for p in smooth(BAIHE)], fill=(150, 170, 185), width=14, joint='curve')
    for k, (cx, cy, w, h, n, a) in MOUNTAINS.items():
        c = tuple(int(233 - (233 - v) * a) for v in (70, 70, 65))
        for i in range(n):
            px = cx - w / 2 + w * (i + .5) / n + (i % 2) * w * .05
            ph = h * (1 - .25 * abs(i - (n - 1) / 2) / max(1, n / 2))
            x0, y0 = g2(px - w / n * .8, cy + h / 2)
            x1, y1 = g2(px, cy + h / 2 - ph)
            x2, _ = g2(px + w / n * .8, 0)
            d.polygon([(x0, y0), (x1, y1), (x2, y0)], fill=c)
    for r in ROADS:
        pts = [g2(*p) for p in smooth(r, 10)]
        for i in range(0, len(pts) - 1, 2):
            d.line([pts[i], pts[i + 1]], fill=(90, 70, 50), width=4)
    for box, col in ((CITY, (120, 80, 50)), (FAN, (160, 130, 100))):
        x0, y0 = g2(box[0], box[1]); x1, y1 = g2(box[2], box[3])
        d.rectangle([x0, y0, x1, y1], outline=col, width=8, fill=(215, 195, 160))
        for i in range(4):   # 城内街坊
            xx = x0 + (x1 - x0) * (i + 1) / 5
            d.line([(xx, y0 + 12), (xx, y1 - 12)], fill=(185, 160, 125), width=3)
    # 护城河（东南西三面）
    x0, y0 = g2(CITY[0] - .008, CITY[1]); x1, y1 = g2(CITY[2] + .008, CITY[3] + .014)
    d.line([(x0, y0), (x0, y1), (x1, y1), (x1, y0)], fill=(140, 165, 180), width=7)
    # 渡口栈桥、庙、寨的小记号
    fx, fy = g2(*NODES['ferry']); d.rectangle([fx + 8, fy - 6, fx + 40, fy + 4], fill=(110, 80, 50))
    tx, ty = g2(*NODES['temple']); d.polygon([(tx - 22, ty + 10), (tx, ty - 16), (tx + 22, ty + 10)], fill=(120, 60, 40))
    bx, by = g2(*NODES['bandit']); d.rectangle([bx - 20, by - 8, bx + 20, by + 10], outline=(80, 50, 30), width=5)
    im.save(GUIDE)
    print('示意图 →', GUIDE)


PROMPT = (
    "把这张布局示意图重新绘制成一幅中国宋代水墨舆图（古地图），用于武侠游戏的大地图界面。"
    "必须严格保持示意图中所有要素的位置、形状与走向不变：蓝色粗带是汉水（大江），自左上方流来，从城的北边绕过，在城的东边折向右下方流走；"
    "上方中部偏右的细蓝线是一条支流（白河），向下流入汉水；"
    "褐色大方框是一座东西略长的方形城池（襄阳城），紧贴大江南岸，东、南、西三面有护城河；江北岸的小方框是另一座较小的城（樊城）；"
    "灰色三角是山峦，深灰为主要山峦、浅灰为远山；褐色虚线是道路；城东江边的小横块是渡口木栈桥与小渡船；"
    "城南偏东山脚下的小三角是一座小庙宇；左下山中的小方框是一座山寨木栅。"
    "画风：淡黄旧宣纸底，有细微纸纹、边缘微微泛黄陈旧；墨线勾勒，线条有粗细顿挫；"
    "山峦用披麻皴与淡墨晕染、山头点苔，远山只用极淡的墨色轮廓；江水用细密的淡墨水波纹与极淡的花青色晕染；"
    "城池用俯视的墨线画出城墙垛口与四面城门、城内有几条街巷与屋顶小点；道路用细墨虚线；树林用墨点。"
    "整体低饱和、雅致、留白充足，只用墨色、淡赭石、淡花青三种颜色。"
    "绝对不要出现任何文字、汉字、字母、数字、印章、落款、题款、图例、指北针、边框、人物。"
)


def gen(force=False):
    import flatimg
    if os.path.exists(GEN) and not force:
        print('跳过', GEN); return
    if not os.path.exists(GUIDE): guide()
    r = flatimg.edit([GUIDE], PROMPT, model='gpt-image-2.5-sunburst', size=f'{GW}x{GH}', quality='high',
                     output_format='png', n=1)
    open(GEN, 'wb').write(r.png)
    json.dump(dict(prompt=PROMPT, meta={k: v for k, v in r.meta.items() if isinstance(v, (str, int, float))}),
              open(os.path.join(RAW, 'world_params.json'), 'w'), ensure_ascii=False, indent=1)
    print('生成 →', GEN, r.meta.get('seconds'))


def seal(text, size, seed=3):
    """朱文方印（阳文），2×2 字；轻微缺损模拟钤印。"""
    S = size * 4
    m = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(m)
    bw = int(S * .07)
    d.rounded_rectangle([bw // 2, bw // 2, S - bw // 2, S - bw // 2], radius=int(S * .05), outline=255, width=bw)
    F = ImageFont.truetype(FONT_SEAL, int(S * .33))
    cells = [(1, 0), (1, 1), (0, 0), (0, 1)]   # 右起竖读：右上、右下、左上、左下
    for ch, (cx, cy) in zip(text, cells):
        l, t, r, b = d.textbbox((0, 0), ch, font=F)
        ox = bw + (S - 2 * bw) * cx / 2 + ((S - 2 * bw) / 2 - (r - l)) / 2 - l
        oy = bw + (S - 2 * bw) * cy / 2 + ((S - 2 * bw) / 2 - (b - t)) / 2 - t
        d.text((ox, oy), ch, font=F, fill=255)
    rng = np.random.default_rng(seed)
    a = np.asarray(m).astype(np.float32) / 255
    noise = np.asarray(Image.fromarray((rng.random((S // 8, S // 8)) * 255).astype(np.uint8)).resize((S, S), Image.BICUBIC)) / 255
    a = a * np.clip((noise - .12) * 3, 0, 1)
    m = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)).resize((size, size), Image.LANCZOS)
    col = Image.new('RGB', (size, size), (179, 38, 30))
    return col, m


def post():
    im = Image.open(GEN).convert('RGB').resize((GW, GH), Image.LANCZOS)
    im = im.crop((0, BAND, GW, GH - BAND)).resize((OW, OH), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    # 宣纸统一调色：拉向纸色、压低饱和，暗部偏墨
    paper = np.array([233, 220, 192]) / 255
    lum = a @ np.array([.299, .587, .114])
    a = lum[..., None] + (a - lum[..., None]) * .75
    a = a * .92 + paper * .08 * (lum[..., None] > .6)
    # 暗角 + 边缘泛黄
    yy, xx = np.mgrid[0:OH, 0:OW]
    r = np.hypot((xx - OW / 2) / (OW / 2), (yy - OH / 2) / (OH / 2))
    v = np.clip((r - .75) / .6, 0, 1)[..., None]
    a = a * (1 - .22 * v) + np.array([.45, .32, .15]) * .10 * v
    im = Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8))
    # 朱印：右下角（底栏之上），右起竖读「襄阳舆图」（字体只含简体，繁体字会缺字）
    if os.path.exists(FONT_SEAL):
        col, m = seal('襄阳舆图', 72)
        im.paste(col, (OW - 72 - 34, OH - 72 - 96), m)
    im.save(OUT, quality=90, method=6)
    print('成图 →', OUT, os.path.getsize(OUT) // 1024, 'KB')


def check():
    im = Image.open(OUT).convert('RGB')
    d = ImageDraw.Draw(im)
    F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Songti.ttc', 18)
    for k, (x, y) in NODES.items():
        px, py = x * OW, y * OH
        d.rectangle([px - 9, py - 9, px + 9, py + 9], outline=(200, 0, 0), width=3)
        d.text((px + 12, py - 10), k, fill=(200, 0, 0), font=F)
    for k, (x, y) in MARKS.items():
        d.text((x * OW, y * OH), k, fill=(0, 0, 160), font=F, anchor='mm')
    d.rectangle([0, 0, OW, .12 * OH], outline=(0, 160, 0), width=2)
    d.rectangle([.012 * OW, .14 * OH, .21 * OW, .76 * OH], outline=(0, 160, 0), width=2)
    d.rectangle([0, .88 * OH, OW, OH], outline=(0, 160, 0), width=2)
    os.makedirs(os.path.join(ROOT, 'review', 'map_v2'), exist_ok=True)
    p = os.path.join(ROOT, 'review', 'map_v2', 'world_check.png')
    im.save(p); print('核对图 →', p)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['guide', 'gen', 'post', 'check', 'all'])
    ap.add_argument('--force', action='store_true')
    a = ap.parse_args()
    if a.cmd in ('guide', 'all'): guide()
    if a.cmd in ('gen', 'all'): gen(a.force)
    if a.cmd in ('post', 'all'): post()
    if a.cmd in ('check', 'all'): check()
