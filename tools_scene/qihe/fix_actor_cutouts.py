# -*- coding: utf-8 -*-
"""Q 版剧情立绘抠图的两处统一修补（2026-10-11 用户：男主眼睛里透出别的颜色；有些图还有白边）。
以工作区根目录运行，直接改 assets/production/cultivation/household-v1 下的图，并同步正式清单里的校验值。可重复执行。
  1. 眼白、牙齿、高光是被线条围住的白色，抠白底时被当成镂空抠掉了，背景会从里面透出来。
     只补“脸的范围内”被围住的透明小块（补成白色不透明）；头发缝、发带之间的空隙在脸外面，不动。
  2. 白边：贴着透明区的近白色像素是没抠干净的白底，往里最多剥 3 圈。人物有深色描边，正常边缘不是白的。
  3. 头发缝里残留的小白块（脸以外、下巴以上、很小的纯白块）抠掉。"""
from pathlib import Path
import json, hashlib, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_actor_layout import face_box, FACE_OVERRIDE, DIR


def base_key(stem):
    for k in sorted((p.stem for p in DIR.glob('*.png')), key=len, reverse=True):
        if (stem == k or stem.startswith(k + '_')) and (DIR / f'{k}_normal.png').exists(): return k
    return stem


def fix(path):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).copy(); H, W = a.shape[:2]
    # 2. 白边
    peeled = 0
    for _ in range(3):
        opaque = a[..., 3] > 0
        edge = opaque & ~ndimage.binary_erosion(opaque, iterations=1)
        white = edge & (a[..., :3].min(-1) > 222) & ((a[..., :3].max(-1).astype(int) - a[..., :3].min(-1)) < 22)
        if not white.any(): break
        a[white, 3] = 0; peeled += int(white.sum())
    # 1. 脸里的洞
    k = base_key(path.stem)
    f = dict(FACE_OVERRIDE[k]) if k in FACE_OVERRIDE else face_box(path) or face_box(DIR / f'{k}_normal.png')
    filled = 0
    if f and 'w' in f:
        fh = f['y1'] - f['y0']; fy0, fy1 = (f['y0'] - fh * .12) * H, (f['y1'] + fh * .08) * H
        fx0, fx1 = (f['cx'] - f['w'] * .62) * W, (f['cx'] + f['w'] * .62) * W
        opaque = a[..., 3] > 128; lab, n = ndimage.label(~opaque)
        for i, sl in enumerate(ndimage.find_objects(lab), 1):
            if sl[0].start == 0 or sl[1].start == 0 or sl[0].stop == H or sl[1].stop == W: continue
            cy, cx = (sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2
            if not (fy0 <= cy <= fy1 and fx0 <= cx <= fx1): continue
            m = lab[sl] == i
            if m.sum() > H * W * .01: continue
            if m.sum() < 260:
                # 瞳孔、阴影里的小碎洞：补白会变成白点，改用洞口一圈的颜色
                pad = 4; ys, xs = slice(max(0, sl[0].start - pad), min(H, sl[0].stop + pad)), slice(max(0, sl[1].start - pad), min(W, sl[1].stop + pad))
                hole = lab[ys, xs] == i; ring = ndimage.binary_dilation(hole, iterations=3) & ~hole & (a[ys, xs, 3] > 128)
                col = np.median(a[ys, xs][ring][:, :3], axis=0) if ring.any() else (255, 255, 255)
                a[ys, xs][hole] = (*[int(c) for c in col], 255)
            else:
                region = a[sl]; region[m] = (255, 255, 255, 255)
            filled += 1
    # 3. 头发缝里没抠掉的小白块：脸以外、下巴以上、很小的纯白不透明块，是白底残留。
    if f and 'w' in f:
        white = (a[..., 3] > 128) & (a[..., :3].min(-1) > 236)
        lab, n = ndimage.label(white)
        for i, sl in enumerate(ndimage.find_objects(lab), 1):
            cy, cx = (sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2
            if cy > fy1 or (fy0 <= cy <= fy1 and fx0 <= cx <= fx1): continue
            m = lab[sl] == i
            if m.sum() > H * W * .0015: continue
            a[sl][m, 3] = 0; peeled += int(m.sum())
    if peeled or filled: Image.fromarray(a).save(path)
    return peeled, filled


def main():
    changed = {}
    for p in sorted(DIR.glob('*.png')):
        if p.stem.startswith('goose'): continue
        peeled, filled = fix(p)
        if peeled or filled: changed[p.as_posix()] = (peeled, filled)
    J = Path('docs/assets/production-assets.json'); d = json.loads(J.read_text()); M = Path('docs/assets/production-assets.md'); md = M.read_text()
    for a in d['assets']:
        if a['path'] in changed:
            sha = hashlib.sha256(Path(a['path']).read_bytes()).hexdigest()
            if sha != a['sha256']:
                a['sha256'] = sha; a['cutout_fix'] = '2026-10-11 fix_actor_cutouts.py：补脸内抠穿的眼白、剥白边'
                md = re.sub(r'^(\| ' + re.escape(a['id']) + r' \|.*\| )[0-9a-f]{12}( \|)$', lambda m: m.group(1) + sha[:12] + m.group(2), md, flags=re.M)
    J.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n'); M.write_text(md)
    print(len(changed), '张有改动；补洞：', {Path(k).stem: v[1] for k, v in changed.items() if v[1]})


if __name__ == '__main__': main()
