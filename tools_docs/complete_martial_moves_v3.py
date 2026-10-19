#!/usr/bin/env python3
"""Author the 64 move contracts. Original image receipts are immutable."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs/design/martial-review'
c=json.loads((DOC/'catalog.json').read_text());systems=json.loads((DOC/'martial-systems.json').read_text())['systems'];owner={k:s['id'] for s in systems for k in s['skill_ids']}
# Deliberate total power budgets, not per-hit multipliers.
powers={
'gy_s':[1.05,1.08,1.38,1.62,4.6],'gy_p':[1,0,1.26,0,2.9],
'bh_s':[1.05,0,0,0,0],'zc_s':[1.02,1.03,1.42,1.72,4.3],
'hc_s':[1.08,0,1.35,0,3.0],'sf_s':[0,.6,0,1.05,0],
'gj_s':[1.08,1.32,1.20,1.14,3.9],'am_s':[.95,0,1.05],
'pj_s':[1,1.02,1.25,0],'yh_n':[1.02,1.22,1.55],'yh_m':[0,0,0],
'yl_s':[1.04,1.02],'qx_s':[0,0],'lh_s':[0,0],'qf_s':[0,0,0],
'rq_s':[1,0,0,.96],'lhg_s':[0],'hzc_s':[1.42]}
# Typed effects: percentages are fractions; duration always names its clock.
fx={
'gy_s1':[], 'gy_s2':[], 'gy_s3':[('conditional_damage',.20,'previous_self_guard')],
'gy_s4':[('last_hit_bonus',.20,'target_broken_before_hit')],
'gy_s5':[('last_hit_bonus',.15,'consume_one_guard_token')],
'gy_p1':[], 'gy_p2':[('unload',.40,'next_received_hit'),('next_attack_bonus',.20,'next_self_attack_once'),('counter_power',.80,'first_single_hit_received_before_next_self_action')],
'gy_p3':[('last_hit_bonus',.20,'actual_intercept_damage_this_round')],
'gy_p4':[('intercept',1,'next_single_ally_hit'),('counter_power',.60,'after_actual_intercept')],
'gy_p5':[], 'bh_s1':[('reveal',1,'on_hit')],
'bh_s2':[('heal_coefficient',1.15,'immediate')],
'bh_s3':[('heal_coefficient',.85,'immediate'),('cleanse',1,'dispellable_only')],
'bh_s4':[('heal_coefficient',.70,'all_alive_allies')],
'bh_s5':[('death_prevention',1,'one_recipient_once_per_battle')],
'zc_s1':[], 'zc_s2':[], 'zc_s3':[('conditional_damage',.20,'target_has_revealed_weakness')],
'zc_s4':[('next_attack_bonus',.15,'only_if_this_skill_breaks_shield')],
'zc_s5':[('last_hit_bonus_per_revealed_type',.04,'maximum_5_types')],
'hc_s1':[], 'hc_s2':[('intercept',1,'next_single_ally_hit')],
'hc_s3':[('extra_shield_damage',1,'on_matching_weakness_once')],
'hc_s4':[('unload',.25,'one_hit_each_ally'),('self_speed_multiplier',.85,'until_next_self_action')],
'hc_s5':[('extra_shield_damage',1,'on_matching_weakness_and_charging_once')],
'sf_s1':[('unload',.40,'next_received_hit'),('next_attack_bonus',.15,'next_self_attack_once'),('counter_power',.60,'first_single_hit_received_before_next_self_action')], 'sf_s2':[('unload',.30,'selected_ally_next_received_hit')],
'sf_s3':[('unload',.25,'one_hit_each_selected_ally'),('order_shift',-1,'one_selected_ally_next_round')],
'sf_s4':[('conditional_damage',.15,'ally_used_guard_this_round')],
'sf_s5':[('unload',.40,'one_hit_each_ally'),('slow_immunity',1,'one_dispellable_slow'),('order_shift',-1,'first_ally_next_round')],
'gj_s1':[], 'gj_s2':[('self_exposure',.10,'next_received_hit')],
'gj_s3':[('unload',.25,'self_next_received_hit')],
'gj_s4':[('self_exposure',.10,'next_received_hit')],
'gj_s5':[('intercept',1,'selected_ally_next_single_hit')],
'am_s1':[('unload',.10,'selected_ally_next_received_hit')],
'am_s2':[('bp_transfer',2,'another_ally_cannot_retransfer_same_round')],
'am_s3':[('next_ally_same_target_damage',.15,'once_until_next_round_end')],
'pj_s1':[], 'pj_s2':[('next_enemy_attack_reduction',.15,'boss_half')],
'pj_s3':[('delay_remaining_action',1,'matching_weakness_and_delayable_intent_no_consecutive_rounds')],
'pj_s4':[('cleanse_slow',1,'each_alive_ally_dispellable_only'),('unload',.25,'one_hit_each_ally')],
'yh_s0':[('heal_coefficient',.70,'immediate')],
'yh_n1':[('mp_discount',1,'target_has_revealed_weakness')],
'yh_n2':[('next_enemy_attack_reduction',.15,'boss_half')],
'yh_n3':[('last_hit_bonus',.20,'target_has_attack_reduction')],
'yh_m1':[('regen_coefficient_per_tick',.50,'end_of_recipient_action')],
'yh_m2':[('damage_bonus',.15,'highest_same_type_only')],
'yh_m3':[('refresh_own_buff',1,'once_per_buff_no_self_refresh_no_reapply_resets')],
'yl_s1':[], 'yl_s2':[('unload',.25,'self_next_received_hit')],
'qx_s1':[('intercept',1,'next_single_ally_hit')],
'qx_s2':[('cleanse_slow',1,'selected_ally'),('intercept',1,'next_single_ally_hit')],
'lh_s1':[('unload',.25,'another_ally_next_received_hit')],
'lh_s2':[('physical_unload',.25,'one_hit_each_ally_until_round_end')],
'qf_s1':[('unload',.25,'self_next_received_hit')],
'qf_s2':[('order_after_caster',1,'unacted_other_ally_no_locked_order'),('unload',0,'selected_ally_next_received_hit')],
'qf_s3':[('intercept',1,'next_single_ally_hit')],
'rq_s1':[('next_enemy_attack_reduction',.15,'boss_half')],
'rq_s2':[('unload',.25,'self_next_received_hit'),('next_reveal_extra',1,'next_successful_matching_weakness_hit_once')],
'rq_s3':[('order_to_allied_tail',1,'self_next_round'),('unload',.25,'selected_ally_next_received_hit')],
'rq_s4':[('next_ally_extra_shield_damage',1,'same_round_matching_known_weakness_once')],
'lhg_s1':[('intercept',1,'next_single_ally_hit')],
'hzc_s1':[('extra_shield_damage',1,'matching_weakness_and_revealed_target_once')]}
# Gold and ultimate names explain the technique and character choice, not just rarity.
lore={
'gy_s4':'千重山岚收于一锋，前三式的观察在末击汇聚，归云的收势转攻由此成形。',
'gy_s5':'云散而山自显，比喻先辨虚实再见根本；消耗守势换取决断，不能靠连续绝技代替观察。',
'gy_p4':'抱山是承重，还岳是还力；先替同伴担住来势，再将所受之力还出。',
'gy_p5':'一声入壑，群山相应；震与合分成两段，让拳掌路以控制群敌见长。',
'bh_s4':'百草各有所长，回生取汇集药性接续生机之意；救活着的人，不能起死回生。',
'bh_s5':'一息尚存便有转机；相续是保住最后一息等待后援，施者不夺生死之权。',
'zc_s4':'落日收光如一锋敛锐，落击先破架，余照留给下一回合。',
'zc_s5':'澄江取水清而虚实可见之意；先识破路数再以一剑收束，见识比盲目强攻更重要。',
'hc_s4':'众人合川以撑山岳；共同卸力有赖施者稳架，故以自身速度换取全队承伤余地。',
'hc_s5':'百步之外亦震关隘，以短促合力制止敌人蓄势；震关不等于凭空越过头目规则。',
'sf_s4':'松涛由众枝同响，合阵须有人先守；协作成立之后才增进阵中攻势。',
'sf_s5':'万籁归于松间，纷乱动作归于同一节拍；稳住队伍，让同伴接上行动。',
'gj_s4':'焚契是斩去旧约，破阵是付出暴露换取突围；断旧路必须承担风险。',
'gj_s5':'余烬留生指猛火之后还留生路；攻势未尽时先替同伴安排退路，拒绝只求同归于尽。',
'am_s3':'明约是共同承诺，合锋是接续而非抢攻；自己的出手为下一名同伴留出位置。',
'pj_s4':'风雨里护送归人，先解迟滞再守住同行者；巡江职责落在实际护送上。',
'yh_n3':'归息是将散乱针势收回，断潮是截住已显露的敌方来势；循脉观察决定末针。',
'yh_m3':'续照不是永燃之灯，是为已有疗护再续片刻；不能无尽延长同一增益。',
'yl_s2':'惊鸿取掠水一现的轻快意象；一轮投掷后卸力退开，灵巧不等于凭空分身。',
'qx_s2':'回舟接客是撑船人回头接住落后的同行者；单人救援体现渡客职责。',
'lh_s2':'雨住而灯留，伞护让同伴撑过眼前这一阵；保护只挡一次物理来袭。',
'qf_s3':'邀锋是将对手刀锋引向自己，护席是为席间同伴让出安全处；不虚构群体无敌。',
'rq_s4':'留缝是故意保留可接应的破绽，短刀牵出一线，由同伴完成破势。'}
name_changes={'gy_s1':'试锋探路','gy_p1':'守拙立桩','am_s1':'短锋相照','rq_s1':'雀喙探隙','lhg_s1':'横刀护途'}
for r in c['skills']:
 id=r['id'];old=r['name'];r['name']=name_changes.get(id,old)
 if id=='am_s3':r['target_mode']='all_foes'
 if old!=r['name']:r['name_history']=list(dict.fromkeys(r.get('name_history',[])+[old]));r['legacy_name']=r.get('legacy_name') or old
 r['naming']={'meaning':lore.get(id, r['name']+'以“'+r['visual']+'”表现'+r['combat_role']+'，名称服务于本招动作与作用。'),'basis':'原创武侠意象；文学参照单独记录，不冒称原著招式','status':'authored_v3'}
 if id=='yh_s0':power=0
 else:prefix,index=id.rsplit('_',1);letter=index[0];num=int(index[1:]);power=powers[prefix+'_'+letter][num-1]
 profile=r['profile'];grade=r['grade'];mp=24 if profile=='X' else ({'G':{'丁':3,'丙':5,'乙':8,'甲':14},'H':{'丁':4,'丙':6,'乙':10,'甲':16}}.get(profile,{'丁':2,'丙':4,'乙':8,'甲':14}))[grade]
 if id in ['gy_s1','gy_p1']:mp=3 if id=='gy_s1' else 0
 effects=[{'type':t,'value':v,'condition':cond} for t,v,cond in fx[id]]
 cooldown=2 if id in ['gy_p4','bh_s4','hc_s4','sf_s3','am_s2','pj_s3','pj_s4','yh_m3','qx_s2','lh_s2','qf_s2','qf_s3','rq_s3'] else 0
 contract={'version':'MOVE-CONTRACT-3','status':'authored_design_not_full_runtime','mp':mp,'action_cost':1,'total_power':power,'base_hits':r['base_hits'],'hit_weights':[round(1/r['base_hits'],6)]*r['base_hits'] if r['base_hits'] else [],'accuracy':1 if grade=='丁' or not r['base_hits'] else .95,'target':r['target_mode'],'target_count':2 if id=='sf_s3' else 'all_alive' if r['target_mode'] in ['all_allies','all_foes'] else 1,'cooldown_self_actions':cooldown,'cooldown_clock':'caster_action_start; next N opportunities blocked','duration_recipient_actions':2 if id.startswith('yh_m') or id=='bh_s5' else 0,'guard_expiry':'before_next_caster_action; lh_s2 at round end','max_level':3 if id in ['gy_s1','gy_p1'] else 10,'mastery_per_level':.04,'effects':effects,'bp':[],'ultimate_lock_next_self_actions':1 if profile=='X' else 0,'runtime_id':r.get('runtime_id'),'runtime_note':r.get('runtime_note','未来招式合同；未开放学习、装配或战斗效果。')}
 # Every BP band has literal numeric outcome. Hits-mode keeps total power constant.
 for bp in range(4):
  mode=r['boost_mode'];valid=profile!='X' or bp==3;hits=r['base_hits']+bp if mode=='hits' else r['base_hits'];mult=[1,1.35,1.7,2.1][bp] if mode=='damage' else 1
  ef=[dict(e) for e in effects]
  for e in ef:
   if mode in ['guard_strength','timing'] and e['type'] in ['unload','physical_unload']:e['value']=([0,.10,.15,.20][bp] if id=='qf_s2' else round(e['value']+[0,.05,.10,.15][bp],2))   # 2026-10-08：以基础值为 0BP，每档 +5%
   if e['type']=='intercept':e['damage_reduction']=[.25,.30,.35,.40][bp] if mode=='guard_strength' else .25
   if e['type']=='bp_transfer':e['value']=[2,2,3,3][bp]
   if e['type']=='next_ally_same_target_damage':e['value']=[.15,.20,.25,.30][bp]
  contract['bp'].append({'spent':bp,'available':valid,'total_power':round(power*mult,4) if valid else 0,'hits':hits if valid else 0,'shield_cap':r['shield_budget_by_bp'][bp] if valid else 0,'heal_multiplier':[1,1.25,1.5,1.8][bp] if mode=='healing' else 1,'duration_recipient_actions':2+bp if mode=='duration' else contract['duration_recipient_actions'],'effects':ef if valid else []})
 if id in ('gy_p2','sf_s1'): contract.update(mp=0,cooldown_self_actions=0,usage_note='防御强化：选防御时自动附带，不另耗内力')   # 2026-10-08 用户确认
 if id=='am_s3':contract['mastery_bonus']={'mp':-1}
 r['combat']=contract;r['system_id']=owner[id];r['status']='authored_v3_ready_for_runtime_implementation'
assert len(c['skills'])==64
c['move_contract_version']='MOVE-CONTRACT-3'
(DOC/'catalog.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
(DOC/'move-contracts.json').write_text(json.dumps({'version':'MOVE-CONTRACT-3','formula_ref':'balance/formula.md','status':'authored_design_offline_verified_not_all_runtime','skills':[{k:r[k] for k in ['id','name','grade','system_id','naming','combat','effect','visual']} for r in c['skills']]},ensure_ascii=False,indent=2)+'\n')
lines=['# 全招式命名与数值合同 v3','', '64项外功招式均有逐项参数；不自动学会、不改授课资格。现有基础课程消耗3/0MP保留；其余是后续实现合同。比例防御候选公式仅供离线验证，现行战斗公式尚未整体迁移。','', '## 量纲与结算','', '- 总威力按整招登记，多段均分总量；群攻为每目标威力，不乘隐藏目标数。','- 每次占1行动；冷却以施者行动开始递减，随后N次行动禁用；持续恢复以受益者行动末结算。','- 内力、BP、冷却同时满足才能用；无合法目标不消耗任何资源。','- 医疗基数12+4×悟性+0.1×最大内力；单次恢复不超过目标最大气血35%；净化只影响可驱散异常。','- 同类伤害加成取最高，条件加成总池封顶30%；对首领的攻击削弱折半。卸力、援护只阻挡声明次数，不拦未声明的群攻。','- 多段削盾仅在对应弱点实际命中时结算；打碎最后盾的那段不吃破势增伤，后续段才吃。','- 绝级需24内力与3BP，威力已含BP；下一次自身行动不得再用任何绝级。','- 装备、人物被动、内功增长不得再次放大表内BP；返还内力、转赠BP、反击不得循环触发自身。','', '## 逐项清单','', '| ID | 招式 | 品阶 | 内力 | 总威力／段数 | 冷却（行动） | 功能 |','| --- | --- | --- | --- | --- | --- | --- |']
for r in c['skills']:
 b=r['combat'];lines.append(f"| {r['id']} | {r['name']} | {r['grade']} | {b['mp']} | {b['total_power']}／{b['base_hits']} | {b['cooldown_self_actions']} | {r['effect']} |")
lines+=['','## 名称含义与逐招特殊效果','']
for r in c['skills']:
 lines += [f"### {r['name']} · `{r['id']}`",'',r['naming']['meaning'],'',f"所属外功：`{r['system_id']}`。取得：{r['obtain']}。",'', '```json',json.dumps(r['combat'],ensure_ascii=False,indent=2),'```','']
(DOC/'move-contracts.md').write_text('\n'.join(lines)+'\n')
print('Authored 64 contracts; names and gold meanings complete.')
