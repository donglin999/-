#!/usr/bin/env python3
"""人物行踪表（2026-11-10 用户要求）：每个有名有姓的人，在每个进度点站在哪个场景；并查出对不上的地方。

数据来自全套自测：
- 全人物扫荡（build/selftest/<时间>/sweep/*.json 的 presence）：读各进度点存档，此刻各场景地图上站着谁；
- 扫荡和自动通关报告里的 popins：剧情站位表或台词临时摆出来的人（此刻地图上本来没有他）；
- 扫荡的 offstage：说话的人不在这个场景的地图上。

查三类问题：
1. 一人两处：同一进度点，一个人同时站在两个场景的地图上；
2. 临时出场：剧情或闲谈时把一个人摆进场景，而这一进度他在别的场景（或地图上哪儿都没有）——
   用户看到的就是“闲谈时出现、日常看不到”；
3. 隔空说话：说话的人不在场（不算主角、旁白、物件提示）。

用法：python3 tools/cast_schedule.py [自测目录] [--md 输出 md] [--json 输出 json]
不给自测目录就取 build/selftest 下最新一次；默认写 docs/cast-schedule.md。
"""
import json, os, sys, glob, argparse, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
# 场景中文名
SC = json.load(open(os.path.join(ROOT, 'game/data/runtime/sc.json')))
def scn(sid): return (SC.get(sid, {}).get('name') or sid).split(' · ')[0] if sid else '—'
# 不是人物的说话人（物件、系统提示）
NOT_PEOPLE = {'获得', '行程', '路牌', '对证记录', '旁白', '萧白', '', '？？？'}
# 进度点的说法（进度点文件名 → 玩家看得懂的时段）
POINT = {'01-prologue-done': '序章过后', '02-ye-invite': '叶家应邀', '03-relic': '看过旧物', '04-first-night': '第一夜',
         '05-morning': '第一日', '06-main-2': '第一日傍晚', '07-main-4': '第二日傍晚', '08-main-5': '第三日',
         '09-main-6': '邻村接应', '10-evidence': '邻村对证后'}
# 自动通关记的 stage（qiheChapter.stage/halfDay 或 序章/arrival）→ 时段
def stage_point(st):
    if st.startswith('序章/'): return '序章'
    s, _, h = st.partition('/')
    if s in ('days', 'opening'): return {'0': '第一日', '1': '第一日', '2': '第一日傍晚', '3': '第一日傍晚', '4': '第二日傍晚', '5': '第三日', '6': '第三日傍晚'}.get(h, '村中日常')
    return {'refuge': '邻村接应', 'escape': '离村途中', 'fire': '起火', 'mountain': '山居', 'ended': '山居', 'cultivation': '培养'}.get(s, s)


