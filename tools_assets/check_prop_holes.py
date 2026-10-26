# -*- coding: utf-8 -*-
"""透明素材“镂空”检查（2026-10-25，用户第十四轮第 6 条：场景物品镂空，要求解决并防止再出现）。

检测两类问题：
  - hole（封闭透明洞）：被不透明像素四面包围、不连到图边的透明区域（alpha≤16），面积 ≥ HOLE_MIN。
    适用于全部扫描对象：地图道具切片、角色精灵、立绘、战斗表、培养素材、图标道具等。
  - gap（窄缺口）：只查地图道具切片。对整片切片做半径 GAP_R 的形态学闭运算，闭运算补上、原图却透明的区域，
    面积 ≥ GAP_MIN 且最厚处 ≥ GAP_THICK 像素。用来抓“从整图切件时把木头、阴影当地面抠掉”这类连到外面的豁口
    （村中路牌：屋檐与告示板之间、立柱上端被抠空，透出底下草地）。轮廓毛边只有 1～2 像素厚，不计。

扫描对象：
  - js/qihe-expansion-data.js 与 js/prologue-backhill-props.js 里每张图的道具切片（propImg + 切片矩形）；
  - docs/assets/production-assets.json 中带透明通道、透明像素占比 ≥5% 的正式图片（地图底图、地图前景层 *_fg、
    特效 effects、界面 ui 除外：前景层的洞透出的是同一张底图，看不出；特效与界面框的镂空是常态）。

有意的镂空（窗格、栅栏、车轮辐条、树枝间透出的地面、手臂与身体之间的空隙……）登记在
docs/assets/prop-holes-allow.json：每条写明 key、原因，以及允许的洞（kind + 外框 bbox）。检测到的洞若与登记的洞外框
交并比 ≥0.5 或被其外框包含，即视为已登记；否则报错。素材换了内容，洞的位置变了，就要重新核对登记。

用法（工作区根目录）：
  python3 tools_assets/check_prop_holes.py                 # 只检查，未登记的洞报错（check_production.py 调用同一函数）
  python3 tools_assets/check_prop_holes.py --report DIR    # 另输出 report.json 与洞标色可视化（红=封闭洞，橙=窄缺口）
  python3 tools_assets/check_prop_holes.py --baseline      # 打印未登记项的 JSON 草稿，人工核对后写原因再并入白名单（不自动写入）
"""
from pathlib import Path
import json, subprocess, sys, hashlib
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = Path(__file__).resolve().parents[1]
ALLOW = ROOT / 'docs/assets/prop-holes-allow.json'
A_OPAQUE, A_CLEAR = 128, 16
HOLE_MIN = 16          # 封闭洞最小面积（像素）
GAP_R, GAP_MIN, GAP_THICK = 5, 60, 2.5
SKIP_SYSTEMS = {'effects', 'ui', 'audio'}
TRANSPARENT_MIN = 0.05


def _disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def find_holes(alpha, gaps=False):
    """返回 [(kind, area, bbox)] 及两张掩码（封闭洞、窄缺口）。bbox 为 [x0,y0,x1,y1]（右下不含）。"""
    op = alpha >= A_OPAQUE
    tr = alpha <= A_CLEAR
    H = nd.binary_fill_holes(op) & tr
    G = np.zeros_like(op)
    if gaps:            # 道具切片是一件物体：整片做闭运算（屋檐与告示板分成两块时也能补上中间被抠掉的一条）
        pad = GAP_R + 2
        G = nd.binary_closing(np.pad(op, pad), structure=_disk(GAP_R))[pad:-pad, pad:-pad]
        G &= tr & ~H
    out = []
    keepH = np.zeros_like(H); keepG = np.zeros_like(G)
    for kind, m, keep in (('hole', H, keepH), ('gap', G, keepG)):
        lab, n = nd.label(m)
        if not n: continue
        dt = nd.distance_transform_edt(m) if kind == 'gap' else None
        for i, sl in enumerate(nd.find_objects(lab), 1):
            c = lab[sl] == i
            area = int(c.sum())
            if kind == 'hole' and area < HOLE_MIN: continue
            if kind == 'gap' and (area < GAP_MIN or float(dt[sl][c].max()) < GAP_THICK): continue
            keep[sl] |= c
            out.append({'kind': kind, 'area': area, 'bbox': [sl[1].start, sl[0].start, sl[1].stop, sl[0].stop]})
    return out, keepH, keepG


