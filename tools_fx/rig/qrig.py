"""探索用 Q 版人形骨骼（工作流 K，docs/anim-pipeline.md §6）：3/4 俯视、约 2.5 头身、约 43 美术像素高、4 方向 d/l/r/u。

与战斗用侧身骨骼（rig.py）互不影响：这里骨骼在 **3D** 里摆姿势（一次定义步态），再按方向投影成 2D 白模，
所以正/背面也能表现左右腿交替（前脚在屏幕上更低、后脚更高且缩短）与手臂前后摆。

3D 坐标（美术像素）：X = 角色自身左侧，Y = 向上（地面 Y=0），Z = 角色前方；骨盆地面投影为原点。
投影（DIRS）：屏幕 x = ex·(X,Z)，深度 dep = ed·(X,Z)（越大越靠近镜头），屏幕 y = -Y·CY + TILT·dep
  d 面向镜头：x=+X，dep=+Z；u 背对：x=-X，dep=-Z；r 面向右：x=+Z，dep=-X；l 面向左：x=-Z，dep=+X。
TILT=0.5：3/4 俯视下靠近镜头的地面点在屏幕上更低（正面行走时前脚低、后脚高）。

动作（ACTIONS）：walk 12 帧、run 10 帧、stand 1 帧（idle 由 stand 派生，见 explore.py）。
  walk：单腿支撑相 β=0.56（每半周期 0.06 双支撑），接触-下沉-过渡-腾起（骨盆 -0.4/-1.0/0/+0.7 像素），手臂与对侧腿同相反摆 ±24°；
  run ：支撑相 β=0.36（每半周期 0.14 腾空），支撑中段压低 -1.2、腾空最高 +1.5，前倾 10°，屈肘 80° 大摆臂 ±50°，后踢腿、高抬膝。
脚的轨迹直接给（支撑相贴地匀速后移 → 帧间脚底零滑动），膝盖用两骨 IK 解出（膝朝前）。
"""
import math

TILT, CY = 0.5, 1.0
FOOT_R = 1.25
DIRS = {  # (x 系数 X,Z) (深度系数 X,Z)
    'd': ((1, 0), (0, 1)),
    'u': ((-1, 0), (0, -1)),
    'r': ((0, 1), (-1, 0)),
    'l': ((0, -1), (1, 0)),
}


class QBody:
    """Q 版比例（美术像素）。robe：长袍/裙下摆离地高度（None 无袍）；jacket：外衫下摆（苏芷的褙子）"""

    def __init__(self, hem=6.2, female=False, bun=False, ponytail=False):
        self.female = female
        self.thigh, self.shin, self.ankle = 6.1, 5.9, 1.3
        self.hip0 = 12.6                          # 站姿骨盆（髋关节）高
        self.hipx = 2.3 if not female else 2.0    # 髋关节左右间距（半）
        self.footx = 2.2 if not female else 1.8
        self.waist = 14.2                         # 腰带高
        self.sh_y = 22.6                          # 肩高
        self.shx = 5.6 if not female else 5.0
        self.chest = (5.8 if not female else 5.3, 4.0)   # 胸部半宽、半厚
        self.hips = (4.6 if not female else 4.6, 3.7)
        self.ua, self.fa, self.hand = 4.6, 4.0, 1.55
        self.limb_r = dict(thigh=1.9, shin=1.55, ua=1.35, fa=1.2)
        self.head_c, self.head_r = 32.6, 8.6      # 头心高、头半径（头顶 ≈ 41.2，发髻再高 1–2）
        self.hem = hem                            # 袍摆高
        self.hem_r = (5.0, 3.8) if not female else (5.4, 4.6)
        self.bun, self.ponytail = bun, ponytail


BODIES = {
    'hero': QBody(hem=6.0, ponytail=True),
    'suzhi': QBody(hem=3.0, female=True, bun=True),
}


# ───────── 小工具 ─────────
def _lerp(a, b, t): return a + (b - a) * t


def _smooth_cycle(keys, p):
    """周期关键点 [(相位, 值)...]（相位 0..1 升序，首尾自动闭合）上的余弦插值"""
    p %= 1.0
    ks = list(keys) + [(keys[0][0] + 1, keys[0][1])]
    for (p0, v0), (p1, v1) in zip(ks, ks[1:]):
        if p0 <= p <= p1 or (p < ks[0][0] and p0 == ks[0][0]):
            t = (p - p0) / (p1 - p0) if p1 > p0 else 0
            t = (1 - math.cos(math.pi * t)) / 2
            return _lerp(v0, v1, t)
    return keys[0][1]


def _path(keys, q):
    """非周期路径：keys [(q, (Z, Y))]，q∈[0,1]，Catmull-Rom 插值"""
    q = min(max(q, 0.0), 1.0)
    for i in range(len(keys) - 1):
        if keys[i][0] <= q <= keys[i + 1][0]:
            break
    q0, q1 = keys[i][0], keys[i + 1][0]
    t = (q - q0) / (q1 - q0) if q1 > q0 else 0
    P = [keys[max(0, i - 1)][1], keys[i][1], keys[i + 1][1], keys[min(len(keys) - 1, i + 2)][1]]
    out = []
    for k in range(2):
        p0, p1, p2, p3 = (pp[k] for pp in P)
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return out


