#!/usr/bin/env python3
"""秘籍封面图标 v1（docs/design/secret-manuals.md §5，2026-10-08 用户要求“完成”）。

每本秘籍一张：书的材质随品阶（丁粗麻纸小册 → 绝紫檀书匣），封面中部是与路线相关的意象，用功法属性主色；
题签只画空白纸条、不写字；边框沿用 v4 技能图标的品阶边框。风格参照已批准的 v4 图标样张（-i 参考图）。
生成走 codex exec 内置 image_gen（服务端选模型，提示词含 gpt-image-2.5 要求，未经核实）。
输出 art_sources/manual_icons_v1/<道具 id>.png 及 .prompt.txt / .json / .codex.log；已存在的跳过，可续跑。
v3 内功（2026-10-08 接入运行时）：封面中部画该心法 icon_subject 的内息意象，书皮仍按品阶。
用法：python3 tools_docs/gen_manual_icons.py [--only mj_art_gy_s2] [--workers 6]
随后运行 tools_docs/build_manual_icons.py 生成运行时小图与图标表。
"""
import argparse, hashlib, json, subprocess, time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
OUT = ROOT / 'art_sources/manual_icons_v1'
REF = ROOT / 'art_sources/xiangyang_icons_v3/style-approved.png'
FRAME = {'丁': '细窄的旧铁色方框，四角素净', '丙': '青铜色细方框，四角各一小方折纹', '乙': '暗紫铜方框，四角回纹压角',
         '甲': '鎏金方框，四角卷云纹压角，框线有细小錾刻', '绝': '朱漆描金方框，四角卷云加如意纹压角，顶边正中一枚小朱印'}
BOOK = {'丁': '一本粗麻纸线装小册，纸边毛糙泛黄，麻绳装订，书页微卷',
        '丙': '一本深蓝布面线装书，白色丝线四眼装订，书角略有磨损',
        '乙': '一本青绢面线装书，书角包着暗铜护角，丝线装订整齐',
        '甲': '一函织锦函套中的线装书，函套半开露出书脊，系着一枚玉别子',
        '绝': '一只紫檀书匣，匣盖半启，里面是一册锦面金线装订的秘籍，书页间透出一缕主色的淡光'}
ROUTE = {'剑': '一柄斜置的剑影', '刀': '一柄刀影', '拳掌': '一个掌印形的气劲', '长兵': '一根斜横的长棍', '暗器': '三枚细长银针',
         '音律': '一张古琴与一支竹笛的剪影', '医': '一株药草与两枚银针', '步法': '几道步法足印与流动的气线',
         '针': '三枚细长银针', '药': '一只药葫芦与几片药草', '拳': '一个紧握的拳头形气劲', '步': '几道步法足印与流动的气线',
         '棍': '一根斜横的长棍', '琴': '一张古琴的剪影', '笛': '一支斜置的竹笛'}
# 江湖散学没有路线字段，按功法单独指定
JIANGHU_MOTIF = {'art_jh_fuhu': '一个紧握的拳头形气劲与虎爪纹', 'art_jh_liuye': '一柄细长的剑影与几片柳叶', 'art_jh_lianhua': '一个掌印与一朵莲花',
                 'art_jh_shuaibei': '一个掌印与碎裂的石碑', 'art_jh_bianfa': '一条盘卷的长鞭', 'art_jh_guafeng': '一道旋踢的腿风弧线'}
ELEM = {'炎': '朱橙', '寒': '霜蓝', '雷': '电金带紫', '风': '青绿', '阳': '暖金', '阴': '黛紫'}
INNER_MOTIF = {None: '一圈缓缓流转的白色气旋', 'yuquan': '一串佛珠绕着淡金气旋', 'gaibang': '一根竹杖与流动的气线', 'lumen': '一支毛笔与几缕书卷气',
               'taihe': '流动的云纹气旋', 'yiyong': '一面小军旗与沉稳的气旋', 'baixian': '一株药草与清浅的气旋'}
