"""Derive review timing/phase cards from the adopted BART maps; no image edits."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];D=R/'review/character-completion-20261014'
d=json.loads((D/'data.json').read_text())
mechanics={
'sword_steel':('斜上挑 / 短刺','右手主握，左手护中线；后脚送髋，前脚落稳才出锋。','低锋蓄势|转髋带刃|斜上挑接触|收肘护中线','收肘对线|进步短刺|抽剑回守'),
'sword_wood':('练剑上挑 / 短刺','同一剑路的桃木剑版本；动作停顿略长，收锋克制，保留完整木剑轮廓。','低锋蓄势|脚下发力|挑剑到位|收锋站稳','收剑对线|短步直刺|回收护胸'),
'fist':('短拳 / 推掌','两肘贴肋，重心下沉；后足、髋、肩顺序发力，手中没有握柄孔与残留兵器。','沉胯护面|蹬地送肩|短拳接触|双臂回守','收掌蓄势|弓步推掌|收掌护胸'),
'dao':('斜劈 / 横切','单手主握、左手护胸；站距较宽，腰胯带刀走完弧线，收势长于剑。','提刀引肩|转腰落刃|低位斜劈|顺势收刀','后引刀身|横切通过|回腕落刀'),
'staff':('横扫 / 直送','双手分握同一杆，后手推送、前手导向；前后足换重心，尾杆随肩线转动。','提杆引肩|转腰横杆|横扫接触|抽杆回护','双手收杆|弓步直送|抽杆站稳'),
'needle':('平送 / 低位送针','持器手由腰侧取针，另一手护身；在原攻击距离短送释放，针的飞行独立绘制。','腰侧取针|抬腕蓄势|松指释放|收腕回护','压低重心取针|低位释放|起身回守'),
'gy_luxiaodou':('点步直刺 / 让线挑剑','14岁少年，重心轻、前足抢半步；持桃木剑。两段备选动作不增加招式或伤害段数。','收肘探尖|后足蹬地|落步短刺|停锋|收肘|退回半步','外侧让步|让低剑尖|转髋|上挑前伸|锋刃到位|止住前倾|压腕回收|站稳'),
'gy_fangchi':('承接回切 / 短刺','肩线较正，步幅克制；先护住中线，再回切，结束仍维持同门对练的距离。','护中线|转腕引锋|回切接触|收剑站稳','收锋对线|短刺到位|退回护位'),
'gy_zhongzhuo':('扎根短拳 / 稳步推掌','双足宽站、膝髋相连；发力短而厚重，肩胯转动，身体不追着拳头扑出去。','沉肩|收拳送髋|贯拳接触|止住前倾|收肘','沉胯|提掌|推掌接触|卸力|收掌'),
'gy_zhouyan':('截锋 / 斜线点剑','上身安稳、小幅移足；以转腕与窄锋路控制距离，截住后立即收剑，区别少年抢攻。','守线|试锋|引偏|转腕|截锋接触|停锋|收剑','侧移|藏锋|换角|送剑|点剑接触|止势|归位'),
'gy_peizhigu':('书卷轻触 / 原位示意','书卷收在身前；轻触只作普通攻击，指瑕、温故、慎行、校雠各用原位小幅手势。','护书抬手|书卷轻触|收手护书','护书抬手|书卷轻触|收手护书')}
state_notes={
'idle':('待机','保留持器方式和两脚支撑，轻微呼吸后回到起始姿。','呼吸起|呼吸落'),
'dash':('移步','整身换足，前后腿轮换；兵器保持握持。位移距离由实际战斗目标决定。','前足引步|后足跟进'),
'cast':('原位施放','施者留在战斗站位，使用简短运功或持器姿态；功法由目标处效果结算。','原位起势|原位示意|回守'),
'guard':('防御','守中线、屈膝降低重心；复用专门守势帧，不因动画增加减伤。','守势保持'),
'hurt':('受击','肩胯受力偏移后回稳；由真实受击触发，不触发额外伤害。','受力失衡|恢复支撑'),
'brk':('破势','屈膝失去支撑，持器手降低；持续到规则解除破势。','破势停留'),
'dead':('倒地','先受力、再跪倒、最后落地；武器随身体落下，不穿身。','受力|失去支撑|倒地停留'),
'win':('胜利','收住攻击意图再放松站稳；仍保留实际装备，不自动变出剑鞘。','收势|站稳'),
'dodge':('闪避','肩线随脚后让，保护持器或书卷；只作为已判定闪避的表现，不改变概率。','后让|护住中线|回稳'),
'stop':('叫停','掌心向前或收剑示止，身体站稳；用于教习终止，不造成伤害。','示意停手'),
'pei_zhi':('指瑕','护书观察后指向敌方破绽；只揭示既有弱点，不扣血、不削盾。','护书观察|抬手指瑕|收手'),
'pei_wen':('温故','翻阅书页后向同伴示意，辅助效果沿现有人物技能合同。','翻阅|示意同伴|护书'),
'pei_shen':('慎行','掌心前示提醒同伴稳住，随后收手；不冲向目标。','护书|示意谨慎|收手'),
'pei_jiao':('校雠','核对书页后点指更正，再合回书卷；不附加武器接触。','核对书页|点指更正|收书')}
rows={}
for a in d['actors']:
 key=a.get('family') or a['id'];title,body,p1,p2=mechanics[key];out={}
 for k,s in a['art']['anim'].items():
  attack=k in ('atk','atk2');name,note,labels=(title.split(' / ')[k=='atk2'],body,p1 if k=='atk' else p2) if attack else state_notes[k]
  labels=labels.split('|');times=s['ms'] if isinstance(s['ms'],list) else [s['ms']]*len(s['f']);steps=[];at=0
  for i,(f,ms) in enumerate(zip(s['f'],times)):
   label=labels[i] if i<len(labels) else labels[i%len(labels)]
   event='release' if s.get('projectile',{}).get('release')==i else 'contact' if attack and s.get('hit')==i else None
   steps.append(dict(frame=f,label=label,start_ms=at,duration_ms=ms,event=event));at+=ms
  out[k]=dict(name=name,body=note,total_ms=at,steps=steps,loop=s.get('loop',False),use='ordinary_attack' if attack else 'stationary_skill' if k=='cast' or k.startswith('pei_') else 'state',rule='一次普通攻击仅一个结算事件；BP次数由战斗规则决定。' if attack else '本状态不自行增加伤害、削盾、闪避或奖励。')
  if attack:
   cue=steps[s.get('hit',0)]['start_ms'];out[k]['contact_or_release_ms']=cue
   if 'projectile'in s:out[k].update(flight_ms=s['projectile']['flightMs'],damage_ms=cue+s['projectile']['flightMs'])
   else:out[k]['damage_ms']=cue
  if not a.get('family') and k=='atk2':out[k]['availability']='已绘制的备用普通出手；当前功法按原位施放规则，不调用这组接触动作。'
 rows[a['id']]=out
(D/'choreography.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actors':len(rows),'action_contracts':sum(map(len,rows.values())),'frames':sum(a['art']['cols'] for a in d['actors'])}))
