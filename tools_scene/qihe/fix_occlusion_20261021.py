# -*- coding: utf-8 -*-
"""栖河开始部分地图：碰撞与遮挡排序补丁（2026-10-21 整改清单第 1 项）。

用户反馈“角色身体被掩盖；有些地方不应该能走进去”。逐图叠画碰撞与排序线排查（证据见
docs/updates/evidence/2026-10-21-rectify/01-遮挡碰撞/），问题集中在：
  1. 房屋、凉棚只挡了墙身，屋顶区域可走——人能走到屋顶上（空间合同：封闭房间不可走）；
  2. 桌面、货架、车斗、木桶、石堆、树干等物件只挡了最底一条，上半能走进去，人陷在物件里被盖住；
  3. 叶家、陈伯家排序线落在台阶上，站在墙脚前仍被整栋房子盖住；茶棚后左柱切图带了一条地砖，排序线跟着压低。
补丁规则写在 occlusion_fixes_20261021.json（每条带原因），本脚本只做：按规则把格子设为不可走、改排序线。
不重新生图、不换底图，不移动任何锚点；锚点与 NPC 站位若被新挡住会报错退出。

以工作区根目录运行：python3 tools_scene/qihe/fix_occlusion_20261021.py [--dry]
改写：js/qihe-expansion-data.js、js/qihe-rooms-data.js，以及各模块化批次 out/hd/scene.json 的 mask/props（保持与编译数据一致，
modular_maps.py 重新编译时不会丢补丁）。改前原件存 ../_attic/2026-10-21-occlusion-fix/（带 manifest.json 与 restore.sh）；
可重复执行：每次都从 _attic 原件重新套用规则，结果一致。
注意：若以后重跑批次 build.py（会按 central.tmj 等重写 scene.json）或 build_rooms.py / build_expansion.py，需再跑一次本脚本。
"""
from pathlib import Path
import base64, json, shutil, sys
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPEC = json.loads((Path(__file__).parent / 'occlusion_fixes_20261021.json').read_text())
ATTIC = ROOT.parent / '_attic/2026-10-21-occlusion-fix'
FILES = {'exp': ('js/qihe-expansion-data.js', 'QIHE_EXPANSION'), 'rooms': ('js/qihe-rooms-data.js', 'QIHE_ROOMS')}
FOOT_X = 14   # 与 SC.footX 一致


def paths():
    import subprocess
    js = "global.window=global;require('./js/production-assets.js');console.log(JSON.stringify(PRODUCTION_ASSET_PATHS))"
    return json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))


def read_js(rel, var):
    s = (ROOT / rel).read_text() if not (ATTIC / rel).exists() else (ATTIC / rel).read_text()
    head, rest = s.split('\n', 1); p = f'window.{var}='
    return head, json.loads(rest[len(p):].rstrip('\n').rstrip(';'))


def write_js(rel, var, head, data):
    (ROOT / rel).write_text(head + '\n' + f'window.{var}=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')


def unpack(m):
    b = np.frombuffer(base64.b64decode(m['d']), np.uint8)
    return np.unpackbits(b)[:m['w'] * m['h']].reshape(m['h'], m['w']).astype(bool)


def pack(a, m):
    return dict(m, d=base64.b64encode(np.packbits(a.astype(np.uint8).reshape(-1)).tobytes()).decode())


