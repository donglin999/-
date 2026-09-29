"""同尺度对比图（工作流 I）：按 js/bart.js 的 h 与战斗显示倍率（unitH = h × 2/3，每美术像素 2 画布像素）
把新主角 b_hero 与全部敌人 / 动物的待机帧并排，脚底同一基线。头目（tier boss）按表内尺寸显示（不再 ×1.5）。
输出 review/battle_v4/I/compare.png（整体再 ×1.5 便于查看）。
用法（仓库根目录）：python3 tools_fx/rig/compare.py [动作=idle] [角色,角色…]
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw

act = sys.argv[1] if len(sys.argv) > 1 else 'idle'
js = subprocess.run(['node', '-e', "global.window={};require('./js/bart.js');console.log(JSON.stringify(window.BART))"],
                    capture_output=True, text=True).stdout
B = json.loads(js)
order = sys.argv[2].split(',') if len(sys.argv) > 2 else \
    ['hero', 'suzhi', 'dog', 'bandit', 'monk', 'beggar', 'wolf', 'rooster', 'snake', 'chief']
DISP = 2 / 3
items = []
for k in order:
    v = B.get(k)
    if not v or not os.path.exists(f"assets/{v['file']}.webp"): continue
    s = Image.open(f"assets/{v['file']}.webp").convert('RGBA')
    cw, ch = v['cell']
    a = v['anim'].get(act) or v['anim']['idle']
    f = a['f'][0]
    im = s.crop((f * cw, 0, (f + 1) * cw, ch))
    if v['facing'] == 'l' and k not in ('hero', 'suzhi', 'dog'): im = im.transpose(Image.FLIP_LEFT_RIGHT)
    bb = im.getbbox()
    sc = v['h'] * DISP / ch
    im = im.resize((round(cw * sc), round(ch * sc)), Image.NEAREST)
    im = im.crop((round(bb[0] * sc), 0, round(bb[2] * sc), im.height))
    items.append((f"{k} {v['tier']} h{v['h']}", im))
W = sum(i.width for _, i in items) + 24 * len(items) + 24
Hh = max(i.height for _, i in items) + 40
o = Image.new('RGBA', (W, Hh), (26, 24, 34, 255))
d = ImageDraw.Draw(o)
x = 24
for lab, im in items:
    o.alpha_composite(im, (x, Hh - 26 - im.height))
    d.text((x, Hh - 20), lab, fill=(230, 220, 200))
    x += im.width + 24
d.line([(0, Hh - 26), (W, Hh - 26)], fill=(120, 90, 60))
o = o.resize((int(W * 1.5), int(Hh * 1.5)), Image.NEAREST)
os.makedirs('review/battle_v4/I', exist_ok=True)
out = f'review/battle_v4/I/compare{"" if act == "idle" else "_" + act}.png'
o.save(out)
print(out, o.size)
