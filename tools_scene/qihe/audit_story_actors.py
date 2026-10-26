# -*- coding: utf-8 -*-
"""进城前剧情素材排查（2026-10-21 用户：部分素材还是有白边、大小不均一）。
以工作区根目录运行：python3 tools_scene/qihe/audit_story_actors.py <usage.txt> <输出目录>
usage.txt 是实机采集的“每张立绘在舞台上的 top／height”（格式见 docs/updates/evidence/2026-10-21-actor-fringe-size/usage-before.txt）。
  1. 白边：透明边缘带（贴着透明区 2 像素内）上的高亮低饱和像素、alpha 1～250 的半透明白像素、贴边的白块；
  2. 大小：按站位锚点算舞台上的脸高、脸线，再用 face_box 独立量一次脸作交叉核对；
  3. 拼总览图：每人每档按舞台比例排开，画出目标脸带（红线）和独立量到的脸框（绿框）。
输出 report.json、overview-size.png、overview-fringe.png。"""
from pathlib import Path
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_actor_layout as L

ROOT = Path('assets/production/cultivation')
FONT = next((ImageFont.truetype(f, 15) for f in ('/System/Library/Fonts/PingFang.ttc', '/System/Library/Fonts/STHeiti Light.ttc') if Path(f).exists()), ImageFont.load_default())


def read_usage(path):
    rows, bgs = [], []
    for ln in Path(path).read_text().splitlines():
        if ln.startswith('#BG '): bgs.append(ln[4:].split()); continue
        if not ln.strip() or ln.startswith('#'): continue
        who, src, facing, top, h, scenes = ln.split()
        rows.append(dict(who=who, src=src, facing=facing, top=float(top), h=float(h), scenes=scenes.split(',')))
    return rows, bgs


