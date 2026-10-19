# -*- coding: utf-8 -*-
"""把审定后的台词稿写回 docs/design/scripts/pre-xiangyang.json。以 xiaojianghu 目录运行：
    python3 tools_story/apply_story_drafts.py <简报.json> <草稿目录> [--scene M-02 ...] [--dry]
草稿是 tools_story/minimax_draft.py 产出、再经人工修改的 <场景id>.json。
只换台词、场景说明（stage）和分支选项文字，段落 key、条件、效果原样保留；段落对不上就报错不写。
表情写进 mood（培养运行时直接用）和 emotion_api（配音规划用）；某人没有的表情会被丢弃并提示。"""
from pathlib import Path
import json, argparse, sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'docs/design/scripts/pre-xiangyang.json'
ALL = ['smile', 'serious', 'surprise', 'worry', 'angry', 'sad']
MOODS = {'萧白': ALL + ['awkward'], '叶蘅': ALL, '周砚': ALL, '陆衡': ['smile', 'serious', 'surprise', 'worry', 'sad'], '收件人': ['smile', 'worry']}
EMO_API = {'smile': 'happy', 'worry': 'fearful', 'sad': 'sad', 'angry': 'angry', 'surprise': 'surprised'}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('brief'); ap.add_argument('drafts'); ap.add_argument('--scene', nargs='*'); ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    brief = {s['id']: s for s in json.loads(Path(a.brief).read_text(encoding='utf-8'))['scenes']}
    data = json.loads(SRC.read_text(encoding='utf-8')); bad = []
    for sc in data['scenes']:
        sid = sc['id']
        if sid not in brief or (a.scene and sid not in a.scene): continue
        f = Path(a.drafts) / f'{sid}.json'
        if not f.exists(): bad.append(f'{sid} 没有草稿'); continue
        draft = {b['key']: b for b in json.loads(f.read_text(encoding='utf-8'))['blocks']}
        if set(draft) != {b['key'] for b in sc['blocks']}: bad.append(f'{sid} 段落不符：{sorted(draft)} vs {[b["key"] for b in sc["blocks"]]}'); continue
        labels = {b['key']: b.get('label') for b in brief[sid]['blocks']}
        for b in sc['blocks']:
            lines = draft[b['key']]['lines']
            if not lines: bad.append(f'{sid}/{b["key"]} 没有台词'); continue
            out = []
            for i, l in enumerate(lines, 1):
                sp, mood = l['speaker'], l.get('mood') or None
                if sp not in brief[sid]['cast']: bad.append(f'{sid}/{b["key"]} 简报外的说话人 {sp}')
                if mood and mood not in MOODS.get(sp, []): print(f'提示：{sid}/{b["key"]} {sp} 没有表情 {mood}，已去掉'); mood = None
                row = {'speaker': sp, 'text': l['text'].strip(), 'voice': bool(mood) and sp != '萧白', 'emotion_api': EMO_API.get(mood, 'calm'),
                       'delivery_notes': '', 'id': f'{sid}-{b["key"]}-{i:02d}', 'revision': 2}
                if mood: row['mood'] = mood
                out.append(row)
            b['lines'] = out
            if labels.get(b['key']) and b['kind'] == 'branch':
                old = b['label'].split('：', 1); b['label'] = labels[b['key']] + '：' + (old[1] if len(old) > 1 else old[0])
        sc['stage'] = brief[sid]['when']
        notes = [n for n in sc.get('contract_notes', []) if not n.startswith('2026-10-16 返工')]
        sc['contract_notes'] = notes + ['2026-10-16 返工：剧情按 briefs/pre-xiangyang-mainline-brief.json 重新设计，台词由 MiniMax 起草、人工审定；段落、条件、效果未改。']
        print(sid, '写入', sum(len(b['lines']) for b in sc['blocks']), '句')
    if bad: print('\n'.join(bad)); sys.exit(1)
    if not a.dry: SRC.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__': main()
