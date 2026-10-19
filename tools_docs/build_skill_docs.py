#!/usr/bin/env python3
"""把 v3 规则（弱点类型、属性、异常、防御强化、学习门槛、内功数值）同步到给人看的技能文档。

在生成链最后运行：complete_martial_moves_v3 → build_martial_lineage_v3 → build_elements → build_status → build_hearts_numbers → build_skill_docs → build_martial_library。
- 每个招式写 effect_v3：原效果说明 + 兵器类／属性 + 施加异常 + 解除层级 + 防御强化（不改原 effect 文本）。
- 各门派招式分册顶部写“v3 招式总览”（标记段落，可重复生成）。
- move-contracts.md 末尾写“v3 补充：弱点类型、属性与异常”。
- hearts.md 的“主动与被动清单”换成内功数值 v1 的表；rules.md 状态词典加指向异常状态 v1 的说明。
- 清徽阁琴、笛装备写进 catalog.json equipment（方案，未生成图标）；weapon.md 末尾写兵器与弱点类的对应。
"""
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
TIER = {'low': '低级解除（中毒、流血、目眩、迟滞中的一项）', 'mid': '中级解除（任意一项异常）', 'all': '解除全部可解除异常'}
GROUP_FILE = {'guiyun': 'guiyun.md', 'white-heron': 'white-heron.md', 'zhaochuan': 'zhaochuan.md', 'hechuan': 'hechuan.md', 'songfeng': 'songfeng.md',
              'guijintang': 'guijintang.md', 'patrol': 'patrol.md', 'alliance': 'alliance.md', 'qinghui': 'qinghui.md'}
START, END = '<!-- v3-skills:start -->', '<!-- v3-skills:end -->'


def put_block(text, block, at_top=True):
    if START in text:
        return re.sub(re.escape(START) + r'.*?' + re.escape(END), block, text, flags=re.S)
    if at_top:
        lines = text.split('\n')
        i = 1 if lines and lines[0].startswith('#') else 0
        return '\n'.join(lines[:i] + ['', block, ''] + lines[i:])
    return text.rstrip('\n') + '\n\n' + block + '\n'


def status_text(m):
    out = []
    for e in m['combat']['effects']:
        if e['type'] == 'apply_status':
            out.append(f"{'每段' if e.get('per_hit') else ''}{int(round(e['chance'] * 100))}% {e['status']}{'×' + str(e['stacks']) if e.get('stacks', 1) > 1 else ''}")
    return '、'.join(out)


def summary(m):
    parts = []
    tag = '·'.join(x for x in [m.get('weak_class'), (m.get('element') or '') and m['element'] + '劲'] if x)
    if tag:
        parts.append(f'弱点类型：{tag}')
    st = status_text(m)
    if st:
        parts.append(f'施加：{st}（BP 每档 +10%，破势时必中）')
    if m.get('cleanse_tier'):
        parts.append(TIER[m['cleanse_tier']])
    if m.get('usage') == 'defend_enhance':
        parts.append('防御强化：不能单独施放，选“防御”时自动附带本招效果，不耗内力')
    return '；'.join(parts)


