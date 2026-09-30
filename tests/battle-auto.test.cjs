'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let timer,cleared=0;
const c=vm.createContext({console,window:{},battleDom(){},B:null,SKILLS:{heal:{mp:6,heal:.38},sword:{mp:4,needWeapon:'剑',pow:2},area:{mp:8,pow:1}},BSK:{heal:{tgt:'ally'},sword:{t:'剑'},area:{t:'拳',tgt:'foes'}},
  aliveOf:side=>c.B.units.filter(t=>t.side===side&&t.hp>0),hitsWeak:(t,v)=>t.known.has(v.t),
  estDmg:(u,t,v)=>Math.max(1,u.atk*v.pow-t.def*.5)*(t.broken?2:1),skillPv:(u,k,bp)=>({t:c.BSK[k].t,pow:c.SKILLS[k].pow*(1+bp*.8),hits:1}),
  $:()=>null,hint(){},setTimeout:fn=>{timer=fn;return 1},clearTimeout:()=>{timer=null;cleared++}});
vm.runInContext(fs.readFileSync('js/battle-auto.js','utf8')+'\nglobalThis.ai=BattleAuto',c);
const u={side:'ally',hp:100,mhp:100,mp:20,atk:20,atkType:'拳',bp:3,skills:[],isHero:true};
const f={side:'foe',hp:200,mhp:200,def:4,shield:2,weak:['拳'],known:new Set(['拳'])};
const reset=()=>{c.B={units:[u,f],cur:u,round:1};u.skills=[];u.mp=20;u.hp=100;u.bp=3;f.hp=200;f.broken=false;f.known=new Set(['拳']);f.shield=2};
reset();let a=c.ai.choose(u);assert.equal(a.bp,1);assert.equal(a.reason,'弱点破势');
reset();u.skills=['heal'];u.hp=20;a=c.ai.choose(u);assert.equal(a.skill,'heal');assert.equal(a.targets[0],u);
reset();u.skills=['sword'];assert.equal(c.ai.choose(u).kind,'attack');
reset();u.skills=['heal','area'];u.mp=0;u.hp=10;assert.equal(c.ai.choose(u).kind,'attack');
reset();f.known=new Set();const signature=()=>{const a=c.ai.choose(u);return JSON.stringify([a.kind,a.skill,a.bp,a.score,a.reason])};const first=signature();f.weak=['剑'];assert.equal(signature(),first,'hidden weakness does not influence choices');
reset();const dead={...f,hp:0};c.B.units.push(dead);assert.ok(!c.ai.choose(u).targets.includes(dead));
reset();let submissions=0;c.ai.bind(u,()=>submissions++);assert.ok(timer==null);c.ai.toggle();assert.equal(typeof timer,'function');c.ai.toggle();assert.equal(timer,null);assert.equal(submissions,0);
c.ai.toggle();const stale=timer;c.ai.clear();stale();assert.equal(submissions,0,'stale callback cannot submit');
c.ai.bind(u,()=>submissions++);timer();assert.equal(submissions,1);c.ai.finish();assert.equal(c.B.auto,false);assert.equal(c.B.ended,true);assert.equal(c.B.autoPending,null);
reset();c.B.auto=true;let failure;const choose=c.ai.choose;c.ai.choose=()=>{throw new Error('injected strategy failure')};c.ai.bind(u,()=>assert.fail('unexpected action'),e=>failure=e);timer();assert.equal(failure.message,'injected strategy failure');assert.equal(c.B.autoPending,null);c.ai.choose=choose;
console.log('battle auto: healing, known weaknesses, BP, weapon/MP limits, dead targets, toggle and stale timer cleanup OK');
