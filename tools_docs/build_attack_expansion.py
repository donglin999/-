#!/usr/bin/env python3
"""攻击招式扩充 v1：分镜文字与设计文档。

数据唯一来源是 tools_docs/attack_expansion_data.py；本脚本做两件事：
1. text：把 97 个新招式的玩家描述（desc_v4）、四拍特效分镜（vfx_v4）和图标主体（icon_subject）写进
   docs/design/martial-review/skill-text-v4.json（只覆盖扩充招式的条目，其余不动）。
   须在 build_status.py 之后、build_skill_docs.py 之前运行。
2. doc：生成设计文档 docs/design/martial-review/attack-expansion-v1.md（总表、逐招、数量对比、多样性统计、模拟结果）。
   须在生成链跑完之后运行；模拟结果读 balance/sim/attack-expansion-v1.json（tools_balance/attack_expansion_sim.cjs 生成，没有则写“未跑”）。
用法：python3 tools_docs/build_attack_expansion.py text | doc
"""
import json, sys
from collections import Counter
from pathlib import Path
import attack_expansion_data as EXP

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
EL_COLOR = {'炎': '炎劲朱橙 #FF6A3D', '寒': '寒劲霜蓝 #8FD8FF', '雷': '雷劲电金 #FFE25A', '风': '风劲青绿 #7FE3B5', '阳': '阳劲暖金 #FFC35A', '阴': '阴劲黛紫 #B79CFF'}
EL_WORD = {'炎': '朱橙', '寒': '霜蓝', '雷': '电金', '风': '青绿', '阳': '暖金', '阴': '黛紫'}
WC_COLOR = {'剑': '剑身冷银（无属性）', '刀': '刀锋铁青（无属性）', '长兵': '杆身深褐，劲气米白（无属性）', '暗器': '针芒冷金（无属性）', '拳掌': '米白劲气（无属性）', '音律': '声纹月白（无属性）'}
WC_WORD = {'剑': '银白', '刀': '铁青', '长兵': '米白', '暗器': '冷金', '拳掌': '米白', '音律': '月白'}
ST_COLOR = {'中毒': '草绿', '流血': '暗红', '内伤': '赭色', '封穴': '靛蓝', '眩晕': '淡紫', '目眩': '灰白', '心乱': '粉紫', '惊惧': '灰蓝', '迟滞': '灰青'}
GR = ['丁', '丙', '乙', '甲', '绝']
DIM = {'丁': '', '丙': '', '乙': '背景压暗约一成；', '甲': '背景压暗两成；', '绝': '画面压暗三成；'}
DUR = {'丁': .5, '丙': .7, '乙': .95, '甲': 1.25, '绝': 1.7}
WIND = {'剑': '剑尖微沉，剑脊亮起一线{c}微光', '刀': '刀身一侧，刃口泛起{c}冷光', '长兵': '双手一错，杆身两端各起一点{c}光',
        '暗器': '指间一捻，几点{c}寒芒在指缝排开', '拳掌': '沉肩坐胯，掌心聚起一团{c}劲气', '音律': '深吸一口气，胸前鼓起一圈{c}声纹'}
FREE_WIND = '并指虚按，指尖凝起一点{c}光'
MARK = {'剑': '细长剑痕', '刀': '斜向刀痕', '长兵': '钝击痕', '暗器': '细小钉点', '拳掌': '掌印', '音律': '环形震纹'}
FX_NOTE = {'self_damage': '施放者身上同时迸出几粒暗红，表示自损', 'sure_crit': '命中处炸开一圈金色会心光环', 'self_exposure': '施放者脚下留一圈暗红破绽环',
           'counter_power': '施放者身前留一道回卷的余势，待反击', 'unload': '施放者身前留一层薄薄的卸力气幕', 'next_attack_bonus': '兵刃上留一线未散的余光，表示下一击增强',
           'bonus_per_status_stack': '目标身上已有的异常印记被一并点亮', 'self_low_hp_bonus': '施放者气血越低，劲气颜色越深', 'reveal': '目标头顶弱点格翻开',
           'next_enemy_attack_reduction': '目标兵刃上缠一圈灰白削弱环', 'target_exposure': '目标身上留一圈暗红破绽环', 'slow': '目标脚下结一圈灰青迟滞纹', 'extra_shield_damage': '命中弱点时护盾格多碎一格'}
