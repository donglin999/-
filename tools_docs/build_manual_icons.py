#!/usr/bin/env python3
"""把 art_sources/manual_icons_v1/ 的秘籍封面原图整理成运行时小图 assets/ui/manuals-v1/<道具 id>.webp（128×128），
生成图标表 js/martial-manual-icons.js（window.MartialManualIcons），以及总览 contact.png 与 48px 检查图 contact-48.png。
用法：python3 tools_docs/build_manual_icons.py（缺图的条目跳过，界面回退为通用图标）。
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'art_sources/manual_icons_v1'
OUT = ROOT / 'assets/ui/manuals-v1'
PL = json.loads((ROOT / 'docs/design/martial-review/manual-placement.json').read_text())['manuals']
PL = [r for r in PL if r.get('manual', True)]  # 个人技能只能请教，不出秘籍


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    done, missing = {}, []
    for r in PL:
        src = SRC / f"{r['item']}.png"
        if not src.exists():
            missing.append(r['item'])
            continue
        im = Image.open(src).convert('RGB').resize((128, 128), Image.LANCZOS)
        im.save(OUT / f"{r['item']}.webp", 'WEBP', quality=90, method=6)
        done[r['item']] = f"assets/ui/manuals-v1/{r['item']}.webp"
    (ROOT / 'js/martial-manual-icons.js').write_text('/* 由 tools_docs/build_manual_icons.py 生成，勿手改。秘籍封面图标。 */\nwindow.MartialManualIcons=' + json.dumps(done, ensure_ascii=False, indent=1) + ';\n')
    font = ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc', 14)
    order = '丁丙乙甲绝'
    rows = sorted([r for r in PL if r['item'] in done], key=lambda r: (r['kind'] != '外功', order.index(r['grade']), r['item']))
    for size, cols, out, label in [(128, 12, 'contact.png', True), (48, 24, 'contact-48.png', False)]:
        cw, ch = size + 10, size + (34 if label else 10)
        sheet = Image.new('RGB', (cols * cw + 10, ((len(rows) + cols - 1) // cols) * ch + 10), (24, 20, 18))
        d = ImageDraw.Draw(sheet)
        for i, r in enumerate(rows):
            x, y = 10 + (i % cols) * cw, 10 + (i // cols) * ch
            sheet.paste(Image.open(OUT / f"{r['item']}.webp").convert('RGB').resize((size, size), Image.LANCZOS), (x, y))
            if label:
                d.text((x, y + size + 2), f"{r['grade']} {r['name']}", font=font, fill=(230, 220, 200))
                d.text((x, y + size + 17), r['sect'], font=font, fill=(140, 130, 120))
        sheet.save(OUT / out)
    print(json.dumps({'图标': len(done), '缺图': missing}, ensure_ascii=False))


if __name__ == '__main__':
    main()
