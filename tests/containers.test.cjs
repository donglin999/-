'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require('/private/tmp/claude-501/pw/node_modules/playwright');
(async()=>{const browser=await chromium.launch({args:['--allow-file-access-from-files'],executablePath:path.join(os.homedir(),'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell')});const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('/tmp/container-acceptance',{recursive:true});
try{
 await page.goto('file://'+path.resolve(__dirname,'../index.html')+'#xiangyang');await page.waitForFunction(()=>mode==='scene');
 await page.evaluate(()=>{localStorage.setItem('xjh.save','container-formal-sentinel');S.flags.awake=1;S.flags.chief_dead=1;S.flags.bf_east='fight';S.flags.ferry_ev=1;S.quests={q_book:{stage:2}}});
 const ids=await page.evaluate(()=>CONTAINERS.map(c=>c.id));assert.equal(ids.length,20);assert.equal(new Set(ids).size,20);
 const evidence=[];
 for(const id of ids){
  const setup=await page.evaluate(id=>{const c=CONTAINERS.find(c=>c.id===id);cur=SC[c.scene];S.scene=c.scene;buildGrid(cur);delete cur._nav;player.x=cur.start[0]*TS;player.y=cur.start[1]*TS;player.path=null;player.goal=null;player.talkTo=null;player.trail=[];spawnWanderers();busy=false;dlgBusy=false;mode='scene';const before={bag:{...S.bag},silver:S.silver};const pts=ContainerSystem.approach(c);const target=pts.find(([x,y])=>{const p=findPath(x,y);return p&&Math.hypot(p.at(-1)[0]-c.px,p.at(-1)[1]-c.py)<80});if(!target)return {error:'no reachable approach'};setPath(...target,true);player.talkTo=c;return{before,scene:c.scene,start:[player.x,player.y],target,rewards:c.items,silver:c.silver}},id);
  assert.ok(!setup.error,id+': '+setup.error);
  await page.waitForFunction(id=>!!S.containers?.[id]?.claimed,id,{timeout:18000});
  const after=await page.evaluate(id=>{const c=CONTAINERS.find(c=>c.id===id),first={bag:{...S.bag},silver:S.silver};ContainerSystem.claim(c);return{first,second:{bag:{...S.bag},silver:S.silver},busy,mode,dist:Math.hypot(player.x-c.px,player.y-c.py),saved:JSON.parse(sessionStorage.getItem('xjh.review.save')).containers[id]}},id);
  for(const[k,n]of Object.entries(setup.rewards))assert.equal(after.first.bag[k],(setup.before.bag[k]||0)+n,id+' item '+k);
  assert.equal(after.first.silver,setup.before.silver+setup.silver);assert.deepEqual(after.first,after.second);assert.equal(after.busy,false);assert.equal(after.mode,'scene');assert.ok(after.saved.claimed);evidence.push({id,...setup,after});
  if(['temple_guest_clothes','street_relief','bgate_guard_supply','crossing_food'].includes(id))await page.screenshot({path:'/tmp/container-acceptance/'+id+'-empty.png'});
 }
 const gates=await page.evaluate(()=>{delete S.flags.chief_dead;delete S.flags.ferry_ev;S.flags.bf_east='trick';S.quests.q_book={stage:0};const a=['cave_aid','bgate_food','ferry_aid','ferry_e_store','alley_wall_cache'].map(id=>ContainerSystem.allowed(CONTAINERS.find(c=>c.id===id)));S.flags.ferry_ev=1;S.flags.ferry_split=1;a.push(ContainerSystem.allowed(CONTAINERS.find(c=>c.id==='ferry_aid')));S.quests.q_book={done:true,end:'split'};a.push(ContainerSystem.allowed(CONTAINERS.find(c=>c.id==='alley_wall_cache')));return a});assert.deepEqual(gates,Array(7).fill(false));
 // Actual pointer -> route -> claim, from a known legal nearby point (no direct reward call).
 await page.evaluate(()=>{const c=CONTAINERS.find(c=>c.id==='street_relief');delete S.containers[c.id];cur=SC.street;S.scene='street';buildGrid(cur);player.x=c.px-150;player.y=c.py+80;spawnWanderers();busy=false;dlgBusy=false;cam.x=clamp(c.px-VW/2,0,WW-VW);cam.y=clamp(c.py-VH/2,0,WH-VH);camC.x=cam.x+VW/2;camC.y=cam.y+VH/2});
 const click=await page.evaluate(()=>{const c=CONTAINERS.find(c=>c.id==='street_relief'),r=cv.getBoundingClientRect();return{x:r.left+(c.px-cam.x)*ZOOM*r.width/W,y:r.top+(c.py-25-cam.y)*ZOOM*r.height/H}});await page.mouse.click(click.x,click.y);await page.waitForFunction(()=>!!S.containers.street_relief?.claimed);await page.screenshot({path:'/tmp/container-acceptance/pointer-reward.png'});
 // Saving failure must grant neither inventory nor the claimed flag.
 const atomic=await page.evaluate(()=>{const c=CONTAINERS.find(c=>c.id==='street_relief'),old=S.containers[c.id];delete S.containers[c.id];const before=S.bag.bun,save0=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('injected quota failure')};let result;try{result=ContainerSystem.claim(c)}finally{Storage.prototype.setItem=save0}const after=S.bag.bun,claimed=ContainerSystem.claimed(c);S.containers[c.id]=old;return{result,before,after,claimed}});assert.equal(atomic.result,false);assert.equal(atomic.after,atomic.before);assert.equal(atomic.claimed,false);
 // Save/load preserves unique IDs; formal slot remains isolated.
 const saved=await page.evaluate(()=>sessionStorage.getItem('xjh.review.save'));await page.evaluate(s=>{S=loadSave()},saved);assert.equal(await page.evaluate(()=>CONTAINERS.every(c=>ContainerSystem.claimed(c))),true);assert.equal(await page.evaluate(()=>localStorage.getItem('xjh.save')),'container-formal-sentinel');
 assert.deepEqual(errors,[]);fs.writeFileSync('/tmp/container-acceptance/results.json',JSON.stringify({evidence,gates,errors},null,2));console.log('20 real movement/claim paths, duplicate rewards, gating, actual pointer and save isolation: PASS');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
