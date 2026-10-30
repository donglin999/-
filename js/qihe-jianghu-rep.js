'use strict';
// 门派关系与声誉：存档、结算与查询
(()=>{
 if(typeof isQiheEntry!=='function'||!isQiheEntry())return;
 const D=window.QiheJianghuData;if(!D)return;
 const listeners=new Map();
 const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,Math.round(Number(n)||0)));
 const seg=()=>String(S?.segmentId||S?.prologue?.segment||S?.scene||'kaishi');
 const part=()=>S?.prologue?.part||S?.part||'kaishi';
 function ensure(){if(!S.jianghu||typeof S.jianghu!=='object')S.jianghu={};const j=S.jianghu;
  if(!j.ver||j.ver<2){if(j.fame==null)j.fame=clamp((Number(j.xia)||0)-(Number(j.e)||0),-100,100);j.ver=2}
  j.faction=j.faction&&typeof j.faction==='object'?j.faction:{};
  Object.entries(D.FACTIONS).forEach(([id])=>{const f=j.faction[id]||{};j.faction[id]={score:clamp(f.score??0,-100,100),met:!!f.met,hostile:!!f.hostile,greetSeg:f.greetSeg||null,mendSeg:f.mendSeg||null}});
  j.fame=clamp(j.fame??0,-100,100);j.bossHit=j.bossHit&&typeof j.bossHit==='object'?j.bossHit:{};j.fameOnce=j.fameOnce&&typeof j.fameOnce==='object'?j.fameOnce:{};j.log=Array.isArray(j.log)?j.log.slice(-60):[];return j
 }
 function on(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);return()=>listeners.get(type)?.delete(fn)}
 function emit(type,payload={}){for(const fn of listeners.get(type)||[])fn(payload)}
 function showToast(text){if(typeof window.toast==='function')window.toast(text,2100)}
 function log(kind,id,delta,reason,npc){const j=ensure();if(!delta)return;j.log.push({seg:seg(),kind,id,delta,reason:String(reason||''),npc:npc||null});j.log=j.log.slice(-60)}
 function boundForFaction(id){const lim=D.PART_LIMITS[part()]?.faction||[-100,100];return [Math.max(lim[0],D.FACTIONS[id]?.floor??-100),lim[1]]}
 function amountOf(spec,p){if(typeof spec==='number')return spec;if(spec?.from)return Number(p[spec.from])||0;if(spec?.by)return Number(spec.map?.[String(p[spec.by])])||0;return 0}
 function applyFame(delta,reason,npc){const j=ensure(),before=j.fame,lim=D.PART_LIMITS[part()]?.fame||[-100,100];j.fame=clamp(before+delta,lim[0],lim[1]);const actual=j.fame-before;log('fame','fame',actual,reason,npc);return actual}
 function applyFaction(id,delta,reason,npc){if(!D.FACTIONS[id])return 0;const j=ensure(),f=j.faction[id],before=f.score;const lim=boundForFaction(id);f.score=clamp(before+delta,lim[0],lim[1]);f.met=true;f.hostile=f.score<=-11;const actual=f.score-before;log('faction',id,actual,reason,npc);return actual}
 function fold(npcId,delta,reason){const m=D.MEMBERS[npcId];if(!m||!m.faction||m.hidden&&!S.flags?.jianghuLinguanshiRevealed)return 0;const weight=D.RANK_WEIGHT[m.rank]||10;const abs=Math.abs(delta)/weight;if(delta>0&&abs<1)return 0;let n=Math.sign(delta)*Math.round(abs);if(delta<0&&n===0)n=-1;if(n)applyFaction(m.faction,n,reason,npcId);return n}
 function implicate(npcId,delta,reason,once){const m=D.MEMBERS[npcId],boss=m?.boss===undefined?D.FACTIONS[m?.faction]?.boss:m.boss;if(!boss||!m?.faction)return 0;const id=m.faction+':'+seg();if(once==='segment'&&ensure().bossHit[id]===seg())return 0;if(once==='segment')ensure().bossHit[id]=seg();return applyFaction(m.faction,delta,reason,boss)}
 function runOp(op,p){const npcId=p.npcId||p.id,reason=p.reason||p.type,delta=amountOf(op.amount,p);if(op.op==='fame')return applyFame(delta,reason,npcId);if(op.op==='faction')return applyFaction(D.MEMBERS[npcId]?.faction||p.faction,delta,reason,npcId);if(op.op==='fold')return fold(npcId,delta,reason);if(op.op==='implicate')return implicate(npcId,delta,reason,op.once);if(op.op==='bond'){emit('bond_change',{npcId,delta,reason:op.reason||reason});return 0}if(op.op==='factionSet'){const id=p.faction||p.id;if(!D.FACTIONS[id])return 0;return applyFaction(id,op.value-(ensure().faction[id]?.score||0),reason,npcId)}if(op.op==='factionMany')return Object.entries(p[op.from]||{}).reduce((a,[id,n])=>a+applyFaction(id,n,reason,npcId),0);return 0}
 function settle(type,payload={}){const rules=D.EVENT_RULES[type];if(!rules)return{ok:false,changed:0};const j=ensure();let changed=0;const mark=j.log.length,before=Object.fromEntries(Object.keys(D.FACTIONS).map(id=>[id,stage(id)?.name])),fameBefore=fameLevel().name;rules.forEach(op=>{const key=type+':'+(payload.npcId||'');if(op.once==='npc'&&j.fameOnce[key])return;const result=runOp(op,{...payload,type});if(op.once==='npc')j.fameOnce[key]=true;changed+=Number(result)||0});const fresh=j.log.slice(Math.min(mark,j.log.length));if(fresh.length)notify(fresh,before,fameBefore);return{ok:true,changed,jianghu:j}}
 // 2026-10-27 右上纸签（qihe-jianghu-slips.js）：同一下的变化按势力合并，跨档加朱印；没有纸签模块时退回一行 toast
 function notify(fresh,before,fameBefore){const sum=new Map();for(const e of fresh){const k=e.kind==='fame'?'fame':e.id;const o=sum.get(k)||{delta:0,reason:e.reason};o.delta+=e.delta;sum.set(k,o)}
  const rows=[...sum].filter(([,o])=>o.delta).map(([k,o])=>{const fame=k==='fame',f=D.FACTIONS[k],now=fame?fameLevel().name:stage(k)?.name,was=fame?fameBefore:before[k];
   return{glyph:fame?'名':f?.glyph||'？',name:fame?'声誉':f?.name||'关系',delta:o.delta,reason:D.REASON_TEXT?.[o.reason]||'',cross:now&&was&&now!==was?(o.delta<0?'落入':'升至')+now:'',color:fame?'#3a3a32':f?.color}});
  if(!rows.length)return;if(window.QiheJianghuSlips)return QiheJianghuSlips.slips(rows);const r=rows[rows.length-1];showToast(`${r.name} ${r.delta>0?'+':''}${r.delta} · ${r.reason||'其他'}`)}
 function stage(fid){const f=ensure().faction[fid];if(!f)return null;const st=D.STAGES.find(x=>f.score>=x.min);return{id:st.id,name:st.name,score:f.score,hostile:!!st.hostile,met:f.met}}
 function fameLevel(){const score=ensure().fame,st=D.FAME_STAGES.find(x=>score>=x.min);return{id:st.id,name:st.name,score,abs:Math.abs(score)}}
 function gate(npcId,act){const m=D.MEMBERS[npcId];if(!m)return{ok:true,why:null};const fs=m.faction&&stage(m.faction),fg=fs&&D.GATE[fs.id]?.[act];if(fg)return{ok:false,why:fg};const personal=(v=>Number(typeof v==='object'?v?.score:v)||0)(S.bond?.[npcId]??S.qiheBond?.[npcId]);if(personal<=-50)return{ok:false,why:'bond_hostile'};if(personal<=-20)return{ok:false,why:'bond_hate'};return{ok:true,why:null}}
 function priceMul(npcId){const m=D.MEMBERS[npcId],f=m?.faction&&stage(m.faction),p=(v=>Number(typeof v==='object'?v?.score:v)||0)(S.bond?.[npcId]??S.qiheBond?.[npcId]),list=[f&&D.GATE[f.id]?.priceMul,p<=-20?1.1:p>=80?.85:p>=50?.9:null,D.FAME_GATE[fameLevel().id]?.priceMul].filter(Number.isFinite);return list.length?Math.max(...list):null}
 function firstMeet(npcId){const m=D.MEMBERS[npcId],f=m?.faction&&stage(m.faction),a=D.GATE[f?.id]?.firstMeet||0,b=D.FAME_GATE[fameLevel().id]?.firstMeet||0;return clamp(a+b,-10,10)}
 function migrate(){return ensure()}
 on('steal_caught',p=>settle('steal_caught',p));
 window.QiheJianghu={settle,stage,fameLevel,gate,priceMul,firstMeet,on,emit,migrate,ensure};
})();