def _add(a, b): return (a[0] + b[0], a[1] + b[1], a[2] + b[2])
def _sub(a, b): return (a[0] - b[0], a[1] - b[1], a[2] - b[2])
def _mul(a, k): return (a[0] * k, a[1] * k, a[2] * k)
def _dot(a, b): return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
def _norm(a):
    n = math.sqrt(_dot(a, a)) or 1.0
    return (a[0] / n, a[1] / n, a[2] / n)


def _ik(hip, ank, L1, L2, bend=(0, 0, 1)):
    """两骨 IK：返回 (膝, 实际踝)。够不着时踝沿髋-踝方向收回（脚略离地，<0.5px）"""
    v = _sub(ank, hip)
    d = math.sqrt(_dot(v, v))
    u = _norm(v)
    dmax = L1 + L2 - 1e-3
    if d > dmax:
        ank = _add(hip, _mul(u, dmax)); d = dmax
    a = (L1 * L1 - L2 * L2 + d * d) / (2 * d)
    h = math.sqrt(max(L1 * L1 - a * a, 0))
    n = _sub(bend, _mul(u, _dot(bend, u)))
    n = _norm(n)
    return _add(_add(hip, _mul(u, a)), _mul(n, h)), ank


def _rotY(p, deg, c=(0, 0, 0)):
    a = math.radians(deg)
    x, z = p[0] - c[0], p[2] - c[2]
    return (c[0] + x * math.cos(a) + z * math.sin(a), p[1], c[2] - x * math.sin(a) + z * math.cos(a))


def _rotX(p, deg, c):
    """绕过 c 的横轴旋转（前倾：deg>0 上身向前 +Z）"""
    a = math.radians(deg)
    y, z = p[1] - c[1], p[2] - c[2]
    return (p[0], c[1] + y * math.cos(a) - z * math.sin(a), c[2] + y * math.sin(a) + z * math.cos(a))


# ───────── 动作参数 ─────────
GAITS = {
    'walk': dict(n=12, beta=0.56, A=4.1, lat_sway=.35, lean=3, head=0, twist=6, arm=24, el0=14, el1=16, arm_out=6,
                 bob=[(0, -.4), (.17, -1.0), (.4, 0.0), (.67, .7)],
                 swing=[(0, (-1, 0)), (.3, (-.55, 1.6)), (.6, (.25, 2.3)), (.85, (.85, 1.2)), (1, (1, 0))],
                 heel=(.72, 1.4, 30), strike=12),
    'run': dict(n=10, beta=0.36, A=3.6, lat_sway=.25, lean=10, head=-4, twist=9, arm=50, el0=78, el1=12, arm_out=9,
                bob=[(.0, -.5), (.18, -1.2), (.43, 1.5)],
                swing=[(0, (-1, 0)), (.28, (-1.45, 3.6)), (.55, (-.05, 5.0)), (.8, (1.3, 3.2)), (1, (1, 0.2))],
                heel=(.55, 2.2, 45), strike=8),
}


