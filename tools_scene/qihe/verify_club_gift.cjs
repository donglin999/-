// 2026-10-27：枣木短棍改由陈伯在自家门厅当面给（风起-赠物.ink fq_gift_club）。修车认路做完后不直接发，门厅找陈伯才发；只发一次。
const assert=require('node:assert/strict');const {boot}=require('./harness.cjs');
(async()=>{const {c,run}=await boot();const Q=c.QiheChapter;c.choose=async()=>0;run("window.__said=[];say=async(w,t)=>{__said.push(w+'：'+t)}");const said={get list(){return run('__said')},some(f){return this.list.some(f)},clear(){run('__said.length=0')}};
run("S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,originExpression:'A',greeted:{}};S.prologue.rested=true;S.prologue.relicSeen=true;S.bag={};S.weapon=null;S.armor=null;S.acc=null;S.party=['ye'];S.silver=50;S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);spawnWanderers();mode='scene';busy=false;dlgBusy=false;keys={};");
const chen=run("SC.prologue_chen_hall.npcs.find(n=>n.id==='chen')");
assert.equal(Q.clubPending(),false);assert.equal(!!chen.mark(),false,'修车前陈伯没有标记');
await Q.activity('transport');
assert.equal(run('S.bag.club||0'),0,'活动结束不直接发短棍');assert.equal(Q.clubPending(),true);assert.equal(!!chen.mark(),true,'修车后陈伯挂标记');
assert(said.some(s=>s.includes('陈伯托人带话')),'活动结束提示去门厅：'+JSON.stringify(said.list));
said.clear();await chen.act();
assert.equal(run('S.bag.club'),1);assert.equal(Q.clubPending(),false);assert.equal(!!chen.mark(),false);assert(said.some(s=>s.includes('枣木短棍我给你削好了')),'播陈伯当面给的台词');
await chen.act();assert.equal(run('S.bag.club'),1,'不重复发');
console.log('PASS club gift at Chen hall');process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
