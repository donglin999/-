// Exercise actual narrative/CG boundaries and cleanup; image composition is reviewed separately.
const {boot}=require('./harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const {c,run,root,node,nodes}=await boot();const results=[],lines=[];let choice=0;/* 领队交锋（2026-10-13 起插在起火前，updates/2026-10-13-faction-clash.md）是独立战斗演出，要真实解码动作表，本测试环境的 Image 是空壳；与 verify_chapter 一样跳过演出，只测剧情流程 */c.QiheFactionClash.play=async()=>'stopped';
 const active=()=>node('body').classList.contains('qh-cinematic');
 function fresh(scene='qh_east'){
  run(`S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true};S.prologue.rested=true;S.scene='${scene}';cur=SC[S.scene];buildGrid(cur);spawnWanderers();mode='scene';busy=false;dlgBusy=false;keys={};S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='fire';S.qiheChapter.halfDay=6;S.qiheChapter.choices={transport:'cart',market:'help'};`);
  lines.length=0;node('dlg').style.zIndex='17';
 }
 function record(who,text){
  run(`dlgSetup(${JSON.stringify(who)},${JSON.stringify(who==='叶蘅'?'c_ye':who==='萧白'?'c_hero':null)},false)`);
  const shot=active()?nodes.get('qh-fire-cg')?.dataset.shot||'water':null;
  if(shot){assert.equal(node('dlg').dataset.cgPortraitSuppressed,'true');assert.equal(node('dlg').dataset.castCount,'0');assert(node('dlg').querySelector('.face').hidden);assert(node('dlg').querySelector('.mini').hidden);}
  lines.push({who,text,shot});
 }
 c.say=async(w,t)=>record(w,t);c.choose=async(w,t,opts)=>{assert(!active(),'choices must be on map');return choice};c.battle=async()=> 'win';
 for(const rescue of [0,1]){
  fresh();choice=rescue;await c.QiheChapter.resume();const p=c.QiheChapter.state();
  assert.equal(p.stage,'refuge');assert.equal(p.rescue,rescue?'cart':'chen');assert.equal(p.supplies,rescue?5:3);/* 护车分支陈伯伤了腿，记为“腿伤待照护”（updates/2026-10-13-faction-clash.md；培养部分 qh-mode-cultivation-household.js 按此值读取） */assert.equal(p.chenCare,rescue?'腿伤待照护':'擦伤已照护');assert.equal(p.coreOwner,'叶蘅');assert.equal(p.coreIntact,true);
  const ignition=lines.filter(l=>l.shot==='ignition'),evac=lines.filter(l=>l.shot==='evacuation');
  /* 2026-10-19 起火一场按 ink 重写（story/01-开始/风起-起火.ink、三方-侧口对峙.ink；R-剧情-03 不用旁白、R-剧情-04 台词以 ink 为准）：起因由萧白在地图上说出，点火镜头只配叶蘅一句；岑霜、沈雁回两句各有特写镜头（cen/shen，三位主事人镜头见 updates/2026-10-07-three-heroines-cg-review.md） */
  assert(lines.some(l=>l.text.includes('灯芯掉在晾布上')&&l.shot===null));assert.equal(ignition.length,1);assert.equal(ignition[0].who,'叶蘅');assert.equal(evac.length,2);assert.deepEqual(evac.map(l=>l.who),['叶蘅','萧白']);
  for(const line of lines.filter(l=>/退到我这边|擦伤已经包好|药车拖出|烟压过河埠|扣住乌魁|开.*车道/.test(l.text)))assert.equal(line.shot,null);
  assert(lines.some(l=>l.who==='岑霜'&&l.text==='乌魁，手不想要了？'&&l.shot==='cen'));assert(lines.some(l=>l.who==='岑霜'&&l.text.startsWith('看住他')&&!l.shot));assert(!active());assert(!nodes.has('qh-fire-cg'));assert.equal(node('dlg').style.zIndex,'17');assert(!run('busy'));assert(!p.pendingEvent);
  const before=JSON.stringify({supplies:p.supplies,care:p.chenCare,bag:run('S.bag')});lines.length=0;
  run("S.qiheChapter.stage='fire';S.qiheChapter.pendingEvent='fire-evacuation-cg'");await c.QiheChapter.resume();assert(!lines.some(l=>l.shot));assert.equal(JSON.stringify({supplies:p.supplies,care:p.chenCare,bag:run('S.bag')}),before);
  results.push({case:rescue?'protect-cart':'rescue-chen',ignition:1,evacuation:2,choicesOnMap:true,rewardsUnchanged:true,completedEventNotReplayed:true});
 }
 // Water CG covers exactly three short lines, never the origin choice or standing dialogue.
 for(const branch of [0,1,2]){
  fresh('prologue_backhill');run('S.prologue.arrival.borrowed=false');choice=branch;let choices=0;
  c.choose=async(w,t,opts)=>{choices++;assert.equal(opts.length,3);assert(!active());assert(nodes.get('prologue-cg')?.hidden);assert.equal(c.PrologueWater.step,'P-01-11');return branch};
  const r=await c.PrologueWater.play({owned:true,fallback:true});assert.equal(r.branch,branch);assert.equal(choices,1);assert.equal(lines.filter(l=>l.shot==='water').length,3);assert(!active());assert.equal(node('dlg').style.zIndex,'17');assert(!run('busy'));
  results.push({case:'water-origin-'+branch,cgLines:3,threeChoicesPreserved:true,cleanup:true});
 }
 const originalImage=c.Image;
 fresh();c.Image=class{set src(v){}async decode(){throw Error('test decode failure')}};
 await c.QiheFireCinematic.play('evacuation',[['叶蘅','加载失败仍继续'],['萧白','同组台词只播一次']]);assert.equal(lines.length,2);assert(lines.every(l=>l.shot===null));assert(!active());assert(!nodes.has('qh-fire-cg'));assert.equal(node('dlg').style.zIndex,'17');results.push({case:'image-load-failure',dialogueOnce:true,cleanup:true});
 fresh('prologue_backhill');await c.PrologueWater.play({owned:true,fallback:true});assert(!lines.some(l=>l.shot));assert(!active());results.push({case:'water-load-failure',choicesPreserved:true,cleanup:true});
 c.Image=originalImage;fresh();c.say=async()=>{throw Error('test dialogue cancellation')};await assert.rejects(()=>c.QiheFireCinematic.play('ignition',[['','中断演出']]),/test dialogue cancellation/);assert(!active());assert(!nodes.has('qh-fire-cg'));assert.equal(node('dlg').style.zIndex,'17');assert(!node('dlg').classList.contains('qh-cg-dialogue'));results.push({case:'dialogue-error',cleanup:true});
 const output=path.join(root,'art_sources/qihe-cg-direction-20261006/narrative-test.json');fs.writeFileSync(output,JSON.stringify({scope:'Actual runtime narrative and portrait suppression; battles stubbed as wins; visual composition reviewed separately',passed:results.length,results},null,2)+'\n');console.log('PASS CG direction:',results.length,'cases');
})().catch(e=>{console.error(e);process.exitCode=1});
