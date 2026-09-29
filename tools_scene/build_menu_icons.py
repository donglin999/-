"""Build every Jianghu menu icon from a reviewed 32px pixel-art recipe.

Run from the repository root: python3 tools_scene/build_menu_icons.py
The manifest is intentionally explicit: new content must receive a visual recipe
before it can silently fall back to a Chinese character in the menu.
"""
from __future__ import annotations

import json
import random
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
CELL, SCALE, COLS = 32, 3, 8
OUT = ROOT / "assets/i_jianghu.webp"
META = ROOT / "js/menu-icons.js"

# Key -> (silhouette, material palette). Three material colors are shadow, body, light.
PALETTES = {
    "paper": ("#524234", "#bb9c6a", "#e9d6a7"),
    "wood": ("#483225", "#94643c", "#d0a269"),
    "iron": ("#303c45", "#718390", "#c4d0ca"),
    "bronze": ("#55412a", "#a47b41", "#e0bc74"),
    "cloth": ("#414c43", "#758979", "#b7bfa2"),
    "red": ("#552e29", "#a9533e", "#df9870"),
    "jade": ("#244c49", "#4b9180", "#a6cdb4"),
    "herb": ("#314b32", "#6f9250", "#bfd18b"),
    "blue": ("#293f53", "#557e9c", "#a7bfd0"),
    "purple": ("#483651", "#866687", "#c6a8bf"),
}

ITEMS = {
    "bun": ("bun", "paper"), "pill": ("jar", "jade"), "wine": ("gourd", "bronze"),
    "shovel": ("shovel", "iron"), "book": ("book", "paper"), "gall": ("gall", "herb"),
    "token": ("token", "wood"), "wood": ("sword", "wood"), "iron": ("sword", "iron"),
    "rusty": ("sword", "red"), "cloth": ("tunic", "cloth"), "vest": ("vest", "wood"),
    "bf_note": ("note", "paper"), "jieyao": ("jar", "blue"), "ledger": ("ledger", "paper"),
    "arrows": ("arrows", "iron"), "shuxia": ("chest", "wood"), "zhupian": ("bamboo", "wood"),
    "club": ("staff", "wood"), "knife": ("knife", "iron"), "needles": ("needles", "blue"),
    "mianjia": ("tunic", "paper"), "charm": ("charm", "paper"), "collar": ("bell", "bronze"),
    "jade": ("pendant", "jade"), "pelt": ("pelt", "cloth"), "xf_can": ("scroll", "purple"),
    "canglong_map": ("map", "paper"), "tea_bowl": ("bowl", "wood"), "ferry_tag": ("tag", "wood"),
}

SKILLS = {
    "fist": ("fist", "red"), "fuhu": ("claw", "red"), "liuye": ("sword", "blue"),
    "jingxin": ("meditate", "blue"), "shuaibei": ("palm", "wood"), "bianfa": ("whip", "wood"),
    "lianhua": ("lotus", "red"), "guafeng": ("kick", "blue"), "bite": ("fang", "red"),
    "lick": ("paw", "jade"), "peck": ("beak", "red"), "blade": ("knife", "iron"),
    "ghost": ("flameblade", "purple"), "coil": ("coil", "jade"), "palm_m": ("halo", "bronze"),
    "staff": ("staff", "wood"), "fanjiang": ("waveblade", "blue"), "jinzhen": ("needles", "blue"),
    "huichun": ("herbjar", "herb"), "baicao": ("dew", "jade"), "dingshen": ("seal", "purple"),
    "sniff": ("nose", "wood"),
}

XINFA = {
    "tuna": ("breath", "jade"), "yq_xin": ("spring", "bronze"), "yq_shi": ("stone", "bronze"),
    "gb_xin": ("patch", "herb"), "gb_shi": ("steps", "herb"), "lm_xin": ("sunbook", "jade"),
    "lm_bo": ("openbook", "jade"), "th_xin": ("moon", "blue"), "th_zuo": ("meditate", "blue"),
    "yy_xin": ("banner", "red"), "yy_zhen": ("shields", "red"), "bx_xin": ("herbbook", "herb"),
    "bx_du": ("venom", "purple"),
}


