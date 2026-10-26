'use strict';
// 赠礼、赔礼、易物的规则引擎（2026-10-26 开发二）。界面在 js/qihe-gift-ui.js，台词在 ink（story/01-开始/人物-收礼与易物.ink）。
// 依据：../xiaojianghu/docs/design/npc-gifts-and-inventory.md 第 2.2、3.1、3.3、3.5、3.6、3.6.1、3.7 节与第 6.2 节逐人喜好；
//       ../xiaojianghu/docs/design/npc-interaction-v2.md 第 2.3 节（易物定稿做法：照大侠立志传）。
// 存档：S.qiheGift = {version, slots:{<人>:<时段>}, given:{<人>:{<物品>:次数}}, known:{<人>:{<类别>:'xi'|'ke'|'meh'|'no'}}, returned:{<人>:true}, stock:{<人>:{<物品>:数}}}
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
  pelt:{tag:'皮货'}
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
  xulingyi:{xi:['饰物','书'],ke:['食','药品','兵甲'],no:['酒']},
  censhuang:{xi:['饰物','酒'],ke:['食','书'],no:['兵甲','药材']},
  shenyanhui:{xi:['药材'],ke:['食','药品','书'],no:['饰物']},
  luheng:{xi:['食'],ke:['器用','药品','书'],no:['饰物'],noHeavy:true},
  zhouyan:{xi:['器用'],ke:['食','药材'],no:['书'],noHeavy:true},
  song:{xi:['饰物'],ke:'all',no:[],noReturn:true}
 };
 // 特殊人物卡在 19 时才露出的一句“再要熟络：……”（赠礼稿第 3.1、3.2 节，只是那一步的梗概）
 const UNLOCK_HINT={ye:'去药棚帮她分一回药',luheng:'跟他修一辆车、认一回路',xulingyi:'替她把那封拜帖送到陈伯那里问一句',censhuang:'替她去药商那里对一回旧货账',shenyanhui:'替她把采办单的三篓药对清',song:'替他把进村的人说一回'};

 function state(){const g=S.qiheGift||(S.qiheGift={version:1});g.slots||={};g.given||={};g.known||={};g.returned||={};g.stock||={};return g}
 const slot=()=>Q().slot();
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
  return{kind,score:s,keep:false,xi,ke,tag,tier,amends}}
 // 只预告已知他喜欢的这一类（第十四轮第 3 题）
 function preview(p,id){const tag=GOODS[id].tag,known=state().known[p.id]?.[tag];if(known!=='xi')return null;const j=judge(p,id);if(j.keep)return null;
  const b=Q().bond.get(p.id);return j.amends?{text:`${b.stage} ${b.score} → 约 ${Math.min(0,b.score+j.score)}`}:{text:`送了好感约 ＋${j.score}`}}
 const usedThisSlot=p=>state().slots[p.id]===slot();
 // 送出：扣行囊、加关系、记次数与已知态度；不收的不扣、不占次数
 function give(p,id){if(usedThisSlot(p))return{kind:'used'};const j=judge(p,id),g=state();
  if(!j.keep){S.bag[id]--;if(S.bag[id]<=0)delete S.bag[id];g.slots[p.id]=slot();(g.given[p.id]||={})[id]=(g.given[p.id][id]||0)+1}
  const tag=GOODS[id].tag,known=(g.known[p.id]||={}),firstKnown=!known[tag]&&(j.kind==='xi'||j.kind==='no');
  if(j.kind==='xi'||j.kind==='amend-ok'&&j.xi)known[tag]='xi';else if(j.kind==='no'||j.kind==='amend-no'&&j.why==='no')known[tag]='no';else if(!j.keep&&!known[tag])known[tag]=j.ke?'ke':'meh';
  const before=Q().bond.get(p.id);let r={before:before.score,after:before.score,stage:before.stage};
  if(j.score>0)r=Q().bond.add(p.id,j.score,{amends:!!j.amends});
  // 熟络后第一次收礼回赠一件随身物（第 3.7 节；宋先生没有回礼）
  let ret=null;if(!j.keep&&r.after>=20&&!g.returned[p.id]&&!LIKES[p.id]?.noReturn){ret=returnGift(p);if(ret)g.returned[p.id]=true}
  try{QihePrologue.checkpoint()}catch(e){try{window.save?.()}catch(_){}}
  return{...j,id,name:ITEMS[id].name,before:r.before,after:r.after,stageBefore:before.stage,stage:r.stage,firstKnown:firstKnown?tag:null,returned:ret}}
 function returnGift(p){for(const it of p.bag||[]){if(!it.id||it.c||it.money||typeof ITEMS==='undefined'||!ITEMS[it.id])continue;if(it.when&&!Q().test(it.when))continue;S.bag[it.id]=(S.bag[it.id]||0)+1;return{id:it.id,name:ITEMS[it.id].name}}return null}

 // ── 人物卡上“关系能换来什么”（赠礼稿第 2.2、3.7 节，按人取开始部分用得上的格）
 function perks(p){const t=Q().teachState?.(p),sp=Q().sparState?.(p),canTeach=!!p.teach,canSpar=!!p.spar&&!p.civilian&&!sp?.hidden,trade=!!p.trade;
  const verbs=[trade&&'易物',canTeach&&'请教',canSpar&&'切磋'].filter(Boolean);const he=pronoun(p);
  const rows=[];
  rows.push({tier:'初识',min:0,text:verbs.length?`照常跟${he}${verbs.join('、')}`:`照常收礼、托事`});
  if(trade)rows.push({tier:'熟络',min:20,text:'易物九折'});
  if(!LIKES[p.id]?.noReturn)rows.push({tier:'熟络',min:20,text:`${he}回赠一件随身带的东西（只一次）`});
  const cold=[trade&&'易物贵两成',canTeach&&'不肯指点你'].filter(Boolean);rows.push({tier:'冷淡',min:-19,max:-1,text:cold.length?cold.join('，'):'收礼照常，话少了'});
  const bad=[trade&&'不跟你换东西',canSpar&&'不切磋','也不托你办事'].filter(Boolean);rows.push({tier:'厌恶',min:-49,max:-20,text:bad.join('、').replace('、也','，也')});
  return rows}
 function hint(p){const b=Q().bond.get(p.id);if(b.score<0)return b.stage==='仇视'?'要请中人说和':'赔礼最多回到 0（初识）';
  if(p.special&&!b.unlocked&&b.score>=19&&UNLOCK_HINT[p.id])return'再要熟络：'+UNLOCK_HINT[p.id];return''}

 // ── 易物（定稿做法照大侠立志传：两边放东西，秤按价值倾斜，对方一句心情话，不报数）
 function stockOf(p){const g=state();if(!g.stock[p.id]){const s={};for(const it of p.bag||[]){if(!it.id||it.c||it.money||typeof ITEMS==='undefined'||!ITEMS[it.id])continue;s[it.id]=(s[it.id]||0)+(it.q||1)}
   if(p.id==='innkeeper')for(const id of ['club','cloth','needles','charm','knife','mianjia'])s[id]=s[id]||1/* 店家货架＝js/qihe-chapter.js 的 STARTER_STOCK（赠礼稿第 6.2 节店家一行） */;g.stock[p.id]=s}return g.stock[p.id]}
 function tradeRate(p){const st=Q().bond.get(p.id).stage;return st==='冷淡'?1.2:st==='熟络'||st==='信赖'||st==='托付'?.9:1}
 function accepts(p,id){const L=LIKES[p.id];if(!GOODS[id]&&!(typeof ITEMS!=='undefined'&&ITEMS[id]))return false;const tag=GOODS[id]?.tag;return!(L&&tag&&L.no.includes(tag))}
 function valueOf(list,mult=1){return list.reduce((a,[id,k])=>a+priceOf(id)*k*mult,0)}
 function mood(p,mine,theirs){const a=valueOf(mine),b=valueOf(theirs,tradeRate(p));
  if(!a&&!b)return'look';if(!b)return'ask';if(!a)return'want';if(a>=b*1.25)return'over';if(a>=b*.95)return'ok';if(a>=b*.7)return'near';return'far'}
 function dealOk(p,mine,theirs){const a=valueOf(mine),b=valueOf(theirs,tradeRate(p));return a>0&&b>0&&a>=b*.95}
 function deal(p,mine,theirs){if(!dealOk(p,mine,theirs))return false;const s=stockOf(p);
  for(const [id,k] of mine){S.bag[id]-=k;if(S.bag[id]<=0)delete S.bag[id];s[id]=(s[id]||0)+k}
  for(const [id,k] of theirs){s[id]-=k;if(s[id]<=0)delete s[id];S.bag[id]=(S.bag[id]||0)+k}
  try{QihePrologue.checkpoint()}catch(e){try{window.save?.()}catch(_){}}return true}

 // ── 台词：从 ink 里取一句（不演出，只拿文字放进面板气泡）
 // 剧本编译物 js/story-data/qh_gift_line.js（两个 knot 同在一份）按需加载：剧本待用户过目、构建未出包前没有这份文件，面板气泡就留空
 let loading=null;function ensureLines(){if(window.STORY_DATA?.qh_gift_line)return Promise.resolve(true);if(loading)return loading;
  return loading=new Promise(r=>{const sc=document.createElement('script');sc.src='js/story-data/qh_gift_line.js';sc.onload=()=>r(true);sc.onerror=()=>r(false);document.head.appendChild(sc)})}
 async function lineFor(knot,vars){await ensureLines();if(!window.StoryRuntime||!window.STORY_DATA?.[knot])return null;let got=null;
  try{await StoryRuntime.play(knot,{vars,line:(id,who,text)=>{if(!got)got={id,who,text}}})}catch(e){console.warn('取台词失败',knot,e)}return got}

 window.QiheGift={GOODS,LIKES,TIER_NAME,state,bagFor,judge,preview,give,usedThisSlot,perks,hint,tierOf,priceOf,stockOf,tradeRate,accepts,valueOf,mood,dealOk,deal,lineFor};
})();
