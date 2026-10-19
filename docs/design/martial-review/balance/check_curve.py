"""Offline design arithmetic only. Does not import, simulate or modify the game.
Writes curve.csv and arithmetic.json next to this file. Inputs remain proposals.
"""
from pathlib import Path
import csv, json, math
D=Path(__file__).resolve().parent
spec=json.loads((D/'budget.json').read_text())
rows=[]
for i,a in enumerate(spec['anchors']):
    d=a['attack']*60/(60+a['enemy_defense'])
    row=dict(a,neutral_damage=round(d,2),enemy_hp_ordinary=round(d*spec['ordinary_hits']),
             team_reference_dpr=round(d*a['party_reference']*.75*1.2,2))
    if i:
        old=spec['anchors'][i-1]
        ratios=[a[k]/old[k] for k in ['hp','attack','mp','defense']]
        row['largest_anchor_step_pct']=round((max(ratios)-1)*100,2)
        row['minimum_intermediate_segments']=max(1,math.ceil(math.log(max(ratios))/math.log(1.07)))
    else:row.update(largest_anchor_step_pct=0,minimum_intermediate_segments=0)
    rows.append(row)
with (D/'curve.csv').open('w',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
old0=max(1,50-80*.5);old1=max(1,60-80*.5)
new0=50*60/(60+80);new1=60*60/(60+80)
wilson=lambda k,n:((k/n+1.96**2/(2*n)-1.96*math.sqrt((k/n*(1-k/n)+1.96**2/(4*n))/n))/(1+1.96**2/n),(k/n+1.96**2/(2*n)+1.96*math.sqrt((k/n*(1-k/n)+1.96**2/(4*n))/n))/(1+1.96**2/n))
r={
 'status':'proposal_arithmetic_not_balance_certification',
 'formula_sensitivity':{'old_50_atk_80_def':old0,'old_60_atk_80_def':old1,'old_increase_pct':round((old1/old0-1)*100,2),'new_50_atk_80_def':round(new0,3),'new_60_atk_80_def':round(new1,3),'new_increase_pct':round((new1/new0-1)*100,2)},
 'multihit_defense':{'old_atk50_power1_def40_one_hit':30,'old_split_three_equal_hits_total_before_rounding':3*max(1,50/3-40*.5),'proposed_total_before_distributing':50*60/(60+40)},
 'shield_break_actions':{'shields_4_5_6_7':[math.ceil(s/3) for s in [4,5,6,7]],'note':'3 shield hits per action, no BP or interactions; 6->7 increases actions 2->3'},
 'unannounced_extra_action':{'before':30,'two_same_attacks':60,'increase_pct':100,'proposed_split_attack_total_cap':37.5},
 'party_two_to_three_equal_attackers_pct':50,
 'wilson_95_interval_5_of_5':[round(z,4) for z in wilson(5,5)],
 'wilson_95_interval_0_of_5':[round(z,4) for z in wilson(0,5)],
 'sustained_damage_before_skill_power_max_factors':round(1.36*1.3*2.1*1.1*1.5*1.25*1.05,4),
 'anchor_warnings':[{'id':a['id'],'largest_step_pct':a['largest_anchor_step_pct'],'minimum_segments':a['minimum_intermediate_segments']} for a in rows if a['largest_anchor_step_pct']>7],
 'unvalidated':['All 64 skills interaction simulation','Actual mandatory recruit and date ledger','Actual economy and XP from all routes','UI telegraphs and human playtests','Confidence intervals from 1000-seed real-runtime profiles','No assumed DPR used as proof of actual battle duration']}
assert abs((new1/new0)-1.2)<1e-10
assert r['shield_break_actions']['shields_4_5_6_7']==[2,2,2,3]
assert len(rows)==12
(D/'arithmetic.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'anchors':len(rows),'transition_warnings':len(r['anchor_warnings']),'old_attack_step_pct':r['formula_sensitivity']['old_increase_pct'],'candidate_attack_step_pct':r['formula_sensitivity']['new_increase_pct'],'status':r['status']},ensure_ascii=False))
