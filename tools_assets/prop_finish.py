# -*- coding: utf-8 -*-
"""道具/图标后期：统一 forge 像素风格（选择性描边、轻度提亮、OKLab 调色板、透明度二值），再整数倍放大。

规范见文档库 docs/art-pipeline.md「精灵与道具后期（2026-10-16 用户确定）」。在仓库根运行：

  python3 tools_assets/prop_finish.py --raw <原图> --names basket,bundle --heights 16,14 \
      --out art_sources/<批次>/finish/props [--bg 0,255,255] [--display-scale 2] [--canvas 40x40]

- 一张原图可含多件道具：按从左到右的顺序对应 --names；--heights 是各件的原生像素高度（只给一个则全部相同）。
- 原图有真实透明（10-13 起道具默认原生透明输出）就直接用 alpha；纯色底原图用 --bg 指定底色，forge 软抠图。
- 像素后期调用 forge finish_frames.py pixel（默认 --outline selective，保留其默认的对比与饱和提亮）。
- 只写 --out 新目录；不改正式素材。
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
ap.add_argument('--raw', required=True); ap.add_argument('--names', required=True)
ap.add_argument('--heights', required=True, help='原生像素高度，逗号分隔')
ap.add_argument('--out', required=True)
ap.add_argument('--bg', help='纯色底 R,G,B；原图带真实透明时不需要')
ap.add_argument('--display-scale', type=int, default=2)
ap.add_argument('--canvas', help='放大后的固定画布 宽x高，底边居中放置（如 40x40）；默认紧贴裁切')
ap.add_argument('--outline', default='selective', choices=['selective', 'dark', 'none'])
ap.add_argument('--min-area', type=int, default=2000, help='原图上小于此像素数的连通块视为碎屑')
a = ap.parse_args()

out = Path(a.out)
if out.exists(): sys.exit(f'error: 输出目录已存在，不覆盖：{out}')
names = a.names.split(','); hs = [int(h) for h in a.heights.split(',')]
hs = hs * len(names) if len(hs) == 1 else hs
assert len(hs) == len(names), '--heights 个数与 --names 不一致'
work = out / 'work'; work.mkdir(parents=True)

raw = Image.open(a.raw).convert('RGBA')
if (np.asarray(raw)[..., 3] == 0).mean() > .05:
    keyed, kinfo = raw, {'quality': 'native_alpha'}
else:
    if not a.bg: sys.exit('error: 原图没有透明背景，请用 --bg 指定底色')
    keyed, kinfo = forge_matte.key_still(raw, 'soft', '#%02x%02x%02x' % tuple(int(v) for v in a.bg.split(',')), 'lanczos')
k = np.asarray(keyed)
lab, n = ndimage.label(k[..., 3] > 16, structure=np.ones((3, 3)))
objs = ndimage.find_objects(lab); sizes = ndimage.sum(k[..., 3] > 16, lab, range(1, n + 1))
big = sorted([i for i in range(n) if sizes[i] >= a.min_area], key=lambda i: objs[i][1].start)
if len(big) != len(names): sys.exit(f'error: 原图找到 {len(big)} 件道具，--names 给了 {len(names)} 个')

rep = {'tool': 'tools_assets/prop_finish.py', 'raw': a.raw, 'key': kinfo.get('quality'),
       'key_qa': {q: kinfo.get('qa', {}).get(q) for q in ('opaque_key_px', 'outer_ring_spill_fraction')},
       'outline': a.outline, 'display_scale': a.display_scale, 'forge': 'tools_assets/vendor/agent_sprite_forge (5324342)', 'items': {}}
for name, h, i in zip(names, hs, big):
    sl = objs[i]; pad = 6
    crop = k[max(sl[0].start - pad, 0):sl[0].stop + pad, max(sl[1].start - pad, 0):sl[1].stop + pad].copy()
    other =lab[max(sl[0].start - pad, 0):sl[0].stop + pad, max(sl[1].start - pad, 0):sl[1].stop + pad]
    crop[(other != 0) & (other != i + 1)] = 0  # 只保留本件，裁切框里挤进来的其他件清掉
    fr = work / name; fr.mkdir(); Image.fromarray(crop).save(fr / f'{name}_0000.png')
    r = subprocess.run([sys.executable, str(FORGE / 'video2dsprite/finish_frames.py'), 'pixel', '--frames', str(fr),
                        '--output-dir', str(work / f'{name}_finish'), '--target-height', str(h),
                        '--display-sizes', f'1x,{a.display_scale}x', '--outline', a.outline, '--loop-policy', 'oneshot'],
                       capture_output=True, text=True)
    if r.returncode: sys.exit(f'error: {name} 像素后期失败：' + (r.stdout + r.stderr).strip()[-400:])
    one = Image.open(work / f'{name}_finish/frames/{name}_0000.png').convert('RGBA')
    # 细长小物件（如 12×5 的绳子）可能被 forge 的碎屑清理整件抹掉：结果为空或高度明显不足就报错，不静默输出
    bb = one.getbbox()
    if bb is None or bb[3] - bb[1] < max(2, round(h * .6)):
        sys.exit(f'error: {name} 后期结果为空或高度不足（目标 {h}，得到 {0 if bb is None else bb[3] - bb[1]}）；细小物件请加大 --heights 或改 --outline none 后人工核对')
    one = one.crop(bb)
    big_img = one.resize((one.width * a.display_scale, one.height * a.display_scale), Image.NEAREST)
    if a.canvas:
        cw, ch = (int(v) for v in a.canvas.split('x'))
        if big_img.width > cw or big_img.height > ch: sys.exit(f'error: {name} 放大后 {big_img.size} 超出画布 {a.canvas}')
        c = Image.new('RGBA', (cw, ch), (0, 0, 0, 0)); c.alpha_composite(big_img, ((cw - big_img.width) // 2, ch - big_img.height)); big_img = c
    p = out / f'{name}.webp'; big_img.save(p, lossless=True, quality=100, method=6)
    o = np.asarray(one)
    rep['items'][name] = {'file': str(p), 'native': list(one.size), 'size': list(big_img.size),
                          'colors': int(len(np.unique(o[o[..., 3] > 0][:, :3], axis=0))),
                          'alpha_levels': sorted(int(v) for v in np.unique(o[..., 3]))}

# 对照图：每件 放大查看（浅底/深底）+ 游戏内实际大小
C = 300; items = list(rep['items'].items())
con = Image.new('RGB', (12 + len(items) * (C + 12), 12 + 2 * (C + 12) + 90), (245, 245, 240))
for j, (name, it) in enumerate(items):
    im = Image.open(it['file']).convert('RGBA'); im = im.crop(im.getbbox())
    z = max(1, min((C - 20) // im.width, (C - 20) // im.height)); zim = im.resize((im.width * z, im.height * z), Image.NEAREST)
    for b, bg in enumerate([(225, 225, 225), (40, 44, 52)]):
        t = Image.new('RGBA', (C, C), bg + (255,)); t.alpha_composite(zim, ((C - zim.width) // 2, (C - zim.height) // 2))
        con.paste(t.convert('RGB'), (12 + j * (C + 12), 12 + b * (C + 12)))
    g = Image.new('RGBA', (C, 78), (210, 200, 185, 255)); g.alpha_composite(Image.open(it['file']).convert('RGBA'), ((C - im.width) // 2, 8))
    con.paste(g.convert('RGB'), (12 + j * (C + 12), 12 + 2 * (C + 12)))
con.save(out / 'contact.png')
json.dump(rep, open(out / 'report.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps({'key': rep['key'], 'items': {n: (v['native'], v['size'], v['colors'], v['alpha_levels']) for n, v in rep['items'].items()}}, ensure_ascii=False))