def gait_pose(body, act, p):
    """动作 act 在相位 p∈[0,1) 的 3D 骨骼：返回 dict(joints={名: (X,Y,Z)}, meta)"""
    if getattr(body, 'kind', '') == 'quad':
        return dog_pose(body, act, p)
    if act == 'stand':
        G = dict(GAITS['walk'], A=0, lat_sway=0, lean=0, twist=0, arm=0, el0=12, el1=0, bob=[(0, 0)], swing=[(0, (0, 0)), (1, (0, 0))])
        p = 0.0
    else:
        G = GAITS[act]
    b = body
    J = {}
    p2 = (2 * p) % 1.0
    bob = _smooth_cycle(G['bob'], p2) if len(G['bob']) > 1 else G['bob'][0][1]
    sway = -G['lat_sway'] * math.sin(2 * math.pi * p)           # 骨盆偏向支撑腿（右腿 p∈[0,.5) 支撑 → 偏右 = -X）
    pel = (sway, b.hip0 + bob, 0.0)
    J['pelvis'] = pel
    twist = G['twist'] * math.cos(2 * math.pi * p)             # 右脚在前时骨盆右侧前转，肩反向
    feet = {}
    for side, s, ph in (('R', -1, p), ('L', 1, (p + .5) % 1.0)):
        hip = _add(pel, _rotY((s * b.hipx, 0, 0), -twist * .6))
        A = G['A']
        if act == 'stand':
            fz, fy, pitch = 0.0, 0.0, 0.0
        elif ph < G['beta']:                                     # 支撑相：脚贴地匀速后移
            q = ph / G['beta']
            fz = A * (1 - 2 * q); fy = 0.0
            h0, hl, hp = G['heel']
            pitch = 0.0
            if q > h0:                                           # 蹬地：脚跟抬起、脚尖向下
                t = (q - h0) / (1 - h0); fy = hl * t * t; pitch = hp * t
            if q < .12: pitch = -G['strike'] * (1 - q / .12)   # 脚跟着地：脚尖上翘
        else:                                                     # 摆动相
            q = (ph - G['beta']) / (1 - G['beta'])
            zz, yy = _path(G['swing'], q)
            fz, fy = zz * A, max(0.0, yy)
            pitch = _lerp(G['heel'][2], -G['strike'], min(1, q * 1.4))
        ank = (s * b.footx, fy + b.ankle, fz)
        knee, ank = _ik(hip, ank, b.thigh, b.shin, bend=(0, 0.25, 1))
        J['hip' + side], J['knee' + side], J['ankle' + side] = hip, knee, ank
        a = math.radians(pitch)                                 # 脚：踝后 0.9、前 2.6，pitch>0 脚尖朝下
        FR = FOOT_R                                              # 脚是半径 FR 的胶囊：中心线高 FR → 脚底贴地
        heel = (ank[0], ank[1] - b.ankle + FR + .9 * math.sin(a), ank[2] - .9 * math.cos(a))
        toe = (ank[0], max(FR, ank[1] - b.ankle + FR - 2.6 * math.sin(a)), ank[2] + 2.6 * math.cos(a))
        J['heel' + side], J['toe' + side] = heel, toe
        feet[side] = (fz, fy)
    # 躯干：前倾 + 扭转（肩与骨盆反向）
    lean = G['lean']
    waist = (pel[0] * .6, b.waist + bob, 0.0)
    sh_c = (pel[0] * .3, b.sh_y + bob, 0.0)
    sh_c = _rotX(sh_c, lean, waist)
    J['waist'], J['chest'] = waist, sh_c
    hc = (sh_c[0], b.head_c + bob, 0.0)
    hc = _rotX(hc, lean + G['head'], waist)
    hc = (hc[0], hc[1], hc[2])
    J['head'] = hc
    for side, s in (('R', -1), ('L', 1)):
        sh = _add(sh_c, _rotY((s * b.shx, -.6, 0), twist))
        J['shoulder' + side] = sh
        # 手臂与对侧腿同相：右臂在左脚在前时向前
        # 左臂在右脚在前（p=0）时向前；滞后约 0.35 rad（手臂跟随）
        ang = (1 if side == 'L' else -1) * G['arm'] * math.cos(2 * math.pi * p - .35) if act != 'stand' else 0
        el = G['el0'] + G['el1'] * max(0.0, ang) / (G['arm'] or 1)
        out = math.radians(G['arm_out'])
        a1 = math.radians(ang + lean * .5)
        d1 = (s * math.sin(out), -math.cos(a1) * math.cos(out), math.sin(a1) * math.cos(out))
        el_ = _add(sh, _mul(d1, b.ua))
        a2 = math.radians(ang + el + lean * .5)
        d2 = (s * math.sin(out) * .6, -math.cos(a2), math.sin(a2))
        wr = _add(el_, _mul(_norm(d2), b.fa))
        J['elbow' + side], J['hand' + side] = el_, wr
    return dict(joints=J, act=act, p=p)


def frames(act):
    n = 1 if act == 'stand' else GAITS[act]['n']
    return [i / n for i in range(n)]


# ───────── 投影 ─────────
def proj(pt, d):
    ex, ed = DIRS[d]
    x = ex[0] * pt[0] + ex[1] * pt[2]
    dep = ed[0] * pt[0] + ed[1] * pt[2]
    return (x, -pt[1] * CY + TILT * dep, dep)


def ground_offset(x3, d):
    return proj(x3, d)


def stance_speed(act):
    """侧视支撑脚每帧后移（美术像素/帧）与一个周期骨盆前进距离（美术像素）"""
    G = GAITS[act]
    per = 2 * G['A'] / (G['beta'] * G['n'])
    return per, per * G['n']


# ───────── 白模渲染 ─────────
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

BG = (255, 0, 255)
C_OUT = (64, 64, 70)
C_TORSO, C_ROBE, C_HEAD, C_HAIR, C_BELT = (176, 176, 176), (198, 198, 198), (226, 226, 226), (92, 92, 96), (120, 120, 124)
C_SWORD = (110, 150, 150)
SS = 4


def _shade(dep_rel):
    t = max(0.0, min(1.0, (dep_rel + 4.5) / 9))
    v = int(round(120 + 105 * t))
    return (v, v, v)


def _ring(c, rx, rz, n=28):
    return [(c[0] + rx * math.cos(2 * math.pi * i / n), c[1], c[2] + rz * math.sin(2 * math.pi * i / n)) for i in range(n)]


def _hull(pts):
    pts = sorted(set((round(x, 3), round(y, 3)) for x, y in pts))
    if len(pts) < 3: return pts
    def cr(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for p in pts:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]


