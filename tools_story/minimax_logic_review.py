#!/usr/bin/env python3
"""用外部模型给 ink 剧本做“逻辑初筛”，省主会话的 token。
2026-10-28 起默认用 302.AI 的 claude-opus-5-5（三家对比里最稳，见规范第七节“逻辑初筛”）；
--provider minimax／deepseek 仍可切回。文件名沿用旧名，免得改动各处引用。

用法（在 xiaojianghu 目录）：
    python3 tools_story/minimax_logic_review.py <ink 文件或目录 ...> --out <输出目录> [--changed] [--rules 原则.md ...] [--provider 302|minimax|deepseek] [--jobs 5]

每个剧本单独送，附上整条链路：
- 剧本全文（含文件头的戏眼和知情说明）和构建导出的逐分支路线（docs/story-routes/）；
- 剧情钩子登记里它埋下的和回扣它的条目，以及对端剧本的路线；
- 定稿事实表里来源是它、或提到出场人物的条目；
- 出场人物的人物卡开头；调用这个剧本的 JS 片段（看选项后果到底给了什么）；
- 审读标准原文：剧情写作规范第七节人工审读清单、--rules 指定的原则文件。

每个剧本跑三步（都由所选模型做；--samples 2 时前两步各跑两遍取并集，条目会翻倍，只在重要批次用）：
1. 挑问题：七类逻辑问题，每条必须写“依据”（原文 #id、事实编号或代码位置）；
2. 后果表：逐个选项列出谁得什么、失什么，再站在当事人角度判断合不合事理（单挑一遍，因为第一步最容易漏这类）；
3. 自复核：把前两步的条目逐条对照原文判“成立／存疑／误报”，误报直接丢掉。
主会话看报告里“成立”和“存疑”的条目，再扫一眼末尾“自复核判为误报”的一行一条（自复核也会误杀）。复核确认是误报的，登记进
docs/design/registry/logic-review-ignore.json，以后不再报。
--changed 只跑上次跑过之后改过的剧本（按内容哈希，缓存在 tools_story/.cache/）。
密钥：302 用 tools_por/.env 的 AI302_API_KEY（与生图共用）；MiniMax 用 MiniMax_APIKEY；DeepSeek 用 xiaojianghu/.env 的 DEEPSEEK_API_KEY。
"""
import argparse, concurrent.futures as cf, hashlib, json, os, re, sys, time, urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from minimax_draft import call as minimax_call, parse  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
GAME = ROOT / 'xiaojianghu-legacy-prologue'
BIBLE = ROOT / 'xiaojianghu' / 'bible' / '人物'
FACTS = ROOT / 'xiaojianghu' / 'bible' / '定稿事实.md'
HOOKS = ROOT / 'xiaojianghu' / 'docs' / 'design' / 'registry' / 'story-hooks.json'
IGNORE = ROOT / 'xiaojianghu' / 'docs' / 'design' / 'registry' / 'logic-review-ignore.json'
ROUTES = GAME / 'docs' / 'story-routes'
WRITING = ROOT / 'xiaojianghu' / 'docs' / 'design' / 'story-writing.md'
CACHE = Path(__file__).parent / '.cache' / 'logic_review.json'
ENV = ROOT / 'xiaojianghu' / '.env'
DEFAULT_MODEL = {'minimax': 'MiniMax-M2.5', 'deepseek': 'deepseek-flash', '302': 'claude-opus-5-5'}
POR_ENV = ROOT / 'xiaojianghu' / 'tools_por' / '.env'  # 302.AI 密钥和生图共用（R-生图-03）


def deepseek_key():
    v = os.environ.get('DEEPSEEK_API_KEY')
    if v:
        return v
    for line in ENV.read_text(encoding='utf-8').splitlines():
        if line.startswith('DEEPSEEK_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"\'')
    raise SystemExit('缺少 DEEPSEEK_API_KEY 环境变量或 xiaojianghu/.env 配置')


def deepseek_call(messages, model, max_tokens=16000):
    """DeepSeek 的 OpenAI 格式接口（https://api.deepseek.com），默认带思考；只取最终回答。
    思考也算在 max_tokens 里：10-28 实测一次审读光思考就用满 16000，回答为空，所以这里放到 64000。"""
    body = {'model': model, 'messages': messages, 'max_tokens': max(max_tokens, 64000)}
    req = urllib.request.Request('https://api.deepseek.com/chat/completions', json.dumps(body).encode(),
                                 {'Authorization': 'Bearer ' + deepseek_key(), 'Content-Type': 'application/json'})
    r = json.loads(urllib.request.urlopen(req, timeout=600).read())
    return r['choices'][0]['message']['content']


