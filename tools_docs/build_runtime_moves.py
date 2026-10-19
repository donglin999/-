#!/usr/bin/env python3
"""功法传承 v3 招式 → 运行战斗技能（js/martial-moves-runtime.js）。

生成链最后一步：complete_martial_moves_v3 → build_martial_lineage_v3 → build_elements → build_status
→ build_equipment_mods → build_hearts_numbers → build_skill_docs → build_martial_library → 本脚本。

只读三份数据：docs/design/martial-review/catalog.json、lineage-v3-moves.json、martial-systems.json。
- 只登记 52 门门派功法（martial-systems.json kind=external_art）的招式；人物技能组（character_skill_group）暂缓，列入 paused。
- 字段沿用 battle.js / bfx.js 约定：SKILLS{name,kind,mp,pow,heal,desc,...}，BSK{t,e,tgt,hits,reveal,...}；
  v3 合同另存 BSK.bp（每档 [总威力,段数,削盾上限,治疗倍率]，不可用档为 null）、BSK.ef（每档附带效果）、ult、cd、lv。
- 运行时只补缺：SKILLS / BSK / FXDEF 已有同 id 的条目一律不覆盖（旧存档与旧原型招式保持原样）。
- 特效档位：丁0／丙1／乙2／甲3／绝3，再按 vfx.js tierCap（按内力）截顶，保证 VFX.audit() 不报超档。
- 治疗量：运行战斗仍按“目标最大气血比例”结算（旧回春散 0.38），合同 heal_coefficient 折算为 ×0.30、单次封顶 35%。
规则说明见 docs/design/runtime-moves.md。
"""
from pathlib import Path
import json
import attack_expansion_data as EXP   # 攻击招式扩充 v1：徒手标记 FREE_HAND、扩充招式 id

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
OUT = ROOT / 'js/martial-moves-runtime.js'

GRADE_TIER = {'丁': 0, '丙': 1, '乙': 2, '甲': 3, '绝': 3}
KIND = {'剑': '剑', '拳': '拳', '刀': '刀', '棍': '棍', '暗器': '暗器', '琴': '琴', '笛': '笛', '医具': '医', '通用': '身', '扇': '扇', '伞': '伞', '锤': '锤', '吼': '吼'}
HIT_T = {'剑', '拳', '刀', '棍', '暗器', '琴', '笛', '扇', '伞', '锤'}   # 进 BSK.t 的兵刃（KIND_CLASS 可换算）
# 主角须装备同一兵器类的兵器（2026-10-08 武器运行时：按招式 weak_class 设 needWeapon，运行时 weaponFits 按 KIND_CLASS 兵器类比较；拳掌与无类招式不设）
T_ALIAS = {'吼': '笛'}   # 进 BSK.t 时的换算：吼声按笛类音波取命中特效与兵刃造诣（弱点类型仍由 MOVE_RULES 的 音律 决定）
NEED_WEAPON = {'剑': '剑', '刀': '刀', '长兵': '长兵', '暗器': '暗器', '音律': '音律'}
HEAL_RATE, HEAL_CAP = .30, .35
TGT = {'all_foes': 'foes', 'all_allies': 'allies', 'self': 'self'}
ALLY_TYPES = {'bp_transfer', 'intercept', 'death_prevention', 'heal_coefficient', 'cleanse', 'cleanse_bleed', 'cleanse_slow',
              'cleanse_seal', 'cleanse_fear', 'cleanse_exposure', 'status_guard'}
# 防御强化名单（docs/design/martial-structure.md“防御强化招式”，原则是“只保护自己的招式”）。
# 回灰护影（gj_s5b）效果是“为一名同伴卸力并解除暴露”，保护的是同伴，不属于该原则，按数据保持普通主动招（与 build_status.py 一致）
DEFEND_ENHANCE_CONFIRMED = {'gy_p2', 'sf_s1', 'gy_s4b', 'zc_s4b'}
SKIP_EF = {'apply_status', 'reveal', 'heal_coefficient'}   # 异常由 battle.js MOVE_RULES 结算；看破走 BSK.reveal；治疗走 SKILLS.heal


def tier_cap(mp):
    return 0 if not mp else 1 if mp <= 7 else 2 if mp <= 12 else 3


def rnd(v, n=4):
    return round(float(v), n)


def target(m, c, power, heal):
    t = c['target']
    if t in TGT:
        return TGT[t]
    if power > 0:
        return 'foe'
    if heal or m.get('usage') == 'defend_enhance' or m['id'] in DEFEND_ENHANCE_CONFIRMED:
        return 'ally' if heal else 'self'
    for e in c['effects']:
        if e['type'] in ALLY_TYPES or 'ally' in (e.get('condition') or '') or 'recipient' in (e.get('condition') or ''):
            return 'ally'
    return 'self'


