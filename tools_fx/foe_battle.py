"""敌人（及大黄）战斗动作表（工作流 D）
输入：raw_battle/D/{char}.png —— gen_battle_sprites.py 生成的 3×2 动作设定图（6 姿势、侧身朝右、白底）
处理：白底洪泛去背 → 按连通块切出 6 个姿势 → 以姿势 1 为基准统一缩放到目标像素尺寸（BOX 降采样 + 硬 alpha）
      → 全角色共用调色板限色 → 1px 外描边（原图光向即左上）→ 逐像素变形补帧 → 脚底对齐组表 ×3
输出：assets/b_{char}.webp（1 行 N 帧），预览 review/battle_v3/E/b_{char}.png，
      并把各表的 cell/cols/h 写入 raw_battle/D/sheets.json（供 js/bart.js 手工核对）
帧（统一 14 帧）：
  0-3 待机（0 原姿 1 上身下沉 1px 2 下沉 2px 3 后仰 1px；循环 0 1 2 1 0 3）
  4 冲刺（前倾）  5 出招-蓄  6 出招-击  7 出招-送（击再前倾）  8 出招-收（原姿略前倾）
  9 受击  10 运功/蓄势（=蓄势姿态上提 1px）  11-12 破防瘫倒（喘息两帧）  13 倒地
用法（仓库根目录）：python3 tools_fx/foe_battle.py [char…]
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bsprite as bs

# size：目标像素尺寸（1 倍像素）；measure h=站姿高度，max=站姿包围盒长边（四足/蛇/禽）
# v3：我方主角身高 64 美术像素（写实 6 头身）；杂兵约与主角同高（山贼扎马步 ~60），精英略高，头目 ~1.7×；全员整数 3× 显示
SPEC = {
    'bandit':  dict(size=62, measure='h', tier='minion', colors=28),
    'wolf':    dict(size=54, measure='max', tier='minion', colors=24, wind='crouch', hurt='recoil', strike_lift=5),   # 原图 2/4 号姿势站立成人形，改用变形
    'monk':    dict(size=56, measure='h', tier='minion', colors=24),
    'snake':   dict(size=76, measure='max', tier='elite', colors=28),
    'beggar':  dict(size=64, measure='h', tier='elite', colors=28),
    'rooster': dict(size=62, measure='max', tier='elite', colors=28, strike_lift=4),
    'chief':   dict(size=112, measure='h', tier='boss', colors=36),
    'dog':     dict(size=42, measure='max', tier='party', colors=20, mirror=True, hurt='recoil'),   # 原图 4 号为人立，改用后仰变形
}
RAW = 'raw_battle/D'


def load_poses(path, n=6):
    rgb = np.array(Image.open(path).convert('RGB')).astype(int)
    H, W = rgb.shape[:2]
    white = (rgb.min(-1) > 232) & (rgb.max(-1) - rgb.min(-1) < 22)
    lab, _ = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # 被身体围住的纯白空隙（臂弯、胯下）：面积足够大的白色连通块也算背景
    wsz = ndi.sum(white, lab, range(1, lab.max() + 1))
    bg |= np.isin(lab, [i + 1 for i, s in enumerate(wsz) if s >= 40]) & (rgb.min(-1) > 244)
    fg = ~bg
    # 去掉小噪点
    l2, k2 = ndi.label(fg)
    sz = ndi.sum(fg, l2, range(1, k2 + 1))
    fg = np.isin(l2, [i + 1 for i, s in enumerate(sz) if s >= 150])
    # 把同一姿势里分离的碎块（武器、尾巴、飞羽）合并：膨胀后分组
    # 膨胀量从大到小尝试，直到恰好分出 n 个"大块"（姿势间距小的图用小膨胀量）
    for it in (14, 10, 7, 4, 2, 1):
        grp, k = ndi.label(ndi.binary_dilation(fg, iterations=it))
        areas = ndi.sum(fg, grp, range(1, k + 1))
        big = (areas >= areas.max() * .12).sum()
        if big >= n: break
    keep = [i + 1 for i in np.argsort(-areas)[:n]]
    # 小碎块（飞羽、汗滴）并入最近的姿势
    if k > n:
        cen = {g: np.array(ndi.center_of_mass(fg, grp, g)) for g in keep}
        for g in range(1, k + 1):
            if g in keep or areas[g - 1] < 30: continue
            c = np.array(ndi.center_of_mass(fg, grp, g))
            tgt = min(keep, key=lambda q: np.linalg.norm(cen[q] - c))
            if np.linalg.norm(cen[tgt] - c) < 260: grp[grp == g] = tgt
    poses = []
    for g in keep:
        m = fg & (grp == g)
        m = ndi.binary_erosion(m, iterations=2)          # 去掉白底抗锯齿留下的浅色毛边
        ys, xs = np.nonzero(m)
        poses.append((ys.mean(), xs.mean(), m, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)))
    # 按网格阅读顺序：先按行（中心 y 在上半/下半），再按 x
    poses.sort(key=lambda p: (p[0] > H / 2, p[1]))
    out = []
    for cy, cx, m, (x0, y0, x1, y1) in poses:
        a = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
        a[..., :3] = rgb[y0:y1, x0:x1]
        a[..., 3] = m[y0:y1, x0:x1] * 255
        out.append(a)
    if len(out) < n: print('  !! 只切出', len(out), '个姿势')
    return out


def downscale(a, s):
    h, w = a.shape[:2]
    nw, nh = max(1, int(round(w * s))), max(1, int(round(h * s)))
    al = a[..., 3:].astype(float) / 255
    pm = Image.fromarray(np.clip(a[..., :3] * al, 0, 255).astype(np.uint8)).resize((nw, nh), Image.BOX)
    am = Image.fromarray(a[..., 3]).resize((nw, nh), Image.BOX)
    A = np.array(am).astype(float) / 255
    C = np.array(pm).astype(float) / np.maximum(A[..., None], 1e-3)
    out = np.zeros((nh, nw, 4), np.uint8)
    out[..., :3] = np.clip(C, 0, 255)
    out[..., 3] = (A > .5) * 255
    return out


def quantize(frames, n):
    """所有姿势共用一个调色板（kmeans 细化的中位切分）"""
    px = np.concatenate([f[f[..., 3] > 0][:, :3] for f in frames])
    strip = Image.fromarray(px[None].astype(np.uint8))
    q = strip.quantize(colors=n, method=Image.Quantize.MEDIANCUT, kmeans=3)
    pal = np.array(q.getpalette()[:n * 3]).reshape(-1, 3)
    out = []
    for f in frames:
        g = f.copy()
        m = g[..., 3] > 0
        c = g[m][:, :3].astype(int)
        idx = ((c[:, None, :] - pal[None]) ** 2).sum(-1).argmin(1)
        g[m, :3] = pal[idx]
        out.append(g)
    return out


def despeckle(f):
    """去掉孤立的单像素突起（alpha 上 8 邻域仅 ≤1 个不透明）"""
    a = f[..., 3] > 0
    nb = ndi.convolve(a.astype(int), np.ones((3, 3), int), mode='constant') - a
    f = f.copy()
    f[a & (nb <= 1)] = 0
    return f


def build(char):
    sp = SPEC[char]
    src = os.path.join(RAW, char + '.png')
    P = load_poses(src)
    if sp.get('mirror'): P = [p[:, ::-1].copy() for p in P]
    h0, w0 = P[0].shape[:2]
    s = sp['size'] / (h0 if sp['measure'] == 'h' else max(h0, w0))
    P = [despeckle(downscale(p, s)) for p in P]
    g = sp.get('gamma', .9)                             # 轻微提亮暗部，与我方明亮版精灵的明度对齐
    for p in P: p[..., :3] = (255 * (p[..., :3] / 255.) ** g).astype(np.uint8)
    P = quantize(P, sp['colors'])
    P = [bs.outline(bs.crop(np.pad(p, ((2, 2), (2, 2), (0, 0))))) for p in P]   # 原图已按左上光向绘制；不叠边缘提亮（会出亮点噪边）
    stand, wind, strike, hurt, brk, dead = (P + [P[-1]] * 6)[:6]
    fwd = 1 if not sp.get('mirror') else -1              # 朝向：敌人向右为前
    H0 = stand.shape[0]
    if sp.get('wind') == 'crouch':                       # 伏低蓄力：腿部压缩 + 后坐
        c = bs.squash_rows(stand, int(H0 * .6), H0, max(3, int(H0 * .25)))
        wind = bs.crop(bs.shear(np.pad(c, ((0, 0), (6, 6), (0, 0))), -3 * fwd))
    if sp.get('hurt') == 'recoil':                       # 受击：整体后仰
        hurt = bs.crop(bs.shear(np.pad(stand, ((0, 0), (8, 8), (0, 0))), -max(3, H0 // 10) * fwd))

    waist = int(H0 * .55)
    k = max(2, H0 // 14)
    b1, b2 = (1, 2) if H0 > 60 else (1, 1)
    sh = lambda img, kk: bs.shear(np.pad(img, ((0, 0), (8, 8), (0, 0))), kk * fwd)
    bobp = lambda img, d: bs.bob(img, d, int(img.shape[0] * .55))
    raw = [
        (stand, 'idle0'), (bobp(stand, b1), 'idle1'), (bobp(stand, b2), 'idle2'), (sh(stand, -1), 'idle3'),
        (sh(stand, k), 'dash'), (wind, 'atk-wind'), (strike, 'atk-strike'), (sh(strike, max(2, k // 2)), 'atk-follow'),
        (sh(stand, 1), 'atk-back'), (hurt, 'hurt'), (bs.lift(np.pad(wind, ((1, 0), (0, 0), (0, 0))), 1), 'cast'),
        (brk, 'brk0'), (bobp(brk, 1), 'brk1'), (dead, 'dead'),
    ]
    frames = [bs.crop(f) for f, _ in raw]
    labels = [l for _, l in raw]
    anchors = []
    for i, f in enumerate(frames):
        anchors.append(f.shape[1] / 2 if labels[i] == 'dead' else bs.anchor_x(f))
    # 待机/冲刺/收势 与原姿同锚点，避免帧间抖动：以 stand 的锚点相对包围盒为准
    ext = max(max(a, f.shape[1] - a) for f, a in zip(frames, anchors))
    W = int(np.ceil(ext)) * 2 + 2
    lifts = [sp.get('strike_lift', 0) if l in ('atk-strike', 'atk-follow') else 0 for l in labels]   # 腾空扑击离地
    H = max(f.shape[0] + lf for f, lf in zip(frames, lifts)) + 1
    cells = [bs.place(f, W, H, ax=a, lift=lf) for f, a, lf in zip(frames, anchors, lifts)]
    size, cell = bs.save_sheet(cells, f'assets/b_{char}.webp')
    bs.preview(cells, labels, f'review/battle_v3/E/b_{char}.png')
    info = dict(file='b_' + char, cell=list(cell), cols=len(cells), px=[W, H], body=int(stand.shape[0] - 2),
                h=H * bs.PX, tier=sp['tier'], facing='l' if sp.get('mirror') else 'r')
    jp = 'raw_battle/E/foe_sheets.json'                  # v3：输出记录归工作流 E（raw_battle/D 只读）
    js = json.load(open(jp)) if os.path.exists(jp) else {}
    js[char] = info
    json.dump(js, open(jp, 'w'), ensure_ascii=False, indent=1)
    print(char, size, info)


if __name__ == '__main__':
    for c in sys.argv[1:] or [c for c in SPEC if os.path.exists(os.path.join(RAW, c + '.png'))]:
        build(c)
