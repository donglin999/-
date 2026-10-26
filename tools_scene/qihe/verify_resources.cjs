const {boot}=require('./harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const {c,run,root,cv,canvas,events,local,node}=await boot();const out=path.join(root,'art_sources/qihe-resources-v1/review');fs.mkdirSync(out,{recursive:true});
 const report={scope:'Production scripts, real movement/collision, pointer handlers and Canvas in local VM; not browser DOM acceptance.',checks:[],issues:[],renders:[]};
 async function test(name,fn){try{await fn();report.checks.push({name,pass:true});console.log('PASS',name)}catch(e){report.issues.push({name,error:e.stack});console.log('FAIL',name,e.message)}}
 function fresh(){run("S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival.borrowed=true;S.prologue.arrival.stage='done';S.prologue.rested=true;S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=3;S.qiheChapter.mainDismissed=3;/* 2026-10-21 起走进主线地点会弹确认；本测试只测采集 */S.qiheCultivation={energy:7};mode='scene';busy=false;dlgBusy=false;keys={};$('panel').hidden=true;")}
 fresh();const R=c.QiheResources;
 await test('16 distinct nodes across seven outdoor scenes; no collision props or owned supplies',()=>{
  assert.equal(R.nodes.length,16);assert.equal(new Set(R.nodes.map(n=>n.id)).size,16);assert.equal(new Set(R.nodes.map(n=>n.scene)).size,7);
  for(const n of R.nodes){assert.equal(n.sp,null);assert(n.amount>=1&&n.amount<=2);assert(['branch','herb','reed'].includes(n.kind));if(n.key==='west')assert(!(n.x*40>=240&&n.x*40<=860&&n.y*40>=670&&n.y*40<=830));if(n.key==='mountain')assert(!(n.x*40>=915&&n.x*40<=1220&&n.y*40>=560&&n.y*40<=735))}
 });
 const samples=[];
 for(const n of R.nodes)await test(n.id+' reachable, pixel render, once-only E interaction',async()=>{
  fresh();run('S.qiheChapter.stage='+JSON.stringify(n.key==='refuge'?'refuge':n.key==='mountain'?'cultivation':'days'));await c.QiheExpansion.go(n.key);
  assert(c.standOk(n.x*40,n.y*40),'resource foot must be on visible walk plane');assert(!c.npcBlock(n.x*40,n.y*40),'not inside NPC');
  for(const other of run('cur._npcs'))if(other!==n)assert(Math.hypot(other.x*40-n.x*40,other.y*40-n.y*40)>=85,'overlaps interaction '+other.id);
  const side=n.id==='resource-west-reed-bank'?1:-1;assert(c.setPath(n.x*40+side*44,n.y*40+10),'no approach path');let count=0;while(c.rt.player.path&&count++<4000)c.updateScene(16);assert(count<4000);assert(Math.hypot(c.rt.player.x-n.x*40,c.rt.player.y-n.y*40)<55);assert(c.standOk(c.rt.player.x,c.rt.player.y));
  cv.width=1280;cv.height=720;run('PXS=4/3;g.setTransform(PXS,0,0,PXS,0,0);');c.snapCam();c.drawScene(2100);const f=n.id+'.png';fs.writeFileSync(path.join(out,f),cv.toBuffer('image/png'));samples.push(f);report.renders.push(f);
  const before=run('JSON.stringify({halfDay:S.qiheChapter.halfDay,energy:S.qiheCultivation.energy})');await c.interact();assert(R.taken(n.id));assert.equal(run('S.bag.'+R.kinds[n.kind].item),n.amount);assert.equal(R.collect(n),false);assert.equal(run('busy||dlgBusy'),false);assert.equal(run('JSON.stringify({halfDay:S.qiheChapter.halfDay,energy:S.qiheCultivation.energy})'),before);
  assert(!c.npcsOf(c.rt.SC[n.scene]).includes(n));const saved=JSON.parse(local.get('xjh.qihe-prologue.v2'));assert.equal(saved.qiheResources.nodes[n.id],true);assert.equal(local.get('xjh.save'),'LEGACY_SENTINEL');
  run('S=JSON.parse(localStorage.getItem(saveKey()))');await c.QiheExpansion.go(n.key);assert(!c.npcsOf(c.rt.SC[n.scene]).includes(n),'reload respawned');
 });
 await test('storage failure does not award or deplete; retry works',async()=>{
  fresh();const n=R.nodes[0];await c.QiheExpansion.go(n.key);Object.assign(c.rt.player,{x:n.x*40,y:n.y*40+30});
  const save=c.localStorage.setItem;c.localStorage.setItem=()=>{throw Error('quota')};try{assert.equal(R.collect(n),false);assert(!R.taken(n.id));assert(!run('S.bag.qh_dry_branch'))}finally{c.localStorage.setItem=save}assert(R.collect(n));
 });
 await test('click upper reed from a distance walks then collects; 1920 render',async()=>{
  fresh();const n=R.nodes.find(n=>n.id==='resource-east-reed-lower');await c.QiheExpansion.go('east');Object.assign(c.rt.player,{x:n.x*40-250,y:n.y*40+30});c.snapCam();
  const pos=run(`[(${n.x}*40-cam.x)*ZOOM*1280/960,(${n.y}*40-44-cam.y)*ZOOM*720/540]`);
  events['cv:pointerdown'].find(f=>String(f).includes('const[x,y]=toLocal'))({clientX:pos[0],clientY:pos[1],pointerType:'mouse'});
  for(let i=0;i<4000&&!R.taken(n.id);i++){c.updateScene(16);await Promise.resolve()};assert(R.taken(n.id));await Promise.resolve();assert.equal(run('busy'),false);
  cv.width=1920;cv.height=1080;run('PXS=2;g.setTransform(PXS,0,0,PXS,0,0);');c.snapCam();c.drawScene(2400);fs.writeFileSync(path.join(out,'depleted-1920.png'),cv.toBuffer('image/png'));report.renders.push('depleted-1920.png');
 });
 await test('fire blocks optional collection and clears markers; restores after phase',async()=>{
  fresh();await c.QiheExpansion.go('east');const n=R.nodes.find(n=>n.key==='east');Object.assign(c.rt.player,{x:n.x*40,y:n.y*40+20});run("S.qiheChapter.stage='fire'");assert.equal(R.collect(n),false);assert.equal(c.npcsOf(c.rt.SC.qh_east).filter(n=>n.resource).length,0);run("S.qiheChapter.stage='days'");assert(c.npcsOf(c.rt.SC.qh_east).some(n=>n.resource));
 });
 await test('location-checked trades, insufficient material, atomic failure and retained resources',async()=>{
  fresh();run('S.bag.qh_dry_branch=2;S.bag.qh_wild_herb=2;S.bag.qh_river_reed=2;');await c.QiheExpansion.go('north');assert.equal(R.exchange('fuel'),false);
  await c.QiheExpansion.go('south','innkeeper');const bun=run('S.bag.bun');assert(R.exchange('fuel'));assert.equal(run('S.bag.bun'),bun+1);assert.equal(run('S.bag.qh_dry_branch'),0);assert.equal(R.exchange('fuel'),false);
  await c.QiheExpansion.go('south','merchant');const silver=run('S.silver'),save=c.localStorage.setItem;c.localStorage.setItem=()=>{throw Error('quota')};try{assert.equal(R.exchange('medicine'),false);assert.equal(run('S.bag.qh_wild_herb'),2);assert.equal(run('S.silver'),silver)}finally{c.localStorage.setItem=save}
  assert(R.exchange('medicine'));assert(R.exchange('packing'));assert.equal(run('S.silver'),silver+6);run('S.bag.qh_dry_branch=2;S.qiheChapter.stage="cultivation"');await c.QiheExpansion.go('mountain','kitchen');assert(R.exchange('fuel'));assert.equal(run('S.qiheCultivation.energy'),7);
 });
 await test('B inventory exits without time, movement lock or plot change',async()=>{
  fresh();await c.QiheExpansion.go('south');const done=R.inventory();assert(node('panel').innerHTML.includes('野草药'));assert.equal(node('panel').hidden,false);node('qh-resource-close').onclick();await done;assert.equal(node('panel').hidden,true);assert.equal(run('busy||dlgBusy'),false);assert.equal(run('S.qiheChapter.halfDay'),3);assert.equal(run('S.qiheCultivation.energy'),7);
 });
 // Review contact sheet consists solely of actual game Canvas renders.
 const sheet=canvas.createCanvas(1280,Math.ceil(samples.length/3)*240),g=sheet.getContext('2d');g.fillStyle='#151b18';g.fillRect(0,0,sheet.width,sheet.height);
 for(let i=0;i<samples.length;i++){g.drawImage(await canvas.loadImage(path.join(out,samples[i])),i%3*426,Math.floor(i/3)*240,426,240);g.fillStyle='#000b';g.fillRect(i%3*426,Math.floor(i/3)*240,426,22);g.fillStyle='#fff';g.font='13px sans-serif';g.fillText(samples[i],i%3*426+5,Math.floor(i/3)*240+16)}
 fs.writeFileSync(path.join(out,'contact.png'),sheet.toBuffer('image/png'));report.renders.push('contact.png');
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log('SUMMARY',report.checks.length,'passed;',report.issues.length,'issues');if(report.issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
