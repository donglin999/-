#!/usr/bin/env python3
"""试玩审查（2026-11-09，说明见 docs/playtest-review.md）：按问题类型清单看画面、读剧本，找“跑得通但玩起来不对”的问题。
  python3 tools/playtest_review.py capture [--out 目录]          截图：每个场景按镜头铺满整张地图（第一夜、村中日常各一套）＋截图对比用例里的界面页
  python3 tools/playtest_review.py review  [--run 目录] [--jobs 3] [--batch 4] [--only 场景,…]
                                                                 看图：分批交给本机命令行 Claude Code（claude -p，Opus），按清单报问题
  python3 tools/playtest_review.py story <ink 文件…> [--run 目录]  读剧本：剧本全文交给命令行 Claude Code，按 T2、T9、T10 读
输出 build/playtest/<时间>/：shots/、shots.json、findings.json、report.md。cc 报的问题须主会话逐条复核（误报写原因）。"""
import sys, os, json, math, subprocess, argparse, re, time, glob
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.join(ROOT, 'game'); DOC = os.path.join(ROOT, 'docs/playtest-review.md')
TS = 40; VIEW = (960, 540)   # 基准视口里一屏看到的世界像素
CLAUDE = ['claude', '-p', '--model', 'claude-opus-5-5', '--allowedTools', 'Read']
ENV = {k: os.environ[k] for k in ('HOME', 'PATH', 'USER') if k in os.environ}; ENV['TERM'] = 'dumb'   # 不带桌面端的代理变量，走本机 ~/.claude/settings.json

def checklist() -> str:
    t = open(DOC, encoding='utf-8').read()
    a = t.index('## 一、问题类型'); b = t.index('## 二、流程')
    return t[a:b].strip()

def latest(base):
    runs = sorted(glob.glob(os.path.join(base, '20*')))
    return runs[-1] if runs else None

# ───────── 采集 ─────────
def scene_sets():
    sc = json.load(open(os.path.join(GAME, 'data/runtime/sc.json'), encoding='utf-8'))
    cases = json.load(open(os.path.join(ROOT, 'tests/shots/cases.json'), encoding='utf-8'))
    out = []
    for c in cases:
        a = c.get('args', {})
        if 'scene' in a and not c.get('keys'): out.append((a['scene'], dict(a), c.get('note', '')))
    # 第一夜（序章过后、村中日常之前）的村心
    out.append(('qihe_trial', {'scene': 'qihe_trial', 'stage': 'done'}, '栖河村（序章过后、村中日常之前）'))
    out.append(('qihe_trial', {'scene': 'qihe_trial', 'stage': 'done', 'chapter': 'days,2'}, '栖河村（村中日常第二个半日）'))
    res = []; seen = set()
    for sid, args, note in out:
        s = sc.get(sid)
        if not s: continue
        W, H = (s.get('gw') or 48) * TS, (s.get('gh') or 27) * TS
        cols, rows = max(1, math.ceil(W / VIEW[0])), max(1, math.ceil(H / VIEW[1]))
        for r in range(rows):
            for c in range(cols):
                x = VIEW[0] / 2 + (W - VIEW[0]) * (c / (cols - 1) if cols > 1 else 0.5)
                y = VIEW[1] / 2 + (H - VIEW[1]) * (r / (rows - 1) if rows > 1 else 0.5)
                a = dict(args); a['at'] = '%d,%d' % (x, y); a['hide-player'] = '1'   # 镜头跟着主角，主角会被放到屋顶上，藏起来
                tag = 'chapter' in args and 'days' or ('pre' if sid == 'qihe_trial' else 'base')
                if f'{sid}-{tag}-r{r}c{c}' in seen: continue
                seen.add(f'{sid}-{tag}-r{r}c{c}')
                res.append({'name': f'{sid}-{tag}-r{r}c{c}', 'args': a, 'ms': 1800, 'note': f'{note}（铺图第 {r + 1} 行第 {c + 1} 列；主角已藏起，画面里没有主角）'})
    for c in cases:
        if 'scene' not in c.get('args', {}) and not c['name'].startswith('battle') and c['name'] != 'title' and not c.get('keys'):
            res.append({'name': c['name'], 'args': c.get('args', {}), 'ms': c.get('ms', 1800), 'note': c.get('note', ''), **({'keys': c['keys']} if 'keys' in c else {})})
    return res

