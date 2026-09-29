"""非人形骨骼（工作流 I，docs/anim-pipeline.md §2.2）：四足（狼/犬）、禽（斗鸡）、蛇（样条链）

与人形同一套约定：美术像素、y 向下、地面 y=0、按"朝右"书写，facing='l' 时整体镜像 x。
fk(body, pose, facing) 返回 dict(kind, joints, shapes, mirror)：
  shapes = [(类型, 数据…, 层)]，按绘制顺序；类型 cap(a,b,w) 胶囊 / poly(pts) 多边形 / circ(c,r) 圆 / eye(c,r) 眼点
  层 F 远侧（深灰 #808080）/ T 躯干（中灰 #b0b0b0）/ N 近侧（浅灰 #d8d8d8）
draw(...) 与 mannequin.draw 同签名（mannequin 按 fr['kind'] 转交），silhouette / joints_px / bbox_art 直接复用。

角度：0 = 朝前（画面右），90 = 向下，-90 = 向上（屏幕坐标，顺时针为正）。

四足 Quad（狼/犬） 姿势参数：
  dx, dy        髋关节平移（dy>0 下沉）          pitch   躯干俯仰（>0 前高后低）
  neck          颈相对躯干前向的角（-40 = 向前上）  head    头相对颈的角（>0 低头）   jaw  张口角
  tail=[t1,t2,t3]  尾巴逐节相对角（t1 相对"正后方"，>0 上翘）
  fN/fF=[a,b,c] 前腿：上臂 90-a（a>0 前摆），前臂 +b（>0 向后折），掌 +c
  hN/hF=[a,b,c] 后腿：大腿 90-a，小腿 +b（>0 向后），跖 -c（>0 向前立），掌水平朝前
  air           腾空高度（不贴地）
禽 Bird（斗鸡）：pitch、neck=[n1,n2]（颈两节绝对角偏移，相对竖直向上 -90）、head（头朝向）、beak（张喙）、
  wingN/wingF=[角, 张开 0–1]（角 0 = 贴身朝后，>0 向上扬）、tail（尾羽整体上扬角）、lN/lF=[髋, 膝]（胫 90-髋，跗 +膝）、air
蛇 Snake：pts=[[x,y,z]…] 尾→颈的控制点（Catmull-Rom 样条；z=1 表示该段在盘圈远侧，画深灰）、head（头相对末端切线的角）、jaw
"""
import math

C_FAR, C_TORSO, C_NEAR = (128, 128, 128), (176, 176, 176), (216, 216, 216)
C_JOINT = (96, 96, 96)
LAYER_COL = {'F': C_FAR, 'T': C_TORSO, 'N': C_NEAR}


def _pt(p, ang, L):
    a = math.radians(ang)
    return (p[0] + L * math.cos(a), p[1] + L * math.sin(a))


def _ang(a, b):
    return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))


def _ellipse(c, rx, ry, ang, n=24):
    a = math.radians(ang); ca, sa = math.cos(a), math.sin(a)
    out = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x, y = rx * math.cos(t), ry * math.sin(t)
        out.append((c[0] + x * ca - y * sa, c[1] + x * sa + y * ca))
    return out


# ═════════ 骨骼尺寸 ═════════

class Quad:
    kind = 'quad'

    def __init__(self, H=34, s=1.0, tail='hang', ears=1.0, snout=1.0, **_):
        self.H, self.s, self.tailkind = H, s, tail
        self.u = 6 * s                       # 供描边/关节点尺寸
        k = s
        self.L = dict(trunk=21 * k, fu=9 * k, fl=9 * k, fp=3.6 * k, ht=9.5 * k, hs=9 * k, hm=7 * k, hp=3.6 * k,
                      neck=7 * k, skull=5 * k, snout=7.5 * k * snout, ear=4.8 * k * ears, tail=[6.5 * k, 6 * k, 5.5 * k])
        self.W = dict(chest=16 * k, belly=11 * k, hips=12.5 * k, fu=5.6 * k, fl=3.2 * k, fp=3 * k, ht=7.5 * k, hs=3.6 * k,
                      hm=2.8 * k, hp=3 * k, neck=9 * k, snout=6.4 * k, tail=[6 * k, 5.2 * k, 3.4 * k])
        self.hip_h = 20 * k


