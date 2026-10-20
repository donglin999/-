/* 归云谷一家：第一年师门剧情（设计见 xiaojianghu/docs/design/guiyun-household.md，
 * 本工作区实施记录见 docs/design/qihe-map/expansion/guiyun-household.md）。
 * 与来客剧情共用对白引擎（CultivationVisitors），本模块只提供定义、对白与结算效果；不写 DOM。
 * auto=true 为日历必看剧情：到期后在谷中自动开场，不耗体力；其余为“闲逛”里的支线（2026-10-09 用户定名：可选统一叫支线）。 */
(function(root){
'use strict';
const PH=typeof module==='object'&&module.exports?require('./qh-pre-hangao'):root.PreHangao;
const ART='assets/production/cultivation/household-v1/';
const actors={recipient:'收件人',shimu:'江采薇',yin:'殷红缨',zhong:'钟拙',fang:'方迟',dou:'卢小豆',man:'周小满',goose:'将军'};
// slot=(月-1)*5+时段（0月初 1上旬 2中旬 3下旬 4月底）。避开三月中旬送药与五、十月整月历练。
const definitions=[
 {id:'gy_noodles',place:'kitchen',time:'day',name:'拜师面',teacher:'江采薇',actor:'shimu',auto:true,linear:true,window:[0,4],heroForm:'short',gain:'understanding',amount:2,cast:['hero_short','shimu','dou'],notice:'拜师礼后，师母江采薇在厨房煮了拜师面。'},
 // 入谷“两个月打基础”过渡演出（2026-10-08 用户改定）：日历第一年正月开始前连播，钟拙带萧白、叶蘅熟悉谷中、站桩、初识心法；萧白由短发长成长发。
 {id:'gy_prelude_tour',place:'courtyard',time:'day',name:'熟悉谷中',teacher:'钟拙',actor:'zhong',auto:true,prelude:true,linear:true,window:[0,0],factRequires:['gy_noodles_seen'],heroForm:'short',gain:'observation',amount:2,cast:['zhong','hero_short','ye']},
 {id:'gy_prelude_stance',place:'training_ground',time:'day',name:'站桩一月',teacher:'钟拙',actor:'zhong',auto:true,prelude:true,linear:true,window:[0,0],factRequires:['gy_prelude_tour_seen'],heroForm:'mid',gain:'foundation',amount:6,cast:['zhong','hero_mid','ye']},
 {id:'gy_prelude_xinfa',place:'training_ground',time:'day',name:'初识心法',teacher:'周砚',actor:'zhou',auto:true,prelude:true,linear:true,window:[0,0],factRequires:['gy_prelude_stance_seen'],heroForm:'mid',gain:'breathing',amount:4,cast:['zhou','hero_mid','zhong']},
 {id:'gy_prelude_hair',place:'porch',time:'dusk',name:'两月满',teacher:'江采薇',actor:'shimu',auto:true,prelude:true,linear:true,window:[0,0],factRequires:['gy_prelude_xinfa_seen'],heroForm:'long',gain:'understanding',amount:2,cast:['shimu','hero_long','ye','dou'],enters:{dou:99}},
 // ===== 襄阳前主线与人物节点（剧本来自文档库 pre-xiangyang.json，经 build_pre_xiangyang_scripts.py 生成）=====
 {id:'gy_m02',place:'porch',time:'day',src:'M-02',name:'信到的时候，粥还温着',teacher:'叶蘅',actor:'ye',auto:true,linear:true,main:true,window:[2,4],gain:'medical_notes',amount:2,cast:['ye','hero','zhou'],enters:{zhou:99}},
 {id:'gy_m03',place:'study',time:'day',src:'M-03',name:'先给她看',teacher:'周砚',actor:'zhou',auto:true,linear:true,main:true,window:[5,7],gain:'observation',amount:2,cast:['zhou','ye','hero']},
 {id:'gy_m04',place:'courtyard',time:'day',src:'M-04',name:'这趟送什么，什么时候回',teacher:'陆衡',actor:'lu',auto:true,linear:true,main:true,window:[10,11],gain:'travel',amount:2,cast:['lu','zhou','hero','ye']},
 {id:'gy_m05',place:'mountain_road',time:'day',src:'M-05',name:'雨后这段路',teacher:'陆衡',actor:'lu',auto:true,linear:true,main:true,storyMode:'story',window:[12,12],gain:'travel',amount:4,cast:['lu','hero','ye']},
 {id:'gy_m06',place:'courtyard',time:'day',src:'M-06',name:'回来，先放下包',teacher:'周砚',actor:'zhou',auto:true,linear:true,main:true,window:[13,14],factRequires:['first_delivery'],gain:'understanding',amount:2,cast:['zhou','hero','ye']},
 {id:'gy_m07',place:'study',time:'day',src:'M-07',name:'帖子上有几件不同的事',teacher:'周砚',actor:'zhou',auto:true,linear:true,main:true,window:[15,16],gain:'understanding',amount:2,cast:['zhou','hero','ye']},
 {id:'gy_m08',place:'porch',time:'day',src:'M-08',name:'出发前，先说自己的事',teacher:'叶蘅',actor:'ye',auto:true,linear:true,main:true,window:[19,19],gain:'observation',amount:2,cast:['ye','hero','zhou']},
 {id:'gy_m09',place:'xiangyang_road',time:'day',src:'M-09',name:'城门还在前面',teacher:'周砚',actor:'zhou',auto:true,linear:true,main:true,storyMode:'journey_ready',window:[20,20],gain:'travel',amount:2,cast:['zhou','hero','ye']},
 {id:'gy_z01',place:'training_ground',time:'day',src:'Z-01',name:'记住了，还是站不稳',teacher:'周砚',actor:'zhou',window:[0,9],requires:['stance'],gain:'understanding',amount:6,cast:['zhou','hero']},
 {id:'gy_y02',place:'kitchen',time:'night',src:'Y-02',name:'饭还在锅里',teacher:'叶蘅',actor:'ye',window:[5,11],factRequires:['herb_labels'],gain:'medical_notes',amount:4,cast:['ye','hero']},
 {id:'gy_l02',place:'courtyard',time:'day',src:'L-02',name:'说早了的日子',teacher:'陆衡',actor:'lu',window:[10,11],factRequires:['promise_scope'],gain:'travel',amount:4,cast:['lu','hero']},
 {id:'gy_y03',place:'herb_garden',time:'day',src:'Y-03',name:'清单上也写自己的名字',teacher:'叶蘅',actor:'ye',window:[13,18],factRequires:['first_delivery','herb_labels'],gain:'observation',amount:4,cast:['ye','hero']},
 {id:'gy_z03',place:'study',time:'day',src:'Z-03',name:'帖子上的名字',teacher:'周砚',actor:'zhou',window:[15,19],factRequires:['xiangyang_invitation'],gain:'understanding',amount:4,cast:['zhou','hero']},
 // ===== 师门二至四月补充：大师兄回谷、陪练、下山（为七月负伤铺垫），小满、小豆、钟拙的日常 =====
 {id:'gy_man_herbs',place:'herb_garden',time:'day',name:'小满认药',auto:true,teacher:'周小满',actor:'man',window:[6,9],gain:'herbs',amount:3,cast:['man','ye','hero'],notice:'周小满这几天总跟在叶蘅身后转，说要学认药。'},
 {id:'gy_fang_back',place:'courtyard',time:'dusk',name:'大师兄回谷',teacher:'方迟',actor:'fang',auto:true,window:[8,9],gain:'understanding',amount:2,cast:['fang','hero','dou'],notice:'大师兄方迟出门送信，二月下旬回谷。'},
 {id:'gy_dou_feed',place:'courtyard',time:'day',name:'将军的谷子',auto:true,teacher:'卢小豆',actor:'dou',window:[13,14],gain:'footwork',amount:3,cast:['dou','hero','goose'],notice:'卢小豆说喂鹅的差事要交给新来的——“这是师兄对你的考验”。'},
 {id:'gy_fang_spar',fight:{bg:'bb_qh_training_v1',foes:[{name:'方迟 · 只守不攻',sp:'c_gy_fangchi',lv:2,st:{str:4,con:5,agi:4,wil:4,wis:4},skills:{fist:1},hpMul:.55,atkMul:.2,shield:3,weak:['拳','剑','棍'],h:165}]},place:'training_ground',time:'day',name:'陪练',teacher:'方迟',actor:'fang',window:[13,15],factRequires:['gy_fang_back_seen'],gain:'foundation',amount:6,cast:['fang','hero'],notice:'大师兄说下山历练前，想陪你过几招。'},
 {id:'gy_fang_leaves',place:'courtyard',time:'night',name:'大师兄下山',teacher:'方迟',actor:'fang',auto:true,window:[16,17],factRequires:['gy_fang_back_seen'],gain:'understanding',amount:2,cast:['fang','zhou','hero','shimu'],notice:'大师兄要出门历练，四月上旬动身。'},
 {id:'gy_zhong_kit',place:'courtyard',time:'day',name:'出门的家伙',auto:true,teacher:'钟拙',actor:'zhong',window:[16,19],factRequires:['xiangyang_invitation'],gain:'sewing',amount:3,cast:['zhong','hero'],notice:'听说要去汉皋，二师叔这几天在工棚里叮叮当当，不让人进。'},
 {id:'gy_ledger',place:'market_town',time:'day',name:'师母的账本',teacher:'江采薇',actor:'shimu',window:[1,3],gain:'observation',amount:4,cast:['hero','shimu'],notice:'师母一月要去山下集市卖钟师叔做的木器，正缺个帮手算账。'},
 {id:'gy_night_return',place:'courtyard',time:'night',name:'夜归人',enters:{yin:3,ye:7},teacher:'殷红缨',actor:'yin',auto:true,window:[4,4],gain:'footwork',amount:2,cast:['hero','yin','ye'],notice:'听卢小豆说，小师叔殷红缨月底要回谷——“她回来从不走正门”。'},
 {id:'gy_fist_or_sword',place:'kitchen',time:'dusk',name:'拳先还是剑先',teacher:'钟拙',actor:'zhong',auto:true,window:[5,7],gain:'understanding',amount:4,cast:['zhong','hero','yin','zhou','shimu'],notice:'二师叔钟拙和小师叔殷红缨为“先教拳还是先教剑”吵了三天，二月初要在饭桌上说个明白。'},
 {id:'gy_welcome_back',place:'kitchen',time:'dusk',name:'接风',teacher:'殷红缨',actor:'yin',auto:true,window:[25,26],factRequires:['journey_5'],gain:'observation',amount:2,cast:['hero','yin','shimu','ye'],notice:'汉皋回来，师母要给大家接风。'},
 {id:'gy_goose_steps',place:'training_ground',time:'day',name:'回岚步与鹅',teacher:'殷红缨',actor:'yin',window:[26,29],requires:['footwork'],gain:'footwork',amount:8,cast:['hero','yin','goose','dou'],notice:'小师叔说六月教身法，“教具已经备好了”——卢小豆听完脸色发白。'},
 {id:'gy_ye_mother',place:'courtyard',time:'day',name:'叶青的手',teacher:'江采薇',actor:'shimu',window:[27,31],requires:['ye'],gain:'medical_notes',amount:4,cast:['ye','shimu','hero'],notice:'师母的旧伤逢雨就疼，叶蘅说七月前后去替她看看。'},
 {id:'gy_brother_hurt',place:'courtyard',time:'night',name:'大师兄负伤',state:{fang:'hurt'},teacher:'方迟',actor:'fang',auto:true,window:[32,33],gain:'medical_notes',amount:2,cast:['hero','fang','shimu','dou','ye','zhou'],enters:{ye:4,zhou:5},notice:'大师兄方迟下山办事，说好七月初回谷，至今没有消息。'},
 {id:'gy_go_in_stead',place:'courtyard',time:'day',name:'代师出行',teacher:'周砚',actor:'zhou',auto:true,window:[34,34],factRequires:['gy_brother_hurt_seen'],gain:'understanding',amount:4,cast:['zhou','hero','yin','shimu'],enters:{shimu:99},notice:'大师兄的伤要有人下山问个明白。'},
 {id:'gy_mid_autumn',place:'courtyard',time:'night',name:'中秋家宴',state:{fang:'hurt'},teacher:'江采薇',actor:'shimu',auto:true,window:[37,38],gain:'understanding',amount:2,cast:['hero','shimu','yin','zhong','dou','ye','fang'],notice:'八月中秋，师母说今年人齐，要摆一桌像样的家宴。'},
 {id:'gy_dou_runaway',place:'courtyard',time:'day',name:'小豆想下山',enters:{yin:4},teacher:'卢小豆',actor:'dou',window:[40,44],gain:'footwork',amount:4,cast:['hero','dou','yin'],notice:'卢小豆这几日总往山口跑，问他就说“喂鹅”。'},
 {id:'gy_shimu_birthday',place:'courtyard',time:'day',name:'师母的生辰',teacher:'周小满',actor:'man',window:[50,54],gain:'sewing',amount:4,cast:['hero','man','shimu','zhou'],enters:{shimu:99,zhou:99},notice:'周小满偷偷来找你：十一月是娘的生辰，爹又要忘了。'},
 {id:'gy_year_exam',fight:{bg:'bb_qh_training_v1',foes:[{name:'殷红缨 · 三招',sp:'c_gy_yinhongying',lv:6,st:{str:6,con:5,agi:10,wil:5,wis:5},skills:{fist:1},hpMul:.5,atkMul:.32,shield:3,weak:['拳','剑','棍'],h:165}]},place:'courtyard',time:'day',name:'年终考校',teacher:'周砚',actor:'zhou',auto:true,window:[57,58],gain:'understanding',amount:6,cast:['zhou','hero','zhong','yin','shimu'],enters:{shimu:99},notice:'十二月中旬年终考校，三位长辈各出一题，全谷观礼。'},
 {id:'gy_new_year',place:'kitchen',time:'night',name:'除夕守岁',teacher:'江采薇',actor:'shimu',auto:true,window:[59,59],gain:'understanding',amount:2,cast:['hero','ye','yin','shimu','man','dou','zhou','zhong','fang','goose'],notice:'腊月底，全谷一起守岁。'},
 // ===== 2026-10-10 切磋与实战（文档库 romance-rules.md 第五节）=====
 // fight：开场对白后进入真实战斗，胜负各接一段；不会战败出局。过招都由剧情到时自动发生，不手动触发（2026-10-11 用户）。
 {id:'gy_spar_dou',place:'training_ground',time:'day',name:'小豆来过招',teacher:'卢小豆',actor:'dou',auto:true,window:[9,11],needSkill:true,sparWith:'dou',notice:'小豆听说你学了招式，嚷着要跟你过两手。',fight:{bg:'bb_qh_training_v1',foes:[{name:'卢小豆',sp:'c_gy_luxiaodou',combatProfile:'gy_dou_sword_v1',weapon:'wood',lv:3,st:{str:3,con:3,agi:7,wil:3,wis:4},skills:{gy_dou_basic:1,gy_s1:1},hpMul:.45,atkMul:.45,shield:2,weak:['拳','剑','棍'],h:146}]},gain:'footwork',amount:2,cast:['dou','hero']},
 {id:'gy_spar_zhong',place:'training_ground',time:'day',name:'二师叔试拳',teacher:'钟拙',actor:'zhong',auto:true,window:[14,16],needSkill:true,sparWith:'zhong',notice:'二师叔说要看看你的拳头硬不硬。',fight:{bg:'bb_qh_training_v1',foes:[{name:'钟拙',sp:'c_gy_zhongzhuo',lv:4,st:{str:8,con:7,agi:3,wil:4,wis:3},skills:{fist:1},hpMul:.7,atkMul:.36,shield:4,weak:['剑','暗器'],h:170}]},gain:'foundation',amount:2,cast:['zhong','hero']},
 {id:'gy_spar_yin',place:'bamboo_path',time:'day',name:'竹林里的指点',teacher:'殷红缨',actor:'yin',auto:true,window:[28,31],needSkill:true,sparWith:'yin',factRequires:['gy_night_return_seen'],notice:'小师叔说竹林里地不平，正好试试你。',fight:{bg:'bb_qh_training_v1',foes:[{name:'殷红缨 · 收着打',sp:'c_gy_yinhongying',lv:6,st:{str:6,con:5,agi:10,wil:5,wis:5},skills:{fist:1},hpMul:.55,atkMul:.3,shield:4,weak:['拳','棍'],h:165}]},gain:'footwork',amount:2,cast:['yin','hero']},
 {id:'gy_bamboo_wolves',place:'bamboo_path',time:'dusk',name:'竹径的狼',teacher:'卢小豆',actor:'dou',window:[6,11],fight:{bg:'bb_prologue_backhill_v1',foes:[{name:'野狼',sp:'c_wolf',lv:1,st:{str:4,con:3,agi:6,wil:2,wis:2},skills:{bite:1},hpMul:.5,atkMul:.4,h:95},{name:'野狼',sp:'c_wolf',lv:1,st:{str:4,con:3,agi:6,wil:2,wis:2},skills:{bite:1},hpMul:.45,atkMul:.4,h:95}]},gain:'observation',amount:3,cast:['dou','hero'],notice:'卢小豆说近山竹径这几天有狼脚印，师母不许他一个人去看。'},
 {id:'gy_zhou_test',place:'training_ground',time:'day',name:'出门前的考校',teacher:'周砚',actor:'zhou',auto:true,window:[18,18],needSkill:true,fight:{bg:'bb_qh_training_v1',foes:[{name:'周砚 · 只用三成',sp:'c_opening_zhouyan',lv:5,st:{str:6,con:6,agi:6,wil:6,wis:6},skills:{fist:1},hpMul:.6,atkMul:.3,shield:4,weak:['拳','剑'],h:170}]},gain:'understanding',amount:4,cast:['zhou','hero'],notice:'去汉皋之前，师父说要亲手试试你这几个月学的东西。'},
 // 殷红缨个人篇（结缘前必须看完）：第二年起、托付后，夜里去竹径。
 {id:'gy_yin_past',place:'bamboo_path',time:'night',name:'十几年前的寿宴',teacher:'殷红缨',actor:'yin',window:[60,179],relNeed:{id:'yin',min:80},adultOnly:true,personal:'殷红缨',gain:'understanding',amount:3,cast:['yin','hero']},
 // 2026-10-09 关系与结缘细则（文档库 romance-rules.md）：叶蘅信赖→托付的瓶颈；殷红缨托付后的自由结缘（心意）。
 {id:'gy_ye_lamp',place:'study',time:'night',name:'灯下的方子',teacher:'叶蘅',actor:'ye',window:[50,58],requires:['ye'],relNeed:{id:'ye',min:70},bottleneck:'叶蘅',gain:'medical_notes',amount:4,cast:['ye','hero'],notice:'十一月以后，叶蘅常在书房点灯到很晚。'},
 {id:'gy_yin_bond',place:'courtyard',time:'night',name:'屋顶上的人',teacher:'殷红缨',actor:'yin',window:[60,179],relNeed:{id:'yin',min:80},adultOnly:true,factRequires:['gy_yin_past_seen'],factHint:'先看完她的个人篇“十几年前的寿宴”（夜里去竹径）。',heart:'殷红缨',gain:'understanding',amount:2,cast:['hero','yin']},
 // 2026-10-09 用户改定萧白穿越后 17 岁：第二年正月初一满十八岁。结缘与恋爱向剧情只在此后开放。
 {id:'gy_new_year_dawn',place:'courtyard',time:'day',name:'十八岁',teacher:'江采薇',actor:'shimu',auto:true,window:[60,61],factRequires:['gy_new_year_seen'],gain:'understanding',amount:2,cast:['hero','shimu','yin','dou']},
];
// 闲逛支线（地点＋时间绑定，只遇一次，不进日程提示）：见 qh-mode-cultivation-side.js。
const SIDE=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-side.js'):root.CultivationSide;
if(SIDE)definitions.push(...SIDE.definitions);
// 谷中人家（溪东裴家等，串门剧情）：见 qh-mode-cultivation-neighbors.js。
const NB=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-neighbors.js'):root.CultivationNeighbors;
if(NB){definitions.push(...NB.definitions);Object.assign(actors,NB.actors);}
const line=(speaker,text,cast)=>({speaker,text,...(cast?{cast}:{})});
// 指定这一句萧白的发型阶段（short/mid/long），用于演出中途换形象。
// 显式指定表情：mood 为说话人，moods 为同屏任意人（键用 hero/zhou 等基础名）。
const lm=(speaker,text,mood,moods)=>({speaker,text,...(mood?{mood}:{}),...(moods?{moods}:{})});
const lf=(speaker,text,form,cast)=>({speaker,text,form,...(cast?{cast}:{})});
const relationScore=(s,id)=>s.relations?.[id]?.score||0;
// 战斗类剧情的收益：按已学兵器给熟练（剑优先，其次拳），胜 6／负 3；都没学时给原定收益。
function fightGain(s,d,key){const w=s.learned.sword?'sword':s.learned.fist?'fist':null;if(!w)return {gain:d.gain,amount:d.amount};return {gain:w,amount:key==='win'?6:3};}
// 入队与 if 线的汇总（供大地图章节读取）：甲类是否已入队、if 事实、乙类的基础事实。
function routes(s){const f=s.facts,lu=[f.promise_scope&&'话别说得太满',f.gy_l02_seen&&'说早了的日子',f.first_delivery&&'首季护送'].filter(Boolean);
 return {yin:{type:'direct',joined:!!f.gy_yin_recruit,if:f.if_yin||null,personal:!!f.gy_yin_past_seen,bond:!!f.gy_bond_yin},ye:{type:'initial',joined:true,trust:!!f.gy_ye_lamp_seen},lu:{type:'groundwork',groundwork:lu}};}
function extra(s){const chen=s.qhOrigin?.chenCare,rel=Object.fromEntries(Object.entries(s.relations||{}).map(([k,v])=>[k,v.score||0]));return {...PH.extra(s),rel,adult:s.month>=13,pei:{chests:s.facts.gn_chests_choice||null},yinJoined:!!s.facts.gy_yin_recruit,sparWins:s.facts.spar_log?.wins||0,learned:{footwork:!!s.learned.footwork,fist:!!s.learned.fist,sword:!!s.learned.sword},opening:{chen_injury:chen==='擦伤已照护'?'light':chen==='腿伤待照护'?'rest':'unknown'},first_delivery:{method:s.facts.first_delivery?.method||null},facts:{pre_departure_talk_seen:!!s.facts.departure_goals,first_ye_work_seen:!!s.facts.herb_labels},yinScore:relationScore(s,'yin'),major:s.facts.gy_martial_major?.path||(s.learned.sword&&!s.learned.fist?'sword':s.learned.fist&&!s.learned.sword?'fist':s.facts.gy_fist_or_sword_choice)||null,go:s.facts.gy_go_in_stead_choice||null,footwork:!!s.learned.footwork,ledger:!!s.facts.gy_ledger_seen};}
function raw(id,c){
 if(SIDE?.scripts[id])return SIDE.scripts[id](c);
 if(NB?.scripts[id])return NB.scripts[id](c);
 const sd=definitions.find(d=>d.id===id);if(sd?.src){const X=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-scripts.js'):root.CultivationScripts;return X.expand(sd.src,c);}
 if(EXTRA[id])return EXTRA[id](c);
 if(id==='gy_prelude_tour')return PRELUDE.tour(c);
 if(id==='gy_prelude_stance')return PRELUDE.stance(c);
 if(id==='gy_prelude_xinfa')return PRELUDE.xinfa(c);
 if(id==='gy_prelude_hair')return PRELUDE.hair(c);
 if(id==='gy_noodles')return PRELUDE.noodles(c);
 if(id==='gy_ledger')return {
 intro:[line('shimu','木凳三十文，竹篮十五文，小木鸟……小木鸟送您了。——萧白，来，帮我看看这本账。'),line('shimu','谷里的米、盐、布、药，都从这本账上出。你师父只管练功，你二师叔只管做东西，没人管钱——所以我管。'),line('hero','这一页……卖出的数和收进的钱对不上，差了三十文。'),line('shimu','哦？你倒眼尖。那你说，差在哪儿？')],
 choices:[{key:'columns',text:'用“分栏对账”的法子重新排一遍',lines:[line('hero','把卖出的、赊账的、送人的分成三栏，每栏单独加总……差的三十文，是上个月赊给王婶的两只竹篮。'),line('shimu','这法子是谁教你的？'),line('hero','我家乡……记东西习惯这么排。'),line('shimu','好习惯。往后谷里的账，你帮我对一半。别得意——错一文，扣你一顿饭。')]},{key:'ask_first',text:'先问师母每一笔的来历',lines:[line('hero','这三十文我猜不出来。师母，这个月有人赊过账么？'),line('shimu','不猜，先问——你师父教的？'),line('hero','叶蘅说的。不确定的先留空。'),line('shimu','是个好姑娘。对，是赊给王婶的。账上留个“待收”，比硬凑齐了强。')]}],
 closing:[line('shimu','收摊了。剩下这只木鸟送你——你二师叔做了一百只，没一只卖得出去。'),line('shimu','走，回谷。路上跟你说说我当年走镖记账的事——就说一点点。')]};
 if(id==='gy_night_return')return {
 intro:[card('月底 · 夜半'),line('hero','（起夜……墙头上怎么有动静？）'),line('hero','谁——'),lm('hero','疼疼疼——手！放手！好大的酒味……','worry',{yin:'fun'}),line('yin','嘘。小毛贼，偷东西偷到归云谷来了？胆子不小，脸倒是挺白净。'),line('hero','我……我是新入门的弟子，萧白！'),line('yin','新弟子？师兄收徒了？我怎么不知道——'),lm('ye','……好大的酒气。二位，深更半夜的，在做什么？','surprise',{hero:'worry',yin:'surprise'})],
 choices:[{key:'polite',text:'“这位……前辈，能先松手吗？”',lines:[line('yin','前辈？我有那么老？'),line('hero','（总算松手了……还顺手捏了我一把脸？）'),line('yin','我叫殷红缨，你师父的小师妹。往后叫小师叔。手劲还行，就是反应慢了半拍——下次有人翻墙，先往旁边躲，别往前凑。')]},{key:'counter',text:'学着站桩那样往下一沉，挣开',lines:[line('hero','沉肩，坐胯——……哎？！怎么没挣开？'),line('yin','咦，还会沉？就是沉错了地方。'),line('yin','我是殷红缨，你师父的小师妹。站桩的底子别拿来晚上乱用——不过有这份胆子，比你那个只会喊的小师兄强。')]}],
 closing:[line('yin','这位姑娘是？'),line('ye','叶蘅，借住在谷里。……殷前辈手上有伤，渗血了，要不要先包一下？'),line('yin','眼尖。不碍事——好吧，碍一点。小白脸，明早别告诉你师母我喝了酒。'),card('第二天一早',{place:'courtyard',time:'day'}),line('ye','……全谷都知道了。不是我说的。')]};
 if(id==='gy_fist_or_sword')return {
 intro:[line('zhong','我再说一遍：先练拳！拳是根，剑是梢。根都没扎稳，剑能往哪儿使？水再挑一个月，然后出拳，这叫笨功夫——'),line('yin','笨功夫练出来的就是笨人。他十七了，筋骨都长开了。再挑一个月水，江湖上的人可不等他。先学剑，见过真东西，才知道自己缺什么。'),line('zhong','你那是速成！师父当年怎么教的？'),line('yin','师父当年也说你笨。'),line('zhong','师兄！你别光顾着夹菜，倒是说句话！'),lm('zhou','萧白，你自己说。往后一个月，先跟谁练？','serious',{zhong:'normal',yin:'normal'})],
 choices:[{key:'fist',text:'先跟二师叔练拳，把根扎稳',lines:[line('hero','我连站都还没站稳。先跟二师叔练根基吧。'),line('zhong','听见没！这孩子明白！明儿卯时，先挑水！'),line('yin','……行，随你。等你挑够了水，记得来找我，我教你点真正用得上的。'),line('zhong','哎——我碗里最大那块肉！'),line('yin','嗯，好吃。')]},{key:'sword',text:'先跟小师叔学剑，看看真东西',lines:[line('hero','我想先看看……真的江湖上是怎么打的。'),line('yin','有眼光。明儿午后，竹林。别带酒——那是我的。'),line('zhong','唉！练坏了别来找我哭！'),line('zhong','……饭后来工棚一趟。我那儿有卷缠手的布条，练剑先把手腕缠上。')]},{key:'both',text:'“两位师叔，我都想学。”',lines:[line('hero','早上跟二师叔挑水扎根，午后跟小师叔看剑。我多吃一碗饭就是了。'),line('shimu','这话我爱听。饭管够。'),line('zhong','滑头！……不过，也行。'),line('yin','贪心。我喜欢贪心的。'),line('zhou','那就这么定了。'),line('hero','（师父刚才……是不是笑了？）')]}],
 closing:[line('shimu','从今天起再加一条规矩：饭桌上吵武学可以，抢菜不行。')]};
 if(id==='gy_welcome_back')return {
 intro:[line('shimu','汉皋回来的头一顿，都坐下！小豆，别围着萧白问个没完，让他先吃。'),line('yin','城门口那几个穿正道盟服色的，你们见着了吧？'),line('hero','见着了。他们好像认得小师叔——脸色都不太好看。'),line('yin','十几年前，我在一场寿宴上掀了他们一位执事的桌子。'),line('shimu','红缨。饭桌上。'),line('yin','好好好，不说打杀，说掀桌子总行吧？')],
 choices:[{key:'ask_why',text:'追问她为什么掀桌子',lines:[line('hero','为什么掀？'),line('yin','那人当众说一个过世的郎中“私藏秘方，死有余辜”。我听不下去。'),line('ye','……那位郎中，姓什么？'),line('yin','不记得了。只记得那人说话的样子——叫人想吐。'),lm('ye','……','worry')]},{key:'let_it_be',text:'不追问，给小师叔斟一杯茶',lines:[line('hero','小师叔，喝茶。'),line('yin','……这孩子，学会家规了。'),line('shimu','是我教得好。'),line('yin','茶就茶。下回下山，我带你见识见识，真正的江湖酒是什么味儿。')]}],
 closing:[line('shimu','都吃。回来了就好。'),line('hero','（回谷，原来就是回家。）')]};
 if(id==='gy_goose_steps')return {
 intro:[line('yin','回岚步，讲究一个“回”字——进得去，退得出。今天的教具是它。'),lm('goose','嘎——！','fun',{hero:'surprise',yin:'fun'}),line('hero','……小师叔，你认真的？'),line('yin','它是谷里最快的东西，比你小师兄还快。规矩很简单：让它追你一炷香，不许被啄到，也不许出这个院子。'),line('dou','我当年被啄了十七口……萧白，你保重。')],
 choices:[{key:'circle',text:'绕着木人桩兜圈，用桩子挡它',lines:[line('hero','绕桩子……一圈、两圈——哇，脚滑了！'),line('yin','别看脚！看它的脖子往哪边伸，你就往另一边回！'),...(c.footwork?[line('hero','它往左伸——我往右，回！'),lm('goose','嘎！嘎！','fun')]:[line('hero','往另一边回——哎哟！慢了半拍……'),lm('goose','嘎！','fun',{hero:'worry'})]),line('yin','对了，就是这个“回”。')]},{key:'face_it',text:'不跑了，转身正面对着将军',lines:[line('hero','跑不过，那我就不跑——'),lm('goose','嘎？……嘎——！！','fun',{hero:'worry'}),line('yin','哈！有胆子！可鹅不吃这一套——回身！'),line('hero','——侧身！……它一头撞进晾着的被单里了。')]}],
 closing:[line('yin','一炷香，被啄了……我数数，五口。比小豆强。'),line('dou','我那是十四岁！'),line('yin','明天再来。将军，干得好——晚上给你加谷子。')]};
 if(id==='gy_ye_mother')return {
 intro:[line('shimu','一下雨，这条胳膊就疼。叶蘅，你帮我看看。'),lm('ye','……','surprise'),line('ye','师母，这里接过骨。接得很好……这个手法，先拔后旋，再用竹片夹三处——'),line('shimu','你认得？'),line('ye','我娘就是这么接的。'),line('shimu','……二十年前，我走镖在荆襄翻了车，胳膊折成三段。是一位姓叶的女大夫，在路边给我接上的。她不收诊金，只要了我半袋干粮。')],
 choices:[{key:'listen',text:'不出声，让两人说下去',lines:[line('shimu','她说话很轻，手很稳，笑起来左边有个酒窝。'),line('ye','……我娘左边有个酒窝。'),line('shimu','好孩子。你娘救过我一条胳膊，往后你在谷里一天，就是我半个闺女。')]},{key:'ask_more',text:'轻声问：“那位大夫还说过什么？”',lines:[line('shimu','她说，药是给人用的，不是给人抢的。我当时不懂，后来懂了。'),line('ye','这话……我爹也常说。'),line('shimu','那就记着。往后谁想从你手里抢东西，先过我这一关。'),line('ye','……原来我娘年轻的时候，是这样的。')]}],
 closing:[line('ye','这只是我娘的为人。她留下的东西，我还是要自己去问清楚。'),line('shimu','那是自然。问的时候，记着回家吃饭。')]};
 if(id==='gy_brother_hurt')return {
 intro:[card('七月中旬 · 夜'),line('dou','大师兄回来了——是被人抬回来的！'),line('fang','……别慌。皮外伤。先把东西……收好，信在怀里……'),line('shimu','闭嘴，躺好。萧白，烧水；叶蘅，拿药箱；小豆，去叫你师父！'),line('ye','血止住了。……师父，您看这道伤口。'),lm('zhou','这不是山匪的刀。我下山一趟。','angry',{shimu:'worry'}),lm('shimu','你不许去。','angry',{hero:'surprise'})],
 choices:[{key:'night_watch',text:'守在大师兄床边照看',lines:[card('天快亮时'),line('fang','……你守了一夜？我是大师兄，本该是我照看你们。'),line('hero','大师兄也是人，也会受伤。'),line('fang','师父一直想让我接这个门。我总怕自己……不够格。'),line('hero','你被抬回来的时候，第一句话是“把东西收好”。我觉得，这就够格了。')]},{key:'ask_story',text:'去院里，听师父和师母说话',lines:[line('shimu','你那条胳膊十年没好全。再为别人拼一次命，这个家怎么办？'),line('zhou','那是方迟。'),line('shimu','我知道是方迟。所以我更不许你去——你去了，回不来，方迟一辈子都不会原谅自己。'),line('hero','（师父身上有旧伤……我从来不知道。）')]}],
 closing:[line('shimu','都去歇会儿。灯我守着。')]};
 if(id==='gy_go_in_stead')return {
 intro:[line('zhou','方迟带回来的信，牵涉到一桩药材买卖。总要有人下山问个明白。'),line('yin','师兄，你那条胳膊，师嫂不让你动，我也不让。我去。'),line('zhou','你一个人去，会把事情闹大。'),line('yin','那就再带一个不会闹大的。'),line('zhou','……萧白。')],
 choices:[{key:'go_with_yin',text:'“我跟小师叔去。师父留下养伤。”',lines:[line('hero','师父，我去。我会看着小师叔——不让她掀桌子。'),line('yin','哈！这话我爱听。'),line('zhou','……路上听你小师叔的。但她要喝酒的时候，你可以不听。'),line('yin','收拾包袱，明早出发。')]},{key:'stay_home',text:'“小师叔去，我留在谷里替师父守家。”',lines:[line('hero','大师兄伤着，谷里总要有能跑腿的人。我留下。'),line('zhou','好。这也是担当。'),line('yin','没劲。……不过守家也是正经事。等我回来，带你喝酒。'),card('十日后'),line('yin','问明白了。不是冲着归云谷来的。')]}],
 closing:[line('shimu','都给我平平安安的。我晚上做饭，人数一个都不能少。')]};
 if(id==='gy_mid_autumn'){
 const yinOption=[{key:'moon_yin',text:'去屋顶找独自喝酒的小师叔',lines:[line('hero','小师叔，一个人在屋顶上喝酒？'),line('yin','坐。今天不喝酒——就一口。'),line('hero','小师叔为什么总在外面游历，不回谷？'),line('yin','……谷里太好了。人一习惯了好，就会怕失去。我怕哪天回来，这个家散了，所以干脆少回来。'),line('yin','可你来了以后，这个家反而更热闹了。今年我不走了，至少……等你出师。'),line('yin','……行了，下去吧。替我跟师嫂说，月饼给我留两块。')]}];
 return {
 intro:[line('dou','二师叔又要讲“一拳打倒三个山匪”了，今年第五遍。'),line('zhong','……那三个山匪，个个八尺高——'),line('yin','上回是七尺。'),line('zhong','长个了不行吗！'),line('shimu','好了，都静一静。萧白，叶蘅，过来。'),line('shimu','打开看看。新缝的夹袄，袖口压了道竹青边。'),line('shimu','萧白，你那身练衣袖口都磨破了，这件冬天套在外头。叶蘅的这件没有门派标记，就是件家常衣裳，天冷了穿。'),line('ye','……谢谢师母。'),line('shimu','谢什么。家里人，都一样。')],
 choices:[...yinOption,{key:'moon_ye',text:'陪叶蘅在院里看月亮',lines:[line('ye','我小时候，中秋也是三个人。爹、娘、我。'),line('hero','今年人多了点。'),line('ye','……嗯，多了很多。'),line('ye','新衣裳……很暖。')]},{key:'moon_shimu',text:'去厨房帮师母收拾',lines:[line('shimu','你倒是会挑地方躲热闹。'),line('hero','跟师母学洗碗。'),line('shimu','你师父当年也是这么混进厨房的。后来，就混成了我家的人。'),lm('shimu','……都是很久以前的事了。','smile')]},{key:'moon_fang',text:'陪养伤的大师兄说说话',lines:[line('fang','师父说，等我伤好了，下回下山让你跟着。'),line('hero','大师兄还要带我？'),line('fang','是你带我。上次那一夜……我一直记着。')]}],
 closing:[line('hero','（今年的中秋，人真多。）')]};}
 if(id==='gy_dou_runaway')return {
 intro:[line('hero','小豆！天才刚亮，你背着包袱上哪儿去？'),line('dou','别拦我！小师叔十七岁就一个人闯荆襄了，我也行！'),line('hero','你包袱里装的是……三个馒头和一只木鸟？'),line('dou','……够吃两天了。'),line('yin','够吃一天半。'),line('dou','小、小师叔？！你什么时候坐在那儿的？')],
 choices:[{key:'race',text:'“比一场。你追得上小师叔，就让你走。”',lines:[line('yin','……哦？比我想的快。'),line('dou','呼……呼……三里地了……衣角都没碰到……'),line('yin','你的轻功，比我十七岁时好。'),line('dou','真的？'),line('yin','真的。所以更不能现在就走——好东西，要先磨锋利了。等你出师那年，我亲自带你下山。')]},{key:'talk',text:'坐下来，问他为什么想走',lines:[line('dou','萧白你来了以后，师父天天教你，师叔们抢着教你……我想，我是不是该走了，给你腾地方。'),line('hero','这里又不是只有一把椅子。'),line('yin','小豆，过来。'),line('yin','你是我看着长大的。这个家，谁也不用给谁腾地方。')]}],
 closing:[line('dou','我、我没哭！是风大！……走了，师弟，回谷。')]};
 if(id==='gy_shimu_birthday')return {
 intro:[line('man','萧白哥，我跟你说个秘密——后天是我娘的生辰。我爹每年都忘，今年你得帮我提醒他。'),line('hero','你直接告诉师父不就好了？'),line('man','那不行。要他自己想起来，娘才高兴。'),line('man','我还想给娘绣个香囊，可是我针线不好……叶蘅姐姐说你也学过缝补？')],
 choices:[{key:'sew',text:'帮小满一起把香囊绣完',lines:[line('hero','竹叶歪了点……总算看得出是竹叶。'),card('生辰那天',{place:'kitchen',time:'day'}),line('shimu','……这是给我的？'),line('man','我和萧白哥绣的！'),line('shimu','谁的针脚这么粗？……留着，我天天戴。')]},{key:'remind',text:'去“不经意”地提醒师父',lines:[line('hero','师父，后天的饭……要不要做得丰盛些？'),line('zhou','为何？'),line('hero','就……天冷了。'),line('zhou','……嗯。'),line('man','（小声）萧白哥，我爹每年其实都记得，就是要等我来提醒他。')]}],
 closing:[line('shimu','你师父煮的长寿面，糊了。……我全吃完了。')]};
 if(id==='gy_year_exam'){const wins=c.sparWins||0;return {
 intro:[lm('zhou','年终考校，三题。钟拙考根基，红缨考应变，我考一个“心”字。','serious',{hero:'serious',zhong:'serious',yin:'serious'}),lm('zhong','第一题：站桩一炷香，我往你身上挂水桶。','serious'),lm('hero','（一桶……两桶……三桶。腿在抖，可没有倒。）','serious'),lm('zhong',wins>=5?'好！这一年跟人过了那么多招，下盘倒没丢！':'好！这就是笨功夫！','smile'),lm('yin','第二题：我出三招，你把学过的全用上。接得住，就算过。','serious')],
 choices:[{key:'win',text:'',lines:[lm('yin','好小子，敢进！','smile'),lm('yin','……行，算你过。这一年没白教。','smile'),lm('zhong','看见没！根基稳了，剑才敢往前递！','fun')]},{key:'lose',text:'',lines:[lm('yin','第三招你没看清，可前两招接得不难看。','normal'),lm('hero','……再来一次，我能接住。','serious'),lm('yin','明年再说。今天这份不服气，留着。','smile')]}],
 closing:[lm('zhou','第三题。萧白，这一年里，你最怕的是什么？','serious'),lm('hero','……怕自己什么都做不了。怕大家受伤的时候，我只能站着看。','sad'),lm('zhou','记着这份怕。会怕，才知道为什么要练。——考校，过了。','smile',{hero:'normal'}),lm('shimu','好！都过来吃饭！','smile')]};}
 if(id==='gy_new_year'){
 const bond=[];// 2026-10-09：结缘挪到第二年正月初一（萧白满十八岁），见 gy_new_year_dawn。
 return {
 intro:[line('man','娘！小豆哥又偷吃二师叔剥的栗子！'),line('shimu','一年了。萧白，今年过得怎么样？'),line('hero','比我想过的……好太多了。'),line('ye','我想好了明年要做什么。开春，我再告诉大家。'),line('shimu','好。不管选什么，这里都是你家。'),line('yin',c.yinJoined||(c.rel?.yin||0)>=40?'明年我不走了。这小子还得有人带着下山。':'开春我还得出趟远门。……有事，往北边的驿路捎信。')],
 choices:[...bond,{key:'toast_all',text:'站起来，敬全家一杯',lines:[line('hero','我……敬大家。谢谢师父、师母、两位师叔、大师兄、小师兄、小满……还有将军。'),line('dou','还有我！我是师兄！'),line('hero','刚才说了。'),line('shimu','哈哈……好了好了，外头放爆竹了！')]},{key:'quiet',text:'不说话，安静地看着大家',lines:[line('hero','（刚来这个世界的那天，我一个人都不认识。）'),line('ye','在想什么？'),line('hero','在想，原来一年能认识这么多人。')]}],
 closing:[line('shimu','新年好。——归云谷的第一年，过完了。')]};}
 if(id==='gy_new_year_dawn'){
 const bond=[];// 2026-10-09：结缘改为托付后自由触发的“屋顶上的人”（gy_yin_bond），不再挂在任何日历剧情上。
 return {
 intro:[card('第二年 · 正月初一'),lm('shimu','萧白，坐下。今天你满十八了。','smile',{hero:'surprise',dou:'smile'}),lm('hero','师母怎么知道？','surprise'),lm('shimu','拜师那天你自己说的。十七岁的孩子跑到山里来，一转眼就成人了。','smile'),lm('dou','长寿面！我帮忙揉的面！','fun'),lm('shimu','你揉的那一团太硬，我重新揉了。','smile',{dou:'sad'}),lm('yin','十八了。往后喝酒，我就不拦你了。','smile')],
 choices:[...bond,{key:'thanks',text:'端起面碗，谢谢全家',lines:[lm('hero','谢谢师母。谢谢大家。','smile'),lm('shimu','谢什么。吃完了去给你师父磕个头——他嘴上不说，昨天半夜还在问面够不够。','smile')]},{key:'remember',text:'想起穿越前的自己',lines:[lm('hero','（原来的我，这个年纪还在为考试发愁。）','normal'),lm('hero','（现在是在一碗长寿面前，有一屋子的人。）','smile')]}],
 closing:[lm('shimu','吃面。吃完了，第二年就开始了。','smile')]};}
 if(id==='gy_ye_lamp')return {
 intro:[lm('hero','（书房的灯还亮着。）','normal'),lm('ye','……进来吧，门没关。','normal'),lm('ye','我在抄我娘的方子。原本的纸太脆了，再翻几次就要碎。','sad'),lm('hero','要我帮你念，还是帮你看着灯？','normal'),lm('ye','都不用。……你坐着就好。','smile')],
 choices:[{key:'stay',text:'坐在一旁，安静陪她抄完',lines:[lm('ye','这一味，我小时候以为是糖，偷吃过一回。我娘没骂我，只是把方子上的字指给我看。','smile'),lm('hero','后来呢？','smile'),lm('ye','后来我就认得了。……这些事，我以前没跟谁说过。','normal'),lm('ye','萧白。这方子的事、我爹的事，往后我查到什么，都先跟你说。','serious')]},{key:'ask',text:'问她：为什么只在晚上抄？',lines:[lm('ye','白天有人找我看病，有药要晒。晚上……只剩我自己的事。','normal'),lm('ye','一个人抄的时候，总觉得我娘在旁边看着。今天你在，倒不那么空了。','smile'),lm('ye','萧白。往后我查到什么，都先跟你说。','serious')]}],
 closing:[lm('ye','方子还是我收着。可你知道它在哪儿，我就放心些。','smile')]};
 if(id==='gy_yin_bond')return {
 intro:[card('夜 · 屋顶'),lm('yin','来了？瓦片一片都没响。……这一年多，你倒是学会了。','smile'),lm('hero','小师叔，你一个人在这儿？','normal'),lm('yin','等你呢。今天起……不，早就不是孩子了。','smile'),lm('yin','以前你从墙上被我按下来，还是个毛头小子。','smile'),lm('yin','现在……你自己说呢。','normal')],
 choices:[{key:'bond_yin',text:'“我想以后一直站在小师叔旁边。”（结缘）',lines:[lm('hero','我想以后一直站在小师叔旁边。不是被护着的那种。','serious'),lm('yin','……喏，酒葫芦。手别缩回去。','smile'),lm('yin','往后，也看着我吧。不止一年。','smile')]},{key:'not_yet',text:'“……我还想再想想。”',lines:[lm('hero','……我还想再想想。','sad'),lm('yin','嗯。想清楚了再上来。屋顶又不会跑。','smile')]}],
 closing:[lm('yin','下去吧。月亮也看够了。','smile')]};
 throw Error('没有这段师门剧情。');
}
// 把对白里的 hero 换成该段（或该句）对应的发型阶段形象。
function form(x,d){if(!d?.heroForm)return x;const map=(l,f)=>{const k='hero_'+(l.form||f),cast=(l.cast||d.cast).map(a=>/^hero(_|$)/.test(a)?k:a);return {...l,speaker:l.speaker==='hero'?k:l.speaker,cast};};const fix=ls=>ls.map(l=>map(l,d.heroForm));return {...x,intro:fix(x.intro),closing:fix(x.closing),choices:x.choices.map(c=>({...c,lines:fix(c.lines)}))};}
// 人物登场时机：enters={人物:开场第几句起出现}，之前的句子不放这个人。
function enter(x,d){if(!d?.enters)return x;const intro=x.intro.map((l,i)=>{const gone=Object.entries(d.enters).filter(([,at])=>i<at).map(([k])=>k);if(l.cast)return l;return {...l,cast:d.cast.filter(a=>!gone.includes(a))};});return {...x,intro};}
// 场景（地点＋时间）：开场从定义的 place/time 起，句子写了 place/time 就换并延续；分支接开场最后的场景；
// 收尾保留原样，由对白引擎按所选分支最后的场景接着解析（CultivationVisitors.current）。
function scene(x,d){const walk=(ls,start)=>{let c=start;return ls.map(l=>{c={place:l.place!==undefined?l.place:c.place,time:l.time!==undefined?l.time:c.time};return {...l,...c};});};const start={place:d?.place||'courtyard',time:d?.time||'day'},intro=walk(x.intro,start),last=intro[intro.length-1],end=last?{place:last.place,time:last.time}:start;return {...x,intro,choices:x.choices.map(ch=>({...ch,lines:walk(ch.lines,end)}))};}
// ===== 关系与结缘细则（文档库 romance-rules.md，2026-10-09）=====
// 按关系阶段换台词：键为剧情 id，再以原句全文定位；alt 依次判断，取最后一个满足的。
// 第一年（萧白未满十八）只给“更亲近”的友情版；adult:true 的暧昧版只在第二年起、托付阶段出现。
const REL_ALT={
 gy_m02:{'知道了，周先生。我先把粥喝了，信等会儿再看一遍。':[{who:'ye',min:50,text:'知道了，周先生。……萧白，你那碗也端去热热，别光顾着看我。',mood:'smile'}]},
 gy_m08:{'这回我先把饭吃了，不等它凉。':[{who:'ye',min:50,text:'这回我先把饭吃了。路上你要是又不好好吃，你那份干粮我替你收着。',mood:'smile'}]},
 gy_y02:{'你那碗怎么也没动？……一直等着我，自己也没吃？':[{who:'ye',min:50,text:'你那碗怎么也没动？……下回别等我。你饿着，我心里过意不去。',mood:'worry'}]},
 gy_m09:{'好。':[{who:'ye',min:50,text:'好。……有你这句话，我问起人来也不慌。',mood:'smile'}]},
 gs_fireflies:{'……嗯。小时候我娘也带我这么看过。':[{who:'ye',min:50,text:'……嗯。小时候我娘也带我这么看过。今年有人陪着看了。',mood:'smile'}]},
 gs_winter_garden:{'这一年……这块地是我在谷里第一样自己照料的东西。':[{who:'ye',min:50,text:'这一年……这块地是我在谷里第一样自己照料的东西。第二样大概是你——总不好好吃饭。',mood:'smile'}]},
 gy_new_year:{'在想什么？':[{who:'ye',min:50,text:'在想什么？……想家的话，这里也是。',mood:'smile'}],'明年我不走了。这小子还得有人带着下山。':[{who:'yin',min:80,text:'明年我不走了。这小子……得我亲自带着下山。',mood:'smile'}]},
 gy_goose_steps:{'明天再来。将军，干得好——晚上给你加谷子。':[{who:'yin',min:50,text:'明天再来。……被啄了也没喊疼，算你有骨气。将军，晚上加谷子。',mood:'smile'}]},
 gy_go_in_stead:{'收拾包袱，明早出发。':[{who:'yin',min:50,text:'收拾包袱，明早出发。路上跟紧我——这回我护着你，下回换你。',mood:'smile'}]},
 gy_year_exam:{'好小子，敢进！':[{who:'yin',min:55,text:'好小子，敢进！……这一年，没白教。',mood:'smile'}]},
 gs_snow_roof:{'不过雪夜上屋顶这件事，往后你想上来，就上来。':[{who:'yin',min:80,text:'不过下雪的晚上，记得上来陪我喝茶。',mood:'smile'}]},
 gy_new_year_dawn:{'十八了。往后喝酒，我就不拦你了。':[{who:'yin',min:80,adult:true,text:'十八了。……往后喝酒，我陪你。',mood:'smile'}]},
 gs_bamboo_sword:{'别出声，站那儿看。':[{who:'yin',min:80,adult:true,text:'别出声，站那儿看。……站近一点也行。',mood:'smile'}],'剑快不算本事，看得清才算。':[{who:'yin',min:80,adult:true,text:'剑快不算本事，看得清才算。……你盯着我看了这么久，也算本事。',mood:'fun'}]}
};
// 关系够了才出现的选项（瓶颈）：不够时这个选项不出现，窗口一过就错过（关系停在当前阶段）。
const CHOICE_NEED={gy_go_in_stead:{go_with_yin:{who:'yin',min:30}},gy_mid_autumn:{moon_yin:{who:'yin',min:55}}};
function relLines(x,id,c){const alt=REL_ALT[id],need=CHOICE_NEED[id],rel=c?.rel||{};if(!alt&&!need)return x;
 const pick=l=>{const list=alt?.[l.text];if(!list)return l;let hit=null;for(const a of list)if((rel[a.who]||0)>=a.min&&(!a.adult||c?.adult))hit=a;return hit?{...l,text:hit.text,...(hit.mood?{mood:hit.mood}:{})}:l;};
 const fix=ls=>ls.map(pick);let choices=x.choices.filter(ch=>{const n=need?.[ch.key];return !n||(rel[n.who]||0)>=n.min;});if(!choices.length)choices=x.choices.slice(-1);
 return {...x,intro:fix(x.intro),closing:fix(x.closing),choices:choices.map(ch=>({...ch,lines:fix(ch.lines)}))};}
// 完整在场名单与独处镜头；索引按该段实际对白序列，换场后不会带入上一镜的人。
const CAST_CUTS={
 gy_m05:{closing:{0:['lu','hero','ye','recipient']}},
 gy_man_herbs:{branches:{tease:{2:['hero','man','shimu']}},closing:{0:['man','ye','hero']}},
 gy_prelude_stance:{intro:{5:['hero_mid','ye']},branches:{linear:{0:['hero_mid','ye']}},closing:{0:['zhong','hero_mid']}},
 gy_night_return:{closing:{3:['hero','ye']}},
 gy_brother_hurt:{branches:{night_watch:{0:['hero','fang']},ask_story:{0:['hero','shimu','zhou']}},closing:{0:['hero','shimu']}},
 gy_go_in_stead:{closing:{0:['hero','shimu','zhou','yin']}},
 gy_mid_autumn:{branches:{moon_yin:{0:['hero','yin']},moon_ye:{0:['hero','ye']},moon_shimu:{0:['hero','shimu']},moon_fang:{0:['hero','fang']}},closing:{0:['hero']}},
 gy_shimu_birthday:{branches:{sew:{0:['hero','man'],1:['hero','man','shimu']},remind:{0:['hero','zhou','man']}},closing:{0:['hero','man','shimu']}},
 gy_year_exam:{closing:{3:['hero','zhou','zhong','yin','shimu']}},
 gn_lamp:{intro:{0:['hero'],2:['pei','hero']}},
 gs_goose_missing:{intro:{0:['hero','dou']},branches:{track:{1:['hero','dou','goose']},call:{2:['hero','dou','goose']}}}
};
function stageCast(x,d){const plan=CAST_CUTS[d.id]||{};
 const walk=(ls,start,cuts={})=>{let cast=start,cut=null;return ls.map((l,i)=>{if(cuts[i])cut=cuts[i];cast=cut||l.cast||cast;return {...l,cast:[...cast]};});};
 const intro=walk(x.intro,d.cast,plan.intro);
 return {...x,intro,choices:x.choices.map(ch=>({...ch,lines:walk(ch.lines,d.cast,plan.branches?.[ch.key])})),closing:walk(x.closing,d.cast,plan.closing)};
}
function script(id,c){const d=definitions.find(d=>d.id===id);return stageCast(relLines(scene(form(enter(raw(id,c),d),d),d),id,c),d);}

// 入谷过渡：只有对白与时间过场（2026-10-08 用户要求），不设选择、不弹结算；全段一条线，title 为全屏字幕卡。
// 时间卡可带场景 {place,time}：换景并延续到后面的句子。
const card=(text,scene)=>({speaker:'title',text,...(scene||{})});
const one=lines=>[{key:'linear',text:'',auto:true,lines}];
const PRELUDE={
 noodles:c=>({
 // Historical wording is matched by the authored dialogue overlay; current Dou age is 14 (2026-10-12).
 intro:[card('拜师当日'),lm('shimu','礼成了！都别在堂上站着，进厨房，吃面！','smile',{dou:'normal'}),lm('shimu','坐。拜师面，一人一碗，谁也不许剩。萧白，你那碗卧了两个蛋——头一天入门，多吃一个。','smile'),lm('dou','师母偏心！我入门那年只有一个！','fun'),lm('shimu','你入门那年才十四，吃了一个就吐了。','smile',{dou:'sad'}),lm('dou','……那也是一个。萧白，你今年多大？','fun'),lm('hero','十七。','normal'),lm('dou','我也十七！可我比你早入门三年——往后你得叫我师兄。','fun'),lm('hero','……同岁也算？','surprise'),lm('dou','入门看先后，不看岁数！','fun')],
 choices:one([lm('shimu','好了。谷里没什么大规矩，就我定的三条，你记着——','serious',{dou:'normal',hero:'serious'}),lm('shimu','一，饭桌上不谈打打杀杀。二，受了伤先来报给我，不许硬扛。三，来客无论正邪，先奉一杯茶。','serious'),lm('hero','前两条我懂。第三条……若是来寻仇的呢？','normal'),lm('shimu','那就让他喝完茶再打。喝过归云谷茶的人，下手总会留三分。','smile'),lm('dou','还有第四条！别惹将军！','fun',{hero:'surprise'})]),
 closing:[{...lm('goose','嘎——！','fun',{hero:'surprise',dou:'worry'}),cast:['hero','shimu','dou','goose']},{...lm('hero','门口那只鹅……脖子上还系着布带，一直盯着我？','surprise',{dou:'worry'}),cast:['hero','shimu','dou','goose']},lm('dou','那就是将军。它追咬一切新来的人。你最好——跑。','worry'),lm('shimu','将军，回窝去。……它就听我的。萧白，往后这儿就是你的家了，吃饱了再去练功。','smile',{hero:'normal'})]}),
 tour:c=>({
 intro:[card('次日清晨'),lm('zhong','起了起了！师兄说了，头两个月归我管。先认地方，再认活——谷里每块石头我都摸过，跟紧了！','fun',{hero:'surprise'}),lm('zhong','这边练武场，那边木人桩，溪边是水车，廊下晾干菜，最里头是师兄的书房——都记住没？','fun'),lm('zhong','这水车，我做的。那木人桩，我做的。那个鹅圈——也是我做的，可将军不住，它嫌小。','fun')],
 choices:one([lm('hero','师叔，往后我在哪儿练？','normal'),lm('zhong','就这儿。看见那排水缸没？明天开始，你每天把它挑满。','serious'),lm('hero','……这跟练武有关系？','surprise'),lm('zhong','关系大了！腿没劲，招式再漂亮也是花架子。笨功夫，懂不懂？','serious'),lm('ye','那边向阳的一小块地，荒着？','normal'),lm('zhong','以前种过药，没人会伺候。叶姑娘要是不嫌弃，那块地归你。我明儿给你搭个新晾架，比原来那个高三寸！','smile'),lm('ye','……有块地可以照料，心里踏实些。','smile')]),
 closing:[{...lm('goose','嘎。','normal',{hero:'worry'}),cast:['zhong','hero','ye','goose']},{...lm('hero','（转了一整圈，太阳都偏西了。……鹅圈里那只鹅，一直在看我。）','worry'),cast:['zhong','hero','ye','goose']},lm('zhong','明天卯时，练武场。迟到一刻，多挑一担水。','serious')]}),
 stance:c=>({
 intro:[card('第一个月'),lm('zhong','这个月就两件事：挑水，站桩。别的不许想！','serious',{hero:'serious'}),lm('zhong','腰往下沉！膝盖别过脚尖！一炷香——才过了半炷你抖什么？','serious'),lm('hero','师叔……腿……不是我的了……','worry',{zhong:'serious'}),lm('zhong','是你的。等它不抖了，就真是你的了。','serious'),card('当晚',{place:'courtyard',time:'night'}),lm('ye','把裤腿挽起来。小腿绷得像石头，再不揉开明天站不住。','serious'),lm('hero','你怎么知道我明天还要站？','surprise'),lm('ye','因为你今天站完，还偷偷去加了一炷香。卢小豆告诉我的。','normal')],
 choices:one([lm('hero','……好，明天按师叔说的来，不逞强。','normal'),lm('ye','这才像话。练坏了腿，谁替你挑水？','smile'),lm('hero','你？','smile'),lm('ye','想得美。','smile')]),
 closing:[card('一个月后',{place:'training_ground',time:'day'}),{...lf('zhong','一炷香到——腿没抖。……行，晚饭给你多夹块肉。','mid'),mood:'smile'},{...lf('zhong','咦，你小子头发长这么快？都能扎个揪了。','mid'),mood:'surprise'},{...lf('hero','……好像是。','mid'),mood:'smile'}]}),
 xinfa:c=>({
 intro:[card('第二个月'),lm('zhong','师兄？你今天怎么亲自来练武场了？','surprise',{zhou:'serious',hero:'serious'}),lm('zhou','根基扎住了，可以开始学心法了。归云谷的功夫，先练气，再练招。','serious'),lm('zhong','师兄，我还没教够——','normal'),lm('zhou','你教的是腿，我教的是气。两样都要。','serious'),lm('zhou','坐下。不必盘得好看，腰背挺直，肩放松。吸气的时候，想着气沉到脐下三寸；吐气的时候，想着它像云一样散开。','serious'),lm('hero','……像云一样？','surprise'),lm('zhou','归云心法。云散了还会回来，气也是。练到后来，你就知道为什么叫这个名字。','serious')],
 choices:one([lm('hero','师父，我该感觉到什么？','serious'),lm('zhou','什么也不必感觉。先数呼吸，数到一百，不乱，就算入门。','serious'),lm('hero','就这么简单？','surprise'),lm('zhou','数到第三十几你就知道了。','normal'),lm('hero','（三十五……三十六……三十七……）','normal'),lm('zhong','……睡着了？','surprise',{hero:'sleep'}),lm('zhou','让他睡。把我那件外衣拿来，给他披上。','smile',{hero:'sleep',zhong:'smile'})]),
 closing:[card('一个时辰后'),lm('zhou','醒了？往后每天早晚各一次，不许间断。','normal',{hero:'awkward',zhong:'fun'}),lm('hero','（归云心法……来到这里以后，学会的第一门功夫。居然是睡过去的。）','smile',{zhou:'normal',zhong:'normal'})]}),
 hair:c=>({
 intro:[card('两个月后'),{...lf('shimu','坐。头发长得比功夫还快——乱糟糟的像个鸡窝，出门丢归云谷的人。','mid'),mood:'smile'},{...lf('hero','师母，我自己会扎……','mid'),mood:'normal'},{...lf('shimu','你那叫扎？那叫拴。别动。','mid'),mood:'serious'},{...lf('shimu','头发拢起一半……好了。再把这个戴上。','mid'),mood:'normal'},{...lf('hero','这是……发冠？','mid'),mood:'surprise'},{...lf('shimu','这是你师父年轻时戴的，他嫌晃眼，压在箱底二十年了。','mid'),mood:'smile'},{...lf('hero','（水缸里的倒影……是我？倒真像个江湖人了。）','long'),mood:'surprise'},{...lf('ye','……嗯。还挺像样的。','long'),mood:'smile'}],
 choices:one([lm('hero','谢谢师母。','smile',{shimu:'smile'}),lm('shimu','谢什么。家里的孩子，总得收拾得体面些。','smile'),lm('dou','哇！萧白你戴师父的发冠！我都没有！师母偏心！','fun'),lm('shimu','你那头发，扎三根都费劲。','smile')]),
 closing:[card('第一年 · 正月'),lm('shimu','根基打完了。往后三年，学武、行医、交朋友、下山见世面——一样一样来。','smile',{hero:'serious',ye:'smile'})]})
};

// ===== 师门二至四月补充剧本 =====
const EXTRA={
 gy_man_herbs:c=>({
 intro:[lm('man','这个是薄荷！这个……这个也是薄荷！','smile'),lm('ye','这个是紫苏。叶背是紫的，你翻过来看。','smile'),lm('man','……哦。叶蘅姐姐，那萧白哥是什么？','surprise'),lm('hero','我是什么？','surprise'),lm('man','你练功的时候脸一会儿红一会儿白，像萝卜。白萝卜。','smile')],
 choices:[{key:'teach',text:'陪小满一起认药，认错了也不笑她',lines:[lm('hero','那你教我认，认对一个，我就不当萝卜。','smile'),lm('man','这个！叶背是紫的——紫苏！','smile'),lm('hero','那这个呢？叶背是绿的。','normal'),lm('man','……薄荷！这回是真的！','smile',{ye:'smile',hero:'smile'})]},{key:'tease',text:'“那小满是什么？小辣椒？”',lines:[lm('man','我才不是辣椒！我告诉我娘去！','angry'),lm('ye','……她真会去告状的。','normal'),lm('hero','（今晚的菜里，怕是要多一盘辣椒。）','worry')]}],
 closing:[lm('ye','你以后带她认药，先叫她翻叶背。','normal'),lm('man','明天还来！','smile')]}),
 gy_fang_back:c=>({
 intro:[card('二月下旬'),lm('dou','大师兄回来了！萧白，快站好，大师兄最讲规矩！','surprise'),lm('fang','……小豆，我又不是师父。','normal'),lm('fang','你就是萧白？师父信里提过你。我是方迟，你大师兄。','serious'),lm('hero','大师兄好。','serious'),lm('fang','站桩站了多久？','serious'),lm('hero','快四个月了。','normal'),lm('fang','腿抖不抖？','serious')],
 choices:[{key:'honest',text:'“还抖。”',lines:[lm('hero','还抖。最后半炷香，抖得厉害。','normal'),lm('fang','嗯。说实话的人，练得最快。','smile'),lm('dou','大师兄，我当年说不抖，你罚我多站了一炷香！','fun')]},{key:'brave',text:'“不抖了。”',lines:[lm('hero','不……不太抖了。','worry'),lm('fang','明早卯时，我看你站。','serious'),card('第二天',{place:'training_ground',time:'day'}),lm('fang','别动。','normal',{hero:'worry'}),lm('hero','……腿，稳了？','surprise',{fang:'normal'})]}],
 closing:[lm('fang','我在谷里待到四月，之后要下山办事。有不懂的，先问我，别去烦师父。','serious'),lm('dou','大师兄就是这样，什么事都往自己身上揽。','normal')]}),
 gy_dou_feed:c=>({
 intro:[lm('dou','从今天起，喂将军的差事交给你。这是师兄对你的考验！','fun',{hero:'surprise',goose:'fun'}),lm('hero','……你是不是被它啄怕了？','normal'),lm('dou','胡说！我是在培养你！','angry'),lm('goose','嘎？','fun',{hero:'worry'})],
 choices:[{key:'calm',text:'学师母的样子，不慌不忙地撒谷子',lines:[lm('hero','（站定，别动，慢慢撒……）','normal',{goose:'normal'}),lm('dou','……它怎么不啄你？','surprise'),lm('hero','大概是因为我没跑。','smile')]},{key:'run',text:'把簸箕往地上一放，转身就跑',lines:[lm('hero','它追来了——步法，步法！绕水缸！','worry',{goose:'fun'}),lm('dou','步法不错！再跑快点！','fun')]}],
 closing:[lm('dou','行吧，算你过了。……明天还是你喂。','normal'),lm('dou','记住了，这是归云谷第五条规矩：每天喂将军！','smile',{hero:'normal'})]}),
 gy_fang_spar:c=>({
 intro:[lm('fang','接着。木棍，我也拿一根。','serious',{hero:'serious'}),lm('fang','我不出招，只守。你把学过的都用上——哪一下让我退了半步，就算你赢。','serious'),lm('hero','大师兄，你不怕我打着你？','surprise'),lm('fang','怕的话，就不陪你练了。来。','serious')],
 choices:[{key:'win',text:'',lines:[lm('fang','……退了。','surprise'),lm('fang','不是招式让我退的，是你的脚。这几个月的桩没白站。','smile'),lm('hero','（刚才那一下，手上比平时顺。）','smile')]},{key:'lose',text:'',lines:[lm('fang','停。你的招是对的，可每一下都想一次打倒我。','serious'),lm('hero','……我太急了。','sad'),lm('fang','急不是错。先想着回来，再想着出去。明天再来。','serious')]}],
 closing:[lm('fang','我走以后，小豆会偷懒，你多盯着点。还有……师父的旧伤，别让他逞强。','worry'),lm('hero','大师兄放心。','serious')]}),
 gy_fang_leaves:c=>({
 intro:[card('四月上旬'),lm('shimu','两包干粮，一包伤药，都给你塞进包里了。','worry',{fang:'normal',zhou:'serious',hero:'normal'}),lm('shimu','药放在最上面。受了伤先用，别省着。','worry'),lm('fang','知道了，师母。','smile'),lm('zhou','这趟去替我送一封信，再看看山下的路。不必急着回来，也不必逞强。','serious'),lm('fang','弟子明白。','serious'),lm('fang','萧白，我不在，小豆就交给你了。','serious')],
 choices:[{key:'promise',text:'“大师兄早点回来。”',lines:[lm('hero','大师兄早点回来。到时候我再攻你三下。','smile'),lm('fang','好。下次我出招。','smile')]},{key:'worry',text:'“一路上……小心。”',lines:[lm('hero','一路上小心。要是你没按时回来……我上哪儿找你？','worry'),lm('fang','那就好好学。真有那一天，你得比我现在强。','serious')]}],
 closing:[lm('fang','走了！都回去吧！','smile',{hero:'normal',shimu:'worry',zhou:'serious'})]}),
 gy_spar_dou:c=>({
 intro:[lm('dou','听说你学招式了？来来来，师兄让你三招！','fun',{hero:'normal'}),lm('hero','不用让。来。','smile')],
 choices:[{key:'win',text:'',lines:[lm('dou','等、等一下！你什么时候这么快了？！','surprise'),lm('hero','（步子跟上了，招也递得出去。）','smile'),lm('dou','……这回不算，我早上没吃饱。','sad')]},{key:'lose',text:'',lines:[lm('dou','哈！碰不到我吧！','fun'),lm('hero','（他一直在动。我光盯着他的手，忘了看脚。）','serious'),lm('dou','看脚，别看手。——这是小师叔教我的，白送你了。','smile')]}],
 closing:[lm('dou','下回再比！输的人扫院子！','fun')]}),
 gy_spar_zhong:c=>({
 intro:[lm('zhong','来来来！让二师叔看看你的拳头硬不硬！','fun',{hero:'normal'}),lm('hero','二师叔，你下手轻点。','worry')],
 choices:[{key:'win',text:'',lines:[lm('zhong','嚯！这一下够劲！','surprise'),lm('zhong','根扎住了，拳才有分量。我没白让你挑水！','fun')]},{key:'lose',text:'',lines:[lm('zhong','你打我十拳，我纹丝不动。知道为什么吗？','serious'),lm('hero','……我脚下是浮的。','sad'),lm('zhong','对！明天多挑两担水！','fun')]}],
 closing:[lm('zhong','走，喝口水去。打完架不喝水，嗓子要冒烟。','smile')]}),
 gy_spar_yin:c=>({
 intro:[lm('yin','竹林里地不平，正好。我收着打，你全力来。','smile',{hero:'serious'}),lm('hero','小师叔，我要是碰到你了呢？','normal'),lm('yin','碰到了再说。','fun')],
 choices:[{key:'win',text:'',lines:[lm('yin','……衣角。你碰到我的衣角了。','surprise'),lm('yin','行，今天算你赢。别得意，我只用了三成。','smile')]},{key:'lose',text:'',lines:[lm('yin','你只看我的剑。剑是骗人的，脚才是真的。','serious'),lm('hero','（跟小豆说的一样……原来是她教的。）','surprise'),lm('yin','再练一个月步法，回来找我。','normal')]}],
 closing:[lm('yin','今天就到这儿。酒葫芦递我一下。','smile')]}),
 gy_bamboo_wolves:c=>({
 intro:[lm('dou','嘘——看，脚印是新的。','worry',{hero:'serious'}),lm('hero','几只？','serious'),lm('dou','两……两只。萧白，它们在看我们。','worry'),lm('hero','别跑。站我后面，慢慢往回退。','serious')],
 choices:[{key:'win',text:'',lines:[lm('dou','跑、跑了！你把狼打跑了！','surprise'),lm('hero','（手还在抖。可刚才每一下，都是练过的。）','serious'),lm('dou','我回去要跟全谷说！……不对，师母会骂我们。那就只跟将军说。','fun')]},{key:'lose',text:'',lines:[lm('dou','这边！上石头！','worry'),lm('hero','（没打退它们，可护着小豆退到了高处。）','worry'),lm('dou','它们走了……萧白，你胳膊流血了。回去找叶蘅姐姐。','worry')]}],
 closing:[lm('dou','往后我再也不一个人来竹径了。……你陪我来也不行。','sad'),lm('hero','（下回再遇上，不能只靠运气。）','serious')]}),
 gy_zhou_test:c=>({
 intro:[card('四月下旬'),lm('zhou','去汉皋之前，我亲手试试你这几个月学的东西。','serious',{hero:'serious'}),lm('zhou','我只用三成力。你不必赢，让我看清你会什么、不会什么。','serious'),lm('hero','是，师父。','serious')],
 choices:[{key:'win',text:'',lines:[lm('zhou','嗯。站得住，收得回，出手前先看了我的脚。','smile'),lm('zhou','到了城里，遇事先用这双眼睛，再用这双手。','serious')]},{key:'lose',text:'',lines:[lm('zhou','停。你的招都对，只是一急，就把学过的全忘了。','serious'),lm('hero','……弟子记住了。','sad'),lm('zhou','所以到了城里，能不动手就不动手。真要动手，先护住自己和叶蘅。','serious')]}],
 closing:[lm('zhou','你会的不多，可都是真的。这就够出门了。','smile')]}),
 gy_yin_past:c=>({
 intro:[card('夜 · 竹径'),lm('yin','陪我走走。今天不喝酒。','normal',{hero:'normal'}),lm('yin','你问过我，为什么掀那张桌子。','serious'),lm('yin','那年我十七，头一回跟师父下山赴寿宴。席上有位执事，当众笑一个过世的郎中“私藏秘方，死有余辜”。','sad'),lm('yin','那位郎中救过我师父的命。我师父坐在那儿，一句话都没说。','sad'),lm('hero','所以你替他掀了。','normal'),lm('yin','我掀了。回来以后，师父罚我跪了三天，然后跟我说：红缨，你做得对，可往后归云谷的人去哪儿都要被人多看一眼了。','serious')],
 choices:[{key:'right',text:'“你做得对。”',lines:[lm('hero','你做得对。换了我，也会掀。','serious'),lm('yin','……你这孩子——不，你已经不是孩子了。','smile'),lm('yin','十几年了，头一回有人不加“可是”两个字。','smile')]},{key:'cost',text:'“所以你才一直不回谷？”',lines:[lm('hero','所以你才一直在外面，不回来？','normal'),lm('yin','……我怕给家里惹事。也怕回来看见师兄替我赔笑脸。','sad'),lm('hero','现在呢？','normal'),lm('yin','现在有人陪我走夜路了。','smile')]}],
 closing:[lm('yin','这事我没跟第二个人说过。','normal'),lm('yin','回去吧。……改天月亮好的时候，到屋顶上来。','smile')]}),
 gy_zhong_kit:c=>({
 intro:[lm('zhong','拿着！出门的家伙。','fun'),lm('hero','这是……一副护腕？','surprise'),lm('zhong','牛皮的，里面夹了竹片。挡不了刀，可摔一跤不至于折了手腕。城里人多，挤来挤去的。','serious'),lm('hero','二师叔，你做了几天？','normal'),lm('zhong','不多不多，三天三夜！……咳，也就两天。','fun')],
 choices:[{key:'wear',text:'当场戴上，认真道谢',lines:[lm('hero','正合适。谢谢二师叔。','smile'),lm('zhong','合适就好！回来要是磨坏了，拿来我修。磨坏了说明你用上了，我高兴。','smile')]},{key:'ask',text:'“二师叔当年第一次下山，也有人给你做吗？”',lines:[lm('zhong','……有。你师祖给我编了一双草鞋。我嫌丑，没穿，结果第二天就把脚磨烂了。','sad'),lm('zhong','所以这护腕，丑也给我戴着。','serious'),lm('hero','不丑。','smile')]}],
 closing:[lm('zhong','去吧。城里的事，看清了再动手——这是你师父的话，我就借来说一句。','serious')]})
};
// 剧情选择对人物关系的推动（仍受关系阶段上限约束，见 CultivationRelations.story）。
const bonds={gy_noodles:{linear:['江采薇',5],listen_rules:['江采薇',5],eat_first:['江采薇',5]},gy_prelude_hair:{linear:['江采薇',3]},gy_ledger:{columns:['江采薇',6],ask_first:['江采薇',6]},gy_night_return:{polite:['殷红缨',5],counter:['殷红缨',6]},gy_fist_or_sword:{sword:['殷红缨',6],both:['殷红缨',3],fist:['殷红缨',1]},gy_welcome_back:{ask_why:['殷红缨',4],let_it_be:['殷红缨',5]},gy_goose_steps:{circle:['殷红缨',8],face_it:['殷红缨',8]},gy_ye_mother:{listen:['江采薇',8],ask_more:['江采薇',8]},gy_go_in_stead:{go_with_yin:['殷红缨',10],stay_home:['殷红缨',4]},gy_mid_autumn:{moon_yin:['殷红缨',12],moon_shimu:['江采薇',8]},gy_dou_runaway:{race:['殷红缨',6],talk:['殷红缨',6]},gy_shimu_birthday:{sew:['江采薇',8],remind:['江采薇',6]},gy_year_exam:{win:['殷红缨',6],lose:['殷红缨',3]}};if(SIDE)Object.assign(bonds,SIDE.bonds);if(NB)Object.assign(bonds,NB.bonds);
// 同门四人（钟拙、方迟、卢小豆、周小满）补上往来后，旧剧情里与他们相关的选项也给关系值；与原有加成并存。
const MORE_BONDS={gy_prelude_tour:{linear:['钟拙',3]},gy_prelude_stance:{linear:['钟拙',3]},gy_noodles:{linear:['卢小豆',2]},gy_dou_feed:{calm:['卢小豆',3],run:['卢小豆',4]},gy_fang_back:{honest:['方迟',4],brave:['方迟',2]},gy_fang_spar:{win:['方迟',4],lose:['方迟',3]},gy_fang_leaves:{promise:['方迟',4],worry:['方迟',3]},gy_zhong_kit:{wear:['钟拙',4],ask:['钟拙',5]},gy_man_herbs:{teach:['周小满',5],tease:['周小满',1]},gy_brother_hurt:{night_watch:['方迟',6],ask_story:['方迟',2]},gy_dou_runaway:{race:['卢小豆',5],talk:['卢小豆',6]},gy_shimu_birthday:{sew:['周小满',5],remind:['周小满',4]},gy_fist_or_sword:{fist:['钟拙',4],both:['钟拙',3],sword:['钟拙',1]},gy_mid_autumn:{moon_fang:['方迟',5]},gy_year_exam:{win:['钟拙',4],lose:['钟拙',4]},gy_spar_dou:{win:['卢小豆',2],lose:['卢小豆',1]},gy_spar_zhong:{win:['钟拙',2],lose:['钟拙',1]},gy_spar_yin:{win:['殷红缨',2],lose:['殷红缨',1]},gy_bamboo_wolves:{win:['卢小豆',4],lose:['卢小豆',3]},gy_zhou_test:{win:['周砚',3],lose:['周砚',2]},gy_yin_past:{right:['殷红缨',6],cost:['殷红缨',6]}};
for(const[id,m]of Object.entries(MORE_BONDS))for(const[k,pair]of Object.entries(m)){const b=bonds[id]||={},old=b[k];b[k]=old?[...(Array.isArray(old[0])?old:[old]),pair]:[pair];}
function effects(s,p,key){const R=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-relations.js'):root.CultivationRelations,pair=p.action==='gn_depart'&&['join','roster'].includes(key)?[['裴知古',4]]:bonds[p.action]?.[key];for(const[name,amount]of pair?(Array.isArray(pair[0])?pair:[pair]):[])R.story(s,name,amount,p.id);
 // 入队（细则第四节，甲类）：同行即入队；否则除夕时关系≥40（熟络后段；没同行时上限 49）才留下入队，不到则记 if 事实，开春她又出门。
 if(p.action==='gy_go_in_stead'&&key==='go_with_yin')s.facts.gy_yin_recruit||={period:p.period,source:p.action};
 if(p.action==='gy_new_year'&&!s.facts.gy_yin_recruit){if((s.relations?.yin?.score||0)>=40)s.facts.gy_yin_recruit={period:p.period,source:p.action};else s.facts.if_yin||={missed:'没有同行，且第一年除夕时关系不足 40',period:p.period};}
 // 裴知古：进城前跟着同行，从此入队（战斗接入另做，见 guiyun-household.md“谷中人家”）。
 if(p.action==='gn_depart')s.facts.gy_pei_join||={period:p.period};
 // 切磋与实战：胜负都给所学兵器的熟练（见 fightGain）；可重复的切磋每个时段一场。
 const fd=definitions.find(d=>d.id===p.action);
 if(fd?.fight){s.facts.spar_log||={wins:0,fights:0};s.facts.spar_log.fights++;if(key==='win')s.facts.spar_log.wins++;if(fd.sparWith){const k='spar_first_'+fd.sparWith;if(key==='win'&&!s.facts[k]){s.facts[k]={period:p.period};s.resources.food=(s.resources.food||0)+1;}}}
 if(p.action==='gy_yin_bond'&&key==='bond_yin')s.facts.gy_bond_yin={period:p.period};
 if(p.action==='gy_yin_bond'&&key==='not_yet')delete s.facts.gy_yin_bond_seen;// 还没想好：下回再来屋顶还能遇到
 const sd=definitions.find(d=>d.id===p.action);
 if(sd?.src){const x=script(p.action,p.visitor.context),ch=x.choices.find(c=>c.key===key);for(const e of ch?.effects||[]){const[k,v]=e.split('=');if(k==='first_delivery.method')s.facts.first_delivery={choice:key==='guidance'?'请陆衡指导':'协同行路',month:s.month,method:v,source:p.action};else s.facts[k]=v==='true'?true:v;}}
 if(p.action==='gy_prelude_stance')s.learned.stance||={source:p.action,period:p.period};
 if(p.action==='gy_prelude_xinfa')s.learned.breathing||={source:p.action,period:p.period};
 if(p.action==='gy_prelude_hair')s.facts.gy_hair_long={period:p.period};
 PH.effects(s,p,key);
}
PH.definitions(definitions);
const has=id=>definitions.some(d=>d.id===id);
const actions=definitions.map(d=>({...d,category:'stroll',intro:d.notice,task:d.prelude?'入谷两个月的过渡演出，自动连播。':d.auto?'谷中日历剧情：到期自动开场，不耗体力。':'师门支线：在开放时间内到对应地点闲逛即可遇到。',requires:d.requires||['joined'],costOverride:d.auto?1:3,fixedGain:true,visitor:true,household:true,once:d.id+'_seen',choice:['请选择当前可用的回答'],presentation:'dialogue',storyPortrait:ART+d.actor+'.png',portraitRect:[0,0,1024,1536],feedback:d.name+'·已记录。'}));
const notices=definitions.filter(d=>d.notice).map(d=>({slot:Math.max(0,d.window[0]-(d.auto?1:2)),id:d.id+'_notice',text:(d.auto?'【师门】':'【师门·支线】')+d.notice}));
// 当前时段应自动开场的日历剧情；未满足前置（拜师、出行归来等）时不开场。
function due(s,availability){const pre=PH.due(s,actions,availability);if(pre)return pre;const now=(s.month-1)*5+s.phase;return actions.find(a=>a.auto&&now>=a.window[0]&&now<=a.window[1]&&!s.facts[a.once]&&!availability(s,a))||null;}
function upcoming(s){const now=(s.month-1)*5+s.phase;return definitions.filter(d=>!d.prelude&&!s.facts[d.id+'_seen']&&d.window[1]>=now&&d.window[0]<=now+5);}
// 萧白、周砚、叶蘅同属归云谷一家的统一 Q 版画风（2026-10-07 用户要求统一），旧图原件保留。
const portraits=Object.fromEntries([...Object.keys(actors),'zhou','ye','hero_short','hero_mid','hero_long'].map(k=>[k,ART+k+'.png']));
portraits.recipient=ART+'neighbor.png';
portraits.hero_long='assets/production/cultivation/hero-empty/hero_long_empty_normal.png';portraits.hero=portraits.hero_long;portraits.goose=ART+'goose.png';
// 萧白发型阶段：入谷到站桩前短发，站桩后半长，“两月满”后长发；旧存档已过正月月初者按长发。
function heroForm(s){if(!s||s.facts?.gy_hair_long)return 'long';const start=s.month===1&&s.phase===0;if(!start)return 'long';return s.facts?.gy_prelude_stance_seen?'mid':'short';}
function heroPortrait(s,mood){return portraitFor('hero_'+heroForm(s),mood);}
for(const k of ['hero_short','hero_mid','hero_long'])actors[k]='萧白';
// ===== 立绘演出：按台词语气与场景选表情（2026-10-08 用户：严肃场面不能嬉皮笑脸）=====
// 每人的表情档：normal 平静、smile 微笑、serious 严肃、surprise 惊讶、worry 担忧、angry 生气、sad 低落；fun 为原夸张图，只在明确的笑点使用。
const ALL=['normal','smile','serious','surprise','worry','angry','sad','fun'];
const HERO_MOODS=['normal','smile','serious','surprise','worry','angry','sad','awkward','sleep'];
const MOODS={hero_long:[...HERO_MOODS,'laugh','hurt'],hero_short:HERO_MOODS,hero_mid:HERO_MOODS,zhou:ALL,shimu:ALL,yin:ALL,zhong:ALL,fang:[...ALL,'hurt_normal','hurt_serious','hurt_smile','hurt_sad'],dou:[...ALL,'sleep'],man:['normal','smile','surprise','worry','sad','fun'],ye:ALL.filter(m=>m!=='fun'),goose:['normal','fun'],lu:['normal','smile','serious','surprise','worry','sad'],neighbor:['normal','smile','worry'],mo_songnian:['normal','smile','serious','surprise'],meng_zhiwei:['normal','smile','serious','worry'],zhaochuan_courier:['normal','smile','serious','surprise']};
if(NB)Object.assign(MOODS,NB.moods);
// 匿名收件人借用乡邻老人形象。
const ALIAS={recipient:'neighbor'};MOODS.recipient=MOODS.neighbor;
// 同义回落：缺档时找最接近的一档，最后回落平静。
// 状态档（2026-10-08）：方迟负伤（hurt_*）、小豆打盹（sleep）。负伤档缺某表情时在负伤档内回落，不跳回完好的样子。
const FALLBACK={hurt_worry:['hurt_sad','hurt_normal'],hurt_angry:['hurt_serious','hurt_normal'],hurt_surprise:['hurt_normal'],hurt_fun:['hurt_smile','hurt_normal'],hurt_smile:['hurt_normal'],hurt_serious:['hurt_normal'],hurt_sad:['hurt_normal'],hurt_normal:[],sleep:['normal'],serious:['normal'],worry:['sad','serious','normal'],angry:['serious','normal'],sad:['worry','normal'],surprise:['normal'],smile:['normal'],fun:['laugh','smile','normal'],laugh:['fun','smile','normal'],awkward:['worry','normal'],normal:[]};
function resolveMood(id,mood){const list=MOODS[id];if(!list)return null;const last=/^hurt_/.test(mood)&&list.includes('hurt_normal')?'hurt_normal':'normal';for(const m of [mood,...(FALLBACK[mood]||[]),last])if(list.includes(m))return m;return list[0];}
function portraitFor(id,mood){const m=resolveMood(id,mood||'normal');if(!m)return portraits[id]||null;id=ALIAS[id]||id;if(/^hero_(short|mid|long)$/.test(id)){let state={angry:'serious',awkward:'worry',laugh:'smile',fun:'smile'}[m]||m;if(id!=='hero_long'&&['hurt','sleep'].includes(state))state=state==='hurt'?'worry':'normal';return 'assets/production/cultivation/hero-empty/'+id+'_empty_'+state+'.png';}return m==='fun'&&!/^hero_/.test(id)?portraits[id]:ART+id+'_'+m+'.png';}
// 场景基调：未说话的人默认什么表情（按事件）；说话人的表情由台词推断，推断不出时用这里的默认。
const TONE={
 gy_noodles:{shimu:'smile',dou:'smile',hero:'normal'},
 gy_prelude_tour:{zhong:'smile',hero:'normal',ye:'normal'},
 gy_prelude_stance:{zhong:'serious',hero:'serious',ye:'worry'},
 gy_prelude_xinfa:{zhou:'serious',hero:'serious',zhong:'normal'},
 gy_prelude_hair:{shimu:'smile',hero:'normal',ye:'smile'},
 gy_ledger:{shimu:'normal',hero:'serious'},
 gy_night_return:{yin:'smile',hero:'surprise',ye:'normal'},
 gy_fist_or_sword:{zhong:'angry',yin:'smile',hero:'normal',zhou:'normal'},
 gy_welcome_back:{yin:'normal',shimu:'smile',hero:'normal'},
 gy_goose_steps:{yin:'smile',hero:'worry',goose:'fun'},
 gy_ye_mother:{ye:'sad',shimu:'sad',hero:'normal'},
 gy_brother_hurt:{hero:'worry',fang:'worry',shimu:'serious'},
 gy_go_in_stead:{zhou:'serious',hero:'serious',yin:'serious'},
 gy_mid_autumn:{hero:'smile',shimu:'smile',yin:'smile',zhong:'fun'},
 gy_dou_runaway:{hero:'serious',dou:'sad',yin:'normal'},
 gy_shimu_birthday:{hero:'smile',man:'smile',shimu:'smile'},
 gy_year_exam:{zhou:'serious',hero:'serious',zhong:'serious',yin:'serious'},
 gy_new_year:{hero:'smile',ye:'smile',yin:'smile',shimu:'smile'},
 gy_m03:{zhou:'serious',ye:'serious',hero:'normal'},gy_m05:{lu:'serious',hero:'serious',ye:'normal'},gy_z01:{zhou:'serious',hero:'serious'},gy_z03:{zhou:'serious',hero:'normal'},gy_m09:{zhou:'normal',hero:'serious',ye:'normal'},
 gy_fang_back:{fang:'normal',dou:'smile',hero:'normal'},gy_fang_spar:{fang:'serious',hero:'serious'},gy_fang_leaves:{fang:'normal',zhou:'serious',shimu:'worry',hero:'normal'},gy_zhong_kit:{zhong:'smile',hero:'normal'},gy_dou_feed:{dou:'smile',hero:'normal',goose:'normal'},gy_man_herbs:{man:'smile',ye:'normal',hero:'normal'}
};
// 台词推断：只给说话人用；关键词顺序即优先级。
const CUES=[
 ['angry',/不许|闭嘴|放肆|找死|谁动我|胡闹|你不许/],
 ['worry',/伤|血|疼|怕|担心|别逞强|不碍事|撑不住|小心|旧伤|抬回来|没有消息/],
 ['sad',/过世|不敢|散了|叫人想吐|眼泪|擦眼睛|腾地方|一个人都不认识|落寞/],
 ['surprise',/[？?]！|！[？?]|咦|哇|什么[？?]|怎么[？?]|真是我|你认得|……[？?]$/],
 ['fun',/哈哈|嘿嘿|噗|一拳打倒|长个了|偏心|我比你早|叫师兄|嘎/],
 ['serious',/腰|吸气|吐气|站|练|根基|规矩|心法|招|记着|注意|先.+再|不必|笨功夫|一炷香|题|考校|师父说|必须|别动/],
 ['smile',/好孩子|谢谢|这才像话|有眼光|我喜欢|挺像样|干得好|好！|行。|吃饱|高兴|欢迎/]
];
function inferMood(text){for(const[m,re]of CUES)if(re.test(text||''))return m;return null;}
const baseId=id=>/^hero(_|$)/.test(id)?'hero':id;
// 给一行对白分配同屏每个人的表情（2026-10-11 用户：不是每句话都换立绘）。
// 规则：每个人保持上一句的表情；只有剧本在这一句点明（line.mood 给说话人、line.moods 给任何人）才考虑换。
//   · 强烈的情绪（惊讶、生气、低落、大笑、尴尬、夸张）立刻换，两句之后没有新的指示就回到这场戏的基调；
//   · 平常、微笑、严肃、担忧之间的变化算轻微，距上次换表情不足两句就不换，免得一句一变。
// 不再按台词里的字眼猜表情。
const STRONG=new Set(['surprise','angry','sad','fun','laugh','awkward']);
let HOLD={event:null,key:null,held:{},since:{},n:0};
function moodsFor(eventId,line,cast){const tone=TONE[eventId]||{},key=(line?.speaker||'')+'|'+(line?.text||'');
 if(HOLD.event!==eventId)HOLD={event:eventId,key:null,held:{},since:{},n:0};
 if(HOLD.key!==key){HOLD.key=key;HOLD.n++;const n=HOLD.n,want={};
  if(line?.mood&&line.speaker&&line.speaker!=='narrator')want[baseId(line.speaker)]=line.mood;
  if(line?.moods)for(const[k,v]of Object.entries(line.moods))want[baseId(k)]=v;
  for(const b of new Set([...Object.keys(HOLD.held),...Object.keys(want)])){const cur=HOLD.held[b]??tone[b]??'normal',w=want[b],last=HOLD.since[b]??-9;
   if(w&&w!==cur&&(STRONG.has(w)||STRONG.has(cur)||n-last>=2)){HOLD.held[b]=w;HOLD.since[b]=n;}
   else if(!w&&STRONG.has(cur)&&n-last>=2){HOLD.held[b]=tone[b]||'normal';HOLD.since[b]=n;}}}
 const out={};for(const id of cast||[]){const b=baseId(id);out[id]=HOLD.held[b]??tone[b]??'normal';}
 const st=definitions.find(d=>d.id===eventId)?.state;if(st)for(const id of Object.keys(out)){const k=st[baseId(id)];if(k&&!/^(hurt_|sleep$)/.test(out[id]))out[id]=k+'_'+out[id];}
 return out;}
function resetMoods(){HOLD={event:null,key:null,held:{},since:{},n:0};}
// 定义级的额外可用条件（核心 availability 调用）：过招要先学会一门招式。
function gate(s,a){if(a.needSkill&&!s.learned.sword&&!s.learned.fist)return'先学会一门招式（入门剑式或粗浅拳脚）。';return '';}
const fightOptions=d=>({solo:true,noLose:true,noFlee:true,spar:!!d.sparWith,bg:d.fight.bg,foes:JSON.parse(JSON.stringify(d.fight.foes)).map(f=>({exp:0,silver:0,drops:{},...f,...(d.id==='gy_fang_spar'?{guiyunGuardOnly:true}:{})}))});
const API={gate,fightGain,fightOptions,routes,definitions,actions,notices,actors,portraits,script,extra,effects,has,due,upcoming,bonds,heroForm,heroPortrait,MOODS,TONE,resolveMood,portraitFor,resetMoods,inferMood,moodsFor};
if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationHousehold=API;
})(typeof globalThis!=='undefined'?globalThis:this);
