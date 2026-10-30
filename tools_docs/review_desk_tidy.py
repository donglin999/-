#!/usr/bin/env python3
"""评审台整理检查与现状报告（R-评审-01，流程见 docs/review-desk.md 和 skill review-desk）。

用法：python3 tools_docs/review_desk_tidy.py <导出目录> [--report]
导出目录下要有 questions、answers、modules、fixes、reviews 五个子目录（ArtifactData list 加 out_dir 存下来的样子）。

查的是“页面上乱不乱”，和发题前的 check_review_batch.py 互补：
- 游离题：没收起（closed）、也没挂进任何模块的题。页面第 4 版起所有题都要挂在模块里。
- 一道题挂在两个模块里。
- 整改中的模块既没有“要你做”（current）也没有“等我做”（todo）——该归档（status done）却没归。
- current 里的题不存在、已收起，或已被你点了“满意”（该从 current 拿掉）。
- 同一模块 current 超过一道题（R-评审-01：同一模块待处理的只能有一道）。
- 你点了“继续改”、我还没出新一版、模块 todo 里也没记——欠的整改（todo 条目可写成字符串，或 {text, qid}，欠整改的要写 qid）。
- 模块卡上的意见没接住（日志里没有 ack），或接住了还没清掉。
- current 题的素材：剧情题要有剧本正文（text 附件），美术／界面／玩法题要有图；
  图片附件的说明像文档（全文、方案、草案、剧本）的，多半是把 md 传成了图片，页面会画成裂图。
--report 另外按模块打印现状：要你做什么、等我做什么、你答了还没合并的。
"""
import argparse, glob, json, os, re, sys

DOC_LIKE = re.compile(r'全文|方案|草案|剧本|原则|清单')
NEED_IMAGE = {'美术', '界面', '玩法'}


def load(root, name):
    out = {}
    for f in glob.glob(os.path.join(root, name, '*.json')):
        j = json.load(open(f, encoding='utf-8'))
        out[os.path.basename(f)[:-5]] = j.get('data', j)
    return out


def last_verdict(reviews, key, fix_at):
    its = [x for x in (reviews.get(key) or {}).get('items') or [] if x.get('fixAt') == fix_at]
    return its[-1]['verdict'] if its else None