class Grid:
    """世界像素 → mask 格；行区间按 2 世界像素一格。"""
    def __init__(self, m, world):
        self.a = unpack(m); self.s = world[0] / m['w']; self.m = m

    def block_span(self, y, x0, x1):
        r = int(y // self.s)
        if not 0 <= r < self.a.shape[0]: return
        c0, c1 = max(0, int(x0 // self.s)), min(self.a.shape[1] - 1, int(x1 // self.s))
        self.a[r, c0:c1 + 1] = False

    def ok(self, x, y):
        c, r = int(x // self.s), int(y // self.s)
        return 0 <= r < self.a.shape[0] and 0 <= c < self.a.shape[1] and self.a[r, c]

    def stand(self, x, y):
        return self.ok(x, y) and self.ok(x - FOOT_X, y) and self.ok(x + FOOT_X, y) and self.ok(x, y + 3) and self.ok(x, y - 5)


def fill_alpha(grid, alpha, ox, oy, y0, y1, pad=2):
    """alpha：世界尺寸的布尔图（左上角在 ox,oy）；把 [y0,y1) 各行最左到最右的不透明像素（两侧加 pad）设为不可走。"""
    h = alpha.shape[0]; n = 0
    for yy in range(max(0, int(round(y0 - oy))), min(h, int(round(y1 - oy)))):
        xs = np.nonzero(alpha[yy])[0]
        if len(xs):
            grid.block_span(oy + yy, ox + xs.min() - pad, ox + xs.max() + pad); n += 1
    return n


def prop_alpha(atlas, q, k):
    im = atlas.crop((q[0], q[1], q[0] + q[2], q[1] + q[3])).resize((max(1, round(q[2] * k)), max(1, round(q[3] * k))), Image.NEAREST)
    return np.asarray(im)[..., 3] > 100


def trunk_top(alpha):
    """树干起点：下半部第一行不透明宽度收窄到全宽 35% 以下的行。"""
    h, w = alpha.shape
    for yy in range(h // 2, h):
        xs = np.nonzero(alpha[yy])[0]
        if len(xs) and xs.max() - xs.min() < w * 0.35: return yy
    return int(h * 0.8)


def check_points(grid, before, pts, label):
    bad = [(k, p) for k, p in pts.items() if before.get(k) and not grid.stand(*p)]
    if bad: raise SystemExit(f'{label}：补丁挡住了原本可站的锚点 {bad}')


def main(dry=False):
    P = paths(); log = []
    heads, data = {}, {}
    for key, (rel, var) in FILES.items():
        heads[key], data[key] = read_js(rel, var)
    for mkey, ms in SPEC['maps'].items():
        room = ms.get('room'); m = data['rooms'][mkey] if room else data['exp'][mkey]
        W, H = m['worldSize']; grid = Grid(m['mask'], m['worldSize'])
        pts = {'anchor:' + k: v for k, v in m['anchors'].items()}
        before = {k: grid.stand(*p) for k, p in pts.items()}
        atlas = Image.open(ROOT / P[m['propImg']]).convert('RGBA') if m.get('propImg') else None
        fg = None
        for r in ms['rules']:
            if 'fill' in r or 'trunk' in r:
                i = r.get('fill', r.get('trunk')); q = m['props'][i]; a = prop_alpha(atlas, q, m['propK'])
                y0 = r.get('y0', q[5]) if 'fill' in r else q[5] + trunk_top(a)
                n = fill_alpha(grid, a, round(q[4]), round(q[5]), y0, r.get('y1', q[6] + 1))
                log.append(f'{mkey} 物件{i} {"填满" if "fill" in r else "树干"} y {round(y0)}~{round(r.get("y1", q[6]))} 共 {n} 行：{r["why"]}')
            elif 'fillfg' in r:
                if fg is None:
                    fg = np.asarray(Image.open(ROOT / P[m['fg']]).convert('RGBA').resize((W, H), Image.LANCZOS))[..., 3] > 100
                i = r['fillfg']; q = m['fgp'][i]; x0, yA, w, h = (int(round(v)) for v in q[:4])
                sub = np.zeros_like(fg[yA:yA + h]); sub[:, x0:x0 + w] = fg[yA:yA + h, x0:x0 + w]
                n = fill_alpha(grid, sub, 0, yA, r.get('y0', q[1]), r.get('y1', q[4] + 1))
                log.append(f'{mkey} 前景切片{i} 填满 共 {n} 行：{r["why"]}')
            elif 'rect' in r:
                x0, y0, x1, y1 = r['rect']
                for yy in range(int(y0), int(y1)): grid.block_span(yy, x0, x1)
                log.append(f'{mkey} 矩形 {r["rect"]}：{r["why"]}')
            elif 'sortY' in r:
                i = r['sortY']; arr = m['props'] if 'props' in m and not room and mkey != 'mountain' else m['fgp']
                col = 6 if arr is m.get('props') else 4
                log.append(f'{mkey} 物件{i} 排序线 {arr[i][col]} → {r["to"]}：{r["why"]}'); arr[i][col] = r['to']
        check_points(grid, before, pts, mkey)
        m['mask'] = pack(grid.a, m['mask'])
        if ms.get('batch'):
            f = ROOT / ms['batch'] / 'out/hd/scene.json'; src = ATTIC / ms['batch'] / 'out/hd/scene.json'
            s = json.loads((src if src.exists() else f).read_text())
            s['mask'] = m['mask']; s['props'] = m['props']
            if not dry:
                if not src.exists(): src.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(f, src)
                f.write_text(json.dumps(s, ensure_ascii=False))
    if not dry:
        for key, (rel, var) in FILES.items():
            if not (ATTIC / rel).exists(): (ATTIC / rel).parent.mkdir(parents=True, exist_ok=True); shutil.copy2(ROOT / rel, ATTIC / rel)
            write_js(rel, var, heads[key], data[key])
        files = [str(p.relative_to(ATTIC)) for p in ATTIC.rglob('*') if p.is_file() and p.name not in ('manifest.json', 'restore.sh')]
        (ATTIC / 'manifest.json').write_text(json.dumps(dict(date='2026-10-21', reason='整改清单第 1 项：碰撞与遮挡排序补丁前的原件', tool='xiaojianghu-legacy-prologue/tools_scene/qihe/fix_occlusion_20261021.py', files=files), ensure_ascii=False, indent=1) + '\n')
        (ATTIC / 'restore.sh').write_text('#!/bin/sh\n# 还原补丁前的地图数据\ncd "$(dirname "$0")"\n' + ''.join(f'cp "{p}" "../../xiaojianghu-legacy-prologue/{p}"\n' for p in files))
    print('\n'.join(log)); print('（试运行，未写文件）' if dry else f'已写入；原件在 {ATTIC}')


if __name__ == '__main__':
    main('--dry' in sys.argv)