def icon(kind: str, motif: str, palette: str, seed: int) -> Image.Image:
    im = Image.new("RGBA", (CELL, CELL))
    d = ImageDraw.Draw(im)
    dark, body, light = PALETTES[palette]
    edge = "#241e1b"

    def line(points, color=body, width=2):
        d.line(points, fill=edge, width=width + 2, joint="curve")
        d.line(points, fill=color, width=width, joint="curve")

    def poly(points, color=body):
        d.polygon(points, fill=color)
        d.line(points + [points[0]], fill=edge, width=1, joint="curve")

    def ellipse(box, color=body):
        d.ellipse(box, fill=color, outline=edge, width=1)

    if kind == "skill":
        d.ellipse((3, 3, 28, 28), fill=(*bytes.fromhex(dark[1:]), 53))
        d.arc((4, 4, 27, 27), 205, 325, fill=light, width=1)
    elif kind == "xinfa":
        d.ellipse((3, 3, 28, 28), outline=dark, width=2)
        d.arc((5, 5, 26, 26), 200, 325, fill=light, width=2)
        d.ellipse((14, 2, 17, 5), fill=light)

    if motif in ("sword", "knife", "flameblade", "waveblade"):
        if motif == "knife":
            poly([(9, 8), (22, 5), (26, 11), (22, 16), (15, 17)], light)
            line([(14, 16), (8, 24)], dark, 3)
        else:
            poly([(7, 24), (17, 7), (25, 4), (22, 12), (10, 26)], light)
            line([(7, 19), (14, 24)], dark, 2)
            line([(8, 24), (5, 28)], body, 2)
        if motif == "flameblade":
            d.polygon([(17, 7), (19, 2), (23, 7), (27, 5), (24, 13)], fill="#aa6a96")
        if motif == "waveblade":
            d.arc((3, 17, 25, 30), 205, 355, fill="#9cc5ca", width=2)
    elif motif in ("staff", "whip", "shovel", "arrows", "needles", "bamboo"):
        if motif == "whip":
            line([(8, 27), (11, 20), (19, 18), (24, 13), (22, 7), (17, 5)], body, 2)
        elif motif == "arrows":
            for dx in (-4, 0, 4):
                line([(13+dx, 26), (17+dx, 7)], body, 1)
                poly([(17+dx, 5), (15+dx, 10), (19+dx, 10)], light)
        elif motif == "needles":
            ellipse((5, 17, 25, 27), dark)
            for dx in (0, 5, 10): line([(10+dx, 19), (11+dx, 5)], light, 1)
        else:
            line([(7, 26), (22, 6)], body, 4 if motif == "staff" else 3)
            if motif == "staff": ellipse((20, 4, 25, 9), light)
            elif motif == "shovel": poly([(17, 8), (20, 3), (27, 5), (25, 14)], light)
            else:
                for yy in (10, 16, 22): line([(10, yy), (16, yy-1)], dark, 1)
    elif motif in ("tunic", "vest", "patch"):
        poly([(10, 5), (14, 7), (18, 7), (22, 5), (28, 11), (24, 16), (22, 13), (22, 27), (9, 27), (9, 13), (6, 16), (3, 11)], body)
        poly([(11, 7), (16, 12), (21, 7), (19, 6), (16, 9), (13, 6)], light)
        line([(16, 13), (16, 25)], dark, 1)
        if motif == "vest":
            for yy in (15, 20): line([(10, yy), (22, yy)], light, 1)
        if motif == "patch": poly([(11, 17), (16, 15), (19, 21), (13, 23)], dark)
    elif motif in ("book", "ledger", "map", "note", "scroll", "openbook", "sunbook", "herbbook"):
        if motif == "scroll":
            poly([(7, 7), (23, 5), (25, 23), (9, 26)], light)
            ellipse((5, 5, 10, 10), body);ellipse((22, 21, 27, 27), body)
        elif motif in ("openbook", "sunbook"):
            poly([(4, 8), (15, 10), (16, 26), (5, 24)], light)
            poly([(16, 10), (27, 8), (26, 24), (16, 26)], body)
            line([(16, 10), (16, 26)], dark, 1)
            if motif == "sunbook": ellipse((13, 3, 19, 9), "#e0b970")
        else:
            poly([(7, 5), (24, 7), (26, 25), (9, 27)], light)
            line([(10, 7), (12, 24)], dark, 2)
            if motif == "ledger":
                for yy in (12, 16, 20): line([(14, yy), (22, yy+1)], dark, 1)
            elif motif == "map":
                line([(13, 18), (16, 13), (20, 18), (23, 12)], dark, 1)
                ellipse((16, 19, 19, 22), "#a34f3c")
            elif motif == "herbbook":
                line([(14, 22), (19, 11)], dark, 1);ellipse((18, 11, 23, 15), "#709758")
            elif motif == "note":
                poly([(19, 7), (24, 7), (25, 13), (20, 12)], body)
                line([(12, 17), (20, 18)], dark, 1)
            else: line([(15, 15), (21, 16)], body, 2)
    elif motif in ("jar", "gourd", "gall", "herbjar", "dew", "venom"):
        if motif == "gourd":
            ellipse((9, 13, 24, 28), body);ellipse((12, 6, 21, 16), light)
            line([(13, 7), (20, 7)], dark, 2)
        elif motif == "gall":
            ellipse((7, 6, 25, 27), body)
            line([(12, 10), (21, 23)], dark, 1)
        elif motif == "dew":
            poly([(16, 4), (9, 17), (10, 24), (16, 27), (23, 24), (24, 17)], body)
            ellipse((13, 12, 16, 17), light)
        else:
            poly([(11, 6), (21, 6), (23, 11), (24, 26), (8, 26), (9, 11)], body)
            ellipse((9, 4, 23, 9), dark)
            poly([(11, 13), (21, 13), (20, 21), (12, 21)], light)
            if motif == "herbjar": line([(15, 20), (17, 14)], dark, 1)
            elif motif == "venom": ellipse((15, 14, 19, 19), "#834d8d")
    elif motif in ("charm", "tag", "token", "pendant", "bell"):
        if motif in ("pendant", "bell"):
            line([(10, 7), (16, 4), (23, 7)], body, 1)
            ellipse((8, 9, 24, 25), body)
            if motif == "bell":
                line([(9, 21), (23, 21)], light, 2);ellipse((14, 22, 18, 27), dark)
            else: ellipse((12, 12, 20, 20), light)
        else:
            poly([(10, 4), (22, 4), (26, 26), (6, 26)], light if motif == "charm" else body)
            ellipse((14, 5, 18, 9), dark)
            if motif == "charm":
                line([(16, 11), (13, 20), (19, 16)], "#9b4130", 1)
            elif motif == "token": ellipse((12, 13, 20, 21), dark)
            else: line([(11, 15), (22, 15)], light, 1)
    elif motif in ("bowl", "bun", "chest", "pelt"):
        if motif == "bun":
            ellipse((5, 9, 27, 26), light)
            for xx in (11, 16, 21): line([(xx, 11), (16, 17)], body, 1)
        elif motif == "bowl":
            poly([(5, 13), (27, 13), (23, 25), (9, 25)], body)
            ellipse((5, 10, 27, 17), light)
        elif motif == "chest":
            poly([(5, 10), (27, 10), (26, 26), (6, 26)], body)
            poly([(5, 10), (9, 6), (23, 6), (27, 10)], light)
            line([(16, 10), (16, 26)], dark, 2)
        else:
            poly([(7, 6), (12, 9), (20, 9), (25, 6), (24, 22), (20, 28), (12, 28), (8, 22)], body)
            for xx in (12, 20): line([(xx, 14), (xx, 24)], light, 1)
    elif motif in ("fist", "claw", "palm", "lotus", "kick", "fang", "paw", "beak", "coil", "halo", "meditate", "seal", "nose", "breath", "spring", "stone", "steps", "moon", "banner", "shields"):
        if motif in ("fist", "claw", "palm", "halo"):
            poly([(8, 14), (11, 9), (21, 8), (24, 14), (22, 23), (11, 25), (7, 20)], body)
            for xx in (12, 16, 20): line([(xx, 10), (xx, 15)], light, 1)
            if motif == "claw":
                for xx in (11, 16, 21): line([(xx, 8), (xx+2, 3)], light, 1)
            if motif == "palm": line([(10, 21), (22, 19)], light, 2)
            if motif == "halo": d.arc((3, 2, 28, 29), 195, 350, fill=light, width=2)
        elif motif in ("lotus", "spring"):
            poly([(16, 24), (8, 15), (12, 7), (16, 14), (20, 7), (24, 15)], body)
            for dx in (-1, 1): line([(16, 23), (16+dx*8, 17)], light, 1)
        elif motif == "kick":
            line([(11, 7), (17, 15), (25, 18)], body, 5)
            line([(16, 16), (10, 25)], light, 3)
        elif motif in ("fang", "beak"):
            for dx in ((0, 9) if motif == "fang" else (4,)):
                poly([(7+dx, 7), (14+dx, 8), (11+dx, 26)], light)
        elif motif == "paw":
            ellipse((8, 14, 23, 26), body)
            for xx, yy in ((8, 8), (14, 5), (21, 7), (25, 12)): ellipse((xx-2, yy, xx+2, yy+5), light)
        elif motif == "coil":
            d.arc((5, 8, 26, 27), 40, 345, fill=body, width=4)
            ellipse((20, 7, 27, 13), light)
        elif motif in ("meditate", "breath"):
            ellipse((13, 5, 19, 11), light)
            poly([(11, 14), (20, 14), (24, 22), (8, 22)], body)
            line([(7, 25), (25, 25)], light, 2)
            if motif == "breath": d.arc((4, 2, 28, 28), 215, 315, fill=light, width=1)
        elif motif in ("seal", "stone"):
            poly([(8, 24), (10, 12), (21, 8), (25, 24)], body)
            line([(12, 19), (21, 19)], light, 2)
        elif motif == "nose":
            poly([(12, 7), (21, 8), (24, 22), (19, 26), (11, 23)], body)
            for xx in (15, 21): ellipse((xx-1, 20, xx+1, 22), dark)
        elif motif == "steps":
            ellipse((8, 8, 15, 17), body);ellipse((18, 17, 26, 26), light)
        elif motif == "moon":
            ellipse((7, 5, 24, 25), light);d.ellipse((13, 2, 28, 21), fill=(0, 0, 0, 0))
            d.arc((7, 5, 24, 25), 50, 285, fill=dark, width=2)
        elif motif == "banner":
            line([(9, 4), (9, 27)], body, 2)
            poly([(10, 5), (25, 8), (21, 14), (25, 20), (10, 18)], light)
        else:
            for dx in (0, 10): poly([(5+dx, 8), (14+dx, 8), (13+dx, 21), (10+dx, 26), (6+dx, 21)], body if dx == 0 else light)

    # A few deliberate pixels suggest chipped ink / material texture without noise.
    rng = random.Random(seed)
    for _ in range(3):
        xx, yy = rng.randrange(7, 25), rng.randrange(7, 25)
        if im.getpixel((xx, yy))[3] and im.getpixel((xx, yy))[3] > 180:
            d.point((xx, yy), fill=light)
    return im.resize((CELL * SCALE, CELL * SCALE), Image.Resampling.NEAREST)


def build() -> None:
    groups = {"item": ITEMS, "skill": SKILLS, "xinfa": XINFA}
    entries = [(kind, key, motif, pal) for kind, group in groups.items() for key, (motif, pal) in group.items()]
    rows = (len(entries) + COLS - 1) // COLS
    atlas = Image.new("RGBA", (COLS * CELL * SCALE, rows * CELL * SCALE))
    meta = {"cols": COLS, "rows": rows, "cell": CELL * SCALE, "item": {}, "skill": {}, "xinfa": {}}
    for i, (kind, key, motif, pal) in enumerate(entries):
        atlas.alpha_composite(icon(kind, motif, pal, i + 19), ((i % COLS) * CELL * SCALE, (i // COLS) * CELL * SCALE))
        meta[kind][key] = [i % COLS, i // COLS]
    OUT.parent.mkdir(exist_ok=True)
    atlas.save(OUT, lossless=True, method=6)
    META.write_text("'use strict';\n// Generated by tools_scene/build_menu_icons.py; edit its manifest and rerun.\nwindow.MENU_ICONS = " + json.dumps(meta, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"{len(entries)} icons -> {OUT.relative_to(ROOT)} {atlas.size}; {META.relative_to(ROOT)}")


if __name__ == "__main__":
    build()
