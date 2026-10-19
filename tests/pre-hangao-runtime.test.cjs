'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../js/qh-mode-cultivation-core'),V=require('../js/qh-mode-cultivation-visitors'),PH=require('../js/qh-pre-hangao'),P=require('../js/pei-companion');
function finish(s,index=0){for(let guard=0;guard<200&&s.pending;guard++){
 if(s.pending.stage==='result'){C.closeResult(s);return;}
 if(s.pending.visitor.phase==='choice')C.visitorChoose(s,index);else C.visitorNext(s);
 }assert.fail('nonterminating dialogue');}
function playToGate(route){const s=C.initial();C.join(s);const ids=[];
 for(let guard=0;guard<180&&s.mode!=='journey';guard++){
  if(s.summary){s.summary=null;continue;}const due=C.dueStory(s);
  if(due){C.start(s,due.id);ids.push(due.id);finish(s);continue;}
  if(route&&s.month===2&&!s.learned[route])s.learned[route]={source:route==='sword'?'K01':'K02',period:C.period(s)};
  if(s.mode==='home')C.advance(s);else assert.fail('blocked at '+s.mode+' '+C.period(s));
 }return{s,ids};}
test('all-rest route reaches gate with the mandatory queue, no external moves',()=>{
 const {s,ids}=playToGate();assert.equal(s.mode,'journey');assert.equal(C.period(s),20);assert.equal(s.energy,0);
 assert.equal(s.facts['hg.pre.gate_handoff'],true);assert.equal(s.learned.sword,undefined);assert.equal(s.learned.fist,undefined);
 for(const id of ['hg_aftercare','hg_trace_reply','hg_pack_review','hg_farewell','hg_road','hg_gate'])assert.equal(ids.filter(i=>i===id).length,1,id);
 assert.ok(ids.indexOf('gn_depart')<ids.indexOf('gy_m08'));assert.ok(ids.indexOf('gy_m08')<ids.indexOf('hg_farewell'));
 C.returnJourney(s);assert.equal(s.month,6);assert.equal(s.phase,0);assert.equal(s.energy,12);
});
test('cannot skip an unfinished mandatory scene; sword and fist also leave normally',()=>{
 const s=C.initial();C.join(s);assert.throws(()=>C.advance(s),/先完成/);
 for(const route of ['sword','fist'])assert.equal(playToGate(route).s.mode,'journey');
});
test('Pei introduction reads completed facts rather than relationship score',()=>{
 for(const [facts,want,forbid]of [[{},'我叫裴知古','风吹书页'],[{gn_lamp_seen:true},'又见面了','后来呢'],[{gn_lamp_seen:true,gn_chests_choice:'own'},'后来呢','我叫裴知古']]){
  const s=C.initial();s.facts=facts;s.relations={pei:{score:100}};const c={...PH.extra(s),footwork:false,sword:false,fist:false,opening:{chen_injury:'unknown'},delivery:null};
  const x=V.script('gn_depart',c),text=[...x.intro,...x.choices[0].lines,...x.closing].map(l=>l.text).join('');assert.ok(text.includes(want));assert.ok(!text.includes(forbid));
 }
});
test('started dialogue is frozen through restoration and data changes',()=>{
 const s=C.initial();C.join(s);C.start(s,'gy_noodles');C.visitorNext(s);const before=V.current(s.pending).text;
 const restored=C.restore(s);assert.equal(V.current(restored.pending).text,before);assert.equal(restored.pending.visitor.version,2);
 const data=PH.data.scenes.find(x=>x.id==='gy_noodles'),saved=data.opening[1].text;data.opening[1].text='temporary test mutation';
 assert.equal(V.current(restored.pending).text,before);data.opening[1].text=saved;
 const legacy={action:'gn_depart',visitor:{version:1,phase:'intro',cursor:0,selected:null,context:{footwork:false,sword:false,fist:false,delivery:null,rel:{},pei:{chests:null}}}};
 assert.doesNotThrow(()=>V.validate(legacy));
});
test('fixed join level, full party, refusal and repeat reconciliation',()=>{
 const world={lv:80,party:['ye','a','b']};const r=P.recruit(world);assert.equal(r.level,3);assert.equal(r.full,true);assert.deepEqual(world.party,['ye','a','b']);
 assert.ok(world.qiheRoster.members.includes(P.id));world.mates[P.id].lv=7;P.recruit(world);assert.equal(world.mates[P.id].lv,7);
 const roster={party:[]};P.recruit(roster,'roster');assert.deepEqual(roster.party,[]);
});
test('only a real completed white-listed event with a participating active Pei gives one witness',()=>{
 const w={party:[]};P.recruit(w);const receipt={participants:[P.id],completed:true};
 assert.equal(P.witness(w,'battle-1',receipt),false);assert.equal(P.witness(w,'hg.pre.road_help',{...receipt,completed:false}),false);
 assert.equal(P.witness(w,'hg.pre.road_help',{participants:[]}),false);w.party=[];assert.equal(P.witness(w,'hg.pre.road_help',receipt),false);
 w.party=[P.id];assert.equal(P.witness(w,'hg.pre.road_help',receipt),true);assert.equal(P.witness(w,'hg.pre.road_help',{...receipt,outcome:'bind'}),false);
 assert.equal(w.mates[P.id].book.witnessCount,1);assert.equal(w.mates[P.id].lv,3);
});
test('teaching loan is unique; later owned weapon and unrelated inventory survive return',()=>{
 global.ITEMS={wood:{weapon:{kind:'剑'}},iron:{weapon:{kind:'剑'}},guiyun_wood_loan:{weapon:{kind:'剑'}}};
 const w={cultivation:C.initial(),bag:{bun:2},weapon:null,party:[]};w.cultivation.facts['hg.pre.loan_request']=true;P.sync(w);P.sync(w);
 assert.equal(w.bag.guiyun_wood_loan,1);assert.equal(w.weapon,'guiyun_wood_loan');w.weapon='iron';P.returnLoan(w);assert.equal(w.weapon,'iron');assert.equal(w.bag.bun,2);assert.equal(w.bag.guiyun_wood_loan,undefined);
 const owned={cultivation:C.initial(),bag:{},weapon:'iron',party:[]};owned.cultivation.facts['hg.pre.loan_request']=true;P.sync(owned);assert.equal(owned.bag.guiyun_wood_loan,undefined);
});
test('book support consumes MP once, reveals without damage/shield loss and expires once',()=>{
 const u={skills:Object.keys(P.skills),mp:40,buffs:{}},t={hp:100,shield:3,weak:['剑','火'],known:new Set(),buffs:{}};
 P.cast(u,'pei_zhi',[t],3,{turn:1});assert.equal(u.mp,36);assert.equal(t.hp,100);assert.equal(t.shield,3);assert.equal(t.known.size,1);
 assert.equal(P.consumeIncoming(t,80,1),100);assert.equal(P.consumeIncoming(t,80,1),80);
 P.defend(u,1);assert.equal(P.consumeIncoming(u,40,1),30);assert.equal(P.consumeIncoming(u,40,1),40);
 P.cast(u,'pei_shen',[u],3,{turn:1});assert.equal(P.consumeIncoming(u,100,1),65);
 P.cast(u,'pei_jiao',[t],0,{turn:1});assert.equal(t.known.size,2);assert.throws(()=>P.cast(u,'pei_jiao',[t],0,{turn:2}),/尚未恢复/);
 assert.equal(u.mp,20);P.cast(u,'pei_wen',[t],0,{turn:1,lockIntent:()=>({sk:'blade'})});assert.equal(u.mp,14);assert.deepEqual(t.buffs.peiForecast,{sk:'blade'});
});
