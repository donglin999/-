#!/usr/bin/env python3
"""Build the review website data and short reading docs from story-atlas.json."""
import argparse,json,re
from pathlib import Path
from faction_attire import apply_attire, contracts
ROOT=Path(__file__).resolve().parents[1]; P=ROOT/'docs/design'
parser=argparse.ArgumentParser(description='Validate registry, then generate only declared derived files; never append to source documents.')
parser.add_argument('--out',type=Path,help='Output root for preview; sources are always read from this repository.')
parser.add_argument('--check',action='store_true',help='Validate and render in memory without writing any files.')
args=parser.parse_args(); OUTPUT_ROOT=args.out.resolve() if args.out else ROOT
rendered={}
def emit(relative,content): rendered[relative]=content
D=json.loads((P/'story-atlas.json').read_text()); F={f['id']:f for f in D['factions']}; PH={x['id']:x for x in D['phases']}
apply_attire(D)
# A documented current override takes precedence over the older generic portrait batch.
for character in D['characters']:
 if character.get('attireOverride'): character['attire']=character['attireOverride'].copy()
companions=[c for c in D['characters'] if c['type']=='companion']; women=[c for c in companions if c['gender']=='女']; checks=[]
def check(title,ok,detail): checks.append(dict(title=title,status='通过' if ok else '需处理',detail=detail,method='自动核对'))
ids=[c['id'] for c in D['characters']]+[c['id'] for c in D['ambient']]
check('角色标识唯一',len(ids)==len(set(ids)),f'{len(ids)}个角色／普通NPC模板标识，无重复覆盖。')
roster_rows = re.findall(r'^\| ([^|]+) \| [^|]+ \| (女|男) \|', (P/'companions.md').read_text(), re.M)
check('招募名单一致', {(c['name'],c['gender']) for c in companions}==set(roster_rows) and len(roster_rows)==len(companions),f'{len(companions)}位候选、{len(women)}位女性、{len(companions)-len(women)}位男性；核对名册实际表格。')
check('女性全部成年且可结缘',all(c['age']>=18 and c['romance'] for c in women),f'初见{min(c["age"] for c in women)}—{max(c["age"] for c in women)}岁；年龄是初见基线，满三年按实际日历增长。')
check('阶段顺序有效',all(all(PH[a['phase']]['order']<=PH[b['phase']]['order'] for a,b in zip(c['events'],c['events'][1:])) for c in D['characters']),'使用培养月份及游历、终局阶段窗口，不将后期塞进三年。')
check('形象字段完整',all(c.get(k) for c in D['characters'] for k in ['appearance','body','voice','goal','source']),'主角、同伴、前辈和具名NPC均有职业形象；普通NPC另有模板。')
selection_policy=json.loads((ROOT/'art_sources/story_atlas_portraits_v5/selection-overrides.json').read_text())['characters']
selected_body_standards={cid:p['body_standard'] for cid,p in selection_policy.items()}
def selected_visual(c):
 v=c.get('visualRevision',{})
 if c['id']=='yin-hongying':
  return v.get('selection')=='user_selected_B_20261007_inkcloud_20261008' and v.get('bodyStandard')=='yin-hongying-user-selected-B' and (P/v.get('confirmedSource','')).is_file()
 return v.get('bodyStandard')==selected_body_standards.get(c['id'],'female-companion-body-20261003') and (c['id'] not in selection_policy or v.get('selection')==selection_policy[c['id']]['selection'])