class Bird:
    kind = 'bird'

    def __init__(self, H=50, s=1.0, **_):
        self.H, self.s = H, s
        self.u = 6 * s
        k = s
        self.L = dict(bx=12.5 * k, by=10 * k, neck=[5.5 * k, 5.5 * k], head=3.7 * k, beak=4 * k, thigh=7 * k, shank=10 * k,
                      toe=4.2 * k, wing=15 * k, tail=21 * k)
        self.W = dict(neck=[8.5 * k, 6.5 * k], thigh=6 * k, shank=2 * k, toe=1.3 * k, wing=8 * k, tail=3 * k)
        self.hip_h = 16 * k


class Snake:
    kind = 'snake'

    def __init__(self, H=71, s=1.0, thick=7.0, **_):
        self.H, self.s, self.thick = H, s, thick * s
        self.u = 6 * s
        self.L = dict(head=9 * s, headw=6.4 * s)


BODIES = dict(quad=Quad, bird=Bird, snake=Snake)


# ═════════ 正向运动学 ═════════

def fk_quad(b, p):
    L, W = b.L, b.W
    pitch = p.get('pitch', 0.0)
    fwd = -pitch
    Hp = (-L['trunk'] / 2 + p.get('dx', 0.0), -b.hip_h + p.get('dy', 0.0))
    Sh = _pt(Hp, fwd, L['trunk'])
    J = dict(hip=Hp, shoulder=Sh)
    sh = []
    legs = {}
    for side in ('F', 'N'):
        a, bb, c = p.get('f' + side, [0, 0, 0])
        u1 = 90 - a; E = _pt(Sh, u1, L['fu']); u2 = u1 + bb; Wr = _pt(E, u2, L['fl'])
        u3 = u2 - 90 + c; Pw = _pt(Wr, u3, L['fp'])
        a, bb, c = p.get('h' + side, [30, 70, 60])
        t1 = 90 - a; K = _pt(Hp, t1, L['ht']); t2 = t1 + bb; Hk = _pt(K, t2, L['hs'])
        t3 = t2 - c; Mt = _pt(Hk, t3, L['hm']); t4 = t3 - 90 + p.get('hpaw' + side, 0); Hw = _pt(Mt, t4, L['hp'])
        J['pawF' + side], J['pawH' + side] = Pw, Hw
        J['wristF' + side], J['hock' + side] = Wr, Hk
        legs[side] = [('cap', Sh, E, W['fu']), ('cap', E, Wr, W['fl']), ('cap', Wr, Pw, W['fp']),
                      ('cap', Hp, K, W['ht']), ('cap', K, Hk, W['hs']), ('cap', Hk, Mt, W['hm']), ('cap', Mt, Hw, W['hp'])]
    # 尾
    ta = 180 + fwd
    tp = _pt(Hp, 180 + fwd, 2 * b.s)
    tails = []
    for i, (tl, tw) in enumerate(zip(L['tail'], W['tail'])):
        ta += p.get('tail', [-30, -10, -5])[i]
        nx = _pt(tp, ta, tl); tails.append(('cap', tp, nx, tw)); tp = nx
    J['tail'] = tp
    # 颈、头
    n0 = _pt(Sh, fwd - 70, 3 * b.s)
    na = fwd + p.get('neck', -35)
    Hb = _pt(n0, na, L['neck'])
    ha = na + p.get('head', 35)
    C = _pt(Hb, ha, 1.5 * b.s)
    up = ha - 90
    nose = _pt(_pt(C, ha, 1.5 * b.s), ha + 6, L['snout'])
    J['neck'], J['head'], J['nose'] = Hb, C, nose
    jaw = p.get('jaw', 0)
    sn0 = _pt(C, ha, 1.2 * b.s)
    head = [('circ', C, L['skull'])]
    top = _pt(C, ha + 10, 1.0)
    head.append(('poly', [_pt(sn0, up, W['snout'] * .55), _pt(nose, up, .9 * b.s), _pt(nose, up + 180, .6 * b.s),
                          _pt(sn0, up + 180, W['snout'] * .15)]))
    if jaw:
        jt = _pt(sn0, ha + 6 + jaw, L['snout'] * .92)
        head.append(('poly', [_pt(sn0, up + 180, W['snout'] * .1), _pt(sn0, up + 180, W['snout'] * .55), jt, _pt(jt, up, .8 * b.s)]))
    else:
        head.append(('poly', [_pt(sn0, up + 180, W['snout'] * .1), _pt(sn0, up + 180, W['snout'] * .5),
                              _pt(nose, up + 180, .8 * b.s), _pt(nose, up, .2)]))
    eb = _pt(C, ha - 150, L['skull'] * .55)
    head.append(('poly', [_pt(eb, ha, -1.8 * b.s), _pt(eb, ha, 1.8 * b.s), _pt(_pt(C, up - 25 + p.get('ear', 0), L['skull'] + L['ear']), 0, 0)]))
    eye = ('eye', _pt(_pt(C, ha, 1.9 * b.s), up, 1.3 * b.s), .75 * b.s)
    # 躯干：胸圆 + 腹 + 臀圆的凸包
    from scipy.spatial import ConvexHull
    import numpy as np
    pts = []
    chest_c = _pt(Sh, fwd - 60, 1.5 * b.s)
    for c, r in ((chest_c, W['chest'] / 2), (_pt(Hp, fwd, L['trunk'] * .5), W['belly'] / 2), (Hp, W['hips'] / 2)):
        pts += _ellipse(c, r, r, 0, 16)
    arr = np.array(pts); hull = ConvexHull(arr)
    torso = [('poly', [tuple(arr[i]) for i in hull.vertices])]
    neck = [('cap', Sh, Hb, W['neck'])]
    shapes = []
    shapes += [s + ('F',) for s in legs['F']]
    if b.tailkind == 'curl': shapes += [s + ('T',) for s in tails]
    shapes += [s + ('T',) for s in torso + neck + head]
    if b.tailkind != 'curl': shapes += [s + ('T',) for s in tails]
    shapes += [s + ('N',) for s in legs['N']]
    shapes.append(eye + ('E',))
    return J, shapes


