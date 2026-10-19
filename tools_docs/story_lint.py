# -*- coding: utf-8 -*-
"""剧情文案自动检查（规范见 docs/design/story-writing.md）。以 xiaojianghu 目录运行：
    python3 tools_docs/story_lint.py --out <临时目录> [--scene 剧情id ...]
读三处台词：
  · 当前游戏培养模式的全部剧情（经 ../xiaojianghu-legacy-prologue/tools_scene/qihe/dump_story_lines.cjs 导出）；
  · 文档库 docs/design/scripts/*.json 里的剧本（任意层级中带 speaker 与 text 的条目，以及 stage 演出说明）；
  · 开始部分（序章＋栖河）运行台词：未迁移的从 JS 静态提取，已迁移到 ink 的读 docs/story-lines.csv；--scene opening 只看这一类。
只做能机器判断的部分；“逻辑通不通、像不像这个人说的话、是不是为了指标硬塞”要按规范第一节人工审读，本脚本给不了结论。
严重度：需处理（违反已确认的规则）／提示（可能有问题，逐条看上下文再定）。"""
from pathlib import Path
import json, re, subprocess, sys, argparse, collections

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT.parent / 'xiaojianghu-legacy-prologue'

RULES = [
    # (代号, 严重度, 说明, 正则, 只查哪些说话人 None=全部)
    ('CHAPTER', '需处理', '剧情里不说“第几章”，只分开始／培养／游历／终局（用户 2026-10-10）', re.compile(r'第[一二三四五六七八九十百0-9]+章'), None),
    ('PLACEHOLDER', '需处理', '占位或未写完的句子', re.compile(r'TODO|XXX|待补|占位|\?\?\?|？？？'), None),
    ('MECHANIC', '需处理', '台词里出现游戏数值或系统用语（关系值、好感、收益、体力值、熟练度、解锁……），人物不会这么说话', re.compile(r'好感|关系值|好感度|心情值|体力值|收益|加成|熟练度|经验值|解锁|结算|属性点|技能点|任务栏|副本|玩家|存档'), None),
    ('MODERN', '提示', '现代或网络用语。萧白心里话可以有现代人的想法，但不用热梗、游戏词；其他人一律不用', re.compile(r'OK|ok|Ok|哈喽|拜拜|打卡|绩效|效率|内卷|躺平|yyds|emo|bug|BUG|吐槽|靠谱|搞定|牛逼|厉害了|666|NPC|系统提示|刷新|上线|下线|老铁|小伙伴|颜值|高能'), None),
    ('RULE_ECHO', '提示', '像把设计约束原样塞进台词（codex 稿常见）：“亲见／听说分开记”“不写成一定能办成”“注明来源”“交接”“边界”……一场里出现多次就要怀疑是在凑指标', re.compile(r'亲见|听说的|分开记|分两栏|各记一栏|不写成|不承诺|注明|来源|署名|核验|核实|交接|边界|责任|知情|同意|许可|留白'), None),
    ('MINOR_ROMANCE', '需处理', '萧白满十八岁（第二年正月）之前不写暧昧（用户 2026-10-09）', re.compile(r'心动|脸红心跳|喜欢你|心上人|夫君|娘子|亲了|吻|抱住他|抱住她|依偎|定情'), None),
    ('ACTION', '提示', '需要做动画的动作描写。当前技术做不了剧情动画（用户 2026-10-16），改用对白、静态表情、字幕卡或结果画面表现', re.compile(r'翻身|跃起|飞身|一跃|跳上|跳下|翻墙|追逐|奔跑|扑倒|摔倒|倒地|拥抱|抱起|背起|扶起|搀|挥剑|拔剑|出刀|一掌|一拳打|过招|缠斗|策马|骑马|划船|撑船而去|转身离去|走上前|走过来|跑过来'), None),
    # ── AI 味规则（剧情三道关·第三关，2026-10-19）。先全部作“提示”，用户给出好坏样例后再按反例库收紧；反例库见 docs/design/story-ai-patterns.md ──
    ('AI_NOTBUT', '提示', 'AI 味：“不是……而是／是……”句式，像在纠正读者；真人多半直接说结论', re.compile(r'不是[^，。！？；]{1,14}[，,]\s*(而)?是'), None),
    ('AI_SUMMARY', '提示', 'AI 味：总结腔开头（说到底／其实／毕竟／归根结底／总之／说白了）', re.compile(r'(^|[，。！？])(说到底|其实|毕竟|归根结底|总之|说白了|换句话说)'), None),
    ('AI_MOTIVE', '提示', 'AI 味：人物主动解释自己的动机（我之所以／为的是／我只是想……），真人很少自报动机', re.compile(r'我之所以|为的就是|为的是|我这么做是|我只是想|我只不过是想'), None),
    ('AI_STOCK', '提示', 'AI 味：套话（要不是你我就……／这份恩情／大恩不言谢／我欠你一条命）', re.compile(r'要不是你.{0,6}(就|早)|这份恩情|大恩不言谢|欠你一条命|交代在这儿'), None),
    ('AI_TRIAD', '提示', 'AI 味：同一个字起头的三连排比', re.compile(r'(不|没|要|会|能)[^，。！？、]{1,6}[，、]\1[^，。！？、]{1,6}[，、]\1'), None),
    ('AI_ANTITHESIS', '提示', 'AI 味：“X 是 X，Y 是 Y”对仗', re.compile(r'([\u4e00-\u9fff]{1,4})是\1[，,]\s*([\u4e00-\u9fff]{1,4})是\2'), None),
    ('AI_THEME', '提示', 'AI 味：人物把主题说出口（承担、责任、成长、守护、信任、选择、命运……），留给事情本身去表现', re.compile(r'承担|责任|成长|守护|信任|命运|初心|意义'), None),
]
LONG_WARN, LONG_ERR = 40, 64


