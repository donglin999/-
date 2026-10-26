# -*- coding: utf-8 -*-
"""剧情 Q 版立绘的统一站位：量出每个人脸的位置与大小，生成 js/qh-mode-cultivation-actors.css。
规则（2026-10-11 用户：大小高度不一、水平线没对齐）：
  · 所有人脸一样高（常态占舞台高 FACE，选择时 FACE_CHOICE）；脸的中线落在同一条水平线上；
  · 立绘按脸的水平中心对到站位，不按图片中心；
  · 不再用宽度框限制立绘（以前宽度不够时会被挤小）；
  · 参照《侠客风云传》：人物半身站在底栏后面，下半身被底栏挡住，不悬空、不淡出——脸的大小和脸线按“最短的那张图也能伸到底栏下”来定。
以工作区根目录运行：python3 tools_scene/qihe/build_actor_layout.py [--sheet]"""
from pathlib import Path
import json, sys, colorsys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

DIR = Path('assets/production/cultivation/household-v1')
FACE, FACE_CHOICE = 20.2, 17.5          # 脸高占舞台高的百分比
LINE, LINE_CHOICE = 59.0, 63.5          # 脸中线的位置（舞台高的百分比）
MANUAL = {'goose': dict(top=45.0, height=55.0, dx=0.0)}  # 没有人脸的
# 2026-10-21 乡邻原锚点框在发顶额头（.085～.255），按脸等高会整体放大一圈；改为实测发际线到下巴（不含胡子）。
FACE_OVERRIDE = {'neighbor': dict(y0=.19, y1=.39, cx=.44, w=.34), 'ye': dict(y0=.215, y1=.425, cx=.47, w=.36)}
# 眼镜会分割肤色，脖子、手会与脸连通；新透明素材逐档人工核对，禁止把这些区域当作脸。
ANCHOR_SOURCE = Path('art_sources/guiyun-performance-fix-20261012/face-anchors.json')
REVIEWED_FACES = json.loads(ANCHOR_SOURCE.read_text())['anchors']
# 2026-10-21 用户：同一人不同表情档忽大忽小。register_faces.py 按家族配准（朝右各档对“平常”、朝左各档对“平常·朝左”、萧白空手版对家里版同发型），
# 逐人看过改前改后对比后采用的锚点；与上面人工锚点重名时以这里为准。方法与未采用的人见文件 method。
REGISTERED_SOURCE = Path('art_sources/actor-fringe-size-20261021/face-anchors.json')
REGISTERED_FACES = {k: dict(y0=v['y0'], y1=v['y1'], cx=v['cx'], w=.36) for k, v in json.loads(REGISTERED_SOURCE.read_text())['anchors'].items()}
REVIEWED_FACES = {**REVIEWED_FACES, **REGISTERED_FACES}
# 剧情里萧白显示的是空手版 hero-empty/hero_<发型>_empty_<表情>.png（household-v1 的 hero_* 是拿着东西的旧档），站位必须按空手版量。
# 以前按 household-v1 量，长发、中发的脸比别人小一圈，中发脸线还偏高（2026-10-21 排查）。
HERO_EMPTY = Path('assets/production/cultivation/hero-empty')
HERO_STATE = lambda form, m: (lambda s: ('worry' if s == 'hurt' else 'normal') if form != 'hero_long' and s in ('hurt', 'sleep') else s)({'angry': 'serious', 'awkward': 'worry', 'laugh': 'smile', 'fun': 'smile'}.get(m, m))
HERO_MOODS = {'hero_long': ['normal', 'smile', 'serious', 'surprise', 'worry', 'angry', 'sad', 'awkward', 'sleep', 'laugh', 'hurt']}
HERO_MOODS['hero_mid'] = HERO_MOODS['hero_short'] = HERO_MOODS['hero_long'][:9]
SHORTER = {'man': 4.0, 'dou': 1.5, 'goose': 0}           # 个子矮的，脸线往下放一点（舞台高的百分比）
# 脸在原图里占比偏小的人（头身比更“写实”），按脸等高会把头发、肩膀一起放大，整体比别人大一圈。
# 这里对脸高再乘一个系数，让头顶到脸线、肩宽回到同类人物的范围（2026-10-20 用户：知古比别人大一圈）。
FACE_SCALE = {'pei': 0.88}
# 朝左重画版（*_left.png，站右位时换用）：取景可能和原档不同（如殷红缨几档原图是全身远景、朝左版是半身），
# 所以逐张量脸、单独给站位，舞台上的脸和其他人一样高、对在同一条脸线上。自动量错的在这里人工给锚点。
# 知古朝左版与原档逐张叠线核对过脸框一致（眼镜和胸口肤色会让自动量脸失败），沿用原档人工锚点。
LEFT_FACES = {
    'mo_songnian_surprise_left': dict(y0=.176, y1=.376, cx=.487, w=.35),
    # 殷红缨“严肃／吃惊／生气”朝左版原人工锚点（严肃那张框只到眉下，舞台上大一圈）已由 REGISTERED_FACES 取代，2026-10-21。
    **{f'{k}_left': None for k in ('pei', 'pei_normal', 'pei_sad', 'pei_serious', 'pei_smile', 'pei_surprise', 'pei_worry')},
}
# 双人 Q 版“占一个站位”用法（台词写 duoCast）：按图里主说话人的脸人工核对的锚点，和单人立绘同一套脸高、脸线。
# 2026-10-21 躲在父亲身后换成朝左重画版（站右位面对萧白），锚点为裴述的脸（知古半张脸被书挡住，不作锚点）。
DUO_DIR = Path('assets/production/cultivation/neighbors-v1')
DUO_FACES = {'duo_gn_lamp_father_left': dict(y0=.136, y1=.303, cx=.45, w=.30)}


