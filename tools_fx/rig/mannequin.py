"""白模渲染（工作流 E，docs/anim-pipeline.md §2）
侧身灰色人偶：远侧肢体深灰 #808080、躯干中灰 #b0b0b0、近侧肢体浅灰 #d8d8d8，关节小圆，头部鼻尖三角标朝向，
武器纯色（剑 #4aa3ff、针 #ff4ad2），地面线。输出：
  render(fr, S, cellW, cellH)       → RGBA 图（S 像素 / 美术像素，4× 超采样抗锯齿）
  silhouette(fr, cellW, cellH, S=1) → 布尔剪影（美术像素网格，质检/配准用；不含地面线）
坐标约定：单元内地面线在 y = cellH - FOOT_PAD 美术像素，站姿骨盆 x=0 位于单元水平中线。
"""
import math
import numpy as np
from PIL import Image, ImageDraw

C_FAR, C_TORSO, C_NEAR, C_SKIRT = (128, 128, 128), (176, 176, 176), (216, 216, 216), (196, 196, 196)
C_JOINT = (96, 96, 96)
C_WPN = {'sword': (150, 172, 205), 'needle': (150, 172, 205), 'staff': (120, 150, 90), 'saber': (150, 172, 205),
         'ghost': (150, 172, 205)}
C_CAPE = (100, 100, 100)   # 钢色（纯蓝会被模型照抄成蓝剑）
BG = (255, 0, 255)          # 白模/生图背景：品红色键（主角白衣，白底去背会吃掉衣服）
FOOT_PAD = 2
SS = 4


def _cap(d, a, b, w, col):
    d.line([a, b], fill=col, width=max(1, int(round(w))))
    r = w / 2
    for p in (a, b):
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=col)


def _perp(a, b, k):
    dx, dy = b[0] - a[0], b[1] - a[1]
    n = math.hypot(dx, dy) or 1
    return (-dy / n * k, dx / n * k)