def main():
    cat = json.loads((DOC / 'catalog.json').read_text())
    lin = json.loads((DOC / 'lineage-v3-moves.json').read_text())
    sysd = json.loads((DOC / 'martial-systems.json').read_text())
    moves = {}
    for d in (cat['skills'], lin['moves']):
        for m in d:
            s = summary(m)
            m['effect_v3'] = m['effect'] + ('。' + s if s else '')
            moves[m['id']] = m
    # 技能描述与特效分镜 v4（skill-text-v4.json）：合并进数据，并生成给人看的文档
    tp = DOC / 'skill-text-v4.json'
    if tp.exists():
        tx = json.loads(tp.read_text())
        for d in (cat['skills'], lin['moves']):
            for m in d:
                t = tx['moves'].get(m['id'])
                if t:
                    m['desc_v4'], m['vfx_v4'], m['icon_subject'] = t['desc_v4'], t['vfx_v4'], t['icon_subject']
        for h in cat['hearts'] + lin.get('hearts', []):
            t = tx['hearts'].get(h['id'])
            if t:
                h['active_desc_v4'], h['passive_desc_v4'], h['vfx_v4'], h['icon_subject'] = t['active_desc_v4'], t['passive_desc_v4'], t['vfx_v4'], t['icon_subject']
        sysd_ = json.loads((DOC / 'martial-systems.json').read_text())
        order = [m['id'] for a in sysd_['systems'] for m in (a.get('moves') or [{'id': i} for i in a['skill_ids']])]
        allm = {m['id']: m for m in cat['skills'] + lin['moves']}
        X = ['# 技能描述与特效分镜 v4', '', '> 由 `tools_docs/build_skill_docs.py` 从 `skill-text-v4.json` 生成。描述给玩家看；特效分镜按[伤害数字与战斗浮字规范](../damage-numbers.md)第 6 节四拍写，供特效制作。', '']
        cur = None
        for a in sysd_['systems']:
            grp = a.get('group_name')
            if grp != cur:
                X += [f'## {grp}', '']
                cur = grp
            X += [f"### 《{a['name']}》" + (f"（{a['grade']}级）" if a.get('grade') else ''), '']
            for mid in [m['id'] for m in a.get('moves', [])] or a['skill_ids']:
                m = allm.get(mid)
                if not m or 'desc_v4' not in m:
                    continue
                v = m['vfx_v4']
                X += [f"**{m['name']}**（{m['grade']}）　{m['desc_v4']}", '',
                      f"- 特效（{v.get('档位', '')}，主色：{v.get('主色', '')}）：起手 {v.get('起手', '')}；出手 {v.get('出手', '')}；命中 {v.get('命中', '')}；收势 {v.get('收势', '')}",
                      f"- 数字：{v.get('数字', '')}", f"- 图标主体：{m['icon_subject']}", '']
        X += ['## 内功', '']
        for h in cat['hearts'] + lin.get('hearts', []):
            if 'active_desc_v4' not in h:
                continue
            v = h['vfx_v4']
            X += [f"### {h['name']}（{h['grade']}）", '', f"- 主动·{h['active_skill']['name']}：{h['active_desc_v4']}", f"- 被动：{h['passive_desc_v4']}",
                  f"- 特效（{v.get('档位', '')}，主色：{v.get('主色', '')}）：起手 {v.get('起手', '')}；出手 {v.get('出手', '')}；命中 {v.get('命中', '')}；收势 {v.get('收势', '')}",
                  f"- 图标主体：{h['icon_subject']}", '']
        (DOC / 'skill-text-v4.md').write_text('\n'.join(X) + '\n')

    # 清徽阁装备（方案）
    EQ = [
        ('eq_qin_practice', '桐木练琴', '丁', '琴', '清徽阁弟子', '可靠基础攻击，无附带特性', '入门课借用，或在阁中斫琴房购置', '素面桐木琴身、七弦、无漆饰、简单雁足',
         '桐木是斫琴常用木料，练琴说明它是入门练习器，不冒充名琴。'),
        ('eq_flute_bamboo', '竹节横笛', '丙', '笛', '清徽阁弟子', '笛路招式内力略降，无其他特性', '谢晚笛指点后由阁中制笛', '紫竹单节横笛、六孔、穿青色笛囊',
         '竹节横笛直述材质与形制，表示规整的入门好笛。'),
        ('eq_qin_night', '夜阑琴', '乙', '琴', '柳含烟（琴路）', '琴路施加异常的基础率小幅提高', '静夜琴诀考校通过后阁主所赠', '断纹漆面、玉徽十三点、深色琴轸与流苏',
         '夜阑取夜深人静之意，与《静夜琴诀》同源，琴音低沉长韵。'),
        ('eq_flute_guanshan', '关山笛', '甲', '笛', '笛路传人', '笛路群体招式命中后，全队下一次受到的惊惧持续减一回合', '谢晚笛亲传《关山笛诀》时所授', '铁竹笛身、三道银箍、笛尾系旧军中红绳',
         '关山取边塞笛曲《关山月》，是守城传讯前辈留下的笛，红绳纪念当年守城；能在战阵中远传。'),
    ]
    by = {e['id']: e for e in cat['equipment']}
    tmpl = by['eq_umbrella']
    for (eid, name, grade, wpn, users, effect, obtain, visual, meaning) in EQ:
        # 以留灯伞为模板复制时去掉它的兵器类与技能影响（2026-10-08 修：琴笛曾被误记为长兵、并带上伞的阴劲 +6%），按装备效果表重新套用
        e = {k: v for k, v in tmpl.items() if k not in ('skill_mods', 'skill_mods_text', 'weapon_class')}
        e.update(id=eid, name=name, grade=grade, phase='TRAVEL', weapon=wpn, users=users, effect=effect, obtain=obtain, visual=visual, icon_id='icon_' + eid,
                 status='draft_pending_review', asset_status='not_generated', planned_path=f'art_sources/martial_icons_review/raw/icon_{eid}.png',
                 prompt=f"精细手绘二维南宋武侠墨彩图标，参考 art_sources/xiangyang_icons_v3/style-approved.png 的已批准画风；自然细墨边、细致水粉笔触、清楚主轮廓与集中高光。单件、正方形、透明RGBA背景，原稿至少512×512。主体约占70—80%，生产512帧四边至少48px安全边；48px仍可辨识。无文字、无数字、无边框、无底板、无水印；不做摄影、3D或粗像素。对象：{name}，{grade}级。主体类别：实体物件，材质、构造与用途相符。独有构图：{visual}。等级色只作辅助，形状区别优先；不要通用换色旋涡，不增加设定外的龙、法阵或召唤物。",
                 naming={'meaning': meaning, 'basis': obtain, 'design_anchor': visual, 'lore_text': meaning, 'status': 'design_proposal_pending_story_review'})
        import build_equipment_mods as bem
        e['weapon_class'] = '音律'
        if eid in bem.MODS:
            e['skill_mods'] = bem.MODS[eid]
        e['skill_mods_text'] = bem.text(bem.MODS[eid]) if eid in bem.MODS else ''
        if eid in by:
            cat['equipment'][cat['equipment'].index(by[eid])] = e
        else:
            cat['equipment'].append(e)
    (DOC / 'catalog.json').write_text(json.dumps(cat, ensure_ascii=False, indent=2) + '\n')
    (DOC / 'lineage-v3-moves.json').write_text(json.dumps(lin, ensure_ascii=False, indent=2) + '\n')

    arts = [a for a in sysd['systems'] if a['kind'] == 'external_art']
    for group, fname in GROUP_FILE.items():
        rows = [a for a in arts if a['group'] == group]
        if not rows:
            continue
        L = [START, '## v3 招式总览（自动生成）', '',
             '由 `tools_docs/build_skill_docs.py` 按[门派功法传承](../martial-lineage.md)、[弱点系统](../weakness-system.md)、[异常状态](../status-effects.md)生成，下文旧稿与本表冲突时以本表为准。名称标＊的是 v3 新起的名称：2026-10-08 定稿的一批，以及 2026-10-11 [攻击招式扩充 v1](attack-expansion-v1.md) 新增的第二路（设计方案）。', '',
             '| 功法 | 学习条件 | 招式（开启） | 弱点类型 | 内力 | 威力／段 | 异常／解除 | 用法 |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
        for a in rows:
            for i, mv in enumerate(a['moves']):
                m = moves[mv['id']]
                c = m['combat']
                tag = '·'.join(x for x in [m.get('weak_class') or '—', (m.get('element') or '') and m['element'] + '劲'] if x)
                st = status_text(m) or (TIER[m['cleanse_tier']].split('（')[0] if m.get('cleanse_tier') else '—')
                use = '防御强化' if m.get('usage') == 'defend_enhance' else ('绝招 3BP' if m.get('profile') == 'X' else '主动')
                art = f"{a['grade']}《{a['name']}{'' if a['name_status'] == 'kept' else '＊'}》" if i == 0 else ''
                req = (f"{'—' if not a['prerequisite'] else '前一门' + str(a['prerequisite'].get('level')) + '重'}；{a['learn_req_text']}") if i == 0 else ''
                L.append(f"| {art} | {req} | {m['name']}{'' if mv['status'] == 'existing_contract' else '＊'}（{mv['unlock_level']}重） | {tag} | {c['mp']} | {c['total_power']}／{c['base_hits']} | {st} | {use} |")
        L += ['', END]
        block = '\n'.join(L)
        p = DOC / fname
        if not p.exists():
            p.write_text(f"# {rows[0]['group_name']} · 招式方案 v3\n\n[评审首页](README.md) · [门派设定](../factions/qinghui.md)\n")
        p.write_text(put_block(p.read_text(), block))

    # 招式合同补充
    L = [START, '## v3 补充：弱点类型、属性与异常（自动生成）', '', '| ID | 招式 | 兵器类 | 属性 | 施加异常 | 解除 | 用法 |', '| --- | --- | --- | --- | --- | --- | --- |']
    for m in moves.values():
        L.append(f"| {m['id']} | {m['name']} | {m.get('weak_class') or '—'} | {m.get('element') or '—'} | {status_text(m) or '—'} | {m.get('cleanse_tier') or '—'} | {'防御强化' if m.get('usage') == 'defend_enhance' else '主动'} |")
    L += ['', END]
    p = DOC / 'move-contracts.md'
    p.write_text(put_block(p.read_text(), '\n'.join(L), at_top=False))

    # 内功清单
    hearts = cat['hearts'] + lin.get('hearts', [])
    T = ['## 主动与被动清单（内功数值 v1，自动生成）', '', '数值来源 `tools_docs/build_hearts_numbers.py`，详见[内功数值](hearts-numbers.md)。主动耗一次行动、BP 不强化，冷却按本人行动次数计；被动按层数累计，三层、五层强化同一被动。', '',
         '| 内功 | 品阶 | 主动（内力／冷却） | 主动效果 | 被动 |', '| --- | --- | --- | --- | --- |']
    for h in hearts:
        a = h['active_skill']
        T.append(f"| {h['name']} | {h['grade']} | {a['name']}（{a['mp']}／{a.get('cooldown_self_actions', '—')}） | {a['description']} | {h['passive_skill']['description']} |")
    p = DOC / 'hearts.md'
    t = p.read_text()
    t = re.sub(r'## 主动与被动清单.*?(?=\n## )', '\n'.join(T) + '\n', t, count=1, flags=re.S)
    p.write_text(t)

    # 状态词典说明
    p = DOC / 'rules.md'
    t = p.read_text()
    note = '> 2026-10-08：异常状态（中毒、流血、内伤、封穴、眩晕、目眩、心乱、惊惧、迟滞）以[异常状态 v1](../status-effects.md)为准；本表保留卸力、援护、守势、削弱、暴露、看破、濒危的定义。迟滞在两处定义一致。'
    if note not in t:
        t = t.replace('## 4. 状态词典与防止循环\n', '## 4. 状态词典与防止循环\n\n' + note + '\n', 1)
    p.write_text(t)

    # 兵器与弱点类
    W = [START, '## 兵器与弱点类型（2026-10-08，自动生成）', '', '本作没有“短刃”一类：原短刃并入刀（称短刀），扇归暗器，八方短剑位换成音律（琴、笛、琵琶、箫）。见[弱点系统](../weakness-system.md)。', '',
         '| 弱点类型 | 兵器 | 装备 |', '| --- | --- | --- |']
    cls = {'剑': ['剑'], '刀': ['刀', '锤'], '长兵': ['棍', '伞'], '音律': ['琴', '笛', '琵琶', '箫'], '暗器': ['暗器', '扇'], '拳掌': ['拳']}
    for k, ws in cls.items():
        eq = [f"{e['name']}（{e['grade']}）" for e in cat['equipment'] if e.get('slot') == 'weapon' and e.get('weapon') in ws]
        W.append(f"| {k} | {'、'.join(ws)} | {'、'.join(eq) or '—'} |")
    W += ['', END]
    p = DOC / 'weapon.md'
    p.write_text(put_block(p.read_text(), '\n'.join(W), at_top=False))
    print(json.dumps({'招式说明': len(moves), '分册': len(GROUP_FILE), '内功': len(hearts), '清徽装备': len(EQ)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
