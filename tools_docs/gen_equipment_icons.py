#!/usr/bin/env python3
"""装备图标 v1（武器 30 件，2026-10-08 武器数值落地时补）：沿用已采用的 v4“精绘”图标画风与品阶边框（docs/design/martial-review/icon-style-v4.md）。
画面主体取 catalog.json 装备的 visual（外观设计），单件器物、斜置、深墨底。生成走 codex exec 内置 image_gen（服务端选模型，提示词含 gpt-image-2.5 要求，未经核实）。
输出 art_sources/equipment_icons_v1/<id>.png 与 .prompt.txt/.json/.codex.log；已存在的跳过。随后 tools_docs/build_equipment_icons.py 整理为运行时小图。
用法：python3 tools_docs/gen_equipment_icons.py [--only eq_practice_sword] [--workers 6] [--slot weapon]
"""
import argparse, hashlib, json, subprocess, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
OUT = ROOT / 'art_sources/equipment_icons_v1'
REF = ROOT / 'art_sources/xiangyang_icons_v3/style-approved.png'
FRAME = {'丁': '细窄的旧铁色方框，四角素净', '丙': '青铜色细方框，四角各一小方折纹', '乙': '暗紫铜方框，四角回纹压角',
         '甲': '鎏金方框，四角卷云纹压角，框线有细小錾刻', '绝': '朱漆描金方框，四角卷云加如意纹压角，顶边正中一枚小朱印'}
ELEM = {'炎': '朱橙', '寒': '霜蓝', '雷': '电金带紫', '风': '青绿', '阳': '暖金', '阴': '黛紫'}


def items(slot):
    cat = json.loads((DOC / 'catalog.json').read_text())
    for e in cat['equipment']:
        if slot and e['slot'] != slot:
            continue
        eb = (e.get('skill_mods') or {}).get('element_bonus') or {}
        glow = '、'.join(ELEM[k] for k in eb if k in ELEM)
        kind = {'weapon': f"兵器道具图标：「{e['name']}」（{e['grade']}级，{e.get('weapon') or ''}）", 'armor': f"护具道具图标：「{e['name']}」（{e['grade']}级{e.get('armor_type') or ''}装）",
                'acc': f"佩饰道具图标：「{e['name']}」（{e['grade']}级{e.get('acc_class') or ''}类首饰）"}[e['slot']]
        pose = {'weapon': '以三分之二侧视角斜放（从左下到右上），完整露出', 'armor': '衣物平铺或挂在无形的衣架上（不画人体、不画衣架），正面略带透视，完整露出',
                'acc': '单件首饰斜放或悬垂，连同系绳或穗子完整露出，主体放大到填满画面'}[e['slot']]
        yield dict(id=e['id'], name=e['name'], grade=e['grade'], kind=kind, pose=pose, visual=e.get('visual') or e['name'], glow=glow)


def prompt(it):
    glow = f"器物边缘带一点点{it['glow']}色的淡淡逆光（表示属性亲和），不要发光特效。" if it['glow'] else '没有任何发光特效，只有器物本身的材质高光。'
    return f"""Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）

参考图：附带的“品阶素材·评审样张”是本项目已批准的图标画风。沿用它的精细手绘墨彩、笔触质感、光影和配色气质，但不要复制其中任何一个具体图案，也不要画表格、文字或标题。

画一个南宋武侠游戏的{it['kind']}。

画面主体：{it['visual']}。只画这一件器物，{it['pose']}，不被边框切断；写实的南宋形制与材质（木、铁、铜、金银、玉石、竹、布、丝绳、漆），有清楚的体积、材质纹理和边缘光。{glow}

构图与容器：正方形图标，外圈是装饰边框（{FRAME[it['grade']]}；边框必须清楚可见、四边完整），框内是近乎纯色的深墨底、极淡的宣纸肌理；器物占框内画面约七成，只有一个视觉焦点。缩小到 48 像素时仍能一眼认出是什么东西。

不要任何文字、数字、水印、人物、手、西式奇幻元素、魔法光效。

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
    json.dump({'id': it['id'], 'name': it['name'], 'grade': it['grade'], 'reference': str(REF.relative_to(ROOT)),
               'tool': 'codex exec + 内置 image_gen（服务端选模型；提示词含 gpt-image-2.5 要求，未经核实）', 'sha256': hashlib.sha256(out.read_bytes()).hexdigest(),
               'seconds': round(time.time() - t0), 'generated': time.strftime('%Y-%m-%d %H:%M:%S')}, open(OUT / f"{it['id']}.json", 'w'), ensure_ascii=False, indent=2)
    print('saved', it['id'], f'{time.time() - t0:.0f}s', flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', nargs='*')
    ap.add_argument('--workers', type=int, default=6)
    ap.add_argument('--slot', default='weapon')
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    todo = [it for it in items(a.slot) if (not a.only or it['id'] in a.only) and not (OUT / f"{it['id']}.png").exists()]
    print(len(todo), 'to generate', flush=True)
    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        list(ex.map(run, todo))


if __name__ == '__main__':
    main()