def draw(fr, body, S, cellW, cellH, mono=None, joints=True, ground=True, sx=0, bg=None):
    """在 cellW×cellH（美术像素）单元里画一帧白模；mono 给定则全部用单色（剪影）"""
    if fr.get('kind', 'human') != 'human':
        import rig_beast
        return rig_beast.draw(fr, body, S, cellW, cellH, mono=mono, joints=joints, ground=ground, sx=sx, bg=bg)
    Z = S * SS
    bg = bg or BG
    im = Image.new('RGBA', (int(cellW * Z), int(cellH * Z)), (0, 0, 0, 0) if mono else tuple(bg) + (255,))
    d = ImageDraw.Draw(im)
    ox, oy = cellW / 2 + sx, cellH - FOOT_PAD
    T = lambda p: ((p[0] + ox) * Z, (p[1] + oy) * Z)
    col = lambda c: mono or c
    J = fr['joints']
    segs = {n: (T(a), T(b), w * Z) for n, a, b, w, s in fr['segs']}
    wp = fr['weapon']
    whand = None
    if wp:
        whand = 'N' if math.dist(wp[0]['grip'], J['handN']) < math.dist(wp[0]['grip'], J['handF']) else 'F'

    def weapon():
        for w in wp:
            c = col(C_WPN.get(w['kind'], (74, 163, 255)))
            if w['kind'] == 'needle':
                # 三枚针呈扇形
                for da in (-14, 0, 14):
                    a = math.radians(math.degrees(math.atan2(w['tip'][1] - w['grip'][1], w['tip'][0] - w['grip'][0])) + da)
                    L = math.dist(w['tip'], w['grip'])
                    e = (w['grip'][0] + L * math.cos(a), w['grip'][1] + L * math.sin(a))
                    d.line([T(w['grip']), T(e)], fill=c, width=max(1, int(.55 * Z)))
            elif w['kind'] in ('saber', 'ghost'):
                # 刀：刀背直、刃口外鼓，越近刀尖越宽，尖端斜收（ghost = 鬼头大刀，更宽，柄尾环首）
                big = w['kind'] == 'ghost'
                b, t, gp = w['base'], w['tip'], w['grip']
                L = math.dist(b, t) or 1
                dv = ((t[0] - b[0]) / L, (t[1] - b[1]) / L)
                pv = (-dv[1], dv[0])
                if w.get('flip'): pv = (-pv[0], -pv[1])
                g0 = (gp[0] + dv[0] * body.u * .25, gp[1] + dv[1] * body.u * .25)
                Lb = math.dist(g0, t)
                wmax = (.95 if big else .6) * body.u
                pts_s, pts_e = [], []
                for k in [i / 10 for i in range(11)]:
                    cc = (g0[0] + dv[0] * Lb * k, g0[1] + dv[1] * Lb * k)
                    wk = wmax * (.55 + .45 * min(1, k / .75)) * (1 if k < .86 else max(.05, (1 - k) / .14))
                    pts_s.append(cc)
                    pts_e.append((cc[0] + pv[0] * wk, cc[1] + pv[1] * wk))
                d.polygon([T(p) for p in pts_s + pts_e[::-1]], fill=c)
                d.line([T(b), T(g0)], fill=c, width=max(1, int((.42 if big else .32) * body.u * Z)))
                pp = _perp(b, t, (.55 if big else .4) * body.u * Z)
                d.line([(T(g0)[0] - pp[0], T(g0)[1] - pp[1]), (T(g0)[0] + pp[0], T(g0)[1] + pp[1])], fill=c, width=max(1, int(.3 * body.u * Z)))
                if big:
                    r = .38 * body.u * Z; q = T(b)
                    d.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], outline=c, width=max(1, int(.16 * body.u * Z)))
            else:
                wd = {'sword': .85, 'saber': 1.0, 'staff': 1.15}.get(w['kind'], .5) * Z
                d.line([T(w['base']), T(w['tip'])], fill=c, width=int(wd))
                gp = T(w['grip']); pp = _perp(w['base'], w['tip'], .7 * Z)
                if w['kind'] in ('sword', 'saber'):   # 护手
                    g0 = (gp[0] + (T(w['tip'])[0] - gp[0]) * .06, gp[1] + (T(w['tip'])[1] - gp[1]) * .06)
                    d.line([(g0[0] - pp[0], g0[1] - pp[1]), (g0[0] + pp[0], g0[1] + pp[1])], fill=c, width=int(.45 * Z))
        for a, b in fr['proj']:
            d.line([T(a), T(b)], fill=col(C_WPN['needle']), width=max(1, int(.55 * Z)))

    def limbs(side, c, parts=('leg', 'arm')):
        if 'leg' in parts:
            for n in ('thigh', 'shin', 'foot'):
                _cap(d, *segs[n + side], col(c))
        if 'arm' in parts:
            for n in ('ua', 'fa', 'hand'):
                _cap(d, *segs[n + side], col(c))
        if joints and not mono:
            for n in (('knee', 'ankle') if 'leg' in parts else ()) + (('elbow', 'wrist') if 'arm' in parts else ()):
                p = T(J[n + side]); r = .16 * Z
                d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=C_JOINT)

    def torso():
        Wd = body.W
        P, Sh = J['pelvis'], J['shoulder']
        mid = ((P[0] * .6 + Sh[0] * .4), (P[1] * .6 + Sh[1] * .4))
        pc = _perp(Sh, P, 1)
        pts = []
        for p, w in ((Sh, Wd['chest']), (mid, Wd['waist']), (P, Wd['hips'])):
            pts.append((p[0] + pc[0] * w / 2, p[1] + pc[1] * w / 2))
        for p, w in ((P, Wd['hips']), (mid, Wd['waist']), (Sh, Wd['chest'])):
            pts.append((p[0] - pc[0] * w / 2, p[1] - pc[1] * w / 2))
        d.polygon([T(p) for p in pts], fill=col(C_TORSO))
        r = Wd['chest'] / 2 * Z; s = T(Sh)
        d.ellipse([s[0] - r, s[1] - r * .8, s[0] + r, s[1] + r * .8], fill=col(C_TORSO))
        r = Wd['hips'] / 2 * Z; s = T(P)
        d.ellipse([s[0] - r, s[1] - r * .9, s[0] + r, s[1] + r * .9], fill=col(C_TORSO))
        _cap(d, T(Sh), T(J['neck']), .38 * body.u * Z, col(C_TORSO))
        # 头：椭圆 + 鼻尖三角（朝向）
        hc = T(J['head']); hw, hh = Wd['headw'] / 2 * Z, body.L['head'] / 2 * Z
        d.ellipse([hc[0] - hw, hc[1] - hh, hc[0] + hw, hc[1] + hh], fill=col(C_TORSO))
        fx = -1 if fr.get('mirror') else 1
        upv = (J['head'][0] - J['neck'][0], J['head'][1] - J['neck'][1]); n = math.hypot(*upv) or 1
        upv = (upv[0] / n, upv[1] / n)
        fwd = (-upv[1], upv[0]) if fx > 0 else (upv[1], -upv[0])      # 头的"前"方向
        base = (J['head'][0] - upv[0] * .08 * body.u, J['head'][1] - upv[1] * .08 * body.u)
        tip = (base[0] + fwd[0] * .62 * body.u, base[1] + fwd[1] * .62 * body.u)
        b1 = (base[0] + fwd[0] * .38 * body.u + upv[0] * .16 * body.u, base[1] + fwd[1] * .38 * body.u + upv[1] * .16 * body.u)
        b2 = (base[0] + fwd[0] * .38 * body.u - upv[0] * .16 * body.u, base[1] + fwd[1] * .38 * body.u - upv[1] * .16 * body.u)
        d.polygon([T(b1), T(tip), T(b2)], fill=col(C_TORSO))
        if not mono:  # 眼点
            e = (base[0] + fwd[0] * .22 * body.u + upv[0] * .1 * body.u, base[1] + fwd[1] * .22 * body.u + upv[1] * .1 * body.u)
            r = .09 * body.u * Z; e = T(e)
            d.ellipse([e[0] - r, e[1] - r, e[0] + r, e[1] + r], fill=(60, 60, 60))

    def skirt():
        if body.build != 'f' or fr.get('noskirt'): return
        P = J['pelvis']
        pts = [J['pelvis'], J['kneeN'], J['ankleN'], J['ankleF'], J['kneeF']]
        # 裙：腰 → 两膝 → 两踝外沿的凸包，下摆略外扩
        from scipy.spatial import ConvexHull
        ext = []
        for p in pts:
            ext.append(p)
        ax = [(J['ankleN'][0] + J['ankleF'][0]) / 2, (J['ankleN'][1] + J['ankleF'][1]) / 2]
        for s in ('N', 'F'):
            a = J['ankle' + s]
            ext.append((a[0] + (a[0] - ax[0]) * .25 + (a[0] - P[0]) * .08, a[1] - .2 * body.u))
        hw = body.W['hips'] / 2 + .1 * body.u
        ext += [(P[0] - hw, P[1] - .3 * body.u), (P[0] + hw, P[1] - .3 * body.u)]
        arr = np.array(ext)
        try:
            h = ConvexHull(arr)
            d.polygon([T(tuple(arr[i])) for i in h.vertices], fill=col(C_SKIRT))
        except Exception:
            pass

    def cape():
        # 披风：肩后 → 背后外飘到膝下（远侧深灰之外的更深灰）
        P, Sh = J['pelvis'], J['shoulder']
        n = math.dist(P, Sh) or 1
        up = ((Sh[0] - P[0]) / n, (Sh[1] - P[1]) / n)
        fwd = (-up[1], up[0]) if not fr.get('mirror') else (up[1], -up[0])
        u = body.u; fl = fr.get('cape_fly', 0) * u; Lt = body.L['thigh']
        f = lambda o, b_, v: (o[0] - fwd[0] * b_ + up[0] * v, o[1] - fwd[1] * b_ + up[1] * v)
        pts = [f(Sh, .1 * u, .25 * u), f(Sh, .75 * u, -.1 * u), f(P, 1.3 * u + fl * .5, 0),
               f(P, 1.7 * u + fl, -(Lt + .6 * u)), f(P, .2 * u, -(Lt + .3 * u)), P]
        d.polygon([T(p) for p in pts], fill=col(C_CAPE))

    def robe():
        # 长袍：腰 → 两膝 → 小腿 robe 处的外沿凸包（老僧僧袍）
        from scipy.spatial import ConvexHull
        P = J['pelvis']; r = body.robe
        ext = [P, J['kneeN'], J['kneeF']]
        for s_ in ('N', 'F'):
            k, a = J['knee' + s_], J['ankle' + s_]
            h = (k[0] + (a[0] - k[0]) * r, k[1] + (a[1] - k[1]) * r)
            ext.append((h[0] + (h[0] - P[0]) * .12, h[1]))
        hw = body.W['hips'] / 2 + .15 * body.u
        ext += [(P[0] - hw, P[1] - .3 * body.u), (P[0] + hw, P[1] - .3 * body.u)]
        arr = np.array(ext)
        try:
            h = ConvexHull(arr)
            d.polygon([T(tuple(arr[i])) for i in h.vertices], fill=col(C_SKIRT))
        except Exception:
            pass

    wf = whand == 'F'
    if getattr(body, 'cape', False): cape()
    if wf: weapon()
    limbs('F', C_FAR)
    torso()
    if body.build == 'f':            # 长裙盖住双腿：近侧腿先画、裙压在上面
        limbs('N', C_NEAR, ('leg',)); skirt(); limbs('N', C_NEAR, ('arm',))
    elif getattr(body, 'robe', 0):
        limbs('N', C_NEAR, ('leg',)); robe(); limbs('N', C_NEAR, ('arm',))
    else:
        limbs('N', C_NEAR)
    if not wf: weapon()
    if ground and not mono:
        d.line([(0, oy * Z), (cellW * Z, oy * Z)], fill=(90, 90, 90), width=max(1, int(.25 * Z)))
    return im.resize((int(cellW * S), int(cellH * S)), Image.LANCZOS if not mono else Image.BOX)


