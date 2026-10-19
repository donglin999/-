#!/usr/bin/env python3
"""技能图标 v4 批量生成（C 版“精绘”方向，见 docs/design/martial-review/icon-style-v4.md）。

画面主体取 skill-text-v4.json 的 icon_subject；风格参照已批准的品阶评审样张（作为 -i 参考图输入）。
每张一次 codex exec 内置 image_gen（服务端选模型），输出 art_sources/martial_icons_v4/<id>.png，提示词与回执同目录。
已存在的跳过，可中断续跑。用法：python3 tools_docs/gen_icons_v4.py [--only gy_s1 xf_tuna] [--workers 6] [--limit 10]
"""
import argparse, hashlib, json, os, subprocess, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
OUT = ROOT / 'art_sources/martial_icons_v4'
REF = ROOT / 'art_sources/xiangyang_icons_v3/style-approved.png'
FRAME = {'丁': '细窄的旧铁色方框，四角素净', '丙': '青铜色细方框，四角各一小方折纹', '乙': '暗紫铜方框，四角回纹压角',
         '甲': '鎏金方框，四角卷云纹压角，框线有细小錾刻', '绝': '朱漆描金方框，四角卷云加如意纹压角，顶边正中一枚小朱印'}
BG = {'丁': '背景近乎纯色的深墨底，只有极淡的宣纸肌理；主体要明亮、线条粗而清楚，缩小后不能发灰',
      '丙': '背景深墨底，带一点与主色呼应的远处暗影；主体明亮、轮廓粗而清楚',
      '乙': '背景有一层很淡的远景（远山或水面剪影），不抢主体', '甲': '背景有清楚但暗淡的远景层次（山影、云气或江面），主体后方有柔和的主色逆光',
      '绝': '背景是一个完整的小场景（远山、江面、云海之一），层次丰富，主体后方有强烈但集中的主色逆光与少量流光'}
# 2026-10-08 复查后重画：主体太弱或缩小后发空的，改写画面主体（覆盖 icon_subject）
SUBJECT_OVERRIDE = {'gy_s3': '一道金白剑脊从左下向右上笔直贯穿厚重墨云，剑脊占画面对角线大半，剑锋处云层被劈开、透出一束天光，主体粗而亮。',
                    'bh_s5b': '一圈由十二枚发光银针组成的环，针尖都指向中心，中心一点青绿亮光，环外有经络光线连接针尾，主体饱满占满画面七成。'}
ELEM = {'炎': '朱橙', '寒': '霜蓝', '雷': '电金带紫', '风': '青绿', '阳': '暖金', '阴': '黛紫'}


def items():
    tx = json.loads((DOC / 'skill-text-v4.json').read_text())
    cat = json.loads((DOC / 'catalog.json').read_text())
    lin = json.loads((DOC / 'lineage-v3-moves.json').read_text())
    for m in cat['skills'] + lin['moves']:
        t = tx['moves'].get(m['id'])
        if t:
            color = ELEM.get(m.get('element') or '', (t['vfx_v4'].get('主色') or '兵器本色').split('，')[0])
            yield dict(id=m['id'], name=m['name'], grade=m['grade'], kind='招式', color=color, subject=SUBJECT_OVERRIDE.get(m['id'], t['icon_subject']))
    for h in cat['hearts'] + lin.get('hearts', []):
        t = tx['hearts'].get(h['id'])
        if t:
            yield dict(id=h['id'], name=h['name'], grade=h['grade'], kind='内功', color=(t['vfx_v4'].get('主色') or '内息白').split('，')[0], subject=t['icon_subject'])


def prompt(it):
    body = ('内功图标：画内息流转与修习意象，不画书卷、器物、打坐人。' if it['kind'] == '内功' else '招式图标：画招式形成的气劲、兵器轨迹或技法意象。')
    return f"""Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）

参考图：附带的“品阶素材·评审样张”是本项目已批准的画风。沿用它的精细手绘墨彩、笔触质感、光影和配色气质，但不要复制其中任何一个具体图案，也不要画表格、文字或标题。

画一个南宋武侠游戏的{it['kind']}图标。名称「{it['name']}」，{it['grade']}级，主色：{it['color']}。{body}

画面主体：{it['subject']}

构图与容器：正方形图标，外圈是装饰边框（{FRAME[it['grade']]}；边框必须清楚可见、四边完整、颜色与深色画面有明显反差），框内是深色画面。{BG[it['grade']]}。只有一个视觉焦点，主体占框内画面约七成，构图有明确的方向和动势（斜向、纵向或螺旋收束），不要左右对称的蝴蝶形或 X 形交叉构图（题材本身要求上下对称的除外）。掌法只画掌风、掌印形气劲，不画手臂。

画工要求：精细手绘墨彩，主体有清楚的明暗体积、边缘光和材质；主色只用在主体的气劲和逆光上；粒子与飞溅只能少量点缀在运动方向上，不要满屏碎石、烟团、随机墨点。缩小到 48 像素时仍能一眼认出主体。不要文字、数字、水印、西式奇幻元素。

输出：1024×1024 PNG，边框贴近画布边缘。完成后把生成的 PNG 复制到当前目录，文件名 {it['id']}.png，然后结束。
"""


def run(it):
    out = OUT / f"{it['id']}.png"
    p = prompt(it)
    (OUT / f"{it['id']}.prompt.txt").write_text(p)
    t0 = time.time()
    r = subprocess.run(['codex', 'exec', '--skip-git-repo-check', '--enable', 'image_generation', '-s', 'workspace-write', '-C', str(OUT), '-i', str(REF), '-'],
                       input=p, capture_output=True, text=True, timeout=2400)
    (OUT / f"{it['id']}.codex.log").write_text(r.stdout + '\n--- stderr ---\n' + r.stderr)
    if not out.exists():
        print('FAILED', it['id'], flush=True)
        return
    data = out.read_bytes()
    json.dump({'id': it['id'], 'name': it['name'], 'grade': it['grade'], 'kind': it['kind'], 'reference': str(REF.relative_to(ROOT)),
               'tool': 'codex exec + 内置 image_gen（服务端选模型；提示词含 gpt-image-2.5 要求，未经核实）', 'sha256': hashlib.sha256(data).hexdigest(),
               'seconds': round(time.time() - t0), 'generated': time.strftime('%Y-%m-%d %H:%M:%S')}, open(OUT / f"{it['id']}.json", 'w'), ensure_ascii=False, indent=2)
    print('saved', it['id'], f'{time.time() - t0:.0f}s', flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', nargs='*')
    ap.add_argument('--workers', type=int, default=6)
    ap.add_argument('--limit', type=int, default=0)
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    todo = [it for it in items() if (not a.only or it['id'] in a.only) and not (OUT / f"{it['id']}.png").exists()]
    if a.limit:
        todo = todo[:a.limit]
    print(len(todo), 'to generate', flush=True)
    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        list(ex.map(run, todo))


if __name__ == '__main__':
    main()