def _registry():
    return json.loads((ROOT / 'docs/assets/production-assets.json').read_text())


def _prop_layers():
    js = ("global.window=global;require('./js/qihe-expansion-data.js');require('./js/prologue-backhill-props.js');"
          "const o={};for(const [k,v] of Object.entries(QIHE_EXPANSION)){if(v&&v.props)o[k]={propImg:v.propImg,props:v.props,modular:v.modular||null}}"
          "o.backhill={propImg:PROLOGUE_BACKHILL_PROPS.propImg,props:PROLOGUE_BACKHILL_PROPS.props};console.log(JSON.stringify(o))")
    return json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))


def _names(original_path, modular=None):
    """按批次 scene.json 的 propNames 给切片起名（仅用于报告）。"""
    sj = ROOT / modular / 'out/hd/scene.json' if modular else ROOT / Path(original_path).parent / 'scene.json'
    if not sj.is_file(): return {}
    s = json.loads(sj.read_text())
    return {tuple(p[:4]): n for p, n in zip(s.get('props', []), s.get('propNames', []))}


def targets(reg=None):
    """产出 (key, 说明, rgba 数组, 是否查窄缺口)。"""
    reg = reg or _registry()
    by_id = {a['id']: a for a in reg['assets']}
    atlas_ids = set()
    cache = {}
    for scene, layer in _prop_layers().items():
        a = by_id.get(layer['propImg'])
        if not a: continue
        atlas_ids.add(a['id'])
        if a['id'] not in cache:
            cache[a['id']] = np.asarray(Image.open(ROOT / a['path']).convert('RGBA'))
        im = cache[a['id']]
        names = _names(a['original_path'], layer.get('modular'))
        seen = set()
        for p in layer['props']:
            r = tuple(int(v) for v in p[:4])
            if r in seen: continue
            seen.add(r)
            sx, sy, sw, sh = r
            key = f"{a['id']}@{sx},{sy},{sw},{sh}"
            yield key, f"{scene}:{names.get(tuple(p[:4]), '?')}", im[sy:sy + sh, sx:sx + sw], True
    for a in reg['assets']:
        if a['system'] in SKIP_SYSTEMS or a['id'] in atlas_ids: continue
        if not a['path'].endswith(('.png', '.webp')): continue
        if a['system'] == 'maps': continue          # 底图不透明；前景层 *_fg 的洞透出同一张底图
        with Image.open(ROOT / a['path']) as im:
            if 'A' not in im.getbands() and im.mode != 'P': continue
            arr = np.asarray(im.convert('RGBA'))
        al = arr[..., 3]
        if (al <= A_CLEAR).mean() < TRANSPARENT_MIN: continue
        yield a['id'], a['system'], arr, False


def _covered(h, allowed):
    x0, y0, x1, y1 = h['bbox']
    for w in allowed:
        if w.get('kind', h['kind']) != h['kind']: continue
        X0, Y0, X1, Y1 = w['bbox']
        if X0 <= x0 and Y0 <= y0 and X1 >= x1 and Y1 >= y1: return True
        ix = max(0, min(x1, X1) - max(x0, X0)); iy = max(0, min(y1, Y1) - max(y0, Y0))
        inter = ix * iy; uni = (x1 - x0) * (y1 - y0) + (X1 - X0) * (Y1 - Y0) - inter
        if uni and inter / uni >= 0.5: return True
    return False