def game_lines():
    js = GAME / 'tools_scene/qihe/dump_story_lines.cjs'
    if not js.exists(): return []
    r = subprocess.run(['node', str(js)], cwd=GAME, capture_output=True, text=True)
    if r.returncode: print('导出培养剧情失败：', r.stderr[:400], file=sys.stderr); return []
    rows = json.loads(r.stdout)['lines']
    for x in rows: x['file'] = 'xiaojianghu-legacy-prologue/js（' + x['source'] + '）'
    return rows


def doc_lines():
    rows = []
    for f in sorted((ROOT / 'docs/design/scripts').glob('*.json')):
        if 'voice' in f.name: continue   # 配音计划是剧本的摘抄，重复检查没有意义
        try: data = json.loads(f.read_text(encoding='utf-8'))
        except Exception: continue
        def walk(o, scene=None, title=None):
            if isinstance(o, dict):
                scene = o.get('id', scene) if 'blocks' in o or 'lines' in o else scene
                title = o.get('title', title)
                if isinstance(o.get('text'), str) and 'speaker' in o:
                    rows.append(dict(file='xiaojianghu/' + f.relative_to(ROOT).as_posix(), source='docs', scene=scene, title=title, part='line', speaker=o.get('speaker'), text=o['text'], mood=o.get('emotion_api'), window=None))
                if isinstance(o.get('stage'), str):
                    rows.append(dict(file='xiaojianghu/' + f.relative_to(ROOT).as_posix(), source='docs', scene=scene, title=title, part='stage', speaker='（演出说明）', text=o['stage'], mood=None, window=None))
                for v in o.values(): walk(v, scene, title)
            elif isinstance(o, list):
                for v in o: walk(v, scene, title)
        walk(data)
    return rows


OPENING_JS = ['qihe-chapter.js', 'qihe-map-trial.js', 'qihe-representatives.js', 'qihe-outsiders.js', 'qihe-expansion.js', 'qihe-prologue-actions.js',
              'prologue-arrival.js', 'prologue-water.js', 'qihe-fire-cinematic.js']
CALL = re.compile(r"""(?:\bline|\bsay)\(\s*(['"])([^'"\\]{0,12})\1\s*,\s*(['"])((?:(?!\3)[^\\]|\\.)*)\3""")
CALL3 = re.compile(r"""\bline\(\s*'[^']*'\s*,\s*(['"])([^'"\\]{0,12})\1\s*,\s*(['"])((?:(?!\3)[^\\]|\\.)*)\3""")   # line('编号','说话人','台词')
PAIR = re.compile(r"""\[\s*(['"])([\u4e00-\u9fff·]{1,8}|)\1\s*,\s*(['"])((?:(?!\3)[^\\]|\\.)*)\3""")


