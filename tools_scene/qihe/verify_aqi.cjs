// 2026-10-27 小耗子的一课（js/qihe-aqi.js）：喊声、门口打赌（失手再来）、摸钱袋、买药、挂药、交工钱学会“窃”；主线先指向他；第二天两个伏笔点。
const assert=require('node:assert/strict');const {boot}=require('./harness.cjs');
(async()=>{const {c,run}=await boot();let decisions=[];c.choose=async(w,t,opts)=>{const i=decisions.length?decisions.shift():0;if(i>=opts.length)throw Error('选项越界 '+i+' '+t);return i};
 run("window.__said=[];say=async(w,t)=>{__said.push(w+'：'+t)}");const said=()=>run('__said'),clear=()=>run('__said.length=0');
 let games=[];c.QiheStealUI.minigame=async(npc,item,rate)=>{games.push([npc,item.n,rate]);return games.length<=3?'fail':'ok'};   // 前三手都失手：看“再来”与保底
 run(`S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=0;S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,originExpression:'A',greeted:{}};S.prologue.rested=true;S.prologue.relicSeen=true;S.bag={};S.silver=50;S.party=['ye'];S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);mode='scene';busy=false;dlgBusy=false;keys={};`);
 const npc=(sc,id)=>run(`SC['${sc}'].npcs.find(n=>n.id==='${id}')`);const A=c.QiheAqi,Q=c.QiheChapter;
 const checks=[];const check=async(name,fn)=>{clear();await fn();checks.push(name);console.log('PASS',name)};
 await check('第一天白天主线先指向客栈门口的小耗子，进药棚不弹下一时段',async()=>{assert.equal(Q.mainStep().aqi,true);assert.equal(Q.mainStep().title,'客栈门口的小耗子在喊你')});
 await check('散场后喊一声',async()=>{await A.call();assert(said().some(s=>s.includes('过来，过来')));assert.equal(npc('qihe_trial','aqi').mark(),true)});
 await check('门口打赌：失手再来，三次都没摸着小耗子保底教会，到第 1 步',async()=>{decisions=[0];await npc('qihe_trial','aqi').act();assert.equal(A.step(),1);assert.equal(games.length,3);assert(said().some(s=>s.includes('再来再来')));assert(said().some(s=>s.includes('三回都摸不着')))});
 await check('东埠摸钱袋（固定 100%）→ 第 2 步',async()=>{assert.equal(npc('qh_east','aide').mark(),true);await npc('qh_east','aide').act();assert.equal(A.step(),2);assert.equal(games.at(-1)[2],100)});
 await check('南村口药商买药 → 第 3 步；挂到老人家门上 → 第 4 步',async()=>{await npc('qh_south','merchant').act();assert.equal(A.step(),3);const d=npc('qihe_trial','aqi-door');assert.equal(d.show(),true);await d.act();assert.equal(A.step(),4);assert.equal(d.show(),false)});
 await check('交工钱、报本名、学会“窃”；主线换回去药棚',async()=>{decisions=[0];await npc('qihe_trial','aqi').act();assert.equal(A.learned(),true);assert.equal(run('S.aqiTeach.wage'),'said');assert.equal(run('S.skills.steal'),true);assert.equal(run('QiheNpc.state().skills.steal'),true);assert.notEqual(run("QiheNpc.stealState(QIHE_NPC_DATA.PEOPLE.aide).note"),'还不会偷窃');assert(said().some(s=>s.includes('阿七')));assert.equal(Q.mainStep().title,'去药棚见来客')});
 await check('第二天：拿了还能还；客栈里柜上少钱（各一次）',async()=>{run('S.qiheChapter.halfDay=2');await npc('qihe_trial','aqi').act();assert(said().some(s=>s.includes('拿了还能还')));clear();decisions=[0];await npc('prologue_inn_interior','innkeeper').act();assert(said().some(s=>s.includes('柜上那串钱')));assert.equal(run('S.aqiTeach.hintName'),true)});
 console.log(JSON.stringify({status:'PASS',checks:checks.length}));process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
