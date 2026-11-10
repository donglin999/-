#!/usr/bin/env python3
"""全套自测（2026-11-05）：一条命令把下面这些都跑一遍，最后给一份中文报告。
  1. 编译检查：全部脚本、着色器能载入（--checkall）
  2. 单元测试：GdUnit4（tools/gd_test.sh）
  3. 剧本全分支：每个剧本入口的每个选项分支都走到底（tools/ink_sweep.cjs）
  4. 自动通关：默认走法（台词与原版逐句比对）＋ 选最后一个、轮流选、两种随机选法 ＋ 玩家走法（沿门走、人要看得见）
  5. 全人物扫荡：自动通关沿途 10 个进度点，每个场景每个人墨印上每一项都点一遍；另跑一次“测试的测试”（故意放问题看查不查得出）
  6. 旧存档回归：tests/saves/ 下冻结的存档逐个读档、往下走一步、再存再读
  7. 截图对比：tests/shots/cases.json 的画面和基准逐像素比（窗口开在虚拟屏 QingheTest 上，不占实际屏幕）
除截图外都是无头模式，不开窗口。几项能并行的并行跑（最多 6 个 Godot 进程）。
用法：python3 tools/selftest.py [--no-shots] [--quick]
  --quick：通关只跑默认和玩家两种，扫荡只扫 3 个进度点，不截图（全套也只要 2 分钟左右，快速版约 1.7 分钟，一般直接跑全套）
报告：build/selftest/<时间>/report.md（build/selftest/latest 指向最近一次）；有问题时退出码 1。"""
import sys, os, json, subprocess, time, glob, re, shutil, argparse
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..')); GAME = os.path.join(ROOT, 'game')
GODOT = shutil.which('godot') or '/opt/homebrew/bin/godot'
NAME = re.search(r'config/name="([^"]+)"', open(os.path.join(GAME, 'project.godot'), encoding='utf-8').read()).group(1)
USER = os.path.expanduser(f'~/Library/Application Support/Godot/app_userdata/{NAME}')
STRATS = [('first', []), ('last', ['--choice=last']), ('alt', ['--choice=alt']), ('rand1', ['--choice=rand:1']), ('rand2', ['--choice=rand:2']), ('player', ['--player'])]
TIMEOUT = 900

def sh(cmd, log, timeout=TIMEOUT, cwd=ROOT):
    t0 = time.time()
    try:
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        out, code = r.stdout + r.stderr, r.returncode
    except subprocess.TimeoutExpired as e:
        out, code = (e.stdout or b'').decode(errors='replace') if isinstance(e.stdout, bytes) else (e.stdout or ''), -9
        out += f'\n【超时】{timeout} 秒没跑完\n'
    open(log, 'w').write(out)
    return code, out, time.time() - t0

def godot(args, log, timeout=TIMEOUT):
    return sh([GODOT, '--headless', '--path', GAME, '--', *args], log, timeout)

