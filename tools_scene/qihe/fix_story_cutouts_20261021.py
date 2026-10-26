# -*- coding: utf-8 -*-
"""进城前剧情立绘的第二轮抠图修补（2026-10-21 用户：部分素材还是有白边）。
以工作区根目录运行：python3 tools_scene/qihe/fix_story_cutouts_20261021.py [--dry]
排查脚本 audit_story_actors.py 找出两类问题，逐处人工看过（候选图见 docs/updates/evidence/2026-10-21-actor-fringe-size/）：
  1. 白底残留块：两腿之间、发圈里、颈后发丝间被线条围住的白底，抠图时没抠掉，深色背景下是一块白。
     按 docs/updates/evidence/2026-10-21-actor-fringe-size/white-blocks.json 的种子点泛洪（近白、平涂），连同外圈 2 像素的浅色过渡一起改为透明。衣服上的白不在名单里。
  2. 白发、白发带里被抠穿的小洞：白色区域里不贴图边的小透明孔（≤600 像素，周围一圈多半是浅色），按洞口一圈的颜色补实。
改前原图移到 _attic/2026-10-21-cutout-fix/（带 manifest.json 与 restore.sh），并同步正式清单的校验值。可重复执行（已修过的找不到白块就跳过）。"""
from pathlib import Path
import json, hashlib, re, shutil, sys
import numpy as np
from PIL import Image
from scipy import ndimage

HV = Path('assets/production/cultivation/household-v1')
HOLE_FILES = ['neighbor', 'neighbor_normal', 'neighbor_smile', 'neighbor_worry', 'neighbor_sad', 'neighbor_serious', 'neighbor_surprise',
              'ye', 'ye_normal', 'ye_smile', 'ye_serious', 'ye_sad', 'ye_surprise', 'ye_worry', 'ye_angry']
ATTIC = Path('../_attic/2026-10-21-cutout-fix')


def load_seeds():
    """种子点来自排查候选（cands.json：file, seed），只取名单里的文件。"""
    p = Path('docs/updates/evidence/2026-10-21-actor-fringe-size/white-blocks.json')
    return json.loads(p.read_text()) if p.exists() else {}


def flat_white(a):
    mn, mx = a[..., :3].min(-1), a[..., :3].max(-1)
    return (a[..., 3] > 200) & (mn >= 238) & ((mx - mn) < 14)


def remove_blocks(a, seeds):
    flat = flat_white(a); lab, _ = ndimage.label(flat); kill = np.zeros(flat.shape, bool)
    for y, x in seeds:
        i = lab[y, x]
        if i: kill |= lab == i
    if not kill.any(): return 0
    mn = a[..., :3].min(-1); ring = ndimage.binary_dilation(kill, iterations=2) & ~kill & (mn >= 190)   # 浅色过渡，不碰深色描边
    kill |= ring; a[kill, 3] = 0; return int(kill.sum())


def fill_holes(a):
    H, W = a.shape[:2]; clear = a[..., 3] < 32; lab, _ = ndimage.label(clear); n = 0
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        if sl[0].start == 0 or sl[1].start == 0 or sl[0].stop == H or sl[1].stop == W: continue
        m = lab[sl] == i
        if m.sum() > 600: continue
        pad = 4; ys = slice(max(0, sl[0].start - pad), min(H, sl[0].stop + pad)); xs = slice(max(0, sl[1].start - pad), min(W, sl[1].stop + pad))
        hole = lab[ys, xs] == i; ring = ndimage.binary_dilation(hole, iterations=3) & ~hole & (a[ys, xs, 3] > 128)
        if not ring.any(): continue
        rc = a[ys, xs][ring][:, :3]
        if (rc.min(-1) >= 170).mean() < .6: continue            # 只补白发、白发带里的洞；深色头发缝是真的空隙
        col = np.median(rc, axis=0); sub = a[ys, xs]; sub[hole] = (*[int(c) for c in col], 255); n += 1
    return n


def main():
    dry = '--dry' in sys.argv; seeds = load_seeds(); changed = {}
    names = sorted(set(seeds) | set(HOLE_FILES))
    for name in names:
        p = HV / f'{name}.png'
        if not p.exists(): continue
        a = np.asarray(Image.open(p).convert('RGBA')).copy()
        removed = remove_blocks(a, [tuple(s) for s in seeds.get(name, [])]); filled = fill_holes(a) if name in HOLE_FILES else 0
        if not (removed or filled): continue
        changed[name] = dict(removed_px=removed, holes_filled=filled)
        if dry: continue
        ATTIC.mkdir(parents=True, exist_ok=True); bk = ATTIC / 'household-v1' / p.name
        if not bk.exists(): bk.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(p, bk)
        Image.fromarray(a).save(p)
    print(json.dumps(changed, ensure_ascii=False))
    if dry or not changed: return
    # 回收站说明与恢复脚本
    man = ATTIC / 'manifest.json'; old = json.loads(man.read_text()) if man.exists() else dict(reason='', files={})
    old['reason'] = '2026-10-21 进城前剧情素材白边整改：fix_story_cutouts_20261021.py 修补前的原图（白底残留块、白发小洞）'
    old['files'].update({f'xiaojianghu-legacy-prologue/{HV}/{k}.png': dict(backup=f'household-v1/{k}.png', **v) for k, v in changed.items()})
    man.write_text(json.dumps(old, ensure_ascii=False, indent=1) + '\n')
    (ATTIC / 'restore.sh').write_text('#!/bin/sh\n# 恢复本次修补前的立绘原图（在 _attic/2026-10-21-cutout-fix 目录下运行）\ncd "$(dirname "$0")"\n' +
        ''.join(f'cp household-v1/{Path(k).name} ../../xiaojianghu-legacy-prologue/{HV}/{Path(k).name}\n' for k in sorted(old['files'])) +
        'echo "已恢复；记得把 docs/assets/production-assets.json/.md 的校验值改回（或重跑本脚本前的版本）"\n')
    J = Path('docs/assets/production-assets.json'); d = json.loads(J.read_text()); M = Path('docs/assets/production-assets.md'); md = M.read_text()
    for x in d['assets']:
        k = Path(x['path']).stem
        if x['path'].startswith(str(HV) + '/') and k in changed:
            sha = hashlib.sha256(Path(x['path']).read_bytes()).hexdigest()
            if sha != x['sha256']:
                x['sha256'] = sha; x['cutout_fix_20261021'] = 'fix_story_cutouts_20261021.py：去白底残留块／补白发小洞，原图在 _attic/2026-10-21-cutout-fix'
                md = re.sub(r'^(\| ' + re.escape(x['id']) + r' \|.*\| )[0-9a-f]{12}( \|)$', lambda m: m.group(1) + sha[:12] + m.group(2), md, flags=re.M)
    J.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n'); M.write_text(md)


if __name__ == '__main__': main()