def render(fr, body, S, cellW, cellH, **kw):
    return draw(fr, body, S, cellW, cellH, **kw)


def silhouette(fr, body, cellW, cellH, S=1, sx=0):
    im = draw(fr, body, S, cellW, cellH, mono=(0, 0, 0), joints=False, ground=False, sx=sx)
    return np.array(im)[..., 3] > 127


def bbox_art(fr, body):
    """白模包围盒（美术像素，相对站姿骨盆 x=0 / 地面 y=0）：(x0, x1, top)"""
    m = silhouette(fr, body, 320, 220, S=2)
    ys, xs = np.nonzero(m)
    return xs.min() / 2 - 160, xs.max() / 2 - 160, (220 - FOOT_PAD) - ys.min() / 2


def joints_px(fr, cellW, cellH, S=1, sx=0):
    """关节坐标（单元像素，S 倍）"""
    ox, oy = cellW / 2 + sx, cellH - FOOT_PAD
    J = {k: [round((v[0] + ox) * S, 2), round((v[1] + oy) * S, 2)] for k, v in fr['joints'].items()}
    return J


def overview(char, S=4, out=None):
    """白模总览：每个动作一行（派生帧用程序位移），输出 review/battle_v3/E/rig_{char}.png 与 raw_anim/{char}/rig/"""
    import json, os
    from PIL import ImageDraw
    import rig as R
    import poses as PS
    body = PS.body_of(char)
    ch = PS.CHARS[char]
    CW, CH = ch.get('ov_cell', (120, 104))
    if ch.get('cell_art', 100) > 120: CW, CH = 200, 170
    rows = []
    for an, a in PS.actions_of(char).items():
        row = []
        for f in a['frames']:
            if isinstance(f, str):
                pz, lab = ch['poses'][f], f
            else:
                op, n, v = f
                pz = dict(ch['poses'][n]); lab = f'{n}:{op}{v}'
                if op == 'bob': pz['dy'] = pz.get('dy', 0) + v; pz['lean'] = pz.get('lean', 0) + v * 1.5
                elif op == 'lean': pz['lean'] = pz.get('lean', 0) + v * 3
                elif op == 'air': pz['air'] = v
            fr = R.fk(body, pz, ch['facing'])
            row.append((render(fr, body, S, CW, CH, bg=(255, 255, 255)), lab))
        rows.append((an, row))
    ncol = max(len(r) for _, r in rows)
    im = Image.new('RGB', (ncol * CW * S + 80, len(rows) * (CH * S + 16)), (255, 255, 255))
    d = ImageDraw.Draw(im)
    for i, (an, row) in enumerate(rows):
        y = i * (CH * S + 16)
        d.text((4, y + 4), an, fill=(0, 0, 0))
        for j, (r, lab) in enumerate(row):
            x = 80 + j * CW * S
            im.paste(r.convert('RGB'), (x, y))
            d.rectangle([x, y, x + CW * S - 1, y + CH * S - 1], outline=(220, 220, 220))
            d.text((x + 4, y + CH * S + 2), lab, fill=(0, 0, 0))
    out = out or (f'review/battle_v3/E/rig_{char}.png' if char in ('hero', 'suzhi') else f'review/battle_v4/I/rig_{char}.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out)
    # 逐姿势白模与关节
    od = f'raw_anim/{char}/rig'
    os.makedirs(od, exist_ok=True)
    J = {}
    for n in PS.unique_poses(char):
        fr = R.fk(body, ch['poses'][n], ch['facing'])
        render(fr, body, 6, CW, CH, bg=(255, 255, 255)).convert('RGB').save(f'{od}/{n}.png')
        J[n] = joints_px(fr, CW, CH)
    json.dump(J, open(f'{od}/joints.json', 'w'), indent=0)
    print(out, im.size)


if __name__ == '__main__':
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    for c in sys.argv[1:] or ['hero']:
        overview(c)


def extents(char):
    """各姿势白模包围盒（美术像素，相对地面/骨盆中线）：检查单元高是否超标"""
    import rig as R, poses as PS
    body = PS.body_of(char); ch = PS.CHARS[char]
    for n in PS.unique_poses(char):
        fr = R.fk(body, ch['poses'][n], ch['facing'])
        m = silhouette(fr, body, 320, 220)
        ys, xs = np.nonzero(m)
        print(f'{n:8s} 高 {220 - FOOT_PAD - ys.min():5.0f}  x {xs.min() - 160:4d}..{xs.max() - 160:4d}')