def capture(a):
    run = a.out or os.path.join(ROOT, 'build/playtest', time.strftime('%Y%m%d-%H%M%S'))
    shots = os.path.join(run, 'shots'); os.makedirs(shots, exist_ok=True)
    lst = scene_sets()
    for x in lst: x['out'] = os.path.join(shots, x['name'] + '.png')
    lp = os.path.join(run, '_list.json')
    json.dump([{k: v for k, v in x.items() if k in ('args', 'out', 'ms', 'keys')} for x in lst], open(lp, 'w'), ensure_ascii=False)
    r = subprocess.run([os.path.join(HERE, 'gd_bg.sh'), '--resolution', '1280x720', '--', '--shots=' + lp], capture_output=True, text=True, timeout=1800)
    open(os.path.join(run, '_godot.log'), 'w').write(r.stdout + r.stderr)
    ok = [x for x in lst if os.path.exists(x['out'])]
    json.dump(ok, open(os.path.join(run, 'shots.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'截图 {len(ok)}／{len(lst)} 张 → {run}')
    return run

# ───────── 看图 ─────────
PROMPT = """你在做武侠像素 RPG《小江湖》的试玩审查。下面是问题类型清单（T1～T10）。用 Read 工具逐张看这几张游戏截图（1280×720，左上角是人物和任务追踪栏，右上角是菜单按钮，底部是操作提示条）：
{files}
每张图的说明：
{notes}

只报你在图里确实看得见的问题，按清单归类；看不出问题就不报，不要为了凑数报。地图截图是按镜头铺满整张地图截的，相邻两张会有重叠，同一个问题只在一张里报。HUD（左上人物框、任务栏、右上菜单图标、底部操作提示）每张都一样，只在第一张里看。
只输出一个 JSON 数组，不要别的文字。每项：{{"image": "文件名", "type": "T几", "where": "画面里的位置（如左下、客栈门口的木架旁）", "problem": "一句话说哪里不对", "severity": "高/中/低"}}。

{checklist}"""

def _cc(prompt, cwd):
    r = subprocess.run(CLAUDE + ['--add-dir', cwd], input=prompt, capture_output=True, text=True, env=ENV, cwd=cwd, timeout=900)
    return r.stdout

def _json_list(txt):
    m = re.search(r'\[.*\]', txt, re.S)
    if not m: return None
    try: return json.loads(m.group(0))
    except Exception: return None

def review(a):
    run = a.run or latest(os.path.join(ROOT, 'build/playtest'))
    if not run: sys.exit('先跑 capture')
    shots = json.load(open(os.path.join(run, 'shots.json'), encoding='utf-8'))
    if a.only: shots = [s for s in shots if any(s['name'].startswith(o) for o in a.only.split(','))]
    cl = checklist()
    batches = [shots[i:i + a.batch] for i in range(0, len(shots), a.batch)]
    def one(b):
        files = '\n'.join(s['out'] for s in b)
        notes = '\n'.join(f"- {os.path.basename(s['out'])}：{s.get('note', '')}" for s in b)
        raw = _cc(PROMPT.format(files=files, notes=notes, checklist=cl), run)
        got = _json_list(raw)
        return {'images': [os.path.basename(s['out']) for s in b], 'findings': got if got is not None else [], 'raw': raw if got is None else ''}
    with ThreadPoolExecutor(a.jobs) as ex: res = list(ex.map(one, batches))
    finds = [f for r in res for f in r['findings']]
    bad = [r for r in res if r['raw']]
    json.dump({'findings': finds, 'unparsed': bad}, open(os.path.join(run, 'findings.json'), 'w'), ensure_ascii=False, indent=1)
    write_report(run, finds, bad)
    print(f'看图 {len(shots)} 张、{len(batches)} 批，报了 {len(finds)} 条（{len(bad)} 批没解析出来）→ {run}/report.md')

def story(a):
    run = a.run or os.path.join(ROOT, 'build/playtest', time.strftime('%Y%m%d-%H%M%S'))
    os.makedirs(run, exist_ok=True)
    cl = checklist()
    texts = '\n\n'.join(f'===== {f} =====\n' + open(f, encoding='utf-8').read() for f in a.files)
    p = ('你在做武侠 RPG《小江湖》的剧情试玩审查。下面是问题类型清单，重点按 T2（人物与时空连续）、T9（剧情动机与过渡）、T10（剧情与玩法脱节）读剧本（ink 格式，“人名：台词”，[ ] 里是选项，~ 开头是调用游戏函数）。\n'
         '只报真问题，看不出就不报。只输出一个 JSON 数组：[{"file": "文件", "line_id": "台词的 #id，没有就空", "type": "T几", "problem": "一句话", "severity": "高/中/低"}]\n\n' + cl + '\n\n' + texts)
    raw = _cc(p, run)
    got = _json_list(raw) or []
    json.dump({'story_findings': got, 'raw': '' if got else raw}, open(os.path.join(run, 'story_findings.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'读剧本 {len(a.files)} 份，报了 {len(got)} 条 → {run}/story_findings.json')

def write_report(run, finds, bad):
    L = ['# 试玩审查报告（cc 初报，待主会话复核）', '', f'截图目录：`{run}/shots/`；问题类型见 docs/playtest-review.md。', '']
    by = {}
    for f in finds: by.setdefault(f.get('type', '?'), []).append(f)
    for t in sorted(by):
        L.append(f'## {t}（{len(by[t])} 条）'); L.append('')
        L.append('| 图 | 位置 | 问题 | 轻重 | 复核 |'); L.append('| --- | --- | --- | --- | --- |')
        for f in by[t]: L.append(f"| {f.get('image', '')} | {f.get('where', '')} | {f.get('problem', '')} | {f.get('severity', '')} |  |")
        L.append('')
    if bad: L.append(f'有 {len(bad)} 批 cc 输出没解析出 JSON，原文在 findings.json 的 unparsed。')
    open(os.path.join(run, 'report.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')

if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='试玩审查')
    sp = ap.add_subparsers(dest='cmd', required=True)
    c = sp.add_parser('capture'); c.add_argument('--out')
    r = sp.add_parser('review'); r.add_argument('--run'); r.add_argument('--jobs', type=int, default=3); r.add_argument('--batch', type=int, default=4); r.add_argument('--only')
    s = sp.add_parser('story'); s.add_argument('files', nargs='+'); s.add_argument('--run')
    a = ap.parse_args()
    {'capture': capture, 'review': review, 'story': story}[a.cmd](a)
