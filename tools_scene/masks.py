#!/usr/bin/env python3
"""旧版 640×360 探索地图的精确碰撞 mask：按地图像素手标可走多边形 WALK 与障碍 BLOCK → 240×135 位图（每位 8 世界像素）。

用法（仓库根目录）：python3 tools_scene/masks.py [scene...]
输出：js/story.js 中 // <mask:<id>> … // </mask:<id>> 之间的 `SC.<id>.mask={...}`（自动替换，勿手改）；
      review/scene_v2/mask_<id>.png 调试叠图（×2，绿=可走，红框=BLOCK）。
坐标：源图像素（640×360），世界 = ×3。标注原则：肉眼可走的地面都可走；挡住墙、柱、树干、石头、家具、水面、画面外沿；
      出口区（exits[].r）范围内保留可走，保证能走进去触发。改完跑 node tools_scene/audit.cjs 复查可达性。
"""
import os, sys, re, base64
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
MW, MH = 240, 135

R = lambda x0, y0, x1, y1: [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
E = lambda x0, y0, x1, y1: ('e', (x0, y0, x1, y1))

SCENES = {
    # 羊太傅庙：庙内石板地（后墙脚 y≈172 起），挡柱础、供桌、篝火；南侧台阶井口 = 出口
    'temple': dict(
        walk=[[(98, 174), (548, 174), (606, 290), (618, 352), (22, 352), (34, 290)],
              R(286, 300, 354, 360)],
        keep=[R(280, 320, 374, 360)],
        block=[R(88, 160, 118, 184), R(158, 172, 196, 258), R(446, 172, 486, 258), R(200, 160, 238, 180), R(402, 160, 440, 180),
               R(524, 160, 552, 184), R(252, 110, 388, 180), E(288, 212, 344, 250),
               [(0, 170), (70, 170), (20, 360), (0, 360)], [(570, 170), (640, 170), (640, 360), (628, 360)]]),
    # 庙外空地：林间空地 + 石径；挡古井、石头、篝火、左右大树、右下松林、庙基
    'temple_out': dict(
        walk=[[(0, 252), (60, 246), (116, 236), (120, 170), (262, 164), (266, 126), (374, 126), (380, 160), (500, 166), (506, 222),
               (568, 214), (640, 206), (640, 262), (578, 262), (522, 300), (512, 352), (0, 352)],
              R(267, 340, 380, 360)],
        keep=[R(267, 346, 388, 360)],
        block=[E(142, 168, 238, 240), [(380, 160), (506, 160), (506, 244), (454, 244), (420, 204), (380, 188)],
               E(394, 262, 432, 284), E(488, 248, 522, 270), R(212, 126, 264, 150), R(372, 126, 420, 150),
               [(590, 238), (640, 246), (640, 360), (505, 360), (520, 300)], R(66, 214, 118, 246)]),
    # 城门外：城墙脚 y≈205 以南沙地 + 石台；挡栅栏、柳树干、旗杆；门洞 = 进城出口
    'gate': dict(
        keep=[R(0, 346, 640, 360), R(0, 212, 14, 348), R(626, 212, 640, 348)],
        walk=[R(0, 206, 640, 360), R(304, 150, 336, 208)],
        block=[R(188, 226, 282, 238), R(350, 226, 460, 238), R(196, 270, 288, 288), R(352, 272, 440, 284),
               E(106, 208, 158, 248), E(486, 212, 520, 242), R(150, 204, 200, 222), R(424, 202, 500, 222),
               ]),
    # 偏巷：院内（房前空地 + 石板）、中门甬道、院墙外沙地；挡柴垛、鸡笼、水缸、晾衣杆、墙根杂物
    'alley': dict(
        walk=[[(176, 130), (444, 130), (470, 200), (482, 228), (164, 228), (170, 200)],
              R(294, 226, 336, 306),
              [(116, 304), (506, 304), (516, 350), (112, 350)],
              R(286, 346, 344, 360)],
        keep=[R(280, 346, 348, 360)],
        block=[R(176, 128, 224, 144), R(390, 126, 444, 140), E(352, 150, 396, 200), R(398, 186, 406, 202), R(455, 186, 463, 202),
               R(118, 300, 164, 324), R(165, 300, 206, 310), R(207, 300, 242, 310), R(250, 300, 277, 308), R(368, 300, 420, 308), R(424, 300, 458, 308)]),
    # 江陵渡口：沙岸 + 两条栈桥；挡草棚、木箱、芦苇、右下灌木、水面
    'ferry': dict(
        walk=[[(0, 300), (118, 292), (300, 292), (304, 256), (318, 240), (360, 212), (470, 200), (495, 186), (595, 176), (640, 172),
               (640, 262), (580, 272), (525, 290), (512, 356), (0, 356)],
              [(246, 138), (272, 128), (404, 196), (388, 212)],      # 下栈桥（通乌篷船）
              [(318, 120), (344, 110), (494, 186), (472, 200)]],     # 上栈桥（通帆船）
        keep=[R(0, 300, 14, 360)],
        block=[[(318, 226), (442, 226), (442, 300), (372, 304), (318, 292)], R(440, 242, 467, 277), R(490, 178, 590, 224)]),
    # 黑风寨寨门：草地 + 土路 + 寨前空地；挡寨墙、火盆、拒马、四周树林
    'bgate': dict(
        walk=[[(0, 208), (48, 206), (62, 228), (120, 244), (198, 246), (214, 230), (206, 212), (212, 192), (478, 192), (498, 206),
               (492, 228), (470, 240), (506, 252), (600, 252), (640, 248), (640, 262), (576, 262), (524, 300), (514, 356), (0, 356)],
              R(308, 156, 332, 194)],
        keep=[R(0, 346, 414, 360)],
        block=[E(252, 176, 278, 202), R(348, 176, 402, 206), R(418, 176, 472, 206)]),
    # 黑风寨山洞：洞底沙地 + 石圈井口（出口）；挡洞壁、酒桌、虎皮交椅台、火把、木箱兵器架
    'cave': dict(
        walk=[[(150, 186), (236, 164), (404, 164), (425, 150), (545, 150), (560, 250), (565, 330), (560, 356), (76, 356), (80, 300), (95, 255), (125, 215)],
              R(300, 320, 390, 360)],
        block=[R(120, 176, 238, 250), R(256, 138, 382, 194), R(234, 128, 262, 164), R(378, 128, 406, 164),
               [(424, 144), (550, 144), (550, 252), (510, 260), (454, 260), (454, 208), (424, 208)]]),
}


def draw(d, shape, fill):
    if isinstance(shape, tuple) and shape[0] == 'e': d.ellipse(shape[1], fill=fill)
    else: d.polygon(shape, fill=fill)


def build(sid):
    cfg = SCENES[sid]
    im = Image.open(os.path.join(ROOT, 'assets', f'm_{sid}.webp')).convert('RGB')
    W, H = im.size
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for P in cfg['walk']: draw(d, P, 255)
    for P in cfg['block']: draw(d, P, 0)
    # 画面外沿 6px 不可走（出口区 keep 除外）：避免走到画面边缘 / 半个身子出画
    B = 6; d.rectangle((0, 0, W, B - 1), fill=0); d.rectangle((0, H - B, W, H), fill=0); d.rectangle((0, 0, B - 1, H), fill=0); d.rectangle((W - B, 0, W, H), fill=0)
    wl = Image.new('L', (W, H), 0); dw = ImageDraw.Draw(wl)
    for P in cfg['walk']: draw(dw, P, 255)
    for P in cfg.get('keep', []):
        km = Image.new('L', (W, H), 0); ImageDraw.Draw(km).polygon(P, fill=255)
        m.paste(255, mask=Image.fromarray((np.asarray(km) > 0) & (np.asarray(wl) > 0)).convert('L'))
    a = np.asarray(m) > 128
    bits = np.zeros((MH, MW), np.uint8)
    for r in range(MH):
        for c in range(MW):
            bits[r, c] = a[min(H - 1, int((r + .5) * H / MH)), min(W - 1, int((c + .5) * W / MW))]
    b64 = base64.b64encode(np.packbits(bits.flatten()).tobytes()).decode()
    js = f'SC.{sid}.mask={{w:{MW},h:{MH},d:"{b64}"}};'
    p = os.path.join(ROOT, 'js', 'story.js'); s = open(p, encoding='utf-8').read()
    A, B = f'// <mask:{sid}>', f'// </mask:{sid}>'
    blk = f'{A} 由 tools_scene/masks.py 生成，勿手改\n{js}\n{B}'
    if A in s: s = re.sub(re.escape(A) + r'.*?' + re.escape(B), lambda _: blk, s, flags=re.S)
    else: s = s.rstrip('\n') + '\n\n' + blk + '\n'
    open(p, 'w', encoding='utf-8').write(s)
    dbg = im.resize((W * 2, H * 2), Image.NEAREST).convert('RGBA')
    ov = np.zeros((H, W, 4), np.uint8); ov[a] = (40, 230, 90, 100)
    dbg.alpha_composite(Image.fromarray(ov).resize((W * 2, H * 2), Image.NEAREST))
    dd = ImageDraw.Draw(dbg)
    for P in cfg['block']:
        if isinstance(P, tuple): dd.ellipse([v * 2 for v in P[1]], outline=(255, 40, 40, 255), width=2)
        else: dd.polygon([(x * 2, y * 2) for x, y in P], outline=(255, 40, 40, 255))
    os.makedirs(os.path.join(ROOT, 'review', 'scene_v3'), exist_ok=True)
    dbg.convert('RGB').save(os.path.join(ROOT, 'review', 'scene_v3', f'mask_{sid}.png'))
    print(sid, 'walk%', round(a.mean() * 100, 1))


if __name__ == '__main__':
    # alley / ferry 已改为 v2 程序排布地图（build_scene.py alley 生成 mask），这里的旧多边形仅留作参考，默认不再输出
    # 2026-09 S1：temple / temple_out / gate / bgate / cave 也已改为程序排布（build_scene.py），本脚本整体退役；
    # 旧多边形只留作参考。确需输出须显式加 --legacy（会往 story.js 追加旧 mask 块，覆盖新 mask！）
    if '--legacy' not in sys.argv:
        sys.exit('masks.py 已退役：第一章 8 个场景都由 tools_scene/build_scene.py 生成 mask（见 docs/art-pipeline.md §场景管线 v2）')
    for sid in ([a for a in sys.argv[1:] if a != '--legacy'] or list(SCENES)): build(sid)
