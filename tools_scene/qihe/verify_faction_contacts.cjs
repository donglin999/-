const {boot}=require('./harness.cjs'),assert=require('node:assert/strict');
(async()=>{
 const {c,run}=await boot();let choices=[],lines=[],menus=[];
 c.say=async(w,t)=>{lines.push({w,t,cast:c.DialogueStage.snapshot.actors.map(a=>a.who)});assert(!c.DialogueStage.snapshot.actors.some(a=>a.who==='叶蘅'),'Uninvited Ye');};
 c.choose=async(w,t,opts)=>{menus.push({w,opts});const n=choices.length?choices.shift():0;assert(n<opts.length);return n};
 const rows=[['xulingyi','letter','徐令仪','陈伯'],['censhuang','account','岑霜','药商'],['shenyanhui','ledger','沈雁回','周婶']];
 function fresh(stage=null,halfDay=0){run("S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();Object.assign(S.prologue.arrival,{stage:'done',borrowed:true});S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);mode='scene';busy=false;dlgBusy=false;");if(stage){run('S.qiheChapter=QiheChapter.initial()');Object.assign(c.QiheChapter.state(),{stage,halfDay});if(halfDay>=2)c.QiheChapter.state().events['xu-meeting']=true;if(halfDay>=4)c.QiheChapter.state().events['three-meeting']=true;}choices=[];lines=[];menus=[];}
 for(const phase of [[null,0],['opening',0],['days',0],['days',2],['days',4],['days',5],['refuge',6]]){
  fresh(...phase);const locations={};for(const[scene,sc]of Object.entries(c.rt.SC).filter(([,s])=>s.region==='qihe_trial')){run('cur=SC['+JSON.stringify(scene)+'];buildGrid(cur);cur._npcs=npcsOf(cur)');for(const n of c.npcsOf(sc)){
   assert(!['steward','wukui','procurement'].includes(n.id),'Old primary contact remains: '+scene+'/'+n.id);
   if(!c.QiheRepresentatives.names[n.id])continue;assert(!locations[n.id],'Duplicate contact');locations[n.id]=scene;assert(c.standOk(n.x*40,n.y*40));assert([[45,0],[-45,0],[0,45],[0,-45]].some(([dx,dy])=>c.walkable(n.x*40+dx,n.y*40+dy)));
  }}const expectedCount=phase[0]===null||phase[0]==='opening'||phase[1]===0?0:phase[1]===2?1:3;assert.equal(Object.keys(locations).length,expectedCount,'phase '+JSON.stringify(phase));if(expectedCount===3){assert.equal(locations.censhuang,phase[0]==='refuge'?'qh_refuge':phase[1]>=4?'qh_east':'qh_south');}
  if(phase[0]!=='refuge'){const qs=c.questLog().filter(q=>q.group==='三方对接');assert.equal(qs.length,expectedCount);for(const q of qs){assert(c.QiheNavigation.trackNpc(q.chapterNpc));assert.equal(c.QiheNavigation.guide().target.scene,locations[q.chapterNpc]);}}
 }
 console.log('PASS delayed contacts, unique/reachable positions, phase move and tracking');
 for(const [id,k,name,witness]of rows){
  fresh('days',id==='xulingyi'?2:4);if(id==='xulingyi')c.QiheChapter.state().events['xu-meeting']=true;else c.QiheChapter.state().events['three-meeting']=true;const money=run('S.silver'),halfDay=c.QiheChapter.state().halfDay;choices=[0];await c.QiheChapter.interact(id);assert(lines.some(r=>r.w===name));assert.equal(c.QiheChapter.state().halfDay,halfDay,'Contact does not advance time');assert(!c.QiheOutsiders.get(k).stage||c.QiheOutsiders.get(k).stage==='none');assert(c.QiheChapter.state().questions[id+'-dispute']);
  choices=[2,1];await c.QiheChapter.interact(id);assert.equal(c.QiheOutsiders.get(k).stage,'none');choices=[2,0];await c.QiheChapter.interact(id);assert.equal(c.QiheOutsiders.get(k).stage,'accepted');/* 2026-10-19 三方菜单台词迁入 ink（updates/2026-10-19-rewrite-三方.md），第三项改为“有什么要我帮忙的吗？”，不再写委托名 */assert(menus.at(-2).opts[2].includes('帮忙'));
  await c.QiheOutsiders.check(k,witness);const qs=c.mnQuests().find(q=>q.t===c.QiheOutsiders.defs[k].name);assert.equal(qs.giver,name);assert.equal(qs.chapterNpc,id);run('S=JSON.parse(JSON.stringify(S))');choices=[2,1];await c.QiheChapter.interact(id);assert.equal(c.QiheOutsiders.get(k).stage,'done');assert.equal(run('S.silver'),money+c.QiheOutsiders.defs[k].reward);assert(lines.some(r=>r.w===name&&r.cast.includes(name)));assert(!lines.some(r=>['管事','乌魁','采办使'].includes(r.w)));
  choices=[2];await c.QiheChapter.interact(id);assert.equal(run('S.silver'),money+c.QiheOutsiders.defs[k].reward);assert.equal(c.QiheChapter.state().halfDay,halfDay);assert.equal(c.QiheChapter.state().stage,'days');assert(!run('busy'));assert.equal(c.DialogueStage.snapshot.scope,null);
 }
 console.log('PASS principal menus, own dialogue/portrait, refuse/accept/witness/turn-in, no time or double reward');
 for(const [id,k]of rows)for(const stage of ['accepted','checked',...(k==='ledger'?['witnessed']:[]),'done']){
  fresh('days',id==='xulingyi'?2:4);if(id==='xulingyi')c.QiheChapter.state().events['xu-meeting']=true;else c.QiheChapter.state().events['three-meeting']=true;run('S.prologue.outsiders={version:1,quests:{}};S.bag.herb=3;S.marker="old-contact-save"');const q=c.QiheOutsiders.get(k);Object.assign(q,{stage,choice:stage==='done'?1:null,rewarded:stage==='done',evidence:'old saved witness'});const silver=run('S.silver');run('S=JSON.parse(JSON.stringify(S))');choices=[2,0];await c.QiheChapter.interact(id);
  assert.equal(c.QiheOutsiders.get(k).stage,stage==='accepted'?'accepted':'done');assert.equal(run('S.silver'),silver+(stage==='checked'||stage==='witnessed'?c.QiheOutsiders.defs[k].reward:0));assert.equal(run('S.bag.herb'),3);assert.equal(run('S.marker'),'old-contact-save');assert.equal(run('S.qiheChapter.halfDay'),id==='xulingyi'?2:4);assert.equal(c.QiheOutsiders.get(k).evidence,k==='ledger'&&stage==='checked'?c.QiheOutsiders.defs[k].summary:'old saved witness');if(stage==='done')assert.equal(c.QiheOutsiders.get(k).choice,1);
 }
 console.log('PASS original task IDs/states handed off, inventory/evidence/choices/rewards preserved');
 fresh('days',4);c.QiheChapter.state().events['three-meeting']=true;choices=[2,0];await c.QiheChapter.interact('shenyanhui');run("S.qiheChapter.stage='fire'");assert(!c.QiheOutsiders.available());assert(!c.mnQuests().some(q=>q.giver==='沈雁回'&&!q.closed));assert.equal(c.QiheOutsiders.contactRecords().length,0);
 console.log('PASS departure expiry and no premature route/proof unlock');
 fresh();c.say=async(w,t)=>lines.push({w,t});run("S.prologue.relicSeen=true;S.prologue.heard={skill:true,box:true,inspection:true};S.prologue.outsiders={version:1,quests:{letter:{stage:'done',rewarded:true},account:{stage:'done',rewarded:true},ledger:{stage:'done',rewarded:true}}}");await c.QihePrologue.rest();/* 2026-10-19 第一夜台词按 ink 重写（story/01-开始/第一夜-过夜.ink，updates/2026-10-19-rewrite-第一夜.md；R-剧情-04 台词以 ink 为准）：三件跑腿各说一句，不再点主事人名 */assert(lines.some(r=>r.t.includes('正道盟的拜帖')));assert(lines.some(r=>r.t.includes('六只罐子')));assert(lines.some(r=>r.t.includes('差役说根本没人验')));assert(!lines.some(r=>r.t.includes('两只旧药罐')||r.t.includes('管事托我')));assert(run('S.prologue.rested'));
 console.log('PASS first-night testimony uses current contacts and consistent six-jar evidence');
 // 行记人物提示（qihe-journal-notices.js）在“可显示”前每 200ms 轮询；本测试环境没有真实页面，轮询不会停，所以跑完主动退出。
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
