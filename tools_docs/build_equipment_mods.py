#!/usr/bin/env python3
"""装备对技能的影响 v1：给 catalog.json 每件装备写入可结算的 skill_mods，并在 equipment.md 生成说明表。

规则（2026-10-08，用户要求“完成所有的任务”中的装备影响技能）：
- 兵器：决定可用招式的兵器类（剑招需剑，拳掌招可空手，内功与通用步法不限）；乙级以上带一项属性亲和（该属性招式伤害 +N%）。
- 护具：异常抗性；丙一种 15%，乙两种 20%，甲三种 25%，绝全部 10% 外加一种 30%。
- 佩饰：属性伤害加成、某种异常施加率加成、或我方某种异常持续 −1。
- 上限：同一异常抗性合计 ≤ 60%；属性亲和与条件增伤共用 30% 加法池；装备原有特性保留。
生成链中可在 build_skill_docs.py 之前或之后运行（只改 equipment 字段与 equipment.md 的标记段落）。
"""
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
START, END = '<!-- equip-mods:start -->', '<!-- equip-mods:end -->'
STATUSES = ['中毒', '流血', '内伤', '封穴', '眩晕', '目眩', '心乱', '惊惧', '迟滞']
# id → skill_mods
MODS = {
    # 兵器：属性亲和（乙级以上）
    'eq_cloud_sword': {'element_bonus': {'风': .06}},
    'eq_sunset_sword': {'element_bonus': {'阳': .08}},
    'eq_return_sword': {'element_bonus': {'风': .08, '阳': .08}},
    'eq_brace': {'element_bonus': {'雷': .06}},
    'eq_heavy_brace': {'element_bonus': {'阳': .08}},
    'eq_thread_needle': {'element_bonus': {'阴': .06}},
    'eq_return_needle': {'element_bonus': {'阴': .08}},
    'eq_lock_dagger': {'element_bonus': {'阴': .06}},
    'eq_ember_dagger': {'element_bonus': {'炎': .08}, 'status_chance': {'流血': .10}},
    'eq_ember_saber': {'element_bonus': {'炎': .06}},
    'eq_storm_saber': {'element_bonus': {'雷': .08}},
    'eq_boat_pole': {'element_bonus': {'寒': .06}},
    'eq_fan': {'element_bonus': {'风': .06}},
    'eq_umbrella': {'element_bonus': {'阴': .06}},
    'eq_throwing_blades': {'element_bonus': {'风': .06}},
    'eq_work_hammer': {'element_bonus': {'雷': .06}},
    'eq_qin_night': {'element_bonus': {'阴': .06}, 'status_chance': {'封穴': .08, '心乱': .08}},
    'eq_flute_guanshan': {'element_bonus': {'风': .08}, 'status_chance': {'惊惧': .08}},
    'eq_flute_bamboo': {'status_chance': {'迟滞': .05}},
    # 护具：异常抗性
    'eq_padded_coat': {'status_resist': {'流血': .15}},
    'eq_sword_coat': {'status_resist': {'目眩': .20, '迟滞': .20}},
    'eq_medical_robe': {'status_resist': {'中毒': .20, '流血': .20}},
    'eq_guard_vest': {'status_resist': {'眩晕': .20, '流血': .20}},
    'eq_dancer_layer': {'status_resist': {'心乱': .20, '惊惧': .20}},
    'eq_hidden_coat': {'status_resist': {'流血': .25, '内伤': .25, '惊惧': .25}},
    'eq_old_mantle': {'status_resist': {**{s: .10 for s in STATUSES}, '惊惧': .30}},
    # 佩饰：属性加成、施加率、我方异常持续缩短
    'eq_needle_tag': {'status_chance': {'封穴': .08}},
    'eq_cloud_tassel': {'element_bonus': {'风': .06}},
    'eq_guard_buckle': {'status_resist': {'内伤': .20}},
    'eq_route_knot': {'status_resist': {'迟滞': .30}, 'element_bonus': {'风': .04}},
    'eq_case_tag': {'status_resist': {'封穴': .15}},
    'eq_lamp_pendant': {'status_resist': {'心乱': .20}},
    'eq_kept_word': {'status_resist': {'惊惧': .30}, 'element_bonus': {'阳': .06}},
    'eq_home_token': {'status_duration_minus': {s: 1 for s in ['封穴', '目眩', '心乱', '惊惧']}},
}


