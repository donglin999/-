"""质检（工作流 E，docs/anim-pipeline.md §4.3）
对 raw_anim/<角色>/gen/ 下每张网格生成图的每个姿势：配准到白模 → 剪影 IoU / 覆盖率 / 溢出率 / 关键关节距离，
判定通过与否，每个姿势挑分数最高的候选写入 raw_anim/<角色>/qa.json 的 pick（assemble.py 读取）。
--regen N：对仍有不合格姿势的网格自动重新生成（每网格最多 N 次，串行），再质检。

阈值（美术像素网格，见 TH）：
  cover ≥ 0.55   白模剪影被生成剪影覆盖的比例（缺胳膊少腿、姿势画错 → 低；衣摆宽、步幅大会让它天然 <0.8）
  spill ≤ 0.20   生成剪影落在"白模外扩 3px"之外的比例（多出人物/披风乱飞/姿势画错 → 高）
  关节距离：头 ≤ 3、近侧手脚 ≤ 5、远侧手脚 ≤ 9（常被遮挡）、武器尖 ≤ 8（白模关节点到最近生成像素的距离）
用法：python3 tools_fx/rig/qa.py hero [--regen 2] [--grids atk,base]
"""
import argparse, glob, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import assemble as A  # noqa: E402
from genframes import grids as grids_of  # noqa: E402

# 阈值按首批 12 帧人工目检校准（目检全部可用的帧：cover 0.58–0.82、spill ≤0.09、近侧手/脚 ≤3.2、远侧肢体常被身体/衣摆遮挡到 7–8）
TH = dict(cover=.55, spill=.20, head=3.0, near=5.0, far=9.0, wtip=8.0)
QV = 6           # 质检记录版本（配准参数变了就 +1 让旧记录重算）
LIM = dict(head='head', handN='near', toeN='near', handF='far', toeF='far', wtip='wtip',
           # 非人形（工作流 I）：嘴/喙/近侧爪按近侧，远侧爪与尾按远侧
           nose='near', beak='near', snout='near', pawFN='near', pawHN='near', pawFF='far', pawHF='far', tail='far')


def judge(m, char=None):
    th = dict(TH)
    if char:
        k = max(1.0, A.PS.CHARS[char]['body']['H'] / 64)                      # 关节距离阈值按身高缩放（头目 104px → ×1.6）
        for j in ('head', 'near', 'far', 'wtip'): th[j] *= k
        th.update(A.PS.CHARS[char].get('qa_th', {}))                          # 角色级阈值覆盖（如头目披风外飘 → spill 放宽）
    bad = []
    if m['cover'] < th['cover']: bad.append('cover')
    if m['spill'] > th['spill']: bad.append('spill')
    for k, v in m['joints'].items():
        if v > th[LIM.get(k, 'near')]: bad.append(k)
    return bad


def score(m):
    return m['iou'] + .5 * m['cover'] - m['spill'] - .03 * sum(min(v, 8) for v in m['joints'].values())


def run(char, grids=None):
    qp = f'raw_anim/{char}/qa.json'
    old = json.load(open(qp)) if os.path.exists(qp) else {}
    recs = old.get('all', {})
    for f in sorted(glob.glob(f'raw_anim/{char}/gen/*_[0-9]*.png')):
        mm = re.match(r'.*/(\w+?)_(\d+)\.png$', f)
        if not mm or mm.group(1) not in grids_of(char): continue
        g = mm.group(1)
        if grids and g not in grids: continue
        cells_p = f'raw_anim/{char}/gen/{g}_cells.json'
        cells = json.load(open(cells_p))
        for c in cells:
            key = f'{os.path.basename(f)}:{c["pose"]}'
            if key in recs and recs[key].get('v') == QV: continue
            e = A.extract(char, f, cells, c['pose'])
            if e is None:
                recs[key] = dict(v=QV, file=f, cells=cells_p, pose=c['pose'], m=None, bad=['empty'], score=-9); continue
            art = A.to_art(e)
            m = A.metrics(char, e, art)
            bad = judge(m, char)
            recs[key] = dict(v=QV, file=f, cells=cells_p, pose=c['pose'], m=m, bad=bad, score=round(score(m), 3))
            print(f'{key:24s} iou {m["iou"]:.2f} cover {m["cover"]:.2f} spill {m["spill"]:.2f} sc {m["scale"]} '
                  f'j {m["joints"]} {"OK" if not bad else "FAIL " + ",".join(bad)}', flush=True)
    # 每个姿势挑最佳（优先通过的）
    pick = dict(old.get('pick_manual', {}))
    by = {}
    for k, r in recs.items():
        by.setdefault(r['pose'], []).append(r)
    for pose, rs in by.items():
        if pose in pick: continue
        rs.sort(key=lambda r: (not r['bad'], r['score']), reverse=True)
        pick[pose] = rs[0]
    out = dict(old, all=recs, pick=pick, thresholds=TH)
    json.dump(out, open(qp, 'w'), ensure_ascii=False, indent=1)
    fails = {p: r['bad'] for p, r in pick.items() if r['bad']}
    n_all = len(recs); n_ok = sum(1 for r in recs.values() if not r['bad'])
    print(f'候选 {n_all}，通过 {n_ok}（{n_ok / max(n_all, 1):.0%}）；选用帧不合格：{fails or "无"}')
    return fails


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('char')
    ap.add_argument('--regen', type=int, default=0)
    ap.add_argument('--grids')
    a = ap.parse_args()
    grids = a.grids.split(',') if a.grids else None
    fails = run(a.char, grids)
    tries = {}
    while fails and a.regen:
        todo = sorted({g for g, gd in grids_of(a.char).items() if (not grids or g in grids) and any(p in fails for p in gd['poses'])})
        todo = [g for g in todo if tries.get(g, 0) < a.regen]
        if not todo: break
        for g in todo:
            tries[g] = tries.get(g, 0) + 1
            print(f'重生成 {a.char}/{g}（第 {tries[g]} 次）', flush=True)
            subprocess.run([sys.executable, os.path.join(HERE, 'genframes.py'), 'grid', a.char, g])
        fails = run(a.char, grids)
