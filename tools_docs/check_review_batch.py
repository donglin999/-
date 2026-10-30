#!/usr/bin/env python3
"""评审台发题前自查（R-评审-01，流程见 docs/review-desk.md）。

用法：python3 tools_docs/check_review_batch.py <questions 导出目录> [--answers <answers 导出目录>] [--modules <modules 导出目录> --fixes <fixes 导出目录>]
导出目录是 ArtifactData list 加 out_dir 存下来的 questions/*.json。
只查待处理的题：没写 closed、且没有用户答案（给了 --answers 时）、没有并进模块（给了 --modules 时；并进去的题只在模块卡片里出现，模块归档了也一样）。
给了 --modules 和 --fixes 时，再查整改中的模块：整改要贴在一处（同一模块只能有一条整改），而且要附图。
给了 --modules 时，还查模块卡上用户写的意见（userNote）有没有接住：日志里要有 ack 等于其 userAt 的一条。
"""
import argparse, glob, json, os, re, sys

KINDS = {'剧情', '玩法', '界面', '美术', '数值'}
NEED_IMAGE = {'美术', '界面', '玩法'}
# 内部代号：设计稿编号、节号、开发内部叫法
JARGON = re.compile(r'H\d(～H\d)?|§\d|第\s*\d+\s*节|纸签|战斗档|主会话|\bqid\b')


def load(d):
    out = {}
    for f in glob.glob(os.path.join(d, '*.json')):
        j = json.load(open(f, encoding='utf-8'))
        out[os.path.basename(f)[:-5]] = j.get('data', j)
    return out


def main():
    ap = argparse.ArgumentParser(description='评审台发题前自查')
    ap.add_argument('questions', help='questions 导出目录')
    ap.add_argument('--answers', help='answers 导出目录；有答案的题不再查')
    ap.add_argument('--modules', help='modules 导出目录；并进未完成模块的题不单独查')
    ap.add_argument('--fixes', help='fixes 导出目录；查整改中模块的整改')
    a = ap.parse_args()
    qs = load(a.questions)
    answered = set(load(a.answers)) if a.answers else set()
    errs, modules = [], {}
    mods = load(a.modules) if a.modules else {}
    fixes = load(a.fixes) if a.fixes else {}
    # 2026-10-30：归档模块（status done）里的题也已收进来龙去脉，不再当游离题查（原先只跳过未归档模块的，归档后旧题反被报出来）
    merged = {it['id'] for m in mods.values() for it in m.get('items') or []}
    # 2026-10-27 起：用户写在模块卡上的意见（userNote）也要接住——日志里要有一条 ack 等于那条意见的 userAt，
    # 表示已合并进整改（第二轮漏看了“蔺管事和周砚太像”“一个时段不设送礼次数”两条）
    for mid, m in mods.items():
        if m.get('userNote') and m.get('userAt') and not any(l.get('ack') == m['userAt'] for l in m.get('log') or []):
            errs.append(f'模块「{m.get("title")}」卡上有你的意见没接：「{m["userNote"][:30]}」——合并进整改后在日志里记一条 ack={m["userAt"]}')
    for mid, m in mods.items():
        if m.get('status') != 'doing' or not a.fixes:
            continue
        # 页面第 4 版起模块写了 current（现在要你处理的题），只查这几道；以前的题收在“来龙去脉”里
        ids = m['current'] if 'current' in m else [it['id'] for it in m.get('items') or [] if not (qs.get(it['id']) or {}).get('closed')]
        fs = [fixes[i] for i in ids if i in fixes and fixes[i].get('text')]
        if len(fs) > 1:
            errs.append(f'模块「{m.get("title")}」有 {len(fs)} 条整改，合成一条贴在一处')
        if fs and not any(r.get('asset') for f in fs for r in f.get('refs') or []):
            errs.append(f'模块「{m.get("title")}」的整改没有附图')
    for qid, q in sorted(qs.items()):
        if q.get('closed') or qid in answered or qid in merged:
            continue
        kind, mod = q.get('kind'), q.get('module')
        refs = q.get('refs') or []
        imgs = [r for r in refs if r.get('asset')]
        texts = [r for r in refs if r.get('kind') == 'text' and ('【' in (r.get('text') or '') or len(r.get('text') or '') > 200)]   # 剧本导出带【剧本名】；短剧本整段贴上也算
        if kind not in KINDS:
            errs.append(f'{qid} 缺种类 kind（{"/".join(sorted(KINDS))}）')
        if not mod:
            errs.append(f'{qid} 缺模块 module')
        else:
            modules.setdefault(mod, []).append(qid)
        if kind in NEED_IMAGE and not imgs:
            errs.append(f'{qid}（{kind}）没有附图')
        if kind == '剧情' and not (texts or imgs):
            errs.append(f'{qid}（剧情）没有附剧本正文或路线全文')
        for o in q.get('options') or []:
            if kind in ('美术', '界面') and len(q.get('options')) > 1 and not o.get('asset') and len(imgs) < 2:
                errs.append(f'{qid} 选项「{o.get("label")}」没有对应的图')
                break
        words = ' '.join([q.get('title') or '', q.get('short') or '', q.get('body') or ''])
        m = JARGON.search(words)
        if m:
            errs.append(f'{qid} 题面有内部代号「{m.group(0)}」，改成玩家看得到的说法')
    for mod, ids in modules.items():
        if len(ids) > 1:
            errs.append(f'模块「{mod}」有 {len(ids)} 道待处理题（{"、".join(ids)}），合并成一道')
    if errs:
        print('评审前自查未通过：')
        for e in errs:
            print(' -', e)
        sys.exit(1)
    print(f'评审前自查通过：{len(modules)} 个模块，每个模块一道题，均已附素材。')


if __name__ == '__main__':
    main()
