/* Pei's bound book, independent template and participant-qualified witness log. */
(function(root){'use strict';
const id='peizhigu',allowed=new Set(['hg.pre.road_help','hg.m01','hg.m03','hg.m05','hg.m06','hg.m07','hg.m08']);
const skills={
 pei_zhi:{name:'指瑕',mp:4,tgt:'foe',desc:'揭示一个未知弱点；下次受击伤害增加10%至25%，不造成伤害或削盾。'},
 pei_wen:{name:'温故',mp:6,tgt:'foe',desc:'查看并锁定下一条尚未公开意图；曾见敌类下次伤害减少10%至25%。'},
 pei_shen:{name:'慎行',mp:6,tgt:'ally',desc:'同伴下次受击减伤20%至35%，免疫一次位移。'},
 pei_jiao:{name:'校雠',mp:10,tgt:'foes',desc:'各揭示一个未知弱点；全弱点已知者受一次破绽，冷却两次自身行动。'}
};
function fresh(){return {st:{str:1,con:3,agi:3,wil:5,wis:7},lv:3,exp:0,pts:0,skills:{pei_zhi:1},weapon:'pei_sujian',armor:null,
 equip:{weapon:'pei_sujian',armor:null,acc:null},load:['pei_zhi'],xinfa:{known:['tuna'],lv:{tuna:1},prog:{},main:'tuna',subs:[]},growthMode:'witness',witness:{},book:{id:'pei_sujian',grade:'丁',witnessCount:0},peiVersion:1};}
function ensure(world){world.mates||={};const m=world.mates[id]||=fresh();
 m.peiVersion||=1;m.growthMode='witness';m.witness||={};m.book||={id:'pei_sujian',grade:'丁',witnessCount:Object.keys(m.witness).length};m.weapon='pei_sujian';
 m.equip||={weapon:'pei_sujian',armor:null,acc:null};m.equip.weapon='pei_sujian';m.load||=['pei_zhi'];m.skills||={pei_zhi:1};m.skills.pei_zhi||=1;return m;}
function recruit(world,preference='join'){const m=ensure(world);world.qiheRoster||={version:1,members:['hero',...(world.party||[])],availability:{},revision:0,commands:[]};
 if(!world.qiheRoster.members.includes(id)){world.qiheRoster.members.push(id);world.qiheRoster.revision++;}
 world.party||=[];if(!m.partyChoiceApplied){if(preference==='join'&&!world.party.includes(id)&&world.party.length<3)world.party.push(id);m.partyChoiceApplied=true;}
 return {id,level:m.lv,inParty:world.party.includes(id),full:world.party.length>=3&&!world.party.includes(id)};}
function witness(world,event,{participants=[],outcome=null,note='',completed=true}={}){
 const m=world.mates?.[id];if(!m||!completed||!allowed.has(event)||!participants.includes(id)||!(world.party||[]).includes(id)||m.witness[event])return false;
 m.witness[event]={version:1,completedAt:Date.now(),outcome,note};const n=Object.keys(m.witness).length;
 m.book.witnessCount=n;m.lv=Math.max(m.lv,Math.min(100,3+Math.floor(n/3)));
 if(n>=10&&m.witness['hg.m08']){m.book.grade='丙';m.skills.pei_wen=1;}
 if(n>=30&&world.cultivation?.mode==='complete'){m.book.grade='乙';m.skills.pei_shen=1;}
 if(n>=60&&world.flags?.pei_three_descendants){m.book.grade='甲';m.skills.pei_jiao=1;}
 return true;}
function sync(world){const s=world.cultivation;if(!s)return;const items=typeof ITEMS!=='undefined'?ITEMS:root.ITEMS||{};s.preHangao||={version:1};s.preHangao.weapon=items[world.weapon]?.weapon?.kind==='剑'?world.weapon:null;
 if(s.facts['hg.pre.loan_request']&&!s.facts['hg.pre.loan_committed']){
  world.bag||={};if(!world.weapon||items[world.weapon]?.weapon?.kind!=='剑'){
   world.bag.guiyun_wood_loan=(world.bag.guiyun_wood_loan||0)+1;world.weapon='guiyun_wood_loan';world.equipmentLoans||={};world.equipmentLoans.guiyun_wood_loan={owner:'guiyun',event:'hg_pack_review'};
  }s.facts['hg.pre.loan_committed']=true;s.preHangao.weapon=world.weapon;
 }
 if(s.facts.gy_pei_join)recruit(world,s.facts.pei_party_preference||'roster');
 s.preHangao.participants=(world.party||[]).slice();
 if(s.facts['hg.pre.road_help'])witness(world,'hg.pre.road_help',{participants:s.preHangao.roadParticipants,outcome:s.facts['hg.pre.road_help'],note:s.facts['hg.pre.road_help']==='bind'?'绳子比我以为的要紧。':'接书的人先站稳了脚。'});
}
function returnLoan(world){if(!world.equipmentLoans?.guiyun_wood_loan)return false;delete world.bag.guiyun_wood_loan;
 if(world.weapon==='guiyun_wood_loan')world.weapon=null;delete world.equipmentLoans.guiyun_wood_loan;return true;}
function reveal(target){const unknown=(target.weak||[]).find(k=>!target.known.has(k));if(unknown)target.known.add(unknown);return unknown||null;}
function cast(u,key,targets,bp=0,{lockIntent,turn=0}={}){
 const sk=skills[key],b=Math.max(0,Math.min(3,bp));if(!sk||!(u.skills||[]).includes(key)||u.mp<sk.mp)throw Error('知古此时不能施放该技能。');
 u.peiCooldown||={};if((u.peiCooldown[key]||0)>turn)throw Error('校雠尚未恢复。');
 const forecasts=key==='pei_wen'?targets.map(t=>lockIntent?.(t)):[];if(key==='pei_wen'&&forecasts.some(x=>!x))throw Error('没有可预告的下一条意图。');u.mp-=sk.mp;
 const result=[];for(const [i,t]of targets.entries()){const until=(t.peiActionSerial||0)+1;t.buffs||={};if(key==='pei_zhi'){const weak=reveal(t);t.buffs.peiFlaw={mul:1.1+b*.05,until,boundary:'end'};result.push({weak});}
  if(key==='pei_wen'){const next=forecasts[i];t.buffs.peiForecast=next;
   if(u.seenEnemyTypes?.includes(t.key||t.name))t.buffs.peiWeaken={mul:.9-b*.05,until,boundary:'end'};result.push({intent:next});}
  if(key==='pei_shen'){t.buffs.peiCare={mul:.8-b*.05,displacement:true,until,boundary:'end'};result.push({guard:true});}
  if(key==='pei_jiao'){const weak=reveal(t);if(!weak)t.buffs.peiFlaw={mul:1.1+b*.05,until,boundary:'end'};result.push({weak});}
 }if(key==='pei_jiao')u.peiCooldown[key]=turn+3;return result;
}
function consumeIncoming(t,damage){let mul=1;for(const k of ['peiCover','peiCare','peiFlaw']){const e=t.buffs?.[k];if(e){if(e.until>=(t.peiActionSerial||0))mul*=e.mul;delete t.buffs[k];}}return Math.max(1,Math.round(damage*mul));}
function defend(u){u.buffs||={};u.buffs.peiCover={mul:.75,until:(u.peiActionSerial||0)+1,boundary:'start'};}
function expire(u,_unused,boundary='end'){for(const [k,e]of Object.entries(u.buffs||{}))if(k.startsWith('pei')&&e?.boundary===boundary&&e.until<=(u.peiActionSerial||0))delete u.buffs[k];}
function actionStart(u){u.peiActionSerial=(u.peiActionSerial||0)+1;expire(u,null,'start');}
const API={id,skills,fresh,ensure,recruit,witness,sync,returnLoan,reveal,cast,consumeIncoming,defend,expire,actionStart};
if(typeof module==='object'&&module.exports)module.exports=API;else root.PeiCompanion=API;
})(globalThis);
