"""逃难后坐着的陈伯：照 legacy art_sources/npc-sprites-20261101/pack.py 打包（切 2×2、硬 alpha、最近邻缩放、48 色、脚底对齐）。
身高 80 像素（让头和站姿表一样大），脚底线 108；输出 4×4 表（每行一个朝向，4 帧相同）。"""
import sys, hashlib
from pathlib import Path
import numpy as np
from PIL import Image
B = Path(__file__).resolve().parent
sys.path.insert(0, '/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/art_sources/qihe-npc-refresh-20261010')
from build import extract
CW, CH, GROUND, BODY = 96, 116, 108, 80   # 80：头和站姿陈伯一样大（70 时头偏小）
native, parts = extract(B / 'raw.png', (2, 2))
scale = float(np.median([p['image'].height for p in parts])) / BODY
frames = []
for part in parts:
    im = part['image']; im = im.resize((round(im.width / scale), round(im.height / scale)), Image.NEAREST)
    left = round(CW / 2 - part['head_cx'] / scale); top = GROUND - im.height
    left = max(2, min(left, CW - 2 - im.width)); assert top >= 1 and im.width <= CW - 4
    c = Image.new('RGBA', (CW, CH)); c.alpha_composite(im, (left, top)); frames.append(c)
atlas = Image.new('RGBA', (CW * 4, CH))
for n, im in enumerate(frames): atlas.alpha_composite(im, (n * CW, 0))
rgb = atlas.convert('RGB').quantize(colors=48, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert('RGB'); rgb.putalpha(atlas.getchannel('A'))
frames = [rgb.crop((n * CW, 0, (n + 1) * CW, CH)) for n in range(4)]
sheet = Image.new('RGBA', (CW * 4, CH * 4))
for r in range(4):
    for col in range(4): sheet.alpha_composite(frames[r], (col * CW, r * CH))
out = B / 's_npc_qh_chen_rest_story_20261110.webp'; sheet.save(out, 'WEBP', lossless=True, exact=True)
print(out.name, round(scale, 3), hashlib.sha256(out.read_bytes()).hexdigest()[:12])