# v3 内功封面主色（取各门派配色的主色，catalog.json groups）
V3_COLOR = {'guiyun': '竹青与米白', 'white-heron': '药青与月白', 'zhaochuan': '霜白与靛蓝', 'hechuan': '赭红与铁灰', 'songfeng': '灰绿与石白',
            'guijintang': '墨紫、暗红与铜金', 'alliance': '绛青与米白', 'patrol': '深蓝与灰铁', 'independent': '淡墨与旧金', 'qinghui': '月白与霁青'}
INNER_SECT = {'tuna': None, 'yq_xin': 'yuquan', 'yq_shi': 'yuquan', 'gb_xin': 'gaibang', 'gb_shi': 'gaibang', 'lm_xin': 'lumen', 'lm_bo': 'lumen',
              'th_xin': 'taihe', 'th_zuo': 'taihe', 'yy_xin': 'yiyong', 'yy_zhen': 'yiyong', 'bx_xin': 'baixian', 'bx_du': 'baixian'}


def items():
    pl = json.loads((DOC / 'manual-placement.json').read_text())['manuals']
    sysm = {s['id']: s for s in json.loads((DOC / 'martial-systems.json').read_text())['systems']}
    moves = json.loads((DOC / 'lineage-v3-moves.json').read_text())['moves']
    cat = json.loads((DOC / 'catalog.json').read_text())['skills']
    v3 = {h['id']: h for h in json.loads((DOC / 'catalog.json').read_text())['hearts'] + json.loads((DOC / 'lineage-v3-moves.json').read_text())['hearts']}
    elem_of = {}
    for m in moves + cat:
        if m.get('system_id') and m.get('element'):
            elem_of.setdefault(m['system_id'], Counter())[m['element']] += 1
    for r in pl:
        if not r.get('manual', True):
            continue
        if r['kind'] == '外功':
            s = sysm.get(r['art'], {})
            route = s.get('path') or '拳掌'
            el = elem_of.get(r['art'])
            color = ELEM[el.most_common(1)[0][0]] if el else '淡墨与旧金'
            motif = JIANGHU_MOTIF.get(r['art']) or ROUTE.get(route, ROUTE['拳掌'])
        elif r.get('v3'):  # v3 内功：意象取该心法 icon_subject 的内息意象，主色取门派配色
            h = v3[r['art']]
            color = V3_COLOR.get(h['group']) or '月白与淡青'
            motif = '一个内息意象：' + h['icon_subject'].rstrip('。')
        else:
            color = '月白与淡青'
            motif = INNER_MOTIF[INNER_SECT.get(r['art'])]
        yield dict(id=r['item'], name=r['name'], grade=r['grade'], kind=r['kind'], color=color, motif=motif)


def prompt(it):
    return f"""Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）

参考图：附带的“品阶素材·评审样张”是本项目已批准的图标画风。沿用它的精细手绘墨彩、笔触质感、光影和配色气质，但不要复制其中任何一个具体图案，也不要画表格、文字或标题。

画一个南宋武侠游戏的秘籍道具图标（{it['kind']}秘籍，{it['grade']}级）。

画面主体：{BOOK[it['grade']]}。书以三分之二侧视角斜放，能看清封面与书脊厚度。封面左上竖贴一条空白题签纸条（纸条上绝对不要写任何字）。封面中部用{it['color']}色绘着{it['motif']}，像印在封面上的版画，不要从书里飞出来。

构图与容器：正方形图标，外圈是装饰边框（{FRAME[it['grade']]}），框内是深色画面，背景是近乎纯色的深墨底，带极淡的宣纸肌理；书占框内画面约七成，书后方有一点点{it['color']}色的柔和逆光。只有一个视觉焦点。

画工要求：精细手绘墨彩，书有清楚的体积、纸张与布料材质、边缘光；缩小到 48 像素时仍能一眼认出是一本书。不要任何文字、汉字、数字、水印、印章文字；不要人物、手、西式魔法书元素。

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
    json.dump({'id': it['id'], 'name': it['name'], 'grade': it['grade'], 'kind': it['kind'], 'reference': str(REF.relative_to(ROOT)),
               'tool': 'codex exec + 内置 image_gen（服务端选模型；提示词含 gpt-image-2.5 要求，未经核实）', 'sha256': hashlib.sha256(out.read_bytes()).hexdigest(),
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