def latest():
    ds = sorted(d for d in glob.glob(os.path.join(ROOT, 'build/selftest/2*')) if os.path.isdir(os.path.join(d, 'sweep')))
    return ds[-1] if ds else None


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('run', nargs='?'); ap.add_argument('--md', default=os.path.join(ROOT, 'docs/cast-schedule.md')); ap.add_argument('--json')
    a = ap.parse_args()
    run = a.run or latest()
    if not run: sys.exit('没有找到自测目录')
    where = collections.OrderedDict()       # 时段 → 人 → set(场景)
    popins = []                              # {name, scene, point, via, key}
    talks = []
    for f in sorted(glob.glob(os.path.join(run, 'sweep', '[0-9]*.json'))):
        k = os.path.basename(f)[:-5]; pt = POINT.get(k, k)
        d = json.load(open(f))
        w = where.setdefault(pt, collections.defaultdict(set))
        for sid, ppl in (d.get('presence') or {}).items():
            for p in ppl: w[p['name']].add(sid)
        for o in d.get('offstage') or []:
            if o['who'] not in NOT_PEOPLE: talks.append({'who': o['who'], 'scene': o['scene'], 'point': pt, 'label': o['label']})
        for p in d.get('popins') or []:
            popins.append(dict(p, point=pt, src='扫荡'))
    for f in sorted(glob.glob(os.path.join(run, 'wt-*.json'))):
        d = json.load(open(f))
        for p in d.get('popins') or []:
            popins.append(dict(p, point=stage_point(p.get('stage', '')), src='通关'))
    people = sorted({n for w in where.values() for n in w} | {p['name'] for p in popins} | {t['who'] for t in talks})
    pts = list(where.keys())
    issues = []
    gathers = []   # 主线大事里众人聚齐（剧情交代过，不算问题，单列备查）
    for pt, w in where.items():
        for n, ss in w.items():
            if len(ss) > 1: issues.append(('一人两处', n, pt, '、'.join(scn(s) for s in sorted(ss)), ''))
    seen = set()
    for p in popins:
        k = (p['name'], p['scene'], p['point'], p.get('key'))
        if k in seen: continue
        seen.add(k)
        home = where.get(p['point'], {}).get(p['name'])
        if home and p['scene'] in home: continue
        if p.get('gather'):
            gathers.append((p['name'], p['point'], scn(p['scene']), p.get('key') or p.get('knot') or '')); continue
        what = ('此刻在%s' % '、'.join(scn(s) for s in home)) if home else '此刻地图上哪儿都没有他'
        issues.append(('临时出场', p['name'], p['point'], scn(p['scene']), '%s；由%s%s摆出' % (what, p.get('via', ''), ('（' + p['key'] + '）') if p.get('key') else '')))
    seen = set()
    for t in talks:
        k = (t['who'], t['scene'], t['point'])
        if k in seen: continue
        seen.add(k)
        home = where.get(t['point'], {}).get(t['who'])
        issues.append(('隔空说话', t['who'], t['point'], scn(t['scene']), ('此刻在%s；' % '、'.join(scn(s) for s in home) if home else '') + '在「%s」里说话' % t['label'].split(' / ', 1)[-1]))
    # 写 md
    L = ['# 人物行踪表', '', '状态：现行（自动生成，勿手改）　来源：`%s`' % os.path.relpath(run, ROOT), '',
         '每个有名有姓的人，在每个进度点站在哪个场景的地图上（全人物扫荡读各进度点存档实测）。“—”是这一时段地图上看不到他。',
         '改剧情、站位、人物出没条件之后，跑全套自测再跑 `python3 tools/cast_schedule.py` 重新生成；规则见 `docs/dev-conventions.md`“人物行踪”。', '',
         '| 人物 | ' + ' | '.join(pts) + ' |', '| --- |' + ' --- |' * len(pts)]
    for n in people:
        if n in NOT_PEOPLE: continue
        L.append('| %s | ' % n + ' | '.join('、'.join(scn(s) for s in sorted(where[pt].get(n, []))) or '—' for pt in pts) + ' |')
    L += ['', '## 对不上的地方（%d 条）' % len(issues), '']
    if issues:
        L += ['| 类型 | 人物 | 时段 | 场景 | 说明 |', '| --- | --- | --- | --- | --- |']
        for i in sorted(issues, key=lambda x: (x[0], x[1], x[2])): L.append('| %s | %s | %s | %s | %s |' % i)
    else:
        L.append('没有。')
    L += ['', '## 主线大事里的聚齐（%d 处，不算问题）' % len(set(gathers)), '',
          '主线大事开场会把主角带到事发地，众人在那里聚齐；演完各回这一时段该在的地方。新加大事时在剧情里交代谁为什么来。', '']
    if gathers:
        L += ['| 人物 | 时段 | 场景 | 哪一场 |', '| --- | --- | --- | --- |'] + ['| %s | %s | %s | %s |' % g for g in sorted(set(gathers))]
    os.makedirs(os.path.dirname(a.md), exist_ok=True)
    open(a.md, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    if a.json:
        json.dump({'points': pts, 'where': {pt: {n: sorted(s) for n, s in w.items()} for pt, w in where.items()}, 'issues': issues}, open(a.json, 'w'), ensure_ascii=False, indent=1)
    print('人物 %d 个、时段 %d 个，对不上 %d 条 → %s' % (len(people), len(pts), len(issues), a.md))
    return 1 if issues else 0


if __name__ == '__main__':
    sys.exit(main())