def items(body, pose, d):
    """投影后的绘制图元 [(排序键, 类型, 数据, 颜色[, 部件])]"""
    if getattr(body, 'kind', '') == 'quad':
        return dog_items(body, pose, d)
    J = pose['joints']; b = body
    P = lambda k: proj(J[k], d)
    tor_dep = proj(J['chest'], d)[2]
    out = []
    # 腿（总在躯干/袍子之后画，彼此按深度）
    for s in 'LR':
        dep = (P('knee' + s)[2] + P('ankle' + s)[2]) / 2
        col = _shade(dep - proj(J['pelvis'], d)[2])
        k = -100 + dep
        out += [(k, 'cap', (P('hip' + s), P('knee' + s), b.limb_r['thigh']), col),
                (k + .01, 'cap', (P('knee' + s), P('ankle' + s), b.limb_r['shin']), col),
                ((.15 + dep * .001) if (b.hem is not None and b.hem < 4 and (d in 'lr' or dep - proj(J['pelvis'], d)[2] > -1.2)) else k + .02,
                 'cap', (P('heel' + s), P('toe' + s), FOOT_R), col)]          # 长裙：靠镜头一侧的脚画在裙摆之上
    # 躯干：腰环 + 胸环（前倾/扭转后）凸包
    w, c = J['waist'], J['chest']
    tw = _ring((w[0], w[1] - 1.5, w[2]), *b.hips) + _ring(c, *b.chest)
    out.append((0, 'poly', [proj(p, d)[:2] for p in tw], C_TORSO))
    # 袍摆：腰环 → 下摆环（中心随两膝/两踝，前后径随步幅张开）
    if b.hem is not None:
        ref = 'knee' if b.hem > 4 else 'ankle'
        kl, kr = J[ref + 'L'], J[ref + 'R']
        span = abs(kl[2] - kr[2])
        hc = ((kl[0] + kr[0]) / 2 * .5, b.hem, (kl[2] + kr[2]) / 2)
        rz = max(b.hem_r[1], span / 2 + (1.4 if ref == 'ankle' else .9))
        top = _ring((w[0], w[1], w[2]), b.hips[0] + .3, b.hips[1] + .3)
        bot = _ring(hc, b.hem_r[0], rz)
        out.append((.1, 'poly', [proj(p, d)[:2] for p in top + bot], C_ROBE))
    # 腰带
    belt = _ring((w[0], w[1], w[2]), b.hips[0] + .45, b.hips[1] + .45, 36)
    bp = [proj(p, d) for p in belt]
    front = [q[:2] for q in bp if q[2] >= proj(w, d)[2] - .5]
    out.append((.2, 'belt', front, C_BELT))
    # 背剑（主角）：背后斜挎，剑柄在右肩上方
    if b.ponytail:
        a3 = _add(c, _rotX((-4.2, 3.6, -3.8), 0, (0, 0, 0)))
        b3 = _add(w, (4.6, -4.5, -3.6))
        dep = (proj(a3, d)[2] + proj(b3, d)[2]) / 2 - tor_dep
        out.append((dep if abs(dep) > 1 else -.5, 'cap', (proj(a3, d), proj(b3, d), .95), C_SWORD))
    # 手臂
    for s in 'LR':
        dep = (P('elbow' + s)[2] + P('hand' + s)[2]) / 2 - tor_dep
        col = _shade(dep)
        k = dep + .3
        out += [(k, 'cap', (P('shoulder' + s), P('elbow' + s), b.limb_r['ua']), col),
                (k + .01, 'cap', (P('elbow' + s), P('hand' + s), b.limb_r['fa']), col),
                (k + .02, 'circ', (P('hand' + s), b.hand), col)]
    # 头 + 发型
    h = J['head']
    out.append((50, 'head', (proj(h, d), b.head_r, d), C_HEAD))
    if b.bun:
        bn = _add(h, (0, b.head_r * .72, -b.head_r * .55))
        dep = proj(bn, d)[2] - proj(h, d)[2]
        out.append((50 + (1 if dep > 1 else -1), 'circ', (proj(bn, d), 3.3), C_HAIR))
    if b.ponytail:
        t0 = _add(h, (0, b.head_r * .85, -b.head_r * .35))
        sw = (J['pelvis'][1] - b.hip0) * .6
        t1 = _add(h, (0, b.head_r * .1 - sw, -b.head_r * .95))
        dep = proj(t1, d)[2] - proj(h, d)[2]
        k = 50 + (1 if dep > 1 else -1)
        out.append((k, 'cap', (proj(t0, d), proj(_lerp3(t0, t1, .5), d), 1.9), C_HAIR))
        out.append((k + .01, 'cap', (proj(_lerp3(t0, t1, .5), d), proj(t1, d), 1.3), C_HAIR))
        out.append((k + .02, 'circ', (proj(t0, d), 1.9), (190, 70, 70)))       # 发带（红点，方便模型定位）
    out.sort(key=lambda it: it[0])
    return out


def _lerp3(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)