def text(m):
    out = []
    for k, v in (m.get('element_bonus') or {}).items():
        out.append(f'{k}劲招式伤害 +{int(round(v * 100))}%')
    for k, v in (m.get('status_chance') or {}).items():
        out.append(f'施加{k}基础率 +{int(round(v * 100))}%')
    r = m.get('status_resist') or {}
    if r:
        if len(r) == len(STATUSES):
            hi = [k for k, v in r.items() if v > .1]
            out.append('全部异常抗性 +10%' + (f'，{"、".join(hi)}抗性 +{int(round(r[hi[0]] * 100))}%' if hi else ''))
        else:
            out.append('、'.join(r) + f'抗性 +{int(round(list(r.values())[0] * 100))}%')
    d = m.get('status_duration_minus') or {}
    if d:
        out.append('我方' + '、'.join(d) + '持续 −1（最少 1）')
    return '；'.join(out)


def main():
    p = DOC / 'catalog.json'
    c = json.loads(p.read_text())
    ids = {e['id'] for e in c['equipment']}
    assert set(MODS) <= ids, set(MODS) - ids
    for e in c['equipment']:
        m = MODS.get(e['id'])
        if m:
            e['skill_mods'] = m
            e['skill_mods_text'] = text(m)
        else:
            e.pop('skill_mods', None)
            e['skill_mods_text'] = ''
        e['weapon_class'] = {'剑': '剑', '刀': '刀', '锤': '刀', '棍': '长兵', '伞': '长兵', '琴': '音律', '笛': '音律', '扇': '暗器', '暗器': '暗器', '拳': '拳掌', '医具': None}.get(e.get('weapon'))
    p.write_text(json.dumps(c, ensure_ascii=False, indent=2) + '\n')
    L = [START, '## 装备对技能的影响 v1（2026-10-08，自动生成）', '',
         '由 `tools_docs/build_equipment_mods.py` 生成，数据在 catalog.json 的 `skill_mods`。原有特性（上表“效果”）保留。',
         '', '- **兵器**决定能用的招式：剑招需装备剑、刀招需刀、长兵招需棍篙伞、音律招需琴笛、暗器招需暗器或扇；拳掌招可空手；内功与通用步法不限。乙级以上兵器带一项属性亲和。',
         '- **护具**提供异常抗性：丙一种 15%，乙两种 20%，甲三种 25%，绝全部 10% 外加一种 30%。',
         '- **佩饰**提供属性伤害加成、异常施加率加成，或缩短我方异常持续。',
         '- **上限**：同一异常抗性（护具、佩饰、希声诀等合计）≤ 60%；属性亲和计入条件增伤的 30% 加法池。', '',
         '| 槽位 | 装备 | 品阶 | 原有特性 | 对技能的影响 |', '| --- | --- | --- | --- | --- |']
    slot = {'weapon': '兵器', 'armor': '护具', 'acc': '佩饰'}
    for e in c['equipment']:
        L.append(f"| {slot.get(e['slot'], e['slot'])} | {e['name']} | {e['grade']} | {e['effect']} | {e['skill_mods_text'] or '—'} |")
    L += ['', END]
    q = DOC / 'equipment.md'
    t = q.read_text()
    block = '\n'.join(L)
    t = re.sub(re.escape(START) + r'.*?' + re.escape(END), block, t, flags=re.S) if START in t else t.rstrip('\n') + '\n\n' + block + '\n'
    q.write_text(t)
    print(json.dumps({'有影响的装备': len(MODS), '装备总数': len(c['equipment'])}, ensure_ascii=False))


if __name__ == '__main__':
    main()