def jload(p):
    try: return json.load(open(p))
    except Exception: return None

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--no-shots', action='store_true'); ap.add_argument('--quick', action='store_true'); ap.add_argument('--for-export', action='store_true')
    a = ap.parse_args()
    run = os.path.join(ROOT, 'build/selftest', time.strftime('%Y%m%d-%H%M%S')); os.makedirs(run)
    latest = os.path.join(ROOT, 'build/selftest/latest')
    if os.path.islink(latest) or os.path.exists(latest): os.remove(latest)
    os.symlink(run, latest)
    snaps = os.path.join(run, 'snaps')
    T0 = time.time(); R = []   # 每项：{name, ok, note, issues:[...], log}
    def add(name, ok, note, issues=(), log=''):
        R.append({"name": name, "ok": ok, "note": note, "issues": list(issues), "log": os.path.relpath(log, run) if log else ''})
        print(f"  {'✓' if ok else '✗'} {name}：{note}")

    print(f'全套自测 → {run}')
    strats = [s for s in STRATS if not a.quick or s[0] in ('first', 'player')]
    jobs = {}
    with ThreadPoolExecutor(6) as ex:
        jobs['check'] = ex.submit(godot, ['--checkall'], os.path.join(run, 'checkall.log'), 300)
        jobs['unit'] = ex.submit(sh, [os.path.join(HERE, 'gd_test.sh')], os.path.join(run, 'unit.log'), 600)
        jobs['ink'] = ex.submit(sh, ['node', os.path.join(HERE, 'ink_sweep.cjs'), '--out=' + os.path.join(run, 'ink_sweep.json')], os.path.join(run, 'ink_sweep.log'), 300)
        # 分支覆盖第 3、4 层（docs/branch-coverage.md）：培养部分可达性与组合，约 1 分钟
        jobs['cov'] = ex.submit(godot, ['--cultivation=coverage', '--out=' + os.path.join(run, 'coverage')], os.path.join(run, 'coverage.log'))
        for tag, extra in strats:
            more = ['--snap=' + snaps] if tag == 'first' else []
            jobs['wt-' + tag] = ex.submit(godot, ['--walkthrough', '--fast', *extra, *more, '--report=' + os.path.join(run, f'wt-{tag}.json')], os.path.join(run, f'wt-{tag}.log'))
        saves = sorted(glob.glob(os.path.join(ROOT, 'tests/saves/*/*.json')))
        for f in saves:
            b = os.path.basename(f)[:-5]
            jobs['save-' + b] = ex.submit(godot, ['--savecheck=' + f, '--out=' + os.path.join(run, 'save', b + '.json')], os.path.join(run, 'save', b + '.log') if os.makedirs(os.path.join(run, 'save'), exist_ok=True) is None else '')
        res = {k: v.result() for k, v in jobs.items()}

    # 1 编译检查
    code, out, _ = res['check']; m = re.search(r'检查完毕 脚本 (\d+) 个 着色器 (\d+) 个 失败 (\d+) 个', out)
    add('编译检查', bool(m) and m.group(3) == '0', f'脚本 {m.group(1)} 个、着色器 {m.group(2)} 个，失败 {m.group(3)} 个' if m else '没跑完', log=os.path.join(run, 'checkall.log'))
    # 2 单元测试
    code, out, _ = res['unit']; m = re.search(r'Overall Summary: (\d+) test cases \| (\d+) errors \| (\d+) failures', re.sub(r'\x1b\[[0-9;]*m', '', out))
    add('单元测试', code == 0, f'{m.group(1)} 个，出错 {m.group(2)}、失败 {m.group(3)}' if m else '没跑完', log=os.path.join(run, 'unit.log'))
    # 3 剧本全分支
    d = jload(os.path.join(run, 'ink_sweep.json')) or {}
    add('剧本全分支', res['ink'][0] == 0, f"{d.get('knots', '?')} 个入口、{d.get('paths', '?')} 条路线、{d.get('lines', '?')} 句，错误 {len(d.get('errors', []))} 条",
        [{"kind": "剧本错误", "what": e['err'], "ctx": e['knot'] + ' ' + e.get('mode', '')} for e in d.get('errors', [])], os.path.join(run, 'ink_sweep.log'))
    # 3b 培养部分分支覆盖（可达性与组合；第 1、2 层在单元测试里）
    d = jload(os.path.join(run, 'coverage', 'report.json')) or {}
    iss = [{"kind": "走不到", "what": f"{u['id']}「{u['name']}」", "detail": u.get('needs', ''), "ctx": ""} for u in d.get('unreachable', [])]
    iss += [{"kind": "出错或卡住", "what": b['tag'], "detail": b.get('error') or b.get('stuck'), "ctx": ""} for b in d.get('bad_runs', [])]
    add('培养分支覆盖', bool(d) and d.get('ok') and res['cov'][0] == 0,
        f"{d.get('runs', '?')} 局，汉皋前事件 {d.get('events_reached', '?')}／{d.get('events_total', '?')} 走得到（豁免 {len(d.get('exempted', []))}），选项 {d.get('choices_reached', '?')}／{d.get('choices_total', '?')}" if d else '没跑完',
        iss[:20], os.path.join(run, 'coverage.log'))
    # 4 自动通关
    names = {'first': '默认走法', 'last': '总选最后一个', 'alt': '轮流选', 'rand1': '随机选（种子1）', 'rand2': '随机选（种子2）', 'player': '玩家走法'}
    for tag, _ in strats:
        d = jload(os.path.join(run, f'wt-{tag}.json')) or {}
        iss = d.get('issues', [{"kind": "没跑完", "what": "没有报告", "ctx": ""}] if not d else [])
        note = f"{d.get('lines', '?')} 句，结束时{'进了培养模式' if d.get('mode') == 'cultivation' else '没进培养模式'}，问题 {len(iss)} 条"
        if tag == 'first':
            mine = os.path.join(USER, 'walkthrough_lines.txt'); ref = os.path.join(ROOT, 'docs/review/walkthrough-web-lines.txt')
            a1 = open(mine, encoding='utf-8').read().strip().split('\n') if os.path.exists(mine) else []
            a2 = open(ref, encoding='utf-8').read().strip().split('\n')
            same = a1 == a2
            note += f"；台词与原版{'逐句一致' if same else '不一致'}（{len(a1)}／{len(a2)} 句）"
            if not same:
                k = next((i for i, (x, y) in enumerate(zip(a1, a2)) if x != y), min(len(a1), len(a2)))
                iss = iss + [{"kind": "台词与原版不一致", "what": f"第 {k + 1} 句起不同", "detail": f"Godot：{a1[k] if k < len(a1) else '（没了）'}｜原版：{a2[k] if k < len(a2) else '（没了）'}", "ctx": ""}]
        add('自动通关·' + names[tag], not iss and res['wt-' + tag][0] == 0, note, iss, os.path.join(run, f'wt-{tag}.log'))
    # 5 全人物扫荡（用这次默认通关留下的进度点）
    ps = sorted(glob.glob(os.path.join(snaps, '*.json')))
    if a.quick: ps = [p for p in ps if re.search(r'/(01|05|09)-', p)]
    shots_job = None
    with ThreadPoolExecutor(6) as ex:
        if not a.no_shots and not a.quick:
            shots_job = ex.submit(sh, [sys.executable, os.path.join(HERE, 'shot_regress.py'), '--out', os.path.join(run, 'shots')], os.path.join(run, 'shots.log'), 900)
        # 2026-11-10 江湖菜单扫荡：七页每个可点的东西点一遍、浮签悬停一遍、翻页换人 Esc 各按一遍，查报错、浮签空、文字越界
        os.makedirs(os.path.join(run, 'menu'), exist_ok=True)
        msw = {os.path.basename(p)[:-5]: ex.submit(godot, ['--menu-sweep=' + p, '--out=' + os.path.join(run, 'menu', os.path.basename(p))], os.path.join(run, 'menu-' + os.path.basename(p)[:-5] + '.log'))
               for p in ps if re.search(r'/(01|06|09)-', p)}
        sw = {os.path.basename(p)[:-5]: ex.submit(godot, ['--sweep-npc=' + p, '--out=' + os.path.join(run, 'sweep', os.path.basename(p))], os.path.join(run, 'sweep-' + os.path.basename(p)[:-5] + '.log')) for p in ps if os.makedirs(os.path.join(run, 'sweep'), exist_ok=True) is None}
        if ps:
            sw['_selfcheck'] = ex.submit(godot, ['--sweep-npc=' + ps[min(5, len(ps) - 1)], '--selfcheck', '--out=' + os.path.join(run, 'sweep', '_selfcheck.json')], os.path.join(run, 'sweep-selfcheck.log'))
        swr = {k: v.result() for k, v in sw.items()}
        mswr = {k: v.result() for k, v in msw.items()}
        shots_res = shots_job.result() if shots_job else None
    if not ps:
        add('全人物扫荡', False, '默认自动通关没留下进度点，扫不了')
    else:
        tot = {"runs": 0, "people": 0, "scenes": 0}; iss = []
        for k in sorted(swr):
            if k == '_selfcheck': continue
            d = jload(os.path.join(run, 'sweep', k + '.json')) or {"issues": [{"kind": "没跑完", "what": k, "ctx": ""}]}
            for x in tot: tot[x] += d.get('stats', {}).get(x, 0)
            iss += [dict(i, ctx=f"[{k}] " + i.get('ctx', '')) for i in d.get('issues', [])]
        add('全人物扫荡', not iss, f"{len(swr) - ('_selfcheck' in swr)} 个进度点、{tot['scenes']} 场景次、{tot['people']} 人次、{tot['runs']} 次交互，问题 {len(iss)} 条", iss[:200])
        # 2026-11-10 人物行踪表：用这次扫荡和自动通关的实测数据重新生成 docs/cast-schedule.md（一人两处、临时出场、隔空说话）
        if not a.quick:
            cs = subprocess.run([sys.executable, os.path.join(HERE, 'cast_schedule.py'), run], capture_output=True, text=True)
            add('人物行踪表', cs.returncode == 0, (cs.stdout.strip().splitlines() or ['没跑出来'])[-1] + '（详见 docs/cast-schedule.md）')
        mt = {"clicks": 0, "tips": 0, "keys": 0, "pages": 0}; miss = []
        for k in sorted(mswr):
            d = jload(os.path.join(run, 'menu', k + '.json')) or {"issues": [{"kind": "没跑完", "what": k, "ctx": ""}]}
            for x in mt: mt[x] += d.get('stats', {}).get(x, 0)
            miss += [dict(i, ctx=f"[{k}] " + i.get('ctx', '')) for i in d.get('issues', [])]
        add('江湖菜单扫荡', not miss, f"{len(mswr)} 个进度点、{mt['pages']} 页次、点了 {mt['clicks']} 下、浮签 {mt['tips']} 个、按键 {mt['keys']} 次，问题 {len(miss)} 条", miss[:200])
        sc = jload(os.path.join(run, 'sweep', '_selfcheck.json'))
        add('扫荡自检（测试的测试）', sc is not None and not sc.get('issues') and swr['_selfcheck'][0] == 0, '故意放的“未移植、报错、卡住”三样都查出来了' if sc is not None and not sc.get('issues') else '没把故意放的问题都查出来——扫荡本身可能坏了', log=os.path.join(run, 'sweep-selfcheck.log'))
    # 6 旧存档回归
    iss = []; n_ok = 0
    for f in saves:
        b = os.path.basename(f)[:-5]; d = jload(os.path.join(run, 'save', b + '.json'))
        if d is None: iss.append({"kind": "没跑完", "what": b, "ctx": ""}); continue
        if not d['issues']: n_ok += 1
        iss += [dict(i, ctx=f"[{b[-17:]}] " + i.get('ctx', '')) for i in d['issues']]
    add('旧存档回归', not iss, f'{len(saves)} 份存档，{n_ok} 份全过', iss)
    # 7 截图对比
    if shots_res is not None:
        d = jload(os.path.join(run, 'shots', 'report.json')) or {}
        rows = d.get('rows', [])
        bad = [r for r in rows if r['state'] != '一致' and r['state'] != '没有基准']
        add('截图对比（虚拟屏）', shots_res[0] == 0 and rows != [], f"{len(rows)} 张，变了或没拍到 {len(bad)} 张",
            [{"kind": "画面变了" if r['state'] == '变了' else r['state'], "what": f"{r['name']}（{r.get('note', '')}）", "detail": f"变化 {r.get('changed', 0):.1%}，门槛 {r.get('limit', 0):.1%}；对比图 shots/diff-{r['name']}.png", "ctx": ""} for r in bad],
            os.path.join(run, 'shots.log'))
    elif not a.quick:
        add('截图对比（虚拟屏）', True, '这次没跑（--no-shots）')

    # 报告
    ok = all(r['ok'] for r in R)
    dur = time.time() - T0
    L = [f'# 全套自测报告', '', f'时间：{time.strftime("%Y-%m-%d %H:%M")}　用时：{dur / 60:.1f} 分钟　结论：**{"全部通过" if ok else "有问题"}**', '',
         '| 项目 | 结果 | 说明 |', '| --- | --- | --- |']
    for r in R: L.append(f"| {r['name']} | {'通过' if r['ok'] else '**没过**'} | {r['note']} |")
    for r in R:
        if r['issues']:
            L += ['', f"## {r['name']}：问题 {len(r['issues'])} 条", '']
            for i in r['issues'][:60]:
                L.append(f"- 【{i.get('kind', '')}】{i.get('what', '')}" + (f"｜{i['detail']}" if i.get('detail') else '') + (f"（{i['ctx']}）" if i.get('ctx') else ''))
            if len(r['issues']) > 60: L.append(f"- ……另有 {len(r['issues']) - 60} 条，见 report.json")
    L += ['', '日志都在本目录：各项的 .log、各进度点扫荡 sweep/、存档回归 save/、截图 shots/。']
    open(os.path.join(run, 'report.md'), 'w').write('\n'.join(L) + '\n')
    json.dump({"ok": ok, "minutes": round(dur / 60, 1), "items": R}, open(os.path.join(run, 'report.json'), 'w'), ensure_ascii=False, indent=1)
    # 测试留下的存档清掉（walkthrough_*、selftest_*），不碰用户自己的
    for p in glob.glob(os.path.join(USER, 'saves', 'selftest_*.json')): os.remove(p)
    print(f"\n全套自测{'全部通过' if ok else '有问题'}，用时 {dur / 60:.1f} 分钟 → {os.path.join(run, 'report.md')}")
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main())
