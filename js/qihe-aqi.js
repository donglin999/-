'use strict';
// 小耗子（阿七）的一课：固定剧情，主线必经（../xiaojianghu/docs/design/npc-steal.md 第 3.3、3.4 节；剧本 story/01-开始/风起-小耗子.ink）。
// 第一天白天《次日药摊》散场后他在客栈门口喊一声；门口打赌（教学小游戏）→ 东埠摸采办随从的钱袋（固定 100%）→ 南村口药摊买药 → 挂到村南老人家门上 → 回客栈门口交“工钱”、报本名，学会“窃”。
// 步骤 S.aqiTeach.step：0 未开始、1 门口打赌完、2 钱袋到手、3 药买到、4 药挂上门；wage 为 said／quiet 时这一课结束（第 10 节）。
// 两段没做完之前第一天白天的主线指向他（js/qihe-chapter.js mainStep），药棚不弹“进入下一时段”。第二天的两个伏笔点是随口话。
(()=>{
 if(!isQiheEntry())return;
 const CP=()=>S?.qiheChapter,X=QiheExpansion;
 const days=()=>CP()?.stage==='days',half=()=>CP()?.halfDay??0;
 const teach=()=>S.aqiTeach||(S.aqiTeach={step:0,wage:null});
 const step=()=>S.aqiTeach?.step||0;
 const learned=()=>!!S.aqiTeach?.wage;
 const save=()=>QihePrologue.checkpoint();
 async function guarded(fn){if(QiheChapter.running)return;const was=busy;busy=true;keys={};player.path=null;try{return await fn()}finally{busy=was;keys={};save();X.refresh()}}
 // 教学手：交给偷窃的小游戏（js/qihe-steal-ui.js）。门口一手失手不罚、再来；摸钱袋固定 100%
 const STEP_AFTER={aqi_lesson_coin:1,aqi_lesson_purse:2};
 const LESSON={aqi_lesson_coin:{n:'铜钱',rate:70},aqi_lesson_purse:{n:'钱袋',rate:100}};   // 偷窃稿第 3.3 节：门口一手 70%、失手不罚再来；摸钱袋固定 100%
 // 保底（2026-10-27 用户：「偷三次失败后就直接教会，如果一次教会就加好感值」）：三次失手小耗子自己把门道说了，算教会；头一回就成，他对萧白好感 +5
 const PITY_AFTER=3,QUICK_BOND=5;
 async function lesson(key){const L=LESSON[key];let fails=0;
  for(;;){let r='ok';const UI=window.QiheStealUI;if(UI?.minigame&&L)r=await UI.minigame('aqi',{n:L.n},L.rate,window.QIHE_STEAL_DATA.TIERS.none,[]);if(r!=='ok'&&r!=='great')r='fail';
   if(r!=='fail'){window.QiheSteal?.teach?.(key,r);if(key==='aqi_lesson_coin'&&!fails){await QiheChapter.play('fq_aqi_quick');try{window.QiheNpc?.bond?.add('aqi',QUICK_BOND,{reason:'bond'})}catch(e){}}break}
   if(++fails>=PITY_AFTER){await QiheChapter.play('fq_aqi_pity');window.QiheSteal?.teach?.(key,'ok');break}
   await QiheChapter.play('fq_aqi_again')}
  if(key==='aqi_lesson_purse'){S.steal||={};S.steal.taken||={};(S.steal.taken.aide||={})['钱袋']=true}   // 一课里已摸走随从的钱袋
  teach().step=Math.max(step(),STEP_AFTER[key]||0);save()}
 function learn(){const t=teach();if(!S.steal)S.steal={version:1,lv:1,exp:0};S.steal.lv=Math.max(1,S.steal.lv||1);S.steal.exp=(S.steal.exp||0)+3;S.skills||={};S.skills.steal=true;const ns=window.QiheNpc?.state?.();if(ns){ns.skills||={};ns.skills.steal=true}   // “窃”印读人物交互模块的 skills（js/qihe-npc-core.js stealState）
  t.learnedAt=half();save();toast('学会“窃” · 窃术一级 · 墨印菜单第八枚印已开',2400)}
 const ext={fq_aqi_steal:lesson,fq_aqi_learn:learn};
 // 画外音：这几个人这一段只闻其声（js/qihe-chapter.js placeCast 跳过 window.QiheOffstage 里的人）
 async function offstage(names,fn){const set=window.QiheOffstage||(window.QiheOffstage=new Set());names.forEach(n=>set.add(n));try{return await fn()}finally{names.forEach(n=>set.delete(n))}}
 const play=(knot,vars={})=>QiheChapter.play(knot,ext,vars);
 // ── 客栈门口（中央村落客栈门 inn 锚点东侧台阶）──
 const aqiHere=()=>days();
 const aqi=X.add('central','aqi','小耗子','c_qh_aqi',[690,1335],()=>guarded(async()=>{const s=step();
  if(!learned()){if(s===0)return play('fq_aqi_bet');if(s<4)return play('fq_aqi_wait');return play('fq_aqi_wage')}
  const t=teach();if(half()>=2&&!t.hintReturn){t.hintReturn=true;return play('fq_aqi_hint_return')}
  return play('fq_aqi_idle')}),aqiHere);
 aqi.mark=()=>days()&&(!learned()&&(step()===0||step()===4)||half()>=2&&!S.aqiTeach?.hintReturn);
 // 东埠采办随从：第一单摸钱袋
 {const aide=SC[X.ids.east].npcs.find(n=>n.id==='aide');const old=aide.act,oldMark=aide.mark;aide.act=async(...a)=>{if(days()&&step()===1)return guarded(()=>play('fq_aqi_purse'));return old(...a)};aide.mark=()=>days()&&step()===1||!!oldMark?.()}
 // 南村口药商：拿钱袋里的钱买药
 {const m=SC[X.ids.south].npcs.find(n=>n.id==='merchant');const old=m.act,oldMark=m.mark;m.act=async(...a)=>{if(days()&&step()===2)return guarded(()=>play('fq_aqi_buy'));return old(...a)};m.mark=()=>days()&&step()===2||!!oldMark?.()}
 // 挂药这一步老人在屋里（剧本：隔着门问“谁呀”），门口那个常驻的老人先不站（2026-10-27 用户：剧情是隔门说话，门口却站着人）
 {const elder=SC[X.ids.central].npcs.find(n=>n.id==='elder');if(elder){const old=elder.show;elder.show=()=>!(days()&&step()===3)&&(!old||old())}}
 // 村南老人家门口：把药包挂上门环
 Object.assign(X.add('central','aqi-door','村口老人家门',null,[1331,1395],()=>guarded(()=>offstage(['村口老人'],()=>play('fq_aqi_door'))),()=>days()&&step()===3),{mark:()=>true});
 // 第二天客栈里：柜上少了钱，店家先看向小耗子（伏笔点 2，随口话，一次）
 {const inn=SC.prologue_inn_interior.npcs.find(n=>n.id==='innkeeper');const old=inn.act;inn.act=async(...a)=>{const t=S.aqiTeach;if(days()&&half()>=2&&learned()&&!t.hintName){t.hintName=true;await guarded(()=>play('fq_aqi_hint_name'))}return old(...a)}}
 // 《次日药摊》散场后他先喊一声（R-主线-01：对方先开口）
 async function call(){if(learned()||step()>0||teach().called)return;teach().called=true;await offstage(['小耗子'],()=>play('fq_aqi_call'));save()}   // 远远喊一声，不摆到萧白身边
 // 第一天白天主线：一课没上完前指向客栈门口
 const AQI_STEP={aqi:true,npc:'aqi',who:'小耗子',title:'客栈门口的小耗子在喊你',where:'中央村落 · 客栈门口',scene:null};
 const pending=()=>days()&&half()===0&&!learned();
 window.QiheJournalExtras=window.QiheJournalExtras||[];
 window.QiheJournalExtras.push((add,stepRow)=>{if(!S.aqiTeach?.called&&!step())return;const s=step(),done=learned();
  add({id:'main:aqi',title:'小耗子的一课',kind:'主线',status:done?'done':'active',owner:null,origin:'客栈门口那个叫小耗子的外乡少年，要教你一门在这儿吃得开的手艺。',
   objective:done?'学会了“窃”。他本名叫阿七。':['去客栈门口找小耗子。','去东埠，摸点篓子那个随从腰上的钱袋。','拿钱去南村口药摊买一包治老寒腿的药。','把药包挂到村南老人家门环上，别敲门。','回客栈门口找小耗子。'][s],where:'栖河 · 客栈门口',people:[],action:null,
   progress:[stepRow('门口打赌','从他身上摸走一枚铜钱。',s>=1),stepRow('摸钱袋','东埠采办随从。',s>=2),stepRow('买药','南村口药摊。',s>=3),stepRow('挂药','村南老人家门口。',s>=4),stepRow('交工钱','回客栈门口。',done)]})});
 window.QiheAqi={call,learned,step,pending,AQI_STEP,teach};
})();
