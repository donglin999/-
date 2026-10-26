'use strict';
// 人物交互框架·规则引擎（2026-10-23 开发一）。读 js/qihe-npc-data.js 的表，算：墨印菜单每一项的状态与原因、查看页的可见度档位、
// 请教与切磋的条件和收益、关系轴（含负向）的读写。没有逐人 if-else：人物差异全部写在数据表里。
// 存档：S.qiheNpc = {version, seed, skills:{spar}, spar:{<人>:{count,first,firstWin,stage,slots:{}}}, slots:{<时段>:次数}, teach:{<人>:true}}
//       S.qiheBond = {<人>:{score,gifts:[],unlocked,hostile,bonus}, known:{<物品>:true}, rolled:{<物品>:悟性}}（赠礼稿第 2.1 节字段）
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;
 const D=window.QIHE_NPC_DATA;if(!D)throw Error('人物交互数据表未加载：js/qihe-npc-data.js');
 const CP=()=>S?.qiheChapter;

 // ───── 存档 ─────
 function state(){const s=S.qiheNpc||(S.qiheNpc={version:1});s.skills||={};s.spar||={};s.slots||={};s.teach||={};if(!s.seed)s.seed=Math.floor(Math.random()*2**31)||1;return s}
 function bonds(){const b=S.qiheBond||(S.qiheBond={});b.known||={};b.rolled||={};return b}

 // ───── 条件 ─────
 const has=id=>!!(S.bag?.[id]>0||S.weapon===id||S.armor===id||S.acc===id||Object.values(S.mates||{}).some(m=>m&&(m.weapon===id||m.armor===id||m.acc===id)));
 const errandStage=k=>S.prologue?.outsiders?.quests?.[k]?.stage||'none';
 function test1(tok){
  if(!tok)return true;const neg=tok[0]==='!';if(neg)tok=tok.slice(1);let ok;
  let m;
  if((m=tok.match(/^halfDay(<|>=)(\d+)$/))){const h=CP()?.halfDay||0;ok=m[1]==='<'?h<+m[2]:h>=+m[2]}
  else if((m=tok.match(/^bond:(\w+)>=(-?\d+)$/)))ok=bond.get(m[1]).score>=+m[2];
  else{const i=tok.indexOf(':'),k=i<0?tok:tok.slice(0,i),a=i<0?'':tok.slice(i+1);
   switch(k){
    case 'event':ok=!!CP()?.events?.[a];break;
    case 'stage':ok=a.split('|').includes(CP()?.stage);break;
    case 'choice':ok=!!CP()?.choices?.[a];break;
    case 'learned':ok=!!S.skills?.[a];break;
    case 'has':ok=has(a);break;
    case 'errand':{const[e,st]=a.split(':');ok=errandStage(e)===st;break}
    case 'prologueErrand':ok=S.prologue?.errands?.[a]==='done';break;
    case 'sparred':ok=!!state().spar[a]?.first;break;
    case 'skill':ok=!!state().skills[a];break;
    case 'chapter':ok=!!CP();break;
    case 'never':ok=false;break;
    default:throw Error('人物交互条件写错了：'+tok);
   }}
  return neg?!ok:ok;
 }
 const test=expr=>!expr||String(expr).split(/\s+/).filter(Boolean).every(test1);

 // ───── 关系轴（赠礼稿第 2 节） ─────
 const stageOf=score=>D.BOND.stages.find(s=>score>=s.min)?.name||'仇视';
 const bond={
  raw(id){const b=bonds();return b[id]||(b[id]={score:0,gifts:[],unlocked:false,hostile:false})},
  cap(id){const p=D.PEOPLE[id];if(!p?.special)return D.BOND.openingCap;return bond.raw(id).unlocked?D.BOND.openingCap:D.BOND.lockedCap},
  floor(id){return D.PEOPLE[id]?.bondFloor??D.BOND.floor},
  get(id){const r=bond.raw(id);return{score:r.score,stage:stageOf(r.score),cap:bond.cap(id),unlocked:!!r.unlocked,hostile:!!r.hostile}},
  // delta 可正可负。opts.story：剧情做事的加分（负向时可越过 0，仍受上限约束）；opts.amends：赔礼（最多回到 0）。
  add(id,delta,opts={}){if(!D.PEOPLE[id])throw Error('没有这个人物：'+id);const r=bond.raw(id),before=r.score;let v=before+delta;
   if(delta>0){const cap=bond.cap(id);if(opts.amends)v=Math.min(v,Math.max(before,0));v=Math.min(v,Math.max(cap,before))}
   v=Math.max(bond.floor(id),Math.min(100,Math.round(v)));r.score=v;if(v<=D.BOND.hostileAt)r.hostile=true;else if(v>D.BOND.hostileAt)r.hostile=false;
   return{before,after:v,stage:stageOf(v)}},
  unlock(id){const r=bond.raw(id);if(r.unlocked)return false;r.unlocked=true;return true},
  stageOf
 };
 // 特殊人物做完解锁小事：放开到熟络并另加 +8（一次）。在打开菜单、查看页时补算，读档后同样成立。
 function syncUnlocks(){if(!S)return;for(const[id,p]of Object.entries(D.PEOPLE)){if(!p.special||!p.unlock||p.unlock==='never')continue;const r=bond.raw(id);if(r.bonus)continue;if(!test(p.unlock))continue;bond.unlock(id);r.bonus=true;bond.add(id,D.BOND.unlockBonus,{story:true})}}

 // ───── 战斗档与可见度（主稿第 3 节、切磋稿第 3 节） ─────
 const clashArt=id=>window.QiheClashData?.arts?.[id];const clashSkill=id=>window.QiheClashData?.skills?.[id];
 function battleOf(p){const b=p.battle;if(!b||p.civilian)return null;
  if(b.clash){const pr=QiheClashData.profiles[b.clash];if(!pr)throw Error('战斗档缺：'+b.clash);
   const arts=Object.entries(pr.artLevels||{}).map(([aid,lv])=>{const a=clashArt(aid)||{};return{name:a.name||aid,grade:a.grade||'',lv,moves:(a.skill_ids||[]).filter(s=>(pr.skillLevels?.[s]||0)>0).map(s=>clashSkill(s)?.name||s)}});
   return{lv:pr.lv,st:pr.st,weapon:{id:pr.weapon.id,name:b.weaponName||pr.weapon.name,kind:pr.weapon.kind,atk:pr.weapon.atk,crit:pr.weapon.crit},acc:b.acc?{name:b.acc}:null,arts,inner:null,
    spec:{name:p.name,sp:b.art||'c_qh_clash_guard',lv:pr.lv,st:{...pr.st},weapon:{...pr.weapon},skills:Object.keys(pr.skillLevels||{}).length?{...pr.skillLevels}:{blade:1},weak:['棍','暗器'],shield:3,h:170}}}
  if(b.spar){const f=window.QiheSparFoes?.[b.spar];if(!f)throw Error('切磋档缺：'+b.spar);
   return{lv:f.lv,st:f.st,weapon:{id:f.weapon.id,name:f.weapon.name,kind:f.weapon.kind,atk:f.weapon.atk,crit:f.weapon.crit},arts:b.arts||[],inner:null,spec:{...f}}}
  if(b.party){const P=typeof PARTY_DEF!=='undefined'?PARTY_DEF[b.party]:null,m=S.mates?.[b.party],wid=m?.equip?.weapon,it=wid&&typeof ITEMS!=='undefined'?ITEMS[wid]:null;   // 同伴读她自己的成长记录（五维、身上兵器）
   return{lv:window.CharacterGrowth?CharacterGrowth.level(S,b.party):b.lv,st:m?.st||P?.st||null,weapon:it?{id:wid,name:it.name,kind:it.weapon?.kind||'',atk:it.weapon?.atk??null,crit:it.weapon?.crit||0}:null,arts:b.arts||[],inner:null,party:true}}
  return{lv:b.lv,st:null,weapon:b.weapon?{name:b.weapon,grade:b.weaponGrade||''}:null,acc:b.acc?{name:b.acc,grade:b.accGrade||''}:null,arts:b.arts||[],inner:null}}
 const tierIndex=d=>D.TIERS.findIndex(t=>d<=t.max);
 const heroWis=()=>{try{return derived().st.wis}catch(e){return S.st?.wis||0}};
 const insightK=wis=>D.INSIGHT.find(r=>wis>=r.min).k;
 function view(p){const b=battleOf(p);
  if(!b)return{civil:true};
  const party=(S.party||[]).includes(p.battle?.party);
  if(p.disguised)return{tier:D.TIERS[3],index:3,d:null,battle:b,eye:false};
  if(party)return{tier:D.TIERS[0],index:0,d:b.lv-S.lv,battle:b,eye:false,party:true};
  const d=b.lv-(S.lv||1),base=tierIndex(d),k=insightK(heroWis()),adj=Math.max(tierIndex(d-k),base-1),i=Math.min(base,adj);
  return{tier:D.TIERS[i],index:i,d,battle:b,eye:i<base,k};
 }

 // ───── 随身物品（赠礼稿第 4、5 节） ─────
 // 贵重（甲、绝）显示“未知物品”；认不认得出只看悟性：概率＝悟性÷认出线（甲 24、绝 30），第一次看到判一次，悟性涨了再判；种子固定，读档不变。
 const RECOG={甲:{line:24,grade:12},绝:{line:30,grade:15}};
 function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)/4294967296}
 function recognize(key,grade){const b=bonds();if(b.known[key])return true;const r=RECOG[grade];if(!r)return true;const wis=heroWis();
  if(b.rolled[key]!==undefined&&b.rolled[key]>=wis)return false;b.rolled[key]=wis;if(wis>=r.line||hash(state().seed+':'+key+':'+wis)<wis/r.line){b.known[key]=true;return true}return false}
 function bagOf(p,v){const out=[];const opaque=v&&!v.civil&&v.index===3;
  for(const it of p.bag||[]){if(it.when&&!test(it.when))continue;if(it.until&&test(it.until))continue;
   if(it.money&&!it.n){out.push({name:'银两',glyph:'银',qty:it.money+' 两',money:true});continue}
   if(it.c==='贴'){if(p.disguised&&opaque&&!out.some(x=>x.close))out.push({name:'贴身收着一件',glyph:'？',close:true,dim:true});continue}
   if(it.c==='锁'){out.push({name:'未知物品',glyph:'？',dim:true,locked:true});continue}
   if(it.c==='贵'){const key=it.key||it.n,known=recognize(key,it.g),wis=heroWis();out.push(known?{name:it.n,id:it.id,glyph:it.glyph||it.n[0],grade:it.g,qty:it.q>1?'×'+it.q:'',valuable:true}:{name:'未知物品',glyph:'？',dim:true,grade:wis>=RECOG[it.g].grade?it.g:'',qty:it.q>1?'×'+it.q:''});continue}
   out.push({name:it.n,id:it.id,glyph:it.glyph||it.n[0],grade:it.g||'',qty:it.money?it.money+' 两':it.q>1?'×'+it.q:'',story:it.c==='剧',look:!!it.look,use:it.use||''});
  }return out}

 // ───── 时段（切磋、请教共用；切磋稿 2.5） ─────
 function slot(){const p=CP();if(!p)return'night';if(p.stage==='days')return'd'+(p.halfDay||0);return p.stage}

 // ───── 菜单项状态 ─────
 const pronoun=p=>p.she?'她':'他';
 const she=new Set(['叶蘅','周婶','徐令仪','岑霜','沈雁回']);
 function storyHook(p,npc){for(const h of p.story||[]){const def=D.STORY[h];
   if(h==='main'){const m=window.QiheChapter?.mainStep?.();if(p.chapter&&m?.npc===p.chapter)return{hook:h,lab:def.lab,note:m.title,run:'act'}}
   if(h==='errand'&&window.QiheOutsiders?.available()){const k=QiheOutsiders.representativeKey(p.chapter);if(k&&QiheOutsiders.questOpen(k)){const st=errandStage(k);if(st!=='done'){const n=QiheOutsiders.defs[k].name;
     if(st==='none'&&['厌恶','仇视'].includes(bond.get(p.id).stage))return{hook:h,lab:def.lab,note:D.BOND.effects[bond.get(p.id).stage].tuo,off:true};
     return{hook:h,lab:st==='none'?def.lab:def.labActive,note:def.notes?.[k]||n,run:'errand'}}}}
   if(h==='errandCheck'&&window.QiheOutsiders?.available()){const ks=QiheOutsiders.pendingFor(npc?.name||p.name);if(ks.length)return{hook:h,lab:def.lab,note:'问「'+QiheOutsiders.defs[ks[0]].name+'」',run:'act'}}
   if(h==='stranger'&&window.QiheChapter?.strangerPending?.())return{hook:h,lab:def.lab,note:def.note,run:'act'};
  }return null}
 function teachState(p){const t=D.TEACH[p.teach];if(!t)return null;const s=state();
  if(s.teach[p.id]||t.skill&&S.skills?.[t.skill])return{off:true,note:t.closedNote||'已请教过',t};
  const neg=D.BOND.effects[bond.get(p.id).stage]?.jiao;if(neg)return{off:true,note:neg,t};
  const miss=t.req.find(([c])=>!test(c));if(miss)return{off:true,note:miss[2]||miss[1],t,miss};
  return{off:false,note:t.title+' · '+t.grade,t}}
 function sparState(p){const sp=p.spar;if(!sp||p.civilian)return{hidden:true};if(sp.deny==='companion')return{hidden:true};
  if(sp.deny==='disguised')return{off:true,note:pronoun(p)+'推说不会这个'};
  const s=state(),rec=s.spar[p.id]||{};
  if(sp.first&&!rec.first&&test(sp.firstWhen)&&test('stage:refuge'))return{story:true,first:true,note:sp.firstNote};
  if(!s.skills.spar)return{off:true,note:'还不懂讨教的规矩'};
  if(sp.noProfile)return{off:true,note:'战斗档待补'};
  if(CP()?.pendingEvent||window.QiheChapter?.running)return{off:true,note:'有事在身'};
  const neg=D.BOND.effects[bond.get(p.id).stage]?.bi;if(neg)return{off:true,note:neg};
  const b=battleOf(p),d=b.lv-(S.lv||1);
  if(d>=D.SPAR.refuseStrong)return{off:true,note:'差距过大 · '+pronoun(p)+'不接'};
  if(d<=D.SPAR.refuseWeak)return{off:true,note:'你太强 · '+pronoun(p)+'不接'};
  const sl=slot();if((rec.slots?.[sl]||0)>=D.SPAR.perPersonPerSlot)return{off:true,note:'这个时段打过了'};
  if((s.slots[sl]||0)>=D.SPAR.perSlot)return{off:true,note:'这个时段打够了'};
  let mhp=0;try{mhp=derived().mhp}catch(e){}if(mhp&&S.hp<mhp*D.SPAR.hurtBelow)return{off:true,note:'你带着伤'};
  return{off:false,note:'点到为止'}}
 function menuFor(p,npc){syncUnlocks();const out=[],bst=bond.get(p.id).stage,neg=D.BOND.effects[bst]||{};
  for(const M of D.MENU){if(M.reserved)continue;let it={...M,st:'normal',note:M.note||''};
   switch(M.id){
    case 'tuo':{const h=storyHook(p,npc);if(!h)continue;Object.assign(it,{st:h.off?'off':'story',lab:h.lab,note:h.note,run:h.run});break}
    case 'tan':if(npc?.talk===false)continue;it.run='act';break;
    case 'guan':it.run='profile';break;
    case 'li':{const G=window.QiheGift;if(!G){it.st='off';it.note='尚未开放';break}   // 2026-10-26 开发二：赠礼／赔礼面板（js/qihe-gift-ui.js）
     const b=bond.get(p.id);if(b.stage==='仇视'){Object.assign(it,{st:'off',note:'要请中人说和'});break}
     if(G.usedThisSlot(p)){Object.assign(it,{st:'off',note:'本时段已送'});break}
     Object.assign(it,{run:'gift',lab:b.score<0?'赔礼':'赠礼',note:b.score<0?'只收厚礼或'+pronoun(p)+'喜欢的':''});break}
    case 'jiao':{const t=teachState(p);if(!t)continue;Object.assign(it,{st:t.off?'off':'normal',note:t.note,run:'teach'});break}
    case 'bi':{const s=sparState(p);if(s.hidden)continue;Object.assign(it,{st:s.story?'story':s.off?'off':'normal',note:s.note,run:'spar'});break}
    case 'yi':if(!p.trade)continue;if(neg.yi)Object.assign(it,{st:'off',note:neg.yi});else{it.run=window.QiheGiftUI?'yi':'act';it.note='以物易物 · 买卖'}break;
   }
   out.push(it)}
  return out}

 // ───── 请教、切磋的执行 ─────
 const save=()=>{try{QihePrologue.checkpoint()}catch(e){try{window.save?.()}catch(_){}}};
 async function doTeach(p){const t=teachState(p);if(!t||t.off)return false;const fx=t.t.fx;
  if(fx.activity){await QiheChapter.activity(fx.activity);return true}
  if(fx.zy){S.zy||={};S.zy[fx.zy]=Math.min(200,(S.zy[fx.zy]||0)+fx.n);state().teach[p.id]=true;save();toast(t.t.gain,2200);return true}
  return false}
 const round5=v=>Math.round(v/D.SPAR.insight.round)*D.SPAR.insight.round;
 function sparQuote(p){const b=battleOf(p),s=state(),rec=s.spar[p.id]||{},d=b.lv-(S.lv||1),E=D.SPAR.exp;
  const base=E.base+E.perLv*b.lv,weak=d<0?Math.max(0,1+d/10):1,decay=E.decay[Math.min(E.decay.length-1,rec.count||0)];
  const one=r=>Math.round(base*E.result[r]*weak*decay*1.2);   // 主角“历练领悟 +20%”只作显示，结算由 CharacterGrowth 统一乘
  const I=D.SPAR.insight,firstWin=Math.max(I.firstWinMin,round5(b.lv/I.firstWinDiv));
  return{lv:b.lv,d,base,weak,decay,exp:{win:one('win'),draw:one('draw'),lose:one('lose')},raw:r=>base*E.result[r]*weak*decay,
   insight:{first:rec.first?0:I.first,firstWin:rec.firstWin?0:firstWin},spent:decay===0,story:!!(p.spar.first&&!rec.first),left:Math.max(0,D.SPAR.perSlot-(s.slots[slot()]||0))}}
 function grantInsight(id,amount,name){if(!amount||!window.SharedInsightPool)return 0;const pool=SharedInsightPool.state(S);if(Object.hasOwn(pool.receipts,id))return 0;
  pool.receipts[id]=amount;pool.balance+=amount;pool.earned+=amount;pool.ledger.push({id,amount,name,kind:'gain'});pool.ledger=pool.ledger.slice(-100);return amount}
 // 点到为止：任一方掉到三成或打满八回合收手（切磋稿 2.4）。借现有 battle()：开打前临时换掉胜负判定与结算演出，打完换回。
 async function runSpar(p){const q=sparQuote(p),b=battleOf(p),s=state(),sl=slot();const before={hp:S.hp,mp:S.mp};
  const spec={...b.spec,name:(p.faction&&!b.spec.name.includes(p.faction)?p.faction:'')+p.name+' · 切磋',exp:0,silver:0,drops:{}};
  const saved={endCheck:window.endCheck,victory:window.victory,bigText:window.bigText};let result;
  window.endCheck=function(){if(!aliveOf('foe').length)return'win';if(B.foes.every(u=>u.hp<=u.mhp*D.SPAR.stopAt))return'win';if(B.allies.some(u=>u.isHero&&u.hp<=u.mhp*D.SPAR.stopAt))return'lose';if(!aliveOf('ally').length)return'lose';if(B.round>D.SPAR.maxRounds)return'draw';return null};
  window.victory=async()=>{await(window.BFX&&BFX.victoryPose?BFX.victoryPose():0);await saved.bigText('胜','#f3d58e',900)};   // 不弹经验战利品结算，收益在切磋卷上另算
  window.bigText=(t,...a)=>saved.bigText(t==='脱身'?'平':t,...a);
  try{result=await battle({allowAuto:true,solo:true,heroArt:'hero_village',heroPor:'opening_hero_village',bg:window.QiheChapterBattleArt?.backgrounds?.road,foes:[spec]})}
  finally{window.endCheck=saved.endCheck;window.victory=saved.victory;window.bigText=saved.bigText;S.hp=before.hp;S.mp=before.mp}
  const r=result==='win'?'win':result==='lose'?'lose':'draw';
  const rec=s.spar[p.id]||(s.spar[p.id]={count:0,first:false,firstWin:false,stage:'opening',slots:{}});rec.slots||={};
  let exp=0;const raw=q.raw(r);if(raw>0&&window.CharacterGrowth){const g=CharacterGrowth.awardBattle(S,raw,[],x=>settleCharacterLevels(x,derived));exp=g.hero?.amount||0}
  if(raw>0)rec.count=(rec.count||0)+1;
  let ins=0;if(!rec.first)ins+=grantInsight('spar:'+p.id+':first:'+rec.stage,D.SPAR.insight.first,'初次切磋 · '+p.name);
  if(r==='win'&&!rec.firstWin){ins+=grantInsight('spar:'+p.id+':firstWin:'+rec.stage,q.insight.firstWin,'首胜 · '+p.name);rec.firstWin=true}
  const learned=q.story&&!s.skills.spar;rec.first=true;
  if(q.story)s.skills.spar=true;else{rec.slots[sl]=(rec.slots[sl]||0)+1;s.slots[sl]=(s.slots[sl]||0)+1}
  save();return{result:r,exp,insight:ins,learned}}

 // ───── 认人：地图 NPC → 人物表 ─────
 const byName={};for(const[id,p]of Object.entries(D.PEOPLE)){p.id=id;if(she.has(p.name))p.she=true;for(const n of p.npc||[])byName[n]=id}
 const personFor=npc=>{if(!npc||npc.resource||npc.loot||!npc.sp)return null;const id=npc.person||byName[npc.name];return id?D.PEOPLE[id]:null};

 window.QiheNpc={data:D,state,test,bond,syncUnlocks,battleOf,view,bagOf,menuFor,teachState,sparState,sparQuote,doTeach,runSpar,personFor,slot,heroWis,insightK,recognize,
  get people(){return D.PEOPLE}};
})();
