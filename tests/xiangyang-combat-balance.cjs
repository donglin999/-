'use strict';
// Real battleLoop, foeAct, strike, doAttack and doSkill with a deterministic player policy.
// Only animation waits, DOM painting and input selection are replaced. No enemy stats or outcomes are patched.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const base=path.join(__dirname,'../js');
const core=fs.readFileSync(path.join(base,'core.js'),'utf8');
const battle=fs.readFileSync(path.join(base,'battle.js'),'utf8');
const story=fs.readFileSync(path.join(base,'story.js'),'utf8');
const coreData=core.slice(core.indexOf('const ORIGINS='),core.indexOf('// ───────────────────────── 画面基础'));
const mkSource=story.slice(story.indexOf('function mk(k){'),story.indexOf('async function ending('));

const fights={
  thugs:['thug','thug'],scarliu:['scarliu','thug'],raid:['pirate','pirate','pirate'],
  langli:['langli','pirate','pirate'],gate:['bandit','bandit','gatedog','gatedog'],
  snake:['snake'],chief:['chief','bandit','bandit']};
const profiles={
  start:{lv:1,st:{str:4,con:4,agi:4,wil:3,wis:3},hp:1,mp:1,bag:{bun:2},party:['ye']},
  common:{lv:3,st:{str:5,con:5,agi:5,wil:4,wis:4},hp:1,mp:1,bag:{bun:2,pill:1},weapon:'wood',armor:'cloth',party:['ye','suzhi']},
  low:{lv:3,st:{str:5,con:5,agi:5,wil:4,wis:4},hp:.55,mp:.25,bag:{bun:0},weapon:'wood',armor:'cloth',party:['ye','suzhi'],allyHp:.65,allyMp:.25},
};
function seeded(seed){let x=seed>>>0;return()=>((x=(1664525*x+1013904223)>>>0)/4294967296)}
async function trial(profileName,fightName,seed){
  const p=profiles[profileName],math=Object.create(Math);math.random=seeded(seed);
  const ctx=vm.createContext({Math:math,window:{},IMG:{},performance:{now:()=>1},
    SKILLS:undefined,ITEMS:undefined,Set,Map,
    rnd:(a,b)=>a+math.random()*(b-a),ri:(a,b)=>Math.floor(a+math.random()*(b-a+1)),
    chance:v=>math.random()*100<v,wait:async()=>{},clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
    ok:()=>false,$:()=>null,addEventListener:()=>{},
    VFX:{reset(){},act(){},hit(){},cast:async()=>{},brk(){}},
    renderCards(){},hud(){},console,
  });
  vm.runInContext(coreData,ctx,{filename:'core-data.js'});
  vm.runInContext(battle,ctx,{filename:'battle.js'});
  vm.runInContext(mkSource,ctx,{filename:'story-mk.js'});
  ctx.__profile=p;ctx.__fight=fights[fightName];ctx.__fightName=fightName;
  vm.runInContext(`
    S=newState();S.name='萧白';S.st={...__profile.st};S.lv=__profile.lv;
    S.skills={fist:1};S.weapon=__profile.weapon||null;S.armor=__profile.armor||null;
    S.bag={...__profile.bag};S.party=[...__profile.party];
    const sd=derived();S.hp=Math.max(1,Math.round(sd.mhp*__profile.hp));S.mp=Math.round(sd.mmp*__profile.mp);
    PARTY_DEF.ye={name:'叶蘅',art:['lady'],por:['lady'],st:{str:3,con:4,agi:5,wil:5,wis:6},
      skills:['huichun','baicao'],atkType:'暗器',atkName:'药针'};
    renderCards=()=>{};
    let allies=[mkHero(),...S.party.map(k=>mkAlly(k))];
    if(__profile.allyHp)for(const u of allies.slice(1))u.hp=Math.max(1,Math.round(u.mhp*__profile.allyHp));
    if(__profile.allyMp)for(const u of allies.slice(1))u.mp=Math.round(u.mmp*__profile.allyMp);
    let foes=__fight.map(k=>mkFoe(mk(k)));
    layoutUnits(allies,foes,{boss:__fightName==='scarliu'||__fightName==='chief'});
    B={opt:{},allies,foes,units:[...allies,...foes],round:0,fx:[],parts:[],shake:0,cur:null,order:[],next:[],done:new Set(),
      bpUse:0,jit:new Map(),log:''};
    const initial=allies.map(u=>({name:u.name,hp:u.hp,mp:u.mp}));
    allyTurn=async function(u){
      const alive=B.foes.filter(t=>t.hp>0);
      if(!alive.length)return;
      const wounded=B.allies.filter(a=>a.hp>0&&a.hp/a.mhp<.5).sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp)[0];
      if(u.key==='ye'||u.key==='suzhi'){
        if(wounded&&u.mp>=SKILLS.huichun.mp){await doSkill(u,'huichun',[wounded],0);return}
        if(u.key==='suzhi'&&u.mp>=SKILLS.jinzhen.mp){await doSkill(u,'jinzhen',[alive[0]],0);return}
      }
      if(u.isHero&&u.hp/u.mhp<.35&&S.bag.bun>0){S.bag.bun--;heal(u,ITEMS.bun.heal);return}
      // 只依据战斗界面已经揭示的弱点，不读取隐藏的 weak 列表。
      const target=alive.slice().sort((a,b)=>Number(b.known.has(u.atkType))-Number(a.known.has(u.atkType))||a.hp-b.hp)[0];
      const bp=u.bp>=2?Math.min(2,u.bp):0;
      if(bp){u.bp-=bp;u.boosted=true}
      await doAttack(u,target,bp)
    };
  `,ctx);
  if(process.env.BATTLE_AUTO==='1'){
    vm.runInContext(fs.readFileSync(path.join(base,'battle-auto.js'),'utf8'),ctx,{filename:'battle-auto.js'});
    vm.runInContext(`allyTurn=async function(u){const a=BattleAuto.choose(u);if(!a)return;
      assertAction(a,u);if(a.bp){u.bp-=a.bp;u.boosted=true}
      if(a.kind==='skill')await doSkill(u,a.skill,a.targets,a.bp);else await doAttack(u,a.targets[0],a.bp)
    }`,ctx);
    ctx.assertAction=(a,u)=>{assert.ok(a.bp>=0&&a.bp<=Math.min(3,u.bp));assert.ok(a.targets.every(t=>t.hp>0));
      if(a.skill){const sk=vm.runInContext('SKILLS',ctx)[a.skill];assert.ok(u.mp>=(sk.mp||0))}};
  }
  const result=await Promise.race([
    vm.runInContext('battleLoop()',ctx),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('battle timeout')),2000)),
  ]);
  const data=vm.runInContext('({round:B.round,initial,final:B.allies.map(u=>({name:u.name,hp:u.hp,mp:u.mp})),foes:B.foes.map(u=>({name:u.name,hp:u.hp})),bag:S.bag})',ctx);
  assert.ok(['win','lose'].includes(result));
  return{profile:profileName,fight:fightName,seed,result,...data};
}

