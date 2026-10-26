# -*- coding: utf-8 -*-
"""按“家族”配准同一人各档的脸框，给出建议锚点和改前／改后对比条（2026-10-21 用户：大小不均一）。
家族：朝右各档 → 本人 _normal；朝左各档 *_left → 本人 _normal_left；萧白空手版 hero-empty → 同发型空手 _normal。
每个家族的参考图锚点：朝右用站位表 actors.*.face；朝左用站位表 facing_left.*_normal.face；空手版参考锚点由命令行 --hero 给出。
以工作区根目录运行：python3 tools_scene/qihe/propose_face_anchors.py 人物id,... 输出目录 [--hero hero_long=y0,y1,cx ...]
输出 <目录>/anchors-<人物>.json 与 <目录>/strip-<人物>.png（上排改前、下排改后，红线为目标脸带）。"""
from pathlib import Path
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_actor_layout as L
from register_faces import register

C = Path('assets/production/cultivation'); HV = C / 'household-v1'; HE = C / 'hero-empty'
FONT = ImageFont.truetype('/System/Library/Fonts/STHeiti Light.ttc', 15)


def lay(k, f):
    fh = f[1] - f[0]; mid = (f[0] + f[1]) / 2; h = L.FACE * L.FACE_SCALE.get(k, 1) / fh
    return dict(top=round(L.LINE + L.SHORTER.get(k, 0) - mid * h, 2), height=round(h, 2), dx=round((.5 - f[2]) * 100, 2))


def current(layout, k, p):
    s = p.stem
    if p.parent == HE: return layout['actors'][k]
    if s.endswith('_left'): return layout['facing_left'].get(f"{k}_{s[len(k) + 1:-5] or 'fun'}")
    return layout['moods'].get(f"{k}_{s[len(k) + 1:] or 'fun'}") or layout['actors'][k]


def family(k):
    own = lambda p: p.stem == k or (p.stem.startswith(k + '_') and not p.stem.startswith('peishu') if k == 'pei' else p.stem == k or p.stem.startswith(k + '_'))
    if k.startswith('hero_'): return [(HE / f'{k}_empty_normal.png', sorted(HE.glob(f'{k}_empty_*.png')), 'hero')]
    fs = [p for p in sorted(HV.glob(f'{k}*.png')) if own(p)]
    right = [p for p in fs if not p.stem.endswith('_left')]; left = [p for p in fs if p.stem.endswith('_left')]
    out = [(HV / f'{k}_normal.png' if (HV / f'{k}_normal.png').exists() else HV / f'{k}.png', right, 'right')]
    if left: out.append((HV / f'{k}_normal_left.png', left, 'left'))
    return out


def tile(p, st, k, H=300, TW=170):
    im = Image.open(p).convert('RGBA'); w0, h0 = im.size; sh = st['height'] / 100 * H; sw = sh * w0 / h0
    im = im.resize((int(sw), int(sh)), Image.LANCZOS); Y0 = .30; T = Image.new('RGB', (TW, int(H * .55)), (70, 64, 58))
    T.paste(im, (int(TW / 2 - sw / 2 + st.get('dx', 0) / 100 * sw), int((st['top'] / 100 - Y0) * H)), im); d = ImageDraw.Draw(T)
    fh, line = L.FACE * L.FACE_SCALE.get(k, 1), L.LINE + L.SHORTER.get(k, 0)
    for y in (line - fh / 2, line, line + fh / 2): d.line([(0, (y / 100 - Y0) * H), (TW, (y / 100 - Y0) * H)], fill=(255, 60, 60))
    d.text((2, 2), p.stem.replace(k + '_', '')[:18], fill=(255, 255, 255), font=FONT)
    return T


def main():
    ks = sys.argv[1].split(','); out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    hero = {a.split('=')[0]: [float(v) for v in a.split('=')[1].split(',')] for a in sys.argv[sys.argv.index('--hero') + 1:]} if '--hero' in sys.argv else {}
    layout = json.loads(Path('docs/assets/cultivation-actor-layout.json').read_text())
    for k in ks:
        res = {}; before = []; after = []
        for ref, fs, kind in family(k):
            if kind == 'hero': a = hero[k]
            elif kind == 'left': a = layout['facing_left'][f'{k}_normal']['face']
            else: a = layout['actors'][k]['face']
            for p in fs:
                r = register(ref, a, p) if p != ref else dict(y0=a[0], y1=a[1], cx=a[2], score=1.0, k=1.0)
                cur = current(layout, k, p) or layout['actors'][k]; new = lay(k, (r['y0'], r['y1'], r['cx']))
                res[p.stem] = dict(family=kind, ref=ref.stem, anchor=[r['y0'], r['y1'], r['cx']], score=r['score'], current=dict(top=cur['top'], height=cur['height'], dx=cur.get('dx', 0)), proposed=new)
                before.append(tile(p, cur, k)); after.append(tile(p, new, k))
        (out / f'anchors-{k}.json').write_text(json.dumps(res, ensure_ascii=False, indent=1) + '\n')
        n = len(before); w, h = before[0].size; S = Image.new('RGB', (w * n, h * 2 + 4), (0, 0, 0))
        for i, (b, a) in enumerate(zip(before, after)): S.paste(b, (i * w, 0)); S.paste(a, (i * w, h + 4))
        S.save(out / f'strip-{k}.png'); print(k, n, '张')


if __name__ == '__main__': main()
