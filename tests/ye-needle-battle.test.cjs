'use strict';
// Run real dispatch and strike functions with a controlled battle clock.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const artContext=vm.createContext({BART:{},ASSETS:[]});vm.runInContext(fs.readFileSync('js/qihe-battle-art.js','utf8'),artContext);
const art=artContext.BART.ye_initial;
let clock=0,events=[],sounds=[],rules=[];
const c=vm.createContext({console,window:{BART:{ye_initial:art}},BART:{ye_initial:art},IMG:{[art.file]:{}},document:{createElement:()=>({getContext:()=>({})})},ok:()=>true,
 BT:{now:()=>clock},VFX:{btWait:async ms=>{clock+=ms},overlay(){},needleFlight(p,t,ms){events.push({kind:'launch',time:clock,hp:t.hp,shield:t.shield,p,ms})},needleImpact(t){events.push({kind:'arrival',time:clock,hp:t.hp,shield:t.shield})},hit(){events.push({kind:'legacy-hit',time:clock})},cast:async()=>{events.push({kind:'legacy-cast'})}},
 performance:{now:()=>clock},unitH:()=>105,battleBodyBounds:()=>({height:192,bottom:258}),bsfx:(...a)=>sounds.push(a),floatTxt(){},showName(){},renderCards(){},wait:async()=>{},chance:()=>false,rnd:(a,b)=>(a+b)/2,bpop(){},reveal(t,n){t.revealed=n},B:{shake:0,parts:[],round:1},SKILLS:{jinzhen:{name:'金针刺穴',mp:4,pow:1}},BSK:{jinzhen:{t:'暗器',reveal:1}}});
const battle=fs.readFileSync('js/battle.js','utf8');vm.runInContext(battle.slice(battle.indexOf('function strike('),battle.indexOf('function doBreak('))+'\n'+fs.readFileSync('js/bfx.js','utf8')+'\nglobalThis.engine=BFXI',c);
const strike=c.strike;c.strike=(u,t,spec)=>{rules.push({time:clock,hp:t.hp,shield:t.shield});return strike(u,t,spec)};
function units(hp=500){return [{art:'ye_initial',x:640,y:350,side:'ally',hp:128,mhp:128,id:1,atkType:'暗器',atkName:'飞针',atk:20,crit:0,buffs:{},mp:20,skLv:{jinzhen:1}}, {x:300,y:350,side:'foe',hp,def:0,id:2,weak:['暗器'],known:new Set(),shield:8,buffs:{}}]}
function reset(){clock=0;events=[];sounds=[];rules=[]}
(async()=>{
 for(const bp of [0,2]){
  reset();const [u,t]=units();c.u=u;c.t=t;await vm.runInContext(`doAttack(u,t,${bp})`,c);
  assert.equal(t.hp,500-25*(1+bp));assert.equal(t.shield,8-(1+bp));assert.equal(rules.length,1+bp);
  const launch=events.filter(e=>e.kind==='launch'),arrival=events.filter(e=>e.kind==='arrival');
  assert.equal(launch.length,1+bp);assert.equal(arrival.length,1+bp);
  for(let i=0;i<launch.length;i++){assert.equal(arrival[i].time-launch[i].time,launch[i].ms);assert.equal(rules[i].time,arrival[i].time);assert.equal(launch[i].hp,500-25*i);assert.equal(launch[i].shield,8-i);assert.ok(launch[i].p.x>500,'release remains distant from target');}
  assert.equal(events.some(e=>e.kind==='legacy-hit'),false);assert.equal(sounds.filter(s=>s[0]==='needle_hit_20261012').length,1+bp);assert.equal(t._kbAmt,6);assert.equal(u.mv.x1,0);
 }
 reset();let [u,t]=units();c.u=u;c.t=t;await vm.runInContext('doSkill(u,"jinzhen",[t],1)',c);
 assert.equal(u.mp,16);assert.equal(t.hp,455);assert.equal(t.shield,7);assert.equal(t.revealed,2);assert.equal(rules.length,1);
 assert.equal(events.filter(e=>e.kind==='launch').length,0);assert.equal(events.filter(e=>e.kind==='arrival').length,0);assert.equal(events.filter(e=>e.kind==='legacy-cast').length,1);assert.equal(events.filter(e=>e.kind==='legacy-hit').length,1);assert.equal(u.mv,undefined);assert.equal(u.x,640);assert.equal(u.y,350);
 reset();[u,t]=units(1);c.u=u;c.t=t;await vm.runInContext('doAttack(u,t,3)',c);assert.equal(t.hp,0);assert.equal(rules.length,1);assert.equal(events.filter(e=>e.kind==='launch').length,1);
 const a=art.anim;for(const state of ['idle','dash','atk','atk2','hurt','cast','brk','dead','win'])assert.ok(a[state]?.f.length);
 assert.equal(c.engine.impactMs(u,'atk'),430);assert.equal(c.engine.impactMs(u,'atk2'),220);assert.equal(c.engine.impactMs(u,'needle_skill'),450);
 // The same roster/stats/enemies remain in the story; only an isolated review permits auto.
 const source=fs.readFileSync('js/prologue-story-battle.js','utf8');assert.ok(source.includes("get('battleReview')==='ye'"));assert.ok(source.includes('allowAuto:autoReview'));assert.ok(source.includes('hpMul:.43,atkMul:.36,shield:2'));
 console.log('Ye needle: release -> flight -> real HP/shield impact; range, BP, skill MP/reveal, death cutoff and nine states OK');
})().catch(e=>{console.error(e);process.exitCode=1});
