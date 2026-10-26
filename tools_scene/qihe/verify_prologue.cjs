// 2026-10-17：第一章台词重写后，三处断言改查现行文案（电脑→城里的楼；问功法的选项；未还篮的心里话）。
const {boot}=require('./harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const h=await boot(),{c,run,root,local,cv,canvas}=h,out=path.join(root,'art_sources/qihe-prologue/qa');fs.mkdirSync(out,{recursive:true});
 const checks=[],issues=[],dialogue=[];let choices=[];
 c.say=async(w,t)=>{dialogue.push({who:w,text:t});};c.choose=async(w,t,opts)=>{dialogue.push({who:w,text:t,options:opts});const i=choices.shift()??opts.length-1;assert(i>=0&&i<opts.length,'invalid choice '+i+' for '+t);return i};
 c.PrologueDog.play=async()=> 'win';
 async function check(name,fn){try{await fn();checks.push({name,pass:true});console.log('PASS '+name)}catch(e){checks.push({name,pass:false});issues.push({name,error:e.stack});console.log('FAIL '+name+' '+e.message)}}
 const fresh=async(origin=0)=>{choices=[origin];dialogue.length=0;await c.QihePrologue.start(true)};
 await check('P01 → normal battle checkpoint → P03; sole CG; initial short-hair movement selected',async()=>{await fresh(2);assert.equal(run('S.prologue.arrival.stage'),'done');assert.equal(run('S.prologue.arrival.originExpression'),'C');assert.equal(run('S.scene'),'prologue_clinic_interior');assert.equal(run('cur.playerSp'),'qh_hero_initial');assert.equal(run('busy||dlgBusy'),false);assert.equal(c.rt.WALK.hero.n,12);assert.equal(c.rt.RUN.hero.n,10);assert(dialogue.some(l=>l.text.includes('比这座山还高')));assert(dialogue.some(l=>l.text.includes('先分你一半')));assert.equal(local.get('xjh.save'),'LEGACY_SENTINEL');assert(local.has('xjh.qihe-prologue.v2'));});
 await check('all five interiors: door return, anchors, furniture footprint and every interaction reachable',async()=>{
  for(const[key,m]of Object.entries(c.QIHE_ROOMS)){
   await c.QihePrologue.goLocal(key);assert(c.standOk(...m.start),key+' start');assert.equal(run('cur._ms'),2);
   for(const n of c.rt.SC['prologue_'+key].npcs){let reached=false;for(const [dx,dy]of[[0,34],[34,0],[-34,0],[0,-34],[0,52],[52,0],[-52,0]]){const p=[n.x*40+dx,n.y*40+dy];if(c.walkable(...p)&&c.findPath(...p)){reached=true;break}}assert(reached,key+'/'+n.id)}
   const door=c.rt.SC['prologue_'+key].npcs[0];await door.act();assert(run('S.scene')!=='prologue_'+key,key+' exit');assert(c.standOk(c.rt.player.x,c.rt.player.y),'exit landing');
  }
 });
 await check('decline errands / relic required / decline lodging does not mutate tasks',async()=>{await fresh(0);choices=[1];await c.QihePrologue.actions.aunt();assert.equal(run('S.prologue.errands.bowls'),'none');await c.QihePrologue.rest();assert.equal(run('S.prologue.rested'),false);choices=[1];await c.QihePrologue.actions.relic();choices=[1];await c.QihePrologue.rest();assert.equal(run('S.prologue.ending||S.prologue.rested'),false)});
 await check('all three errands, all heard clues, only the aunt\'s 金创药 thank-you added (2026-10-23 一次托付三件)',async()=>{
  await fresh(1);const before=run('JSON.stringify([S.silver,S.bag,S.skills,S.party,S.pet,S.weapon,S.exp])');
  for(let i=0;i<3;i++){choices=[0,0];await c.QihePrologue.actions.aunt()}
  choices=[0];await c.QihePrologue.actions.chen();choices=[0];await c.QihePrologue.actions.cloth();choices=[0];await c.QihePrologue.actions.elder();
  assert.equal(c.QihePrologue.pending().length,2);assert(run('S.prologue.heard.skill&&S.prologue.heard.box&&S.prologue.heard.inspection'));
  choices=[0];await c.QihePrologue.actions.aunt();choices=[0];await c.QihePrologue.actions.aunt();assert.equal(run('Object.values(S.prologue.errands).every(v=>v==="done")'),true);assert.equal(run('JSON.stringify(S.prologue.carry)'),'{}');assert.equal(run('S.bag.pill'),1);assert.equal(run('(()=>{const g={...S.bag};delete g.pill;return JSON.stringify([S.silver,g,S.skills,S.party,S.pet,S.weapon,S.exp])})()'),before);
  choices=[0];await c.QihePrologue.actions.relic();choices=[0,0,0,0];await c.QihePrologue.rest();assert.equal(run('S.prologue.rested'),true);assert.equal(run('S.scene'),'prologue_chen_guest');assert.equal(run('S.prologue.handoff.noteOwner'),'叶蘅');assert(dialogue.some(l=>l.options?.includes('“对了，有人在打听你父亲的功法。”')));
 });
 await check('zero errands route ends; unheard clues absent; all origins persist',async()=>{
  for(let origin=0;origin<3;origin++){await fresh(origin);choices=[1];await c.QihePrologue.actions.relic();dialogue.length=0;choices=[0];await c.QihePrologue.rest();assert.equal(run('S.prologue.handoff.origin'),['A','B','C'][origin]);assert(run('Object.values(S.prologue.errands).every(v=>v==="closed")'));assert(!dialogue.some(l=>l.options?.includes('“对了，有人在打听你父亲的功法。”')));assert(dialogue.some(l=>l.text.includes('手机')));await c.QihePrologue.start();assert(run('S.prologue.rested'));assert.equal(run('S.scene'),'prologue_chen_guest')}
 });
 await check('medicine delivered still warns about unreturned basket; reload ending resumes safely',async()=>{await fresh();choices=[0];await c.QihePrologue.actions.aunt();choices=[1];await c.QihePrologue.actions.elder();assert(c.QihePrologue.pending().some(r=>r[0]==='medicine'));choices=[1];await c.QihePrologue.actions.relic();choices=[1];await c.QihePrologue.rest();assert(dialogue.some(l=>l.text.includes('竹篮还没还')));run('S.prologue.ending=true;');c.QihePrologue.checkpoint();await c.QihePrologue.start();assert(run('S.prologue.rested&&!S.prologue.ending'));assert.equal(run('JSON.stringify(S.prologue.carry)'),'{}')});
 await check('reload at dog and lodging checkpoints preserves origin',async()=>{for(const stage of['dog','lodging']){await fresh(1);run(`S.prologue.arrival.stage='${stage}';S.prologue.arrival.borrowed=false;S.scene='prologue_backhill';`);c.QihePrologue.checkpoint();await c.QihePrologue.start();assert.equal(run('S.prologue.arrival.stage'),'done');assert.equal(run('S.prologue.arrival.originExpression'),'B');assert.equal(run('busy||dlgBusy'),false)}});
 // Use real production Canvas rendering, no fabricated UI screenshot claim.
 await fresh();run('PXS=4/3;');
 for(const key of Object.keys(c.QIHE_ROOMS)){await c.QihePrologue.goLocal(key);run('g.setTransform(PXS,0,0,PXS,0,0);');c.drawScene(1800);fs.writeFileSync(path.join(out,key+'.png'),cv.toBuffer('image/png'))}
 await c.QihePrologue.goLocal('village','clinic');run('g.setTransform(PXS,0,0,PXS,0,0);');c.drawScene(1800);fs.writeFileSync(path.join(out,'village.png'),cv.toBuffer('image/png'));
 const contact=canvas.createCanvas(1280,1080),cg=contact.getContext('2d');let i=0;for(const key of['village',...Object.keys(c.QIHE_ROOMS)]){cg.drawImage(await canvas.loadImage(path.join(out,key+'.png')),i%2*640,Math.floor(i/2)*360,640,360);i++}fs.writeFileSync(path.join(out,'contact.png'),contact.toBuffer('image/png'));
 const report={status:issues.length?'FAIL':'PASS_LOCAL',scope:'Production scripts in local VM + Canvas; dialogue choices driven, battle outcome stubbed here (verified separately). Not browser input/layout/audio verification.',checks,issues};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
