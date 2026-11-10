#!/usr/bin/env python3
"""局部重画：从一张底图或道具图集里裁出一块，交给生图只改其中一处，再只把改动的那一小块贴回原图
（2026-11-09 第四十八轮评审定的做法：老树去石凳、楼梯口饭桌、幌杆穿檐等）。

用法（三步，可以分开跑，也可以 all 一次跑完）：
  python3 tools/patch_region.py prep  <工作目录> <原图> --ctx x,y,w,h --mask x,y,w,h [--mask ...]
  python3 tools/patch_region.py gen   <工作目录>             # 需先在工作目录写好 prompt.txt（首行 Model 行，R-生图-02）
  python3 tools/patch_region.py finish <工作目录> [--out 新图路径]   # 不给 --out 只出预览，不动原图
  python3 tools/patch_region.py all   <工作目录> <原图> --ctx ... --mask ...   # prep＋gen＋出预览

- ctx：送去生图的那一块（原图像素坐标），要比改动处大一圈，生图才看得懂上下文。
- mask：允许改的范围（原图像素坐标，可给多个），只有这里面的像素会贴回原图，边缘羽化 3 像素；其余像素一律保持原样。
- 原图带透明（道具图集）时按透明出图，并加 --opaque-fix（当前源 alpha 最高 254，R-生图-04）。
- 工作目录里留下：ref.png（送去的放大图）、edit.png（生图原样）、patched_ctx.png（贴回后的那一块）、cmp.png（改前改后对照，左原右新）。
"""
import argparse, json, os, subprocess, sys
from PIL import Image, ImageFilter, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
IMGGEN = os.path.join(HERE, '../../xiaojianghu/tools_common/imggen.py')
CANVAS = [(1024, 1024), (1536, 1024), (1024, 1536)]


def box(s):
    return tuple(int(round(float(v))) for v in s.split(','))


def prep(wd, src, ctx, masks):
    os.makedirs(wd, exist_ok=True)
    im = Image.open(src)
    alpha = im.mode in ('RGBA', 'LA') or 'transparency' in im.info
    im = im.convert('RGBA')
    x, y, w, h = ctx
    crop = im.crop((x, y, x + w, y + h))
    # 选最贴合宽高比的画布，按整数倍最近邻放大（像素颗粒不糊），居中摆放
    cw, ch = min(CANVAS, key=lambda c: abs(c[0] / c[1] - w / h))
    f = max(1, min(cw // w, ch // h))
    if f == 1 and (w > cw or h > ch):
        raise SystemExit('裁的块比画布还大，缩小 --ctx')
    big = crop.resize((w * f, h * f), Image.NEAREST)
    ox, oy = (cw - big.width) // 2, (ch - big.height) // 2
    bg = (0, 0, 0, 0) if alpha else tuple(crop.convert('RGB').resize((1, 1), Image.BOX).getpixel((0, 0))) + (255,)
    can = Image.new('RGBA', (cw, ch), bg)
    can.paste(big, (ox, oy))
    can.save(os.path.join(wd, 'ref.png'))
    crop.save(os.path.join(wd, 'orig_ctx.png'))
    json.dump({'src': os.path.abspath(src), 'ctx': ctx, 'masks': masks, 'f': f, 'off': [ox, oy], 'canvas': [cw, ch], 'alpha': alpha},
              open(os.path.join(wd, 'meta.json'), 'w'), ensure_ascii=False)
    print('已裁出 %dx%d，放大 %d 倍，画布 %dx%d：%s/ref.png' % (w, h, f, cw, ch, wd))


def gen(wd):
    m = json.load(open(os.path.join(wd, 'meta.json')))
    pf = os.path.join(wd, 'prompt.txt')
    if not os.path.exists(pf):
        raise SystemExit('先写 %s' % pf)
    cmd = [sys.executable, IMGGEN, '--prompt-file', pf, '--out', os.path.join(wd, 'edit.png'), '--ref', os.path.join(wd, 'ref.png'),
           '--size', '%dx%d' % tuple(m['canvas']), '--background', 'transparent' if m['alpha'] else 'opaque']
    if m['alpha']:
        cmd.append('--opaque-fix')
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(r.stdout[-800:], r.stderr[-800:])
    if r.returncode or not os.path.exists(os.path.join(wd, 'edit.png')):
        raise SystemExit('生图失败')


def finish(wd, out=None):
    m = json.load(open(os.path.join(wd, 'meta.json')))
    x, y, w, h = m['ctx']; f = m['f']; ox, oy = m['off']
    ed = Image.open(os.path.join(wd, 'edit.png')).convert('RGBA')
    if ed.size != tuple(m['canvas']):
        ed = ed.resize(tuple(m['canvas']), Image.LANCZOS)
    ed = ed.crop((ox, oy, ox + w * f, oy + h * f)).resize((w, h), Image.BOX)
    if m['alpha']:   # 透明度二值化，免得边缘半透明发灰（R-画风-02 地图道具做法）
        a = ed.getchannel('A').point(lambda v: 255 if v >= 128 else 0)
        ed.putalpha(a)
    orig = Image.open(os.path.join(wd, 'orig_ctx.png')).convert('RGBA')
    mk = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(mk)
    for mx, my, mw, mh in m['masks']:
        d.rectangle((mx - x, my - y, mx - x + mw - 1, my - y + mh - 1), fill=255)
    mk = mk.filter(ImageFilter.GaussianBlur(1.5))
    if m['alpha']:
        mk = mk.point(lambda v: 255 if v >= 128 else 0)   # 带透明的不羽化，免得半透明混色
    patched = Image.composite(ed, orig, mk)
    patched.save(os.path.join(wd, 'patched_ctx.png'))
    k = max(1, 600 // max(w, h))
    cmp = Image.new('RGBA', (w * k * 2 + 12, h * k), (240, 232, 214, 255))
    cmp.paste(orig.resize((w * k, h * k), Image.NEAREST), (0, 0))
    cmp.paste(patched.resize((w * k, h * k), Image.NEAREST), (w * k + 12, 0))
    cmp.save(os.path.join(wd, 'cmp.png'))
    print('对照图：%s/cmp.png' % wd)
    if out:
        full = Image.open(m['src'])
        mode = full.mode
        full = full.convert('RGBA')
        full.paste(patched, (x, y))
        if out.endswith('.webp'):
            full.save(out, 'WEBP', lossless=True) if m['alpha'] else full.convert('RGB').save(out, 'WEBP', quality=95)
        else:
            (full if m['alpha'] or mode == 'RGBA' else full.convert('RGB')).save(out)
        print('已写回：%s' % out)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('step', choices=['prep', 'gen', 'finish', 'all'])
    ap.add_argument('wd')
    ap.add_argument('src', nargs='?')
    ap.add_argument('--ctx')
    ap.add_argument('--mask', action='append', default=[])
    ap.add_argument('--out')
    a = ap.parse_args()
    if a.step in ('prep', 'all'):
        prep(a.wd, a.src, box(a.ctx), [box(v) for v in a.mask])
    if a.step in ('gen', 'all'):
        gen(a.wd)
    if a.step in ('finish', 'all'):
        finish(a.wd, a.out if a.step == 'finish' else None)
