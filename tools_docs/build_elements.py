#!/usr/bin/env python3
"""弱点类型 v2（对齐《八方旅人》6 兵器 + 6 属性）：给每个招式写入 weak_class 与 element。

写入 catalog.json skills[] 和 lineage-v3-moves.json moves[] 的两个字段：
- weak_class：兵器弱点类（剑、刀、长兵、音律、暗器、拳掌；短刀并入刀，扇并入暗器）；通用步法、医具为 null。
- element：内劲属性（炎、寒、雷、风、阳、阴）。门派功法逐招指定，每个门派恰好两种属性；人物技能按人物一种属性。
规则见 docs/design/weakness-system.md 第 3.1 节。需在 build_martial_lineage_v3.py 之后运行。
"""
from pathlib import Path
import json
import attack_expansion_data as EXP   # 攻击招式扩充 v1：逐招属性见该文件 ELEMENT（门派第二路仍守“每派两种属性”）

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
WEAPON_CLASS = {'吼': '音律', '剑': '剑', '刀': '刀', '锤': '刀', '棍': '长兵', '伞': '长兵', '琴': '音律', '笛': '音律', '琵琶': '音律', '箫': '音律', '扇': '暗器', '暗器': '暗器', '拳': '拳掌'}
ELEMENTS = ['炎', '寒', '雷', '风', '阳', '阴']
# 门派功法：每个门派两种属性（2026-10-08 用户要求），六种属性各被两个门派使用；逐招指定。
SECT_ELEMENT = {
    # 归云谷：风、阳（剑路风→绝级阳；拳掌路阳→绝级风）
    'gy_s3': '风', 'gy_s4': '风', 'gy_s5a': '阳', 'gy_s5b': '阳', 'gy_s5': '阳',
    'gy_p3': '阳', 'gy_p4b': '阳', 'gy_p5a': '风', 'gy_p5': '风',
    # 白鹇谷：寒、阴
    'bh_s1': '寒', 'bh_s5a': '阴',
    # 照川剑派：寒、阳
    'zc_s3': '寒', 'zc_s4': '阳', 'zc_s5a': '寒', 'zc_s5b': '阳', 'zc_s5': '寒',
    # 合川拳门：雷、炎
    'hc_s3': '雷', 'hc_s4b': '炎', 'hc_s5a': '雷', 'hc_s5': '雷',
    # 松风观：风、雷
    'sf_s4': '风', 'sf_s4b': '风', 'sf_s5a': '雷',
    # 归烬堂：炎、阴
    'gj_s2': '炎', 'gj_s3': '阴', 'gj_s4': '炎', 'gj_s4b': '炎', 'gj_s5a': '阴', 'gj_s5': '炎',
    # 巡江司：寒、雷
    'pj_s3': '寒', 'pj_s4b': '雷',
    # 清徽阁：阴（琴）、风（笛）
    'hui_q3': '阴', 'hui_q4b': '阴', 'hui_q5a': '阴', 'hui_q5': '阴', 'hui_d3': '风', 'hui_d4a': '风', 'hui_d5a': '风', 'hui_d5b': '风', 'hui_d5': '风',
    # 正道盟：风、阳
    'am_s1': '风', 'am_s3': '阳',
}
# 人物技能（暂缓）：按人物一种属性
PERSON_ELEMENT = {'yh_n': '阴', 'yl_s': '风', 'qx_s': '寒', 'lh_s': '阴', 'qf_s': '风', 'rq_s': '阴', 'hzc_s': '雷'}
SECT_PREFIX = ('gy_', 'bh_', 'zc_', 'hc_', 'sf_', 'gj_', 'pj_', 'am_', 'hui_')


def element_for(m):
    if m['id'] in EXP.MOVE_IDS:
        return EXP.ELEMENT.get(m['id'])
    if m['id'].startswith(SECT_PREFIX):
        return SECT_ELEMENT.get(m['id'])
    if (m.get('combat') or {}).get('total_power', 0) <= 0 or m.get('profile') not in ('B', 'X'):
        return None
    head, tail = m['id'].rsplit('_', 1)
    return PERSON_ELEMENT.get(head + '_' + tail[0])


def main():
    out = {}
    for f, key in [('catalog.json', 'skills'), ('lineage-v3-moves.json', 'moves')]:
        p = DOC / f
        d = json.loads(p.read_text())
        for m in d[key]:
            m['weak_class'] = WEAPON_CLASS.get(m.get('weapon'))
            m['element'] = element_for(m)
            assert m['element'] in ELEMENTS + [None], m['id']
            out[m['id']] = (m['weak_class'], m['element'])
        p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    cover = {e: sorted(k for k, v in out.items() if v[1] == e) for e in ELEMENTS}
    sects = {}
    for k, (_, e) in out.items():
        if e and k.startswith(SECT_PREFIX):
            sects.setdefault(k.split('_')[0], set()).add(e)
    assert all(len(v) == 2 for v in sects.values()), sects
    print(json.dumps({'招式数': {e: len(v) for e, v in cover.items()}, '门派': {k: sorted(v) for k, v in sects.items()}}, ensure_ascii=False))
    return cover


if __name__ == '__main__':
    main()
