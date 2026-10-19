#!/usr/bin/env python3
"""把 v4“精绘”技能与内功图标（art_sources/martial_icons_v4/，用户 2026-10-07 采用 C 版）接入运行时。

- 招式：assets/ui/martial-moves-v4/<id>.webp（128×128）；js/martial-move-icons.js 以 v4 为准，没有 v4 的沿用 v3 路径。
- 内功：assets/ui/martial-hearts-v4/<id>.webp；js/martial-heart-icons.js（window.MartialHeartIcons），
  键同时登记 v3 心法 id（xf_tuna）与去掉 xf_ 前缀的旧 id（tuna），供新旧菜单查图。
原图不改。用法：python3 tools_docs/pack_martial_icons_v4.py
"""
import json, re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'art_sources/martial_icons_v4'
TX = json.loads((ROOT / 'docs/design/martial-review/skill-text-v4.json').read_text())


def pack(ids, sub):
    out = ROOT / 'assets/ui' / sub
    out.mkdir(parents=True, exist_ok=True)
    done = {}
    for k in ids:
        src = SRC / f'{k}.png'
        if src.exists():
            Image.open(src).convert('RGB').resize((128, 128), Image.LANCZOS).save(out / f'{k}.webp', 'WEBP', quality=90, method=6)
            done[k] = f'assets/ui/{sub}/{k}.webp'
    return done


def main():
    old = {}
    p = ROOT / 'js/martial-move-icons.js'
    m = re.search(r'window\.MartialMoveIcons=(\{.*\});', p.read_text(), re.S)
    if m:
        old = {k: v for k, v in json.loads(m.group(1)).items() if 'martial-moves-v3' in v}
    moves = pack(TX['moves'], 'martial-moves-v4')
    icons = {**old, **moves}
    p.write_text('/* 由 tools_docs/pack_martial_icons_v4.py 生成（v4 精绘图标优先，缺图沿用 v3），勿手改。 */\nwindow.MartialMoveIcons=' + json.dumps(icons, ensure_ascii=False, indent=2) + ';\n')
    hearts = pack(TX['hearts'], 'martial-hearts-v4')
    hmap = {**{k[3:]: v for k, v in hearts.items() if k.startswith('xf_')}, **hearts}
    (ROOT / 'js/martial-heart-icons.js').write_text('/* 由 tools_docs/pack_martial_icons_v4.py 生成，勿手改。内功图标（v4 精绘）。 */\nwindow.MartialHeartIcons=' + json.dumps(hmap, ensure_ascii=False, indent=1) + ';\n')
    print(json.dumps({'招式图标': len(icons), '其中v4': len(moves), '内功图标': len(hearts)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
