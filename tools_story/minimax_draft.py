# -*- coding: utf-8 -*-
"""用 MiniMax 按“剧情设计简报”起草台词（规范见 docs/design/story-writing.md 第六节）。以 xiaojianghu 目录运行：
    python3 tools_story/minimax_draft.py <简报.json> --out <草稿目录> [--scene M-02 ...] [--model MiniMax-M2]
简报由人先写好：每场的戏眼、出场人物与口吻、每段要发生的事（beats）。MiniMax 只负责把要点写成台词，
不给它设计约束清单，不让它新编设定。产出的草稿必须再跑 tools_docs/story_lint.py 并做逻辑审读，不能直接入库。
密钥沿用配音工具：环境变量 MiniMax_APIKEY（或 MINIMAX_API_KEY），否则读 xiaojianghu/.env。"""
from pathlib import Path
import json, os, re, sys, time, argparse, urllib.request

ROOT = Path(__file__).resolve().parents[1]
API = 'https://api.minimaxi.com/v1/text/chatcompletion_v2'


def api_key():
    v = os.environ.get('MiniMax_APIKEY') or os.environ.get('MINIMAX_API_KEY')
    if v: return v
    f = ROOT / '.env'
    if f.exists():
        for line in f.read_text().splitlines():
            if line.startswith('MiniMax_APIKEY='): return line.split('=', 1)[1].strip().strip('"\'')
    raise SystemExit('缺少 MiniMax_APIKEY 环境变量或 xiaojianghu/.env 配置')


SYSTEM = """你是一款南宋背景武侠养成游戏的中文编剧，只负责把编剧给出的剧情要点写成人物台词。
硬性要求：
1. 只写人物说出口的话。不写旁白、不写动作描写、不写舞台说明。主角萧白的心里话可以写，用全角括号（）包起来，但不要用心里话描写动作。
2. 游戏做不了人物动画：不要让剧情靠“翻墙、追逐、拥抱、搀扶着走、过招”这类动起来的情节推进；动作发生在台词之外，人物只说出结果或感受。
3. 每句台词一般不超过 40 个汉字，最长不超过 60 个汉字；一个人连着说的话不超过两句。
4. 语言是浅近的白话，带一点古风，不堆文言；不用现代网络用语、热梗、外文，不用“好感、关系、收益、任务、系统、交接、核实、边界”这类词。萧白是现代人穿越来的十七岁少年，心里话可以有一点现代人的想法，但不出现现代专有名词。
5. 每个人的口吻严格按简报里给的说话方式写，换个名字也要认得出是谁在说话。
6. 严格按简报里每一段的要点写，不新增人物、门派、身世、地名、物件等设定，不提前透露简报没说的剧情。要点里没有的事不要写。
7. 每一句都要回应上一句或推动这场戏往“散场时什么变了”走，删掉以后这场戏还成立的句子不要写。不要为了表达道理让人物讲大道理、念规矩。
8. 表情只在情绪明显转折的那一句标注，一整场最多标三四处，大部分句子不标；只能用简报列出的表情，注意哪些表情只有某个人有。
9. 简报里列出的每一段都必须写出来，哪怕只有一句；有的段落是不同存档才会看到的互斥版本，各写各的，不要互相重复，也不要省略。
只输出一个 JSON 对象，不要任何解释。格式：
{"blocks":[{"key":"段落代号","label":"若简报要求给选项文字则填，否则省略","lines":[{"speaker":"说话人","text":"台词","mood":"可选，表情"}]}]}"""


def call(messages, model, max_tokens=8000):
    body = {'model': model, 'messages': messages, 'max_tokens': max_tokens, 'temperature': 0.7}
    req = urllib.request.Request(API, json.dumps(body).encode(), {'Authorization': 'Bearer ' + api_key(), 'Content-Type': 'application/json'})
    for attempt in range(4):
        try:
            r = json.loads(urllib.request.urlopen(req, timeout=300).read())
            code = r.get('base_resp', {}).get('status_code', 0)
            if code in (1002, 1039): time.sleep(20); continue
            if code: raise RuntimeError(f"MiniMax 返回错误 {code}：{r.get('base_resp', {}).get('status_msg')}")
            return r['choices'][0]['message']['content']
        except urllib.error.URLError as e:
            if attempt == 3: raise
            time.sleep(5)
    raise RuntimeError('MiniMax 多次重试仍失败')


def parse(text):
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.S).strip()
    m = re.search(r'\{.*\}', text, re.S)
    if not m: raise ValueError('没有找到 JSON：' + text[:200])
    return json.loads(m.group(0))


def prompt_for(scene, common):
    lines = [f"【这场戏】{scene['id']}《{scene['title']}》", f"时间地点：{scene['when']}", f"在场的人：{'、'.join(scene['cast'])}（只有这些人能说话）",
             f"前一场发生了什么：{scene.get('before', '无')}", f"后一场会发生什么：{scene.get('after', '无')}", '',
             '【戏眼】', f"谁想要什么：{scene['eye'][0]}", f"什么挡着他：{scene['eye'][1]}", f"散场时什么变了：{scene['eye'][2]}", '',
             '【人物口吻】'] + [f"{k}：{scene.get('voices', {}).get(k) or common['voices'][k]}" for k in scene['cast']] + ['', '【可用表情】' + '、'.join(common['moods']), '', '【分段要点】按顺序写，每段的 key 必须照抄：']
    for b in scene['blocks']:
        head = f"- 段落 key={b['key']}（{b['when']}）约 {b['size']} 句"
        if b.get('label'): head += f"；这一段是玩家选了选项“{b['label']}”之后的内容，选项文字已定，不用写 label"
        lines.append(head)
        lines += [f"    · {x}" for x in b['beats']]
    if scene.get('notes'): lines += ['', '【注意】'] + [f"- {x}" for x in scene['notes']]
    return '\n'.join(lines)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('brief'); ap.add_argument('--out', required=True); ap.add_argument('--scene', nargs='*'); ap.add_argument('--model', default='MiniMax-M2')
    a = ap.parse_args(); brief = json.loads(Path(a.brief).read_text(encoding='utf-8')); out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    for sc in brief['scenes']:
        if a.scene and sc['id'] not in a.scene: continue
        p = prompt_for(sc, brief['common']); (out / f"{sc['id']}.prompt.txt").write_text(p, encoding='utf-8')
        raw = call([{'role': 'system', 'content': SYSTEM}, {'role': 'user', 'content': p}], a.model)
        (out / f"{sc['id']}.raw.txt").write_text(raw, encoding='utf-8')
        try:
            draft = parse(raw)
            keys = [b['key'] for b in sc['blocks']]; got = [b['key'] for b in draft['blocks']]
            if got != keys: print(sc['id'], '段落不符：', got, '应为', keys)
            allowed = set(sc['cast'])
            for b in draft['blocks']:
                for l in b['lines']:
                    if l['speaker'] not in allowed: print(sc['id'], '出现简报外的说话人：', l['speaker'])
            (out / f"{sc['id']}.json").write_text(json.dumps(draft, ensure_ascii=False, indent=1), encoding='utf-8'); print(sc['id'], 'ok', sum(len(b['lines']) for b in draft['blocks']), '句')
        except Exception as e:
            print(sc['id'], '解析失败：', e)
        time.sleep(2)


if __name__ == '__main__': main()
