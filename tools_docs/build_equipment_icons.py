#!/usr/bin/env python3
"""把 art_sources/equipment_icons_v1/ 的装备图标整理成运行时小图 assets/ui/equipment-v1/<id>.webp（128×128），
生成 js/equipment-icons.js（window.EquipmentIcons，并包住 mnIco：有图标的装备优先显示图标），以及总览 contact.png 与 48px 检查图。
用法：python3 tools_docs/build_equipment_icons.py
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'art_sources/equipment_icons_v1'
OUT = ROOT / 'assets/ui/equipment-v1'


def main():
    cat = json.loads((ROOT / 'docs/design/martial-review/catalog.json').read_text())
    eq = [e for e in cat['equipment'] if (SRC / f"{e['id']}.png").exists()]
    OUT.mkdir(parents=True, exist_ok=True)
    m = {}
    for e in eq:
        Image.open(SRC / f"{e['id']}.png").convert('RGB').resize((128, 128), Image.LANCZOS).save(OUT / f"{e['id']}.webp", 'WEBP', quality=90, method=6)
        m[e['id']] = f"assets/ui/equipment-v1/{e['id']}.webp"
    (ROOT / 'js/equipment-icons.js').write_text(
        '/* 由 tools_docs/build_equipment_icons.py 生成，勿手改。装备图标（v4 精绘画风）。 */\n'
        'window.EquipmentIcons=' + json.dumps(m, ensure_ascii=False, indent=1) + ';\n'
        '(()=>{if(typeof mnIco!=="function")return;const o=mnIco;mnIco=function(k,sz=30){const p=window.EquipmentIcons[k];'
        'if(p)return`<img class="ico img jm-pxi" style="width:${sz/16}em;height:${sz/16}em;object-fit:contain;image-rendering:auto" src="${p}" alt="">`;'
        'return o.apply(this,arguments)}})();\n')
    font = ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc', 14)
    order = '丁丙乙甲绝'
    rows = sorted(eq, key=lambda e: (['weapon', 'armor', 'acc'].index(e['slot']), e.get('weapon_class') or e.get('armor_type') or e.get('acc_class') or '', order.index(e['grade'])))
    for size, cols, out, label in [(128, 10, 'contact.png', True), (48, 16, 'contact-48.png', False)]:
        cw, ch = size + 10, size + (34 if label else 10)
        sheet = Image.new('RGB', (cols * cw + 10, ((len(rows) + cols - 1) // cols) * ch + 10), (24, 20, 18))
        d = ImageDraw.Draw(sheet)
        for i, e in enumerate(rows):
            x, y = 10 + (i % cols) * cw, 10 + (i // cols) * ch
            sheet.paste(Image.open(OUT / f"{e['id']}.webp").convert('RGB').resize((size, size), Image.LANCZOS), (x, y))
            if label:
                d.text((x, y + size + 2), f"{e['grade']} {e['name']}", font=font, fill=(230, 220, 200))
                d.text((x, y + size + 17), {'weapon': lambda: f"{e.get('weapon') or ''}·攻{(e.get('stats') or {}).get('atk', '')}", 'armor': lambda: f"{e.get('armor_type') or ''}装·防{(e.get('stats') or {}).get('def', '')}", 'acc': lambda: f"{e.get('acc_class') or ''}类佩饰"}[e['slot']](), font=font, fill=(140, 130, 120))
        sheet.save(OUT / out)
    print(json.dumps({'图标': len(m)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
