'use strict';
// Real animation sequence + real rule resolution; visual contacts must not add HP/shield hits.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const line=fs.readFileSync('js/qihe-cast-art.js','utf8').split('\n').find(l=>l.startsWith('BART["hero_village"]=') );
const art=JSON.parse(line.split('=',2)[1].split(';ASSETS')[0]);
let clock=0,contacts=[],sounds=[];
const c=vm.createContext({console,window:{BART:{hero_village:art}},BART:{hero_village:art},
 IMG:{[art.file]:{}},document:{createElement:()=>({getContext:()=>({})})},ok:()=>true,
 BT:{now:()=>clock},VFX:{btWait:async ms=>{clock+=ms},overlay(){},touch(u,t,p,firm){contacts.push({kind:'visual',hp:t.hp,shield:t.shield,time:clock,firm,p})},hit(u,t){contacts.push({kind:'rule',hp:t.hp,shield:t.shield,time:clock})},cast:async()=>{}},
 performance:{now:()=>clock},unitH:()=>105,battleBodyBounds:()=>({height:195,bottom:300}),
 bsfx:(...s)=>sounds.push(s),floatTxt(){},showName(){},renderCards(){},wait:async()=>{},
 chance:()=>false,rnd:(a,b)=>(a+b)/2,bpop(){},B:{shake:0,parts:[],round:1},
 SKILLS:{qh_hulu_staff:{name:'横杆护身',mp:3,pow:1.1}},BSK:{qh_hulu_staff:{t:'棍'}}});
const battle=fs.readFileSync('js/battle.js','utf8');
const strike=battle.slice(battle.indexOf('function strike('),battle.indexOf('function doBreak('));
vm.runInContext(strike+'\n'+fs.readFileSync('js/bfx.js','utf8')+'\nglobalThis.engine=BFXI',c);
function units(hp=500){return [{art:'hero_village',x:640,y:350,side:'ally',hp:128,mhp:128,id:1,atkType:'棍',atkName:'木棍',atk:20,crit:0,buffs:{},mp:20,skLv:{}},
 {x:320,y:350,side:'foe',hp,def:0,id:2,weak:['棍'],known:new Set(),shield:8,buffs:{}}]}
function reset(){clock=0;contacts=[];sounds=[]}
(async()=>{
 reset();let [u,t]=units();c.u=u;c.t=t;await vm.runInContext('doAttack(u,t,0)',c);
 assert.equal(t.hp,475);assert.equal(t.shield,7);
 assert.deepEqual(contacts.map(e=>e.kind),['visual','visual','rule']);
 assert.equal(contacts[0].firm,true);assert.equal(contacts[0].hp,500);assert.equal(contacts[1].shield,8);
 assert.equal(contacts[1].time-contacts[0].time,290);assert.equal(contacts[2].time-contacts[0].time,540);
 assert.ok(Math.abs(contacts[0].p.x-t.x)<.01,'sweep endpoint touches the actual target');
 assert.ok(sounds.filter(e=>e[0]==='staff_hit_20261010').length===3,'all three contacts use wooden hit audio');
 reset();[u,t]=units();c.u=u;c.t=t;await vm.runInContext('doAttack(u,t,2)',c);
 assert.equal(t.hp,425);assert.equal(t.shield,5);assert.equal(contacts.length,7,'3+2+2 visual contacts, 3 rules');
 reset();[u,t]=units(1);c.u=u;c.t=t;await vm.runInContext('doAttack(u,t,3)',c);
 assert.equal(t.hp,0);assert.equal(t.shield,7);assert.equal(contacts.length,3,'dead target ends BP followups');
 reset();[u,t]=units();c.u=u;c.t=t;await vm.runInContext('doSkill(u,"qh_hulu_staff",[t],0)',c);
 assert.equal(u.mp,17);assert.equal(t.shield,7);assert.equal(t.hp,472);assert.equal(u.buffs.qhGuard,true);
 // Current skill boundary: stationary cast and effect hit; only basic attacks
 // above retain the three physical staff contacts.
 assert.deepEqual(contacts.map(e=>e.kind),['rule']);
 assert.equal(u.x,640,'staff skill stays at the caster position');
 assert.equal(u.stationarySkill,true);
 // Existing wrappers used to discard the optional impact cue before reaching hurt().
 const menu=fs.readFileSync('js/menu.js','utf8'),pets=fs.readFileSync('js/pets.js','utf8');let calls=[];
 const w=vm.createContext({B:null,hurt:(...args)=>calls.push(args)});
 vm.runInContext(menu.slice(menu.indexOf('const mnHurt0=hurt;'),menu.indexOf('// 侠义事件')),w);
 vm.runInContext(pets.slice(pets.indexOf('const petHurt0=hurt;'),pets.indexOf('const petBattle0=battle;')),w);
 vm.runInContext('hurt({side:"foe"},10,"white",false,"staff_hit_20261010")',w);
 assert.equal(calls[0][4],'staff_hit_20261010','block and pet wrappers preserve contact audio');
 console.log('staff combo: basic/BP contact, stationary skill, HP/shield counts, death, wood audio and wrappers OK');
})().catch(e=>{console.error(e);process.exitCode=1});