check('可加入女性当前形象选择',all(selected_visual(c) for c in women),'既有批次依选择登记；殷红缨依2026-10-07选B版与10-08归云水墨负责页，未套用另一批身材模板。本项只查来源，不代替视觉验收。')
check('普通NPC覆盖',set(F)<=set(n['faction'] for n in D['ambient']),'各登记组织及散人场景都有模板；归云谷仅偶来访客，不扩常住人口。')
check('原稿引用存在',all((P/c['source']).is_file() for c in D['characters']) and all((P/f['source']).is_file() for f in D['factions']),'人物详情可打开原稿。')
attire_policy,face_policy=contracts()
profiles=attire_policy['profiles']; shape_keys=[tuple(p['structural_keys']) for p in profiles.values()]
check('衣装形制规则完整',set(F)==set(profiles) and len(shape_keys)==len(set(shape_keys)) and all(p.get(k) for p in profiles.values() for k in ['silhouette','collar_sleeves','material','motif','accessories','variants']),'各登记门派／组织／职业有独立形制和第二辨识点；这是规则检查，不能代替缩略图画面审阅。')
by_id={c['id']:c for c in D['characters']+D['ambient']}
opening_ids=['xu-lingyi','cen-shuang','shen-yanhui']
check('栖河三方主事人与再会安排（汉皋剧情已作废，F-0050）',all(by_id[cid]['type']=='companion' and by_id[cid]['events'][0]['phase']=='opening' and bool(by_id[cid].get('openingRevision',{}).get('cityMeeting')) and by_id[cid]['openingRevision'].get('autoRecruit') is False for cid in opening_ids), '徐令仪、岑霜、沈雁回亲自主持三方交涉、村火后对证；原个人篇和招募善后保留，新稿未实装。')
check('当前身份与衣装归属',all(c.get('attire',{}).get('profile') in profiles and len(c['attire']['required_features'])>=2 for c in by_id.values()) and not by_id['ye-heng']['attire']['identifier_allowed'] and not by_id['ambient-alliance-2']['attire']['identifier_allowed'] and '禁止官帽' in by_id['shen-yanhui']['attire']['membership_label'],f'{len(by_id)}位人物／NPC模板有衣装卡；实际身份与师门分组分别核对。')
documented_faces=[c for c in women if c['id'] in face_policy['profiles']]
missing_faces=[c for c in women if c['id'] not in face_policy['profiles']]
check('已登记女性面部设计字段完整',all(all(face_policy['profiles'][c['id']].get(k) for k in face_policy['required_axes']) for c in documented_faces) and len({tuple(face_policy['profiles'][c['id']]['signature']) for c in documented_faces})==len(documented_faces),f'{len(documented_faces)}位已有六轴资料；仅核对已登记资料，不把缺项算通过。')
check('面部未登记项有明确状态',all(c.get('faceRegistrationStatus')=='pending_documented_axes' for c in missing_faces),'缺六轴须显式标为待补，禁止复制他人脸型或编造已确认数据。')
if missing_faces: checks.append(dict(title='新增人物六轴图谱登记待补',status='待细化',detail='、'.join(c['name'] for c in missing_faces)+'已有正式形象来源，尚未整理六轴资料；本次未重新生图或声称视觉审查通过。',method='范围说明'))
new_character=by_id.get('ruan-qingque',{})
spec=new_character.get('recruitmentSpec',{})
check('阮青雀招募设计可达',len(spec.get('minimumNodes',[]))>=6 and spec.get('requiresRomance') is False and spec.get('requiresTheftSkill') is False and spec.get('publicInvestigationRoute') is True and spec.get('existingTeacherPreserved')=='许青' and not any(e['phase']=='opening' for e in new_character.get('events',[])), '六节点、友情与公开调查路线；保留许青教学，不插入开始部分。只核对设计约束，未测试未实装玩法。')
card=json.loads((P/'character-card-ruan-qingque.json').read_text())
check('新角色素材交付边界',card['role_type']=='companion' and card['availability']=='future' and card['controls_available'] is False and card['chapter_scope']==[] and len(card['future_packages'])>=3 and card['base_package_status']=='portrait_reference_only_full_companion_package_pending', '图鉴定妆已交付；招募前、临时参战、正式同伴阶段分别列包，未把未生成素材标完成。')
qin=by_id.get('qin-feiyuan',{}); qspec=qin.get('recruitmentSpec',{})
check('秦绯鸢独立招募与柳线边界',qspec.get('minimumNodes')==['QF-01','QF-02','QF-03','QF-04','QF-05','QF-06'] and qspec.get('requiresRomance') is False and qspec.get('requiresLiuHanyanRecruitment') is False and qspec.get('requiresTheftSkill') is False and qspec.get('publicInvestigationRoute') is True and not any(e['phase']=='opening' for e in qin.get('events',[])), '两人同楼、六节点可补写，善后与本人交接成立后招募；含烟债约和招募独立，友情及公开见证可达。只检查设计，未测试游戏招募。')
qcard=json.loads((P/'character-card-qin-feiyuan.json').read_text())
check('秦绯鸢当前素材与未来包',qcard['availability']=='future' and qcard['controls_available'] is False and qcard['chapter_scope']==[] and qcard['first_meeting_age']==23 and len(qcard['future_packages'])>=3 and qcard['base_package_status']=='portrait_reference_only_full_companion_package_pending', '半透明披纱修订图为图鉴身份参考；招募前、临时援助、正式同伴包另行交付。当前不开放地图出场、战斗或语音。')
pei=by_id.get('pei-zhigu',{}); pspec=pei.get('recruitmentSpec',{})
pcard=json.loads((P/'character-card-pei-zhigu.json').read_text())
pnodes=[f'PG-{i:02d}' for i in range(1,7)]
precruit=pcard.get('recruitment',{}); pro=pcard.get('romance',{})
check('裴知古谷内初识与五月友情同行',pei.get('source')=='companions/pei-zhigu-valley.md' and pei.get('joinPhase')=='y1b' and pspec.get('minimumNodes')==['gn_depart'] and precruit.get('required_nodes')==['gn_depart'] and pspec.get('requiresEarlierOptionalNodes') is False and precruit.get('earlier_optional_nodes_required') is False and pspec.get('requiresRomance') is False and precruit.get('romance_required') is False and precruit.get('runtime_api')=='PeiCompanion.recruit' and bool(precruit.get('recovery')), '按2026-10-10确认设定及现行招募API登记；前三段可错过、满队进名册；旧PG六节点保留为后期个人篇历史来源，不再充当招募门槛。')
check('裴知古局部实现与后期边界',pcard.get('availability')=='current' and pcard.get('combat') is True and pcard.get('combat_side')=='ally' and pspec.get('runtimeImplemented')=='partial' and bool(pcard.get('runtime_scope',{}).get('implemented')) and bool(pcard.get('runtime_scope',{}).get('not_implemented')) and pcard.get('romance',{}).get('adult_player_required') is True and pcard.get('historical_design_20261005',{}).get('recruitment',{}).get('required_nodes')==pnodes, '已登记谷内剧情、五月同行、绑定册子与在队见闻的局部接入；完整册子升阶、个人篇和重排感情篇仍未完成。结构核对不表示本轮测试游戏。')
yin=by_id.get('yin-hongying',{})
check('殷红缨已确认招募资格登记',yin.get('name')=='殷红缨' and yin.get('age')==29 and yin.get('gender')=='女' and yin.get('type')=='companion' and yin.get('romance') is True and yin.get('faction')=='guiyun' and yin.get('source')=='guiyun-household.md','2026-10-07确认可入队可结缘，2026-10-09确认29岁；不改变实际招募条件、奖励或武功。')
pidentity=pcard.get('identity_revision',{}); pface=pcard.get('face_identity',{})
check('裴知古成年眼镜身份资料',pei.get('age')==20 and pcard.get('first_meeting_age')==20 and pei.get('gender')=='女' and pcard.get('role_type')=='companion' and pei.get('faction')=='independent' and all(word in pidentity.get('frame','') for word in ['细铜','镜框','透明','细链']) and '自然睁眼' in pidentity.get('eyes','') and '低松辫' in pidentity.get('hair','') and bool(pface.get('glasses')) and bool(pidentity.get('source_record')) and (P/pidentity.get('source_record','')).is_file() and bool(pcard.get('identity_refs')) and all((P/ref).is_file() for ref in pcard.get('identity_refs',[])), '初见20岁成年独立史料研究者；古式细铜圆椭圆透明镜片、双低松辫、自然回神目光有角色卡和原生来源。字段与文件核对不能代替眼镜、身材、人体及面部视觉复审。')
for title,detail in [
('叶蘅分流时间','第一年不拜师；12月底选择、13月分流；汉皋只提供学医机会。'),
('主角与唐照雪师门关系','萧白归云谷，唐照雪属外部照川剑派；沿汉皋初识，不称同门师姐。'),
('岑霜形象与旧责','魅惑成熟形象匹配交涉方式；救援不抹除管束责任，问责及堂务交接后才能正式入队。'),
('三位艺人分工','柳含烟驻楼琵琶、柔韧自持、解约独立、伞架援护；秦绯鸢同楼舞者兼领席、外放嘴利、绯袖班与折扇主动护卫；晏小楼流动戏班、活跃创作、署名责任、移动暗器。'),
('柳含烟故事因果','首年边界线索、二年揭示只卖艺、三年筹备、下山解约独立，再招募结缘；恋爱不作为离楼条件。'),
('吃醋旧版表述','多人允许；“完全没有吃醋”是旧版，当前候选方案有个人关系变化与修复，不强制单选。'),
('同伴数量与NPC资格',f'当前{len(companions)}人、{len(women)}女{len(companions)-len(women)}男；已删5名男同伴只作NPC，不恢复体验招募。'),
('跨地点出现的条件','培养远行依既有地图月份；其余以通信、来访承接，详细同时行程以后逐事件排期。'),
('外形与行为校准','端正角色缺点为固执或过度负责；逐利者以审视和动作提前显露，不突加猥琐下流性格。')]:checks.append(dict(title=title,status='已核对',detail=detail,method='本轮叙事审阅'))
for title,detail in [('具体行程待排期','给出可发生窗口，未假定全部事件在固定日期。后续需验证月度活动容量及人物出行。'),('参考立绘待评审',f"当前{sum(bool(c.get('image')) for c in D['characters'])}位人物及{sum(bool(c.get('image')) for c in D['ambient'])}种NPC模板有图；新图为参考稿，保留原始提示词与阶段，正式采用前评审五官、体型、服装与职业一致性。"),('吃醋数值与前辈细节待评审','−4等数值仍为评审方案；新增年龄、师叔细案和普通NPC模板可调整。')]:checks.append(dict(title=title,status='待细化',detail=detail,method='范围说明'))
D['audit']=checks
header='状态：现行　最后核对：2026-10-19（登记版本：'+D.get('version','未注明')+'）。设定、历史素材与局部实现分别记录，登记完整不等于所有人物已实装。由[统一设定数据](story-atlas.json)生成；构建先校验，可用 --out 预览，不改人物负责页。\n\n'
def age_text(c):
 if c.get('lifeStatus')=='deceased_before_travel':
  return f"开篇年龄基线{c['age']}岁；培养末病故，未与主角实到会面"
 if c.get('firstAppearanceAge') is not None:
  return f"开篇年龄基线{c['age']}岁；首次实到约{c['firstAppearanceAge']}岁"
 return f"初见年龄基线{c['age']}岁"

