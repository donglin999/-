#!/usr/bin/env python3
"""武器数值 v1（2026-10-08 用户要求“完成所有内容”）：基础攻击、兵器类修正、每件机制的具体数字、价格与装备要求。

设计依据（docs/design/martial-review/weapon-stats.md）：
- 武器攻击约占当阶段参考攻击（balance/budget.json anchors.attack）的 30%：剑为基准，丁对应首季（28×0.3≈8）、
  丙对应第一年末（40×0.3=12）、乙对应第二年末（55×0.3≈17）、甲对应游历中段（78×0.3≈23）；
  绝级按 equipment.md“不必再大幅抬高白字攻击”只比甲高 3（26），价值在独有触发。
- 兵器类修正：刀高攻、剑均衡带少量暴击、长兵带防御、拳掌低攻带暴击、暗器低攻高暴击、扇兼闪避、音律低攻加异常率、医具最低攻加治疗。
- 机制：每件最多一条主要机制，全部写成具体数字；共享 rules.md 的上限（条件增伤加法池 30%、异常抗性 60%、暴击率上限 35%）。
- 战斗模拟按“实际武器攻击 − 当阶段应有武器攻击”的差值修正角色攻击（tools_balance/combat_sim.cjs），不打乱已校准的敌人曲线。
输出：catalog.json 武器条目的 stats / mech / price / req；equipment.md 的“武器数值”标记段；js/equipment-runtime.js（运行时登记装备道具）。
生成链：接在 build_skill_docs.py 之后、build_martial_library.py 之前。
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
START, END = '<!-- weapon-stats:start -->', '<!-- weapon-stats:end -->'
GRADES = '丁丙乙甲绝'
BASE = {'丁': 8, '丙': 12, '乙': 17, '甲': 23, '绝': 26}           # 剑的基础攻击
PRICE = {'丁': 30, '丙': 90, '乙': 240, '甲': 600, '绝': None}      # 绝级不出售
REQ = {'丁': 0, '丙': 5, '乙': 7, '甲': 9, '绝': 11}                 # 主属性要求（与功法属性门槛同口径、略低：装备比功法好取得）
# 兵器（catalog weapon 字段）→ 兵器类修正：攻击倍率、暴击%、防御（按品阶序号 1..5 乘以每阶值）、闪避%、身速、主属性
KIND = {
    '剑': dict(cls='剑', atk=1.00, crit=3, main='agi'),
    '刀': dict(cls='刀', atk=1.15, crit=0, main='str'),
    '短刀': dict(cls='刀', atk=1.00, crit=5, main='agi'),
    '锤': dict(cls='刀', atk=1.25, crit=0, spd=-1, main='str'),
    '拳': dict(cls='拳掌', atk=0.95, crit=3, main='str'),   # 2026-10-08 模拟：0.85 时拳掌队伍偏慢（拳掌招式多段，已有分摊）
    '棍': dict(cls='长兵', atk=1.05, crit=0, defp=1.5, main='str'),
    '伞': dict(cls='长兵', atk=0.85, crit=0, defp=2.5, main='wil'),
    '暗器': dict(cls='暗器', atk=0.75, crit=8, main='agi'),
    '扇': dict(cls='暗器', atk=0.85, crit=4, dodge=3, main='agi'),
    '琴': dict(cls='音律', atk=0.70, crit=0, status=('封穴', '心乱'), main='wis'),
    '笛': dict(cls='音律', atk=0.75, crit=0, status=('惊惧', '迟滞'), main='wis'),
    '医具': dict(cls=None, atk=0.55, crit=0, heal=10, main='wis'),
}
DAGGER = {'eq_hidden_dagger', 'eq_ember_dagger', 'eq_lock_dagger'}
STATUS_PER_GRADE = 3   # 音律兵器：本路两种异常的施加基础率每阶 +3%（丁 3% … 绝 15%）
# 2026-10-08：运行战斗没有我方命中率，原“命中 +N%”四件改为可结算的机制（首击、目眩落空减半、单体暴击、多段后段增伤）
# 每件武器的机制：type（结算类型）、数值、条件与次数；text 为写进道具说明的完整描述
MECH = {
    'eq_practice_sword': dict(type='none', text='无附带特性（可靠的入门剑）'),
    'eq_clear_sword': dict(type='first_strike_atk', value=0.15, once='每场一次', text='每场战斗首次出手伤害 +15%（起手更稳）'),
    'eq_cloud_sword': dict(type='after_defend_atk', value=0.15, once='每次防御后一次', text='选“防御”后的下一次剑招伤害 +15%（每次防御一次）'),
    'eq_sunset_sword': dict(type='revealed_first_hit', value=0.20, once='每回合一次', text='对已看破目标的本回合首击伤害 +20%（每回合一次）'),
    'eq_return_sword': dict(type='token_mp', value=6, once='每战两次', text='消耗守势时回复 6 内力（每战两次，不增加行动）'),
    'eq_wrap': dict(type='basic_atk', value=0.10, text='普攻伤害 +10%（空手技基础发力；不提供防御）'),
    'eq_brace': dict(type='weak_hit', value=0.10, weapon='拳掌', text='拳掌招式命中弱点时伤害 +10%（不额外削盾）'),
    'eq_heavy_brace': dict(type='after_guard_atk', value=0.20, once='每次援护后一次', text='援护（替同伴承伤）后的下一次拳招伤害 +20%'),
    'eq_needle_roll': dict(type='blind_miss_half', value=0.5, weapon='暗器', text='自身目眩时，暗器招式的落空率减半（不按针数消耗背包）'),
    'eq_thread_needle': dict(type='revealed_mp', value=-2, once='每回合一次', text='对已看破目标施放针技内力 −2（每回合一次）'),
    'eq_return_needle': dict(type='hit_or_heal', value=0.08, text='所装配招式以针攻为主时针技伤害 +8%，以医术为主时治疗 +8%（按装配多数自动取一项，不双算）'),
    'eq_medical_kit': dict(type='heal', value=0.10, text='治疗量 +10%（占武器槽，进攻较弱）'),
    'eq_hidden_dagger': dict(type='crit_single', value=6, text='单体招式暴击率 +6%'),
    'eq_ember_dagger': dict(type='after_atk_unload', value=0.10, once='每回合一次', text='本回合攻击后，首次获得的卸力额外 +10%（每回合一次）'),
    'eq_lock_dagger': dict(type='control_mp', value=-2, text='牵制、控制类招式内力 −2（不增加盗窃或掉落）'),
    'eq_road_saber': dict(type='def', value=2, text='防御 +2（稳定的护行刀）'),
    'eq_ember_saber': dict(type='exposed_atk', value=0.20, text='自身带“暴露”时刀招伤害 +20%（暴露的代价照常保留）'),
    'eq_storm_saber': dict(type='after_guard_mp', value=-3, once='每次援护后一次', text='援护成功后的下一次刀招内力 −3'),
    'eq_patrol_staff': dict(type='status_chance', value=0.08, statuses=('迟滞', '眩晕'), text='长兵招式施加迟滞、眩晕的基础率 +8%'),
    'eq_boat_pole': dict(type='guard_mp', value=-2, text='援护、救援类招式内力 −2（不穿越地形）'),
    'eq_fan': dict(type='unload_bonus', value=0.10, once='每回合一次', text='每回合首次卸力额外 +10%'),
    'eq_umbrella': dict(type='guard_mp', value=-2, text='为同伴援护、卸力的招式内力 −2（不增加音波攻击）'),
    'eq_throwing_blades': dict(type='multihit_later', value=0.08, weapon='暗器', text='多段暗器招式第二段起每段伤害 +8%（段数不增加）'),
    'eq_work_hammer': dict(type='revealed_break_atk', value=0.12, text='对已看破目标，削盾/破势类招式伤害 +12%'),
    'eq_qin_practice': dict(type='none', text='无附带特性（入门练习琴）'),
    'eq_flute_bamboo': dict(type='route_mp', value=-1, weapon='音律', text='笛路招式内力 −1'),
    'eq_qin_night': dict(type='see_mods', text='特性即右栏的封穴、心乱施加率 +8%（不另计，避免与装备技能影响重复）'),
    'eq_flute_guanshan': dict(type='team_fear_minus', value=1, text='笛路群体招式命中后，全队下一次受到的惊惧持续 −1 回合'),
}


# 补齐兵器梯度缺口（2026-10-08）：长兵、琴原先只到乙级，沈雁回、柳含烟后期无对应品阶武器。名称已于 2026-10-09 命名评审通过（来源仍为提案）。
NEW = [
    dict(id='eq_lock_river_staff', name='锁江棍', grade='甲', weapon='棍', users='巡江司（沈雁回）', phase='TRAVEL',
         effect='长兵招式命中后，目标下一次行动的伤害 −10%（每回合一次）', obtain='巡江司差务协同资格后，教头授予', visual='铁箍乌木长棍、两端铜镦、棍身刻巡江水纹',
         meaning='锁江取巡江司“锁住江面、不放走一船”的职守，与《锁江擒拿》同源。'),
    dict(id='eq_jade_hui_qin', name='玉徽琴', grade='甲', weapon='琴', users='清徽阁琴路传人', phase='TRAVEL',
         effect='琴路单体招式命中已被施加封穴或心乱的目标时，伤害 +12%', obtain='《清徽琴法》七重后，阁主所赠', visual='桐木漆面、十三点白玉琴徽、浅青琴穗',
         meaning='玉徽指琴面镶玉的十三个徽位，呼应清徽阁“清音有准”的阁名。'),
]
MECH.update({
    'eq_lock_river_staff': dict(type='weaken_next', value=0.10, once='每回合一次', text='长兵招式命中后，目标下一次行动伤害 −10%（每回合一次）'),
    'eq_jade_hui_qin': dict(type='status_target_atk', value=0.12, statuses=('封穴', '心乱'), text='琴路单体招式对已封穴或心乱的目标伤害 +12%'),
})


def weapon_stats(e):
    gi = GRADES.index(e['grade']) + 1
    kind = '短刀' if e['id'] in DAGGER else e.get('weapon')
    K = KIND.get(kind, KIND['剑'])
    st = {'atk': round(BASE[e['grade']] * K['atk'])}
    if K.get('crit'):
        st['crit'] = K['crit'] + (1 if gi >= 4 and K['crit'] else 0)
    if K.get('defp'):
        st['def'] = round(K['defp'] * gi)
    if K.get('dodge'):
        st['dodge'] = K['dodge'] + gi
    if K.get('spd'):
        st['spd'] = K['spd']
    if K.get('heal'):
        st['heal'] = K['heal'] + 2 * (gi - 1)
    if K.get('status'):
        st['status'] = {s: STATUS_PER_GRADE * gi / 100 for s in K['status']}
    m = MECH.get(e['id'], dict(type='none', text='无附带特性'))
    if m['type'] == 'def':
        st['def'] = st.get('def', 0) + m['value']
    req = {K['main']: REQ[e['grade']]} if REQ[e['grade']] else {}
    return kind, K, st, m, req


def main():
    p = DOC / 'catalog.json'
    cat = json.loads(p.read_text())
    by = {e['id']: e for e in cat['equipment']}
    tmpl = by['eq_practice_sword']
    for n in NEW:
        e = {k: v for k, v in tmpl.items() if k not in ('skill_mods', 'skill_mods_text', 'stats', 'mech', 'price', 'req')}
        e.update(n, kind='equipment', slot='weapon', icon_id='icon_' + n['id'], status='draft_pending_review', asset_status='not_generated',
                 planned_path=f"art_sources/martial_icons_review/raw/icon_{n['id']}.png", weapon_class={'棍': '长兵', '琴': '音律'}[n['weapon']],
                 naming={'meaning': n['meaning'], 'basis': n['obtain'], 'design_anchor': n['visual'], 'lore_text': n['meaning'], 'status': 'design_proposal_pending_story_review'},
                 prompt=tmpl['prompt'].replace('对象：' + tmpl['name'] + '，' + tmpl['grade'], '对象：' + n['name'] + '，' + n['grade']).split('独有构图：')[0] + '独有构图：' + n['visual'] + '。一个明确主形，精细完成；不加繁复装饰。等级色只作辅助，形状区别优先；不要通用换色旋涡，不增加设定外的龙、法阵或召唤物。')
        e.pop('meaning', None)
        if n['id'] in by:
            cat['equipment'][cat['equipment'].index(by[n['id']])] = e
        else:
            cat['equipment'].append(e)
    weapons = [e for e in cat['equipment'] if e['slot'] == 'weapon']
    rows = []
    for e in weapons:
        kind, K, st, m, req = weapon_stats(e)
        e['stats'] = st
        e['mech'] = m
        e['price'] = PRICE[e['grade']]
        e['req'] = req
        e['kind_runtime'] = kind
        rows.append((e, kind, K, st, m, req))
    p.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + '\n')

    # equipment.md 标记段
    NAME = {'str': '臂力', 'agi': '身法', 'wis': '悟性', 'wil': '定力', 'con': '根骨'}
    L = [START, '## 武器数值 v1（2026-10-08，自动生成）', '',
         '由 `tools_docs/build_weapon_stats.py` 生成，数据写在 catalog.json 武器条目的 `stats`、`mech`、`price`、`req`；设计说明见 [武器数值](weapon-stats.md)。', '',
         '| 武器 | 品阶 | 兵器 | 攻击 | 副属性 | 机制（具体数字） | 属性亲和等 | 价格 | 装备要求 |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    order = {g: i for i, g in enumerate(GRADES)}
    for e, kind, K, st, m, req in sorted(rows, key=lambda r: (r[2]['cls'] or '医', order[r[0]['grade']])):
        sub = []
        if st.get('crit'): sub.append(f"暴击 +{st['crit']}%")
        if st.get('def'): sub.append(f"防御 +{st['def']}")
        if st.get('dodge'): sub.append(f"闪避 +{st['dodge']}%")
        if st.get('spd'): sub.append(f"身速 {st['spd']}")
        if st.get('heal'): sub.append(f"治疗 +{st['heal']}%")
        if st.get('status'): sub.append('、'.join(st['status']) + f"施加率 +{round(list(st['status'].values())[0] * 100)}%")
        L.append(f"| {e['name']} | {e['grade']} | {kind}（{K['cls'] or '医具'}） | {st['atk']} | {'；'.join(sub) or '—'} | {m['text']} | {e.get('skill_mods_text') or '—'} | {e['price'] if e['price'] else '不出售'} | {'、'.join(f'{NAME[k]} {v}' for k, v in req.items()) or '—'} |")
    L += ['', END]
    q = DOC / 'equipment.md'
    t = q.read_text()
    block = '\n'.join(L)
    t = re.sub(re.escape(START) + r'.*?' + re.escape(END), block, t, flags=re.S) if START in t else t.rstrip('\n') + '\n\n' + block + '\n'
    q.write_text(t)

    # 运行时：把 28 件武器登记为道具（id 沿用 catalog，旧原型武器 wood/iron 等不动）
    rt = {}
    Q = {'丁': 0, '丙': 1, '乙': 2, '甲': 3, '绝': 4}
    for e, kind, K, st, m, req in rows:
        fx = {k: v for k, v in st.items() if k in ('crit', 'def', 'dodge', 'spd')}
        rt[e['id']] = {'name': e['name'], 'grade': e['grade'], 'q': Q[e['grade']],
                       'desc': f"{e['grade']}级{kind}。{e.get('visual') or ''}".rstrip('。') + f"。攻击 +{st['atk']}" + ''.join(
                           f"，{t}" for t in ([f"暴击 +{st['crit']}%"] if st.get('crit') else []) + ([f"防御 +{st['def']}"] if st.get('def') else []) +
                           ([f"闪避 +{st['dodge']}%"] if st.get('dodge') else []) + ([f"治疗 +{st['heal']}%"] if st.get('heal') else [])) +
                       f"。{m['text']}。" + (f"{e['skill_mods_text']}。" if e.get('skill_mods_text') else ''),
                       'weapon': {'kind': kind, 'atk': st['atk'], **({'crit': st['crit']} if st.get('crit') else {})},
                       'fx': {k: v for k, v in fx.items() if k != 'crit'}, 'price': e['price'] or 0, 'req': req,
                       'mods': {**(e.get('skill_mods') or {}), **({'heal': st['heal'] / 100} if st.get('heal') else {})},
                       'statusBonus': st.get('status') or {}, 'mech': {k: v for k, v in m.items() if k != 'text'}}
        if not e['price']:
            rt[e['id']]['unsellable'] = 1
    keep = {}
    rp = ROOT / 'js/equipment-runtime.js'
    if rp.exists():  # 保留 build_armor_acc.py 写入的护具、佩饰
        m0 = re.search(r'window\.EquipmentRuntime=(\{.*\});', rp.read_text(), re.S)
        if m0:
            keep = {k: v for k, v in json.loads(m0.group(1)).items() if k != 'weapons'}
    (ROOT / 'js/equipment-runtime.js').write_text('/* 由 tools_docs/build_weapon_stats.py 生成，勿手改。武器数值 v1（docs/design/martial-review/weapon-stats.md）。 */\nwindow.EquipmentRuntime='
                                                  + json.dumps({'weapons': rt, **keep}, ensure_ascii=False, indent=1) + ';\n')
    print(json.dumps({'武器': len(rows), '攻击范围': [min(r[3]['atk'] for r in rows), max(r[3]['atk'] for r in rows)]}, ensure_ascii=False))


if __name__ == '__main__':
    main()
