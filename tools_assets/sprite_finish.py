# -*- coding: utf-8 -*-
"""角色精灵后期：整张采用 Codex 重画结果 → 锁原表调色板 → 按原帧位置拼表 → 头脚行与轮廓核对。

规范见文档库 docs/art-pipeline.md「精灵与道具后期（2026-10-16 用户确定）」。在仓库根运行：

  python3 tools_assets/sprite_finish.py --raw <Codex 原图> --reference <原正式精灵表> \
      --jobs <prep 生成的 jobs.json> --job <任务名> --out art_sources/<批次>/finish/<名>

- jobs.json 沿用 character-pixel-fix-20261007/prep.py 的格式：scale（放大倍数）、bg（底色 RGB）、
  crop [y0,y1,x0,x1]（每帧在原生单元格里的裁切框）、frames [{row,col,x,y}]（每帧裁切框在原图里的左上角）。
- 原图有真实透明（10-13 起人物默认原生透明输出）就直接用 alpha；否则按 jobs 的 bg 用 forge 软抠图。
- 原生像素缩回用 forge pixel_reduce（强制按已知放大倍数与相位），调色板锁定为原表颜色。
- 只写 --out 新目录；不改正式素材。status=fail 的结果不得登记采用。
"""
import argparse, json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
FORGE = ROOT / 'tools_assets/vendor/agent_sprite_forge'
sys.path.insert(0, str(FORGE / 'generate2dsprite'))
import forge_matte  # noqa: E402

ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
ap.add_argument('--raw', required=True); ap.add_argument('--reference', required=True)
ap.add_argument('--jobs', required=True); ap.add_argument('--job', required=True)
ap.add_argument('--out', required=True)
ap.add_argument('--rows', type=int, default=4); ap.add_argument('--cols', type=int, default=4)
ap.add_argument('--sheet-scale', type=int, default=3, help='正式表每美术像素的放大倍数（默认 3）')
ap.add_argument('--min-iou', type=float, default=.80, help='轮廓重合度低于此值的帧标为待人工复核')
a = ap.parse_args()

out = Path(a.out)
if out.exists(): sys.exit(f'error: 输出目录已存在，不覆盖：{out}')
J = json.load(open(a.jobs))[a.job]
P = int(J['scale']); y0, y1, x0, x1 = J['crop']
ref = np.asarray(Image.open(a.reference).convert('RGBA'))
S = a.sheet_scale
cw, ch = ref.shape[1] // a.cols // S, ref.shape[0] // a.rows // S
ref1 = ref[::S, ::S]  # 原表的原生像素（正式表按整数倍最近邻放大）
assert (np.repeat(np.repeat(ref1, S, 0), S, 1) == ref).all(), '原表不是整数倍最近邻放大，无法取原生像素'
work = out / 'work'; work.mkdir(parents=True)

# 1. 抠图：原生透明直接用；纯色底用 forge 软抠图
raw = Image.open(a.raw).convert('RGBA'); ra = np.asarray(raw)[..., 3]
if (ra == 0).mean() > .05:
    keyed, kinfo = raw, {'quality': 'native_alpha'}
else:
    keyed, kinfo = forge_matte.key_still(raw, 'soft', '#%02x%02x%02x' % tuple(J['bg']), 'nearest')
keyed.save(work / 'keyed.png')

# 2. 缩回原生像素：强制已知放大倍数与相位，锁原表调色板
cols = np.unique(ref1[ref1[..., 3] > 0][:, :3], axis=0)
pal = {'schema': 'generate2dsprite.palette.v1', 'colors': [{'hex': '#%02x%02x%02x' % tuple(c)} for c in cols],
       'locked': True, 'source': a.reference}
json.dump(pal, open(work / 'palette.json', 'w'))
fx0, fy0 = J['frames'][0]['x'], J['frames'][0]['y']
r = subprocess.run([sys.executable, str(FORGE / 'generate2dsprite/pixel_reduce.py'), '--input', str(work / 'keyed.png'),
                    '--output-dir', str(work / 'reduce'), '--period', str(P), '--phase', str(fx0 % P), str(fy0 % P),
                    '--force', '--palette', str(work / 'palette.json')], capture_output=True, text=True)
if r.returncode: sys.exit('error: pixel_reduce 失败：' + (r.stdout + r.stderr).strip()[-400:])
one = np.asarray(Image.open(work / 'reduce/keyed.png').convert('RGBA'))

