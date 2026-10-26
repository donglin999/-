const {boot}=require('./harness.cjs'),assert=require('node:assert/strict');
(async()=>{
 const {c,run}=await boot();assert.equal(run('S'),null,'VM harness must not start the ordinary prologue');let choices=[],lines=[];
 // Ordinary NPC dialogue uses a miniature, including atlas-backed frames.
 for(const sp of ['c_opening_chen','c_opening_aunt','c_opening_apothecary','c_opening_bailiff']){
  const miniature=c.miniSprite(sp);assert(miniature,'Missing NPC miniature: '+sp);
  const pixels=miniature.getContext('2d').getImageData(0,0,96,96).data;
  assert(pixels.some((value,index)=>index%4===3&&value>0),'Empty NPC miniature: '+sp);
 }
 console.log('PASS atlas-backed dialogue miniatures');
 c.say=async(w,t)=>{lines.push({w,t,cast:c.DialogueStage.snapshot.actors.map(a=>a.id)});assert(!c.DialogueStage.snapshot.actors.some(a=>a.who==='叶蘅'),'Uninvited Ye portrait: '+w)};
 c.choose=async(w,t,opts)=>{const i=choices.length?choices.shift():0;assert(i<opts.length);return i};
 function fresh(){run("S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival.stage='done';S.prologue.arrival.borrowed=true;S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);spawnWanderers();mode='scene';busy=false;dlgBusy=false;");choices=[];lines=[]}
 fresh();const startSilver=run('S.silver');choices=[1];await c.QiheChapter.interact('steward');assert.equal(c.QiheOutsiders.get('letter').stage,'none');assert.equal(run('S.silver'),startSilver);assert(!run('S.prologue.heard.skill'));
 for(const [key,id,who]of[['letter','steward','陈伯'],['account','wukui','药商'],['ledger','procurement','周婶']]){
  fresh();run("S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay="+(key==='letter'?2:4)+";S.qiheChapter.events['xu-meeting']=true;S.qiheChapter.events['three-meeting']=true;");const before=run('S.silver');await c.QiheChapter.interact(id);assert.equal(c.QiheOutsiders.get(key).stage,'accepted');await c.QiheChapter.interact(id);assert.equal(c.QiheOutsiders.get(key).stage,'accepted');
  run('S=JSON.parse(JSON.stringify(S))');assert(c.QiheOutsiders.pendingFor(who).includes(key));
  const npc=Object.entries(c.rt.SC).filter(([id])=>/^(qh_|qihe_|prologue_)/.test(id)).flatMap(([,s])=>s.npcs||[]).find(n=>n.name===who);assert(npc);
  await npc.act();assert.equal(c.QiheOutsiders.get(key).stage,'checked');
  if(key==='ledger')assert(!run('S.prologue.heard.inspection'));
  choices=[1];await c.QiheChapter.interact(id);assert.equal(c.QiheOutsiders.get(key).stage,'done');assert.equal(c.QiheOutsiders.get(key).choice,1);assert(run('S.prologue.heard.'+c.QiheOutsiders.defs[key].flag));assert.equal(run('S.silver'),before+c.QiheOutsiders.defs[key].reward);
  if(key==='ledger')assert(lines.some(r=>r.w==='差役'),'现场联合核对必须包含差役证词');
  run('S=JSON.parse(JSON.stringify(S))');await c.QiheChapter.interact(id);assert.equal(run('S.silver'),before+c.QiheOutsiders.defs[key].reward);assert(!run('busy'));assert.equal(c.DialogueStage.snapshot.scope,null);console.log('PASS',key,'accept/witness/turn-in/reload/reward/portrait');
 }
 assert.equal(run('mnQuests().filter(q=>q.done).length'),1);fresh();await c.QiheChapter.interact('bandit');assert.equal(lines.at(-1).w,'帮众');await c.QiheChapter.interact('aide');assert.equal(lines.at(-1).w,'采办随从');await c.QiheChapter.interact('luheng');assert.equal(lines.at(-1).w,'陆衡');
 // Optional branches and both endings work during chapter free time, with no time cost.
 for(const [key,id,who]of[['letter','steward','陈伯'],['account','wukui','药商'],['ledger','procurement','周婶']]){
  fresh();run("S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay="+(key==='letter'?2:4)+";S.qiheChapter.events['xu-meeting']=true;S.qiheChapter.events['three-meeting']=true;");await c.QiheChapter.interact(id);await c.QiheOutsiders.check(key,who);if(key==='ledger')await c.QiheOutsiders.check(key,'差役');await c.QiheChapter.interact(id);assert.equal(c.QiheOutsiders.get(key).choice,0);assert.equal(run('S.qiheChapter.halfDay'),key==='letter'?2:4);assert.equal(run('S.qiheChapter.coreIntact'),true);
 }
 // 过了时限：不能再接，任务里写没办成。
 for(const [key,id,h]of[['letter','steward',4],['account','wukui',6],['ledger','procurement',6]]){fresh();run("S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay="+h);if(key==='letter')c.QiheChapter.state().events['xu-meeting']=true;else{c.QiheChapter.state().events['xu-meeting']=true;c.QiheChapter.state().events['three-meeting']=true;}assert(!c.QiheOutsiders.questOpen(key));await c.QiheChapter.interact(id);assert.equal(c.QiheOutsiders.get(key).stage,'none',key+' 过时不能接')}
 run("S.qiheChapter.halfDay=2");c.QiheOutsiders.get('letter').stage='accepted';run("S.qiheChapter.halfDay=4");assert(c.mnQuests().some(q=>q.t==='一封未落款的拜帖'&&q.d.includes('过了时限没办成')));
 console.log('PASS errand deadlines');
 fresh();run("S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events['xu-meeting']=true;S.prologue.outsiders={version:1,quests:{letter:{stage:'accepted',choice:null,rewarded:false}}}");run("S.qiheChapter.stage='fire'");assert(!c.QiheOutsiders.available());assert(run("mnQuests().find(q=>q.t==='一封未落款的拜帖').closed"));
 fresh();run("S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events['xu-meeting']=true");await c.QiheChapter.interact('steward');const chen=c.rt.SC.prologue_chen_hall.npcs.find(n=>n.name==='陈伯');choices=[1];const priorLines=lines.length;await chen.act();assert(lines.length>priorLines);assert.equal(c.QiheOutsiders.get('letter').stage,'accepted');assert.equal(c.DialogueStage.snapshot.scope,null);
 // Unscoped conversations cannot inherit the preceding speaker by elapsed time.
 run("DialogueStage.enter('叶蘅','c_ye');DialogueStage.closeLine();DialogueStage.enter('陆衡','c_opening_luheng')");assert(!c.DialogueStage.snapshot.actors.some(a=>a.who==='叶蘅'));
 console.log('PASS both endings, optionality, expiry, no time/relic mutation, unrelated portraits');
})().catch(e=>{console.error(e);process.exitCode=1});
