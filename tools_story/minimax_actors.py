# -*- coding: utf-8 -*-
"""演员法起草台词（剧情三道关·第二关，2026-10-19）。以 xiaojianghu 目录运行：
    python3 tools_story/minimax_actors.py <戏眼卡.json> --out <草稿目录> [--scene ID ...] [--takes 3] [--model MiniMax-M2]

做法：编剧（主会话）先写好每场戏的“戏眼卡”：谁想要什么、什么挡着、散场时什么变了，每个人物此刻知道/不知道什么，
以及逐句的“回合”——这一句谁说、他此刻想达到什么（意图，不是台词内容）。
每个回合单独调用一次 MiniMax，只把“这个人物”的人物卡、此刻知道的事、这场戏到目前为止的对话和他这一句的意图交给它，
让它以这个人物的身份只说一句话。每个回合出 --takes 个备选，由编剧挑选、剪辑。演员看不到别人的人物卡和设计约束，
所以每个人只按自己的立场说话，不替编剧解释剧情。
回合的台词会按第 1 个备选接到下文，供后面的演员看到上下文；编剧剪辑后可用 --fixed 把定稿行喂回去重跑后续回合。
密钥与 tools_story/minimax_draft.py 相同（MiniMax_APIKEY）。"""
from pathlib import Path
import json, re, sys, time, argparse
sys.path.insert(0, str(Path(__file__).resolve().parent))
from minimax_draft import call  # 复用重试与密钥读取

SYSTEM = """你是一位演员，正在演一部南宋背景的武侠游戏里的一个角色。你只演你自己这个角色，只说一句话。
规则：
1. 只输出这个角色此刻说出口的一句话（或心里话，心里话用全角括号（）包起来）。不写旁白、动作、舞台说明、引号外的解释。
2. 只知道“你知道的事”里写的内容。不知道的事不要说，也不要暗示。
3. 你是在对眼前的人说话，不是对观众解释剧情。不要总结、不要讲道理、不要说出这场戏的主题、不要把双方都知道的事复述一遍。
4. 说话要像真人：可以说半句、可以打断自己、可以答非所问，但要符合你的性格和此刻的处境。紧急时话短。
5. 一般不超过 25 个汉字，最长不超过 40 个汉字。浅近白话带一点古风，不用现代网络用语（现代来的角色除外，但也不玩梗）。
6. 不要用这些套路：“不是……而是……”、排比、对仗、“说到底”“其实”“毕竟”开头的总结句、主动解释自己为什么这么做。
只输出这一句台词本身，不要加角色名、不要加引号。"""


def actor_prompt(card, scene, history, turn):
    who = turn['speaker']; c = card[who]
    lines = [f"【你是】{who}。{c['who']}",
             f"【你的说话方式】{c['voice']}",
             f"【此刻的处境】{scene['when']}。{scene.get('situation', '')}",
             f"【你知道的事】" + '；'.join(scene['knows'].get(who, [])),
             f"【你不知道的事（绝不能说出或暗示）】" + ('；'.join(scene.get('unknown', {}).get(who, [])) or '无'),
             '', '【到目前为止的对话】'] + ([f"{h['speaker']}：{h['text']}" for h in history] or ['（还没有人说话）']) + [
             '', f"【你这一句想做到的】{turn['intent']}"]
    if turn.get('inner'): lines.append('【这一句是心里话，不说出口】')
    if turn.get('note'): lines.append(f"【提醒】{turn['note']}")
    return '\n'.join(lines)


def clean(text):
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.S).strip().split('\n')[0].strip()
    text = re.sub(r'^[一-鿿]{1,4}[：:]', '', text).strip().strip('“”"\'「」')
    return text


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('brief'); ap.add_argument('--out', required=True); ap.add_argument('--scene', nargs='*')
    ap.add_argument('--takes', type=int, default=3); ap.add_argument('--model', default='MiniMax-M2'); ap.add_argument('--fixed', help='定稿行 JSON：{场景ID: [{speaker,text}, ...]}，按顺序替换前面回合的第 1 备选')
    a = ap.parse_args(); brief = json.loads(Path(a.brief).read_text(encoding='utf-8')); out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    fixed = json.loads(Path(a.fixed).read_text(encoding='utf-8')) if a.fixed else {}
    for sc in brief['scenes']:
        if a.scene and sc['id'] not in a.scene: continue
        def run(turns, history, rows, tag):
            for i, turn in enumerate(turns):
                if turn.get('fixed'):
                    rows.append({'n': f'{tag}{i + 1}', **turn, 'takes': [turn['fixed']]}); history.append({'speaker': turn['speaker'], 'text': turn['fixed']}); continue
                prompt = actor_prompt(brief['cards'], sc, history, turn); takes = []
                for t in range(a.takes):
                    try: takes.append(clean(call([{'role': 'system', 'content': SYSTEM}, {'role': 'user', 'content': prompt}], a.model, max_tokens=2000)))
                    except Exception as e: takes.append(f'（生成失败：{e}）')
                    time.sleep(1)
                rows.append({'n': f'{tag}{i + 1}', **turn, 'takes': takes}); history.append({'speaker': turn['speaker'], 'text': takes[0]})
                print(sc['id'], tag + str(i + 1), turn['speaker'], '｜', ' ／ '.join(takes), flush=True)
            return history
        rows = []
        history = run(sc['turns'], [], rows, '')
        first = None
        for k, br in (sc.get('branches') or {}).items():
            h = run(br['turns'], [*history, {'speaker': '萧白', 'text': br['label'].strip('“”')}], rows, f'{k}-')
            first = first or h
        if sc.get('after'): run(sc['after']['turns'], first or history, rows, '后-')
        (out / f"{sc['id']}.json").write_text(json.dumps({'scene': sc['id'], 'rows': rows}, ensure_ascii=False, indent=1), encoding='utf-8')
        md = [f"# {sc['id']} {sc['title']}（演员法备选）", '', f"戏眼：{sc['eye']}", '']
        for r in rows: md.append(f"{r['n']}. **{r['speaker']}**（{r['intent']}）\n" + '\n'.join(f"   - {t}" for t in r['takes']))
        (out / f"{sc['id']}.md").write_text('\n'.join(md) + '\n', encoding='utf-8')


if __name__ == '__main__': main()
