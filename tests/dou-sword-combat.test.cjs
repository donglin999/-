'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8792/?chapterPresentationReview=cultivation-dou-sword-20261012&play=1#qihe-map',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>S?.cultivation&&window.CultivationVisitors&&window.CultivationBalance?.battleWhy);
 const result=await p.evaluate(async()=>{
  const def=CultivationVisitors.all().find(d=>d.id==='gy_spar_dou').fight.foes[0];
  if(FXDEF.gy_dou_basic?.hit!=='剑')throw Error('basic sword hit effect mapping missing');
  if(BART.gy_luxiaodou?.cols!==32||!BART.gy_luxiaodou.file.endsWith('finish_20261014'))throw Error('dedicated 32-frame sword pack missing');
  const u=mkFoe(def,0),other=mkFoe({name:'对照',sp:'c_bandit',lv:1,st:{str:3,con:3,agi:3,wil:3,wis:3},skills:{blade:1}},1);
  const actual={level:u.lv,hp:u.hp,mp:u.mp,atk:u.atk,def:u.def,spd:u.spd,crit:u.crit,dodge:u.dodge,shield:u.shield,type:u.atkType,weapon:u.atkName,skills:u.skills};
  const original={B,S,random:Math.random,renderCards,showName,floatTxt,bpop,lunge,setTimeout:window.setTimeout,hurt,vfx:{...VFX}};
  const target={name:'测量靶',side:'ally',hp:1000,mhp:1000,mp:100,mmp:100,def:9,dodge:0,buffs:{},x:700,y:400};
  let hpEvents=0;Math.random=()=>.5;renderCards=showName=floatTxt=bpop=()=>{};lunge=async()=>{};window.setTimeout=fn=>{queueMicrotask(fn);return 0;};
  hurt=(t,n)=>{hpEvents++;t.hp-=n;};for(const k of ['act','hit','cast','btWait'])VFX[k]=async()=>{};
  B={allies:[target],foes:[u],units:[target,u],round:1,cur:u,fx:[],parts:[],opt:{}};
  try{
   planIntent(u);const first=u.intent.sk;for(let i=0;i<4;i++)planIntent(u);
   if(u.sparActions!==0||u.mp!==74)throw Error('intent redraw consumed action or MP');
   let before=target.hp;await foeAct(u);const basicDamage=before-target.hp;
   planIntent(u);const second=u.intent.sk;before=target.hp;await foeAct(u);const skillDamage=before-target.hp;
   if(u.mp!==71||hpEvents!==2)throw Error('MP or damage event count');
   u.sparActions=3;u.mp=2;planIntent(u);const fallback=u.intent.sk;await foeAct(u);if(u.mp!==2)throw Error('basic attack spent MP');
   u.sparActions=5;u.mp=74;planIntent(u);u.mp=0;await foeAct(u);if(u.mp!==0)throw Error('MP changed after intent: negative MP');
   const amount=hpEvents;B.allies=[];planIntent(u);if(u.sparActions!==6)throw Error('empty target changed counter');
   const noLeak={profile:other.combatProfile??null,skills:other.skills};
   const savedLevel=S.lv;S.lv=40;const repeat=mkFoe(def,0);S.lv=savedLevel;
   return{actual,first,second,basicDamage,skillDamage,fallback,damageEvents:amount,noLeak,fixedAtLevel40:{lv:repeat.lv,hp:repeat.hp,atk:repeat.atk},artStatus:'dedicated 32-frame pixel sword sheet registered'};
  }finally{B=original.B;S=original.S;Math.random=original.random;renderCards=original.renderCards;showName=original.showName;floatTxt=original.floatTxt;bpop=original.bpop;lunge=original.lunge;window.setTimeout=original.setTimeout;hurt=original.hurt;Object.assign(VFX,original.vfx);}
 });
 assert.deepEqual(result.actual,{level:10,hp:112,mp:74,atk:13,def:9,spd:7,crit:13,dodge:11,shield:2,type:'剑',weapon:'桃木剑',skills:['gy_dou_basic','gy_s1']});
 assert.equal(result.first,'gy_dou_basic');assert.equal(result.second,'gy_s1');assert.equal(result.fallback,'gy_dou_basic');
 assert.equal(result.basicDamage,9);assert.equal(result.skillDamage,9);assert.equal(result.damageEvents,4);
 assert.deepEqual(result.noLeak,{profile:null,skills:['blade']});assert.deepEqual(result.fixedAtLevel40,{lv:10,hp:112,atk:13});assert.deepEqual(errors,[]);
 const out=path.resolve(__dirname,'../review/dou-sword-contract-20261012');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'mechanics.json'),JSON.stringify({status:'pass',...result,errors},null,2));console.log(JSON.stringify({status:'pass',...result}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
