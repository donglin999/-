#!/usr/bin/env python3
"""离线拼出整张地图（底图＋道具＋人物站点），每个道具标上序号，给改摆放时对照用（2026-11-09 试玩审查）。
用法：python3 tools/map_props_view.py <场景id> <输出.png> [--crop x0,y0,x1,y1（世界像素）] [--scale 0.5]"""
import json, os, sys, argparse, glob
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '../game')
TS = 40
FONT = '/System/Library/Fonts/Hiragino Sans GB.ttc'

def find(key):
    img = json.load(open(os.path.join(GAME, 'data/runtime/img.json')))
    paths = json.load(open(os.path.join(GAME, 'data/js/production-assets.json')))['PRODUCTION_ASSET_PATHS']
    if key in img and 'src' in img[key]: return os.path.join(GAME, img[key]['src'])
    if key in paths: return os.path.join(GAME, paths[key])
    c = [p for p in glob.glob(os.path.join(GAME, 'assets/**', key + '*'), recursive=True) if not p.endswith('.import')]
    return c[0] if c else None

def render(sid, crop=None, scale=0.5):
    sc = json.load(open(os.path.join(GAME, 'data/runtime/sc.json')))[sid]
    W, H = int((sc.get('gw') or 48) * TS), int((sc.get('gh') or 27) * TS)
    can = Image.open(find(sc['bg'])).convert('RGBA').resize((W, H))
    k = sc.get('propK', 1)
    labels = []
    if sc.get('props') and sc.get('propImg'):
        at = Image.open(find(sc['propImg'])).convert('RGBA')
        for i, p in enumerate(sc['props']):
            sx, sy, w, h, x, y = [int(round(v)) for v in p[:6]]
            c = at.crop((sx, sy, sx + w, sy + h)).resize((max(1, round(w * k)), max(1, round(h * k))))
            can.paste(c, (round(x), round(y)), c)   # 道具可能伸出地图边（坐标为负），alpha_composite 不收负坐标
            labels.append((i, x + w * k / 2, y + h * k / 2, (x, y, x + w * k, y + h * k)))
    dr = ImageDraw.Draw(can); f = ImageFont.truetype(FONT, 22)
    for i, cx, cy, box in labels:
        dr.rectangle(box, outline=(255, 0, 0, 160), width=1)
        dr.text((cx - 10, cy - 12), str(i), fill=(255, 30, 30, 255), font=f, stroke_width=2, stroke_fill=(255, 255, 255))
    for n in sc.get('npcs', []):
        x, y = n['x'] * TS, n['y'] * TS
        dr.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(0, 90, 255, 220))
        dr.text((x + 8, y - 10), str(n.get('name', n.get('id')))[:8], fill=(0, 60, 200), font=ImageFont.truetype(FONT, 16), stroke_width=2, stroke_fill=(255, 255, 255))
    if crop: can = can.crop(crop)
    return can.resize((round(can.width * scale), round(can.height * scale)))

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('sid'); ap.add_argument('out'); ap.add_argument('--crop'); ap.add_argument('--scale', type=float, default=0.5)
    a = ap.parse_args()
    render(a.sid, tuple(int(v) for v in a.crop.split(',')) if a.crop else None, a.scale).convert('RGB').save(a.out)
