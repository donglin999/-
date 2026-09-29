"""配准 → 去背 → 降采样 → 共用调色板 → 描边 → 组表 → 写 sheets.json（工作流 E，docs/anim-pipeline.md §4）

坐标系：所有帧都落在"白模空间"——美术像素、站姿骨盆 x=0、地面 y=0。生成图按白模剪影配准后降采样到这个网格，
所以帧间位置由白模决定（程序保证零抖动），身高由白模决定（生成图偏大/偏小会被配准缩放抵消）。

用法（仓库根目录）：
  python3 tools_fx/rig/assemble.py hero            # 读 raw_anim/hero/qa.json 选帧 → assets/b_hero.webp + raw_battle/E/sheets.json
  python3 tools_fx/rig/assemble.py hero --pipe atk # 另出 白模/生成/像素化 对比图 review/battle_v3/E/pipe_atk.png
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import rig as R  # noqa: E402
import poses as PS  # noqa: E402
import mannequin as M  # noqa: E402
import bsprite as bs  # noqa: E402
from foe_battle import quantize, despeckle  # noqa: E402

REVIEW = 'review/battle_v3/E'
PARTY_E = ('hero', 'suzhi')          # 工作流 E 的我方角色：产物仍写 raw_battle/E、review/battle_v3/E


def review_dir(char):
    return REVIEW if char in PARTY_E else 'review/battle_v4/I'


def can_w(char):
    return PS.CHARS[char].get('can_w', CAN_W)
SUB = 2          # 配准搜索网格：每美术像素 SUB 个采样
SC_MAX = float(os.environ.get('REG_SC_MAX', 1.36))   # 配准缩放上限（工作流 I 的敌人/动物生成图常比白模小 → 1.6）


def load_rgb(path):
    """读生成图：模型有时直接返回透明背景的 RGBA —— 先铺到品红底上再统一色键"""
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 0, 255, 255)); bg.alpha_composite(im)
        return bg.convert('RGB')
    return im.convert('RGB')


def cut_bg(rgb):
    """品红色键去背（兼容白底）：返回前景布尔掩码（去小噪点、保留主体附近碎块、腐蚀 1px 去色边）"""
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    mag = (r - g > 60) & (b - g > 60) & (np.abs(r - b) < 90)
    white = (rgb.min(-1) > 238) & (rgb.max(-1).astype(int) - rgb.min(-1) < 14)
    lab, _ = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = mag | np.isin(lab, list(border))
    fg = ~bg
    l2, k2 = ndi.label(fg)
    if k2 == 0: return fg
    sz = ndi.sum(fg, l2, range(1, k2 + 1))
    main = int(np.argmax(sz)) + 1
    near = ndi.binary_dilation(l2 == main, iterations=24)
    keep = [i + 1 for i, s_ in enumerate(sz) if s_ >= 12 and (i + 1 == main or (near & (l2 == i + 1)).any())]
    fg = np.isin(l2, keep)
    return ndi.binary_erosion(fg, iterations=1)


CAN_W = 180      # 规范帧宽（美术像素）：站姿骨盆 x=0 位于 CAN_W/2


def man_frame(char, pose_name, op=None):
    body = PS.body_of(char); ch = PS.CHARS[char]
    pz = dict(ch['poses'][pose_name])
    return R.fk(body, pz, ch['facing']), body


def extract(char, grid_png, cells, pose):
    """从网格生成图里取出 pose 那一格，按白模剪影配准（缩放 + 平移搜索，最大化 IoU）。"""
    c = next(c for c in cells if c['pose'] == pose)
    im = load_rgb(grid_png)
    gw, gh = im.size
    kx, ky = gw / c.get('gw', 1536), gh / c.get('gh', 1024)       # 生成图可能与输入尺寸不同（如 low 质量返回 1254²）
    box = (int(c['x'] * kx), int(c['y'] * ky), int((c['x'] + c['w']) * kx), int((c['y'] + c['h']) * ky))
    rgb = np.array(im.crop(box))
    S = c['S'] * ky
    sx = c.get('sx', 0)
    cwA, chA = c['w'] / c['S'], c['h'] / c['S']          # 格子大小（美术像素）
    fg = cut_bg(rgb)
    fr, body = man_frame(char, pose)
    scmax = PS.CHARS[char].get('sc_max', SC_MAX)
    man = M.silhouette(fr, body, cwA, chA, S=SUB, sx=sx)
    g = np.array(Image.fromarray((fg * 255).astype(np.uint8)).resize((man.shape[1], man.shape[0]), Image.BOX)) > 127
    ys, xs = np.nonzero(g)
    if len(ys) < 50: return None
    ox, oy = (cwA / 2 + sx) * SUB, (chA - M.FOOT_PAD) * SUB
    best = (-1, 1, 0, 0)
    for sc in np.arange(.82, scmax, .03):               # 以地面上的骨盆点为中心缩放
        gs = np.zeros_like(man)
        yy = np.round((ys - oy) / sc + oy).astype(int); xx = np.round((xs - ox) / sc + ox).astype(int)
        ok = (yy >= 0) & (yy < man.shape[0]) & (xx >= 0) & (xx < man.shape[1])
        gs[yy[ok], xx[ok]] = True
        gs = ndi.binary_closing(gs, iterations=1)
        for dy in range(-6 * SUB, 6 * SUB + 1):
            sh = np.roll(gs, dy, 0)
            for dx in range(-8 * SUB, 8 * SUB + 1):
                s2 = np.roll(sh, dx, 1)
                iou = (s2 & man).sum() / max((s2 | man).sum(), 1)
                if iou > best[0]: best = (iou, sc, dx, dy)
    iou, sc, dx, dy = best
    air = PS.CHARS[char]['poses'][pose].get('air')
    lift = (2 if air is True else int(round(air))) if air else 0          # 腾空帧：贴地后上提（质检与组表一致）
    return dict(rgb=rgb, fg=fg, S=S, sc=sc, dx=dx / SUB, dy=dy / SUB, iou=float(iou), cw=cwA, ch=chA, sx=sx, fr=fr, body=body,
                can_w=can_w(char), lift=lift)


def to_art(e, snap=True):
    """配准结果 → 美术像素 RGBA 规范帧（CAN_W × ch，骨盆 x=0 在 CAN_W/2，地面行 = ch-FOOT_PAD）"""
    rgb, fg, S, sc = e['rgb'], e['fg'], e['S'], e['sc']
    k = 1 / (S * sc)                                     # 高清像素 → 美术像素
    H, W = fg.shape
    nw, nh = max(1, round(W * k)), max(1, round(H * k))
    a = fg.astype(float)
    pm = Image.fromarray(np.clip(rgb * a[..., None], 0, 255).astype(np.uint8)).resize((nw, nh), Image.BOX)
    am = Image.fromarray((a * 255).astype(np.uint8)).resize((nw, nh), Image.BOX)
    A = np.array(am).astype(float) / 255
    C = np.array(pm).astype(float) / np.maximum(A[..., None], 1e-3)
    small = np.zeros((nh, nw, 4), np.uint8)
    small[..., :3] = np.clip(C, 0, 255); small[..., 3] = (A > .5) * 255
    ch = int(round(e['ch']))
    CW_ = e.get('can_w', CAN_W)
    oy = e['ch'] - M.FOOT_PAD
    Px, Py = (e['cw'] / 2 + e['sx']) * S, oy * S      # 缩放中心（高清格坐标）
    offx = int(round(CW_ / 2 - Px * k + e['dx'])); offy = int(round(oy - Py * k + e['dy']))
    if snap:
        ys = np.nonzero(small[..., 3])[0]
        if len(ys): offy = int(round(oy)) - 1 - ys.max() - e.get('lift', 0)   # 脚底贴地（腾空帧上提 lift）
    out = np.zeros((ch, CW_, 4), np.uint8)
    y0, x0 = max(0, offy), max(0, offx)
    y1, x1 = min(ch, offy + nh), min(CW_, offx + nw)
    if y1 > y0 and x1 > x0:
        out[y0:y1, x0:x1] = small[y0 - offy:y1 - offy, x0 - offx:x1 - offx]
    return out


def metrics(char, e, art):
    """质检指标：白模剪影 vs 生成剪影（规范帧美术像素网格）；关键关节到生成剪影的距离"""
    ch_ = art.shape[0]
    CW_ = art.shape[1]
    man = M.silhouette(e['fr'], e['body'], CW_, e['ch'], S=1)[:ch_, :CW_]
    g = art[..., 3] > 0
    inter, uni = (g & man).sum(), (g | man).sum()
    cover = inter / max(man.sum(), 1)
    spill = (g & ~ndi.binary_dilation(man, iterations=3)).sum() / max(g.sum(), 1)
    dist = ndi.distance_transform_edt(~g)
    J = M.joints_px(e['fr'], CW_, e['ch'])
    jerr = {}
    for k in PS.CHARS[char].get('qa_joints', ('head', 'handN', 'handF', 'toeN', 'toeF', 'wtip')):
        if k not in J: continue
        x, y = J[k]
        xi, yi = int(np.clip(round(x), 0, CW_ - 1)), int(np.clip(round(y), 0, ch_ - 1))
        jerr[k] = round(float(dist[yi, xi]), 2)
    return dict(iou=round(float(inter / max(uni, 1)), 3), cover=round(float(cover), 3), spill=round(float(spill), 3),
                reg_iou=round(e['iou'], 3), scale=round(float(e['sc']), 3), joints=jerr)


# ───────── 组表 ─────────

def derive(img, op, v):
    if op == 'bob':
        return bs.bob(img, v, int(np.nonzero(img[..., 3])[0].min() + (img.shape[0] - np.nonzero(img[..., 3])[0].min()) * .5))
    if op == 'lean':
        return bs.shear(img, -v if True else v)
    if op == 'air':
        return bs.lift(img, v)
    return img


def build(char, pipe=None):
    qa = json.load(open(f'raw_anim/{char}/qa.json'))
    chd = PS.CHARS[char]
    arts = {}
    frames_hi = {}
    for pose, rec in qa['pick'].items():
        cells = json.load(open(rec['cells']))
        e = extract(char, rec['file'], cells, pose)
        arts[pose] = to_art(e)
        frames_hi[pose] = e
    # 共用调色板
    names = list(arts)
    P = [despeckle(arts[n]) for n in names]
    g = .95
    for p in P: p[..., :3] = (255 * (p[..., :3] / 255.) ** g).astype(np.uint8)
    P = quantize(P, qa.get('colors', chd.get('colors', 32)))
    P = [bs.outline(p) for p in P]
    arts = dict(zip(names, P))
    # 帧序列
    seq, labels, anim = [], [], {}
    idx = {}
    for an, a in PS.actions_of(char).items():
        fl = []
        for f in a['frames']:
            key = f if isinstance(f, str) else tuple(f)
            if key not in idx:
                if isinstance(f, str):
                    img = arts[f]
                else:
                    op, n, v = f
                    img = derive(arts[n], op, v)
                idx[key] = len(seq); seq.append(img); labels.append(f if isinstance(f, str) else f'{f[1]}:{f[0]}{f[2]}')
            fl.append(idx[key])
        ent = dict(f=[fl[i] for i in a['seq']] if 'seq' in a else fl, ms=a['ms'])
        if isinstance(a['ms'], list) and 'seq' not in a and len(a['ms']) != len(fl): ent['ms'] = a['ms'][:len(fl)]
        if a.get('loop'): ent['loop'] = True
        if 'hit' in a: ent['hit'] = a['hit']
        anim[an] = ent
    # 单元：所有帧同一白模坐标，骨盆 x=0 居中；裁掉公共空白
    H0, W0 = seq[0].shape[:2]
    allm = np.zeros((H0, W0), bool)
    for f in seq: allm |= f[..., 3] > 0
    ys, xs = np.nonzero(allm)
    cx = W0 / 2
    half = int(np.ceil(max(cx - xs.min(), xs.max() + 1 - cx)))
    x0, x1 = int(round(cx - half)), int(round(cx + half))
    y0 = max(0, ys.min() - 1); y1 = int(H0 - M.FOOT_PAD)              # 底边 = 地面线（脚底像素在其上一行）
    cells = []
    for f in seq:
        pad = np.zeros((H0, W0 + 2 * half, 4), np.uint8); pad[:, half:half + W0] = f
        cells.append(pad[y0:y1, x0 + half:x1 + half].copy())
    RV = review_dir(char)
    os.makedirs(RV, exist_ok=True)
    size, cell = bs.save_sheet(cells, f'assets/b_{char}.webp')
    bs.preview(cells, labels, f'{RV}/b_{char}.png')
    body = PS.CHARS[char]['body']['H']
    info = dict(file='b_' + char, cell=list(cell), cols=len(cells), px=[cells[0].shape[1], cells[0].shape[0]], body=body,
                h=cell[1], tier=chd.get('tier', 'party'), facing=chd.get('facing', 'l'), anim=anim, frames=labels)
    jd = 'raw_battle/E' if char in PARTY_E else 'raw_battle/I'
    jp = f'{jd}/sheets.json'
    os.makedirs(jd, exist_ok=True)
    js = json.load(open(jp)) if os.path.exists(jp) else {}
    js[char] = info
    json.dump(js, open(jp, 'w'), ensure_ascii=False, indent=1)
    print(char, size, {k: v for k, v in info.items() if k not in ('anim', 'frames')})
    return arts, frames_hi


def pipe_sheet(char, grid, out):
    """白模 / 生成 / 像素化 并排对比（某一网格的所有姿势）"""
    qa = json.load(open(f'raw_anim/{char}/qa.json'))
    from genframes import grids
    rows = []
    G = grids(char)
    plist = [p_ for g_ in G.values() for p_ in g_['poses']] if grid == 'all' else G[grid]['poses']
    Z = 4 if grid != 'all' else 3
    for pose in plist:
        rec = qa['pick'].get(pose)
        if not rec: continue
        cells = json.load(open(rec['cells']))
        e = extract(char, rec['file'], cells, pose)
        art = to_art(e)
        cw, ch = art.shape[1], art.shape[0]
        man = M.render(e['fr'], e['body'], Z, e['can_w'], e['ch'], bg=(255, 255, 255)).convert('RGBA')
        c = next(c for c in cells if c['pose'] == pose)
        gen = load_rgb(rec['file'])
        k = gen.size[1] / c.get('gh', 1024)
        gen = gen.crop((int(c['x'] * k), int(c['y'] * k), int((c['x'] + c['w']) * k), int((c['y'] + c['h']) * k)))
        gen = gen.resize((round(gen.width * man.height / gen.height), man.height))
        gen2 = Image.new('RGB', man.size, (255, 0, 255)); gen2.paste(gen, ((man.width - gen.width) // 2, 0)); gen = gen2
        px = Image.fromarray(bs.outline(art)).resize((cw * Z, ch * Z), Image.NEAREST)
        ov = man.copy(); ov.alpha_composite(Image.fromarray(np.where((art[..., 3:] > 0), [255, 60, 60, 110], [0, 0, 0, 0]).astype(np.uint8)).resize((cw * Z, ch * Z), Image.NEAREST))
        rows.append((pose, [man, gen.convert('RGBA'), px, ov], rec.get('m', {})))
    if not rows: return
    w, h = rows[0][1][0].size
    im = Image.new('RGBA', (4 * (w + 6) + 6, len(rows) * (h + 22) + 6), (40, 38, 48, 255))
    d = ImageDraw.Draw(im)
    for i, (pose, ims, m) in enumerate(rows):
        for j, t in enumerate(ims):
            bg = Image.new('RGBA', t.size, (255, 255, 255, 255) if j != 2 else (26, 24, 34, 255)); bg.alpha_composite(t)
            im.paste(bg, (6 + j * (w + 6), 6 + i * (h + 22)))
        d.text((8, 6 + i * (h + 22) + h + 4), f"{pose}  mannequin | generated | pixel 1x | overlay   iou {m.get('iou')} cover {m.get('cover')} spill {m.get('spill')} joints {m.get('joints')}", fill=(230, 220, 200))
    im.save(out)
    print(out, im.size)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('char')
    ap.add_argument('--pipe')
    ap.add_argument('--no-build', action='store_true')
    a = ap.parse_args()
    if not a.no_build: build(a.char)
    if a.pipe:
        pipe_sheet(a.char, a.pipe, f'{review_dir(a.char)}/pipe_{a.char}' + ('' if a.pipe == 'all' else f'_{a.pipe}') + '.png')
