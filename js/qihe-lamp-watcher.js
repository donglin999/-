'use strict';
// 归烬堂支线·蔺管事线（../xiaojianghu/docs/design/qihe-mojiao-observer-sideline.md 第三、五、六、十节；接口见共用笔记 42-剧本三）。
// 台词全在 ink：story/01-开始/支线-蔺管事-*.ink（灯一～灯四、留话、赏书）、人物-算命先生.ink（平日开口与测字）、人物-船家.ink（开口与渡口闲话）、支线-蔺管事-看封皮.ink 前的一问在 人物-算命先生.ink 的 qh_lamp_seal_ask。
// 本文件只管：算命先生、船家上图，各场入口与时限，第三天上午“后山／跟脚夫”二选一，被说出去后撤摊，结局判定，结局场与奖励，行记条目。
// 存档：剧本用 set_flag 写 S.qiheChapter.records.lamp.*；本文件另记 meetPlayed、report1Done、report2Done、endPlayed、rewards。
(()=>{
 if(!isQiheEntry())return;
 const CP=()=>S?.qiheChapter;
 const lamp=()=>CP()?.records?.lamp||{};   // 只读：不顺手建对象（画面刷新会调到，免得往存档里塞空记录）
 const lampW=()=>{const p=CP();p.records||={};return p.records.lamp||(p.records.lamp={})};
 const rec=()=>CP()?.records||{};
 const days=()=>CP()?.stage==='days';
 const half=()=>CP()?.halfDay??0;
 const dealt=()=>['accepted','asked_first'].includes(rec().stranger_deal);
 // 被说出去（宋先生那里说出算命先生，或灯二对岑霜说出有人托付，或交付时去告诉岑霜）：当天撤摊，灯四关闭（笔记 42 第 1 条）
 const exposed=()=>{const l=lamp();return !!l.sold||l.handoff==='cen'};
 // 各场开放条件，一行一条（时限按支线稿第六节；半日 5 起收摊离村）
 const OPEN={
  meet:()=>days()&&half()<=1&&!lamp().meetPlayed,
  boatman:()=>days()&&half()<=2&&!!lamp().met&&!lamp().boatman,
  report1:()=>days()&&half()<=4&&!!lamp().boatman&&!lamp().report1Done&&!exposed(),
  seal:()=>days()&&half()>=3&&half()<=4&&!!lamp().briefed&&!lamp().seal&&!!CP()?.events?.['three-meeting'],
  tail:()=>days()&&half()===4&&!!lamp().briefed&&!lamp().t3&&!CP()?.events?.['c1-s2'],
  report2:()=>days()&&half()===4&&!!lamp().report1Done&&!lamp().report2Done&&!exposed()   // 回过话一才知道他姓蔺
 };
 const fortuneHere=()=>days()&&half()<=4&&!exposed();
 const boatmanHere=()=>days()&&half()<=5;   // 地图稿 E1：第一天白天～第三天下午（第一夜不在，闲话里“这几天借过宿”才对得上）
 // 吉利话（2026-10-27 用户：吉兆删掉——“这个算命人本来就是一个人假扮的，设计好剧情给一些假属性的奖励就行了”）：
 // 测完字只记一句先生的吉利话，弹一行提示，不给任何真实加成；原“行／安／归”三种 10% 加成及 S.qiheOmens 状态已删除。
 const LUCK={行:'先生说：这两天跟人过招，不吃亏',安:'先生说：磕了碰了也好得快',归:'先生说：这两天跟人好好处，人家记你的好'};
 function giveOmen(k){if(!LUCK[k])return;(lampW().luck||(lampW().luck=[])).push({k,at:half()});toast('得了一句吉利话 · '+LUCK[k],2200)}
 // 奖励（支线稿第五节；数值暂用，见问题清单）：只发一次
 ITEMS.qh_shouzhu_jing={name:'《守烛心经》',desc:'甲级内功秘籍。蔺管事私藏的抄本，不属归烬堂传承。开始部分还参悟不了。',key:1,q:4};
 ITEMS.qh_xinhuo_gong={name:'《薪火功》',desc:'丙级内功秘籍，归烬堂堂众常练的一门。功法数据待登记，暂时参悟不了。',key:1,q:2};
 ITEMS.qh_copper_lamp_tag={name:'铜灯牌',desc:'信物。一块巴掌大的铜牌，刻着一盏小灯。',key:1,q:3};
 const REWARD={blade:{items:{qh_shouzhu_jing:1,qh_copper_lamp_tag:1},exp:60},book:{items:{qh_xinhuo_gong:1}},fare:{silver:10}};
 async function reward(kind){const r=REWARD[kind],l=lampW(),got=l.rewards||(l.rewards={});if(!r||got[kind])return;got[kind]=true;
  S.bag||={};for(const[id,n]of Object.entries(r.items||{}))S.bag[id]=(S.bag[id]||0)+n;if(r.silver)S.silver=(S.silver||0)+r.silver;
  let lvl=[];if(r.exp){S.exp=(S.exp||0)+r.exp;lvl=settleCharacterLevels(S)}
  const parts=[...Object.entries(r.items||{}).map(([id,n])=>ITEMS[id].name+' ×'+n),...(r.silver?['银两 '+r.silver]:[]),...(r.exp?[S.lv>=CHARACTER_LEVEL_CAP?'已满级':'修为 +'+r.exp]:[])];
  QihePrologue.checkpoint();await say('获得',parts.join(' · ')+(r.items?' · 江湖→行囊查看':''));for(const n of lvl)await say('','境界突破 · 第 '+n+' 层 · 属性点 +3')}
 const ext={lamp_omen:()=>giveOmen('归'),fortune_omen:k=>giveOmen(k),lamp_reward:reward};
 const play=(knot,vars={})=>QiheChapter.play(knot,ext,vars);
 async function guarded(fn){if(QiheChapter.running)return;const was=busy;busy=true;keys={};player.path=null;try{return await fn()}finally{busy=was;keys={};QihePrologue.checkpoint();QiheExpansion.refresh()}}
 // ── 算命摊：头一回是灯一（测字＋托付）；之后“谈”：开口与选项在 ink（qh_fortune_talk），交回选了哪一项 ──
 async function fortuneTalk(){if(!fortuneHere())return;
  if(OPEN.meet())return guarded(async()=>{lampW().meetPlayed=true;await play('qh_lamp_meet')});
  return guarded(async()=>{const pick=await play('qh_fortune_talk',{can_report1:OPEN.report1(),can_report2:OPEN.report2(),first:!lamp().meetPlayed&&!lamp().talked});lampW().talked=true;
   if(pick==='report1'){await play('qh_lamp_report1');lampW().report1Done=true}
   else if(pick==='report2'){await play('qh_lamp_report2');lampW().report2Done=true}
   else if(pick==='read'){const l=lampW();if(l.readAt===half())return play('qh_fortune_busy');if((S.silver||0)<2)return play('qh_fortune_poor');S.silver-=2;l.readAt=half();await play('qh_fortune_reading')}})}
 // ── 东埠船家：灯一托付后问船；第三天上午可从这里跟脚夫（与后山回话二只能选一边）──
 async function boatmanTalk(){return guarded(async()=>{const pick=await play('qh_boatman_talk',{can_ask:OPEN.boatman(),can_tail:OPEN.tail()});
  if(pick==='ask')return play('qh_lamp_boatman');
  if(pick==='tail'){if(dealt()&&await choose('行程','这件事只能选一边：跟了脚夫，就赶不上后山宋先生那头。',['跟上去','再想想'])!==0)return;return play('qh_lamp_tail',{knows_song:dealt()})}})}
 // ── 灯二：岑霜交谈前多一问（qihe-representatives.js 调用）；问不问在 ink（qh_lamp_seal_ask）──
 async function sealOffer(){if(!OPEN.seal()||lamp().sealAskAt===half())return false;lampW().sealAskAt=half();if(await play('qh_lamp_seal_ask')!=='seal')return false;await play('qh_lamp_seal');return true}
 // ── 结局判定（支线稿第三节“完美路线的判定条件”，对证开场前写；次序 3＞2＞1）──
 const PERFECT=[()=>dealt(),()=>!!lamp().met,()=>rec().stranger_report!=='full',()=>!!lamp().hidden_watch,()=>lamp().seal==='seen',()=>!!lamp().porter_seen,()=>!['song','cen'].includes(lamp().sold),()=>lamp().deduce==='ok',()=>lamp().handoff==='blade_order'];
 function settleEnding(){if(!CP())return null;const l=lampW();
  const touched=dealt()||!!l.met;l.ending=PERFECT.every(f=>f())?'blade':touched?'noticed':'zhou';
  l.noticed=l.t3==='tail'?'tailed':(l.sold==='song'||l.handoff==='cen'||(l.handoff&&l.handoff!=='blade_order')||l.deduce==='fail')?'rumored':null;
  if(!l.met&&!rec().stranger_deal)l.ending=null;   // 两条线都没碰过：留空，对证走原基线（结局 1“周砚主持”改已批准剧本的基线，待用户点头，见问题清单）
  return l.ending}
 // ── 对证后、去处确认前插结局场（结局 3 赏书；结局 2 且认识蔺管事的留话）──
 async function endScene(){const l=lamp();if(!CP()?.records?.lamp)return;if(l.endPlayed||!CP()||!['refuge','mountain'].includes(CP().stage))return;l.endPlayed=true;
  if(l.ending==='blade')await play('qh_lamp_end_blade');else if(l.ending==='noticed'&&l.met)await play('qh_lamp_end_note',{exposed:exposed()})}
 // ── 上图 ──（船家原放 1265,665 夹在树和石头之间，用户说不和谐，2026-10-27 挪到码头入口的开阔草地）
 QiheExpansion.add('central','fortune','算命先生','c_qh_linhuizhi',[1005,318],()=>fortuneTalk(),fortuneHere).mark=()=>OPEN.meet()||OPEN.report1()||OPEN.report2();
 QiheExpansion.add('east','boatman','船家','c_qh_chuanjia',[1210,612],()=>boatmanTalk(),boatmanHere).mark=()=>OPEN.boatman()||OPEN.tail();
 // ── 行记 ──
 const STEPS=[['灯一 · 测字','在北路算命摊测个字，接下他的托付。',l=>!!l.met],['问船家','去东埠码头问船家：黑衣脚夫坐哪条船、打哪儿来。',l=>!!l.boatman],['回话','把船家的话带回算命摊。',l=>!!l.report1Done],
  ['看封皮','设法看一眼岑霜那封传讯的封皮。',l=>!!l.seal],['天亮的脚夫','第三天上午：去后山，或从东埠跟着那个脚夫。',l=>!!l.t3||!!l.porter_seen],['灯四 · 交代','回算命摊，说说谁在牵线、交给谁。',l=>!!l.report2Done]];
 window.QiheJournalExtras=window.QiheJournalExtras||[];
 window.QiheJournalExtras.push((add,step)=>{const l=lamp();if(!l.met)return;const over=!days()||half()>4,done=!!l.report2Done||!!l.ending;
  add({id:'side:lamp',title:'摆字摊的先生',kind:'支线 · 算命先生',status:done||over||exposed()?'done':'active',owner:null,origin:'北路摆测字摊的算命先生，托你打听一个天不亮就上后山的黑衣脚夫。',
   objective:exposed()?'算命摊收了，先生不知去向。':over?'过了时限；已知的线索保留，不影响主线。':(STEPS.find(([, ,f])=>!f(l))||STEPS[5])[1],where:'栖河 · 北路算命摊',people:[],action:null,progress:STEPS.map(([t,d,f])=>step(t,d,f(l)))})});
 window.QiheLamp={OPEN,lamp,settleEnding,endScene,sealOffer,LUCK,fortuneTalk,boatmanTalk,exposed,reward};
})();
