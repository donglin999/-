#!/usr/bin/env python3
"""内功数值 v1：给 18 门目标内功写入可结算的主动与被动数值。

唯一来源是本脚本的 HEARTS 表；写入 catalog.json 的 hearts[].active_skill / passive_skill，
并生成 docs/design/martial-review/hearts-numbers.md。战斗模拟器（tools_balance/combat_sim.cjs）读取同一份数据。

规则（沿功法结构规范 v3）：
- 每门内功恰好一个主动、一个被动；三层、五层是同一被动的强化节点。
- 主动：耗一次行动，BP 不强化；冷却按施者行动次数计。
- 被动“每层”数值按层数线性累计；t3/t5 是达到该层时追加的效果。
- 条件增伤与心法伤害加成共用 30% 加法池；减耗后有消耗的招式最少 1 内力；总减伤上限 60%。
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'

# 主动效果类型（模拟器与后续运行实现共用）：
# mp_restore(比例) heal_self(比例) heal_ally(治疗基值系数) regen_ally(每次行动末比例,次数)
# ding(攻击加成,受伤减免,自身行动次数) guard(受伤倍率,至下次行动) intercept(替一名同伴挡下一次单体攻击,减伤)
# reveal(处数) focus_next(下一击加成) exposure_buff(攻击加成,暴露) unload(比例) cleanse(处数) order_up(前移位数)
# guard_token(守势枚数) next_support_half(下一次支援技内力减半) counter(反击威力)
HEARTS = {
    'xf_tuna': dict(
        active=dict(name='归息', target='self', mp=0, cooldown=3, effects=[('mp_restore', .15)], text='回复内力上限15%（至少1点）'),
        per=dict(mmp_pct=.03), t3=dict(post_battle_mp=.10), t5=dict(post_battle_hp=.15),
        text='内力上限每层+3%；三层：战后回复10%内力；五层：战后另回复15%气血'),
    'xf_guiyun': dict(
        active=dict(name='敛云', target='self', mp=10, cooldown=3, effects=[('guard_token', 1), ('ding', .25, .15, 3)], text='得一枚守势，并定神3次行动：攻击+25%、所受伤害-15%'),
        per=dict(mhp_pct=.03), guard_on_defend=1, guard_bonus=[.08, .08, .12, .12, .16],
        text='气血上限每层+3%；防御或援护生效后得一枚守势（最多1枚），消耗守势的本门招式伤害+8%（三层12%，五层16%）'),
    'xf_guanlan': dict(
        active=dict(name='观岚', target='foe', mp=4, cooldown=3, effects=[('reveal', 1)], text='看破指定敌人一处未知弱点'),
        per=dict(revealed_damage=.02), t5=dict(first_reveal_mp=2),
        text='对已看破至少一处弱点的敌人，本人伤害每层+2%（五层10%）；五层：每战首次看破时回复2内力'),
    'xf_wanhe': dict(
        active=dict(name='归元', target='self', mp=10, cooldown=3, effects=[('heal_self', .18), ('guard_token', 1)], text='回复气血上限18%，并得一枚守势'),
        per=dict(mhp_pct=.03, mmp_pct=.03), guard_on_defend=1, guard_cap=[1, 1, 1, 1, 2], guard_bonus=[.15] * 5, guard_choice_reduction=.25,
        text='气血、内力上限每层+3%；守势消耗时二选一：本次伤害+15%，或下一次受击减伤25%；五层守势最多存2枚'),
    'xf_baicao': dict(
        active=dict(name='养元', target='ally', mp=10, cooldown=3, effects=[('heal_ally', 1.0)], text='指定存活同伴：回复一次治疗基值（单次不超过目标气血35%）'),
        per=dict(heal_bonus=.03), t3=dict(heal_cleanse=1), t5=dict(post_battle_party_hp=.05),
        text='治疗加成每层+3%（五层15%）；三层：本人治疗附带解除1项可驱散异常；五层：战后全队回复5%气血'),
    'xf_hemai': dict(
        active=dict(name='和脉', target='ally', mp=8, cooldown=3, effects=[('regen_ally', .06, 2)], text='指定同伴：其后2次行动结束时各回复6%气血上限'),
        per=dict(regen_bonus=.05), t3=dict(regen_damage_reduction=.05),
        text='本人施加的持续恢复总量每层+5%；三层：处于本人持续恢复中的同伴所受伤害-5%'),
    'xf_chengjiang': dict(
        active=dict(name='澄心', target='foe', mp=8, cooldown=3, effects=[('reveal', 1), ('focus_next', .25)], text='看破指定敌人一处弱点，本人下一次攻击伤害+25%'),
        per=dict(revealed_damage=.03), t3=dict(reveal_mp=1), t5=dict(first_break_bp=1),
        text='对已看破目标伤害每层+3%（五层15%）；三层：本人每次看破回复1内力；五层：每战本人首次促成破势时得1BP'),
    'xf_shouxian': dict(
        active=dict(name='守弦', target='self', mp=6, cooldown=3, effects=[('guard', .5), ('order_up', 1)], text='进入防御（受伤减半至下次行动），下回合行动前移一位'),
        per=dict(crit_pct=1), unhurt_bonus=[.10, .10, .12, .12, .15],
        text='暴击率每层+1%；一整回合未受伤时，下一次单体剑招伤害+10%（三层12%，五层15%），最多存一层'),
    'xf_panshi': dict(
        active=dict(name='负岳', target='ally', mp=8, cooldown=3, effects=[('intercept', .30)], text='替一名同伴承受其下一次单体攻击，承伤时自身减伤30%'),
        per=dict(mhp_pct=.04), intercept_bonus=[.10, .10, .15, .15, .20],
        text='气血上限每层+4%；援护实际承伤后，下一次拳招伤害+10%（三层15%，五层20%），最多一层'),
    'xf_hengliang': dict(
        active=dict(name='承梁', target='self', mp=6, cooldown=3, effects=[('guard', .5), ('counter', .60)], text='进入防御；至下次行动前首次受单体攻击时以60%威力反击'),
        per=dict(def_pct=.02, intercept_reduction=.03),
        text='防御每层+2%；援护承伤时减伤每层再+3%（五层15%，计入60%总减伤上限）'),
    'xf_songxi': dict(
        active=dict(name='松息', target='self', mp=0, cooldown=3, effects=[('mp_restore', .15), ('cleanse_slow', 1)], text='回复内力上限15%，并解除自身迟滞'),
        per=dict(mmp_pct=.04), t3=dict(unload_mp=-1), t5=dict(unload_mp=-2),
        text='内力上限每层+4%；三层：本人卸力类招式内力-1（五层-2，最少1）'),
    'xf_tingfeng': dict(
        active=dict(name='听风', target='foe', mp=8, cooldown=3, effects=[('reveal', 2)], text='看破指定敌人两处未知弱点'),
        per=dict(mmp_pct=.02), t3=dict(battle_start_reveal=1), t5=dict(battle_start_reveal=2),
        text='内力上限每层+2%；三层：开战时随机看破一名敌人一处弱点（五层两处）'),
    'xf_cunjin': dict(
        active=dict(name='存烬', target='self', mp=8, cooldown=3, effects=[('exposure_buff', .35, .10, 3)], text='3次行动内攻击+35%，同时自身暴露（受伤+10%）'),
        per=dict(exposed_damage=.04), t5=dict(exposed_damage_cap=.20),
        text='自身带暴露时伤害每层+4%（五层20%）；暴露带来的受伤增加不会被本内功抵消'),
    'xf_liulu': dict(
        active=dict(name='留路', target='self', mp=6, cooldown=3, effects=[('unload', .35), ('cleanse_exposure', 1)], text='自身卸力一次（35%），并解除自身暴露'),
        per=dict(after_attack_reduction=.03),
        text='每次主动攻击后，到下次行动前所受伤害每层-3%（五层15%）'),
    'xf_tongdan': dict(
        active=dict(name='同担', target='ally', mp=10, cooldown=3, effects=[('heal_ally', .55), ('unload', .20)], text='指定另一名同伴：回复0.55倍治疗基值，并卸力一次（20%）'),
        per=dict(mhp_pct=.02), t3=dict(support_mp=-1), t5=dict(support_mp=-2),
        text='气血上限每层+2%；三层：为他人援护、卸力或转赠BP的招式内力-1（五层-2，最少1）'),
    'xf_xunliu': dict(
        active=dict(name='循流', target='self', mp=0, cooldown=3, effects=[('mp_restore', .15), ('order_up', 1)], text='回复内力上限15%，下回合行动前移一位'),
        per=dict(mmp_pct=.03), t3=dict(staff_low_mp=-1), t5=dict(speed=1),
        text='内力上限每层+3%；三层：棍类丁、丙级招式内力-1；五层：身速+1'),
    'xf_guixi': dict(
        active=dict(name='归息', target='self', mp=6, cooldown=3, effects=[('cleanse', 2), ('heal_self', .10), ('mp_restore', .08)], text='解除自身两项异常（眩晕不可解除），回复10%气血与8%内力'),
        per=dict(mmp_pct=.04, heal_bonus=.02), self_steady_mp=.03,
        text='内力上限每层+4%、治疗加成每层+2%；针线削弱敌人或医线施加增益后，自身回复3%内力（每回合一次）'),
    'xf_shouyi': dict(
        active=dict(name='守艺', target='self', mp=0, cooldown=3, effects=[('next_support_half', 1)], text='本人下一次援护、卸力或医疗招式内力减半'),
        per=dict(mhp_pct=.02), t3=dict(support_mp=-1),
        text='气血上限每层+2%；三层：本人援护、卸力、医疗类招式内力-1（最少1）'),
}

# 清徽阁两门内功（2026-10-08 新增方案）：写入 lineage-v3-moves.json 的 hearts，不进 catalog（无图标、无特效分镜）
NEW_HEARTS = {
    'xf_qinghui': dict(name='清徽心经', grade='丙', group='qinghui', nature='中', slot='主',
        active=dict(name='调弦', target='self', mp=6, cooldown=3, effects=[('status_focus', .20)], text='本人下一次施加异常的招式，基础率+20%'),
        per=dict(status_chance=.02), t3=dict(status_mp=1), t5=dict(first_control_bp=1),
        text='本人招式施加异常的基础率每层+2%；三层：施加成功时回复1内力；五层：每战首次施加封穴或心乱成功时得1BP'),
    'xf_xisheng': dict(name='希声诀', grade='乙', group='qinghui', nature='阴', slot='辅',
        active=dict(name='希声', target='self', mp=6, cooldown=3, effects=[('cleanse', 1), ('status_immune', 2)], text='解除自身一项异常，并在2回合内免疫封穴与心乱'),
        per=dict(status_resist=.04),
        text='自身受异常的基础率每层-4%（五层-20%）'),
}


def main():
    p = DOC / 'catalog.json'
    c = json.loads(p.read_text())
    by = {h['id']: h for h in c['hearts']}
    assert set(by) == set(HEARTS), set(by) ^ set(HEARTS)
    for hid, d in HEARTS.items():
        h, a = by[hid], d['active']
        h['active_skill'].update(name=a['name'], target={'self': '自身', 'ally': '指定存活同伴', 'foe': '指定敌人'}[a['target']], target_mode=a['target'],
                                 description=a['text'], mp=a['mp'], cooldown_self_actions=a['cooldown'], action_cost=1, bp_scaling=False,
                                 effects=[{'type': e[0], 'values': list(e[1:])} for e in a['effects']], numbers_version='HEARTS-NUM-2')
        h['active_skill'].pop('cooldown_rounds', None)
        numbers = {k: v for k, v in d.items() if k not in ('active', 'text')}
        h['passive_skill'].update(description=d['text'], numbers=numbers, numbers_version='HEARTS-NUM-2')
        h['effect'] = d['text']
    p.write_text(json.dumps(c, ensure_ascii=False, indent=2) + '\n')
    lp = DOC / 'lineage-v3-moves.json'
    lin = json.loads(lp.read_text())
    lin['hearts'] = []
    for hid, d in NEW_HEARTS.items():
        a = d['active']
        lin['hearts'].append({'id': hid, 'name': d['name'], 'grade': d['grade'], 'group': d['group'], 'nature': d['nature'], 'slot': d['slot'], 'kind': 'heart', 'category': 'inner',
            'name_status': 'final_v3', 'icon_status': 'not_generated_wait_naming_review',
            'active_skill': {'id': hid + '_active', 'name': a['name'], 'target_mode': a['target'], 'description': a['text'], 'mp': a['mp'], 'cooldown_self_actions': a['cooldown'], 'action_cost': 1, 'bp_scaling': False,
                             'effects': [{'type': e[0], 'values': list(e[1:])} for e in a['effects']], 'numbers_version': 'HEARTS-NUM-2'},
            'passive_skill': {'id': hid + '_passive', 'name': d['name'] + '·养气', 'description': d['text'], 'numbers': {k: v for k, v in d.items() if k in ('per', 't3', 't5')}, 'numbers_version': 'HEARTS-NUM-2'},
            'effect': d['text']})
    lp.write_text(json.dumps(lin, ensure_ascii=False, indent=2) + '\n')

    L = ['> 由 `tools_docs/build_hearts_numbers.py` 生成；数值待战斗模拟与实测校准。', '', '# 内功数值 v1', '',
         '状态：**设计数值，已接入离线战斗模拟；2026-10-08 起接入本目录原型运行（[内功接入运行时](hearts-runtime.md)，部分条件被动未实装）**。2026-10-07。每门内功一个主动、一个被动；主动耗一次行动、BP 不强化，冷却按本人行动次数计。被动“每层”按层数累计，三层、五层是同一被动的强化。条件增伤共用 30% 加法池，总减伤上限 60%，减耗后有消耗的招式最少 1 内力。', '',
         '| 内功 | 品阶 | 主动（内力／冷却） | 主动效果 | 被动 |', '| --- | --- | --- | --- | --- |']
    for hid, d in list(HEARTS.items()) + list(NEW_HEARTS.items()):
        h, a = by.get(hid, d), d['active']
        L.append(f"| {h['name']} | {h['grade']} | {a['name']}（{a['mp']}／{a['cooldown']}） | {a['text']} | {d['text']} |")
    L += ['', '与旧方案相比：18 门主动不再共用 6 种模板。归云三门围绕守势，照川两门围绕看破与蓄锋，合川两门围绕援护与反击，松风两门围绕续航与开场看破，归烬两门是“暴露换攻击／收身留路”的一对，白鹇两门分别管即时与持续治疗。']
    (DOC / 'hearts-numbers.md').write_text('\n'.join(L) + '\n')
    print('hearts numbers written:', len(HEARTS))


if __name__ == '__main__':
    main()
