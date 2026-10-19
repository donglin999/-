# -*- coding: utf-8 -*-
"""文档冲突检查（2026-10-19，规则 R-文档-02）。在任意目录运行：
    python3 xiaojianghu/tools_docs/check_docs.py                 # 检查，有问题返回非 0
    python3 xiaojianghu/tools_docs/check_docs.py --approve-rules # 用户批准规则改动后，登记规则指纹
    python3 xiaojianghu/tools_docs/check_docs.py --rebase-links  # 把当前死链记为基线（只在清理死链后用）

检查四项：
1. 规则指纹：docs/rules/rules.json 改了但没经用户批准（未 --approve-rules）→ 失败。
2. 过时说法：现行文档里出现规则 stale 正则（已废止的旧说法）→ 失败。docs/updates、archive、_attic、art_sources、review（历史产出记录）不查；
   命中处前 16 字内有“不得、不许、不能、禁止、废止、改为”等词，或命中处在引号“”里，视为在讲禁令或引用旧说法，不算。
3. 死链：markdown 链接指向不存在的文件或 _attic → 超出基线的新死链失败，基线内的只计数。
4. 状态：现行文档页首（frontmatter 之后前 16 行）没写“状态：现行／历史／草稿”的 → 失败（2026-10-19 起）。
同时重新生成 docs/rules/规则登记表.md。"""
from pathlib import Path
import hashlib, json, re, sys

ROOT = Path(__file__).resolve().parents[2]
LIB = ROOT / 'xiaojianghu'
RULES_DIR = LIB / 'docs' / 'rules'
RULES = RULES_DIR / 'rules.json'
LOCK = RULES_DIR / 'rules.lock'
LINK_BASE = RULES_DIR / 'deadlinks-baseline.json'
TABLE = RULES_DIR / '规则登记表.md'
SKIP_DIRS = {'node_modules', '_attic', 'archive', 'dist', '.git', '.wrangler', 'updates', '_已合并', 'approved', 'art_sources', 'review', 'story-routes'}
NEG = re.compile(r'不得|不许|不要|不能|禁止|废止|作废|改为|改成|不再|旧说法|旧源|旧做法|已停用|曾经|过去')
LINK = re.compile(r'\]\(([^)\s]+)\)')
STATUS = re.compile(r'状态[：:]\s*\**\s*(现行|历史|草稿)')


def docs():
    out = [ROOT / 'CLAUDE.md', ROOT / 'AGENTS.md']
    for base in (LIB, ROOT / 'xiaojianghu-legacy-prologue', ROOT / '.claude'):
        for p in base.rglob('*.md'):
            rel = p.relative_to(ROOT).parts
            if SKIP_DIRS & set(rel): continue
            out.append(p)
    return [p for p in out if p.exists() and p != TABLE]


def fingerprint(text):
    return hashlib.sha256(json.dumps(json.loads(text), ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def render(rules):
    md = ['# 规则登记表', '', '> 由 `tools_docs/check_docs.py` 从 `rules.json` 生成，不要手改。改规则须用户批准（R-文档-02）。', '',
          '其他文档引用规则时写编号，例如“生图源见 R-生图-01”，不再复述正文。', '']
    area = None
    for r in rules:
        if r['area'] != area:
            area = r['area']; md += [f'## {area}', '', '| 编号 | 规则 | 范围 | 出处 | 状态 |', '|---|---|---|---|---|']
        s = r['source']; src = f"{s['date']}｜“{s['quote']}”｜{s['doc']}"
        st = r['status'] + (f"（取代 {', '.join(r['supersedes'])}）" if r.get('supersedes') else '')
        md.append(f"| {r['id']} | {r['rule'].replace('|', '／')} | {r['scope']} | {src.replace('|', '／')} | {st} |")
    return '\n'.join(md).replace('\n## ', '\n\n## ') + '\n'


def main():
    args = set(sys.argv[1:]); fail = []
    raw = RULES.read_text(encoding='utf-8'); data = json.loads(raw); rules = data['rules']
    ids = [r['id'] for r in rules]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup: fail.append(f'规则编号重复：{dup}')
    TABLE.write_text(render(rules), encoding='utf-8')

    fp = fingerprint(raw)
    if '--approve-rules' in args:
        LOCK.write_text(fp + '\n', encoding='utf-8'); print(f'规则指纹已登记（{len(rules)} 条）。')
    elif not LOCK.exists() or LOCK.read_text().strip() != fp:
        fail.append('rules.json 已改动但未登记批准：请用户确认后运行 --approve-rules')

    stale = [(r['id'], re.compile(p)) for r in rules if r['status'] == '现行' for p in r.get('stale', [])]
    hits, dead, nostatus = [], [], []; seen = set()
    for p in docs():
        text = p.read_text(encoding='utf-8', errors='ignore'); rel = str(p.relative_to(ROOT))
        for n, line in enumerate(text.splitlines(), 1):
            for rid, rx in stale:
                for m in rx.finditer(line):
                    before = line[max(0, m.start() - 16):m.start()]
                    quoted = line[:m.start()].count('“') > line[:m.start()].count('”')
                    if NEG.search(before) or quoted or (rel, n) in seen: continue  # 在讲禁令或引用旧说法；同一行只报一次
                    seen.add((rel, n))
                    hits.append(f'{rel}:{n}  [{rid} 的旧说法] …{line[max(0, m.start() - 20):m.end() + 20].strip()}…'); break
        for m in LINK.finditer(text):
            href = m.group(1).split('#')[0]
            if not href or re.match(r'^[a-z]+:', href) or href.startswith('/'): continue
            t = (p.parent / href).resolve()
            if not t.exists() or '_attic' in t.parts: dead.append(f'{rel} -> {href}')
        body = re.sub(r'\A---\n.*?\n---\n', '', text, flags=re.S)  # 跳过 frontmatter（人物页）
        if not STATUS.search('\n'.join(body.splitlines()[:16])): nostatus.append(rel)

    if '--rebase-links' in args:
        LINK_BASE.write_text(json.dumps(sorted(set(dead)), ensure_ascii=False, indent=1), encoding='utf-8')
        print(f'死链基线已更新：{len(set(dead))} 条。')
    base = set(json.loads(LINK_BASE.read_text(encoding='utf-8'))) if LINK_BASE.exists() else set()
    new_dead = sorted(set(dead) - base)

    print(f'文档检查：规则 {len(rules)} 条；扫描文档 {len(docs())} 份；过时说法 {len(hits)} 处；'
          f'死链 {len(set(dead))} 条（新增 {len(new_dead)}）；缺状态 {len(nostatus)} 份。')
    for h in hits: print('  过时说法', h)
    for d in new_dead: print('  新死链', d)
    if nostatus: fail.append(f'{len(nostatus)} 份现行文档缺页首状态：' + '、'.join(nostatus[:5]))
    if hits: fail.append(f'现行文档里有 {len(hits)} 处已废止的旧说法')
    if new_dead: fail.append(f'新增死链 {len(new_dead)} 条')
    for f in fail: print('失败：', f)
    sys.exit(1 if fail else 0)


if __name__ == '__main__':
    main()