def draw(body, pose, d, S, cellW, cellH, ox=None, oy=None, mono=None, bg=BG, outline=True, parts=None):
    """在 cellW×cellH（美术像素）单元里画白模；地面原点在 (ox, oy)（默认水平居中、底边上 5）。mono 给定时画单色剪影；
    parts 给定时只画这些部件（四足：body/head/ear/tail/leg，用于待机派生的部件蒙版）"""
    Z = S * SS
    ox = cellW / 2 if ox is None else ox
    oy = cellH - 5 if oy is None else oy
    im = Image.new('RGBA', (int(round(cellW * Z)), int(round(cellH * Z))), (0, 0, 0, 0) if mono or bg is None else tuple(bg) + (255,))
    dr = ImageDraw.Draw(im)
    T = lambda p: ((p[0] + ox) * Z, (p[1] + oy) * Z)
    ow = .45 if (outline and not mono) else 0

    def cap(a, b_, r, col, grow=0):
        r = (r + grow) * Z
        A_, B_ = T(a), T(b_)
        dr.line([A_, B_], fill=col, width=max(1, int(round(2 * r))))
        for q in (A_, B_): dr.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=col)

    def circ(c, r, col, grow=0):
        q = T(c); r = (r + grow) * Z
        dr.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=col)

    for it in items(body, pose, d):
        key, kind, dat, col = it[:4]
        if parts is not None and (len(it) < 5 or it[4] not in parts): continue
        col = mono or col
        for grow, cc in ((ow, C_OUT), (0, col)) if ow else ((0, col),):
            if kind == 'cap': cap(*dat, cc, grow)
            elif kind == 'circ': circ(*dat, cc, grow)
            elif kind == 'poly':
                pts = [T(p) for p in _hull(dat)]
                if grow:
                    dr.polygon(pts, fill=cc)
                    dr.line(pts + [pts[0]], fill=cc, width=int(2 * grow * Z) + 1, joint='curve')
                else:
                    dr.polygon(pts, fill=cc)
            elif kind == 'feat':                       # 四足五官（眼/鼻）：不描边、不进剪影
                if mono or grow: continue
                (fx, fy), rx, ry = dat
                q = T((fx, fy)); dr.ellipse([q[0] - rx * Z, q[1] - ry * Z, q[0] + rx * Z, q[1] + ry * Z], fill=cc)
            elif kind == 'belt':
                if mono or grow or len(dat) < 2: continue
                pts = sorted(dat)
                dr.line([T(p) for p in pts], fill=col, width=max(1, int(1.1 * Z)))
            elif kind == 'head':
                c, r, dd = dat
                circ(c, r, cc, grow)
                if grow or mono: continue
                q = T(c); R = r * Z
                box = [q[0] - R, q[1] - R, q[0] + R, q[1] + R]
                if dd == 'u':
                    dr.ellipse(box, fill=C_HAIR)
                elif dd == 'd':
                    dr.pieslice(box, 180, 360, fill=C_HAIR)
                    dr.rectangle([q[0] - R, q[1] - R * .05, q[0] + R, q[1] + R * .12], fill=C_HAIR)
                    dr.ellipse(box, outline=None)
                    # 下半脸重新画亮，眼睛两点
                    dr.chord(box, 12, 168, fill=col)
                    for sx in (-1, 1):
                        e = (q[0] + sx * R * .36, q[1] + R * .32); er = R * .11
                        dr.ellipse([e[0] - er, e[1] - er * 1.4, e[0] + er, e[1] + er * 1.4], fill=(40, 40, 40))
                else:
                    f = 1 if dd == 'r' else -1          # 面朝方向
                    # 后脑半边与头顶为头发
                    dr.pieslice(box, 90 if f > 0 else -90, 270 if f > 0 else 90, fill=C_HAIR)
                    dr.pieslice(box, 200 if f > 0 else 250, 290 if f > 0 else 340, fill=C_HAIR)
                    e = (q[0] + f * R * .52, q[1] + R * .3); er = R * .11
                    dr.ellipse([e[0] - er, e[1] - er * 1.4, e[0] + er, e[1] + er * 1.4], fill=(40, 40, 40))
                    n0 = (q[0] + f * R * .93, q[1] + R * .25)
                    dr.polygon([n0, (n0[0] + f * R * .2, n0[1] + R * .2), (n0[0], n0[1] + R * .32)], fill=col)
    if S * SS != S:
        im = im.resize((int(round(cellW * S)), int(round(cellH * S))), Image.LANCZOS if not mono else Image.BOX)
    return im


def silhouette(body, pose, d, cellW, cellH, S=1, ox=None, oy=None, parts=None):
    im = draw(body, pose, d, S, cellW, cellH, ox, oy, mono=(255, 255, 255), parts=parts)
    return np.array(im)[..., 3] > 110


def joints_px(body, pose, d, ox, oy):
    """质检关节（美术像素，单元坐标）"""
    J = pose['joints']
    if 'pawFL' in J: return dog_joints_px(pose, d, ox, oy)
    out = {}
    for k, name in (('head', 'head'), ('handL', 'handL'), ('handR', 'handR'), ('toeL', 'toeL'), ('toeR', 'toeR')):
        x, y, dep = proj(J[k], d)
        out[name] = (x + ox, y + oy, dep)
    return out