(async()=>{
  const rows=[];for(const profile of Object.keys(profiles))for(const fight of Object.keys(fights)){
    for(const seed of [1,2,3,4,5])rows.push(await trial(profile,fight,seed));
  }
  const by={};for(const r of rows){const key=r.profile+'/'+r.fight;(by[key]??=[]).push(r)}
  for(const [k,rs]of Object.entries(by)){
    const wins=rs.filter(r=>r.result==='win'),rounds=rs.map(r=>r.round),hp=wins.map(r=>r.final[0].hp);
    const mp=rs.map(r=>r.final[0].mp),allyHp=rs.map(r=>r.final.slice(1).reduce((n,a)=>n+a.hp,0));
    const allyMp=rs.map(r=>r.final.slice(1).reduce((n,a)=>n+a.mp,0));
    const spent=rs.map(r=>(profiles[r.profile].bag.bun||0)-(r.bag.bun||0));
    const range=a=>`${Math.min(...a)}-${Math.max(...a)}`;
    console.log(k.padEnd(18),`${wins.length}/${rs.length} win`,
      `rounds ${range(rounds)}`,
      `hero HP ${hp.length?range(hp):'—'}`,
      `hero MP ${range(mp)}`,
      `allies HP total ${range(allyHp)}`,
      `allies MP total ${range(allyMp)}`,
      `buns spent ${range(spent)}`);
  }
})().catch(e=>{console.error(e);process.exitCode=1});