def load_allow():
    if not ALLOW.is_file(): return {}
    d = json.loads(ALLOW.read_text())
    out = {}
    for e in d.get('entries', []):
        if not e.get('reason'): raise SystemExit(f'白名单 {e.get("key")} 缺少原因（reason）')
        out[e['key']] = e
    return out


def scan(report_dir=None):
    allow = load_allow()
    results, errors, viz = [], [], []
    seen_keys = set()
    for key, desc, rgba, gaps in targets():
        seen_keys.add(key)
        hs, H, G = find_holes(rgba[..., 3], gaps)
        if not hs: continue
        allowed = allow.get(key, {}).get('holes', [])
        bad = [h for h in hs if not _covered(h, allowed)]
        results.append({'key': key, 'desc': desc, 'holes': hs, 'unregistered': bad})
        if bad:
            errors.append(f"未登记的镂空 {key}（{desc}）：" + '，'.join(f"{h['kind']} {h['area']}px @{h['bbox']}" for h in bad))
        if report_dir: viz.append((key, desc, rgba, H, G, bool(bad)))
    stale = sorted(set(allow) - seen_keys)
    if report_dir: _write_report(Path(report_dir), results, viz, stale)
    return results, errors, stale


def _viz(rgba, H, G):
    h, w = rgba.shape[:2]
    bg = np.empty((h, w, 4), np.uint8); bg[...] = (58, 58, 68, 255)
    bg[(np.indices((h, w)) // 6).sum(0) % 2 == 0] = (84, 84, 98, 255)
    b = Image.fromarray(bg); b.alpha_composite(Image.fromarray(np.ascontiguousarray(rgba)))
    o = np.array(b); o[H] = (255, 0, 0, 255); o[G] = (255, 150, 0, 255)
    s = 2 if max(h, w) <= 300 else 1
    if max(h, w) > 900: s = 0.5
    im = Image.fromarray(o)
    return im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.NEAREST)


def _write_report(d, results, viz, stale):
    d.mkdir(parents=True, exist_ok=True)
    (d / 'report.json').write_text(json.dumps({'summary': {
        'flagged': len(results), 'unregistered': sum(1 for r in results if r['unregistered']),
        'holes': sum(1 for r in results for h in r['holes'] if h['kind'] == 'hole'),
        'gaps': sum(1 for r in results for h in r['holes'] if h['kind'] == 'gap'), 'stale_allow_keys': stale},
        'items': results}, ensure_ascii=False, indent=1))
    vd = d / 'viz'; vd.mkdir(exist_ok=True)
    for key, desc, rgba, H, G, bad in viz:
        fn = key.replace('@', '__').replace(',', '_').replace('/', '_') + ('_UNREG' if bad else '') + '.png'
        _viz(rgba, H, G).save(vd / fn)


def check():
    """供 check_production.py 调用：返回错误列表。"""
    _, errors, stale = scan()
    return errors + [f'白名单项已不存在（素材换了或删了，请复核后移除）：{k}' for k in stale]


if __name__ == '__main__':
    rep = sys.argv[sys.argv.index('--report') + 1] if '--report' in sys.argv else None
    results, errors, stale = scan(rep)
    if '--baseline' in sys.argv:
        draft = [{'key': r['key'], 'desc': r['desc'], 'reason': 'TODO：人工核对后写明为何是有意镂空',
                  'holes': [{'kind': h['kind'], 'bbox': h['bbox'], 'area': h['area']} for h in r['unregistered']]}
                 for r in results if r['unregistered']]
        print(json.dumps(draft, ensure_ascii=False, indent=1))
    else:
        print(json.dumps({'status': 'fail' if errors or stale else 'pass', 'flagged': len(results),
                          'unregistered': len(errors), 'stale_allow_keys': stale, 'errors': errors[:50]}, ensure_ascii=False))
    raise SystemExit(bool(errors or stale) and '--baseline' not in sys.argv)
