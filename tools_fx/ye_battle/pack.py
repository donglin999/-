"""Pack built-in imagegen Ye Heng poses into the battle v4 3x hard-pixel sheet.

Run from xiaojianghu: python3 tools_fx/ye_battle/pack.py
The input pose grids are kept in art_sources/ye_battle_20260930/.
No project image API is used.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "art_sources/ye_battle_20260930"
OUT = ROOT / "assets/b_ye.webp"
PREVIEW = ROOT / "review/battle_ye/compare.png"
PREVIEW_ALL = ROOT / "review/battle_ye/all20.png"
ART_W, ART_H, FLOOR = 132, 70, 69

# Cell order follows the current party BART contract. The pose art is independent,
# while only breathing and lean microposes are derived from the same source pose.
POSES = {
    "guard": ("base", 0, 64), "hurt": ("base", 1, 62),
    "cast": ("base", 2, 63), "win": ("base", 3, 64),
    "wind": ("attack", 0, 62), "strike": ("attack", 1, 59),
    "follow": ("attack", 2, 52), "back": ("attack", 3, 63),
    "dash0": ("move", 0, 51), "dash1": ("move", 1, 52),
    "chamber": ("move", 2, 57), "thrust": ("move", 3, 49),
    "kneel": ("down", 0, 42), "dead": ("down", 1, 24),
}
ORDER = ["guard", "guard:bob1", "guard:bob2", "guard:lean", "dash0",
         "dash1", "wind", "strike", "follow", "back", "chamber",
         "thrust", "hurt", "cast", "cast:bob1", "kneel", "kneel:bob1",
         "dead", "win", "win:bob1"]


def input_cell(group, index):
    im = Image.open(SOURCE / f"{group}.png").convert("RGB")
    w, h = im.size
    if group == "down":
        return im.crop((0, index * h // 2, w, (index + 1) * h // 2))
    x, y = index % 2, index // 2
    return im.crop((x * w // 2, y * h // 2, (x + 1) * w // 2, (y + 1) * h // 2))


def magenta_key(rgb, allow_fragments=False):
    a = np.asarray(rgb).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # The generated backgrounds are flat magenta. Discard antialias blends with
    # that colour too; the remaining outline is rebuilt on the 1x pixel grid.
    magenta = (r > 75) & (b > 75) & (r > g * 1.23) & (b > g * 1.23)
    fg = ~magenta
    components, count = ndi.label(fg)
    if not count:
        raise ValueError("empty pose")
    sizes = ndi.sum(fg, components, range(1, count + 1))
    keep = int(np.argmax(sizes)) + 1
    main = components == keep
    my, mx = np.nonzero(main)
    main_box = (mx.min(), my.min(), mx.max(), my.max())
    kept = [keep]
    # Small free needles can appear beyond a hand. Keep fragments close to
    # the body, but reject imagegen dust at panel boundaries.
    if allow_fragments:
        for idx, size in enumerate(sizes, 1):
            if idx == keep or size < 6:
                continue
            cy, cx = np.nonzero(components == idx)
            dx = max(main_box[0] - cx.max(), cx.min() - main_box[2], 0)
            dy = max(main_box[1] - cy.max(), cy.min() - main_box[3], 0)
            if dx < 90 and dy < 90:
                kept.append(idx)
    fg = np.isin(components, kept)
    ys, xs = np.nonzero(fg)
    box = (max(0, xs.min() - 3), max(0, ys.min() - 3), min(rgb.width, xs.max() + 4), min(rgb.height, ys.max() + 4))
    rgba = np.dstack((np.asarray(rgb), (fg * 255).astype(np.uint8)))
    return Image.fromarray(rgba).crop(box)


def art_pose(group, index, target_h):
    # The throw frame has one detached silver dart. Other isolated fragments
    # are adjacent grid-cell spillover or imagegen dust.
    raw = magenta_key(input_cell(group, index), allow_fragments=(group == "attack" and index == 1))
    target_w = round(raw.width * target_h / raw.height)
    if target_w > ART_W - 6:
        k = (ART_W - 6) / target_w
        target_w, target_h = ART_W - 6, max(1, round(target_h * k))
    small = raw.resize((target_w, target_h), Image.Resampling.BOX)
    a = np.asarray(small).copy()
    a[..., 3] = np.where(a[..., 3] >= 96, 255, 0).astype(np.uint8)
    a[..., :3][a[..., 3] == 0] = 0
    # One exact art-pixel outline prevents magenta/soft-edge fringes.
    bordered = np.zeros((target_h + 2, target_w + 2, 4), np.uint8)
    bordered[1:-1, 1:-1] = a
    edge = ndi.binary_dilation(bordered[..., 3] > 0, iterations=1) & (bordered[..., 3] == 0)
    bordered[edge] = [37, 28, 31, 255]
    canvas = np.zeros((ART_H, ART_W, 4), np.uint8)
    ph, pw = bordered.shape[:2]
    left = (ART_W - pw) // 2
    top = FLOOR - ph + 1
    canvas[max(0, top):min(ART_H, top + ph), left:left + pw] = bordered[max(0, -top):max(0, -top) + min(ART_H, top + ph) - max(0, top)]
    return canvas


def shift(a, dy=0, dx=0):
    out = np.zeros_like(a)
    h, w = a.shape[:2]
    xs, xe = max(0, dx), min(w, w + dx)
    ys, ye = max(0, dy), min(h, h + dy)
    out[ys:ye, xs:xe] = a[ys - dy:ye - dy, xs - dx:xe - dx]
    return out


def paletteize(frames):
    pixels = np.concatenate([f[f[..., 3] > 0, :3] for f in frames])
    sample = Image.fromarray(pixels.reshape((1, -1, 3)).astype(np.uint8))
    quant = sample.quantize(colors=32, method=Image.Quantize.MEDIANCUT)
    colors = np.asarray(quant.convert("RGB")).reshape(-1, 3)
    palette = np.unique(colors, axis=0).astype(np.int32)
    for f in frames:
        mask = f[..., 3] > 0
        p = f[mask, :3].astype(np.int32)
        dist = ((p[:, None, :] - palette[None, :, :]) ** 2).sum(axis=2)
        f[mask, :3] = palette[dist.argmin(axis=1)].astype(np.uint8)
    return palette


def locate_face(frame):
    """Reserve readable skin/eye pixels at final 1x size after global palette fit.

    BOX reduction and a shared clothing-heavy palette otherwise collapse the
    six-head-tall side-profile face into brown/gray pixels on the 1280 canvas.
    This acts only inside the detected face's opaque pixels; it neither scales
    the head nor moves the silhouette.
    """
    rgb = frame[..., :3].astype(np.int32)
    alpha = frame[..., 3] > 0
    ys, _ = np.nonzero(alpha)
    top = int(ys.min())
    yy, xx = np.indices(alpha.shape)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    skin = alpha & (yy < top + 30) & (r > 140) & (g > 90) & (b > 65) & (r > g * 1.10) & (g > b * 1.05)
    labels, count = ndi.label(skin)
    candidates = []
    for i in range(1, count + 1):
        cy, cx = np.nonzero(labels == i)
        if len(cy) >= 10:
            candidates.append((len(cy) - 1.5 * (cy.min() - top), i))
    if not candidates:
        return None
    chosen = max(candidates)[1]
    face = labels == chosen
    fy, fx = np.nonzero(face)
    xmin, ymin, xmax = int(fx.min()), int(fy.min()), int(fx.max())
    inner = ndi.binary_erosion(alpha, iterations=1)
    patch = face | (ndi.binary_dilation(face, iterations=1) & inner)
    return patch, xmin, ymin, xmax


def enhance_face(frame, mark, source):
    if mark is None:
        return
    patch, xmin, ymin, xmax = mark
    yy, xx = np.indices(patch.shape)
    src = source[..., :3].astype(np.int32)
    lum = src[..., 0] * .2126 + src[..., 1] * .7152 + src[..., 2] * .0722
    # Keep the hair/eye's original dark pixels. Map only skin-coloured pixels
    # to five fixed hues according to the *pre-quantization* lightness.
    warm = (src[..., 0] > src[..., 1] * 1.07) & (src[..., 1] > src[..., 2] * 1.03)
    levels = [
        (90, 125, (129, 87, 72)),      # eye socket / under-nose shade
        (125, 160, (170, 119, 97)),    # jaw cast shade
        (160, 190, (205, 151, 121)),   # cheek midtone
        (190, 218, (231, 186, 150)),   # broad lit face plane
        (218, 999, (249, 216, 178)),   # forehead / nose bridge glint
    ]
    for lo, hi, color in levels:
        band = patch & warm & (lum >= lo) & (lum < hi)
        frame[band, :3] = color
    # The jaw receives a narrow cast shadow; this is a tonal step rather than
    # repainting the full face one colour.
    jaw = patch & warm & (yy >= ymin + 8) & (lum >= 160) & (lum < 218)
    frame[jaw, :3] = [170, 119, 97]
    ex, ey = xmin + 2, ymin + 4
    nearby = np.argwhere(patch & (np.abs(xx - ex) <= 2) & (np.abs(yy - ey) <= 2))
    if len(nearby):
        y, x = min(nearby, key=lambda p: abs(int(p[0]) - ey) + abs(int(p[1]) - ex))
        frame[y, x, :3] = [49, 37, 34]


def main():
    poses = {name: art_pose(*spec) for name, spec in POSES.items()}
    frames = []
    for label in ORDER:
        if label.endswith(":bob1"):
            frames.append(shift(poses[label.split(":")[0]], dy=-1))
        elif label == "guard:bob2":
            frames.append(shift(poses["guard"], dy=-2))
        elif label == "guard:lean":
            frames.append(shift(poses["guard"], dx=-1))
        else:
            frames.append(poses[label].copy())
    face_marks = [locate_face(frame) for frame in frames]
    source_frames = [frame.copy() for frame in frames]
    palette = paletteize(frames)
    for frame, mark, source in zip(frames, face_marks, source_frames):
        enhance_face(frame, mark, source)
    strip = Image.new("RGBA", (ART_W * 3 * len(frames), ART_H * 3), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        hi = Image.fromarray(fr).resize((ART_W * 3, ART_H * 3), Image.Resampling.NEAREST)
        strip.alpha_composite(hi, (i * ART_W * 3, 0))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    strip.save(OUT, format="WEBP", lossless=True, method=6)

    # On-canvas 2x display preview beside party references. This is only review;
    # the shipped sheet keeps all twenty frames and exact 3x pixels.
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    board = Image.new("RGB", (960, 520), (32, 29, 40))
    draw = ImageDraw.Draw(board)
    for row, (name, path, cell, indices) in enumerate([
        ("Hero", ROOT / "assets/b_hero.webp", (396, 210), [0, 4, 6, 7]),
        ("Su Zhi", ROOT / "assets/b_suzhi.webp", (246, 210), [0, 4, 6, 7]),
        ("Ye Heng", OUT, (396, 210), [0, 4, 6, 7]),
    ]):
        src = Image.open(path).convert("RGBA")
        draw.text((8, row * 172 + 8), name, fill=(245, 231, 211))
        for col, idx in enumerate(indices):
            cw, ch = cell
            fr = src.crop((idx * cw, 0, (idx + 1) * cw, ch))
            bound = fr.getbbox()
            if bound:
                fr = fr.crop(bound)
            fr.thumbnail((210, 140), Image.Resampling.NEAREST)
            board.paste(fr, (110 + col * 212 + (210 - fr.width) // 2, row * 172 + 8), fr)
    board.save(PREVIEW)
    all_board = Image.new("RGB", (1000, 900), (32, 29, 40))
    all_draw = ImageDraw.Draw(all_board)
    for i in range(len(frames)):
        fr = strip.crop((i * ART_W * 3, 0, (i + 1) * ART_W * 3, ART_H * 3))
        fr = fr.crop(fr.getbbox())
        fr.thumbnail((240, 145), Image.Resampling.NEAREST)
        x = (i % 4) * 250 + (250 - fr.width) // 2
        y = (i // 4) * 180
        all_board.paste(fr, (x, y), fr)
        all_draw.text(((i % 4) * 250 + 8, y + 150), f"{i}: {ORDER[i]}", fill="white")
    all_board.save(PREVIEW_ALL)
    print(f"{OUT}: cell 396x210, cols {len(frames)}, palette {len(palette)}, alpha {np.unique(np.asarray(strip)[...,3]).tolist()}")
    print(PREVIEW)
    print(PREVIEW_ALL)


if __name__ == "__main__":
    main()