def bottom_y(pose, d):
    """白模最低点（屏幕 y，地面原点为 0；脚胶囊下缘）——组表时生成帧的最低像素贴到这里（脚底锚点）"""
    J = pose['joints']
    if 'pawFL' in J:
        return max(proj(J[e + k], d)[1] + pose['paw_r'] for k in ('FL', 'FR', 'HL', 'HR') for e in ('heel', 'toe'))
    return max(proj(J[k + s], d)[1] + FOOT_R for k in ('heel', 'toe') for s in 'LR')



# ═════════ Q 版四足（大黄，工作流 K2）═════════
# 同一套 3D 坐标与投影（X = 狗自身左侧，Y 向上，Z = 前方；躯干中心的地面投影为原点）。
# 外观按旧 s_dog 的 Q 版小黄狗：大圆头（头高 ≈ 身高一半）、垂耳、短粗腿、卷尾（向上卷过背、略偏左侧 → 正面看在屏幕右侧露出）。
class QDog:
    kind = 'quad'
    mirror_r = True                   # 左右基本对称：只生成 l，r 由 l 水平镜像（步态相当于左右腿相位互换半周期）

    def __init__(self):
        self.jy = 8.4                          # 肩/髋关节高（站姿）
        self.up, self.lo = 3.6, 3.6            # 腿两节（近乎伸直 = 7.2，踝心离地 paw_r）
        self.paw_r = 1.7
        self.leg_r = (2.3, 2.0)
        self.legx = 4.5                        # 左右腿半间距
        self.fz, self.hz = 5.6, -5.8           # 前/后腿根 Z
        self.body_c = (0.0, 12.8, 0.0); self.body_r = (8.2, 6.4, 10.4)          # 躯干椭球半轴 X,Y,Z
        self.head_c = (0.0, 28.4, 5.6); self.head_r = (10.8, 9.4, 10.0)         # 头：顶 ≈ 37.8（俯视投影后正/侧面都接近正圆）
        self.snout = (0.0, -3.8, 8.6); self.snout_r = (3.9, 2.8, 2.8)
        self.ear_top = (6.6, 4.6, -2.0); self.ear_bot = (10.6, -2.6, -1.8); self.ear_r = 3.0
        self.tail0 = (0.0, 15.4, -9.2)
        self.tail = [(0.6, 20.0, -12.0), (3.6, 22.8, -11.2), (4.8, 19.8, -9.8)]   # 卷尾：向后上 → 向左侧（+X）卷回 → 从背后看是一个圈
        self.tail_r = (2.3, 2.1, 1.7)


BODIES['dog'] = QDog()

# 步态：每条腿 (相位偏移, 前/后)；支撑相 duty 内脚掌贴地匀速后移 ±A，摆动相走样条（z 以 A 为单位，y 以 lift 为单位）
DOG_GAITS = {
    # 快步（对角步 trot，后腿略领先对侧前腿 0.06 → 不是完全同步的"跳格"）：两条对角腿交替支撑，每半周期一次起伏
    'walk': dict(n=12, duty=.58, A=3.1, lift=2.5, off=dict(HL=0.0, FR=.06, HR=.5, FL=.56),
                 bob=[(0, -.25), (.22, -.75), (.62, .55)], pitch=[(0, 0.0)], spine=[(0, 0.0)], sway=.3,
                 head_lag=.1, ear_lag=.22, ear_amp=1.4, tail_amp=24, tail_freq=1, tail_lift=0.0, head_pitch=0.0,
                 swF=[(0, (-1, 0)), (.25, (-1.1, .75)), (.55, (0, 1.0)), (.85, (1.08, .42)), (1, (1, 0))],
                 swH=[(0, (-1, 0)), (.3, (-.75, .8)), (.6, (.3, 1.0)), (.85, (1.02, .38)), (1, (1, 0))]),
    # 跳跃式奔跑（半跳跑 half-bound / 奔袭）：两后腿几乎同时着地蹬出 → 伸展腾空 → 两前腿依次着地 → 收拢腾空（四足收在身下）
    'run': dict(n=10, duty=.30, A=4.4, lift=3.2, off=dict(HL=0.0, HR=.07, FL=.44, FR=.52),
                bob=[(0, -.5), (.2, .3), (.4, 1.6), (.62, -.6), (.8, .5), (.92, 1.2)],
                pitch=[(0, -2), (.24, 7), (.44, 2), (.64, -6), (.85, -1)],
                spine=[(0, -.7), (.36, 1.0), (.46, .9), (.8, -1.0)], sway=0.0,
                head_lag=.08, ear_lag=.15, ear_amp=2.0, tail_amp=10, tail_freq=1, tail_lift=-.35, head_pitch=-4.0,
                swF=[(0, (-1, 0)), (.22, (-1.35, .9)), (.5, (-.2, 1.0)), (.8, (1.3, .55)), (1, (1, 0))],
                swH=[(0, (-1, 0)), (.25, (-1.2, .75)), (.55, (.1, 1.0)), (.82, (1.15, .5)), (1, (1, 0))]),
}


def _cyc(keys, p):
    return _smooth_cycle(keys, p) if len(keys) > 1 else keys[0][1]


