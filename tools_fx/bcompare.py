"""同尺度对比图（battle v3，工作流 E）：按 js/bart.js 的 h（= cell[1]，每美术像素 3 画布像素）把各战斗表某帧
画到 960×540 画布的显示尺寸（unitH = h × 2/3，即每美术像素 2 画布像素），脚底同一基线；敌方面右在左、我方面左在右，另附旧版主角（raw_battle/E/old_b_hero.webp，
旧 h=165 非整数倍，同样 ×2/3）作参照。输出 review/battle_v3/E/compare.png（整体再 ×1.5 便于查看）。
用法：python3 tools_fx/bcompare.py [帧号=0] [角色,角色…]
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw

fi = int(sys.argv[1]) if len(sys.argv) > 1 else 0
only = sys.argv[2].split(',') if len(sys.argv) > 2 else None
js = subprocess.run(['node', '-e', "global.window={};require('./js/bart.js');console.log(JSON.stringify(window.BART))"],
                    capture_output=True, text=True).stdout
B = json.loads(js)
order = only or [k for k, v in B.items() if v['facing'] == 'r'] + [k for k, v in B.items() if v['facing'] == 'l']
items = []
DISP = 2 / 3          # 战斗显示：unitH = BART.h × 2/3（表内 3×，屏上每美术像素 2 画布像素）


def add(label, sheet, cw, ch, cols, h, f):
    s = Image.open(sheet).convert('RGBA')
    f = min(f, cols - 1)
    im = s.crop((f * cw, 0, (f + 1) * cw, ch))
    bb = im.getbbox()
    sc = h * DISP / ch
    im = im.resize((round(cw * sc), round(ch * sc)), Image.NEAREST)
    x0, x1 = round(bb[0] * sc), round(bb[2] * sc)
    items.append((label, im.crop((x0, 0, x1, im.height))))


for k in order:
    v = B[k]
    add(f"{k} h{v['h']}", f"assets/{v['file']}.webp", *v['cell'], v['cols'], v['h'], fi)
if os.path.exists('raw_battle/E/old_b_hero.webp'):
    add('old_hero h165', 'raw_battle/E/old_b_hero.webp', 147, 141, 18, 165, 0)
W = sum(i.width for _, i in items) + 24 * len(items) + 24
Hh = max(i.height for _, i in items) + 40
o = Image.new('RGBA', (W, Hh), (26, 24, 34, 255))
d = ImageDraw.Draw(o)
x = 24
for k, im in items:
    o.alpha_composite(im, (x, Hh - 26 - im.height))
    d.text((x, Hh - 20), k, fill=(230, 220, 200))
    x += im.width + 24
d.line([(0, Hh - 26), (W, Hh - 26)], fill=(120, 90, 60))
o = o.resize((int(W * 1.5), int(Hh * 1.5)), Image.NEAREST)
os.makedirs('review/battle_v3/E', exist_ok=True)
o.save('review/battle_v3/E/compare.png')
print('review/battle_v3/E/compare.png', o.size)
