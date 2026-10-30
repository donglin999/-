'use strict';
// 赠礼、赔礼、易物的规则引擎（2026-10-26 开发二）。界面在 js/qihe-gift-ui.js，台词在 ink（story/01-开始/人物-收礼与易物.ink）。
// 依据：../xiaojianghu/docs/design/npc-gifts-and-inventory.md 第 2.2、3.1、3.3、3.5、3.6、3.6.1、3.7 节与第 6.2 节逐人喜好；
//       ../xiaojianghu/docs/design/npc-interaction-v2.md 第 2.3 节（易物定稿做法：照大侠立志传）；第 11 节随身物品 v2（易物只换随身物，商店货只走买卖）。
// 存档：S.qiheGift = {version, slots:{<人>:<时段>}, given:{<人>:{<物品>:次数}}, known:{<人>:{<类别>:'xi'|'ke'|'meh'|'no'}}, returned:{<人>:true}, stock:{<人>:{<物品>:数}}, stockVer:2}
//       关系值仍记在 S.qiheBond（QiheNpc.bond），这里不另存。
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;
 const Q=()=>window.QiheNpc;

 // ── 物品的类别与价值档（赠礼稿第 3.3、3.5 节）。只有这里列出的才进赠礼行囊；剧情物、任务用具、借来的不列。
 //    tier：1 寻常 +2｜2 像样 +4｜3 厚礼 +6。价钱取运行时 ITEMS.price（采集物没有价，按 1～2 两算）。
 const GOODS={
  bun:{tag:'食'},wine:{tag:'酒'},pill:{tag:'药品'},
  qh_wild_herb:{tag:'药材',value:2},qh_dry_branch:{tag:'柴草',value:1},qh_river_reed:{tag:'柴草',value:1},
  club:{tag:'兵甲'},knife:{tag:'兵甲'},cloth:{tag:'兵甲'},vest:{tag:'兵甲'},mianjia:{tag:'兵甲'},
  charm:{tag:'饰物'},collar:{tag:'饰物'},jade:{tag:'饰物'},qh_song_abacus:{tag:'饰物'},
  pelt:{tag:'皮货'},
  // 2026-10-27 随身物品 v2（赠礼稿第 11 节）：器用、新物品补进来（第 3.5 节表里早有，运行时物品这次才齐）
  qh_rope:{tag:'器用'},qh_tinder:{tag:'器用'},qh_sewing_kit:{tag:'器用'},qh_iron_chain:{tag:'器用'},qh_medical_kit:{tag:'器用'},
  qh_ration:{tag:'食'},qh_fried_rice:{tag:'食'},qh_candy:{tag:'食'},
  qh_hand_wrap:{tag:'兵甲'},qh_hidden_dagger:{tag:'兵甲'},qh_herb_pouch:{tag:'饰物'}
 };
 const priceOf=id=>GOODS[id]?.value??(typeof ITEMS!=='undefined'?ITEMS[id]?.price:null)??1;
 function tierOf(id){const it=typeof ITEMS!=='undefined'?ITEMS[id]:null,p=priceOf(id);
  if(it&&(it.weapon||it.armor||it.acc)&&/[丙乙甲绝]/.test(it.grade||''))return 3;
  if(GOODS[id]?.value!=null)return 1;return p>=50?3:p>=20?2:1}
 const TIER_NAME=['','寻常','像样','厚礼'],TIER_SCORE=[0,2,4,6];

 // ── 逐人喜好（赠礼稿第 6.2 节，逐字照稿）。xi 喜｜ke 可收（all＝一切）｜no 不收；noHeavy 不收厚礼；heavyBonus 厚礼另加；noLine 婉拒小签
 const LIKES={
  ye:{xi:['药材'],ke:['食','器用','药品','书'],no:['酒','兵甲'],noHeavy:true},
  aunt:{xi:['柴草','器用'],ke:['食','药材'],no:['酒','兵甲']},
  chen:{xi:['酒'],ke:['食','柴草','器用'],no:['饰物']},
  elder:{xi:['食'],ke:['药品','柴草'],no:['兵甲','酒']},
  innkeeper:{xi:['柴草'],ke:['食','酒','皮货'],no:['兵甲']},
  apothecary:{xi:['药材'],ke:['皮货','柴草'],no:['食']},
  bailiff:{xi:['酒'],ke:['食'],no:['书'],noHeavy:true},
  aide:{xi:['酒'],ke:'all',no:[],heavyBonus:2},
  retainer:{xi:['药品','书'],ke:['食'],no:['饰物','酒']},
  bandit:{xi:['酒'],ke:['食','书'],no:['药材']},
  atan:{xi:['食'],ke:['药品'],no:['酒'],noHeavy:true},   // 2026-10-29 阿炭：饿怕了的穷小子，吃的最实在；不碰酒（给帮众倒酒倒怕了）
  xulingyi:{xi:['饰物','书'],ke:['食','药品','兵甲'],no:['酒']},
  censhuang:{xi:['饰物','酒'],ke:['食','书'],no:['兵甲','药材']},
  shenyanhui:{xi:['药材'],ke:['食','药品','书'],no:['饰物']},
  luheng:{xi:['食'],ke:['器用','药品','书'],no:['饰物'],noHeavy:true},
  zhouyan:{xi:['器用'],ke:['食','药材'],no:['书'],noHeavy:true},
  song:{xi:['饰物'],ke:'all',no:[],noReturn:true},
  // 2026-10-27 新上图六人（用户第二十轮 19：“礼”能用但气泡是空的）：喜好按身份推，台词在 story/01-开始/人物-收礼与易物.ink，等剧情评审
  boatman:{xi:['酒'],ke:['食','器用'],no:['饰物']},
  peddler:{xi:['皮货','器用'],ke:['食','酒','药材','柴草'],no:[]},
  aqi:{xi:['食'],ke:'all',no:[],noReturn:true},
  ashuan:{xi:['食'],ke:['器用','饰物'],no:['酒','兵甲'],noReturn:true},
  xiaohe:{xi:['饰物'],ke:['食'],no:['酒','兵甲'],noReturn:true},
  fortune:{xi:['书'],ke:'all',no:[],noReturn:true}
 };
 // 特殊人物卡在 19 时才露出的一句“再要熟络：……”（赠礼稿第 3.1、3.2 节，只是那一步的梗概）
 const UNLOCK_HINT={ye:'去药棚帮她分一回药',luheng:'跟他修一辆车、认一回路',xulingyi:'替她把那封拜帖送到陈伯那里问一句',censhuang:'替她去药商那里对一回旧货账',shenyanhui:'替她把采办单的三篓药对清',song:'替他把进村的人说一回'};

 function state(){const g=S.qiheGift||(S.qiheGift={version:1});g.slots||={};g.given||={};g.known||={};g.returned||={};g.stock||={};return g}
 const pronoun=p=>p.she?'她':'他';

 // ── 行囊里能送的东西（数量、类别、价值档、对这个人已知的态度）
 function bagFor(p){const g=state(),known=g.known[p.id]||{},out=[];
  for(const [id,n] of Object.entries(S.bag||{})){if(!(n>0)||!GOODS[id]||typeof ITEMS==='undefined'||!ITEMS[id])continue;
   out.push({id,n,name:ITEMS[id].name,tag:GOODS[id].tag,tier:tierOf(id),known:known[GOODS[id].tag]||null})}
  return out.sort((a,b)=>(b.known==='xi')-(a.known==='xi')||b.tier-a.tier)}
 // 对方怎么反应（赠礼稿第 3.3 节四种反应＋连送递减＋负向只收赔礼）
 function judge(p,id){const L=LIKES[p.id]||{xi:[],ke:'all',no:[]},tag=GOODS[id].tag,tier=tierOf(id),b=Q().bond.get(p.id),times=state().given[p.id]?.[id]||0;
  const amends=b.score<0;
  if(b.hostile||b.stage==='仇视')return{kind:'hostile',score:0,keep:true};
  if(L.no.includes(tag)||(L.noHeavy&&tier===3))return{kind:amends?'amend-no':'no',score:0,keep:true,why:L.no.includes(tag)?'no':'heavy'};
  const xi=L.xi.includes(tag),ke=L.ke==='all'||L.ke.includes(tag);
  if(amends&&!(xi||tier===3))return{kind:'amend-no',score:0,keep:true,why:'cheap'};
  let s=TIER_SCORE[tier]*(xi?2:ke?1:0);if(ke&&tier===3&&L.heavyBonus)s+=L.heavyBonus;
  const decay=times===0?1:times===1?.5:0;s=Math.round(s*decay);
  const kind=amends?'amend-ok':times>=2?'again':xi?'xi':ke?'ke':'meh';
  // 2026-10-29 逻辑排查：台词说“不必再送”，重复送的东西退回行囊、不扣（和婉拒一样）
  return{kind,score:s,keep:kind==='again',xi,ke,tag,tier,amends}}
 // 只预告已知他喜欢的这一类（第十四轮第 3 题）
 function preview(p,id){const tag=GOODS[id].tag,known=state().known[p.id]?.[tag];if(known!=='xi')return null;const j=judge(p,id);if(j.keep)return null;
  const b=Q().bond.get(p.id);return j.amends?{text:`${b.stage} ${b.score} → 约 ${Math.min(0,b.score+j.score)}`}:{text:`送了好感约 ＋${j.score}`}}
 // 送出：扣行囊、加关系、记次数与已知态度；不收的不扣
 // 2026-10-27 用户：一个时段不设送礼次数——不再限每人每时段一次，同一件东西连送靠 judge 的递减（第二件减半、第三件起不加）收住
 function give(p,id){const j=judge(p,id),g=state();
  if(!j.keep){S.bag[id]--;if(S.bag[id]<=0)delete S.bag[id];(g.given[p.id]||={})[id]=(g.given[p.id][id]||0)+1}
  const tag=GOODS[id].tag,known=(g.known[p.id]||={}),firstKnown=!known[tag]&&(j.kind==='xi'||j.kind==='no');
  if(j.kind==='xi'||j.kind==='amend-ok'&&j.xi)known[tag]='xi';else if(j.kind==='no'||j.kind==='amend-no'&&j.why==='no')known[tag]='no';else if(!j.keep&&!known[tag])known[tag]=j.ke?'ke':'meh';
  const before=Q().bond.get(p.id);let r={before:before.score,after:before.score,stage:before.stage};
  if(j.score>0)r=Q().bond.add(p.id,j.score,{amends:!!j.amends,reason:j.amends?'amends':'gift'});   // 原因给关系页、提示用
  // 熟络后第一次收礼回赠一件随身物（第 3.7 节；宋先生没有回礼）
  let ret=null;if(!j.keep&&r.after>=20&&!g.returned[p.id]&&!LIKES[p.id]?.noReturn){ret=returnGift(p);if(ret)g.returned[p.id]=true}
  try{QihePrologue.checkpoint()}catch(e){try{window.save?.()}catch(_){}}
  return{...j,id,name:ITEMS[id].name,before:r.before,after:r.after,stageBefore:before.stage,stage:r.stage,firstKnown:firstKnown?tag:null,returned:ret}}
 const givenTo=p=>Object.values(state().given[p.id]||{}).reduce((a,n)=>a+n,0);
 function returnGift(p){const ok=it=>!(!it.id||(it.c&&it.c!=='普')||it.money||it.use==='任'||typeof ITEMS==='undefined'||!ITEMS[it.id]||!live(it));   // 随身物品 v2：先挑表上标 ret 的那件（赠礼稿第 11.3 节“回”栏）
  const it=(p.bag||[]).find(x=>x.ret&&ok(x))||(p.bag||[]).find(ok);if(!it)return null;S.bag[it.id]=(S.bag[it.id]||0)+1;return{id:it.id,name:ITEMS[it.id].name}}

 // ── 人物卡上“关系能换来什么”（赠礼稿第 2.2、3.7 节，按人取开始部分用得上的格）
 function perks(p){const t=Q().teachState?.(p),sp=Q().sparState?.(p),canTeach=!!p.teach,canSpar=!!p.spar&&!p.civilian&&!sp?.hidden,trade=!!p.trade;
  const verbs=[trade&&'易物',canTeach&&'请教',canSpar&&'切磋'].filter(Boolean);const he=pronoun(p);
  const rows=[];
  rows.push({tier:'初识',min:0,text:verbs.length?`照常跟${he}${verbs.join('、')}`:`照常收礼、托事`});
  if(trade)rows.push({tier:'熟络',min:20,text:'易物九折'});else if(p.barter)rows.push({tier:'熟络',min:20,text:`肯拿身上的东西跟你换`});
  if(!LIKES[p.id]?.noReturn)rows.push({tier:'熟络',min:20,text:`${he}回赠一件随身带的东西（只一次）`});
  const cold=[trade&&'易物贵两成',canTeach&&'不肯指点你'].filter(Boolean);rows.push({tier:'冷淡',min:-19,max:-1,text:cold.length?cold.join('，'):'收礼照常，话少了'});
  const bad=[trade&&'不跟你换东西',canSpar&&'不切磋','也不托你办事'].filter(Boolean);rows.push({tier:'厌恶',min:-49,max:-20,text:bad.join('、').replace('、也','，也')});
  return rows}
 function hint(p){const b=Q().bond.get(p.id);if(b.score<0)return b.stage==='仇视'?'要请中人说和':'赔礼最多回到 0（初识）';
  if(p.special&&!b.unlocked&&b.score>=19&&UNLOCK_HINT[p.id])return'再要熟络：'+UNLOCK_HINT[p.id];return''}

 // ── 易物（定稿做法照大侠立志传：两边放东西，秤按价值倾斜，对方一句心情话，不报数）
 // 随身物品 v2（赠礼稿第 11 节）：对方秤上只有他“随身物”里肯换的东西；商店货（js/qihe-npc-items.js 的 SHOPS）只走买卖，不上秤。
 const live=it=>(!it.when||Q().test(it.when))&&!(it.until&&Q().test(it.until));
 const shopIds=p=>window.QIHE_NPC_ITEMS?.shopIds?.(p.shop?p.id:'')||[];
 // 能不能拿来换：普通随身物、有运行时物品、不是钱、不是任务用具、没标 swap:false、不是他自己店里卖的货
 function canSwap(p,it){return!!(it&&it.id&&!it.money&&(!it.c||it.c==='普')&&it.use!=='任'&&it.swap!==false&&typeof ITEMS!=='undefined'&&ITEMS[it.id]&&!shopIds(p).includes(it.id))}
 const stolen=(p,it)=>!!S.steal?.taken?.[p.id]?.[it.id||it.n];
 // “易”能不能用：功能人物（trade）初识就换；寻常人（barter）熟络才换（大侠立志传：寻常人亲密度 20 才易物）；厌恶以下不换
 function barterState(p){if(!p.trade&&!p.barter)return{hidden:true};const b=Q().bond.get(p.id);
  if(['厌恶','仇视'].includes(b.stage))return{off:true,note:BOND_NOTE[b.stage]};
  if(!p.trade&&b.score<20)return{off:true,note:'熟络之后才肯换'};
  return{off:false}}
 const BOND_NOTE={厌恶:'他厌恶你',仇视:'已成仇'};
 const STOCK_VER=2;   // 2026-10-27：v1 存档里店家的秤上混着商店货，换版重算
 function stockOf(p){const g=state();if(g.stockVer!==STOCK_VER){g.stock={};g.stockVer=STOCK_VER}
  if(!g.stock[p.id]){const s={};for(const it of p.bag||[]){if(!canSwap(p,it)||!live(it)||stolen(p,it))continue;s[it.id]=(s[it.id]||0)+(it.q||1)}g.stock[p.id]=s}
  return g.stock[p.id]}
 function tradeRate(p){const st=Q().bond.get(p.id).stage,own=st==='冷淡'?1.2:p.trade&&(st==='熟络'||st==='信赖'||st==='托付')?.9:1;   /* 九折只算功能人物（第 3.7 节）；寻常人熟络才肯换，不另打折 */return Math.max(own,window.QiheJianghu?.priceMul?.(p.id)||own)}   // 2026-10-27 个人、门派、声誉取较差一档（faction-reputation.md 7.2）
 function accepts(p,id){const L=LIKES[p.id];if(!GOODS[id]&&!(typeof ITEMS!=='undefined'&&ITEMS[id]))return false;const tag=GOODS[id]?.tag;return!(L&&tag&&L.no.includes(tag))}
 function valueOf(list,mult=1){return list.reduce((a,[id,k])=>a+priceOf(id)*k*mult,0)}
 function mood(p,mine,theirs){const a=valueOf(mine),b=valueOf(theirs,tradeRate(p));
  if(!a&&!b)return'look';if(!b)return'ask';if(!a)return'want';if(a>=b*1.25)return'over';if(a>=b*.95)return'ok';if(a>=b*.7)return'near';return'far'}
 function dealOk(p,mine,theirs){const a=valueOf(mine),b=valueOf(theirs,tradeRate(p));return a>0&&b>0&&a>=b*.95}
 function deal(p,mine,theirs){if(!dealOk(p,mine,theirs))return false;const s=stockOf(p);
  for(const [id,k] of mine){S.bag[id]-=k;if(S.bag[id]<=0)delete S.bag[id];s[id]=(s[id]||0)+k}
  for(const [id,k] of theirs){s[id]-=k;if(s[id]<=0){delete s[id];const it=(p.bag||[]).find(x=>x.id===id);if(it){const st=S.steal||(S.steal={version:1});((st.taken||={})[p.id]||={})[id]=true}}S.bag[id]=(S.bag[id]||0)+k}   // 换光了的随身物，偷窃清单里也不再有
  try{QihePrologue.checkpoint()}catch(e){try{window.save?.()}catch(_){}}return true}

 // ── 台词：从 ink 里取一句（不演出，只拿文字放进面板气泡）
 // 剧本编译物 js/story-data/qh_gift_line.js（两个 knot 同在一份）按需加载：剧本待用户过目、构建未出包前没有这份文件，面板气泡就留空
 let loading=null;const loadOne=f=>new Promise(r=>{const sc=document.createElement('script');sc.src='js/story-data/'+f+'.js';sc.onload=()=>r(true);sc.onerror=()=>r(false);document.head.appendChild(sc)});
 function ensureLines(){if(window.STORY_DATA?.qh_gift_line&&window.STORY_DATA?.qh_gift_line_more)return Promise.resolve(true);if(loading)return loading;
  return loading=Promise.all([window.STORY_DATA?.qh_gift_line||loadOne('qh_gift_line'),window.STORY_DATA?.qh_gift_line_more||loadOne('qh_gift_line_more')])}
 // 2026-10-27 已批准的《人物-收礼与易物》里没有这个人的句子，再查《人物-收礼与易物-补》（knot 名加 _more）
 async function lineFor(knot,vars){await ensureLines();if(!window.StoryRuntime)return null;
  for(const k of [knot,knot+'_more']){if(!window.STORY_DATA?.[k])continue;let got=null;
   try{await StoryRuntime.play(k,{vars,line:(id,who,text)=>{if(!got)got={id,who,text}}})}catch(e){console.warn('取台词失败',k,e)}if(got)return got}
  return null}

 window.QiheGift={canSwap,barterState,GOODS,LIKES,TIER_NAME,state,bagFor,judge,preview,give,givenTo,perks,hint,tierOf,priceOf,stockOf,tradeRate,accepts,valueOf,mood,dealOk,deal,lineFor};
})();
