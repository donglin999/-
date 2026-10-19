#!/usr/bin/env python3
"""设定与剧情一致性检查：以 story-atlas.json 为人物登记、consistency-rules.json 为已确认规则，扫描两个工作区的文档。

在仓库根（xiaojianghu）运行：python3 tools_docs/consistency_check.py [--out 目录] [--only 规则id,...] [--json]

检查三类：
- age：人物名后紧跟的“N岁”与登记年龄不符（低于初见年龄，或高于初见年龄 + allow_above）。
- owner-age：人物负责文档开头自述的年龄与登记不符。
- faction：人物名后紧跟“某势力 + 弟子／门人／门下／掌门／长老”，而该势力不是登记的所属势力。
- 规则：consistency-rules.json 中每条已确认规则的正则命中。
结果只是待核清单，不是结论：年龄可能是穿越前或后期年龄，势力可能是“原属”。脚本只读，不改任何文档。
"""
import argparse, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]          # xiaojianghu
BASE = ROOT.parent                                  # luotuozhuan
DESIGN = ROOT / 'docs/design'
ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
ap.add_argument('--out', help='写出 report.md 与 report.json 的目录')
ap.add_argument('--only', help='只跑这些检查（逗号分隔：age,faction 或规则 id）')
ap.add_argument('--json', action='store_true', help='标准输出打印完整 JSON')
a = ap.parse_args()
only = set(a.only.split(',')) if a.only else None
want = lambda k: only is None or k in only

atlas = json.loads((DESIGN / 'story-atlas.json').read_text())
cfg = json.loads((DESIGN / 'registry/consistency-rules.json').read_text())
chars = {c['name']: c for c in atlas['characters']}
factions = {f['id']: f for f in atlas['factions']}
fac_names = {f['name']: f['id'] for f in atlas['factions'] if f['id'] != 'independent'}
name_alt = '|'.join(sorted(map(re.escape, chars), key=len, reverse=True))

def files():
    for r in cfg['scan']['roots']:
        p = BASE / r
        for f in ([p] if p.is_file() else sorted(p.rglob('*.md')) if p.exists() else []):
            s = '/' + f.relative_to(BASE).as_posix()
            if not any(x in s for x in cfg['scan']['exclude']): yield f

def is_history(text):
    head = '\n'.join(text.split('\n')[:15])
    return any(m in head for m in cfg['scan']['history_markers'])

findings = []
def add(kind, f, i, line, m, **kw):
    s = max(0, m.start() - 30); e = min(len(line), m.end() + 30)
    findings.append({'check': kind, 'file': f.relative_to(BASE).as_posix(), 'line': i + 1,
                     'excerpt': ('…' if s else '') + line[s:e].strip() + ('…' if e < len(line) else ''), **kw})

AGE = cfg['age']; ROLE = re.compile(r'弟子|门人|门下|掌门|长老|谷主|观主|堂主')
for f in files():
    text = f.read_text(errors='ignore'); hist = is_history(text)
    for i, line in enumerate(text.split('\n')):
        if want('age') or want('faction'):
            for m in re.finditer(name_alt, line):
                c = chars[m.group(0)]; tail = line[m.end():m.end() + AGE['window']]
                cut = re.search(name_alt, tail); tail = tail[:cut.start()] if cut else tail  # 遇到下一个人名就停，避免张冠李戴
                am = re.search(r'(\d{1,2})\s*岁', tail)
                exc = am and any(e['character'] == c['name'] and e['age'] == int(am.group(1)) and re.search(e['context'], line)
                                 for e in AGE.get('context_exceptions', []))
                if want('age') and am and not exc and not (c['age'] <= int(am.group(1)) <= c['age'] + AGE['allow_above']):
                    art = re.search(AGE['art_docs']['pattern'], f.name) if AGE.get('art_docs') else None
                    add('age', f, i, line, m, history=hist, character=c['name'], registered=c['age'], found=int(am.group(1)),
                        owner='xiaojianghu/docs/design/' + c['source'], severity='info' if art else 'warn',
                        **({'exempt': AGE['art_docs']['source']} if art else {}))
                fm = re.search('(' + '|'.join(map(re.escape, fac_names)) + r')[^，。、；|]{0,4}(' + ROLE.pattern + ')', tail)
                if want('faction') and fm and fac_names[fm.group(1)] != c['faction'] and not re.search(r'原|曾|前|旧', tail[:fm.start()] or ''):
                    add('faction', f, i, line, m, history=hist, character=c['name'], registered=factions[c['faction']]['name'],
                        found=fm.group(1), owner='xiaojianghu/docs/design/' + c['source'], severity='warn')
        for r in cfg['rules']:
            if not want(r['id']) or any(x in f.name for x in r.get('exclude_files', [])): continue
            for m in re.finditer(r['pattern'], line):
                # 否定语境（“没有昼夜交替”“萧白不再是白袍”“原稿说法作废”）是在复述规则，不报
                if r.get('negation') and (re.search(r['negation'], line[max(0, m.start() - 12):m.end()]) or '作废' in line): continue
                if r.get('aggregate'):
                    agg = next((x for x in findings if x['check'] == r['id'] and x['file'] == f.relative_to(BASE).as_posix()), None)
                    if agg: agg['count'] += 1; continue
                    add(r['id'], f, i, line, m, history=hist, severity=r['severity'], owner=r['source'], count=1); continue
                add(r['id'], f, i, line, m, history=hist, severity=r['severity'], owner=r['source'])

