'use strict';
// 栖河隐藏奇遇（xiaojianghu/docs/design/qihe-hidden-rewards.md 第 3、7 节；用户第二轮：“我想做 1237 去实现”）。
// 本文件做 H1 北坡石洞、H2 村口老人（甲案老更夫；用户第二十四轮第 5 题选甲、“换成丙级心法”；第二十五轮第 1 题选甲：暗合《连城诀》狄云，功法改《南窗心法》）、H3 帮众挑衅、H7 认得全村的人。
// 台词全在 ink：story/01-开始/奇遇-北坡石洞.ink、奇遇-老更夫.ink、奇遇-帮众挑衅.ink、奇遇-全村平安符.ink；这里只管入口、条件、存档与奖励。
// 不进任务栏、不靠好感数值（设计第 2 节第 2、7 条）。存档 S.qiheHidden。
(()=>{
 if(!isQiheEntry())return;
 const CP=()=>S?.qiheChapter,X=QiheExpansion;
 const days=()=>CP()?.stage==='days',beforeFire=()=>!CP()||['opening','days'].includes(CP().stage);
 const half=()=>CP()?.halfDay??0;
 const state=()=>{const h=S.qiheHidden||(S.qiheHidden={version:1});h.cave||={};h.elder||={};h.bandit||={talks:0};h.village||={};h.flags||={};return h};
 const play=(knot,vars={})=>QiheChapter.play(knot,{},vars);
 const save=()=>QihePrologue.checkpoint();
 const has=id=>(S.bag?.[id]||0)>0;
 const owns=id=>has(id)||[S.weapon,S.armor,S.acc].includes(id);
 async function guarded(fn){if(QiheChapter.running)return;const was=busy;busy=true;keys={};player.path=null;try{return await fn()}finally{busy=was;keys={};save();X.refresh()}}
 async function gain(items){S.bag||={};for(const[id,n]of Object.entries(items))S.bag[id]=(S.bag[id]||0)+n;save();await say('获得',Object.entries(items).map(([id,n])=>ITEMS[id].name+(n>1?' ×'+n:'')).join(' · '))}
 function exp(n){try{if(window.CharacterGrowth)CharacterGrowth.awardBattle(S,n,[],x=>settleCharacterLevels(x,derived))}catch(e){console.error(e)}}

 // ── 物品（设计第 3 节奖励；秘籍“拿到书”和“学会”分开，开始部分都还参悟不了）──
 Object.assign(ITEMS,{
  mj_art_jh_jh:{name:'《金虺剑法》',desc:'丙级剑法秘籍，江湖散学。北坡石洞石匣里的旧书，纸边发黄。开始部分还参悟不了，进归云谷练剑后才学得了。',key:1,q:1},
  mj_art_gj_h1:{name:'《扬灰手》',desc:'丁级拳掌秘籍，归烬堂给新人的入门功夫。本是客栈里那个新来的少年的，比划输了被帮众扔给你；边角翻得起毛。开始部分还参悟不了。',key:1,q:0},
  qh_huiwen_cloth:{name:'回纹布角',desc:'北坡石洞里拾到的一角深蓝布，边上缝着一圈回纹针脚。',key:1,q:0},
  qh_nanchuang_xf:{name:'《南窗心法》',desc:'丙级心法，只是开头几层。村口老人手抄的一页：当年汉皋府牢里一个穿了琵琶骨的小伙学自同牢的大哥，雪夜躲进更房时传给了他。伤得越重，这口气越稳。入谷培养后才能修习。',key:1,q:1},
  qh_baijia_charm:{name:'百家平安符',desc:'佩饰。一村人一人缝一针缝成的平安符。挨上致命一击时保住 1 点气血，每场一次。',acc:1,fx:{},func:{lastStand:1},q:0}
 });
 if(typeof ICO!=='undefined')Object.assign(ICO,{mj_art_jh_jh:'虺',mj_art_gj_h1:'灰',qh_huiwen_cloth:'纹',qh_baijia_charm:'符',qh_nanchuang_xf:'窗'});

 // 包一层人物的“谈”：pick() 返回要接管时的处理函数，否则照旧
 function wrap(scene,id,pick){const n=SC[scene]?.npcs?.find(x=>x.id===id);if(!n)return;const base=n.act;n.act=async function(...a){const f=pick();return f?guarded(f):base.apply(this,a)}}

 // ── H1 北坡石洞 ──
 const cave=()=>state().cave;
 // 2026-10-28 用户：石洞剧情先不启动，等后面设计时再回来补（化用原则见设计稿第 10 节）。台词、插画、洞口图都留着，打开 CAVE_ON 即恢复。
 const CAVE_ON=false;
 // 村口老人一处入口，H1、H2 按先后接：头一回闲谈提石洞（H1）；换个时段替他找旧梆子、听刀痕旧事（H2 第二回，第一回是第一夜送药）；再换个时段、第二天下午起陪他守一夜（第三回）
 const elder=()=>state().elder;
 wrap('qihe_trial','elder',()=>{if(!days())return null;const e=elder();
  if(CAVE_ON&&!cave().heard)return async()=>{await play('qh_hid_elder_cave');cave().heard=true;e.at=half()};
  if(S.prologue?.errands?.medicine!=='done'||e.taught||e.at===half())return null;
  // 2026-10-29 逻辑排查：推辞（“改天吧”“今晚不成”）也记下这个半日，同一个半日再进门不再马上又问
  if(!e.veg)return async()=>{if(await play('qh_hid_elder_veg')==='help')e.veg=true;e.at=half()};
  if(half()<3)return null;
  return async()=>{if(await play('qh_hid_elder_watch')!=='stay'){e.at=half();return}await play('qh_hid_elder_night');e.taught=true;await gain({qh_nanchuang_xf:1})}});
 if(CAVE_ON){wrap('prologue_chen_hall','chen',()=>days()&&cave().heard&&!cave().done&&!cave().rope&&!has('qh_rope')&&(async()=>{
  const a=await play('qh_hid_chen_rope');cave().rope=true;cave().told=a==='told';await gain({qh_rope:1})}));
 const light=()=>has('qh_tinder')||has('qh_storm_lantern');
 const mouth=X.add('north','hid-cave','北坡石洞',null,[640,205],()=>guarded(async()=>{const c=cave();
  if(c.done)return play('qh_hid_cave_look');
  if(!c.heard)return play('qh_hid_cave_look');
  if(!has('qh_rope')||!light())return play('qh_hid_cave_need',{need_rope:!has('qh_rope'),need_light:!light()});
  const a=await play('qh_hid_cave',{told:!!c.told,coat:owns('qh_song_coat')});if(a==='leave')return;
  c.done=true;c.cubs=a==='scare'?'scare':'around';state().flags.hint_huiwen_cave=true;
  exp(40);await gain({mj_art_jh_jh:1,qh_huiwen_cloth:1})}),beforeFire);
 Object.assign(mouth,{prop:'prop_qh_north_cave_mouth_20261028',block:[56,22]});
 ASSETS.push('prop_qh_north_cave_mouth_20261028','cg_qh_north_cave_20261028');}

 // ── H3 帮众的挑衅（2026-10-29 新版：和归烬堂新人阿炭切磋，评审台第二十六轮第 2 题）──
 // 第一次跟帮众说话仍是他原来那句（L5-05）；第二次木桩挨骂；第三次帮众逼新来的和萧白比划，输了可再来。
 // 赢了拿到阿炭的《扬灰手》，余波三选一（找阿炭：还给他／自己留着；找岑霜：卖给她），选定不改，后果都是实际数值（R-剧情-08 第 6 条）。
 // 存档 bandit：{talks, won, decided:'return'|'keep'|'sell'|旧档'give'}。旧版“交给岑霜加信任”（decided='give'、flags.cen_trust_book）作废，旧档照旧留着不追扣。
 const bandit=()=>state().bandit;
 const tabBusy=()=>S.qiheTown?.tab?.stage==='offered';   // 正在谈酒钱时不插进来（js/qihe-town.js）
 const bookState=()=>{const b=bandit();return b.decided==='give'?'sell':b.decided||(b.won?'won':'')};
 const bond=(id,d)=>{try{return QiheNpc.bond.add(id,d,{story:true,reason:'story'})}catch(e){console.error(e)}};
 // 对手档：和萧白差不多弱，数值随萧白等级（参照 qihe-chapter.js 陆衡对练的写法）；战斗图沿用归烬堂帮众（没给阿炭单出战斗动作）
 const atanFoe=()=>({name:'新来的 · 比划',sp:'c_qh_raider_front_v1',lv:Math.max(1,S.lv||1),st:{str:3,con:3,agi:3,wil:2,wis:2},skills:{fist:1},hpMul:.8,atkMul:.55,shield:2,weak:['棍'],h:150,exp:20,silver:0,drops:{}});
 async function banditFight(){
  const r=await battle({allowAuto:true,solo:true,noLose:true,foes:[atanFoe()]});
  if(r!=='win')return play('qh_hid_bandit_lose');
  bandit().won=true;await play('qh_hid_bandit_win');await gain({mj_art_gj_h1:1})}
 wrap('prologue_inn_interior','bandit',()=>{const b=bandit();if(tabBusy()||!beforeFire())return null;
  if(b.won)return async()=>{await play('qh_hid_bandit_done')};
  if(b.talks<1){b.talks=1;return null}   // 原来那句“看什么看？滚远点。”
  if(b.talks<2)return async()=>{b.talks=2;await play('qh_hid_bandit_2')};
  return async()=>{if(await play('qh_hid_bandit_3')==='fight')await banditFight()}});
 // 新来的（阿炭）站在帮众旁边；起火前都在客栈
 {const sc=SC.prologue_inn_interior,bd=sc?.npcs?.find(n=>n.id==='bandit');
  if(bd&&!sc.npcs.some(n=>n.id==='atan')){
   const n={...bd,id:'atan',name:'新来的',person:'atan',sp:'c_qh_atan',x:bd.x+1.15,y:bd.y+.15,dir:'l',act:()=>guarded(talkAtan)};
   Object.defineProperty(n,'name',{get:()=>S?.qiheHidden?.bandit?.decided==='return'?'阿炭':'新来的',enumerable:true});
   n.show=()=>beforeFire();sc.npcs.push(n)}}
 async function talkAtan(){const b=bandit(),st=bookState();
  const a=await play('qh_hid_atan',{book:st,named:b.decided==='return'});if(st!=='won')return;
  if(a==='return'&&has('mj_art_gj_h1')){S.bag.mj_art_gj_h1--;if(!S.bag.mj_art_gj_h1)delete S.bag.mj_art_gj_h1;b.decided='return';state().flags.qh_recruit_returned=true;bond('atan',8);toast('《扬灰手》还给了阿炭',1500)}
  else if(a==='keep'){b.decided='keep';bond('atan',-5)}}
 // 赢了册子、还没处置时去找岑霜：卖回给她是打她的脸（银两 +20，岑霜好感 −5，归烬堂声望 −3，阿炭回去挨罚 −10）；“不卖”不算处置，只问这一回
 for(const sc of ['qh_south','qh_east','qh_refuge'])wrap(sc,'censhuang',()=>bookState()==='won'&&has('mj_art_gj_h1')&&!bandit().cenAsked&&(async()=>{
  const a=await play('qh_hid_cen_book');bandit().cenAsked=true;
  if(a==='sell'){S.bag.mj_art_gj_h1--;if(!S.bag.mj_art_gj_h1)delete S.bag.mj_art_gj_h1;S.silver=(S.silver||0)+20;bandit().decided='sell';toast('银两 +20',1400);
   bond('censhuang',-5);bond('atan',-10);try{QiheJianghu.settle('story',{faction:{guijintang:-3},fame:0})}catch(e){console.error(e)}}}));

 // ── H7 认得全村的人：起火前替这六人各做过一件事（跑腿、帮忙、借东西都算），撤离当晚在邻村由周婶给 ──
 const stageOf=k=>S.prologue?.outsiders?.quests?.[k]?.stage;
 const past=(k,...not)=>{const s=stageOf(k);return!!s&&![undefined,'none','offered','accepted',...not].includes(s)};
 function villageDeeds(){const e=S.prologue?.errands||{},c=CP()?.choices||{},t=S.qiheTown||{};
  return{
   周婶:['bowls','cloth','medicine'].some(k=>e[k]==='done')||!!c.clinic,
   陈伯:e.bowls==='done'||t.pole?.stage==='done'||past('letter'),
   店家:e.cloth==='done'||t.tab?.stage==='done',
   药商:!!c.market||past('account'),
   村口老人:e.medicine==='done',
   差役:past('ledger','checked')}}
 wrap('qh_refuge','aunt',()=>{const v=state().village;if(v.given||!Object.values(villageDeeds()).every(Boolean))return null;
  return async()=>{await play('qh_hid_village_charm');v.given=true;await gain({qh_baijia_charm:1})}});

 window.QiheHidden={state,villageDeeds};
})();
