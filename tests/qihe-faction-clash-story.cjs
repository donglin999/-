const {boot}=require('../tools_scene/qihe/harness.cjs'),assert=require('node:assert/strict');
(async()=>{
 const {c,run}=await boot();let plays=0,fail=false,lines=[],shots=[];
 c.say=async(w,t)=>lines.push([w,t]);c.choose=async()=>0;c.battle=async()=> 'win';
 c.QiheFireCinematic.play=async(id,rows)=>{shots.push(id);lines.push(...rows)};
 c.QiheFactionClash.play=async()=>{plays++;assert.equal(c.QiheChapter.state().fireLit,undefined);if(fail)throw Error('clash interrupted');return'stopped'};
 function fresh(extra={}){run("S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,greeted:{}};S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='fire';S.qiheChapter.halfDay=6;S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);spawnWanderers();mode='scene';busy=false;dlgBusy=false;keys={};");Object.assign(c.QiheChapter.state(),extra);lines=[];shots=[];plays=0;fail=false}
 fresh();fail=true;await c.QiheChapter.resume();assert.equal(c.QiheChapter.state().storyError.message,'clash interrupted');assert.equal(c.QiheChapter.state().storyError.count,1);// 2026-10-16：出错由 guarded 捕获并提示，不再向外抛
 assert.equal(c.QiheChapter.state().pendingEvent,'fire-start');assert(!c.QiheChapter.state().clashVersion);assert(!c.QiheChapter.state().fireLit);
 fail=false;await c.QiheChapter.resume();assert.equal(plays,2);assert.equal(c.QiheChapter.state().storyError,undefined);assert.equal(c.QiheChapter.state().clashVersion,3);assert(c.QiheChapter.state().events['fire-start']);assert.equal(c.QiheChapter.state().stage,'refuge');assert(shots.includes('ignition'));assert(lines.some(x=>x[1].includes('还不知道侧口已经停手')));
 fresh({clashVersion:1});await c.QiheChapter.resume();assert.equal(plays,0);assert(shots.includes('ignition'));
 fresh({fireLit:true});await c.QiheChapter.resume();assert.equal(plays,0);assert(!shots.includes('ignition'));assert(!c.QiheChapter.state().clashVersion);
 fresh({stage:'refuge',fireLit:true,events:{'fire-start':true,rescue:true,'road-battle':true}});await c.QiheChapter.evidence();assert.equal(plays,0);assert(!shots.includes('ignition'));
 fresh({stage:'refuge',clashVersion:1,fireLit:true,events:{'fire-start':true}});await c.QiheChapter.evidence();assert(lines.some(x=>x[0]==='徐令仪'&&x[1].includes('我也出剑')));assert(lines.some(x=>x[0]==='岑霜'&&x[1].includes('我也动了手')));
 console.log('PASS clash interruption/retry, completed-clash resume, old-fire/late saves, both leaders responsible');
})().catch(e=>{console.error(e);process.exitCode=1});