def fringe(path):
    a = np.asarray(Image.open(path).convert('RGBA')).astype(int); al = a[..., 3]; rgb = a[..., :3]
    mn, mx = rgb.min(-1), rgb.max(-1); whiteish = (mn >= 200) & (mx - mn < 32)
    clear = al == 0; opaque = ~clear
    band = opaque & ndimage.binary_dilation(clear, iterations=2)
    edge_white = band & whiteish
    semi_white = (al >= 1) & (al <= 250) & whiteish
    # 贴着透明区的成块白（≥40 像素）：抠图残留的白底
    lab, n = ndimage.label(opaque & (mn >= 228) & (mx - mn < 24))
    blobs = []
    if n:
        touch = ndimage.binary_dilation(clear, iterations=1)
        for i, sl in enumerate(ndimage.find_objects(lab), 1):
            m = lab[sl] == i; s = int(m.sum())
            if s >= 40 and (touch[sl] & m).any(): blobs.append(dict(px=s, y=(sl[0].start + sl[0].stop) // 2, x=(sl[1].start + sl[1].stop) // 2))
    return dict(band=int(band.sum()), edge_white=int(edge_white.sum()), semi_white=int(semi_white.sum()),
                ratio=round(edge_white.sum() / max(1, band.sum()) * 100, 2), blobs=sorted(blobs, key=lambda b: -b['px'])[:8],
                semi_alpha=int(((al >= 1) & (al <= 250)).sum()))


def anchor_for(r):
    """站位脚本实际用的锚点（与 build_actor_layout.py 同一来源），返回 (锚点, 来源说明)。"""
    stem = Path(r['src']).stem
    if r['who'] == 'duo': return L.DUO_FACES.get(stem), 'DUO_FACES'
    if r['who'] == 'goose': return None, 'MANUAL'
    if stem.endswith('_left'):
        f = L.LEFT_FACES.get(stem, False)
        if f is None: return L.REVIEWED_FACES[stem[:-5]], 'LEFT_FACES→REVIEWED'
        if f: return f, 'LEFT_FACES'
        return L.face_box(ROOT / r['src']), 'LEFT 自动量'
    return None, 'CSS'


def measure(r):
    p = ROOT / r['src']; f = L.face_box(p)
    who = r['who']; k = 'neighbor' if who == 'recipient' else who
    target_h = L.FACE * L.FACE_SCALE.get(k.replace('hero_', 'hero_') if not k.startswith('hero') else k, 1)
    target_line = L.LINE + L.SHORTER.get(k, 0)
    out = dict(auto=None)
    if f:
        out['auto'] = dict(y0=round(f['y0'], 3), y1=round(f['y1'], 3), cx=round(f['cx'], 3))
        out['stage_face_h'] = round((f['y1'] - f['y0']) * r['h'], 2)
        out['stage_line'] = round(r['top'] + (f['y0'] + f['y1']) / 2 * r['h'], 2)
    out['target_h'] = round(target_h, 2); out['target_line'] = target_line
    return out


def tile(r, m, H=360):
    p = ROOT / r['src']; im = Image.open(p).convert('RGBA'); w, h = im.size
    sh = r['h'] / 100 * H; sw = sh * w / h; im = im.resize((max(1, int(sw)), max(1, int(sh))), Image.LANCZOS)
    T = Image.new('RGB', (230, H + 40), (58, 52, 46)); top = int(r['top'] / 100 * H)
    cx = (m['auto']['cx'] if m['auto'] else .5) * sw; ox = int(115 - cx)
    T.paste(im, (ox, top), im); d = ImageDraw.Draw(T)
    th, tl = m['target_h'] / 100 * H, m['target_line'] / 100 * H
    for y in (tl - th / 2, tl, tl + th / 2): d.line([(0, y), (230, y)], fill=(255, 60, 60), width=1)
    if m['auto']:
        a = m['auto']; d.rectangle([ox + a['cx'] * sw - 30, top + a['y0'] * sh, ox + a['cx'] * sw + 30, top + a['y1'] * sh], outline=(60, 255, 90), width=2)
    d.rectangle([0, H, 230, H + 40], fill=(20, 20, 20))
    d.text((4, H + 2), Path(r['src']).stem[:26], fill=(255, 255, 255), font=FONT)
    if 'stage_face_h' in m: d.text((4, H + 20), f"脸高{m['stage_face_h']}/{m['target_h']} 线{m['stage_line']}/{m['target_line']}", fill=(255, 220, 120), font=FONT)
    return T


def fringe_tile(path, fr, S=230):
    """把白边最重的一块放大贴在深色底上（深色底最能看出白边）。"""
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(int); al = a[..., 3]; mn = a[..., :3].min(-1)
    clear = al == 0; band = ~clear & ndimage.binary_dilation(clear, iterations=2); bad = (band & (mn >= 200)) | ((al >= 1) & (al <= 250) & (mn >= 200))
    if fr['blobs']: cy, cx = fr['blobs'][0]['y'], fr['blobs'][0]['x']
    elif bad.any():
        dens = ndimage.uniform_filter(bad.astype(float), 64); cy, cx = np.unravel_index(dens.argmax(), dens.shape)
    else: cy, cx = im.size[1] // 3, im.size[0] // 2
    half = 64; box = (max(0, cx - half), max(0, cy - half), max(0, cx - half) + 2 * half, max(0, cy - half) + 2 * half)
    crop = im.crop(box).resize((S, S), Image.NEAREST); T = Image.new('RGB', (S, S + 40), (24, 28, 36)); T.paste(crop, (0, 0), crop)
    d = ImageDraw.Draw(T); d.text((4, S + 2), Path(path).stem[:26], fill=(255, 255, 255), font=FONT)
    d.text((4, S + 20), f"边白{fr['ratio']}% 半透白{fr['semi_white']} 白块{len(fr['blobs'])}", fill=(255, 200, 120), font=FONT)
    return T


def grid(tiles, cols, path):
    if not tiles: return
    w, h = tiles[0].size; G = Image.new('RGB', (w * cols, h * ((len(tiles) + cols - 1) // cols)), (0, 0, 0))
    for i, t in enumerate(tiles): G.paste(t, ((i % cols) * w, (i // cols) * h))
    G.save(path)


def main():
    usage, bgs = read_usage(sys.argv[1]); out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    rep = dict(actors=[], backgrounds=[])
    seen = set(); size_tiles = []; fr_rows = []
    for r in sorted(usage, key=lambda r: (r['who'].replace('hero_', 'hero~'), r['src'])):
        key = (r['src'], r['top'], r['h'])
        if key in seen: continue
        seen.add(key)
        fr = fringe(ROOT / r['src']); m = measure(r) if r['who'] not in ('goose', 'fullduo') else dict(auto=None, target_h=L.FACE, target_line=L.LINE)
        anc, srcname = anchor_for(r)
        if anc: m['anchor'] = dict(y0=anc['y0'], y1=anc['y1'], cx=anc['cx']); m['anchor_from'] = srcname
        rep['actors'].append(dict(**r, fringe=fr, size=m))
        if r['who'] != 'fullduo': size_tiles.append(tile(r, m))
        fr_rows.append((fr, ROOT / r['src']))
    # 只用在头像栏、没上过大立绘的图也查白边
    for bg in bgs:
        p = ROOT / bg[0]; a = np.asarray(Image.open(p).convert('RGBA')).astype(int); H, W = a.shape[:2]
        edges = {k: v for k, v in dict(top=a[:3], bottom=a[-3:], left=a[:, :3], right=a[:, -3:]).items()}
        white_edge = {k: round(float(((v[..., :3].min(-1) >= 235)).mean() * 100), 1) for k, v in edges.items()}
        rep['backgrounds'].append(dict(src=bg[0], size=[W, H], alpha_min=int(a[..., 3].min()), white_border_pct=white_edge, scenes=bg[1]))
    grid(size_tiles, 10, out / 'overview-size.png')
    fr_rows.sort(key=lambda t: -(t[0]['ratio'] + t[0]['semi_white'] / 500 + len(t[0]['blobs'])))
    grid([fringe_tile(p, fr) for fr, p in fr_rows], 10, out / 'overview-fringe.png')
    (out / 'report.json').write_text(json.dumps(rep, ensure_ascii=False, indent=1) + '\n')
    print('立绘', len(rep['actors']), '张；背景', len(rep['backgrounds']), '张')
    for e in rep['actors']:
        s, f = e['size'], e['fringe']
        flag = []
        if 'stage_face_h' in s and abs(s['stage_face_h'] - s['target_h']) / s['target_h'] > .1: flag.append('脸高')
        if 'stage_line' in s and abs(s['stage_line'] - s['target_line']) > 1.5: flag.append('脸线')
        if f['ratio'] > 3 or f['semi_white'] > 300 or f['blobs']: flag.append('白边')
        print(f"{Path(e['src']).stem:32s} 脸高 {s.get('stage_face_h','-')}/{s['target_h']} 脸线 {s.get('stage_line','-')}/{s['target_line']}  边白{f['ratio']}% 半透白{f['semi_white']} 白块{[b['px'] for b in f['blobs']]} {' '.join(flag)}")
    for b in rep['backgrounds']: print(b['src'], b['size'], 'alpha最小', b['alpha_min'], '白框%', b['white_border_pct'])


if __name__ == '__main__': main()