def fk_bird(b, p):
    L, W = b.L, b.W
    pitch = p.get('pitch', 0.0); fwd = -pitch
    B = (p.get('dx', 0.0), -b.hip_h - L['by'] * .55 + p.get('dy', 0.0))
    body = _ellipse(B, L['bx'], L['by'], fwd, 28)
    J = dict(body=B)
    # 腿：髋在身体下方偏后
    legs = {}
    for side in ('F', 'N'):
        hip = _pt(B, fwd + 100, L['by'] * .55)
        a, k = p.get('l' + side, [10, 30])
        t1 = 90 - a; K = _pt(hip, t1, L['thigh']); t2 = t1 + k; A = _pt(K, t2, L['shank'])
        ta = p.get('toe' + side, 0)
        T1 = _pt(A, ta, L['toe']); T2 = _pt(A, 180 + ta + 15, L['toe'] * .55); Sp = _pt(_pt(A, t2 + 180, L['shank'] * .3), 200 + ta, L['toe'] * .45)
        J['toe' + side], J['ankle' + side] = T1, A
        legs[side] = [('cap', hip, K, W['thigh']), ('cap', K, A, W['shank']), ('cap', A, T1, W['toe']), ('cap', A, T2, W['toe']),
                      ('cap', _pt(A, t2 + 180, L['shank'] * .3), Sp, W['toe'] * .8)]
    # 颈与头
    n0 = _pt(B, fwd - 38, L['bx'] * .72)
    n1a, n2a = p.get('neck', [15, 0])
    N1 = _pt(n0, -90 + fwd * .3 + n1a, L['neck'][0]); N2 = _pt(N1, -90 + fwd * .3 + n1a + n2a, L['neck'][1])
    ha = p.get('head', 0)
    C = _pt(N2, ha - 90, L['head'] * .6)
    J['head'] = C
    bk0 = _pt(C, ha, L['head'] * .8)
    bt = _pt(bk0, ha + 8, L['beak'])
    J['beak'] = bt
    op = p.get('beak', 0)
    head = [('cap', n0, N1, W['neck'][0]), ('cap', N1, N2, W['neck'][1]), ('circ', C, L['head'])]
    head.append(('poly', [_pt(bk0, ha - 90, 1.2 * b.s), bt, _pt(bk0, ha + 90, .3 * b.s)]))
    head.append(('poly', [_pt(bk0, ha + 90, .2 * b.s), _pt(bk0, ha + 8 + max(op, 12), L['beak'] * .85), _pt(bk0, ha + 90, 1.0 * b.s)]))
    # 鸡冠：头顶三个圆齿；肉垂
    for i, (d_, r_) in enumerate(((-15, 1.8), (-50, 2.3), (-90, 2.2), (-125, 1.9), (-155, 1.4))):
        head.append(('circ', _pt(C, ha + d_ - 20, L['head'] * 1.05), r_ * b.s))
    head.append(('circ', _pt(bk0, ha + 105, 2.6 * b.s), 1.9 * b.s))
    eye = ('eye', _pt(C, ha - 40, L['head'] * .45), .7 * b.s)
    # 尾羽：3 根镰刀羽（弧线）
    tails = []
    t0 = _pt(B, 180 + fwd + 30, L['bx'] * .75)
    base = 180 + fwd + 82 + p.get('tail', 0)
    for i, da in enumerate((-26, 0, 22)):
        a = base + da; pp = t0
        for j in range(4):
            a2 = a - 24 * j * (1 if i != 0 else .6)
            nx = _pt(pp, a2 + 180 + 180, L['tail'] / 4 * (1 - .06 * j))
            tails.append(('cap', pp, nx, W['tail'] * (1.4 - .25 * j)))
            pp = nx
        if i == 1: J['tail'] = pp
    # 翅
    wings = {}
    for side in ('F', 'N'):
        wa, wo = p.get('wing' + side, [0, 0])
        s0 = _pt(B, fwd - 70, L['by'] * .45)
        a = 180 + fwd + wa
        tip = _pt(s0, a, L['wing'] * (1 + .15 * wo))
        pts = [s0]
        for j in range(1, 6):
            t = j / 6
            c = _pt(s0, a, L['wing'] * (1 + .15 * wo) * t)
            pts.append(_pt(c, a - 90, W['wing'] * (.5 + .5 * wo) * math.sin(math.pi * t) * 1.0))
        pts.append(tip)
        for j in range(5, 0, -1):
            t = j / 6
            c = _pt(s0, a, L['wing'] * (1 + .15 * wo) * t)
            pts.append(_pt(c, a + 90, W['wing'] * .45 * math.sin(math.pi * t)))
        wings[side] = [('poly', pts)]
        if side == 'N': J['wing'] = tip
    shapes = [s + ('F',) for s in wings['F'] + legs['F']]
    shapes += [s + ('T',) for s in tails + [('poly', body)] + head]
    shapes += [s + ('N',) for s in legs['N'] + wings['N']]
    shapes.append(eye + ('E',))
    return J, shapes