# 3. 拼表：每帧放回原单元格；只送第 0 列且原表该行各列相同时，整行复制
def cell(img, rr, cc): return img[rr * ch:(rr + 1) * ch, cc * cw:(cc + 1) * cw]
new1 = ref1.copy(); got = {}
for f in J['frames']:
    fx, fy = (f['x'] - fx0 % P) // P, (f['y'] - fy0 % P) // P
    c = np.zeros((ch, cw, 4), np.uint8); c[y0:y1, x0:x1] = one[fy:fy + y1 - y0, fx:fx + x1 - x0]
    got[(f['row'], f['col'])] = c
for rr in range(a.rows):
    for cc in range(a.cols):
        if (rr, cc) not in got and (rr, 0) in got and (cell(ref1, rr, cc) == cell(ref1, rr, 0)).all(): got[(rr, cc)] = got[(rr, 0)]
        if (rr, cc) in got: cell(new1, rr, cc)[:] = got[(rr, cc)]

# 4. 核对：头顶行、脚底行、轮廓重合度、调色板、透明度、孤立杂点
def rows_of(m): ys = np.where(m.any(1))[0]; return (int(ys[0]), int(ys[-1])) if len(ys) else (None, None)
checks, status = [], 'pass'
for (rr, cc) in sorted(got):
    m0, m1 = cell(ref1, rr, cc)[..., 3] > 0, cell(new1, rr, cc)[..., 3] > 0
    h0, f0 = rows_of(m0); h1, f1 = rows_of(m1)
    iou = float((m0 & m1).sum() / max((m0 | m1).sum(), 1))
    lab, n = ndimage.label(m1, structure=np.ones((3, 3))); sizes = ndimage.sum(m1, lab, range(1, n + 1)) if n else []
    item = {'frame': f'r{rr}c{cc}', 'head': [h0, h1], 'feet': [f0, f1], 'iou': round(iou, 3),
            'specks': int(sum(1 for s in sizes if s <= 2))}
    item['status'] = 'fail' if (h0 != h1 or f0 != f1) else ('review' if iou < a.min_iou or item['specks'] else 'pass')
    checks.append(item)
    if item['status'] == 'fail': status = 'fail'
    elif item['status'] == 'review' and status == 'pass': status = 'review'
vis = new1[..., 3] > 0
outside = {tuple(c) for c in np.unique(new1[vis][:, :3], axis=0)} - {tuple(c) for c in cols}
alpha_levels = sorted(int(v) for v in np.unique(new1[..., 3]))
if outside or alpha_levels != [0, 255]: status = 'fail'

sheet = np.repeat(np.repeat(new1, S, 0), S, 1)
Image.fromarray(sheet).save(out / Path(J['sheet']).with_suffix('.webp').name, lossless=True, quality=100, method=6)

# 对照图：每行第 0 帧，原表 | 新表，4 倍，浅底与深底
Z = 4; W, H = cw * S * Z, ch * S * Z
con = Image.new('RGB', (2 * (W + 12) * 2 + 12, a.rows * (H + 12) + 12), (245, 245, 240))
for rr in range(a.rows):
    for k, src in enumerate([ref, sheet]):
        for b, bg in enumerate([(225, 225, 225), (40, 44, 52)]):
            t = Image.new('RGBA', (W, H), bg + (255,))
            t.alpha_composite(Image.fromarray(src[rr * ch * S:(rr + 1) * ch * S, 0:cw * S]).resize((W, H), Image.NEAREST))
            con.paste(t.convert('RGB'), (12 + (k * 2 + b) * (W + 12), 12 + rr * (H + 12)))
con.save(out / 'contact.png')

rep = {'tool': 'tools_assets/sprite_finish.py', 'raw': a.raw, 'reference': a.reference, 'job': a.job, 'status': status,
       'key': kinfo.get('quality'), 'key_qa': {k: kinfo.get('qa', {}).get(k) for k in ('opaque_key_px', 'outer_ring_spill_fraction')},
       'period': P, 'palette_locked': len(cols), 'colors_outside_palette': len(outside), 'alpha_levels': alpha_levels,
       'frames': checks, 'forge': 'tools_assets/vendor/agent_sprite_forge (5324342)'}
json.dump(rep, open(out / 'report.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: rep[k] for k in ('status', 'key', 'palette_locked', 'colors_outside_palette', 'alpha_levels')}, ensure_ascii=False),
      '复核/失败帧:', [c['frame'] + ':' + c['status'] for c in checks if c['status'] != 'pass'] or '无')
