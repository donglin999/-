"""Pack the imagegen soldier pose sources into a hard-pixel battle sheet.

The four figures in each source overlap in X due to long spears, so isolate
connected alpha components instead of slicing four equal vertical columns.
All color reduction is shared across frames before nearest-neighbor 3x export.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, label, find_objects

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
CELL = (136, 90)  # art pixels; vertical spear in kneel/cast poses
ORIGIN = (68, 88)

# Body head-to-foot height in the source, pelvis/body X, ground Y.  The spear
# changes total bounds but must not change the soldier's actual body height.
SPECS = {
    'base': [(210, 450, 275, 659), (190, 468, 778, 659),
             (254, 405, 1233, 659), (None, 450, 1725, 659)],
    'atk':  [(230, 410, 249, 641), (230, 410, 710, 641),
             (245, 400, 1288, 645), (230, 410, 1800, 641)],
    'move': [(205, 432, 326, 637), (230, 407, 764, 637),
             (243, 395, 1368, 638), (285, 342, 1880, 627)],
}


def source_poses(name):
    arr = np.asarray(Image.open(HERE / 'gen' / f'{name}.png').convert('RGBA'))
    opaque = arr[:, :, 3] > 100
    labels, _ = label(opaque)
    components = []
    for i, sl in enumerate(find_objects(labels), 1):
        if sl is None:
            continue
        area = int((labels[sl] == i).sum())
        if area < 1000:
            continue
        components.append((sl[1].start, i, sl, area))
    components.sort()
    if len(components) != 4:
        raise ValueError(f'{name}: expected 4 full connected figures, got {components}')
    return arr, labels, components


def art_pose(name, pose_no):
    arr, labels, comps = source_poses(name)
    _, component_id, (ys, xs), _ = comps[pose_no]
    part = arr[ys, xs].copy()
    part[:, :, 3] = np.where(labels[ys, xs] == component_id, 255, 0).astype('uint8')
    _, body_h, body_x, ground_y = SPECS[name][pose_no]
    # Existing bandit/monk idle bodies are 57/56 art pixels high once empty
    # cell padding is excluded.  Match that visible grid density here.
    scale = 57 / body_h
    width = max(1, round(part.shape[1] * scale))
    height = max(1, round(part.shape[0] * scale))
    piece = Image.fromarray(part, 'RGBA').resize((width, height), Image.Resampling.BOX)
    piece_np = np.asarray(piece).copy()
    piece_np[:, :, 3] = np.where(piece_np[:, :, 3] >= 108, 255, 0)
    piece = Image.fromarray(piece_np, 'RGBA')
    left = round(ORIGIN[0] + (xs.start - body_x) * scale)
    top = round(ORIGIN[1] + (ys.start - ground_y) * scale)
    if left < 0 or top < 0 or left + width > CELL[0] or top + height > CELL[1]:
        raise ValueError(f'{name}[{pose_no}] clipped: {(left, top, width, height)}')
    out = Image.new('RGBA', CELL)
    out.alpha_composite(piece, (left, top))
    return out


def offset(im, x=0, y=0):
    out = Image.new('RGBA', CELL)
    out.alpha_composite(im, (x, y))
    return out


def build_frames():
    base = [art_pose('base', i) for i in range(4)]
    atk = [art_pose('atk', i) for i in range(4)]
    move = [art_pose('move', i) for i in range(4)]
    guard, cast, hurt, dead = base
    wind, strike, follow, back = atk
    dash, chamber, thrust, kneel = move
    return [
        guard, offset(guard, y=-1), offset(guard, y=1), offset(guard, x=-1),
        dash, offset(dash, y=-2), wind, strike, follow, back,
        chamber, thrust, hurt, cast, offset(cast, y=-1),
        kneel, offset(kneel, y=-1), dead,
    ]


def common_palette(frames):
    pixels = np.concatenate([np.asarray(f)[:, :, :3][np.asarray(f)[:, :, 3] > 0]
                             for f in frames], axis=0)
    # A single adaptive palette prevents a color from jumping between poses.
    sample = Image.fromarray(pixels.reshape(1, -1, 3).astype('uint8'), 'RGB')
    quant = sample.quantize(colors=27, method=Image.Quantize.MEDIANCUT)
    pal = np.asarray(quant.getpalette()[:81], dtype='uint8').reshape(27, 3)
    return pal


def finalize(frame, palette, display_palette):
    a = np.asarray(frame).copy()
    mask = a[:, :, 3] > 0
    rgb = a[:, :, :3].astype('int32')
    src = rgb[mask]
    d = ((src[:, None, :] - palette[None, :, :].astype('int32')) ** 2).sum(axis=2)
    a[:, :, :3][mask] = display_palette[d.argmin(axis=1)]
    outer = binary_dilation(mask) & ~mask
    a[:, :, :3][outer] = (34, 22, 30)
    a[:, :, 3][outer] = 255
    a[:, :, :3][~(mask | outer)] = 0
    a[:, :, 3][~(mask | outer)] = 0
    return Image.fromarray(a, 'RGBA')


def main():
    frames = build_frames()
    palette = common_palette(frames)
    display_palette = palette.copy()
    # Against the dark battle underlay the newly generated iron read a shade
    # darker than the existing bandit.  Raise midtones one restrained step;
    # leave near-black and the separately applied 1px outline untouched.
    luminance = display_palette.astype('float32') @ np.array([.213, .715, .072])
    mid = luminance > 28
    red_trim = mid & (display_palette[:, 0] > display_palette[:, 1] * 1.18)
    display_palette[mid] = np.minimum(display_palette[mid].astype('int16') + 9, 255).astype('uint8')
    display_palette[red_trim, 0] = np.minimum(display_palette[red_trim, 0].astype('int16') + 4, 255).astype('uint8')
    frames = [finalize(f, palette, display_palette) for f in frames]
    sheet = Image.new('RGBA', (CELL[0] * len(frames), CELL[1]))
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, (i * CELL[0], 0))
    sheet = sheet.resize((sheet.width * 3, sheet.height * 3), Image.Resampling.NEAREST)
    out = ROOT / 'assets' / 'b_soldier.webp'
    sheet.save(out, 'WEBP', lossless=True, quality=100, method=6)
    preview = HERE / 'contact.png'
    sheet.resize((sheet.width // 3, sheet.height // 3), Image.Resampling.NEAREST).save(preview)
    check = np.asarray(sheet)
    assert set(np.unique(check[:, :, 3]).tolist()) <= {0, 255}
    assert np.array_equal(check, np.repeat(np.repeat(check[::3, ::3], 3, 0), 3, 1))
    print(out, sheet.size, 'palette', len(palette), 'alpha', np.unique(check[:, :, 3]), 'preview', preview)


if __name__ == '__main__':
    main()
