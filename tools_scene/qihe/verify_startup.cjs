'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {boot}=require('./harness.cjs');
(async()=>{
 const {c,run,node,local,root}=await boot(),checks=[];
 c.location.pathname='/index.html';let navigation=null;c.location.assign=u=>{navigation=u};
 function check(name,fn){fn();checks.push(name)}
 const state=JSON.parse(run("S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival.stage='done';S.prologue.arrival.borrowed=true;S.scene='qh_south';S.x=680;S.y=400;JSON.stringify(S)"));
 const original=JSON.stringify(state);local.set('xjh.qihe-prologue.v2',original);run('S=null');
 c.QiheEntry.start();check('ordinary entry with old save shows start choice instead of resuming the village',()=>{assert.equal(run('mode'),'title');assert.equal(run('S'),null);assert(node('panel').innerHTML.includes('从头开始'));assert(node('panel').innerHTML.includes('南村口'));assert.equal(local.get('xjh.qihe-prologue.v2'),original)});
 node('qh-new-journey').onclick();const firstURL=navigation;const params=new URL(firstURL,'http://127.0.0.1:8792');
 check('new journey uses a distinct valid key and leaves old data byte-identical',()=>{assert(params.searchParams.get('journey'));assert.equal(params.searchParams.get('play'),'1');assert.equal(local.get('xjh.qihe-prologue.v2'),original)});
 c.location.search=params.search;c.location.hash=params.hash;
 const newKey=run('saveKey()');assert.notEqual(newKey,'xjh.qihe-prologue.v2');let opening=null;
 c.PrologueArrival.play=async()=>{opening={stage:run('S.prologue.arrival.stage'),borrowed:run('S.prologue.arrival.borrowed')};};
 await c.QiheEntry.start();check('new run invokes the actual initial encounter with modern costume',()=>{assert.equal(opening.stage,'encounter');assert.equal(run('S.scene'),'prologue_backhill');assert.equal(opening.borrowed,false);assert.equal(run('S.qiheChapter'),undefined);assert(local.has(newKey));assert.equal(local.get('xjh.qihe-prologue.v2'),original)});
 run("S.prologue.arrival.stage='dog';save()");opening=null;await c.QiheEntry.start();check('explicit play reload resumes its checkpoint rather than replaying completed encounter',()=>assert.equal(opening.stage,'dog'));
 c.location.search='';c.QiheEntry.start();const markup=node('panel').innerHTML;
 check('ordinary entry exposes newest journey and original progress separately',()=>{assert(markup.includes('继续原有进度'));assert.equal(c.QiheEntry.runs()[0].key,newKey);assert.equal(local.get('xjh.qihe-prologue.v2'),original)});
 node('qh-continue-1').onclick();const oldURL=new URL(navigation,'http://127.0.0.1:8792');c.location.search=oldURL.search;opening=null;await c.QiheEntry.start();
 check('continuing original progress restores its scene without playing P-01 again',()=>{assert.equal(run('S.scene'),'qh_south');assert.equal(opening,null);assert.equal(run('S.prologue.arrival.stage'),'done')});
 const latestBefore=local.get('xjh.qihe-prologue.latest.v1');
 for(const [query,key]of [['?uiReview=1&journey=abcdefgh','xjh.qihe-ui.review.v1'],['?battleReview=road&journey=abcdefgh','xjh.qihe-battle.review.v1'],['?storyReview=steward&journey=abcdefgh','xjh.qihe-story.review.v1'],['?chapterPresentationReview=fixture&journey=abcdefgh','xjh.qihe.presentation.review.v1.fixture']]){c.location.search=query;assert.equal(run('saveKey()'),key);run('save()');assert.equal(local.get('xjh.qihe-prologue.latest.v1'),latestBefore)}
 check('all four review contexts remain isolated and cannot replace latest player journey',()=>{});
 c.location.search='?journey=abcdefgh&play=1';local.set('xjh.qihe-prologue.v2.run.abcdefgh','INVALID_SAVE');opening=null;c.QiheEntry.start();
 check('invalid save is retained and returned to launcher instead of overwritten',()=>{assert.equal(run('mode'),'title');assert.equal(opening,null);assert.equal(local.get('xjh.qihe-prologue.v2.run.abcdefgh'),'INVALID_SAVE')});
 c.location.search='';c.location.hash='';check('normal homepage uses current Qihe entry',()=>assert.equal(run('isQiheEntry()'),true));
 c.location.hash='#xiangyang';check('retired Xiangyang demo hash has no engine entry or separate review save (2026-10-19)',()=>{assert.equal(run('isQiheEntry()'),false);assert.equal(run('typeof reviewStart'),'undefined');assert.equal(run('typeof titleScreen'),'undefined');assert.notEqual(run('saveKey()'),'xjh.review.save')});
 const r={passed:checks.length,scope:'actual startup, engine load/save and fresh/resume transitions in local VM; browser verified separately',checks};
 const out=path.join(root,'art_sources/qihe-startup-20261006');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'tests.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
