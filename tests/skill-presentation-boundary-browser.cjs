const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8792/?battleReview=clash&holdReview=1&play=1#qihe-map');await p.waitForFunction(()=>window.QiheFactionClash&&mode==='scene'&&!busy);await p.evaluate(()=>QiheFactionClash.ready());
const rows=await p.evaluate(async()=>{
 const saved={B,renderCards,showName,floatTxt,bpop,why:QiheUIModel.skillWhy,bw:BFXI.bw,act:BFXI.act,attack:playAttackPose,motion:Object.fromEntries(['dashTo','hopBack','stepFwd','stepBack','lunge','aimReach'].map(k=>[k,BFXI[k]]))};let moves=[],poses=[],contact=0;
 renderCards=showName=floatTxt=bpop=()=>{};QiheUIModel.skillWhy=()=>'';BFXI.bw=async()=>{};
 for(const key of Object.keys(saved.motion))BFXI[key]=async()=>{moves.push(key)};
 BFXI.act=(u,key,...rest)=>{if(u.key==='boundary_actor')poses.push(key);return saved.act(u,key,...rest)};
 playAttackPose=async function(){contact++;return saved.attack.apply(this,arguments)};
 const results=[];
 function units(side='ally'){const u={key:'boundary_actor',name:'Probe',art:'bandit',side,x:side==='ally'?720:270,y:420,hp:1000,mhp:1000,mp:100,mmp:100,atk:20,def:2,dodge:0,crit:0,spd:5,bp:3,buffs:{},skills:['jinzhen','gy_s1','blade'],skLv:{jinzhen:1,gy_s1:1},atkType:'刀',atkName:'刀',id:.2},t={key:'target',name:'Target',art:'bandit',side:side==='ally'?'foe':'ally',x:side==='ally'?270:720,y:420,hp:1000,mhp:1000,mp:100,mmp:100,atk:1,def:2,dodge:0,crit:0,buffs:{},weak:[],known:new Set(),shield:4,id:.4};B={cur:u,allies:side==='ally'?[u]:[t],foes:side==='ally'?[t]:[u],units:[u,t],round:1,opt:{},parts:[],fx:[],shake:0,done:new Set()};moves=[];poses=[];contact=0;return[u,t]}
 try{
  for(const key of ['jinzhen','gy_s1']){const[u,t]=units();await doSkill(u,key,[t],0);results.push({case:key,moves:[...moves],poses:[...poses],contact,position:[u.x,u.y,u.ox||0,u.oy||0],mp:u.mp,damage:1000-t.hp});}
  {const[u,t]=units('foe');u.intent={sk:'gy_s1',tgt:t};await foeAct(u);results.push({case:'foe-skill',moves:[...moves],poses:[...poses],contact,position:[u.x,u.y,u.ox||0,u.oy||0],damage:1000-t.hp});}
  {const[u,t]=units('foe');u.intent={sk:'blade',tgt:t};await foeAct(u);results.push({case:'foe-basic',moves:[...moves],poses:[...poses],contact,damage:1000-t.hp});}
  {const[u,t]=units();await doAttack(u,t,0);results.push({case:'ally-basic',moves:[...moves],poses:[...poses],contact,damage:1000-t.hp});}
  return results;
 }finally{B=saved.B;renderCards=saved.renderCards;showName=saved.showName;floatTxt=saved.floatTxt;bpop=saved.bpop;QiheUIModel.skillWhy=saved.why;BFXI.bw=saved.bw;BFXI.act=saved.act;playAttackPose=saved.attack;Object.assign(BFXI,saved.motion);}
});
for(const r of rows.slice(0,3)){assert.deepEqual(r.moves,[]);assert.equal(r.contact,0);assert(r.poses.every(x=>x==='cast'));assert(r.damage>0);assert.deepEqual(r.position,r.case==='foe-skill'?[270,420,0,0]:[720,420,0,0]);}
for(const r of rows.slice(3)){assert(r.moves.includes('dashTo'));assert(r.moves.includes('hopBack'));assert(r.poses.includes('atk'));assert(r.damage>0)}assert.equal(rows[4].contact,1);assert.deepEqual(errors,[]);
const out=path.resolve(__dirname,'../art_sources/qihe-clash-jia-20261014/skill-presentation-boundary.json');fs.writeFileSync(out,JSON.stringify({status:'pass',rows,errors},null,2));console.log('PASS base/imported/foe skills stationary; both ordinary attack paths retain contact');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