COND_TEXT = {'target_has_revealed_weakness': '已看破目标', 'target_blinded': '目眩目标', 'target_controlled': '受控目标', 'target_slowed': '迟滞目标', 'target_bleeding': '流血目标',
             'target_hp_below_50': '气血低于一半的目标', 'target_hp_below_35': '气血低于三成半的目标', 'target_hp_below_30': '气血低于三成的目标', 'target_hp_above_90': '气血九成以上的目标',
             'target_charging': '蓄力中的目标', 'target_broken': '已破势目标', 'previous_self_guard': '上一次行动为防御',
             'max_hp_not_lethal': '按最大气血，不致死', 'next_received_hit': '自身下一次受击', 'self_next_received_hit': '自身下一次受击', 'target_next_received_hit': '目标下一次受击',
             'on_hit': '命中时', 'boss_half': '首领折半', 'next_self_attack_once': '自身下一次攻击', 'cap_30pct': '封顶 30%', 'on_matching_weakness_once': '命中弱点时一次',
             'first_single_hit_received_before_next_self_action': '下次自身行动前首次受单体攻击', 'target_next_round_order_down_boss_if_marked': '下回合行动排序降低',
             '中毒': '按中毒层数', '中毒|流血': '按中毒与流血层数合计'}


def load():
    cat = json.loads((DOC / 'catalog.json').read_text())
    lin = json.loads((DOC / 'lineage-v3-moves.json').read_text())
    sysd = json.loads((DOC / 'martial-systems.json').read_text())
    return cat, lin, sysd


def status_text(m):
    out = []
    for e in m['combat']['effects']:
        if e['type'] == 'apply_status':
            out.append(f"{'每段 ' if e.get('per_hit') else ''}{int(round(e['chance'] * 100))}% {e['status']}{' ' + str(e['stacks']) + ' 层' if e.get('stacks', 1) > 1 else ''}")
    return '、'.join(out)


