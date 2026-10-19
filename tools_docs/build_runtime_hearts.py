#!/usr/bin/env python3
"""v3 内功接入运行时：把 build_hearts_numbers.py 写好的 20 门内功转成运行时 XINFA 结构。

接在 tools_docs/build_hearts_numbers.py 之后运行（数值版本 HEARTS-NUM-2）：
  python3 tools_docs/build_hearts_numbers.py && python3 tools_docs/build_runtime_hearts.py
输入：docs/design/martial-review/catalog.json 的 hearts（18 门）与 lineage-v3-moves.json 的 hearts（清徽阁 2 门）。
输出：js/martial-hearts-runtime.js（index.html 中在 martial-structure.js 之前加载）。

与旧 13 门的关系见 docs/design/martial-review/hearts-runtime.md：
- 旧门派心法（玉泉寺、丐帮、鹿门书院、太和观、京湖义勇、白鹇谷旧版）原样保留，兼容存档；
- xf_tuna《吐故纳新篇》就是运行中的 tuna（养成课程 B01 写入的 id），不另建 xf_tuna，改为把 v3 名称与数值套到 tuna 上；
- 其余 19 门以 v3 id（xf_*）新增注册。
学习门槛按 martial-lineage.md §3.2：内功路线主属性定力、副属性悟性，甲级起加根骨（绝级定力列并入主属性取较高值）。
被动只把运行时已有结算口的数值写进 per / t3 / t5；其余条件被动原样放在 v3n，由 martial-structure.js 的内功钩子结算或标为未实装（todo）。
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
OUT = ROOT / 'js/martial-hearts-runtime.js'

ALIAS = {'xf_tuna': 'tuna'}  # v3 id → 运行时 id（同一门心法）
SECT = {'guiyun': 'guiyun', 'white-heron': 'baixian', 'zhaochuan': 'zhaochuan', 'hechuan': 'hechuan', 'songfeng': 'songfeng',
        'guijintang': 'guijintang', 'qinghui': 'qinghui', 'alliance': None, 'patrol': None, 'independent': None, 'ye': None}
SECT_NAME = {'guiyun': '归云谷', 'zhaochuan': '照川剑派', 'hechuan': '合川拳门', 'songfeng': '松风观', 'guijintang': '归烬堂', 'qinghui': '清徽阁'}
GROUP_NAME = {'guiyun': '归云谷', 'white-heron': '白鹇谷', 'zhaochuan': '照川剑派', 'hechuan': '合川拳门', 'songfeng': '松风观', 'guijintang': '玄烛会·归烬堂',
              'qinghui': '清徽阁', 'alliance': '正道盟成员协同', 'patrol': '巡江司差务训练', 'independent': '通用／散人', 'ye': '叶蘅家传'}
# 内功路线门槛（martial-lineage.md §3.2）：主=定力 wil，副=悟性 wis，根骨 con；绝级“定力 10”低于主属性 15，取较高值
REQ = {'丁': {}, '丙': {'wil': 6}, '乙': {'wil': 9, 'wis': 6}, '甲': {'wil': 12, 'wis': 9, 'con': 8}, '绝': {'wil': 15, 'wis': 12, 'con': 11}}
# 被动数值 → 运行时已有结算口（menu.js mnXfSum / jianghu-model innerEffects）
PER_MAP = {'mmp_pct': ('pct', 'mmp'), 'mhp_pct': ('pct', 'mhp'), 'def_pct': ('pct', 'def'), 'crit_pct': ('add', 'crit'), 'heal_bonus': ('heal', None)}
TRAIT_MAP = {'post_battle_mp': 'postMp', 'post_battle_hp': 'postHp', 'battle_start_reveal': 'startReveal'}
TRAIT_ADD = {'speed': 'spd'}
# 由 martial-structure.js 内功钩子结算的 v3 被动键（其余登记为未实装）
HOOKED = {'status_chance', 'status_mp', 'first_control_bp', 'status_resist', 'regen_bonus', 'regen_damage_reduction', 'intercept_reduction', 'guard_cap',
          'revealed_damage', 'exposed_damage', 'exposed_damage_cap', 'after_attack_reduction', 'reveal_mp', 'first_reveal_mp', 'first_break_bp',
          'heal_cleanse', 'post_battle_party_hp', 'unload_mp', 'support_mp', 'staff_low_mp'}


def load():
    cat = json.loads((DOC / 'catalog.json').read_text())['hearts']
    lin = json.loads((DOC / 'lineage-v3-moves.json').read_text())['hearts']
    return cat + lin


def split_text(text):
    d3 = d5 = ''
    base = []
    for seg in text.split('；'):
        if seg.startswith('三层：'):
            d3 = seg[3:]
        elif seg.startswith('五层：'):
            d5 = seg[3:]
        else:
            base.append(seg)
    return '；'.join(base), d3, d5


def flavor(h):
    s = h.get('active_desc_v4', '')
    s = s.split('。')[0] + '。' if '。' in s else ''
    if s.startswith(h['name'] + '：'):
        s = s[len(h['name']) + 1:]
    return s


def convert(h):
    a, p = h['active_skill'], h['passive_skill']
    nums = p['numbers']
    per, t3, t5, v3n, todo = {}, {}, {}, {'per': {}, 't3': {}, 't5': {}}, set()
    for k, v in (nums.get('per') or {}).items():
        if k in PER_MAP:
            grp, key = PER_MAP[k]
            if grp == 'heal':
                per['heal'] = v
            else:
                per.setdefault(grp, {})[key] = v
        else:
            v3n['per'][k] = v
            if k not in HOOKED:
                todo.add('per')
    for tier, out in (('t3', t3), ('t5', t5)):
        for k, v in (nums.get(tier) or {}).items():
            if k in TRAIT_MAP:
                out[TRAIT_MAP[k]] = v
            elif k in TRAIT_ADD:
                out.setdefault('add', {})[TRAIT_ADD[k]] = v
            else:
                v3n[tier][k] = v
                if k not in HOOKED:
                    todo.add(tier)
    for k, v in nums.items():  # 顶层：按层数取值的数组或常量（守势、蓄锋、援护加成等）
        if k in ('per', 't3', 't5'):
            continue
        v3n[k] = v
        if k not in HOOKED:
            todo.add('per')
    base_text, d3, d5 = split_text(p['description'])
    if not d5 and (t5 or v3n['t5']) and '五层' in d3:  # 如地籁诀“三层：…（五层两处）”，五层节点沿用同一句
        d5 = d3
    # 顶层条件被动（不分三层、五层）没有实装时，在 t3 标记未实装，界面显示为“已登记”
    if d3 and ('t3' in todo or not t3 and not v3n['t3']):
        t3['todo'] = 1
    if d5 and ('t5' in todo or not t5 and not v3n['t5']):
        t5['todo'] = 1
    rid = ALIAS.get(h['id'], h['id'])
    rec = {
        'name': h['name'], 'slot': 'main' if h['slot'] == '主' else 'sub', 'sect': SECT[h['group']], 'xing': h['nature'], 'e': [],
        'req': REQ[h['grade']], 'per': per, 't3': t3, 't5': t5, 'd3': d3, 'd5': d5,
        'desc': (flavor(h) + ('养气：' + base_text + '。' if base_text else '')).strip(),
        'grade': h['grade'], 'group': h['group'], 'groupName': GROUP_NAME[h['group']], 'v3Id': h['id'],
        'passiveText': p['description'], 'v3n': v3n, 'unsettled': sorted(todo), 'numbersVersion': p.get('numbers_version'),
    }
    spec = [a['name'], a['effects'][0]['type'], a['mp'], a['cooldown_self_actions'], a['description'],
            [[e['type'], *e['values']] for e in a['effects']], a['target_mode']]
    return rid, rec, spec


def main():
    hearts = load()
    assert len(hearts) == 20, len(hearts)
    reg, specs = {}, {}
    for h in hearts:
        rid, rec, spec = convert(h)
        assert rid not in reg, rid
        reg[rid], specs[rid] = rec, spec
    data = {'version': 'RUNTIME-HEARTS-1', 'numbers': 'HEARTS-NUM-2', 'alias': ALIAS, 'sects': SECT_NAME, 'hearts': reg, 'specs': specs,
            'legacy': ['yq_xin', 'yq_shi', 'gb_xin', 'gb_shi', 'lm_xin', 'lm_bo', 'th_xin', 'th_zuo', 'yy_xin', 'yy_zhen', 'bx_xin', 'bx_du'],
            'successor': {'bx_xin': 'xf_baicao'}}
    js = ['/* 由 tools_docs/build_runtime_hearts.py 生成，勿手改。v3 内功（HEARTS-NUM-2）按 XINFA 结构注册；',
          ' * 关系见 docs/design/martial-review/hearts-runtime.md。须在 menu.js 之后、martial-structure.js 之前加载。 */',
          '(()=>{',
          'const D=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';',
          "window.MartialHeartsRuntime=D;if(typeof XINFA==='undefined')return;",
          "if(typeof MN_SECT!=='undefined')for(const[k,v]of Object.entries(D.sects))MN_SECT[k]=MN_SECT[k]||v;",
          '// tuna 保留旧 id（养成课程与存档写入的就是 tuna），名称与数值改用 v3《吐故纳新篇》',
          'for(const[id,f]of Object.entries(D.hearts))XINFA[id]=Object.assign(XINFA[id]||{},JSON.parse(JSON.stringify(f)));',
          '})();', '']
    OUT.write_text('\n'.join(js))
    print(json.dumps({'注册': len(reg), '新增': len([k for k in reg if k not in ALIAS.values()]), '改用v3': list(ALIAS.values()),
                      '含未实装被动': [k for k, v in reg.items() if v['unsettled']]}, ensure_ascii=False))


if __name__ == '__main__':
    main()