def face_box(path):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im); H, W = a.shape[:2]
    rgb = a[..., :3].astype(float) / 255; alpha = a[..., 3] > 128
    mx = rgb.max(-1); mn = rgb.min(-1); v = mx; s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # 肤色：偏暖、明亮、低到中等饱和（Q 版平涂肤色与其阴影）
    skin = alpha & (v > .6) & (s > .08) & (s < .6) & (r > g) & (g > b) & ((r - b) > .06) & ((r - b) < .45)
    skin = ndimage.binary_opening(skin, iterations=2)
    lab, n = ndimage.label(skin)
    if not n: return None
    best = None
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        area = int((lab[sl] == i).sum()); cy = (sl[0].start + sl[0].stop) / 2 / H
        if cy > .62: continue                      # 手在下半身
        score = area * (1.3 - cy)
        if best is None or score > best[0]: best = (score, sl, area)
    if best is None: return None
    sl = best[1]
    # 眼镜、刘海会把脸切开：把与主块纵向重叠、紧挨着的肤色块并进来
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    for i, s2 in enumerate(ndimage.find_objects(lab), 1):
        a2 = int((lab[s2] == i).sum())
        if a2 < best[2] * .08: continue
        cy = (s2[0].start + s2[0].stop) / 2
        if y0 - (y1 - y0) * .25 <= cy <= y1 + (y1 - y0) * .1 and s2[1].stop > x0 - (x1 - x0) * .3 and s2[1].start < x1 + (x1 - x0) * .3:
            y0, y1, x0, x1 = min(y0, s2[0].start), max(y1, s2[0].stop), min(x0, s2[1].start), max(x1, s2[1].stop)
    # 脸和脖子、胸口、抬起的手可能连成一块：按每行肤色宽度找脸——从最宽处往下，宽度掉到四成以下就是下巴。
    region = skin[y0:y1, x0:x1]; widths = region.sum(1).astype(float)
    if len(widths) > 8:
        widths = ndimage.uniform_filter1d(widths, max(3, len(widths) // 40))
        top_part = widths[:max(4, int(len(widths) * .6))]; pk = int(top_part.argmax()); peak = widths[pk]
        below = np.where(widths[pk:] < peak * .4)[0]
        if len(below): y1 = y0 + pk + int(below[0])
        above = np.where(widths[:pk] > peak * .3)[0]
        if len(above): y0 = y0 + int(above[0])
        rows = skin[y0:y1, x0:x1]; cols = np.where(rows.sum(0) > rows.shape[0] * .25)[0]
        if len(cols): x0, x1 = x0 + int(cols[0]), x0 + int(cols[-1]) + 1
    return dict(y0=y0 / H, y1=y1 / H, cx=(x0 + x1) / 2 / W, w=(x1 - x0) / W, aspect=W / H)


def main():
    bases = sorted(p for p in DIR.glob('*.png') if '_' not in p.stem or p.stem in ('hero_short', 'hero_mid', 'hero_long', 'mo_songnian', 'meng_zhiwei', 'zhaochuan_courier'))
    rows = {}; sheet = []
    for p in bases:
        k = p.stem
        if k in MANUAL: rows[k] = dict(MANUAL[k], manual=True); continue
        q = p.with_name(k + '_normal.png'); src = q if q.exists() else p
        if k in HERO_MOODS: src = HERO_EMPTY / f'{k}_empty_normal.png'
        f = REVIEWED_FACES.get(src.stem) or (dict(FACE_OVERRIDE[k], aspect=2 / 3) if k in FACE_OVERRIDE else face_box(src))
        if not f or f['y1'] - f['y0'] < .08: print('量不出脸：', k); continue
        fh = f['y1'] - f['y0']; mid = (f['y0'] + f['y1']) / 2
        def lay(face, line):
            h = face * FACE_SCALE.get(k, 1) / fh; return round(line + SHORTER.get(k, 0) - mid * h, 2), round(h, 2)
        t, h = lay(FACE, LINE); tc, hc = lay(FACE_CHOICE, LINE_CHOICE)
        rows[k] = dict(top=t, height=h, top_choice=tc, height_choice=hc, dx=round((.5 - f['cx']) * 100, 2), face=[round(f['y0'], 3), round(f['y1'], 3), round(f['cx'], 3)])
        sheet.append((src, f))
    # 夸张底图（fun）和个别表情的姿态、取景与“平常”不同：逐张再量一次，差得明显才单独给数值。
    extra = {}
    for k, r in list(rows.items()):
        if r.get('manual') or k in FACE_OVERRIDE: continue
        f0 = r['face']; fh0 = f0[1] - f0[0]
        for p in [DIR / f'{k}.png'] + sorted(DIR.glob(f'{k}_*.png')):
            m = 'fun' if p.stem == k else p.stem[len(k) + 1:]
            if m == 'normal' or (k == 'hero' and m != 'fun') or (p.stem != k and not p.stem.startswith(k + '_')): continue
            if k in ('hero',) or k in HERO_MOODS: continue          # 萧白三种发型的表情档在下面按空手版单独处理
            # 同一人的各档表情已按底图对齐，逐张量只会引入误差、换表情时跳动；只有夸张底图和负伤那套是另外的图。
            if p.stem not in REVIEWED_FACES and m != 'fun' and not m.startswith('hurt_') and m != 'sleep': continue
            f = REVIEWED_FACES.get(p.stem) or (face_box(DIR / f'{k}_hurt_normal.png') if m.startswith('hurt_') else face_box(p))
            if not f: continue
            fh = f['y1'] - f['y0']; mid = (f['y0'] + f['y1']) / 2
            if fh < fh0 * .6 or fh > fh0 * 1.6: continue           # 量坏了，沿用“平常”的
            if p.stem not in REVIEWED_FACES and abs(fh - fh0) / fh0 < .08 and abs(mid - (f0[0] + f0[1]) / 2) < .02 and abs(f['cx'] - f0[2]) < .03: continue
            def lay(face, line):
                h = face * FACE_SCALE.get(k, 1) / fh; return round(line + SHORTER.get(k, 0) - mid * h, 2), round(h, 2)
            t, h = lay(FACE, LINE); tc, hc = lay(FACE_CHOICE, LINE_CHOICE)
            extra[(k, m)] = dict(top=t, height=h, top_choice=tc, height_choice=hc, dx=round((.5 - f['cx']) * 100, 2), face=[f['y0'], f['y1'], f['cx']])
    for k, ms in HERO_MOODS.items():
        f0 = rows[k]['face']
        for m in ms:
            f = REVIEWED_FACES.get(f'{k}_empty_{HERO_STATE(k, m)}')
            if m == 'normal' or not f or (abs(f['y0'] - f0[0]) < .004 and abs(f['y1'] - f0[1]) < .004 and abs(f['cx'] - f0[2]) < .01): continue
            fh = f['y1'] - f['y0']; mid = (f['y0'] + f['y1']) / 2
            def lay(face, line):
                h = face / fh; return round(line - mid * h, 2), round(h, 2)
            t, h = lay(FACE, LINE); tc, hc = lay(FACE_CHOICE, LINE_CHOICE)
            extra[(k, m)] = dict(top=t, height=h, top_choice=tc, height_choice=hc, dx=round((.5 - f['cx']) * 100, 2), face=[f['y0'], f['y1'], f['cx']])
    left = {}
    for p in sorted(DIR.glob('*_left.png')):
        base = p.stem[:-5]; k = next((a for a in sorted(rows, key=len, reverse=True) if base == a or base.startswith(a + '_')), None)
        if not k: print('朝左版找不到本人：', p.name); continue
        m = base[len(k) + 1:] or 'fun'
        f = REGISTERED_FACES.get(p.stem) or LEFT_FACES.get(p.stem, False)
        if f is None: f = REVIEWED_FACES[base]
        elif f is False: f = face_box(p)
        fh = f['y1'] - f['y0'] if f else 0; f0 = rows[k]['face']
        if not f or not (.6 < fh / (f0[1] - f0[0]) < 1.6): print('朝左版量脸失败，需人工锚点：', p.name); continue
        mid = (f['y0'] + f['y1']) / 2
        def lay(face, line):
            h = face * FACE_SCALE.get(k, 1) / fh; return round(line + SHORTER.get(k, 0) - mid * h, 2), round(h, 2)
        t, h = lay(FACE, LINE); tc, hc = lay(FACE_CHOICE, LINE_CHOICE)
        left[(k, m)] = dict(top=t, height=h, top_choice=tc, height_choice=hc, dx=round((.5 - f['cx']) * 100, 2), face=[round(f['y0'], 3), round(f['y1'], 3), round(f['cx'], 3)])
    rows = {'hero': dict(rows['hero_long']), **{k: v for k, v in rows.items() if k != 'hero'}}   # 萧白按发型另有 hero_short／hero_mid／hero_long，写在后面覆盖这条兜底
    for k, f in DUO_FACES.items():
        fh = f['y1'] - f['y0']; mid = (f['y0'] + f['y1']) / 2
        def lay(face, line):
            h = face / fh; return round(line - mid * h, 2), round(h, 2)
        t, h = lay(FACE, LINE); tc, hc = lay(FACE_CHOICE, LINE_CHOICE)
        rows[k] = dict(top=t, height=h, top_choice=tc, height_choice=hc, dx=round((.5 - f['cx']) * 100, 2), face=[f['y0'], f['y1'], f['cx']], duo=True)
    rows['recipient'] = dict(rows['neighbor'])  # 送药收件人借用乡邻素材，也要有同一套站位。
    extra.update({('recipient', m): dict(r) for (k,m),r in list(extra.items()) if k=='neighbor'})
    css = ["/* 由 tools_scene/qihe/build_actor_layout.py 生成，勿手改。剧情 Q 版立绘统一站位：脸一样高、脸中线对齐、按脸居中。 */",
           "#cultivation .cu-visitor-story .cu-story-stage .cu-story-actor,#cultivation .cu-visitor-story .cu-story-stage:has(.cu-story-actor:nth-child(3)) .cu-story-actor,#cultivation .cu-visitor-story .cu-story-stage:has(.cu-story-actor:nth-child(4)) .cu-story-actor{bottom:auto;top:var(--visitor-top);height:var(--visitor-height);width:auto;max-width:none;aspect-ratio:auto;object-fit:fill;transform:translateX(calc(-50% + var(--face-dx,0%)));-webkit-mask-image:none;mask-image:none}",
           "#cultivation .cu-visitor-story .cu-story-stage .cu-story-actor{left:calc(28% + var(--actor-index) * 44%)}",
           "#cultivation .cu-visitor-story .cu-story-stage:has(.cu-story-actor:nth-child(3)) .cu-story-actor{left:calc(21% + var(--actor-index) * 29%)}",
           "#cultivation .cu-visitor-story .cu-story-stage:has(.cu-story-actor:nth-child(4)) .cu-story-actor{left:calc(13% + var(--actor-index) * 24.6%)}",
           "#cultivation .cu-visitor-story .cu-story-stage .cu-story-actor:only-child{left:50%}"]
    for k, r in rows.items():
        sel = f"#cultivation .cu-visitor-story .cu-story-{k}"
        if r.get('manual'):
            css.append(f"{sel}{{--visitor-top:{r['top']}%;--visitor-height:{r['height']}%;--face-dx:0%}}"); continue
        y0,y1,_ = r['face']; ah=100/(y1-y0); at=-y0*ah
        css.append(f"{sel}{{--visitor-top:{r['top']}%;--visitor-height:{r['height']}%;--face-dx:{r['dx']}%;--avatar-height:{ah:.2f}%;--avatar-top:{at:.2f}%}}")
        css.append(f"#cultivation .cu-visitor-story[data-choice=true] .cu-story-{k}{{--visitor-top:{r['top_choice']}%;--visitor-height:{r['height_choice']}%}}")
    for (k, m), r in extra.items():
        y0,y1,_ = r['face']; ah=100/(y1-y0); at=-y0*ah
        css.append(f"#cultivation .cu-visitor-story .cu-story-{k}[data-mood=\"{m}\"]{{--visitor-top:{r['top']}%;--visitor-height:{r['height']}%;--face-dx:{r['dx']}%;--avatar-height:{ah:.2f}%;--avatar-top:{at:.2f}%}}")
        css.append(f"#cultivation .cu-visitor-story[data-choice=true] .cu-story-{k}[data-mood=\"{m}\"]{{--visitor-top:{r['top_choice']}%;--visitor-height:{r['height_choice']}%}}")
    for (k, m), r in left.items():
        y0,y1,_ = r['face']; ah=100/(y1-y0); at=-y0*ah
        css.append(f"#cultivation .cu-visitor-story .cu-story-{k}[data-mood=\"{m}\"][data-facing=\"left\"]{{--visitor-top:{r['top']}%;--visitor-height:{r['height']}%;--face-dx:{r['dx']}%;--avatar-height:{ah:.2f}%;--avatar-top:{at:.2f}%}}")
        css.append(f"#cultivation .cu-visitor-story[data-choice=true] .cu-story-{k}[data-mood=\"{m}\"][data-facing=\"left\"]{{--visitor-top:{r['top_choice']}%;--visitor-height:{r['height_choice']}%}}")
    print('朝左版：', len(left), '张')
    print('逐张单独给值：', sorted(f'{k}_{m}' for k, m in extra))
    Path('js/qh-mode-cultivation-actors.css').write_text('\n'.join(css) + '\n', encoding='utf-8')
    Path('docs/assets/cultivation-actor-layout.json').write_text(json.dumps(dict(face=FACE, face_choice=FACE_CHOICE, line=LINE, line_choice=LINE_CHOICE, anchor_source=str(ANCHOR_SOURCE), actors=rows, moods={f'{k}_{m}':v for (k,m),v in extra.items()}, facing_left={f'{k}_{m}':v for (k,m),v in left.items()}), ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    short = {k: round(v['top'] + v['height'], 1) for k, v in rows.items() if not v.get('manual') and v['top'] + v['height'] < 100}
    short.update({f'{k}_{m}': round(v['top'] + v['height'], 1) for (k, m), v in extra.items() if v['top'] + v['height'] < 100})
    short.update({f'{k}_{m}_left': round(v['top'] + v['height'], 1) for (k, m), v in left.items() if v['top'] + v['height'] < 100})
    print('下缘够不到底栏的（应为空）：', short)
    print(len(rows), '人；', {k: (v.get('face'), v['height']) for k, v in rows.items() if not v.get('manual')})
    if '--sheet' in sys.argv:
        n = len(sheet); W = Image.new('RGB', (200 * min(n, 9), 300 * ((n + 8) // 9)), (255, 255, 255))
        for i, (p, f) in enumerate(sheet):
            im = Image.open(p).convert('RGBA'); bg = Image.new('RGB', im.size, (235, 235, 235)); bg.paste(im, (0, 0), im); d = ImageDraw.Draw(bg)
            w, h = im.size; fw = f['w'] * w
            d.rectangle([f['cx'] * w - fw / 2, f['y0'] * h, f['cx'] * w + fw / 2, f['y1'] * h], outline=(255, 0, 0), width=6)
            W.paste(bg.resize((200, 300)), ((i % 9) * 200, (i // 9) * 300))
        out = Path(sys.argv[sys.argv.index('--sheet') + 1]); W.save(out); print('sheet', out)


if __name__ == '__main__': main()
