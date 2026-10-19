'use strict';
// Jianghu UI authority: pure snapshots and storage-first commands. Never mutate S to preview.
(()=>{
 if(!isQiheEntry())return;
 MN_SECT.guiyun='归云谷';
 const copy=x=>JSON.parse(JSON.stringify(x)), unique=a=>[...new Set(a)], human=id=>id==='hero'||(!!PARTY_DEF[id]&&!PET_DEF[id]);
 const names={weapon:'兵器',armor:'护具',acc:'佩饰'}, keys=['str','con','agi','wil','wis'];
 const rec=(s,id)=>id==='hero'?s:s.mates[id], eq=(s,id)=>id==='hero'?s:rec(s,id).equip;
 function normalize(source){
  const s=copy(source);s.party||=[];s.mates||={};s.bag||={};s.skills||={fist:1};s.pts||=0;
  const old=s.qiheRoster, all=unique(['hero',...(old?.members||[]),...s.party]);
  // A formal first-chapter companion; prologue guests must not become recruits.
  if(s.qiheChapter&&s.qiheChapter.stage!=='opening'&&!all.includes('ye'))all.push('ye');
  s.qiheRoster={version:1,members:all,availability:{...(old?.availability||{})},revision:old?.revision||0,commands:old?.commands||[]};
  if(!old&&s.party.includes('dog'))s.pet||='dog';
  if(s.pet&&PET_DEF[s.pet]){s.pets||={};const prior=s.mates[s.pet],def=PARTY_DEF[s.pet],p=s.pets[s.pet]||={st:{...(prior?.st||def.st)},lvSeen:prior?.lvSeen||1,hp:prior?.hp??null,mp:prior?.mp??null,equip:{acc:prior?.equip?.acc||null}};const gained=Math.max(0,(s.lv||1)-(p.lvSeen||1)),points=(prior?.pts||0)+gained*3,growth=PET_DEF[s.pet].growth;for(let i=0;i<points;i++)p.st[growth[i%growth.length]]++;p.lvSeen=Math.max(p.lvSeen||1,s.lv||1);if(gained){p.hp=null;p.mp=null}delete s.mates[s.pet];}
  s.party=unique(s.party.filter(id=>human(id)&&id!=='hero'&&(s.qiheRoster.availability[id]||'present')==='present')).slice(0,3);
  if(s.qiheChapter&&s.qiheChapter.stage!=='opening'&&!old&&!s.party.includes('ye')&&s.party.length<3)s.party.push('ye');
  if(s.qiheChapter?.stage==='cultivation'){s.chapter=Math.max(2,s.chapter||1);s.sect||='guiyun'}
  for(const id of all.filter(human)){
   if(id!=='hero'){const p=PARTY_DEF[id];s.mates[id]||={st:{...p.st},pts:0,lv:id==='ye'?3:(p.initialLevel||1),exp:0,lvSeen:1,equip:{weapon:null,armor:null,acc:null},skills:Object.fromEntries(p.skills.map(k=>[k,1])),hp:null,mp:null,mpBonus:0};}
   const r=rec(s,id);if(id!=='hero')r.equip||={weapon:null,armor:null,acc:null};r.st||={str:3,con:3,agi:3,wil:3,wis:3};r.skills||={};r.prof||={};r.pts||=0;const origin=id==='hero'?s.origin:id;r.zy||=Object.fromEntries(MN_ZY.map(k=>[k,MN_ZY0[origin]?.[k]||0]));r.ji||={yi:0,du:0,shi:0,...(MN_JI0[origin]||{})};
   if(id!=='hero'&&window.CharacterGrowth)CharacterGrowth.ensure(r,id);
   const x=r.xinfa||={};x.main||=null;x.subs||=[];x.known||=[];x.lv||={};x.prog||={};x.unstable||=0;
   if((s.chapter||1)>=2&&!mnDef(id).noXf&&!(id==='hero'&&!s.cultivation?.learned.breathing)){for(const k of ['tuna',...(id==='suzhi'?['bx_xin']:[])]){if(!x.known.includes(k))x.known.push(k);x.lv[k]||=1}x.main||=id==='suzhi'?'bx_xin':'tuna'}
  }
  if(s.cultivation&&window.CultivationCore)CultivationCore.reconcileWorld(s);if(window.SharedInsightPool)SharedInsightPool.sync(s);s.virtue||={ren:(s.moral||10)-10,yi:0,xin:0,yong:0};return s;
 }
 function poolOptions(s,id){
  if(!available(s,id))return[];const r=rec(s,id),out=[],seen=new Set();
  if(!['pei','peizhigu'].includes(id)&&r.growthMode!=='witness')out.push({key:'level',label:'人物等级',kind:'level'});
  for(const k of Object.keys(r.skills||{}).filter(k=>k!=='fist'&&SKILLS[k])){const a=id==='hero'&&s.cultivation?CultivationBalance.artForSkill(k):null;const key=a?'art:'+a.id:'skill:'+k;if(!seen.has(key)){seen.add(key);out.push({key,label:a?a.name:(SKILLS[k].artName||SKILLS[k].name),kind:a?'art':'skill',id:a?.id||k})}}
  for(const k of r.xinfa?.known||[]){if(!XINFA[k])continue;const a=id==='hero'&&s.cultivation?CultivationBalance.artById(k):null;const key=a?'art:'+a.id:'inner:'+k;if(!seen.has(key)){seen.add(key);out.push({key,label:XINFA[k].name,kind:a?'art':'inner',id:a?.id||k})}}
  return out;
 }
 function poolTrainingCost(need,request,balance){const total=Math.ceil(need*5-1e-8),budget=Math.min(request,balance);return budget>=total?total:Math.floor(budget/5)*5;}
 function poolApply(s,id,key,request){
  if(!available(s,id))throw Error('角色不在场或尚未结伴');
  const option=poolOptions(s,id).find(o=>o.key===key);if(!option)throw Error('尚未习得，或此人物不使用该成长方式');
  if(!Number.isSafeInteger(request)||request<1||request>1000000)throw Error('请输入1至1000000的整数历练');
  const r=rec(s,id),p=SharedInsightPool.state(s),beforeHealth=health(s,id),beforeStats={...beforeHealth.d};let cost,before,after,gain=0,reason='';
  if(option.kind==='level'){
   const q=SharedInsightPool.levelQuote((id==='hero'?s.lv:r.lv)||1,r.exp||0,p.balance,request);cost=q.cost;before=q.before;after=q.after;r.lv=q.after;r.exp=q.exp;r.pts=(r.pts||0)+q.points;if(r.lv===100)r.xpFraction=0;gain=cost;
  }else if(option.kind==='art'){
   const a=CultivationBalance.artById(option.id),c=s.cultivation;reason=CultivationBalance.upgradeReason(c,a.id);if(reason)throw Error(reason);before=CultivationBalance.level(c,a);const need=CultivationBalance.thresholds(a)[before]-(c.martialXp?.[a.id]||0);
   cost=poolTrainingCost(need,request,p.balance);if(cost<1)throw Error('至少需要5点历练，或结清最后不足1点的熟练');const event=CultivationBalance.addXp(c,a.id,cost/5);if(!event||event.gain<=0)throw Error('当前无法继续修习');gain=event.gain;after=event.after;CultivationCore.reconcileWorld(s);
  }else if(option.kind==='skill'){
   const k=option.id;reason=upgradeWhy(s,id,k);if(reason)throw Error(reason);before=r.skills[k];const need=Math.max(0,6*before*before-(r.prof[k]||0));
   // Legacy ready-to-breakthrough progress needs no paid XP; use normal breakthrough UI.
   if(!need)throw Error('熟练已足，请按原突破条件完成进阶');cost=poolTrainingCost(need,request,p.balance);if(cost<1)throw Error('至少需要5点历练，或结清最后不足1点的熟练');gain=Math.min(need,cost/5);r.prof[k]=(r.prof[k]||0)+gain;if(r.prof[k]>=6*before*before){r.prof[k]-=6*before*before;r.skills[k]++;}after=r.skills[k];
  }else{
   const k=option.id,x=r.xinfa;if((s.chapter||1)<2||mnDef(id).noXf)throw Error('尚未开放心法修习');before=x.lv[k]||1;const cap=5;if(before>=cap)throw Error('心法已练满');const need=Math.max(0,(.8*before-(x.prog[k]||0))*100);if(!need)throw Error('已达突破条件');cost=poolTrainingCost(need,request,p.balance);if(cost<1)throw Error('至少需要5点历练，或结清最后不足1点的熟练');gain=Math.min(need,cost/5);x.prog[k]=(x.prog[k]||0)+gain/100;if(x.prog[k]+1e-9>=.8*before){x.lv[k]=before+1;x.prog[k]=0;}after=x.lv[k]||before;
  }
  SharedInsightPool.debit(s,cost,{actor:id,target:key,name:option.label});const afterStats=calc(s,id);r.hp=Math.min(beforeHealth.hp,afterStats.mhp);r.mp=Math.min(beforeHealth.mp,afterStats.mmp);
  return{allowed:true,actor:id,name:id==='hero'?s.name:PARTY_DEF[id].name,target:key,label:option.label,kind:option.kind,cost,balanceAfter:p.balance,before,after,gain,experienceAfter:r.exp||0,beforeStats,afterStats};
 }
 function poolQuote(id,key,request){try{return poolApply(current(),id,key,request)}catch(e){return{allowed:false,reason:e.message}}}
 function current(){if(!S)throw Error('人物尚未初始化');return normalize(S)}
 function availability(s,id){return s.qiheRoster.availability[id]||'present'}
 function available(s,id){return human(id)&&s.qiheRoster.members.includes(id)&&availability(s,id)==='present'}
 function calc(s,id){const r=rec(s,id),e=eq(s,id),b={};for(const k of [e.weapon,e.armor,e.acc])for(const[a,v]of Object.entries(mnFx(k)))b[a]=(b[a]||0)+v;
  const st=Object.fromEntries(keys.map(k=>[k,(r.st[k]||0)+(b[k]||0)])),lv=(id==='hero'?s.lv:r.lv)||1;
  const d={mhp:60+st.con*14+lv*12+(b.mhp||0),mmp:30+st.wil*7+st.wis*2+lv*5+(r.mpBonus||0)+(b.mmp||0),atk:8+st.str*3+lv*2+(b.atk||0)+(id==='hero'?s.atkBonus||0:0),def:st.con+st.wil*2+(b.def||0),spd:st.agi+(b.spd||0),crit:5+st.wis*2+(b.crit||0),dodge:Math.round(st.agi*1.5)+(b.dodge||0),block:Math.min(30,st.con+(b.block||0)),move:2+Math.floor(st.agi/5),st};
  const {add,pct}=innerEffects(s,id);for(const k of MN_DK)if(add[k]||pct[k])d[k]=Math.round((d[k]+(add[k]||0))*(1+(pct[k]||0)));if(id==='hero'&&s.cultivation)for(const[k,n]of Object.entries(CultivationCore.growth(s.cultivation).bonuses))d[k]=(d[k]||0)+n;return window.CharacterCondition?CharacterCondition.apply(d,r):d;
 }
 function innerEffects(s,id){const o={add:{},pct:{},eb:{},heal:0},x=rec(s,id)?.xinfa;if((s.chapter||1)<2||!x||mnDef(id).noXf)return o;for(const k of [x.main,...x.subs].filter(k=>XINFA[k])){const f=XINFA[k],n=x.lv[k]||1,unstable=k===x.main&&x.unstable>0,m=unstable?.5:1;for(const a of ['add','pct'])for(const[t,v]of Object.entries(f.per[a]||{}))o[a][t]=(o[a][t]||0)+v*n*m;o.heal+=(f.per.heal||0)*n*m;if(k===x.main)for(const e of f.e||[])o.eb[e]=(o.eb[e]||0)+MN_XF_EB*n*m;if(!unstable)for(const[t,at]of [['t3',3],['t5',5]])if(n>=at)for(const[a,v]of Object.entries(f[t]?.add||{}))o.add[a]=(o.add[a]||0)+v;}return o;}
 function skillMultiplier(s,id,k){const r=rec(s,id),sk=SKILLS[k],n=r.skills[k]||1,bi=BSK[k]||{},x=innerEffects(s,id),xing=(s.chapter||1)>=2?XINFA[r.xinfa.main]?.xing:null;let bonus=mnHuo(k,n).pow+(CultivationBalance.mastery(k,n).pow||0)+(x.eb[bi.e]||0)+(sk.heal?x.heal:0);if((xing==='阳'&&bi.e==='阴')||(xing==='阴'&&bi.e==='阳'))bonus-=.1;const effective=Math.max(.1,Math.round((1+(mnLvM(n)*(1+bonus)-1)/.15)*1e4)/1e4);return 1+.15*(effective-1);}

 function health(s,id){const r=rec(s,id),d=calc(s,id);return{hp:r.hp==null?d.mhp:Math.max(0,Math.min(r.hp,d.mhp)),mp:r.mp==null?d.mmp:Math.max(0,Math.min(r.mp,d.mmp)),d}}
 function clampHealth(s,id){const h=health(s,id),r=rec(s,id);r.hp=h.hp;r.mp=h.mp}
 function portrait(id){if(id==='hero'){if(window.GuiyunHero?.longHair())return window.PRODUCTION_ASSET_PATHS?.p_gy_hero_long||'assets/p_gy_hero_long.webp';return 'assets/p_'+(S?.prologue?.arrival?.borrowed?'opening_hero_village':'opening_hero_modern')+'.webp';}const k='p_'+(PARTY_DEF[id]?.por?.[0]||id);return window.PRODUCTION_ASSET_PATHS?.[k]||'assets/'+k+'.webp'}
 function skillEffects(u,k,bp=0){const formal=CultivationBalance.skillEffects?.(u,k,bp);if(formal)return formal;const sk=SKILLS[k],bi=BSK[k]||{},lvM=1+.15*((u.skLv?.[k]||1)-1),v=Math.max(0,Math.min(3,Math.trunc(bp)||0));return{bp:v,t:bi.t,e:bi.e,power:(sk.pow||1)*lvM*(bi.hits?1/Math.sqrt(bi.hits):1)*(bi.hits?1:1+v*.8),hits:(bi.hits||1)+(bi.hits?v:0),heal:sk.heal?sk.heal*lvM*(1+v*.5):null,duration:bi.buff?2+v:null};}
 function skillView(s,id,k,bp=0){const r=rec(s,id),sk=SKILLS[k],n=r.skills[k]||1,mp=Math.max(0,(sk.mp||0)+mnHuo(k,n).mp+(CultivationBalance.mastery(k,n).mp||0)),d=calc(s,id),e=eq(s,id),wk=ITEMS[e.weapon]?.weapon?.kind||(id==='hero'?'拳':PARTY_DEF[id]?.atkType),bi=BSK[k]||{},multiplier=skillMultiplier(s,id,k);
  let reason=!available(s,id)?'角色不在场':sk.needWeapon&&mnWeaponType(wk)!==mnWeaponType(sk.needWeapon)?'需装备'+sk.needWeapon:'';for(const[a,v]of Object.entries(sk.req||{}))if(d.st[a]<v)reason='需'+STATN[a]+' '+v;if(!reason&&health(s,id).mp<mp)reason='内力不足';
  const boost=Math.max(0,Math.min(3,bp||0)),mult=skillMultiplier(s,id,k),formal=CultivationBalance.skillEffects?.({skLv:{[k]:1+(mult-1)/.15}},k,boost),description=formal?('威力 '+(formal.power*formal.hits).toFixed(2)+' · '+formal.hits+' 段；'+(sk.desc||'')):sk.heal?'恢复目标气血上限的 '+Math.round(sk.heal*mult*(1+boost*.5)*100)+'%':bi.buff?'定神持续 '+(2+boost)+' 回合':('威力 '+((sk.pow||1)*mult*(bi.hits?1/Math.sqrt(bi.hits):1)*(bi.hits?1:1+boost*.8)).toFixed(2)+' · '+((bi.hits||1)+(bi.hits?boost:0))+' 段'+(k==='qh_hulu_staff'?'；护身减伤15%，至下次本人行动前':''));
  return{id:k,bpDescription:description,name:sk.name,kind:sk.kind,level:n,grade:sk.grade||'',mp,description:sk.desc||'',desc:sk.desc||'',available:!reason,reason,prof:r.prof[k]||0,profNeed:mnProfNeed(n,k),needWeapon:sk.needWeapon||null,bp:[0,1,2,3].map(v=>skillEffects({skLv:{[k]:1+(multiplier-1)/.15}},k,v)),icon:mnSkIco(k,64)};
 }

 function actor(s,id){if(!human(id)||!s.qiheRoster.members.includes(id))return null;const r=rec(s,id),h=health(s,id),equipment=Object.fromEntries(Object.keys(names).map(k=>[k,eq(s,id)[k]||null]));return{id,name:id==='hero'?s.name:PARTY_DEF[id].name,relationship:window.CultivationRelations&&s.cultivation&&Object.keys(CultivationRelations.profiles).includes(id==='hero'?'':PARTY_DEF[id].name)?CultivationRelations.inspect(s.cultivation,PARTY_DEF[id].name):null,training:id==='hero'&&s.cultivation?CultivationCore.growth(s.cultivation):null,role:id==='hero'?'异乡来客':mnDef(id).role,portrait:portrait(id),active:id==='hero'||s.party.includes(id),available:available(s,id),availability:availability(s,id),locked:id==='hero',lockReason:id==='hero'?'主角承担当前剧情视点':null,stats:{...r.st},derived:h.d,hp:h.hp,mp:h.mp,basicAttack:{id:'fist',name:ITEMS[equipment.weapon]?.name||PARTY_DEF[id]?.atkName||'拳脚',kind:ITEMS[equipment.weapon]?.weapon?.kind||PARTY_DEF[id]?.atkType||'拳',description:'基本攻击，不消耗内力；BP每级增加一次攻击。'},conditions:window.CharacterCondition?CharacterCondition.inspect(r):[],level:(id==='hero'?s.lv:r.lv)||1,exp:r.exp||0,expMax:((id==='hero'?s.lv:r.lv)||1)*100,points:r.pts||0,equipment,skills:Object.keys(r.skills).filter(k=>k!=='fist'&&SKILLS[k]).map(k=>skillView(s,id,k)),inner:{...r.xinfa,capacity:Math.max(id==='hero'&&s.cultivation?.learned.xf_guanlan?1:0,[13,25,39].filter(n=>((id==='hero'?s.lv:r.lv)||1)>=n).length),open:(s.chapter||1)>=2},zy:r.zy,ji:{...r.ji,shi:(r.ji.shi||0)+Object.keys(r.skills).filter(k=>k!=='fist'&&SKILLS[k]).reduce((n,k)=>n+5+2*((r.skills[k]||1)-1),0)},virtue:{...s.virtue,yi:(s.virtue?.yi||0)+2*(s.qiheRoster.members.filter(human).length-1)+Math.floor(Object.values(s.aff||{}).reduce((n,v)=>n+(+v||0),0)/3)}}}
 function category(k){const it=ITEMS[k];if(!it)return'其他';if(mnSlot(k))return'装备';if(it.book||it.xfbook)return'秘籍';if(it.heal||it.mp||it.gall)return'药食';if(it.mat||k.startsWith('qh_')&&['qh_dry_branch','qh_wild_herb','qh_river_reed'].includes(k))return'材料';if(it.key)return'要物';return'其他'}
 function item(s,k){const it=ITEMS[k];return{id:k,name:it?.name||'暂无法识别',desc:it?.desc||k,count:s.bag[k]||0,category:category(k),grade:mnSlot(k)?mnQ(k)[0]:'',slot:mnSlot(k),icon:it?mnIco(k,64):'',known:!!it}}
 function equipWhy(s,id,k){const it=ITEMS[k],slot=mnSlot(k),def=mnDef(id);if(!available(s,id))return'角色不在场';if(!slot)return'不可装备';if(!def.slots.includes(slot))return'无法装备此部位';if(slot==='weapon'&&def.wk&&!def.wk.map(mnWeaponType).includes(mnWeaponType(it.weapon.kind)))return'此角色不使'+it.weapon.kind;for(const[a,v]of Object.entries(it.req||{}))if(rec(s,id).st[a]<v)return'需'+STATN[a]+' '+v;return''}
 function upgradeWhy(s,id,k){if(id==='hero'&&s.cultivation&&CultivationBalance.artForSkill(k))return CultivationBalance.upgradeReason(s.cultivation,k);const sk=SKILLS[k],r=rec(s,id),n=r.skills[k],cap=[0,4,6,7,8,9,10][Math.min(6,s.chapter||1)];if(!sk||!n||k==='fist')return'尚未习得';if(id==='hero'&&s.cultivation&&SKILLS[k]?.maxLevel&&n>=SKILLS[k].maxLevel)return'已达授课上限，进阶须另行传授';if(n>=cap)return'已达本章重数上限';const a=sk.key||'wis',v=Math.max(3,sk.req?.[a]||0)+Math.floor(1.5*n);if(calc(s,id).st[a]<v)return'需'+STATN[a]+' '+v;const t=BSK[k]?.t;if(MN_ZY.includes(t)&&(r.zy[t]||0)<mnZyUp(n+1))return'兵刃造诣不足';return''}
 function inspect(s,id,k){const v=item(s,k),it=ITEMS[k],a=actor(s,id);if(!it||!a)return{...v,allowed:false,reason:'物品或角色不可用',deltas:[],learnTargets:[]};let action=null,reason=!available(s,id)?'角色不在场':v.count<1?'数量不足':'';const deltas=[],targets=[];let heal=0,mp=0;
  if(v.slot){action='equip';reason||=equipWhy(s,id,k);const next=copy(s),before=calc(s,id);eq(next,id)[v.slot]=k;const after=calc(next,id);for(const key of MN_DK)if(after[key]!==before[key])deltas.push({key,name:MN_FXN[key],before:before[key],after:after[key],delta:after[key]-before[key]});}
  else if(it.book||it.xfbook){action='learnFromItem';if(it.book)for(const sk of Object.keys(rec(s,id).skills).filter(k=>k!=='fist'&&SKILLS[k]))targets.push({id:sk,name:SKILLS[sk].name,reason:upgradeWhy(s,id,sk)});else if((s.chapter||1)<2)reason||='入谷培养后开启';else for(const k of rec(s,id).xinfa.known)targets.push({id:k,name:XINFA[k].name,reason:id==='hero'&&s.cultivation&&CultivationBalance.artById(k)?CultivationBalance.upgradeReason(s.cultivation,k):(rec(s,id).xinfa.lv[k]||1)>=5?'已达五层':''});if(!targets.some(t=>!t.reason))reason||='暂无可参悟武学';}
  else if(it.heal||it.mp||it.gall){action='useItem';const h=health(s,id),yi=Math.max(0,...['hero',...s.party].map(w=>rec(s,w)?.ji?.yi||0));heal=Math.min(h.d.mhp-h.hp,Math.round((it.heal||0)*(1+Math.min(yi,200)/200)));mp=Math.min(h.d.mmp-h.mp,it.mp||0);if(!it.gall&&!heal&&!mp)reason||='气血内力已满';}
  else reason||='此物品需在剧情或指定地点使用';return{...v,allowed:!reason,reason,action,deltas,heal,mp,learnTargets:targets};
 }
 function innerWhy(s,id,k,slot){const r=rec(s,id),x=r.xinfa,f=XINFA[k];if((s.chapter||1)<2)return'暂未开放';if(mnDef(id).noXf)return'此角色不修心法';if(!f||!x.known.includes(k))return'尚未习得';if(f.slot!==slot)return'心法类型不符';if(slot==='main'&&f.sect&&f.sect!==(id==='hero'?s.sect:mnDef(id).sect))return'门派不符';if(slot==='sub'){const cap=id==='hero'&&s.cultivation&&k==='xf_guanlan'?1:((id==='hero'?s.lv:r.lv)||1)>=39?3:((id==='hero'?s.lv:r.lv)||1)>=25?2:((id==='hero'?s.lv:r.lv)||1)>=13?1:0;if(!x.subs.includes(k)&&x.subs.length>=cap)return'辅修位置尚未开放或已满';}for(const[a,v]of Object.entries(f.req||{}))if(calc(s,id).st[a]<v)return'根基不足';const others=[slot==='main'?null:x.main,...x.subs.filter(t=>t!==k)];if(f.xing!=='中'&&others.some(t=>XINFA[t]&&XINFA[t].xing!=='中'&&XINFA[t].xing!==f.xing))return'阴阳相冲';return''}
 const fail=reason=>({ok:false,reason,revision:S?.qiheRoster?.revision||0});let writing=false;
 function command(c){if(writing)return fail('正在保存，请稍候');if(!S)return fail('人物尚未初始化');if(c.cancel)return fail('已取消');
  if(c.type==='setMute'||c.type==='setTheme'){try{if(c.type==='setMute'){if(!window.__audio)return fail('声音尚未就绪');const v=c.value==null?!__audio.muted:!!c.value;localStorage.setItem('xjh.mute',v?'1':'0');__audio.setMute(v)}else{if(!window.BUI)return fail('界面主题尚未就绪');const v=c.value||(BUI.theme==='ink'?'scroll':'ink');if(!['ink','scroll'].includes(v))return fail('未知主题');localStorage.setItem('bui.theme',v);BUI.setTheme(v)}return{ok:true,revision:S.qiheRoster?.revision||0}}catch(e){return fail('设置保存失败：'+e.message)}}
  if(mode==='battle'||(busy&&!['menu','panel'].includes(mode))||dlgBusy)return fail('当前剧情或战斗进行中');
  writing=true;try{const s=current(),q=s.qiheRoster;if(c.commandId&&q.commands.includes(c.commandId))return{ok:true,duplicate:true,revision:q.revision};if(c.expectedRevision!=null&&c.expectedRevision!==q.revision)return fail('状态已变化，请重新确认');const id=c.actorId||'hero',k=c.itemId;const needsActor=['equip','unequip','useItem','learnFromItem','allocateStats','setMainInner','setSubInner','spendInsight'];if(needsActor.includes(c.type)&&!available(s,id))throw Error('角色不在场或尚未结伴');
   switch(c.type){
    case'save':case'migrate':break;
    case'spendInsight':{const quoted=poolApply(s,id,c.target,c.amount);if(c.expectedCost!=null&&quoted.cost!==c.expectedCost)throw Error('实际消耗已变化，请重新预览');break;}
    case'applyFormation':{const ids=c.active||[];if(ids.length<1||ids.length>4||unique(ids).length!==ids.length)throw Error('出战需为1至4名不同角色');if(ids[0]!=='hero')throw Error('萧白须留在首位承担当前剧情视点');for(const w of ids)if(!available(s,w))throw Error('角色不在场或尚未结伴：'+w);s.party=ids.filter(w=>w!=='hero');break;}
    case'equip':{const v=inspect(s,id,k);if(v.action!=='equip'||!v.allowed)throw Error(v.reason||'不可装备');const e=eq(s,id);if(e[v.slot])s.bag[e[v.slot]]=(s.bag[e[v.slot]]||0)+1;e[v.slot]=k;s.bag[k]--;clampHealth(s,id);break;}
    case'unequip':{if(!names[c.slot])throw Error('未知装备位');const e=eq(s,id);if(!e[c.slot])throw Error('此位置为空');s.bag[e[c.slot]]=(s.bag[e[c.slot]]||0)+1;e[c.slot]=null;clampHealth(s,id);break;}
    case'useItem':{const v=inspect(s,id,k);if(v.action!=='useItem'||!v.allowed)throw Error(v.reason||'不可使用');if(c.quantity!=null&&c.quantity!==1)throw Error('当前每次使用一份');const r=rec(s,id),h=health(s,id);if(ITEMS[k].gall)r.mpBonus=(r.mpBonus||0)+30;else{r.hp=h.hp+v.heal;r.mp=h.mp+v.mp}s.bag[k]--;break;}
    case'learnFromItem':{const v=inspect(s,id,k),target=v.learnTargets?.find(t=>t.id===(c.skillId||c.innerId));if(!v.allowed||!target||target.reason)throw Error(target?.reason||v.reason||'请选择参悟对象');if(id==='hero'&&s.cultivation&&(CultivationBalance.artForSkill(target.id)||CultivationBalance.artById(target.id))){const a=CultivationBalance.artForSkill(target.id)||CultivationBalance.artById(target.id);CultivationBalance.grantLevel(s.cultivation,a.id);CultivationCore.reconcileWorld(s);}else if(ITEMS[k].book)rec(s,id).skills[target.id]++;else{const x=rec(s,id).xinfa;x.lv[target.id]=(x.lv[target.id]||1)+1;x.prog[target.id]=0;}s.bag[k]--;break;}
    case'allocateStats':{const r=rec(s,id),a=c.stats||{},used=Object.values(a).reduce((n,v)=>n+v,0);if(!used||used>r.pts)throw Error('可分配点数不足');for(const[k,v]of Object.entries(a)){if(!keys.includes(k)||!Number.isInteger(v)||v<0||(r.st[k]||0)+v>8+((id==='hero'?s.lv:r.lv)||1))throw Error('加点超出上限');r.st[k]+=v}r.pts-=used;clampHealth(s,id);break;}
    case'setMainInner':case'setSubInner':{const slot=c.type==='setMainInner'?'main':'sub',k=c.innerId,x=rec(s,id).xinfa;if(slot==='sub'&&x.subs.includes(k)){x.subs=x.subs.filter(t=>t!==k);clampHealth(s,id);break;}const why=innerWhy(s,id,k,slot);if(why)throw Error(why);if(slot==='main'){if(x.main!==k&&x.main){if(!c.confirmCost)throw Error('改修需确认内力清空和气脉不稳');rec(s,id).mp=0;x.unstable=MN_XF_SWAP}x.main=k;}else x.subs.push(k);clampHealth(s,id);break;}
    case'feedPet':case'equipPet':{const p=s.pets?.[s.pet];if(!p)throw Error('尚未结伴宠物');const itemId=k||'bun';if(c.type==='feedPet'){if(itemId!=='bun'||!(s.bag.bun>0))throw Error('需要馒头');const d=derived({st:p.st,lv:s.lv,acc:p.equip?.acc});if((p.hp??d.mhp)>=d.mhp)throw Error('宠物气血已满');p.hp=Math.min(d.mhp,(p.hp??d.mhp)+40);s.bag.bun--;}else{if(k&&k!=='collar')throw Error('宠物仅可装备项圈');if(k&&!(s.bag[k]>0))throw Error('数量不足');p.equip||={acc:null};if(p.equip.acc)s.bag[p.equip.acc]=(s.bag[p.equip.acc]||0)+1;p.equip.acc=k||null;if(k)s.bag[k]--;}break;}
    default:throw Error('暂未支持此操作');
   }
   q.revision++;if(c.commandId)q.commands=[...q.commands,c.commandId].slice(-32);
   persistState(s);S=s;
   if(c.type==='applyFormation'&&cur&&typeof resetFollowers==='function'){try{resetFollowers()}catch(e){console.warn('编成已保存；跟随将在场景刷新时恢复',e.message)}}
   return{ok:true,revision:q.revision};
  }catch(e){return fail(e.message||'保存失败')}finally{writing=false}
 }
 function skillCost(u,k){return u?.mw&&rec(S,u.mw)?.skills?.[k]?Math.max(0,(SKILLS[k]?.mp||0)+mnHuo(k,rec(S,u.mw).skills[k]).mp+(CultivationBalance.mastery(k,rec(S,u.mw).skills[k]).mp||0)):SKILLS[k]?.mp||0}
 function skillWhy(u,k){const sk=SKILLS[k];if(!sk||!u.skills?.includes(k))return'尚未习得';if(sk.needWeapon&&mnWeaponType(u.atkType)!==mnWeaponType(sk.needWeapon))return'需装备'+sk.needWeapon;if(u.mw){const d=calc(normalize(S),u.mw);for(const[a,v]of Object.entries(sk.req||{}))if(d.st[a]<v)return'需'+STATN[a]+' '+v;}if(u.mp<skillCost(u,k))return'内力不足';return CultivationBalance.battleWhy?.(u,k)||''}
 // Existing battle constructors preserve art/HP/growth wrappers; only replace preparation slots.
 const hero0=mkHero,ally0=mkAlly;
 mkHero=function(){const u=hero0();u.skills=Object.keys(S.skills).filter(k=>k!=='fist'&&SKILLS[k]);return u};
 mkAlly=function(id){const u=ally0(id);if(u&&S.mates?.[id])u.skills=Object.keys(S.mates[id].skills).filter(k=>k!=='fist'&&SKILLS[k]);return u};
 const doSkill0=doSkill;doSkill=async function(u,k,tgs,bp){if(u?.side==='ally'&&skillWhy(u,k))return;return doSkill0.apply(this,arguments)};
 window.QiheUIModel={version:1,command,normalize,skillCost,skillWhy,skillEffects,
  insight:()=>{const s=current(),p=SharedInsightPool.state(s);return{...copy(p),actors:s.qiheRoster.members.filter(id=>available(s,id)).map(id=>({id,name:id==='hero'?s.name:PARTY_DEF[id].name,options:poolOptions(s,id)}))}},insightQuote:poolQuote,
  snapshot:()=>{const s=current();return{revision:s.qiheRoster.revision,active:['hero',...s.party],roster:s.qiheRoster.members.filter(human).map(id=>actor(s,id)),pet:s.pet||null,chapter:s.chapter||1,silver:s.silver||0}},
  roster:()=>{const s=current();return s.qiheRoster.members.filter(human).map(id=>actor(s,id))},active:()=>['hero',...current().party],view:id=>actor(current(),id),
  inventory:(query={})=>{const s=current();let a=Object.keys(s.bag).filter(k=>s.bag[k]>0).map(k=>item(s,k));const c=query.category;if(c&&c!=='全部')a=a.filter(i=>i.category===c||names[i.slot]===c||i.slot===c);if(query.search){const t=query.search.toLowerCase();a=a.filter(i=>(i.name+i.desc).toLowerCase().includes(t))}return a.sort((a,b)=>query.sort==='count'?b.count-a.count||a.id.localeCompare(b.id):a.name.localeCompare(b.name,'zh-CN')||a.id.localeCompare(b.id))},

  inspectItem:(id,k)=>inspect(current(),id,k),inspectSkill:(id,k,bp)=>{const s=current();return actor(s,id)&&SKILLS[k]&&rec(s,id).skills[k]?skillView(s,id,k,bp):null},
  previewStats:(id,delta={})=>{const s=current(),before=actor(s,id);if(!before)return null;const r=rec(s,id);let spent=0,reason='';for(const[k,v]of Object.entries(delta)){if(!keys.includes(k)||!Number.isInteger(v)||v<0||(r.st[k]||0)+v>8+((id==='hero'?s.lv:r.lv)||1)){reason='加点超出上限';break}r.st[k]+=v;spent+=v}if(spent>r.pts)reason='可分配点数不足';return{allowed:!reason,reason,cap:8+((id==='hero'?s.lv:r.lv)||1),spent,remaining:r.pts-spent,before:before.derived,after:reason?before.derived:calc(s,id),stats:reason?before.stats:{...r.st}}},
  inspectInner:(id,k)=>{const s=current(),a=actor(s,id),f=XINFA[k];if(!a||!f)return null;const x=rec(s,id).xinfa,mainReason=innerWhy(s,id,k,'main'),subReason=innerWhy(s,id,k,'sub');return{id:k,name:f.name,grade:f.grade,effects:f.per,slot:f.slot,progress:x.prog[k]||0,progressNeed:mnXfProgressNeed(id,k,x.lv[k]||1),learningHint:id==='hero'&&s.cultivation&&CultivationBalance.artById(k)?CultivationBalance.courseHint(s.cultivation,CultivationData.actions.find(a=>a.id===CultivationBalance.artById(k).action)):'',unstable:x.unstable,reason:f.slot==='main'?mainReason:subReason,description:f.desc,type:f.slot,level:x.lv[k]||0,known:x.known.includes(k),active:x.main===k||x.subs.includes(k),xing:f.xing,canMain:!mainReason,canSub:!subReason,mainReason,subReason,swapCost:x.main&&x.main!==k?{mp:'全部',unstableBattles:MN_XF_SWAP}:null,traits:[{level:3,description:f.d3||'',implemented:!f.t3?.todo},{level:5,description:f.d5||'',implemented:!f.t5?.todo}]};},
  pet:()=>{if(!S?.pet)return null;const s=current(),p=s.pets?.[s.pet];if(!p)return null;const d=derived({st:p.st,lv:s.lv,acc:p.equip?.acc});return{id:s.pet,name:PARTY_DEF[s.pet]?.name,portrait:'assets/p_'+s.pet+'.webp',hp:p.hp??d.mhp,mp:p.mp??d.mmp,derived:d,equipment:p.equip,description:'自动参战，固定队尾；主角气血不高于一半时优先护主。'}},
  settings:()=>({muted:window.__audio?.muted||false,theme:window.BUI?.theme||'ink'})};
})();
