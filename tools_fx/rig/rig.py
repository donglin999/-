"""2D 侧身骨骼与正向运动学（工作流 E，帧动画管线 docs/anim-pipeline.md §2）

坐标：美术像素，y 向下，地面 y=0（站姿脚底），角色**朝右**计算，朝左时最后整体镜像 x。
人形骨骼：骨盆(根) → 脊柱 → 颈 → 头；近/远 肩 → 上臂 → 前臂 → 手 → 武器骨；近/远 髋 → 大腿 → 小腿 → 脚。
关节角（度）语义（朝前 = 画面右）：
  root: dx, dy       骨盆相对站姿位置的平移（dy>0 下沉）；air=True 时不自动贴地
  lean               躯干前倾（>0 向前）；head 头相对躯干低头/前倾
  aN / aF = [sh, el, wr]   肩前摆（0 = 沿躯干下垂，>0 向前抬），肘屈（>0 前臂进一步向前/上），腕
  lN / lF = [hip, kn, an]  髋前摆（0 = 竖直向下，>0 向前），膝屈（>0 小腿向后折），脚掌角（0 = 水平朝前，>0 脚尖向下）
  wpn                武器相对手的角度（0 = 沿手的方向，-90 = 手下垂时剑身水平朝前）
  hand               武器挂在哪只手：'N' 近侧 / 'F' 远侧
  lie                整体旋转（度，倒地用；>0 向后倒）
"""
import math

HU = 1.0  # 头高单位，实例化时按 H/heads 缩放


class Body:
    """按角色比例实例化的人形骨骼长度（美术像素）"""

    kind = 'human'

    def __init__(self, H=64, heads=6.0, weapon=None, build='m', bulk=1.0, robe=0.0, cape=False):
        """bulk：躯干/四肢粗细倍数（魁梧 >1、瘦 <1）；robe：长袍下摆位置（0 无，1 到踝）；cape：背后披风（工作流 I 敌人用）"""
        u = H / heads
        self.H, self.u, self.build = H, u, build
        self.bulk, self.robe, self.cape = bulk, robe, cape
        f = build == 'f'
        self.L = dict(
            thigh=1.45 * u, shin=1.33 * u, ankle=.22 * u, foot=.85 * u,
            spine=1.72 * u, neck=.28 * u, head=1.0 * u,
            ua=1.28 * u, fa=1.12 * u, hand=.42 * u,
        )
        # 宽度（渲染厚度）
        self.W = dict(
            thigh=(.66 if f else .62) * u, shin=.46 * u, ua=.40 * u, fa=.34 * u, foot=.30 * u,
            chest=(1.05 if f else 1.0) * u, waist=(.7 if f else .74) * u, hips=(1.0 if f else .86) * u,
            headw=.86 * u, hand=.30 * u,
        )
        if bulk != 1.0:
            for k in self.W:
                self.W[k] *= (1 + (bulk - 1) * .4) if k == 'headw' else bulk
        self.weapon = weapon or {}
        self.hip_h = self.L['thigh'] + self.L['shin'] + self.L['ankle']   # 站姿骨盆高


def _pt(p, ang, L):
    a = math.radians(ang)
    return (p[0] + L * math.cos(a), p[1] + L * math.sin(a))