def _catmull(P, n=8):
    out = []
    P = [P[0]] + list(P) + [P[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n; t2, t3 = t * t, t * t * t
            out.append(tuple(.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
                                   (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in range(len(p1))))
    out.append(tuple(P[-2]))
    return out


def coil(cx, cy, rx, ry, a0, a1, dy=0.0, drx=0.0, step=24):
    """盘圈控制点：水平椭圆绕圈（侧视），下半圈近侧 z=0、上半圈远侧 z=1；a0→a1 度，逐步上升 dy、半径变化 drx"""
    out = []
    n = max(2, int(abs(a1 - a0) / step))
    for i in range(n + 1):
        t = i / n; a = math.radians(a0 + (a1 - a0) * t)
        out.append([cx + (rx + drx * t) * math.cos(a), cy + dy * t + ry * math.sin(a), 0 if math.sin(a) > -0.05 else 1])
    return out


def fk_snake(b, p):
    s = b.s
    P = [(q[0] * s, q[1] * s, q[2] if len(q) > 2 else 0) for q in p['pts']]
    pts = _catmull(P, 8)
    # 弧长参数
    acc = [0.0]
    for i in range(1, len(pts)):
        acc.append(acc[-1] + math.dist(pts[i - 1][:2], pts[i][:2]))
    T = acc[-1] or 1
    def w(t):
        if t < .08: return b.thick * (.18 + .5 * t / .08)
        if t < .3: return b.thick * (.68 + .32 * (t - .08) / .22)
        if t < .8: return b.thick
        return b.thick * (1 - .3 * (t - .8) / .2)
    far, near = [], []
    for i in range(1, len(pts)):
        a, c = pts[i - 1], pts[i]
        seg = ('cap', a[:2], c[:2], w(acc[i] / T))
        (far if (a[2] + c[2]) / 2 > .5 else near).append(seg)
    end = pts[-1][:2]; prev = pts[-3][:2] if len(pts) > 2 else pts[0][:2]
    ta = _ang(prev, end) + p.get('head', 0)
    Lh, Wh = b.L['head'], b.L['headw']
    C = _pt(end, ta, Lh * .35)
    jaw = p.get('jaw', 0)
    head = [('poly', _ellipse(_pt(end, ta, Lh * .25), Lh * .55, Wh * .5, ta, 20))]
    snout = _pt(end, ta, Lh * .9)
    up = ta - 90
    if jaw:
        head = [('poly', [_pt(end, up, Wh * .5), _pt(C, up, Wh * .5), _pt(snout, up, Wh * .12), _pt(snout, up + 180, Wh * .05),
                          _pt(C, up + 180, Wh * .05), _pt(end, up + 180, Wh * .3)]),
                ('poly', [_pt(end, up + 180, Wh * .1), _pt(end, up + 180, Wh * .5), _pt(_pt(end, ta + jaw, Lh * .8), up + 180, Wh * .08),
                          _pt(end, ta + jaw * .6, Lh * .3)])]
    J = dict(head=C, snout=snout, tail=pts[0][:2], mid=pts[len(pts) // 2][:2])
    eye = ('eye', _pt(_pt(end, ta, Lh * .45), up, Wh * .22), .7 * s)
    shapes = [x + ('F',) for x in far] + [x + ('T',) for x in near] + [x + ('T',) for x in head] + [eye + ('E',)]
    return J, shapes


FK = dict(quad=fk_quad, bird=fk_bird, snake=fk_snake)


def _xf_shape(sh, f):
    t = sh[0]
    if t == 'cap': return (t, f(sh[1]), f(sh[2]), sh[3], sh[4])
    if t == 'poly': return (t, [f(q) for q in sh[1]], sh[2])
    return (t, f(sh[1]), sh[2], sh[3])       # circ / eye


def _extent_y(sh):
    t = sh[0]
    if t == 'cap': return max(sh[1][1], sh[2][1]) + sh[3] / 2
    if t == 'poly': return max(q[1] for q in sh[1])
    if t == 'eye': return -1e9
    return sh[1][1] + sh[2]


def fk(body, pose, facing='r', ground=True):
    J, shapes = FK[body.kind](body, pose)
    rot = pose.get('lie', 0)
    if rot:
        c = J.get('hip', J.get('body', J.get('head')))
        a = math.radians(-rot)
        R = lambda q: (c[0] + (q[0] - c[0]) * math.cos(a) - (q[1] - c[1]) * math.sin(a),
                       c[1] + (q[0] - c[0]) * math.sin(a) + (q[1] - c[1]) * math.cos(a))
        J = {k: R(v) for k, v in J.items()}; shapes = [_xf_shape(s, R) for s in shapes]
    if ground:
        low = max(_extent_y(s) for s in shapes)
        dy = -low - (pose.get('air') or 0)
        J = {k: (v[0], v[1] + dy) for k, v in J.items()}; shapes = [_xf_shape(s, lambda q: (q[0], q[1] + dy)) for s in shapes]
    out = dict(kind=body.kind, joints=J, shapes=shapes, segs=[], weapon=[], proj=[])
    if facing == 'l':
        M = lambda q: (-q[0], q[1])
        out['joints'] = {k: M(v) for k, v in J.items()}
        out['shapes'] = [_xf_shape(s, M) for s in shapes]
        out['mirror'] = True
    return out


# ═════════ 渲染 ═════════

def draw(fr, body, S, cellW, cellH, mono=None, joints=True, ground=True, sx=0, bg=None):
    from PIL import Image, ImageDraw
    import mannequin as M
    Z = S * M.SS
    bg = bg or M.BG
    im = Image.new('RGBA', (int(cellW * Z), int(cellH * Z)), (0, 0, 0, 0) if mono else tuple(bg) + (255,))
    d = ImageDraw.Draw(im)
    ox, oy = cellW / 2 + sx, cellH - M.FOOT_PAD
    T = lambda p: ((p[0] + ox) * Z, (p[1] + oy) * Z)
    for sh in fr['shapes']:
        t, lay = sh[0], sh[-1]
        if t == 'eye':
            if mono: continue
            c = T(sh[1]); r = sh[2] * Z
            d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=(60, 60, 60)); continue
        col = mono or LAYER_COL[lay]
        if t == 'cap':
            M._cap(d, T(sh[1]), T(sh[2]), sh[3] * Z, col)
        elif t == 'poly':
            d.polygon([T(q) for q in sh[1]], fill=col)
        elif t == 'circ':
            c = T(sh[1]); r = sh[2] * Z
            d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=col)
    if ground and not mono:
        d.line([(0, oy * Z), (cellW * Z, oy * Z)], fill=(90, 90, 90), width=max(1, int(.25 * Z)))
    return im.resize((int(cellW * S), int(cellH * S)), Image.LANCZOS if not mono else Image.BOX)