def _rotP(pt, deg, c):
    """绕过 c 的横轴（X）旋转：deg>0 前端（+Z）抬起"""
    a = math.radians(deg)
    y, z = pt[1] - c[1], pt[2] - c[2]
    return (pt[0], c[1] + y * math.cos(a) + z * math.sin(a), c[2] - y * math.sin(a) + z * math.cos(a))


def dog_pose(b, act, p):
    stand = act == 'stand'
    G = DOG_GAITS['walk' if stand else act]
    if stand: p = 0.0
    J = {}
    two = G is DOG_GAITS['walk']                      # 快步每半周期起伏一次；奔跑每周期一次
    pb = (2 * p) % 1.0 if two else p
    bob = 0.0 if stand else _cyc(G['bob'], pb)
    pitch = 0.0 if stand else _cyc(G['pitch'], p)
    e = 0.0 if stand else _cyc(G['spine'], p)           # 脊柱 伸展(+1) / 收拢(-1)
    sway = 0.0 if stand else -G['sway'] * math.sin(2 * math.pi * p)
    bc = (b.body_c[0] + sway, b.body_c[1] + bob, b.body_c[2])
    J['body'] = bc
    J['body_rz'] = (b.body_r[2] + .8 * e, 0, 0)
    # 腿
    legs = dict(FL=(1, 'F'), FR=(-1, 'F'), HL=(1, 'H'), HR=(-1, 'H'))
    for k, (sx, fh) in legs.items():
        z0 = b.fz if fh == 'F' else b.hz
        zdyn = z0 + (1.6 * e if fh == 'F' else -1.6 * e)
        hip = _rotP((sx * b.legx + sway, b.jy + bob, zdyn), pitch, bc)
        if stand:
            pz, py = z0, 0.0
        else:
            ph = (p - G['off'][k]) % 1.0
            A = G['A']
            if ph < G['duty']:
                q = ph / G['duty']; pz, py = z0 + A * (1 - 2 * q), 0.0
            else:
                q = (ph - G['duty']) / (1 - G['duty'])
                zz, yy = _path(G['swF' if fh == 'F' else 'swH'], q)
                pz, py = zdyn + zz * A, max(0.0, yy) * G['lift']
        ank = (sx * b.legx, py + b.paw_r, pz)
        knee, ank = _ik(hip, ank, b.up, b.lo, bend=(0, .3, 1) if fh == 'F' else (0, .3, -1))
        J['hip' + k], J['knee' + k], J['paw' + k] = hip, knee, ank
        J['heel' + k] = (ank[0], ank[1], ank[2] - .35)
        J['toe' + k] = (ank[0], ank[1], ank[2] + 1.35)
    # 头：随身体起伏但滞后（点头）；奔跑略低头前冲
    hbob = 0.0 if stand else _cyc(G['bob'], (pb - G['head_lag']) % 1.0)
    hc = (b.head_c[0] + sway * .5, b.head_c[1] + hbob, b.head_c[2] + .9 * e)
    hc = _rotP(hc, pitch * .5, bc)
    J['head'] = hc
    J['head_pitch'] = (pitch * .5 + (0 if stand else G['head_pitch']), 0, 0)
    J['neck0'] = _rotP((sway, b.body_c[1] + bob + 3.5, 6.0 + .9 * e), pitch, bc)
    # 耳：下垂端相对头部滞后晃动（身体下沉时耳尖上扬），奔跑时向后飘
    lag = 0.0 if stand else (_cyc(G['bob'], (pb - G['ear_lag']) % 1.0) - hbob) * G['ear_amp']
    back = 0.0 if stand or act == 'walk' else .8
    for k, sx in (('L', 1), ('R', -1)):
        t = _add(hc, (sx * b.ear_top[0], b.ear_top[1], b.ear_top[2]))
        bt = _add(hc, (sx * b.ear_bot[0], b.ear_bot[1] - lag + back * .5, b.ear_bot[2] - back))
        J['earT' + k], J['earB' + k] = t, bt
    # 尾：绕尾根竖轴左右摇（X-Z 平面），奔跑时尾巴放平一点
    wag = 0.0 if stand else G['tail_amp'] * math.sin(2 * math.pi * G['tail_freq'] * p)
    t0 = _rotP(_add(b.tail0, (sway, bob, 0)), pitch, bc)
    J['tail0'] = t0
    for i, tp in enumerate(b.tail):
        rel = _sub(_add(tp, (sway, bob, 0)), _add(b.tail0, (sway, bob, 0)))
        if G['tail_lift'] and not stand:
            rel = (rel[0], rel[1] * (1 + G['tail_lift']), rel[2] - G['tail_lift'] * 2.5 * (i + 1) / 3)
        rel = _rotY(rel, wag)
        J['tail%d' % (i + 1)] = _rotP(_add(t0, rel), pitch, t0)
    return dict(joints=J, act=act, p=p, paw_r=b.paw_r)


