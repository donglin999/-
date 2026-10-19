const{boot}=require('./harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const{c,run,root,cv,node}=await boot(),out=path.join(root,'art_sources/qihe-prologue/qa');fs.mkdirSync(out,{recursive:true});
 run("S=newState();S.name='萧白';S.hp=80;S.mp=15;S.prologue=QihePrologue.fresh();S.scene='prologue_backhill';cur=SC.prologue_backhill;mode='scene';busy=true;buildGrid(cur);spawnWanderers();");
 c.renderCards=()=>{};c.say=async()=>{};const reports=[];
 const pump=async(fn,condition,ms=18000)=>{const start=Date.now();while(!condition()){if(Date.now()-start>ms)throw Error('battle timeout: '+run('B?.opt.storyLesson.uiStep')+' error='+c.PrologueStoryBattle.lastError);fn();await new Promise(r=>setTimeout(r,2))}};
 for(const scenario of['win-normal','help-off','items','lose','injected-failure']){
  const before=run('JSON.stringify(S)');let lesson,done=false,result,err,captured=false,back=false,checkedUnavailable=false,helpOff=false;
  const originalFoe=c.foeAct;if(scenario==='injected-failure')c.foeAct=async()=>{throw Error('test-only enemy failure')};
  const play=c.PrologueStoryBattle.play().then(r=>{result=r;done=true}).catch(e=>{err=e;done=true});
  await pump(()=>{
   const b=run('B');if(!b)return;lesson=b.opt.storyLesson;
   if(scenario==='lose')b.foes[0].atk=999;
   if(!captured&&b.cur?.side==='ally'&&b.key){run('PXS=4/3;g.setTransform(PXS,0,0,PXS,0,0);');c.drawBattle(c.performance.now());fs.writeFileSync(path.join(out,'battle.png'),cv.toBuffer('image/png'));captured=true}
   if(!b.key)return;
   if(scenario==='help-off'&&!helpOff){const hp=b.foes[0].hp;node('bt-teaching-toggle').onclick();assert.equal(lesson.guidance,false);assert.equal(b.foes[0].hp,hp);assert(run('B'),'closing guide must not end battle');helpOff=true}
   if(scenario==='lose'||scenario==='injected-failure'){b.key('n4');return}
   const u=b.cur,acted=lesson.actions.filter(a=>a.actor===u.name),target=b.tgtList;
   if(target){if(!back){b.key('back');back=true}else b.key('ok');return}
   if(lesson.uiStep==='skill-menu'||lesson.uiStep==='item-menu'){b.key('n1');return}
   if(u.isHero&&!checkedUnavailable){b.key('n2');assert(b.key,'unavailable skill retains menu');checkedUnavailable=true}
   if(u.isHero&&acted.length===0){b.key(scenario==='items'?'n3':'n4');return}
   if(!u.isHero&&acted.length===0){b.key('n2');return}
   b.key('bp');b.key('n1');
  },()=>done);
  await play;if(err)throw err;c.foeAct=originalFoe;
  assert.equal(result,scenario==='lose'?'lose':scenario==='injected-failure'?'fail':'win');assert.equal(run('JSON.stringify(S)'),before,'state restored');assert.equal(run('B'),null);assert.equal(run('mode'),'scene');assert.equal(run('busy'),true);assert.equal(run('dlgBusy'),false);
  if(result==='win'){
   assert(lesson.actions.some(a=>a.action==='jinzhen'),'normal doSkill executed');assert(lesson.actions.some(a=>a.action==='atk'&&a.bp>0),'normal BP attack executed');assert(lesson.events.some(e=>e.type==='enemy-damage'&&e.values.some(n=>n>0)),'real enemy damage');assert(lesson.actions.some(a=>a.enemyHP===0),'victory requires zero HP');assert(!lesson.actions.some(a=>a.action==='drive'));
   if(scenario==='items')assert(lesson.actions.some(a=>a.action==='bun'),'normal item use');else assert(lesson.actions.some(a=>a.action==='def'),'normal defense');
  }
  reports.push({scenario,result,actions:lesson?.actions,events:lesson?.events});console.log('PASS '+scenario);
 }
 const art=c.BART.hero_modern;delete c.BART.hero_modern;const before=run('JSON.stringify(S)');assert.equal(await c.PrologueStoryBattle.play(),'fail');assert.equal(run('JSON.stringify(S)'),before);c.BART.hero_modern=art;
 const report={status:'PASS_LOCAL',scope:'Normal calcOrder/planIntent/endCheck + production allyTurn/doAttack/doSkill/items/defense/BP/foeAct in local VM; real Canvas export. DOM cards stubbed, no browser layout/mouse verification.',reports,missingArtRecovery:true};fs.writeFileSync(path.join(out,'battle-report.json'),JSON.stringify(report,null,2));console.log('PASS missing-art recovery');
})().catch(e=>{console.error(e);process.exitCode=1});