def main():
    ap = argparse.ArgumentParser(description='评审台整理检查')
    ap.add_argument('root', help='导出目录（含 questions、answers、modules、fixes、reviews）')
    ap.add_argument('--report', action='store_true', help='按模块打印现状')
    a = ap.parse_args()
    Q, A, M, F, R = (load(a.root, n) for n in ('questions', 'answers', 'modules', 'fixes', 'reviews'))
    errs, warns = [], []

    owner = {}
    for mid, m in M.items():
        for it in m.get('items') or []:
            if it.get('kind', 'q') != 'q':
                continue
            if it['id'] in owner and owner[it['id']] != mid:
                errs.append(f'{it["id"]} 同时挂在模块 {owner[it["id"]]} 和 {mid}')
            owner[it['id']] = mid

    def archived(qid):
        q = Q.get(qid) or {}
        if q.get('closed'):
            return True
        f = F.get(qid) or {}
        return bool(f.get('text') and last_verdict(R, 'q-' + qid, f.get('at')) == 'ok')

    for qid, q in sorted(Q.items()):
        if not archived(qid) and qid not in owner:
            errs.append(f'{qid}「{q.get("short") or q.get("title", "")[:20]}」是游离题：挂进模块，或写 closed 收起')

    # 你点了“继续改”、我还没出新一版：要么出整改，要么记进模块 todo
    owed = {}
    for qid, f in F.items():
        if f.get('text') and last_verdict(R, 'q-' + qid, f.get('at')) == 'redo' and not (Q.get(qid) or {}).get('closed'):
            owed[qid] = owner.get(qid)

    for mid, m in sorted(M.items(), key=lambda x: x[1].get('order') or 0):
        t = m.get('title') or mid
        cur = m.get('current') or []
        todo = m.get('todo') or []
        if m.get('status') == 'done':
            if cur:
                errs.append(f'模块「{t}」已归档，current 却还有 {"、".join(cur)}')
            continue
        if not m.get('kind'):
            errs.append(f'模块「{t}」缺 kind（剧情／玩法／界面／美术／数值），页面按它分类')
        if not cur and not todo:
            errs.append(f'模块「{t}」既没有要你做的（current），也没有等我做的（todo）：做完了就写 status done、doneAt')
        if len(cur) > 1:
            errs.append(f'模块「{t}」current 有 {len(cur)} 道题，同一模块只放一道（R-评审-01）；拆模块或合题')
        for qid in cur:
            q = Q.get(qid)
            if not q:
                errs.append(f'模块「{t}」current 里的 {qid} 不存在')
                continue
            if owner.get(qid) != mid:
                errs.append(f'模块「{t}」current 里的 {qid} 不在本模块 items 里')
            if archived(qid):
                errs.append(f'模块「{t}」current 里的 {qid} 已收起或已确认满意，从 current 拿掉')
            refs = list(q.get('refs') or [])
            f = F.get(qid) or {}
            if f.get('text'):
                refs += f.get('refs') or []
            imgs = [r for r in refs if r.get('asset')]
            texts = [r for r in refs if r.get('kind') == 'text' and len(r.get('text') or '') > 80]
            kind = q.get('kind')
            if kind == '剧情' and not texts:
                errs.append(f'{qid}（剧情）没有剧本正文附件（refs 里 kind:text）')
            if kind in NEED_IMAGE and not imgs:
                errs.append(f'{qid}（{kind}）没有附图')
            for r in imgs:
                if DOC_LIKE.search(r.get('label') or ''):
                    errs.append(f'{qid} 附件「{r.get("label")}」像文档却传成了图片，页面会画成裂图：改成 kind:text')
        if m.get('conflicts'):
            warns.append(f'模块「{t}」卡顶挂着“要你定：{m["conflicts"][:24]}…”，确认还有效；过期的清空（10-29 查看页、算命两处挂了作废的旧话）')
        if m.get('userNote'):
            if m.get('userAt') and not any(l.get('ack') == m['userAt'] for l in m.get('log') or []):
                errs.append(f'模块「{t}」卡上有你的意见没接：「{m["userNote"][:30]}」')
            else:
                warns.append(f'模块「{t}」卡上的意见已接住，抄进日志后把 userNote 清掉')

    for qid, mid in owed.items():
        m = M.get(mid) or {}
        if not any(isinstance(x, dict) and x.get('qid') == qid for x in m.get('todo') or []):
            errs.append(f'{qid} 你点了“继续改”，还没出新一版，模块「{m.get("title", mid or "无")}」todo 里也没记（写成 {{"text": "要改什么", "qid": "{qid}"}}）')

    if a.report:
        print('== 评审台现状 ==')
        for mid, m in sorted(M.items(), key=lambda x: x[1].get('order') or 0):
            if m.get('status') == 'done':
                continue
            print(f'\n【{m.get("title")}】（{m.get("kind", "?")}）')
            # 早期日志的 at 是 ISO 字符串，只比数字的
            last_log = max([l['at'] for l in m.get('log') or [] if isinstance(l.get('at'), (int, float))] or [0])
            for qid in m.get('current') or []:
                q, ans, f = Q.get(qid) or {}, A.get(qid) or {}, F.get(qid) or {}
                if f.get('text') and not last_verdict(R, 'q-' + qid, f.get('at')):
                    st = '要你验收整改'
                elif ans.get('choice') or ans.get('note'):
                    st = '你已答' + ('，待我合并' if (ans.get('at') or 0) > last_log else '')
                else:
                    st = '要你回答'
                print(f'  要你做：{qid} {q.get("short") or q.get("title", "")[:24]} —— {st}')
            for x in m.get('todo') or []:
                print(f'  等我做：{x["text"] if isinstance(x, dict) else x}')
        n = sum(1 for m in M.values() if m.get('status') == 'done')
        print(f'\n已归档模块 {n} 个')

    for w in warns:
        print('提示：', w)
    if errs:
        print('评审台整理检查未通过：')
        for e in errs:
            print(' -', e)
        sys.exit(1)
    print('评审台整理检查通过。')


if __name__ == '__main__':
    main()