def _ellip(c, r, nu=14, nv=9):
    pts = []
    for i in range(nv + 1):
        v = math.pi * i / nv
        for j in range(nu):
            u = 2 * math.pi * j / nu
            pts.append((c[0] + r[0] * math.sin(v) * math.cos(u), c[1] + r[1] * math.cos(v), c[2] + r[2] * math.sin(v) * math.sin(u)))
    return pts


def _ellip_rot(c, r, pitch, pc=None):
    pts = _ellip(c, r)
    return [_rotP(q, pitch, pc or c) for q in pts] if pitch else pts


C_EAR, C_TAIL, C_SNOUT, C_NOSE = (112, 112, 118), (150, 150, 154), (244, 244, 244), (40, 40, 40)


def dog_items(b, pose, d):
    J = pose['joints']
    P = lambda k: proj(J[k], d)
    out = []
    bc = J['body']
    bdep = proj(bc, d)[2]
    # 躯干
    rz = J['body_rz'][0]
    pitch_b = math.degrees(math.atan2(J['hipFL'][1] - J['hipHL'][1], J['hipFL'][2] - J['hipHL'][2])) if J['hipFL'][2] != J['hipHL'][2] else 0
    body_pts = _ellip_rot(bc, (b.body_r[0], b.body_r[1], rz), pitch_b)
    out.append((bdep, 'poly', [proj(q, d)[:2] for q in body_pts], C_TORSO, 'body'))
    # 腿（近侧浅、远侧深）
    for k in ('FL', 'FR', 'HL', 'HR'):
        dep = (P('knee' + k)[2] + P('paw' + k)[2]) / 2
        col = _shade(dep - bdep)
        kk = dep - .2
        out += [(kk, 'cap', (P('hip' + k), P('knee' + k), b.leg_r[0]), col, 'leg'),
                (kk + .01, 'cap', (P('knee' + k), P('paw' + k), b.leg_r[1]), col, 'leg'),
                (kk + .02, 'cap', (P('heel' + k), P('toe' + k), b.paw_r), col, 'leg')]
    # 颈
    hc = J['head']
    hdep = proj(hc, d)[2]
    nk1 = _add(hc, (0, -6.5, -1.5))
    out.append((min(bdep, hdep + .5) - .3, 'cap', (P('neck0'), proj(nk1, d), 4.4), C_TORSO, 'body'))     # 颈总在头、躯干之后
    # 头（椭球）+ 吻部 + 五官
    hp = J['head_pitch'][0]
    head_pts = _ellip_rot(hc, b.head_r, hp)
    hk = hdep + .5
    out.append((hk, 'poly', [proj(q, d)[:2] for q in head_pts], C_HEAD, 'head'))
    sn = _rotP(_add(hc, b.snout), hp, hc)
    sdep = proj(sn, d)[2] - hdep
    if sdep > -2:
        out.append((hk + .02, 'poly', [proj(q, d)[:2] for q in _ellip_rot(sn, b.snout_r, hp, hc)], C_SNOUT, 'head'))
        nose = _rotP(_add(hc, (b.snout[0], b.snout[1] + 1.0, b.snout[2] + b.snout_r[2] - .3)), hp, hc)
        q = proj(nose, d)
        out.append((hk + .03, 'feat', (q[:2], 1.25, .95), C_NOSE, 'head'))
    for sx in (1, -1):
        eye = _rotP(_add(hc, (sx * 4.6, 1.8, b.head_r[2] * .72)), hp, hc)
        q = proj(eye, d)
        if q[2] - hdep > 1.5:
            out.append((hk + .04, 'feat', (q[:2], .95, 1.25), C_NOSE, 'head'))
    # 耳：近侧在头前，远侧在头后
    for k in 'LR':
        t, bt = P('earT' + k), P('earB' + k)
        rel = (t[2] + bt[2]) / 2 - hdep
        out.append((hk + (.5 if rel > -2 else -.6), 'cap', (t, bt, b.ear_r), C_EAR, 'ear'))
    # 尾（3 节卷尾）
    chain = ['tail0', 'tail1', 'tail2', 'tail3']
    tdep = P('tail2')[2]
    tk = tdep if abs(tdep - bdep) > 1.5 else bdep + .1
    for i in range(3):
        r = b.tail_r[i]
        out.append((tk + .01 * i, 'cap', (P(chain[i]), P(chain[i + 1]), r), C_TAIL, 'tail'))
    out.sort(key=lambda it: it[0])
    return out


def dog_joints_px(pose, d, ox, oy):
    """四足质检关节：头心、四个脚掌、尾尖（far/near 由深度决定）"""
    J = pose['joints']
    out = {}
    hd = proj(J['head'], d)
    out['head'] = (hd[0] + ox, hd[1] + oy, 0)
    bdep = proj(J['body'], d)[2]
    for k in ('FL', 'FR', 'HL', 'HR'):
        x, y, dep = proj(J['paw' + k], d)
        out['paw' + k] = (x + ox, y + oy, dep - bdep)
    x, y, dep = proj(J['tail3'], d)
    out['tail'] = (x + ox, y + oy, -9)           # 尾尖按远侧阈值（模型画的卷法会不同）
    return out
