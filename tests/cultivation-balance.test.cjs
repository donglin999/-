'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../js/qh-mode-cultivation-core'),D=require('../js/qh-mode-cultivation-data'),G=require('../js/qh-mode-cultivation-growth'),N=require('../js/qh-mode-cultivation-balance'),V=require('../js/qh-mode-cultivation-visitors');
const act=id=>D.actions.find(a=>a.id===id);
function ready(){const s=C.initial();C.join(s);s.learned.stance={source:'B03'};s.mood=50;return s;}
function perform(s,id){C.start(s,id,{directResult:true});if(s.pending.visitor){let guard=0;while(s.pending.stage!=='result'&&guard++<100){if(s.pending.visitor.phase==='choice')C.visitorChoose(s,0);else C.visitorNext(s);}assert.ok(guard<100);}else C.resolve(s,0,{directResult:true});const r=s.pending.result;C.closeResult(s);return r;}
let s=ready();s.progress.observation=170;const result=perform(s,'B06');assert.equal(result.gain,60);assert.equal(C.growth(s).bonuses.crit,1);assert.equal(C.growth(s).bonuses.dodge,0);assert.equal(s.progress.observation,230);assert.equal(result.learning.efficiency,6);
s=ready();const soft=perform(s,'B04');assert.equal(soft.gainKey,'coordination');assert.equal(s.progress.foundation,undefined);
for(const mood of [0,20,40,60,80]){s=ready();s.mood=mood;assert.equal(N.preview(s,act('K02')).gain,5*(3+N.mood(s).index));}
s=ready();const simple=N.preview(s,act('K02')).gain;s.progress.understanding=100;assert.ok(N.preview(s,act('K02')).gain>simple);
s=ready();perform(s,'K02');assert.equal(N.level(s,N.artById('system_gy_foundation_p')),1);C.syncMode(s);s.mood=50;perform(s,'K02');assert.equal(N.level(s,N.artById('system_gy_foundation_p')),2);C.syncMode(s);s.mood=50;perform(s,'K02');C.syncMode(s);s.mood=50;perform(s,'K02');assert.equal(N.level(s,N.artById('system_gy_foundation_p')),3);assert.equal(s.martialXp.system_gy_foundation_p,75);s.month=6;C.syncMode(s);s.mood=50;perform(s,'K02');assert.equal(s.martialXp.system_gy_foundation_p,105);
let old={version:1,...ready()};delete old.balanceVersion;delete old.martialXp;old.progress={foundation:80,sword:60,observation:40};old.learned.sword={};old.history=[{id:'old',action:'K01',gain:8,period:0}];const w={st:{str:4,con:5,agi:3,wil:3,wis:3},skills:{guiyun_sword:3},prof:{guiyun_sword:10},load:['guiyun_sword'],cultivation:old};C.reconcileWorld(w);const once=JSON.stringify(w);C.reconcileWorld(w);assert.equal(JSON.stringify(w),once);assert.equal(w.skills.gy_s1,3);assert.ok(w.st.con>=5);assert.ok(C.growth(w.cultivation).bonuses.crit>=2);
// Old uncompleted activity retains its paid cost and original reward unit, once.
old=ready();old.progress={observation:18};C.start(old,'B06');delete old.balanceVersion;delete old.martialXp;delete old.pending.balanceVersion;const resumed=C.restore(old);assert.equal(resumed.progress.observation,180);assert.equal(resumed.pending.legacyBalance,true);const paid=resumed.energy,legacyResult=C.resolve(resumed,0,{directResult:true});assert.equal(legacyResult.gain,60);assert.equal(resumed.progress.observation,240);assert.equal(resumed.energy,paid);assert.equal(C.resolve(resumed,0),legacyResult);assert.equal(resumed.history.length,1);
// A saved first lesson must never be imported at the old cap merely because it is learned.
old=ready();delete old.balanceVersion;old.progress={sword:8};old.learned.sword={};old.history=[{id:'first-only',action:'K01',gain:8,period:0}];const firstWorld={cultivation:old,st:{str:3,con:3,agi:3,wil:3,wis:3},skills:{gy_s1:1}};C.reconcileWorld(firstWorld);assert.equal(firstWorld.skills.gy_s1,1);
old=ready();delete old.balanceVersion;old.learned.sword={};old.progress={sword:80};const advancedOld={cultivation:old,st:{str:3,con:3,agi:3,wil:3,wis:3},skills:{gy_s1:7},prof:{gy_s1:0}};C.reconcileWorld(advancedOld);assert.equal(advancedOld.skills.gy_s1,7);assert.equal(N.cap(old,N.artById('system_gy_foundation_s')),7);old.month=6;assert.equal(N.cap(old,N.artById('system_gy_foundation_s')),10);
s=ready();s.learned.cooking={};s.progress.cooking=36;s.resources.grain=1;s.mood=50;const food=perform(s,'P02');assert.equal(food.outputs.food,3);assert.equal(s.resources.grain,0);assert.equal(s.resources.food,3);
s=ready();s.learned.qh_hulu_staff={};D.actions.push({id:'QH01',category:'skill',gain:'qh_staff',amount:8,requires:['qh_hulu_staff']});perform(s,'QH01');assert.match(C.availability(s,act('QH01')),/本期笔记/);
for(const a of D.actions.filter(a=>a.gain))assert.ok(N.rules[a.gain],a.id+' has real consumer');
const variants=[];
function snapshot(s){const g=C.growth(s);return{state:JSON.parse(JSON.stringify(s)),month:s.month,phase:s.phase,stats:N.stats(s),bonuses:g.bonuses,learned:Object.fromEntries(Object.values(g.martial).map(a=>[a.name,a.level])),mood:s.mood,efficiency:N.efficiency(s),actions:s.history.filter(h=>h.cost>0).length,cost:s.history.reduce((n,h)=>n+h.cost,0)};}
for(const policy of ['mixed','martial','social','master'])for(const route of ['sword','fist']){
 const s=C.initial();C.join(s);const snapshots=[],misses=[],free=[],counts={};let periods=0;
 while(s.mode!=='complete'){
  if(s.mode==='journey_ready'){C.depart(s);C.returnJourney(s);continue;}
  if(s.mode==='story'){C.completeStory(s,'请陆衡指导');continue;}
  // Play due mandatory scenes through their real dialogue state machine. Examination
  // choices here are content fixtures; combat outcome is measured separately.
  let due,guard=0;while((due=C.dueStory(s))&&guard++<30){perform(s,due.id);free.push(due.id);}
  periods++;
  const available=D.actions.filter(a=>!C.availability(s,a)),advanced=available.filter(a=>a.id.startsWith('TR_')&&a.category==='skill'&&!s.learned[a.learn]);
  const mainArts=N.library.arts.filter(a=>a.type==='external'&&a.path===(route==='sword'?'剑':'拳掌')&&s.learned[a.key]);const innerAction=N.library.arts.filter(a=>a.type==='inner'&&a.id!=='xf_guanlan'&&s.learned[a.key]).at(-1)?.action||'B01';const main=mainArts.at(-1)?.action||(route==='sword'?'K01':'K02');
  let plan=policy==='mixed'?[['B03','A01','A05'],['B02',main,'C01'],['B01',main,'C01'],[main,'A01','A02'],['A05','A01','C01']][s.phase]:policy==='martial'?[['B03',main,'C01'],['B02',main,'C01'],['B01',main,'C01'],['A01',main,'A05'],['B03','B02','C01']][s.phase]:[['B03','A01','A05'],[main,'A02','C01','D04'],['B02','A03','A06'],['B01','A01','C01','D05'],['A01','A05','A06','C01']][s.phase];
  plan=plan.map(id=>id==='B01'?innerAction:id);if(!s.learned.stance)plan=['B03',route==='sword'?'K01':'K02','C01'];
  else if(advanced.length)plan=[advanced[0].id,'A01','A05'];
  const inner=available.find(a=>a.id.startsWith('TR_xf_')&&!s.learned[a.learn]);if(inner)plan=[inner.id,main,'C01'];
  if(policy==='master'){
   plan=[];let guard=0;while(s.energy>=3&&guard++<8){let id;
    const available=D.actions.filter(a=>!C.availability(s,a));
    const next=available.find(a=>a.id.startsWith('TR_')&&!s.learned[a.learn]);
    const st=N.stats(s),current=N.library.arts.filter(a=>a.path===(route==='sword'?'剑':'拳掌')&&s.learned[a.key]).at(-1);
    if(!s.learned.stance)id='B03';else if(!s.learned[route])id=route==='sword'?'K01':'K02';else if((s.progress.understanding||0)<325)id='A01';else if(next)id=next.id;
    else {const inner=N.library.arts.filter(a=>a.type==='inner'&&s.learned[a.key]).find(a=>N.level(s,a)<(a.id==='tuna'?2:a.id==='xf_guiyun'?5:5));
     if(inner)id=inner.action;else if(current&&N.level(s,current)<7)id=current.action;else if(st.wil<10)id=innerAction;else if(st.con<8)id='B03';else if(st.agi<10)id='B02';else if(st.str<10)id=main;else if(current&&N.level(s,current)<10)id=current.action;else id='B06';}
    if(C.availability(s,act(id)))break;perform(s,id);counts[id]=(counts[id]||0)+1;
   }
  }
  for(const id of policy==='master'?[]:plan){if(C.availability(s,act(id)))continue;if(id==='C01'){C.start(s,id,{theme:'近况',recipient:'陆衡',directResult:true});C.resolve(s,0,{directResult:true});C.closeResult(s);}else perform(s,id);counts[id]=(counts[id]||0)+1;}
  if([4,12,24,36].includes(s.month)&&s.phase===4)snapshots.push(snapshot(s));C.advance(s);s.summary=null;
 }
 assert.equal(periods,149);assert.ok(s.history.reduce((n,h)=>n+h.cost,0)<=1788);assert.ok(snapshots.at(-1).stats.str>=3);variants.push({policy,route,periods,counts,snapshots,automaticScenes:free.length});
}
const out=path.resolve(__dirname,'../review/cultivation-balance-20261012');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'growth-report.json'),JSON.stringify({status:'pass',variants},null,2));console.log(JSON.stringify({status:'pass',variants:variants.map(v=>({policy:v.policy,route:v.route,final:v.snapshots.at(-1)}))},null,2));
