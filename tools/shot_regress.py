#!/usr/bin/env python3
"""截图对比（2026-11-05）：按 tests/shots/cases.json 批量截图（后台窗口，不抢焦点），和 tests/shots/baseline/ 里的基准逐像素比，
变化超过门槛的标出来，拼一张“基准｜现在｜差异”给人看。
- 门槛：差值 >32 的像素占比超过 max(1%, 基准自身抖动×2+0.5%) 算“变了”。基准自身抖动在 --update 时连拍两遍量出来（水波、火光这类动画）。
- 用法：python3 tools/shot_regress.py [--out 目录] [--only 名字,名字]      对比，变了的退出码 1
        python3 tools/shot_regress.py --update [--only …]                   重拍基准（画面是有意改的，确认后用）
"""
import sys, os, json, subprocess, shutil, argparse, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
CASES = os.path.join(ROOT, 'tests/shots/cases.json'); BASE = os.path.join(ROOT, 'tests/shots/baseline')
FONT = '/System/Library/Fonts/STHeiti Medium.ttc'

def shoot(cases, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    lst = [{"args": c.get("args", {}), "out": os.path.join(out_dir, c["name"] + ".png"), **({"ms": c["ms"]} if "ms" in c else {}), **({"keys": c["keys"]} if "keys" in c else {})} for c in cases]
    # 顺序照 shots.gd 的要求：人物交互在菜单前，战斗最后（cases.json 已按这个顺序写）
    lp = os.path.join(out_dir, '_list.json'); json.dump(lst, open(lp, 'w'), ensure_ascii=False)
    t0 = time.time()
    r = subprocess.run([os.path.join(HERE, 'gd_bg.sh'), '--resolution', '1280x720', '--', '--shots=' + lp], capture_output=True, text=True, timeout=900)
    open(os.path.join(out_dir, '_godot.log'), 'w').write(r.stdout + r.stderr)
    print(f'截图 {len(cases)} 张，用时 {time.time() - t0:.0f} 秒')

def load(p):
    return np.asarray(Image.open(p).convert('RGB')).astype(np.int16)

def ratio(a, b):
    if a.shape != b.shape: return 1.0, 255.0
    d = np.abs(a - b).max(axis=2)
    return float((d > 32).mean()), float(d.mean())

def panel(base_p, new_p, out_p, title):
    a = Image.open(base_p).convert('RGB'); b = Image.open(new_p).convert('RGB')
    if b.size != a.size: b = b.resize(a.size)
    d = np.abs(np.asarray(a).astype(np.int16) - np.asarray(b).astype(np.int16)).max(axis=2) > 32
    heat = np.asarray(b).copy() // 3
    heat[d] = [255, 60, 40]
    W, H = a.size; s = 0.5
    tiles = [a, b, Image.fromarray(heat.astype(np.uint8))]
    w, h = int(W * s), int(H * s)
    out = Image.new('RGB', (w * 3 + 24, h + 74), (24, 20, 16))
    dr = ImageDraw.Draw(out)
    try: f = ImageFont.truetype(FONT, 18)
    except Exception: f = None
    for i, (t, lab) in enumerate(zip(tiles, ['基准', '现在', '差异（红）'])):
        out.paste(t.resize((w, h)), (i * (w + 12), 74)); dr.text((i * (w + 12) + 6, 44), lab, fill=(230, 220, 200), font=f)
    dr.text((6, 10), title, fill=(255, 200, 120), font=f)
    out.save(out_p)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--update', action='store_true'); ap.add_argument('--out'); ap.add_argument('--only')
    a = ap.parse_args()
    cases = json.load(open(CASES))
    if a.only: cases = [c for c in cases if c['name'] in a.only.split(',')]
    out = os.path.abspath(a.out or os.path.join(ROOT, 'build/selftest/shots-' + time.strftime('%m%d-%H%M%S')))
    meta_p = os.path.join(BASE, 'meta.json'); meta = json.load(open(meta_p)) if os.path.exists(meta_p) else {}
    if a.update:
        shoot(cases, os.path.join(out, 'a')); shoot(cases, os.path.join(out, 'b'))
        os.makedirs(BASE, exist_ok=True)
        for c in cases:
            pa, pb = os.path.join(out, 'a', c['name'] + '.png'), os.path.join(out, 'b', c['name'] + '.png')
            if not os.path.exists(pa): print('没拍到', c['name']); continue
            noise = ratio(load(pa), load(pb))[0] if os.path.exists(pb) else 0.0
            shutil.copy(pa, os.path.join(BASE, c['name'] + '.png'))
            meta[c['name']] = {"noise": round(noise, 5), "note": c.get('note', ''), "updated": time.strftime('%Y-%m-%d %H:%M')}
            print(f"基准 {c['name']}：自身抖动 {noise:.2%}")
        json.dump(meta, open(meta_p, 'w'), ensure_ascii=False, indent=1)
        return 0
    shoot(cases, os.path.join(out, 'new'))
    rows = []; bad = 0
    for c in cases:
        n = c['name']; bp = os.path.join(BASE, n + '.png'); np_ = os.path.join(out, 'new', n + '.png')
        if not os.path.exists(np_): rows.append({"name": n, "state": "没拍到"}); bad += 1; continue
        if not os.path.exists(bp): rows.append({"name": n, "state": "没有基准"}); continue
        r, mean = ratio(load(bp), load(np_))
        lim = max(0.01, meta.get(n, {}).get('noise', 0) * 2 + 0.005)
        st = '变了' if r > lim else '一致'
        if st == '变了':
            bad += 1; panel(bp, np_, os.path.join(out, 'diff-' + n + '.png'), f"{n}：变化 {r:.1%}（门槛 {lim:.1%}）")
        rows.append({"name": n, "note": c.get('note', ''), "state": st, "changed": round(r, 4), "limit": round(lim, 4), "mean": round(mean, 2)})
    json.dump({"rows": rows, "bad": bad}, open(os.path.join(out, 'report.json'), 'w'), ensure_ascii=False, indent=1)
    for x in rows: print(f"  {x['name']:<16} {x['state']}" + (f"  变化 {x['changed']:.2%}／门槛 {x['limit']:.2%}" if 'changed' in x else ''))
    print(f"截图对比：{len(rows)} 张，变了或没拍到 {bad} 张 → {out}")
    return 1 if bad else 0

if __name__ == '__main__':
    sys.exit(main())
