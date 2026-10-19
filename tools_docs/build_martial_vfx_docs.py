#!/usr/bin/env python3
"""Compile authored per-martial storyboards into review documents, never runtime effects."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs/design/martial-review';OUT=DOC/'vfx'
def read(name):
 rows={}
 for line in (OUT/name).read_text().splitlines():
  parts=line.split('\t');key=parts[0].strip();assert len(parts)==5 and key not in rows,key;rows[key]=parts[1:]
 return rows
c=json.loads((DOC/'catalog.json').read_text());skills=read('directions.tsv');hearts=read('hearts.tsv')
assert set(skills)=={r['id'] for r in c['skills']};assert set(hearts)=={r['id'] for r in c['hearts']}
grades={g:dict(zip(['duration_ms','cast_end_ms','travel_end_ms','impact_end_ms','particles_total','particles_alive','shake_px','hitstop_once_ms','hitstop_action_ms'],v)) for g,v in zip('丁丙乙甲绝',[(500,90,200,310,22,18,3,30,75),(700,140,270,460,36,28,4,45,100),(950,210,400,650,60,44,6,60,140),(1250,310,520,900,90,64,8,80,180),(1700,480,750,1280,130,90,10,100,220)])}
self_ids={'gy_p2','sf_s1','qf_s1','rq_s2'}
# Correct two data fields to the already written, single-target design. This does not modify runtime code.
for r in c['skills']:
 if r['id'] in {'gy_p2','qx_s2'}:r['target_mode']='specified'
rows=[]
for r in c['skills']+c['hearts']:
 passive=r['kind']=='heart';direction=(hearts if passive else skills)[r['id']];budget=grades[r['grade']].copy();damage=not passive and r['base_hits']>0
 if passive:budget.update(duration_ms=360,cast_end_ms=60,travel_end_ms=140,impact_end_ms=220,particles_total=12,particles_alive=8,shake_px=0,hitstop_once_ms=0,hitstop_action_ms=0)
 elif not damage:budget.update(shake_px=0,hitstop_once_ms=0,hitstop_action_ms=0)
 window=[0,budget['cast_end_ms'],budget['travel_end_ms'],budget['impact_end_ms'],budget['duration_ms']]
 labels=['触发条件','聚形','反馈','消隐'] if passive else ['起手蓄势','主形与轨迹','命中／生效','收势']
 timeline=[{'phase':label,'start_ms':window[i],'end_ms':window[i+1],'description':d} for i,(label,d) in enumerate(zip(labels,direction))]
 hits=r.get('base_hits',0);events=[]
 if damage:
  for i in range(hits):
   t=round(budget['travel_end_ms']+(budget['impact_end_ms']-budget['travel_end_ms'])*(1-((hits-i-1)/hits)**1.5))
   events.append({'at_ms':t,'name':'present_hit','segment':i+1,'semantic':'等待同段战斗结果；表现事件不计算伤害'})
 else:events=[{'at_ms':budget['travel_end_ms'],'name':'present_passive' if passive else 'present_support','semantic':'等待对应真实状态／恢复／资源结算结果'}]
 weapon=r.get('weapon','内息');sound=('soft_breath' if passive else 'medical_connect' if weapon=='医具' else 'support_cloth' if not damage else {'剑':'sword_cut','刀':'blade_heavy','刀':'blade_short','拳':'punch_body','棍':'staff_thud','暗器':'needle_tick'}.get(weapon,'impact_dry'))
 target='self' if passive or r['id'] in self_ids else r.get('target_mode','specified')
 row={k:r[k] for k in ['id','name','group','kind','grade','visual','effect']}
 row.update(version='VFX-SCRIPT-1',status='description_only_pending_animation_review',icon_id=r['icon_id'],icon_reference=r.get('sample_path'),target_scope=target,base_hits=hits,timeline=timeline,events=events,budget=budget,coordinate_space='640x360 VFX；震屏为960x540逻辑像素',anchors=['origin','target','ground'],layering='蓄势与大范围意象在人物后；针尖／锋脊／命中在前；UI保持最前，禁止遮住人物脸与血条',speed_design='起手缓收约主行程速度的0.2倍，主轨迹末35%加速至2.5倍，命中轮廓快速定形，尾迹阻尼回收；不是整段匀速流水' if damage else '平缓铺开、短促生效、迅速归静；不以爆炸表示治疗或增益',sound_cues={'family':sound,'cast':'低音量短运气／衣料，不能铃铛连响','resolve':'真实命中／生效时同步单次短声；群体同帧合并主声','tail':'默认无声；高阶可短而低的余响','asset_status':'声音类别描述，后续选有许可证的素材；此轮不生成音频'},bp_rule=('无BP单独施放，不重复主动技能演出' if passive else ('读取该次结算的真实段数动态分配命中窗口；同一档预算内重新分配，不能只加粒子或虚增伤害' if r.get('boost_mode')=='hits' else 'BP不更改基础伤害段数；仅按已有机制提高对应威力／持续／资源等，表现不突破品阶窗口与预算')),failure_rule='取消立即停发并清理；闪避只播擦过，免疫只播免疫提示；不制造成功状态、伤害或恢复',reduced_mode='保留技法主形、目标和真实命中节拍；减少装饰尾迹与碎屑50%，关闭全屏闪光、震屏与镜头推拉',material_plan=['程序像素轨迹与分段轮廓','共享短刺／斩面／钝击／护弧／内息点基础形状','局部辉光与寿命色阶；UI图标不直接贴进战场'],implementation_status='未生成动画、未生成贴图序列、未接入运行引擎')
 rows.append(row);r['vfx_script_ref']='vfx/'+r['group']+'.md#'+r['id'];r['vfx_script_id']=r['id'];r['vfx_script_version']='VFX-SCRIPT-1'
(OUT/'catalog.json').write_text(json.dumps({'version':'VFX-SCRIPT-1','status':'descriptions_only','budgets':grades,'entries':rows},ensure_ascii=False,indent=2)+'\n')
for group,info in c['groups'].items():
 subset=[r for r in rows if r['group']==group]
 if not subset:continue
 text=f'# {info[0]} · 特效分镜\n\n[总规则](README.md) · [图标与分镜总览](../../../../review/martial-library/index.html)\n\n状态：仅设计描述，动态效果尚未制作／验收。色彩与身份：{info[2]}\n\n'
 for r in subset:
  text+=f"<a id=\"{r['id']}\"></a>\n\n## {r['name']} · {r['grade']} · {'心法' if r['kind']=='heart' else '招式'}\n\n- ID：`{r['id']}`；图标：`{r['icon_id']}`；范围：`{r['target_scope']}`。\n- 机制：{r['effect']}。\n- 图形身份：{r['visual']}。\n- 主窗口：{r['budget']['duration_ms']}ms；累计／同时存活粒子上限：{r['budget']['particles_total']}／{r['budget']['particles_alive']}；基础伤害段数：{r['base_hits']}。\n\n| 阶段 | 参考时间 | 分镜 |\n|---|---|---|\n"
  for t in r['timeline']:text+=f"| {t['phase']} | {t['start_ms']}–{t['end_ms']}ms | {t['description']} |\n"
  text+=f"\n**速度张力：**{r['speed_design']}。\n\n**结算同步：**"+'；'.join(f"{e['at_ms']}ms `{e['name']}`" for e in r['events'])+f"。时间只作预演参考，运行时以同段真实结果为准。{r['bp_rule']}。\n\n**声音：**`{r['sound_cues']['family']}`；{r['sound_cues']['resolve']}；{r['sound_cues']['tail']}。\n\n**失败与简化：**{r['failure_rule']}；{r['reduced_mode']}。\n\n"
 (OUT/(group+'.md')).write_text(text)
(DOC/'catalog.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'skills':len(skills),'hearts':len(hearts),'documents':len(c['groups']),'runtime_changes':0}))