def text_for(m):
    c = m['combat']
    wc, el, grade = m.get('weak_class') or '拳掌', m.get('element'), m['grade']
    cw = EL_WORD.get(el) or WC_WORD[wc]
    group, hits, ult = m['target_mode'] == 'all_foes', c['base_hits'], m['profile'] == 'X'
    free = m['id'] in EXP.FREE_HAND
    kind = f"{wc}·{el}劲" if el else f"{wc}类"
    tgt = '敌方全体各' if group else '单体'
    seg = {1: '一段', 2: '两段', 3: '三段', 4: '四段', 6: '六段'}[hits]
    st = status_text(m)
    eff = m['effect'].replace('；需3BP及24MP', '').replace('；BP增加段数，总威力不变', '')   # 蓄势规则在后面统一写
    desc = f"{m['visual']}。对{tgt}造成{seg}{kind}伤害{'' if el else '（无属性）'}，耗 {c['mp']} 内力，{grade}级，总威力 {c['total_power']}{'（每个目标）' if group else ''}。{eff}。"
    if st:
        desc += f"命中后施加：{st}（每花 1 BP +10%，破势时必中）。"
    if ult:
        desc += '绝招：需 3 BP 与 24 内力，用后本人下一次行动不能再用绝招。'
    elif m['boost_mode'] == 'hits':
        desc += 'BP 每档多加 1 段，总威力不变。'
    else:
        desc += 'BP 每档把本招威力提高到 1.35／1.7／2.1 倍，段数不变。'
    if m['unlock_level'] > 1:
        desc += f"本功法 {m['unlock_level']} 重开启。"
    types = [e['type'] for e in c['effects']]
    notes = [FX_NOTE[t] for t in dict.fromkeys(types) if t in FX_NOTE]
    sts = [e['status'] for e in c['effects'] if e['type'] == 'apply_status']
    n = {'丁': 6, '丙': 8, '乙': 12, '甲': 20, '绝': 50}[grade]
    shake = {'丁': '不震屏', '丙': '2px 轻震', '乙': '3px 震', '甲': '5px 震', '绝': '10px 震屏、顿帧约 100ms，一次' + cw + '全屏闪'}[grade]
    hit = (f"每个敌人身上各落一处{MARK[wc]}，各迸约 {max(4, n // 2)} 粒{cw}碎光，{shake if grade == '丁' else '全场统一一次 ' + shake}" if group
           else f"目标身上{'先后落下' + seg[0] + '处' if hits > 1 else '一处'}{MARK[wc]}，{'每段' if hits > 1 else ''}迸出约 {max(3, n // hits)} 粒{cw}碎光，{shake}")
    for s in sts:
        hit += f"；{s}施加成功时目标身上闪{ST_COLOR[s]}"
    for x in notes:
        hit += f"；{x}"
    num = (f"绝招数字（52 号{cw}加暖金外描边，停顿后弹出）" if ult else f"多段伤害（{cw} 30 号，末尾“共 N”）" if hits > 1 else f"{'每个敌人' if group else ''}普通伤害（{cw} 34 号）")
    num += '；弱点命中带“弱”'
    if 'sure_crit' in types:
        num += '；会心时为金色 46 号'
    if 'self_damage' in types:
        num += '；施放者头顶弹淡红自损数字'
    for s in sts:
        num += f"；施加成功弹{ST_COLOR[s]}“{s}”"
    wind = (FREE_WIND if free else WIND[wc]).format(c=cw)
    vfx = {'起手': f"{DIM[grade]}{wind}，约 {0.1 if grade in '丁丙' else 0.2 if grade != '绝' else 0.4} 秒。",
           '出手': m['visual'] + ('，每多 1 BP 追加一段。' if m['boost_mode'] == 'hits' else '。'),
           '命中': hit + '。', '收势': f"残余的{cw}光{'自左向右' if group else '沿来路'}依次淡出，角色收势；整招约 {DUR[grade]} 秒。",
           '主色': EL_COLOR.get(el) or WC_COLOR[wc], '数字': num + '。', '档位': 'F' + str(GR.index(grade) + 1)}
    return {'desc_v4': desc, 'vfx_v4': vfx, 'icon_subject': m['visual'] + '。'}