def fk(body, pose, facing='l', ground=True):
    """返回 {joints:{名:(x,y)}, segs:[(名,起点,终点,宽,层)], head:(c,角), weapon:[...] }，脚底贴 y=0
    非人形骨骼（body.kind = quad/bird/snake，见 rig_beast.py）转交 rig_beast.fk"""
    if getattr(body, 'kind', 'human') != 'human':
        import rig_beast
        return rig_beast.fk(body, pose, facing, ground)
    L, Wd = body.L, body.W
    P = (pose.get('dx', 0.0), -body.hip_h + pose.get('dy', 0.0))
    lean = pose.get('lean', 0.0)
    up = -90 + lean
    down = 90 + lean
    J = {'pelvis': P}
    S = _pt(P, up, L['spine']); J['shoulder'] = S
    N = _pt(S, up + pose.get('head', 0) * .3, L['neck']); J['neck'] = N
    hup = up + pose.get('head', 0)
    Hc = _pt(N, hup, L['head'] * .5); J['head'] = Hc
    segs = []
    wpn = []
    for side in ('F', 'N'):
        sh, el, wr = (pose.get('a' + side) or [0, 10, 0]) + [0] * 0
        a_ua = down - sh
        E = _pt(S, a_ua, L['ua']); a_fa = a_ua - el
        Wr = _pt(E, a_fa, L['fa']); a_h = a_fa - wr
        Hd = _pt(Wr, a_h, L['hand'])
        J['elbow' + side], J['wrist' + side], J['hand' + side] = E, Wr, Hd
        segs += [('ua' + side, S, E, Wd['ua'], side), ('fa' + side, E, Wr, Wd['fa'], side), ('hand' + side, Wr, Hd, Wd['hand'], side)]
        hip, kn, an = pose.get('l' + side) or [0, 5, 0]
        a_th = 90 - hip
        K = _pt(P, a_th, L['thigh']); a_sh = a_th + kn
        A = _pt(K, a_sh, L['shin'])
        Hl = _pt(A, a_sh, L['ankle'])                 # 脚跟底
        a_ft = -an                                    # 脚掌默认水平朝前；an>0 脚尖向下（踮脚/蹬地）
        T = _pt(Hl, a_ft, L['foot'])
        J['knee' + side], J['ankle' + side], J['heel' + side], J['toe' + side] = K, A, Hl, T
        segs += [('thigh' + side, P, K, Wd['thigh'], side), ('shin' + side, K, A, Wd['shin'], side),
                 ('foot' + side, Hl, T, Wd['foot'], side)]
        w = body.weapon
        if w and pose.get('hand', w.get('hand', 'N')) == side and not pose.get('noweapon'):
            a_w = a_h + pose.get('wpn', w.get('wpn', -90))
            g = w.get('grip', .15)
            base = _pt(Wr, a_h, L['hand'] * .55)
            b0 = _pt(base, a_w, -w['len'] * g)
            tip = _pt(base, a_w, w['len'] * (1 - g))
            wpn.append(dict(kind=w['kind'], base=b0, grip=base, tip=tip, ang=a_w))
            J['wtip'] = tip; J['wbase'] = b0
    # 飞行道具（银针等）：pose['proj'] = [(dx,dy,角度), ...] 相对手
    proj = []
    for dx, dy, ang in pose.get('proj', []):
        hN = J['hand' + pose.get('hand', body.weapon.get('hand', 'N') if body.weapon else 'N')]
        c = (hN[0] + dx, hN[1] + dy)
        proj.append((_pt(c, ang, -body.u * .45), _pt(c, ang, body.u * .45)))
    out = dict(joints=J, segs=segs, weapon=wpn, proj=proj, lean=lean, hup=hup)
    # 整体旋转（倒地）
    rot = pose.get('lie', 0)
    if rot:
        c = P
        out = _transform(out, lambda p: _rot(p, c, rot))
    if ground and not pose.get('air'):
        ys = [p[1] for k, p in out['joints'].items() if k.startswith(('heel', 'toe'))]
        if rot:
            ys = [p[1] for p in out['joints'].values()]
            ys.append(out['joints']['head'][1] + body.L['head'] * .5)
        dy = -max(ys)
        out = _transform(out, lambda p: (p[0], p[1] + dy))
    elif pose.get('air'):
        dy = pose.get('air') if isinstance(pose.get('air'), (int, float)) and pose.get('air') is not True else 0
        ys = [p[1] for k, p in out['joints'].items() if k.startswith(('heel', 'toe'))]
        out = _transform(out, lambda p: (p[0], p[1] - max(ys) - dy))
    if facing == 'l':
        out = _transform(out, lambda p: (-p[0], p[1]))
        out['mirror'] = True
    return out


def _rot(p, c, deg):
    a = math.radians(-deg)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))


def _transform(o, f):
    o = dict(o)
    o['joints'] = {k: f(v) for k, v in o['joints'].items()}
    o['segs'] = [(n, f(a), f(b), w, s) for n, a, b, w, s in o['segs']]
    o['weapon'] = [dict(w, base=f(w['base']), grip=f(w['grip']), tip=f(w['tip'])) for w in o['weapon']]
    o['proj'] = [(f(a), f(b)) for a, b in o['proj']]
    return o


def lerp_pose(a, b, t):
    """两个关键帧插值（数值与列表逐项线性；非数值取就近）"""
    out = {}
    for k in set(a) | set(b):
        va, vb = a.get(k, b.get(k)), b.get(k, a.get(k))
        if isinstance(va, (int, float)) and isinstance(vb, (int, float)) and not isinstance(va, bool):
            out[k] = va + (vb - va) * t
        elif isinstance(va, list) and isinstance(vb, list) and len(va) == len(vb) and all(isinstance(x, (int, float)) for x in va + vb):
            out[k] = [x + (y - x) * t for x, y in zip(va, vb)]
        else:
            out[k] = va if t < .5 else vb
    return out