# 负责文档自述年龄：人物负责文档开头常只写“25岁成年……”而不带人名，单独核对前 30 行第一个年龄
if want('owner-age'):
    for c in atlas['characters']:
        f = DESIGN / c['source']
        if not f.is_file() or sum(x['source'] == c['source'] for x in atlas['characters']) > 1: continue  # 多人合写的负责文档不适用
        for i, line in enumerate(f.read_text(errors='ignore').split('\n')[:30]):
            am = re.search(r'(\d{1,2})\s*岁', line)
            if not am: continue
            n = int(am.group(1))
            if not (c['age'] <= n <= c['age'] + AGE['allow_above']):
                add('owner-age', f, i, line, am, history=False, character=c['name'], registered=c['age'], found=n,
                    owner='xiaojianghu/docs/design/story-atlas.json', severity='warn')
            break

# 历史文档里的命中降为 info：它们本来就记录旧方案，只需确认页首已标历史
for x in findings:
    if x['history']: x['severity'] = 'info'
order = {'warn': 0, 'info': 1}
findings.sort(key=lambda x: (order[x['severity']], x['check'], x['file'], x['line']))
summary = {}
for x in findings:
    s = summary.setdefault(x['check'], {'warn': 0, 'info': 0, 'files': set()}); s[x['severity']] += 1; s['files'].add(x['file'])
summary = {k: {'warn': v['warn'], 'info': v['info'], 'files': len(v['files'])} for k, v in summary.items()}

if a.out:
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    json.dump({'summary': summary, 'findings': findings}, open(out / 'report.json', 'w'), ensure_ascii=False, indent=1)
    rules = {r['id']: r for r in cfg['rules']}
    title = {'age': '年龄与登记不符', 'owner-age': '负责文档年龄与登记不符', 'faction': '所属势力与登记不符'}
    md = ['# 设定与剧情一致性检查', '', '登记：`docs/design/story-atlas.json`；规则：`docs/design/registry/consistency-rules.json`。'
          '结果是待核清单，不是结论；“历史”指页首已标为历史或快照的文档。', '', '| 检查 | 需处理 | 仅提示 | 涉及文件 |', '| --- | ---: | ---: | ---: |']
    md += [f"| {title.get(k) or rules[k]['statement'][:24]}（`{k}`） | {v['warn']} | {v['info']} | {v['files']} |" for k, v in summary.items()]
    for k in summary:
        md += ['', f"## {title.get(k, k)}", '']
        if k in rules: md += [f"规则：{rules[k]['statement']}", f"出处：{rules[k]['source']}", f"处理：{rules[k]['advice']}", '']
        md += ['| 级别 | 位置 | 摘录 | 说明 |', '| --- | --- | --- | --- |']
        for x in [y for y in findings if y['check'] == k]:
            note = (f"{x['character']}：登记 {x['registered']}，此处 {x['found']}；负责文档 `{x['owner']}`" if k in title else '') \
                + (f"本文件共 {x['count']} 处，此为首处" if 'count' in x else '') + ('；美术文档，按 10-09 决定不改' if 'exempt' in x else '') + ('（历史文档）' if x['history'] else '')
            md.append(f"| {'需处理' if x['severity'] == 'warn' else '提示'} | `{x['file']}:{x['line']}` | {x['excerpt'].replace('|', '｜')} | {note} |")
    (out / 'report.md').write_text('\n'.join(md) + '\n')
print(json.dumps({'summary': summary, 'findings': findings} if a.json else {'summary': summary, 'total': len(findings)}, ensure_ascii=False))
sys.exit(0)
