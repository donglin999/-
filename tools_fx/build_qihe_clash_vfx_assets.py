"""栖河交锋三招特效 v2 · 第 5 步：把单体元素原图整理成运行时素材。
流程：xiaojianghu/docs/design/skill-vfx-pipeline.md 第 5 节。原图不改动，可随时重跑。
1 裁边（黑底按亮度>14，透明底按 alpha>10） 2 按概念图占比缩放到特效像素空间（WIDTH 表；交锋层特效以 0.8 倍绘制，概念图像素 ÷1.92 ≈ 特效像素）LANCZOS
3 中位切分压到 96 色、不抖动 4 黑底：alpha 取最亮通道、颜色反预乘、近黑全透明；透明底：alpha 量化 5 阶
5 无损 webp 到 assets/production/fx/qihe-clash/clash_v2/，manifest.json＋contact.png（2 倍预览）。
用法：python3 tools_fx/build_qihe_clash_vfx_assets.py [--register]   --register 同步登记 docs/assets/production-assets.json/.md 与 js/production-assets.js
"""
import argparse, hashlib, json, os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art_sources/qihe-clash-vfx-elements-v1')
SET = 'clash_v2'
DST = os.path.join(ROOT, 'assets/production/fx/qihe-clash', SET)
PREFIX = 'fx_qh_clash_'
# 目标尺寸（特效像素）：('w', n) 按宽、('h', n) 按高。按定稿概念图占比 ÷1.92 定，缠腕主形按定稿要求放大。
WIDTH = {
 'am3_fan_jiangqing': ('w', 300),  # 运行时按实际目标距离拉伸
 'am3_edge_arc': ('h', 260),
 'am3_cross_hit': ('w', 76),
 'am3_blade_glint': ('w', 86),
 'cs1_wrist_lash': ('w', 96),
 'cs_copper_point': ('w', 36),
 'cs2_wisps': ('w', 220),
 'cs2_whip_arc': ('w', 420),
 'cs2_ghost_red': ('w', 340),
 'cs_copper_sparks': ('w', 96),
}


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def process(eid, rec):
    im = Image.open(os.path.join(SRC, eid + '.png')).convert('RGBA')
    a = np.array(im).astype(np.float32)
    black = rec['background'].startswith('纯黑')
    if black:
        lum = a[:, :, :3].max(2)
        mask = lum > 14
    else:
        mask = a[:, :, 3] > 10
    ys, xs = np.where(mask)
    pad = 4
    box = (max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad + 1), min(im.height, ys.max() + pad + 1))
    im = im.crop(box)
    mode, n = WIDTH[eid]
    k = n / (im.width if mode == 'w' else im.height)
    size = (max(1, round(im.width * k)), max(1, round(im.height * k)))
    if black:
        rgb = im.convert('RGB').resize(size, Image.LANCZOS)
        q = np.array(rgb.quantize(96, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')).astype(np.float32)
        al = q.max(2)
        al[al < 16] = 0
        out = np.zeros(q.shape[:2] + (4,), np.uint8)
        nz = al > 0
        out[nz, :3] = np.clip(q[nz] / al[nz, None] * 255, 0, 255).astype(np.uint8)
        out[:, :, 3] = al.astype(np.uint8)
    else:
        # 透明底：预乘缩放，避免透明区颜色渗进边缘
        arr = np.array(im).astype(np.float32)
        arr[:, :, :3] *= arr[:, :, 3:4] / 255
        pm = Image.fromarray(arr.astype(np.uint8), 'RGBA').resize(size, Image.LANCZOS)
        p = np.array(pm).astype(np.float32)
        al = p[:, :, 3]
        rgb = np.zeros(p.shape[:2] + (3,), np.float32)
        nz = al > 0
        rgb[nz] = np.clip(p[nz, :3] / al[nz, None] * 255, 0, 255)
        q = np.array(Image.fromarray(rgb.astype(np.uint8), 'RGB').quantize(96, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB'))
        lv = np.array([0, 64, 128, 191, 255], np.float32)
        aq = lv[np.abs(al[:, :, None] - lv[None, None]).argmin(2)]
        out = np.dstack([q, aq.astype(np.uint8)])
        out[out[:, :, 3] == 0, :3] = 0
    o = Image.fromarray(out, 'RGBA')
    os.makedirs(DST, exist_ok=True)
    fn = PREFIX + eid + '.webp'
    o.save(os.path.join(DST, fn), lossless=True, quality=100, method=6)
    return o, {'w': o.width, 'h': o.height, 'blend': 'add' if black else 'normal', 'file': fn,
               'source': f'art_sources/qihe-clash-vfx-elements-v1/{eid}.png', 'source_sha256': sha(os.path.join(SRC, eid + '.png')),
               'reference_concept': rec['concept'], 'background': 'black' if black else 'alpha', 'use': rec['use']}


def contact(items):
    S, gap = 2, 16
    cols, rows, x, y, rh = [], [], gap, gap, 0
    W = 1400
    pos = []
    for eid, o in items:
        w, h = o.width * S, o.height * S
        if x + w + gap > W:
            x, y, rh = gap, y + rh + 34, 0
        pos.append((eid, o, x, y)); x += w + gap; rh = max(rh, h)
    H = y + rh + 34 + gap
    c = Image.new('RGBA', (W, H), (22, 20, 28, 255))
    # 半边棋盘格便于看透明
    d = ImageDraw.Draw(c)
    for eid, o, x, y in pos:
        w, h = o.width * S, o.height * S
        for yy in range(y, y + h, 8):
            for xx in range(x, x + w, 8):
                if ((xx - x) // 8 + (yy - y) // 8) % 2:
                    d.rectangle([xx, yy, min(xx + 7, x + w - 1), min(yy + 7, y + h - 1)], fill=(34, 32, 42, 255))
        c.alpha_composite(o.resize((w, h), Image.NEAREST), (x, y))
        d.text((x, y + h + 4), f'{eid} {o.width}x{o.height}', fill=(230, 220, 190, 255))
    c.convert('RGB').save(os.path.join(DST, 'contact.png'))


def register(manifest):
    import datetime
    jp = os.path.join(ROOT, 'docs/assets/production-assets.json')
    d = json.load(open(jp, encoding='utf-8'))
    keep = [a for a in d['assets'] if not a['path'].startswith(f'assets/production/fx/qihe-clash/{SET}/')]
    new = []
    for eid, e in manifest.items():
        path = f'assets/production/fx/qihe-clash/{SET}/{e["file"]}'
        new.append({'id': PREFIX + eid, 'path': path, 'original_path': e['source'], 'system': 'effects', 'role': 'registered-or-direct-runtime',
                    'sha256': sha(os.path.join(ROOT, path)), 'references': ['js/faction-fx/fx-qihe-clash-v2.js', 'review/qihe-clash-vfx-v2/index.html', 'js/production-assets.js'],
                    'adoption': {'date': '2026-10-18', 'authorization': 'user_requested_clash_vfx_v2_review_only',
                                 'status': '评审候选：仅评审页加载，实机交锋仍用旧版，待用户确认后接入',
                                 'evidence': 'art_sources/qihe-clash-vfx-elements-v1/'}, 'actual_size': [e['w'], e['h']]})
    d['assets'] = keep + new
    open(jp, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    mp = os.path.join(ROOT, 'docs/assets/production-assets.md')
    md = open(mp, encoding='utf-8').read()
    head = '## 2026-10-18 交锋三招特效 v2（评审候选，未接入实机）'
    if head in md:
        md = md[:md.index(head)].rstrip() + '\n'
    rows = '\n'.join(f"| {a['id']} | `{a['path']}` | `{a['original_path']}` | {a['sha256'][:12]} |" for a in new)
    md += f"\n{head}\n\n按 skill-vfx-pipeline 第 4–5 步由定稿概念图（art_sources/qihe-clash-vfx-concepts-v1/approved.json）拆出单体元素整理而成；只被评审页 review/qihe-clash-vfx-v2/ 加载，实机交锋仍播旧版程序特效，用户确认后再接入。\n\n| ID | 正式文件 | 原件 | SHA-256前12位 |\n|---|---|---|---|\n{rows}\n"
    open(mp, 'w', encoding='utf-8').write(md)
    sp = os.path.join(ROOT, 'js/production-assets.js')
    s = open(sp, encoding='utf-8').read()
    key = 'window.PRODUCTION_ASSET_PATHS='
    i = s.index(key) + len(key)
    aliases, end = json.JSONDecoder().raw_decode(s[i:])
    aliases = {k: v for k, v in aliases.items() if not v.startswith(f'assets/production/fx/qihe-clash/{SET}/')}
    for a in new:
        aliases[a['id']] = a['path']
    s = s[:i] + json.dumps(aliases, ensure_ascii=False, separators=(',', ':')) + s[i + end:]
    open(sp, 'w', encoding='utf-8').write(s)
    print('registered', len(new))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--register', action='store_true'); a = ap.parse_args()
    manifest, items = {}, []
    for eid in WIDTH:
        rp = os.path.join(SRC, eid + '.json')
        if not os.path.exists(rp):
            print('缺少原图', eid); continue
        o, m = process(eid, json.load(open(rp, encoding='utf-8')))
        manifest[eid] = m; items.append((eid, o)); print(eid, m['w'], m['h'], m['blend'])
    json.dump(manifest, open(os.path.join(DST, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    contact(items)
    if a.register:
        register(manifest)


if __name__ == '__main__':
    main()