def ai302_call(messages, model, max_tokens=16000):
    """302.AI 的 OpenAI 兼容接口（https://api.302ai.cn/v1），密钥 AI302_API_KEY 在 tools_por/.env。"""
    key = os.environ.get('AI302_API_KEY') or next((l.split('=', 1)[1].strip().strip('"\'') for l in POR_ENV.read_text(encoding='utf-8').splitlines() if l.startswith('AI302_API_KEY=')), None)
    if not key:
        raise SystemExit('缺少 AI302_API_KEY（tools_por/.env）')
    body = {'model': model, 'messages': messages, 'max_tokens': max_tokens}
    req = urllib.request.Request('https://api.302ai.cn/v1/chat/completions', json.dumps(body).encode(),
                                 {'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req, timeout=600).read())['choices'][0]['message']['content']


def call(messages, model, max_tokens=16000):
    if model.startswith('deepseek'):
        return deepseek_call(messages, model, max_tokens)
    if model.startswith('claude'):
        return ai302_call(messages, model, max_tokens)
    return minimax_call(messages, model, max_tokens)
VERSION = 4  # 提示词或流程改了就加一，--changed 会全部重跑

BACKGROUND = '背景：开始部分发生在栖河村，一个普通江南村子；主角萧白是现代穿越来的十七岁少年，此时武功很弱。界面上钱的单位是“两”。'
# 前两轮复核里反复出现的误报来源（2026-10-28），写进提示词压掉
NOT_ISSUES = """下面这些不算问题，不要报：
- 逐分支路线是构建时把所有标记取值都遍历出来的，里面有实际玩不到的组合；不要因为“不可能同时成立的组合”报错。
- 全角括号（）里是萧白的心里话，没有说出口。
- 选项选完由玩家自己去找人办（分步任务），只要代码里后面能接上，就不算“选择没落实”。
- 送礼、赔礼台词里“记着你”“还你人情”之类口头话，如果代码另有好感数值，不算后果虚。
- 文件头“在场”只列主要人物；反讽、气话、试探按说话人的意图理解，不按字面。
- 文件头注释可能过时（如写着“JS 未接”），以代码片段为准。
- 拿不准的标“存疑”，不要标“成立”。"""

SYSTEM_REVIEW = f"""你是武侠游戏的剧情审读，专挑“逻辑说不通”的地方，不管文笔。
{BACKGROUND}
逐条检查这几类问题（只报真的有问题的，宁缺毋滥）：
1 后果虚：选项或事件的结果是“记一份人情、以后关照”这类看不见用不上的东西，没有落到好感、门派声望、银两、物品、标记上。
2 后果不合事理：站在对方角度想，这件事对他是好是坏？例如拿了一个门派的东西去还给他们老大，是打脸而不是示好，却给了好感。
3 实力身份不符：萧白正面打赢明显比他强的人；人物做出超出身份、财力、地位、职守的事（如公人收礼了事）。
4 知情越界：人物说出他按文件头“知情”说明、定稿事实或常理不该知道的事。
5 设定过大：普通村子里冒出名人遗迹、高人、宝物、神功，且没交代为什么在这儿。
6 动机不明：人物为什么现在说这句、做这件事说不出来由。
7 前后矛盾：同一剧本前后冲突，或和文件头、定稿事实、链路上的剧本、代码冲突。
{NOT_ISSUES}
每条都要写“依据”：指出能证明它有问题的原文 #id、定稿事实编号或代码位置，写不出依据就不要报。
只输出一个 JSON 对象，不要解释：
{{"issues":[{{"type":"类别名","line":"台词 #id，没有就写 knot 名","quote":"原句（不超过 30 字）","problem":"哪里说不通","basis":"依据","fix":"建议怎么改","severity":"高/中/低"}}]}}"""

SYSTEM_OUTCOME = f"""你是武侠游戏的剧情审读，这一遍只查“选项和事件的后果”。
{BACKGROUND}
步骤：先把剧本里每个选项（和每个会改数值、给东西的事件）列成一行：选了什么、对谁做的、代码实际给了什么（读 fq_answer、set_flag 和 JS 片段：银两、物品、好感、门派声望、标记）。
再站在每个当事人的角度判断：这件事对他是得是失、是给面子还是打脸、合不合他的身份职守？后果的方向（加好感还是减、给钱还是罚）跟这个判断一致吗？
只报两类问题：后果虚（只有口头许诺，没落到实际数值或标记）、后果不合事理（方向反了，或不合身份职守）。
{NOT_ISSUES}
只输出一个 JSON 对象：
{{"choices":[{{"line":"#id 或 knot","what":"选了什么","gets":"实际得失"}}],"issues":[{{"type":"后果虚/后果不合事理","line":"#id","quote":"原句","problem":"哪里说不通","basis":"依据","fix":"建议怎么改","severity":"高/中/低"}}]}}"""

SYSTEM_VERIFY = f"""你是复核员。下面是别人对一个武侠游戏剧本挑出的问题，常有误读。
{BACKGROUND}
逐条回到原文、路线、定稿事实和代码核对：问题描述的事实是否属实？依据是否真的支持它？有没有别处已经交代、或者属于设计本意？
{NOT_ISSUES}
对每条给出 verdict：成立（属实且确实说不通）／存疑（属实但是否算问题要人定）／误报（事实不对、误读或属于设计本意），并用一句话说理由。
只输出一个 JSON 对象：{{"verdicts":[{{"i":序号,"verdict":"成立/存疑/误报","why":"一句话"}}]}}"""


def speakers(text):
    return sorted({m.group(1) for m in re.finditer(r'^\s*(?:[-+*]\s*)*([^\s：:#/\[\]{}~=（(]{1,6})：', text, re.M)})


def card(name):
    f = BIBLE / f'{name}.md'
    if not f.exists():
        return ''
    lines = [l for l in f.read_text(encoding='utf-8').splitlines() if l.strip()]
    return f'【{name}】\n' + '\n'.join(lines[:22])


def knots_of(text):
    return re.findall(r'^===\s*(\w+)\s*===', text, re.M)


def js_context(knots):
    out = []
    for js in sorted((GAME / 'js').glob('*.js')):
        src = js.read_text(encoding='utf-8', errors='ignore').splitlines()
        spans = []  # 相邻命中合并成一段，免得同一段代码重复出现、被模型当成“写了两遍”
        for i, l in enumerate(src):
            if any(f"'{k}'" in l for k in knots):
                a, b = max(0, i - 2), i + 4
                if spans and a <= spans[-1][1]:
                    spans[-1][1] = b
                else:
                    spans.append([a, b])
        for a, b in spans:
            out.append(f'// {js.name}:{a + 1}-{b}\n' + '\n'.join(s[:400] for s in src[a:b]))
    return '\n\n'.join(out[:12])


def routes(knots, limit):
    out = []
    for k in knots:
        f = ROUTES / f'{k}.md'
        if f.exists():
            out.append(f.read_text(encoding='utf-8')[:limit])
    return '\n\n'.join(out)


def hooks(knots):
    try:
        h = json.loads(HOOKS.read_text(encoding='utf-8'))['hooks']
    except Exception:
        return '', []
    mine, others = [], set()
    for key, v in h.items():
        cons = [c.get('scene') for c in v.get('consumers', [])]
        if key in knots or any(c in knots for c in cons):
            mine.append(f'{key}：' + json.dumps(v, ensure_ascii=False))
            others.update([key, *cons])
    return '\n'.join(mine), sorted(others - set(knots))


def facts(fname, names):
    rows = [l for l in FACTS.read_text(encoding='utf-8').splitlines() if l.startswith('| F-')]
    hit = [r for r in rows if fname in r] + [r for r in rows if fname not in r and any(n in r for n in names if n != '萧白')]
    return '\n'.join(hit[:30])


def standards(rule_files):
    w = WRITING.read_text(encoding='utf-8')
    a = w.find('### 人工审读清单'); b = w.find('### 可选剧情与回扣')
    parts = [w[a:b] if a >= 0 else '']
    parts += [Path(f).read_text(encoding='utf-8') for f in rule_files]
    return '\n\n'.join(parts)


def context(path, rule_files):
    text = path.read_text(encoding='utf-8')
    names = speakers(text); ks = knots_of(text)
    cast = '\n\n'.join(c for c in (card(n) for n in names) if c)
    hook_txt, linked = hooks(ks)
    return '\n\n'.join([
        f'剧本 {path.name}：\n```\n{text}\n```',
        f'本剧本逐分支路线（构建导出，含玩不到的组合）：\n{routes(ks, 12000) or "（无）"}',
        f'剧情钩子登记（谁埋、谁回扣）：\n{hook_txt or "（无）"}',
        f'链路上相关剧本的路线（节选）：\n{routes(linked[:4], 4000) or "（无）"}',
        f'定稿事实（相关条目）：\n{facts(path.name, names) or "（无）"}',
        f'出场人物卡：\n{cast or "（无）"}',
        f'调用这个剧本的游戏代码片段（看选项后果给了什么）：\n```\n{js_context(ks) or "（无）"}\n```',
        f'审读标准原文：\n{standards(rule_files)}'])


def ask(system, user, model, key):
    for attempt in range(3):  # call 只重试 URLError；连接被对端断开（RemoteDisconnected 等）在这里再试
        try:
            raw = call([{'role': 'system', 'content': system}, {'role': 'user', 'content': user}], model, max_tokens=16000)
            break
        except Exception:
            if attempt == 2:
                raise
            time.sleep(10 * (attempt + 1))  # 连接被断开多半是并发太多，退一退再试
    try:
        return parse(raw).get(key, [])
    except Exception as e:  # 模型没给出合法 JSON 时原样留底
        return [{'type': '解析失败', 'line': '', 'quote': '', 'problem': str(e), 'basis': '', 'fix': raw[:300], 'severity': '低'}] if key == 'issues' else []


def ignored(fname, x, table):
    return any(t.get('file') == fname and t.get('line') == x.get('line') and t.get('type') in (None, x.get('type')) for t in table)


def review(path, model, rule_files, table, samples=1):
    ctx = context(path, rule_files)
    # 单跑一次波动大（10-28 评估：一次 6/7、一次 4/7＋误杀 2 条留在附录）；跑两遍取并集也只到 6/7，条目却翻倍（30→52），所以默认 1 遍，重要批次可加 --samples 2
    found, seen = [], set()
    for _ in range(samples):
        for x in ask(SYSTEM_REVIEW, ctx, model, 'issues') + ask(SYSTEM_OUTCOME, ctx, model, 'issues'):
            k = (str(x.get('line', '')).lstrip('#').replace('id:', ''), x.get('type'))
            if k not in seen:
                seen.add(k); found.append(x)
    found = [x for x in found if not ignored(path.name, x, table)]
    if not found:
        return []
    listing = '\n'.join(f"{i}. [{x.get('type')}] {x.get('line')}「{x.get('quote')}」：{x.get('problem')}（依据：{x.get('basis', '')}）" for i, x in enumerate(found))
    verdicts = {v.get('i'): v for v in ask(SYSTEM_VERIFY, ctx + '\n\n待复核的问题：\n' + listing, model, 'verdicts') if isinstance(v, dict)}
    out = []
    for i, x in enumerate(found):
        v = verdicts.get(i, {'verdict': '存疑', 'why': '复核没给结论'})
        if v.get('verdict') == '误报':
            out.append({**x, 'verdict': '误报', 'why': v.get('why', '')})  # 留底供抽查，报告里只列一行
            continue
        out.append({**x, 'verdict': v.get('verdict', '存疑'), 'why': v.get('why', '')})
    return out


def digest(path, rule_files, model=""):
    h = hashlib.sha256((str(VERSION) + model).encode())
    for p in [path, *map(Path, rule_files)]:
        h.update(p.read_bytes())
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser(description='剧情逻辑初筛（挑问题 → 后果表 → 自复核），默认 302 的 claude-opus-5-5')
    ap.add_argument('paths', nargs='+')
    ap.add_argument('--out', required=True)
    ap.add_argument('--provider', choices=['minimax', 'deepseek', '302'], default='302', help='用哪家模型（默认 302）：minimax／deepseek（DEEPSEEK_API_KEY）／302（302.AI 的 claude-opus-5-5，AI302_API_KEY）')
    ap.add_argument('--model', help='不填按 --provider 取默认：MiniMax-M2.5／deepseek-flash／claude-opus-5-5')
    ap.add_argument('--jobs', type=int, default=5)
    ap.add_argument('--rules', action='append', default=[], help='额外的审读原则文件，原文送给模型；可写多次')
    ap.add_argument('--changed', action='store_true', help='只跑上次之后改过的剧本')
    ap.add_argument('--samples', type=int, default=1, help='挑问题两步各跑几遍取并集（默认 1；评估见文件头）')
    ap.add_argument('--no-ignore', action='store_true', help='不用忽略表（评估工具本身时用）')
    # 2026-10-29 培养阶段排查：剧情不在 ink 里，先用 tools_scene/qihe/dump_precity_scenes.cjs 逐场导出成 md 再送；背景也不是栖河
    ap.add_argument('--background', help='换掉默认的栖河背景说明（一段话）')
    ap.add_argument('--glob', default='*.ink', help='目录里读哪些文件（默认 *.ink）')
    a = ap.parse_args()
    if a.background:
        global SYSTEM_REVIEW, SYSTEM_OUTCOME, SYSTEM_VERIFY
        SYSTEM_REVIEW, SYSTEM_OUTCOME, SYSTEM_VERIFY = (x.replace(BACKGROUND, a.background) for x in (SYSTEM_REVIEW, SYSTEM_OUTCOME, SYSTEM_VERIFY))
    a.model = a.model or DEFAULT_MODEL[a.provider]
    files = []
    for p in map(Path, a.paths):
        files += sorted(p.glob(a.glob)) if p.is_dir() else [p]
    cache = json.loads(CACHE.read_text(encoding='utf-8')) if CACHE.exists() else {}
    if a.changed:
        files = [f for f in files if cache.get(str(f.resolve())) != digest(f, a.rules, a.model)]
        print(f'有改动的剧本 {len(files)} 个')
    table = json.loads(IGNORE.read_text(encoding='utf-8')).get('ignore', []) if IGNORE.exists() and not a.no_ignore else []
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    res = {}
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        futs = {ex.submit(review, f, a.model, a.rules, table, a.samples): f for f in files}
        for fu in cf.as_completed(futs):
            f = futs[fu]
            try:
                res[f.name] = fu.result()
                cache[str(f.resolve())] = digest(f, a.rules, a.model)
            except Exception as e:
                res[f.name] = [{'type': '调用失败', 'line': '', 'quote': '', 'problem': str(e), 'fix': '', 'severity': '低', 'verdict': '存疑'}]
            (out / (f.stem + '.json')).write_text(json.dumps(res[f.name], ensure_ascii=False, indent=1), encoding='utf-8')
            print(f'{f.name}: {len(res[f.name])} 条', flush=True)
    CACHE.parent.mkdir(exist_ok=True)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding='utf-8')
    rank = {('成立', '高'): 0, ('成立', '中'): 1, ('成立', '低'): 2, ('存疑', '高'): 3, ('存疑', '中'): 4}
    n = sum(1 for v in res.values() for x in v if x.get('verdict') != '误报')
    dropped = [(k, x) for k, v in res.items() for x in v if x.get('verdict') == '误报']
    md = [f'# 逻辑初筛（{a.model}，待主会话复核）', '', f'共 {n} 条（自复核判为误报的已丢掉；先看“成立”）。确认是误报的登记进 docs/design/registry/logic-review-ignore.json。', '']
    for name in sorted(res):
        items = sorted((x for x in res[name] if x.get('verdict') != '误报'), key=lambda x: rank.get((x.get('verdict'), x.get('severity')), 9))
        if not items:
            continue
        md.append(f'## {name}')
        for x in items:
            md.append(f"- [{x.get('verdict')}·{x.get('severity')}][{x.get('type')}] {x.get('line')}「{x.get('quote')}」：{x.get('problem')}（依据：{x.get('basis', '')}；复核：{x.get('why', '')}）→ {x.get('fix')}")
        md.append('')
    if dropped:  # 自复核也会误杀真问题（评估时灯四那条就是），留一行一条给主会话扫一眼
        md += ['## 附：自复核判为误报的（扫一眼，有冤枉的捞回来）', '']
        md += [f"- {k} {x.get('line')}「{x.get('quote')}」：{x.get('problem', '')[:60]}（复核：{x.get('why', '')}）" for k, x in sorted(dropped, key=lambda t: t[0])]
    (out / 'report.md').write_text('\n'.join(md), encoding='utf-8')
    print('报告：', out / 'report.md')


if __name__ == '__main__':
    main()
