// 2026-10-27 栖河地图可交互物（js/qihe-town.js）：客栈与三天酒钱、景物、木桶、告示与翻谷、古井、货郎与断扁担、猜字谜、道具绘制与挡路。
const assert=require('node:assert/strict');const {boot}=require('./harness.cjs');
(async()=>{const {c,run}=await boot();let decisions=[];c.choose=async(w,t,opts)=>{const i=decisions.length?decisions.shift():0;if(i>=opts.length)throw Error('选项越界 '+i+' '+t+' '+JSON.stringify(opts));return i};
 run("window.__said=[];say=async(w,t)=>{__said.push(w+'：'+t)}");const said=()=>run('__said'),clear=()=>run('__said.length=0');
 const fresh=()=>run(`S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=0;S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,originExpression:'A',greeted:{}};S.prologue.rested=true;S.prologue.relicSeen=true;S.bag={};S.silver=50;S.party=['ye'];S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);mode='scene';busy=false;dlgBusy=false;keys={};`);
 const npc=(sc,id)=>run(`SC['${sc}'].npcs.find(n=>n.id==='${id}')`);const T=()=>run('S.qiheTown');
 const checks=[];const check=async(name,fn)=>{clear();await fn();checks.push(name);console.log('PASS',name)};
 fresh();
 await check('店家回柜台、帮众进客栈；南村口不再站店家、帮众',async()=>{assert(npc('prologue_inn_interior','innkeeper').show());assert(npc('prologue_inn_interior','bandit').show());assert(!npc('qh_south','cloth'));assert(!npc('qh_south','bandit'))});
 await check('三天酒钱：店家叹气，萧白垫上，账了结',async()=>{const k=npc('prologue_inn_interior','innkeeper');assert.equal(k.mark(),true);decisions=[1];await k.act();assert.equal(T().tab.stage,'done');assert.equal(T().tab.via,'pay');assert.equal(run('S.silver'),26);
  decisions=[];await k.act();assert(said().some(s=>s.includes('热汤往后不收')))});
 await check('灶台热汤：账了结后不收钱，每时段一碗',async()=>{const s0=run('S.silver');await npc('prologue_inn_interior','inn-stove').act();assert.equal(run('S.silver'),s0);clear();await npc('prologue_inn_interior','inn-stove').act();assert(said().some(s=>s.includes('刚喝过')))});
 await check('墙边箱笼：挑火折子，只挑一次',async()=>{decisions=[0];await npc('prologue_inn_interior','inn-chest').act();assert.equal(run('S.bag.qh_tinder'),1);clear();await npc('prologue_inn_interior','inn-chest').act();assert(said().some(s=>s.includes('不值钱')))});
 await check('当面去要：帮众掏钱',async()=>{fresh();decisions=[0];await npc('prologue_inn_interior','innkeeper').act();assert.equal(T().tab.stage,'offered');decisions=[0];await npc('prologue_inn_interior','bandit').act();assert.equal(T().tab.via,'face')});
 await check('木桶：西田埂翻到碎钱，只能翻一次',async()=>{fresh();const s0=run('S.silver');await npc('qh_west','barrel-west').act();assert.equal(run('S.silver'),s0+5);clear();await npc('qh_west','barrel-west').act();assert(said().some(s=>s.includes('空了')))});
 await check('告示招工＋翻谷：领一袋炒米',async()=>{await npc('qihe_trial','notice').act();assert.equal(T().grain.seen,true);decisions=[0];await npc('qh_west','grain-heap').act();assert.equal(T().grain.done,true);assert.equal(run('S.bag.qh_fried_rice'),1)});
 await check('古井：打水每时段一次，之后可丢石子',async()=>{decisions=[1];await npc('qihe_trial','well').act();assert.equal(T().well.drinkAt,0);clear();decisions=[1];await npc('qihe_trial','well').act();assert(said().some(s=>s.includes('石子')),'打过水后第二项变成丢石子')});
 await check('货郎断扁担：托付→陈伯修→谢礼针线包，之后能以物换话',async()=>{fresh();const p=npc('qihe_trial','peddler');decisions=[2,0];await p.act();assert.equal(T().pole.stage,'carry');
  await npc('prologue_chen_hall','chen').act();assert.equal(T().pole.stage,'fixed');await p.act();assert.equal(T().pole.stage,'done');assert.equal(run('S.bag.qh_sewing_kit'),1);
  run('S.bag.qh_dry_branch=1');clear();decisions=[2,0];await p.act();assert.equal(run('S.bag.qh_dry_branch'),0);assert(said().some(s=>s.includes('客房')))});
 await check('货郎买卖：买一捆麻绳、卖一根枯枝（商店是循环的，最后要选“不买了”）',async()=>{const s0=run('S.silver');const n=run('QIHE_NPC_ITEMS.SHOPS.peddler.length');decisions=[0,0,n+1];await npc('qihe_trial','peddler').act();assert.equal(run('S.bag.qh_rope'),1);assert.equal(run('S.silver'),s0-4);run('S.bag.qh_dry_branch=1');decisions=[1,0];await npc('qihe_trial','peddler').act();assert.equal(run('S.silver'),s0-2)});
 await check('猜字谜：一局三题不重复，同一时段只玩一局',async()=>{fresh();await npc('qihe_trial','ashuan').act();assert.equal(T().riddle.used.length,3);assert.equal(T().riddle.playedAt,0);clear();await npc('qihe_trial','xiaohe').act();assert(said().some(s=>s.includes('比过了')));
  run("S.qiheChapter.halfDay=2");await npc('qihe_trial','ashuan').act();assert.equal(T().riddle.used.length,6);assert.equal(new Set(T().riddle.used).size,6)});
 // 2026-10-30 用户“粮仓没剧情就清掉”（评审台第二十四轮第 3 题）：粮仓不再摆、不再加载，改为断言它不在
 await check('道具素材已登记加载，古井挡路，竹席不挡，粮仓已清掉',async()=>{for(const k of ['prop_qh_well_fit_20261027','prop_qh_grain_mat_fit_20261027'])assert(run(`ASSETS.includes('${k}')&&!!PRODUCTION_ASSET_PATHS['${k}']`),k);
  assert.equal(run(`ASSETS.includes('prop_qh_granary_fit_20261027')`),false,'粮仓素材不该再加载');assert.equal(run(`(SC.qihe_trial?.npcs||[]).some(n=>n.id==='granary')`),false,'村心不该再有粮仓');
  assert.equal(run('standOk(1300,775-13)'),false);assert.equal(npc('qh_west','grain-yard').block,undefined,'竹席是地面层，不挡路');assert.equal(npc('qh_west','grain-yard').propTop,true)});
 console.log(JSON.stringify({status:'PASS',checks:checks.length}));process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
