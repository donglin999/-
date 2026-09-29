"""战斗精灵公共工具（工作流 D）：1 倍像素 RGBA numpy 数组上的变形、描边、组表与预览。
所有帧都是 1 倍像素（未放大），组表时统一 ×3 最近邻。规格见 docs/battle-sprite-spec.md。
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw

PX = 3                                   # 像素倍率
SCR = PX                                 # battle v3：每个美术像素 = 3 画布像素（整数倍），BART.h = 单元美术像素高 × 3 = cell[1]
OUT = np.array([34, 22, 30, 255], np.uint8)   # 统一描边色
CELLS = {'hero': 87, 'suzhi': 69, 'dog': 135}   # s_{char}_bright 单元宽（ART.sheet）


def load_frame(char, row=1, col=0, cellw=None):
    """从 assets/s_{char}_bright.webp 取 1 倍像素帧（行 d,l,r,u = 0..3）"""
    cw = cellw or CELLS[char]
    s = Image.open(f'assets/s_{char}_bright.webp').convert('RGBA')
    return np.array(s.crop((col * cw, row * 141, (col + 1) * cw, (row + 1) * 141)))[1::PX, 1::PX].copy()


def bbox(img):
    ys, xs = np.nonzero(img[..., 3])
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def crop(img):
    x0, y0, x1, y1 = bbox(img)
    return img[y0:y1, x0:x1].copy()


def anchor_x(img, frac=.22):
    """脚部锚点：最下 frac 高度内不透明像素的 x 均值（对齐用，比包围盒中心稳定）"""
    a = img[..., 3] > 0
    ys, xs = np.nonzero(a)
    y0 = ys.max() - max(2, int((ys.max() - ys.min()) * frac))
    return xs[ys >= y0].mean()


def place(img, W, H, ax=None, dx=0, lift=0):
    """把裁好的帧放进 W×H 单元：脚底贴底边，锚点位于单元中线 (+dx)"""
    img = crop(img)
    ax = anchor_x(img) if ax is None else ax
    out = np.zeros((H, W, 4), np.uint8)
    h, w = img.shape[:2]
    ox = int(round(W / 2 - ax + dx - .5))
    oy = H - h - lift
    for y in range(h):
        for x in range(w):
            if img[y, x, 3] and 0 <= x + ox < W and 0 <= y + oy < H:
                out[y + oy, x + ox] = img[y, x]
    return out


def shear(img, k, feet=None):
    """整体倾斜：第 y 行水平平移 round(k*(feet-y)/feet)，脚不动。k>0 向右"""
    h, w = img.shape[:2]
    feet = h - 1 if feet is None else feet
    out = np.zeros_like(img)
    for y in range(h):
        d = int(round(k * (feet - y) / max(feet, 1)))
        if d >= 0: out[y, d:] = img[y, :w - d]
        else: out[y, :w + d] = img[y, -d:]
    return out


def bob(img, dy, below):
    """below 行以上的部分下沉/上提 dy 像素（呼吸），接缝用原行补齐"""
    if dy == 0: return img.copy()
    out = img.copy()
    up = img[:below].copy()
    out[:below] = 0
    if dy > 0:
        out[dy:below + dy] = np.where(up[..., 3:] > 0, up, out[dy:below + dy])
    else:
        out[:below + dy] = up[-dy:]
        out[below + dy:below] = img[below + dy:below]
    return out


def squash_rows(img, y0, y1, keep):
    """把 [y0,y1) 行压缩成 keep 行（均匀抽行），上方整体下移；用于下蹲/跪地"""
    h = img.shape[0]
    rows = np.round(np.linspace(y0, y1 - 1, keep)).astype(int)
    body = np.concatenate([img[:y0], img[rows], img[y1:]], 0)
    out = np.zeros_like(img)
    out[h - body.shape[0]:] = body
    return out


def lie(img, head='r'):
    """倒地：旋转 90°，头朝 head 一侧，贴底"""
    c = crop(img)
    r = np.rot90(c, -1 if head == 'r' else 1).copy()
    return r


def lift(img, dy):
    """整体上移 dy 像素（腾空）"""
    out = np.zeros_like(img)
    out[:img.shape[0] - dy] = img[dy:]
    return out


def outline(img, col=OUT):
    """外描边：透明且 4 邻有不透明像素的位置补深色（取邻色压暗后偏向统一描边色）"""
    a = img[..., 3] > 0
    h, w = a.shape
    out = img.copy()
    pad = np.pad(a, 1)
    nb = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    ring = nb & ~a
    ys, xs = np.nonzero(ring)
    for y, x in zip(ys, xs):
        acc = []
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < h and 0 <= xx < w and a[yy, xx]: acc.append(img[yy, xx, :3].astype(float))
        c = np.mean(acc, 0) * .28 + col[:3] * .72
        out[y, x] = [*np.clip(c, 0, 255).astype(np.uint8), 255]
    return out


def rim_light(img, amt=.14):
    """统一光向（左上）：内侧上/左边缘提亮，下/右边缘压暗；深色描边像素不动"""
    a = img[..., 3] > 0
    pad = np.pad(a, 1)
    up, dn = ~pad[:-2, 1:-1], ~pad[2:, 1:-1]
    lf, rt = ~pad[1:-1, :-2], ~pad[1:-1, 2:]
    # 往内一圈（描边内侧）
    inner = a.copy()
    edge = a & (up | dn | lf | rt)
    inner &= ~edge
    pad2 = np.pad(inner, 1)
    e_ul = inner & (~pad2[:-2, 1:-1] | ~pad2[1:-1, :-2])
    e_dr = inner & (~pad2[2:, 1:-1] | ~pad2[1:-1, 2:]) & ~e_ul
    out = img.copy().astype(float)
    lum = out[..., :3].mean(-1)
    m1 = e_ul & (lum > 40)
    out[m1, :3] = out[m1, :3] + (255 - out[m1, :3]) * amt
    out[e_dr, :3] *= (1 - amt)
    return np.clip(out, 0, 255).astype(np.uint8)


def draw_line(img, x0, y0, x1, y1, c, w=1):
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(n + 1):
        t = i / n
        x, y = int(round(x0 + (x1 - x0) * t)), int(round(y0 + (y1 - y0) * t))
        for k in range(w):
            if 0 <= y + k < img.shape[0] and 0 <= x < img.shape[1]: img[y + k, x] = c


def save_sheet(frames, path, cols=None):
    cols = cols or len(frames)
    H, W = frames[0].shape[:2]
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new('RGBA', (W * PX * cols, H * PX * rows))
    for i, f in enumerate(frames):
        sheet.paste(Image.fromarray(f).resize((W * PX, H * PX), Image.NEAREST), ((i % cols) * W * PX, (i // cols) * H * PX))
    sheet.save(path, lossless=True, method=6)
    return sheet.size, (W * PX, H * PX)


def preview(frames, labels, path, scale=2, bg=(26, 24, 34)):
    """深色背景预览：每帧单元外框 + 底边基线 + 标号"""
    H, W = frames[0].shape[:2]
    Z = PX * scale
    cols = min(len(frames), 9)
    rows = (len(frames) + cols - 1) // cols
    im = Image.new('RGBA', (cols * (W * Z + 8) + 8, rows * (H * Z + 26) + 8), bg + (255,))
    d = ImageDraw.Draw(im)
    for i, f in enumerate(frames):
        x = 8 + (i % cols) * (W * Z + 8)
        y = 8 + (i // cols) * (H * Z + 26)
        d.rectangle([x - 1, y - 1, x + W * Z, y + H * Z], outline=(60, 58, 76))
        im.alpha_composite(Image.fromarray(f).resize((W * Z, H * Z), Image.NEAREST), (x, y))
        d.line([(x, y + H * Z - 1), (x + W * Z, y + H * Z - 1)], fill=(120, 90, 60))
        d.text((x + 2, y + H * Z + 4), f'{i} {labels[i]}', fill=(230, 220, 200))
    im.save(path)