def build_text():
    _, lin, _ = load()
    tp = DOC / 'skill-text-v4.json'
    tx = json.loads(tp.read_text())
    n = 0
    for m in lin['moves']:
        if m['id'] in EXP.MOVE_IDS:
            assert 'weak_class' in m, '先跑 build_elements.py / build_status.py'
            tx['moves'][m['id']] = text_for(m)
            n += 1
    assert n == len(EXP.MOVE_IDS), n
    tp.write_text(json.dumps(tx, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps({'分镜文字': n, '总招式文字': len(tx['moves'])}, ensure_ascii=False))


def is_attack(m):
    return (m.get('base_hits') or 0) > 0 and m.get('usage') != 'defend_enhance'


def stats(moves):
    a = [m for m in moves if is_attack(m)]
    return {'n': len(a), 'group': sum(m['target_mode'] == 'all_foes' for m in a), 'multi': sum(m['base_hits'] > 1 for m in a),
            'wc': Counter(m.get('weak_class') or '无' for m in a), 'el': Counter(m.get('element') or '无属性' for m in a), 'grade': Counter(m['grade'] for m in a)}


def fx_text(m):
    out = []
    for e in m['combat']['effects']:
        t, v, c = e['type'], e.get('value'), e.get('condition')
        if t == 'apply_status':
            continue
        out.append(f"`{t}` {v}" + (f"（{COND_TEXT.get(c, c)}）" if c else ''))
    return '；'.join(out) or '—'


def build_doc():
    cat, lin, sysd = load()
    allm = cat['skills'] + lin['moves']
    old = [m for m in allm if m['id'] not in EXP.MOVE_IDS]
    new = [m for m in lin['moves'] if m['id'] in EXP.MOVE_IDS]
    by = {m['id']: m for m in new}
    hearts = len(cat['hearts']) + len(lin.get('hearts', []))
    s0, s1, sn = stats(old), stats(allm), stats(new)
    sup0 = len(old) - s0['n'] + hearts
    sup1 = len(allm) - s1['n'] + hearts
    arts = {a['id']: a for a in sysd['systems'] if a['kind'] == 'external_art'}
    L = ['# 攻击招式扩充 v1：六派第二路与江湖散学', '',
         '> 由 `tools_docs/build_attack_expansion.py doc` 从 `tools_docs/attack_expansion_data.py` 与生成后的数据导出；改内容请改数据文件后重跑生成链，不要手改本页。', '',
         '状态：现行　最后核对：2026-10-19（原记：**设计方案，2026-10-11；数据与运行原型已落地（本目录历史原型 `?runtimePrototype=1`）**。起因与诊断见[攻击招式占比诊断](../../archive/design/martial-review/attack-ratio-diagnosis.md)。）', '',
         '## 1. 用户要求与不变的规则', '',
         '- 用户（2026-10-11）：“攻击的技能起码是辅助或者防御技能的 2.5 倍，要多样化，可能功法还是太少了。”“你去安排吧，尽量多借鉴金庸古龙小说的功法。”“古龙和金庸的功法直接换个类似的名字，然后直接按照小说描述去写对应内容即可。”',
         '- 用户已确认、本方案不改的结构：外功按品阶定招数——丁、丙、乙各 1 招，甲 2 招（第二招五重开启），绝 3 招（五重、七重开启；只有第三招是绝招，3 蓄势 + 24 内力，前两招按甲级预算）。个人技能只能请教，不出秘籍。',
         '- 现有 123 招（103 个外功与人物招式、20 个内功主动）的数值、名称、归属都没有改动。', '',
         '## 2. 扩充前后', '',
         '统计口径同诊断文档：有伤害段数且不是防御强化的算攻击招，其余（含 20 个内功主动）算辅助防御。', '',
         '| 项目 | 扩充前 | 扩充后 |', '| --- | --- | --- |',
         f"| 攻击招 | {s0['n']} | {s1['n']} |", f"| 辅助防御招 | {sup0} | {sup1} |", f"| 比例 | {s0['n'] / sup0:.2f} | **{s1['n'] / sup1:.2f}** |",
         f"| 外功功法 | 52 门门派功法 | {len(arts)} 门（门派 {sum(a['group'] != 'jianghu' for a in arts.values())}、江湖散学 {sum(a['group'] == 'jianghu' for a in arts.values())}；另有旧原型散学候选 {len(sysd['jianghu_candidates'])} 门不变） |",
         f"| 门派传承路数 | 10 路 | 16 路（白鹇谷、照川剑派、合川拳门、松风观、归烬堂、巡江司各加一路） |", '',
         f"本轮新增 {len(new)} 招，全部是攻击招：门派第二路 {sum(not m['id'].startswith('jh_') for m in new)} 招，江湖散学 {sum(m['id'].startswith('jh_') for m in new)} 招。", '',
         '## 3. 多样性', '',
         '| 维度 | 扩充前（攻击招） | 本轮新增 | 扩充后 |', '| --- | --- | --- | --- |',
         f"| 目标 | 单体 {s0['n'] - s0['group']}、群体 {s0['group']} | 单体 {sn['n'] - sn['group']}、群体 {sn['group']}（{sn['group'] / sn['n'] * 100:.0f}%） | 单体 {s1['n'] - s1['group']}、群体 {s1['group']} |",
         f"| 段数 | 单段 {s0['n'] - s0['multi']}、多段 {s0['multi']} | 单段 {sn['n'] - sn['multi']}、多段 {sn['multi']} | 单段 {s1['n'] - s1['multi']}、多段 {s1['multi']} |"]
    for label, key, order in [('兵器类', 'wc', ['剑', '刀', '长兵', '暗器', '拳掌', '音律']), ('属性', 'el', ['寒', '炎', '雷', '风', '阳', '阴', '无属性']), ('品阶', 'grade', GR)]:
        L.append(f"| {label} | " + ' | '.join('、'.join(f"{k} {s[key].get(k, 0)}" for k in order) for s in (s0, sn, s1)) + ' |')
    kinds = Counter()
    TYPE_OF = {'self_damage': '自损换伤害', 'sure_hit': '必中', 'sure_crit': '必定会心', 'self_low_hp_bonus': '气血越低越强', 'bonus_per_status_stack': '按异常层数增伤',
               'counter_power': '反击', 'next_attack_bonus': '蓄势（下一击增强）', 'extra_shield_damage': '额外削盾', 'self_exposure': '以暴露换伤害', 'reveal': '看破', 'next_enemy_attack_reduction': '削弱下一击'}
    for m in new:
        ts = {e['type'] for e in m['combat']['effects']}
        cs = {e.get('condition') for e in m['combat']['effects'] if e['type'] == 'conditional_damage'}
        for t in ts:
            if t in TYPE_OF:
                kinds[TYPE_OF[t]] += 1
        if m['base_hits'] > 1:
            kinds['多段'] += 1
        if m['target_mode'] == 'all_foes':
            kinds['群体'] += 1
        if any(s in ('中毒', '流血') for s in m.get('statuses') or []):
            kinds['持续伤害（中毒、流血）'] += 1
        if any(s in ('封穴', '眩晕', '迟滞', '心乱', '惊惧', '目眩') for s in m.get('statuses') or []):
            kinds['控制（封穴、眩晕、迟滞、惊惧、目眩）'] += 1
        if cs & {'target_controlled', 'target_slowed', 'target_blinded', 'target_bleeding', 'target_has_revealed_weakness', 'target_charging', 'target_broken'}:
            kinds['控制或看破后追击'] += 1
        if cs & {'target_hp_below_50', 'target_hp_below_35', 'target_hp_below_30'}:
            kinds['斩杀（低气血增伤）'] += 1
        if cs & {'target_hp_above_90'} or 'sure_crit' in ts:
            kinds['先手（首击增强）'] += 1 if cs & {'target_hp_above_90'} else 0
        if 'previous_self_guard' in cs:
            kinds['蓄力（先守后攻）'] += 1
    L += ['', '打法类型（一招可占多类）：' + '、'.join(f"{k} {v}" for k, v in kinds.most_common()) + '。', '',
          '对照诊断文档第 3 节的缺口：', '',
          f"- 群体招不少于新增的三成：{sn['group']}/{sn['n']}＝{sn['group'] / sn['n'] * 100:.0f}%。",
          f"- 长兵 {s0['wc'].get('长兵', 0)}→{s1['wc'].get('长兵', 0)}，暗器 {s0['wc'].get('暗器', 0)}→{s1['wc'].get('暗器', 0)}，刀 {s0['wc'].get('刀', 0)}→{s1['wc'].get('刀', 0)}。",
          f"- 新增寒 {sn['el'].get('寒', 0)}、炎 {sn['el'].get('炎', 0)}、雷 {sn['el'].get('雷', 0)} 招（各不少于 8）。",
          f"- 丙级攻击招 {s0['grade'].get('丙', 0)}→{s1['grade'].get('丙', 0)}，乙级 {s0['grade'].get('乙', 0)}→{s1['grade'].get('乙', 0)}（各不少于 20）。", '',
          '## 4. 数值预算', '',
          '`balance/budget.json` 只定阶段锚点与公式上限（条件加成池 30%、暴击率上限 35%、每行动每目标削盾 6 点）；各品阶的招式威力沿用现有 103 招的实际区间，本轮新招全部落在区间内，例外逐条写明代价。', '',
          '| 品阶 | 内力 | 单体总威力 | 群体每目标 | 现有参照 | 本轮例外 |', '| --- | --- | --- | --- | --- | --- |',
          '| 丁 | 2 | 1.00–1.05 | 0.60 | 试锋探路 1.05、落桩拳 1.08 | — |',
          '| 丙 | 4 | 1.02–1.10 | 0.70–0.72 | 拨云回锋 1.08、燃隙刀 1.32（带自身暴露） | — |',
          '| 乙 | 8 | 1.20–1.48 | 0.85 | 一线开晴 1.38、梅落 0.85（群体） | 三损拳 1.6：自损 4% 最大气血 |',
          '| 甲 | 14 | 1.30–1.75 | 0.90–1.05 | 照川落日 1.72、群峰回照 1.05（群体）、关山月 1.55（三段） | 七劲齐伤 2.05：自损 10%；一往无前 1.75：自身暴露；少阳剑气、轻冲剑气内力 16（原著耗内力） |',
          '| 绝 | 24＋3 蓄势 | 4.3–4.6 | 2.9–3.0 | 云开见山 4.6、一剑澄江 4.3、万壑回响 2.9 | 第十五式 4.9：自损 15% 并暴露；一刀不虚 3.2：必中必会心（会心后约等于 4.0–4.8），其后 3 次行动不能再用 |', '',
          '条件增伤全部不超过 30%，并且与已有条件加成共用 30% 的加法池上限（模拟器按池结算；运行原型里新加的四类按层数、按气血的加成在各自类型内封顶 30%）。异常基础率沿用现有区间：硬控（封穴、眩晕）15%–50%，持续伤害 25%–80%，BP 每档 +10%。', '',
          '## 5. 新机制与结算方式', '',
          '全部落在已有战斗框架内（弱点与看破、破势、蓄势、守势、异常、多段、反击、暴露），没有新系统；只新增 5 个效果类型和 10 个条件，运行原型（`js/battle.js`）与模拟器（`tools_balance/combat_sim.cjs`）都已实现。', '',
          '| 效果或条件 | 结算方式 | 用在 |', '| --- | --- | --- |',
          '| `self_damage` 自损 | 本招出手结算后，施放者失去“最大气血 × 数值”的气血，最少留 1 点，不会致死；不触发援护、卸力、反击 | 三损拳、七劲齐伤、第十五式 |',
          '| `sure_hit` 必中 | 本招不受自身“目眩”的 25% 落空影响（模拟器里同时不吃 95% 基础命中） | 无式、千江有月、不虚飞刀三招、抉目连刺、天外来仙 |',
          '| `sure_crit` 必定会心 | 条件成立（无条件或“目标气血九成以上”）时本招每段必定会心，不占暴击率上限；会心倍率不变 | 一刀不虚、黑刀一闪 |',
          '| `self_low_hp_bonus` 逆境增伤 | 伤害提高“数值 ×（1 − 当前气血／最大气血）”，最多 30% | 穷途一掌 |',
          '| `bonus_per_status_stack` 按层增伤 | 目标每有一层指定异常（中毒，或中毒与流血合计）伤害提高 6%，最多 30% | 催毒针、回燃、催符 |',
          '| 条件 `target_hp_below_50／35／30` | 目标当前气血比例低于该值（斩杀线只是增伤，不是即死，对首领同样只增伤） | 寒江断流、一刀中分、一刀镇澜 |',
          '| 条件 `target_hp_above_90` | 目标气血在九成以上 | 铁片快剑、黑刀一闪 |',
          '| 条件 `target_controlled` | 目标带迟滞、封穴、眩晕、心乱、惊惧之一 | 压舱 |',
          '| 条件 `target_slowed`、`target_blinded`、`target_bleeding`、`target_charging` | 目标带迟滞／目眩／流血，或正在蓄力 | 引雷、连环追缉、雷行水上、封转八方；碎镜、雀屏尽开；爆烬；后发一刀 |', '',
          '沿用的旧效果：`counter_power`（反击，出手后保留到自己下次行动前，受到的第一次单体攻击触发一次）、`unload`（卸力）、`next_attack_bonus`（下一击增强）、`self_exposure`／`target_exposure`（暴露）、`next_enemy_attack_reduction`（削弱下一击，首领折半）、`extra_shield_damage`、`reveal`、`slow`，以及异常状态 v1 的九种异常。“持续伤害”就是中毒与流血，没有新增灼烧或冰冻；寒魄符的符毒按中毒结算。', '',
          '徒手招：六脉剑气三招、寒魄符两招、雷音吼两招、飞石破空虽属暗器或音律弱点类，但不要求装备对应兵器（原著是指力、掌力、内力发声）。', '',
          '## 6. 门派第二路（30 门功法、48 招）', '',
          '每派新增一路，仍是丁、丙、乙、甲、绝五门，前置与属性门槛沿用[门派功法传承](../martial-lineage.md) §3.2（丙要丁级三重，乙要丙级五重，甲、绝要前一门七重）。属性仍守“每个门派两种属性”。', '']
    for g, note in EXP.SECT_ROUTE_NOTE.items():
        rows = [a for a in arts.values() if a['group'] == g and a.get('expansion')]
        L += [f"### {rows[0]['group_name']}", '', note, '', '| 功法 | 品阶 | 招式（开启重数） | 学习门槛 | 取得方式 |', '| --- | --- | --- | --- | --- |']
        for a in rows:
            p = a['prerequisite']
            pre = f"《{arts[p['art_id']]['name']}》{p['level']}重；" if p else ''
            L.append(f"| 《{a['name']}》 | {a['grade']} | {'、'.join(m['name'] + '（' + str(m['unlock_level']) + '）' for m in a['moves'])} | {pre}{a['learn_req_text']} | {a['obtain']} |")
        L.append('')
    L += ['巡江司原设“官府训练没有镇派绝学”。本轮按任务要求每派补满五门，《镇澜刀》写成老教头私传的江防旧军刀法，不属官府训练；是否保留见第 10 节。', '',
          '## 7. 江湖散学（28 门功法、49 招）', '',
          '不挂门派的单门功法，没有前置功法，只受属性门槛限制（按品阶和路线，同门派功法）；拿到秘籍后满足门槛即可点击学会第一重，书不消失。名称按用户要求换成相近的名字，不出现原著人物名和门派名；招式内容按小说描写转成机制。标“本作补招”的是原著只写了一招、为凑足甲 2 招或绝 3 招而补的起势。取得方式是设计方案，具体事件、地点和失败出口待[事件排期](../event-scheduling-system.md)登记。', '',
          '| 功法 | 品阶 | 兵器类 | 属性 | 原型出处 | 招式（开启重数） | 学习门槛 | 取得方式 |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for a in arts.values():
        if a['group'] != 'jianghu':
            continue
        ms = [by[m['id']] for m in a['moves']]
        els = '、'.join(dict.fromkeys(m.get('element') or '无' for m in ms))
        pl = a['placement']
        L.append(f"| 《{a['name']}》 | {a['grade']} | {ms[0].get('weak_class')} | {els} | {a['prototype']} | {'、'.join(m['name'] + '（' + str(m['unlock_level']) + '）' for m in a['moves'])} | {a['learn_req_text']} | {pl['type']}：{pl['where']}，{pl['how']} |")
    L += ['', '## 8. 逐招', '',
          '威力是整招总威力（多段均分，群体为每个目标）；削盾是 0／1／2／3 蓄势时本招对每个目标的削盾上限；异常写基础率（每花 1 蓄势 +10%，破势时必中）。', '',
          '| 功法 | 招式 | 品阶 | 类·属性 | 目标 | 段数 | 威力 | 内力 | 冷却 | 削盾 | 异常 | 机制 | 效果说明 | 依据 |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    for a in arts.values():
        if not a.get('expansion'):
            continue
        for i, mv in enumerate(a['moves']):
            m = by[mv['id']]
            c = m['combat']
            L.append(f"| {'《' + a['name'] + '》' if i == 0 else ''} | {m['name']}（`{m['id']}`） | {m['grade']} | {m.get('weak_class')}{'·' + m['element'] if m.get('element') else ''} | {'全体' if m['target_mode'] == 'all_foes' else '单体'} | {c['base_hits']}{'（蓄势加段）' if m['boost_mode'] == 'hits' else ''} | {c['total_power']} | {c['mp']}{'＋3 蓄势' if m['profile'] == 'X' else ''} | {c['cooldown_self_actions'] or '—'} | {'／'.join(str(b['shield_cap']) for b in c['bp'])} | {status_text(m) or '—'} | {fx_text(m)} | {m['effect']} | {m['naming']['meaning']} |")
    sim = DOC / 'balance/sim/attack-expansion-v1.json'
    L += ['', '## 9. 平衡模拟', '']
    if sim.exists():
        r = json.loads(sim.read_text())
        L += r['markdown']
    else:
        L += ['未跑：`node tools_balance/attack_expansion_sim.cjs` 生成 `balance/sim/attack-expansion-v1.json` 后重跑本脚本。']
    L += ['', '## 10. 落地情况、遗留与待用户决定', '',
          '已落地：功法与招式合同（`martial-systems.json`、`lineage-v3-moves.json`）、属性与异常、运行时招式（`js/martial-moves-runtime.js`，含弱点规则补登记）、秘籍与投放表、招式图标（97 张已生成并接入 `js/martial-move-icons.js`，未经用户评审）、模板特效规格（`js/wuxia-kit-data.js`）、四拍分镜文字（`skill-text-v4.json`）、战斗结算与模拟器的新机制、测试。详见[更新记录](../../updates/2026-10-11-attack-expansion.md)。', '',
          '待用户决定：', '',
          '1. **巡江司是否保留绝级《镇澜刀》**。原设是官府训练不设镇派绝学；不保留的话巡江司第二路减为 5 招，攻击招总数少 3 招，比例仍高于 2.5。',
          '2. **江湖散学的名称**。按“换个类似的名字”起名，若要离原著更远或更近，可逐个改名（只改数据文件里的名称，id 不变）。',
          '3. **《祛邪剑谱》没有采用原著的修习代价**，只取“快”；是否要加别的代价（例如学会后不能再学阳劲功法）请定。',
          '4. **取得方式**都是设计方案：28 门散学的奇遇、传授人物、地点还没有进事件排期，传授人也没有起名。',
          '5. **专属特效**不在本轮：97 招现在用模板特效兜底，其中 11 个绝招（6 个门派绝招、5 个散学绝招）按规范应当有专属编排，留待下一轮。',
          '6. 运行原型里“下一击增强”“暴露”“必定会心”与条件增伤是相乘关系，没有模拟器里的 30% 加法池（现有招式也是这样）；夺命十三式“第十四式接第十五式”、不虚飞刀“扣刀接一刀不虚”在运行原型里的单次爆发会高于模拟值，是否统一成加法池待平衡确认。']
    (DOC / 'attack-expansion-v1.md').write_text('\n'.join(L) + '\n')
    print(json.dumps({'攻击': s1['n'], '辅助防御': sup1, '比例': round(s1['n'] / sup1, 3), '新增': len(new), '新增群体占比': round(sn['group'] / sn['n'], 3)}, ensure_ascii=False))


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'doc'
    build_text() if mode == 'text' else build_doc()
