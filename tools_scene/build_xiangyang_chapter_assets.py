"""Pack reviewed built-in imagegen outputs into Xiangyang runtime assets.

Inputs live in raw_scene/xiangyang_source (local generation originals, ignored by Git).
Run from the repository root after generating the sources listed in
docs/design/xiangyang-art-prompts.md.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


SOURCE = Path("raw_scene/xiangyang_source")
ASSETS = Path("assets")


def key_magenta(image):
    rgba = np.asarray(image.convert("RGBA")).copy()
    r, g, b = [rgba[:, :, i].astype(np.int16) for i in range(3)]
    # Include antialiased magenta edge pixels, not just the flat background.
    # Skin, cloth and hair do not have simultaneous red+blue dominance.
    magenta = (r > 40) & (b > 40) & ((np.minimum(r, b) - g) > 8) & (b > r * .68)
    rgba[magenta, 3] = 0
    return Image.fromarray(rgba)


def portrait(source, name, magenta=False):
    image = Image.open(SOURCE / source).convert("RGBA")
    if magenta:
        image = key_magenta(image)
    box = image.getchannel("A").getbbox()
    image = image.crop(box)
    image.thumbnail((480, 640), Image.Resampling.LANCZOS)
    if magenta:
        # Resize can interpolate keyed pixels back into a pink one-pixel fringe.
        # Remove only magenta-tinted antialias pixels, then contract alpha once.
        rgba = np.asarray(image).copy()
        r, g, b, a = [rgba[:, :, i].astype(np.int16) for i in range(4)]
        spill = (a < 250) & (r > g + 10) & (b > g + 10)
        rgba[spill, 3] = 0
        image = Image.fromarray(rgba)
        image.putalpha(image.getchannel('A').filter(ImageFilter.MinFilter(3)))
        rgba = np.asarray(image).copy()
        rgba[rgba[:, :, 3] >= 240, 3] = 255
        rgba[rgba[:, :, 3] == 0, :3] = 0
        image = Image.fromarray(rgba)
    image.save(ASSETS / f"p_{name}.webp", quality=92, method=6)
    print(f"p_{name}.webp", image.size)


def four_by_four(source, name, cell_width):
    image = Image.open(SOURCE / source).convert("RGBA")
    cols = rows = 4
    target = Image.new("RGBA", (cell_width * 4, 141 * 4))
    for row in range(rows):
        for col in range(cols):
            box = (
                round(col * image.width / cols), round(row * image.height / rows),
                round((col + 1) * image.width / cols), round((row + 1) * image.height / rows),
            )
            cell = image.crop(box)
            # Reduce to the established 47-pixel art grid, then enlarge x3.
            cell = cell.resize((cell_width // 3, 47), Image.Resampling.BOX)
            cell = cell.resize((cell_width, 141), Image.Resampling.NEAREST)
            target.alpha_composite(cell, (col * cell_width, row * 141))
    target.save(ASSETS / f"s_{name}.webp", lossless=True, method=6)
    print(f"s_{name}.webp", target.size)


def fallen_zhou():
    image = Image.open(SOURCE / "zhou_fallen.png").convert("RGBA")
    image = image.crop(image.getchannel("A").getbbox())
    image.thumbnail((114, 51), Image.Resampling.BOX)
    # The story scene draws all NPCs through the same four-direction sheet API.
    # Only one collapsed pose is needed; every cell uses it without artificial walking.
    sheet = Image.new("RGBA", (120 * 4, 141 * 4))
    for row in range(4):
        for col in range(4):
            sheet.alpha_composite(image, (col * 120 + (120 - image.width) // 2,
                                          row * 141 + 141 - image.height - 6))
    sheet.save(ASSETS / "s_zhou.webp", lossless=True, method=6)
    print("s_zhou.webp", sheet.size)


def evidence_icons():
    source = Image.open(SOURCE / "evidence_sheet.png").convert("RGBA")
    old = Image.open(ASSETS / "i_icons.webp").convert("RGBA")
    atlas = Image.new("RGBA", (576, 384))
    atlas.alpha_composite(old, (0, 0))
    for idx in range(4):
        col, row = idx % 2, idx // 2
        box = (round(col * source.width / 2), round(row * source.height / 2),
               round((col + 1) * source.width / 2), round((row + 1) * source.height / 2))
        icon = source.crop(box)
        icon = icon.crop(icon.getchannel("A").getbbox())
        icon.thumbnail((29, 29), Image.Resampling.BOX)
        slot = Image.new("RGBA", (32, 32))
        slot.alpha_composite(icon, ((32 - icon.width) // 2, (32 - icon.height) // 2))
        slot = slot.resize((96, 96), Image.Resampling.NEAREST)
        atlas.alpha_composite(slot, (idx * 96, 288))
    atlas.save(ASSETS / "i_icons.webp", lossless=True, method=6)
    print("i_icons.webp", atlas.size)


def ye_expressions():
    # The seven edits share one 867x1815 crop. Keep a fixed canvas so the
    # dialogue portrait never jumps when its expression changes.
    for expression in ('smile', 'shy', 'angry', 'worry', 'surprise', 'battle', 'hurt'):
        image = Image.open(SOURCE / f'ye_expr_{expression}.png').convert('RGBA')
        rgba = np.asarray(image).copy()
        rgba[rgba[:, :, 3] < 24, 3] = 0
        image = Image.fromarray(rgba).resize((306, 640), Image.Resampling.LANCZOS)
        image.putalpha(image.getchannel('A').filter(ImageFilter.MinFilter(3)))
        rgba = np.asarray(image).copy()
        rgba[rgba[:, :, 3] >= 240, 3] = 255
        rgba[rgba[:, :, 3] == 0, :3] = 0
        image = Image.fromarray(rgba)
        image.save(ASSETS / f'p_ye_{expression}.webp', lossless=True, method=6)
        print(f'p_ye_{expression}.webp', image.size)


def main():
    cg = Image.open(SOURCE / 'zhou_rescue_cg.png').convert('RGB')
    cg.thumbnail((1280, 720), Image.Resampling.LANCZOS)
    cg.save(ASSETS / 'cg_zhou_rescue.webp', quality=90, method=6)
    portrait("ye_portrait_magenta.png", "ye", magenta=True)
    portrait("zhou_portrait.png", "zhou")
    portrait("liu_portrait.png", "liu")
    portrait("langli_portrait_magenta.png", "langli", magenta=True)
    four_by_four("ye_sheet.png", "ye", 75)
    four_by_four("liu_sheet.png", "liu", 90)
    four_by_four("langli_sheet.png", "langli", 90)
    fallen_zhou()
    evidence_icons()
    ye_expressions()


if __name__ == "__main__":
    main()