def opening_lines():
    """开始部分（序章＋栖河）运行台词：静态提取 line()/say() 调用与 ['说话人','台词'] 数组。说话人为空的记为（无说话人）。"""
    rows = []
    for name in OPENING_JS:
        f = GAME / 'js' / name
        if not f.exists(): continue
        t = f.read_text(encoding='utf-8'); seen = set()
        for pat in (CALL3, CALL, PAIR):
            for m in pat.finditer(t):
                sp, text = m.group(2), m.group(4)
                if not re.search(r'[\u4e00-\u9fff]', text) or (m.start(), text) in seen: continue
                if sp and not re.fullmatch(r'[\u4e00-\u9fff·]{1,8}', sp): continue
                seen.add((m.start(), text)); ln = t.count('\n', 0, m.start()) + 1
                rows.append(dict(file=f'xiaojianghu-legacy-prologue/js/{name}:{ln}', source='opening', scene='opening:' + name.replace('.js', ''), title='开始部分',
                                 part='line', speaker=sp or '（无说话人）', text=text.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n'), mood=None, window=None))
    rows += ink_lines()
    return rows


def ink_lines():
    """已迁移到 ink 的剧本台词（2026-10-18 起，迁移方案 docs/design/story-source-migration.md）：读构建生成的逐句总表
    ../xiaojianghu-legacy-prologue/docs/story-lines.csv（由 tools_story/build_ink.cjs 从 story/**/*.ink 导出）。字幕（说话人为空）记为（无说话人）。"""
    import csv
    f = GAME / 'docs' / 'story-lines.csv'
    if not f.exists(): return []
    rows = []
    with f.open(encoding='utf-8-sig', newline='') as fh:
        for r in csv.DictReader(fh):
            rows.append(dict(file=f"xiaojianghu-legacy-prologue/story/{r['剧本']}（{r['编号']}）", source='opening', scene='opening:ink:' + r['场景'], title='开始部分',
                             part='line', speaker=r['说话人'] or '（无说话人）', text=r['台词'], mood=r['表情'] or None, window=None))
    return rows


def lint(rows):
    found = []
    def add(code, sev, msg, x): found.append(dict(code=code, severity=sev, msg=msg, file=x.get('file'), scene=x.get('scene'), title=x.get('title'), speaker=x.get('speaker'), text=x.get('text')))
    for x in rows:
        t = x.get('text') or ''; sp = x.get('speaker') or ''
        if sp == '（无说话人）':
            add('NO_SPEAKER', '提示', '没有说话人的句子：是旁白就改成人物台词或字幕卡，是系统提示（存档、操作说明）可保留', x)
        if sp in ('narrator', '旁白'):
            add('NARRATOR', '需处理', '旁白句。剧情不用旁白，改成人物台词、心里话或字幕卡（用户 2026-10-08）', x)
        if x.get('part') not in ('stage',) and sp not in ('title',):
            n = len(re.sub(r'[（）()]', '', t))
            if n > LONG_ERR: add('LONG', '需处理', f'一句 {n} 字，超过 {LONG_ERR}；拆成两句或删掉解释性的半句', x)
            elif n > LONG_WARN: add('LONG', '提示', f'一句 {n} 字，超过 {LONG_WARN}', x)
        for code, sev, msg, pat, only in RULES:
            if only and sp not in only: continue
            if code == 'ACTION' and x.get('part') not in ('stage',) and not re.search(r'[（(【\[]', t): continue   # 人物嘴里说起动作不算，只看演出说明和括号里的动作
            if code == 'MINOR_ROMANCE' and not (x.get('window') and x['window'][1] < 60): continue
            if code == 'MODERN' and sp in ('hero', '萧白') and t.startswith(('（', '(')): sev2 = '提示'
            else: sev2 = sev
            if pat.search(t): add(code, sev2, msg, x)
    # 一场戏里“设计约束式”句子扎堆
    by = collections.defaultdict(list)
    for f in found:
        if f['code'] == 'RULE_ECHO': by[(f['file'], f['scene'])].append(f)
    keep = set()
    for k, v in by.items():
        if len(v) >= 3:
            for f in v: f['severity'] = '需处理'; f['msg'] += f'（这场里有 {len(v)} 句，请按规范第一节重写）'
            keep.update(id(f) for f in v)
    # 表情一句一换：同一说话人连续三句都点明了不同的表情
    scenes = collections.defaultdict(list)
    for x in rows:
        if x.get('source') != 'docs': scenes[(x['file'], x['scene'], x.get('part'), x.get('branch'))].append(x)
    for k, seq in scenes.items():
        last = {}; streak = collections.Counter()
        for x in seq:
            sp, m = x.get('speaker'), x.get('mood')
            if not m: continue
            if sp in last and last[sp] != m: streak[sp] += 1
            else: streak[sp] = 0
            last[sp] = m
            if streak[sp] == 2: add('MOOD_CHURN', '提示', '同一个人连着三句换表情；表情只在情绪转折处换（用户 2026-10-11）', x)
    # AI 味：同一个人连着说三句以上（心里话不算），多半是在替编剧讲解
    for k, seq in scenes.items():
        run, prev = 0, None
        for x in seq:
            sp = x.get('speaker'); inner = (x.get('text') or '').startswith(('（', '('))
            if sp == prev and not inner: run += 1
            else: run = 0 if inner else 1
            prev = sp if not inner else prev
            if run == 3: add('AI_MONOLOGUE', '提示', 'AI 味：同一个人连着说了三句，像在讲解；拆给对方接话，或删掉解释的那句', x)
    # 重复句
    where = collections.defaultdict(set)
    for x in rows:
        t = (x.get('text') or '').strip()
        # 只比同一来源内部（同一份剧本文件，或游戏里的同一类剧情）；文档库的剧本被游戏和别的文档整段摘抄，跨来源重复不算
        if len(t) >= 8 and x.get('speaker') != 'title': where[(x.get('file').split(':')[0], t)].add(x.get('scene') if x.get('source') != 'opening' else x.get('file'))
    for x in rows:
        k = (x.get('file').split(':')[0], (x.get('text') or '').strip())
        if len(where.get(k, ())) >= 2: add('REPEAT', '提示', f'同一句出现在 {len(where[k])} 场戏里', x); where[k] = set()
    return found


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--scene', nargs='*'); a = ap.parse_args()
    rows = game_lines() + doc_lines() + opening_lines()
    if a.scene: rows = [x for x in rows if x.get('scene') in a.scene or ('opening' in a.scene and x.get('source') == 'opening')]
    found = lint(rows); out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    (out / 'story-lint.json').write_text(json.dumps(found, ensure_ascii=False, indent=1), encoding='utf-8')
    lines = ['# 剧情文案自动检查', '', f'检查台词 {len(rows)} 条；需处理 {sum(f["severity"] == "需处理" for f in found)} 条，提示 {sum(f["severity"] == "提示" for f in found)} 条。', '',
             '自动检查只覆盖能机器判断的部分；逻辑、动机、人物口吻请按 docs/design/story-writing.md 第一节人工审读。', '']
    for sev in ('需处理', '提示'):
        group = [f for f in found if f['severity'] == sev]
        lines += [f'## {sev}（{len(group)}）', '']
        for code, items in sorted(collections.Counter(f['code'] for f in group).items()):
            lines.append(f'### {code} · {items} 条 · ' + next(f['msg'] for f in group if f['code'] == code).split('（这场')[0]); lines.append('')
            for f in [f for f in group if f['code'] == code][:200]:
                lines.append(f"- `{f['scene']}`《{f['title'] or ''}》{f['speaker']}：{f['text']}  ← {f['file']}")
            lines.append('')
    (out / 'report.md').write_text('\n'.join(lines), encoding='utf-8')
    print(json.dumps({'lines': len(rows), '需处理': sum(f['severity'] == '需处理' for f in found), '提示': sum(f['severity'] == '提示' for f in found), 'report': str(out / 'report.md')}, ensure_ascii=False))


if __name__ == '__main__': main()