def story_role_text(c):
 current=c.get('fullflowStory')
 if current:
  return f"- 游历中的本人行动：{current.get('travel','')}\n- 终局与出席：{current.get('end','')}\n- [现行全流程人物联系]({current['source']})（设计，未等同运行接入）。\n"
 role=c.get('storyRole',{})
 if not role:return ''
 mission=role.get('personalGameplay',{})
 return f"- 全作个人任务：{mission.get('description','')}\n- 对局势的影响：{mission.get('worldEffect','')}\n- [四部分人物联系]({role['source']})（设计，未等同运行接入）。\n"

def attire_text(c):
 a=c['attire'];face=c.get('faceIdentity');text=f"- 当前衣装身份：{a['membership_label']}。\n- 形制辨识：{'；'.join(a['required_features'])}。\n- 衣装图状态：{a['art_status']}；[规范](faction-attire.md)。\n"
 if face:text+=f"- 面部区分：{face['face_shape']}；{face['brows']}；{face['eyes']}；{face['nose']}；{face['mouth']}；{face['expression']}。[规范](character-face-identity.md)。\n"
 return text
emit('docs/design/cast-visuals.md','# 人物形象与性格总览\n\n'+header+'[门派风格](faction-styles.md) · [时间表](cast-timeline.md) · [普通NPC](ambient-npc-design.md) · [审核](story-atlas-audit.md)\n\n'+'\n'.join('- '+x for x in D['rules'])+'\n\n'+''.join(f"## {c['name']} · {c['archetype']}\n\n- 身份：{F[c['faction']]['name']}；{age_text(c)}；{'可入队且可结缘' if c.get('romance') else '可入队，友情' if c['type']=='companion' else '主角' if c['type']=='player' else '不可招募'}。\n- 外形：{c['appearance']}\n{attire_text(c)}- 体态：{c['body']}\n- 语言行为：{c['voice']}\n- 内在问题：{c['flaw']}\n- 目标：{c['goal']}\n- 战斗：{c['combat']}\n{story_role_text(c)}- [原稿]({c['source']})\n\n" for c in D['characters']))
emit('docs/design/faction-styles.md','# 门派风格与剧情关系\n\n'+header+''.join(f"## {f['name']} · {f['kind']}\n\n- 色彩：{f['palette']}。\n- 场景基调：{f['visual']}\n- 衣装形制：{f['attire']['silhouette']}\n- 领袖：{f['attire']['collar_sleeves']}\n- 材质：{f['attire']['material']}\n- 纹样：{f['attire']['motif']}\n- 配饰：{f['attire']['accessories']}\n- 变体：{f['attire']['variants']}\n- [衣装规范](faction-attire.md)\n- 气质：{f['ethos']}\n- 武学：{f['combat']}\n- 剧情：{f['plot']}\n- 边界：{f['boundary']}\n- 核心人物：{'、'.join(c['name'] for c in D['characters'] if c['faction']==f['id'])}。\n- [组织原稿]({f['source']}) · [普通NPC](ambient-npc-design.md)\n\n" for f in D['factions']))
emit('docs/design/cast-timeline.md','# 人物剧情时间窗口\n\n'+header+'初见年龄为基线，三年末按日历约增三岁。下山年月未锁定，按地区与主线阶段记录。培养期远行限整月历练，平日通过通信、来访；错过可在下山补写，不跳过完整招募篇。\n\n'+''.join(f"## {ph['label']}\n\n"+''.join(f"- **{c['name']}**：{e['text']}（{e['kind']}；{e['window']}）\n" for c in D['characters'] for e in c['events'] if e['phase']==ph['id'])+'\n' for ph in D['phases']))
unplaced=[(c,e) for c in D['characters'] for e in c.get('unplacedStoryDirections',[])]
if unplaced: rendered['docs/design/cast-timeline.md']+='## 待明确年月的个人篇方向\n\n'+''.join(f"- **{c['name']}**：{e['text']}（{e['window']}；本段不占用某年某月的已排期节点）\n" for c,e in unplaced)+'\n'
emit('docs/design/ambient-npc-design.md','# 无独立剧情NPC形象模板\n\n'+header+'按脸型、肤色、发型、身高与衣料磨损做成年变体；不增加招募篇。平凡不等于邋遢，魔教普通成员也有职业。素材按[角色规范](role-assets.md)。\n\n'+''.join(f"## {f['name']}\n\n"+''.join(f"### {n['name']}\n\n- 类型：{n['type']}。\n- 外形：{n['appearance']}\n{attire_text(n)}- 行为：{n['action']}\n- 时间：{n['time']}\n- 素材：{n['asset']}\n\n" for n in D['ambient'] if n['faction']==f['id']) for f in D['factions']))
emit('docs/design/story-atlas-audit.md','# 人设与剧情矛盾审核\n\n'+header+'区分自动核对、叙事审阅与待细化问题，不代表游戏或未制作立绘已通过测试。\n\n'+''.join(f"- **[{x['status']}] {x['title']}**（{x['method']}）：{x['detail']}\n" for x in checks))
names=set(c['source'] for c in D['characters'])|set(f['source'] for f in D['factions'])|{'romance.md','romance-stories.md','romance-jealousy-review.md','story-framework-review.md','ye-routes.md','cast-visuals.md','faction-styles.md','ambient-npc-design.md','cast-timeline.md','story-atlas-audit.md','portrait-review.md','female-visual-v3.md','female-visual-v4.md','female-visual-v5.md','character-portrait-style.md','faction-attire.md','character-face-identity.md','duan-hotpants.md','companion-performance.md'}
names.update(c[k] for c in D['characters'] for k in ['storySource','assetSource','performanceSource'] if c.get(k))
names.update(['companion-performance.md','companion-performance/index.md'])
names.update(['wen-visual-revision.md','character-personality-performance.md','companions/pei-zhigu.md','pei-zhigu-assets.md','character-card-pei-zhigu.json'])
names.update(['opening-three-representatives.md','chapter1-pressure.md','chapter1-fire.md','chapter1-mountain.md'])
names.update(['story-rework-20261016/README.md','story-rework-20261016/companions.md','story-rework-20261016/faction-cast.md','story-rework-20261016/regions-gameplay.md'])
names.update(['fullflow-story-20261016/README.md','fullflow-story-20261016/story.md','fullflow-story-20261016/characters.md','fullflow-story-20261016/companions-and-side-stories.md','fullflow-story-20261016/implementation-plan.md','fullflow-story-20261016/migration-and-calendar.md'])
src=lambda n:(P/n) if (P/n).exists() else (P.parent/'archive'/'design'/n)  # 2026-10-19：已归档的来源页从 docs/archive/design 读取
D['sources']={n:rendered.get('docs/design/'+n,src(n).read_text()) for n in sorted(names)}
emit('review/story-atlas/data.js','window.STORY_ATLAS = '+json.dumps(D,ensure_ascii=False).replace('</','<\\/')+';\n')
emit('docs/design/story-atlas-audit.json',json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
fail=[c for c in checks if c['status']=='需处理']
summary=dict(characters=len(D['characters']),companions=len(companions),women=len(women),ambient_templates=len(D['ambient']),checks=len(checks),failures=fail,pending=[c['title'] for c in checks if c['status']=='待细化'],writeCount=0,outputRoot=str(OUTPUT_ROOT),checkOnly=args.check)
if fail:
 print(json.dumps(summary,ensure_ascii=False));raise SystemExit(1)
if not args.check:
 for relative,content in rendered.items():
  destination=OUTPUT_ROOT/relative;destination.parent.mkdir(parents=True,exist_ok=True);destination.write_text(content)
 summary['writeCount']=len(rendered)
print(json.dumps(summary,ensure_ascii=False))