def build():
    catalog = json.loads((DOC / 'catalog.json').read_text())
    lineage = json.loads((DOC / 'lineage-v3-moves.json').read_text())
    systems = json.loads((DOC / 'martial-systems.json').read_text())
    moves = {m['id']: m for m in catalog['skills'] + lineage['moves']}
    arts = [s for s in systems['systems'] if s['kind'] == 'external_art']
    paused_groups = [s for s in systems['systems'] if s['kind'] == 'character_skill_group']
    art_ids = [k for a in arts for k in a['skill_ids'] + list(a.get('new_move_ids') or [])]
    art_ids = list(dict.fromkeys(art_ids))
    paused = [k for s in paused_groups for k in s['skill_ids']]
    total = 103 + len(EXP.MOVE_IDS)   # 64 + 39 + 攻击招式扩充 v1
    assert len(moves) == total, len(moves)
    assert len(art_ids) + len(paused) == total and not set(art_ids) & set(paused), (len(art_ids), len(paused))
    out = {}
    for k in art_ids:
        m = moves[k]
        c = m['combat']
        bps = c['bp']
        avail = [b for b in bps if b['available']]
        assert avail, k
        power = max(b['total_power'] for b in avail)
        heal_coef = next((e['value'] for e in c['effects'] if e['type'] == 'heal_coefficient'), 0)
        heal = rnd(min(HEAL_CAP, heal_coef * HEAL_RATE), 3) if heal_coef else 0
        tgt = target(m, c, power, heal)
        weapon = m.get('weapon') or '通用'
        sk = {'name': m['name'], 'kind': KIND.get(weapon, weapon), 'mp': c['mp'], 'pow': rnd(avail[0]['total_power']),
              'range': 1, 'shape': {'foes': 'all', 'allies': 'allies', 'self': 'self', 'ally': 'ally'}.get(tgt, 'single'),
              'grade': m['grade'], 'maxLevel': c.get('max_level', 10), 'v3': 1,
              # 战斗提示行放得下的短说明用 effect_v3；完整文案 desc_v4 另存 descV4（武学页可用）
              'desc': m.get('effect_v3') or m.get('effect') or '', 'descV4': m.get('desc_v4') or ''}
        if heal:
            sk['heal'] = heal
        need = NEED_WEAPON.get(m.get('weak_class'))
        if need and power > 0 and not m.get('free_hand'):   # 徒手招（指力、掌力、内力发声）不要求装备兵器
            sk['needWeapon'] = need
        bi = {'v3': 1, 'tgt': tgt, 'lv': c.get('mastery_per_level', .04)}
        if weapon in HIT_T or weapon in T_ALIAS:
            bi['t'] = T_ALIAS.get(weapon, weapon)
        if m.get('element'):
            bi['e'] = m['element']
        if c['base_hits'] > 1:
            bi['hits'] = c['base_hits']
        rev = sum(e['value'] for e in c['effects'] if e['type'] == 'reveal')
        if rev:
            bi['reveal'] = rev
        bi['bp'] = [[rnd(b['total_power']), b['hits'], b['shield_cap'], rnd(b['heal_multiplier'], 3)] if b['available'] else None for b in bps]
        w = c.get('hit_weights') or []
        if w and len(set(w)) > 1:
            bi['w'] = [rnd(x) for x in w]
        if c.get('ultimate_lock_next_self_actions'):
            bi['ult'] = c['ultimate_lock_next_self_actions']
        if c.get('cooldown_self_actions'):
            bi['cd'] = c['cooldown_self_actions']
        if m.get('usage') == 'defend_enhance' or k in DEFEND_ENHANCE_CONFIRMED:
            bi['def'] = 1
        elif power <= 0 and not heal:
            bi['sup'] = 1
        ef = [[[e['type'], e.get('value'), e.get('condition')] for e in (b['effects'] if b['available'] else []) if e['type'] not in SKIP_EF] for b in bps]
        if any(ef):
            bi['ef'] = ef
        cls = 'dmg' if power > 0 else 'sup'
        fx = [min(GRADE_TIER[m['grade']], tier_cap(c['mp'])), cls]
        out[k] = {'s': sk, 'b': bi, 'fx': fx}
        if k in EXP.MOVE_IDS:
            # 扩充招式不在 battle.js 内联的 MOVE_RULES 里：随本表登记 [兵器类, 属性, {st, ult}]，格式同 battle.js
            ex = {}
            st = [[e['status'], e['chance'], e['stacks'], 1 if e.get('per_hit') else 0] for e in c['effects'] if e['type'] == 'apply_status']
            if st:
                ex['st'] = st
            if c.get('ultimate_lock_next_self_actions'):
                ex['ult'] = 1
            out[k]['r'] = [m.get('weak_class') or 0, m.get('element') or 0] + ([ex] if ex else [])
    return out, paused


def main():
    data, paused = build()
    body = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    js = f"""/* 由 tools_docs/build_runtime_moves.py 生成，勿手改。功法传承 v3：门派功法招式 → 运行战斗技能（{len(data)} 招）。
 * 规则见 docs/design/runtime-moves.md。只补缺：SKILLS / BSK / FXDEF 已有同 id 时不覆盖（旧存档与旧原型招式保持原样）。
 * 人物技能组（{len(paused)} 招）暂缓设计，不登记。须在 battle.js、vfx.js 之后，martial-structure.js 之前加载。 */
(()=>{{
 const MOVES={body};
 const PAUSED={json.dumps(paused, ensure_ascii=False)};
 const registered=[],kept=[];
 for(const [id,m] of Object.entries(MOVES)){{
  if(typeof SKILLS!=='undefined'){{if(SKILLS[id])kept.push(id);else{{SKILLS[id]={{...m.s}};registered.push(id)}}}}
  if(typeof BSK!=='undefined'&&!BSK[id])BSK[id]={{...m.b,bp:m.b.bp.map(x=>x&&x.slice())}};
  if(typeof FXDEF!=='undefined'&&!FXDEF[id])FXDEF[id]={{tier:m.fx[0],cls:m.fx[1]}};
  if(m.r&&typeof MOVE_RULES!=='undefined'&&!MOVE_RULES[id])MOVE_RULES[id]=m.r;   // 攻击招式扩充 v1：弱点类型与异常补登记（battle.js 内联表只有前 103 招）
 }}
 window.RuntimeMoves={{version:'RUNTIME-MOVES-1',ids:Object.keys(MOVES),registered,kept,paused:PAUSED,def:id=>MOVES[id]||null}};
}})();
"""
    OUT.write_text(js)
    print(json.dumps({'moves': len(data), 'paused': len(paused), 'out': str(OUT.relative_to(ROOT))}, ensure_ascii=False))


if __name__ == '__main__':
    main()
