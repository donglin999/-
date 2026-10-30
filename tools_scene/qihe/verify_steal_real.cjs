// 2026-10-27 偷窃用真实人物数据跑一遍（js/qihe-npc-data.js 随身物品 → js/qihe-steal.js 清单与结算）：剧情物不进清单、难度按表、偷到钱加银两、宋先生几件开始部分能试、偷他失手断线。
const assert=require('node:assert/strict');const {boot}=require('./harness.cjs');
(async()=>{const {c,run}=await boot();run(`S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events={'c1-00b':true,'c1-s1':true};S.prologue=QihePrologue.fresh();S.silver=10;S.bag={};S.steal={version:1,lv:1,exp:0};S.scene='qh_north';cur=SC.qh_north;buildGrid(cur);mode='scene';`);run("say=async()=>{}");
 const P=run('QIHE_NPC_DATA.PEOPLE'),ST=c.QiheSteal;const names=id=>ST.listItems(id,P[id]).map(x=>x.n);
 assert.equal(JSON.stringify(names('aide').sort()),JSON.stringify(['竹叶青','羊肉笼饼','厌胜钱','钱袋'].sort()),'采办单是剧情物，不进清单');   // 2026-10-27 随身物品 v2：采办随从加了笼饼、厌胜钱console.log('PASS 采办随从：剧情物不进清单');
 const money=ST.listItems('aide',P.aide).find(x=>x.n==='钱袋');assert.equal(money.money,20);assert.equal(money.diff,2);
 await ST.resolve({npcId:'aide',item:money,target:{flags:{}},result:'ok',ruleset:'main',ctx:{phase:'opening',mapId:'qh_east'},bond:{score:0},tier:run('QIHE_STEAL_DATA.TIERS.none'),caught:{count:1}});
 assert.equal(run('S.silver'),30,'偷到钱袋 +20');assert(!names('aide').includes('钱袋'),'偷过的不再出现');console.log('PASS 偷到钱袋加银两、不再出现');
 const song=names('song');for(const n of ['银铤一枚','寒魄符','行商牙牌','指南鱼坠','走镖手札','后山记人笺'])assert(song.includes(n),'宋先生：'+n);console.log('PASS 宋先生六件开始部分可试');
 const roster=ST.listItems('song',P.song).find(x=>x.n==='后山记人笺');await ST.resolve({npcId:'song',item:roster,target:{flags:P.song.flags},result:'ok',ruleset:'main',ctx:{phase:'opening',mapId:'qh_north'},bond:{score:0},tier:run('QIHE_STEAL_DATA.TIERS.none'),caught:{count:1}});
 assert.equal(run('S.bag.qh_song_roster'),1,'记人笺进行囊');console.log('PASS 偷到后山记人笺');
 const bar=ST.listItems('song',P.song).find(x=>x.n==='银铤一枚');await ST.resolve({npcId:'song',item:bar,target:{flags:P.song.flags},result:'fail',ruleset:'main',ctx:{phase:'opening',mapId:'qh_north'},bond:{score:0},tier:run('QIHE_STEAL_DATA.TIERS.none'),caught:{count:1}});
 assert.equal(run('!!S.qiheSong?.broken'),true,'偷宋先生失手，线断');assert.equal(c.QiheChapter.strangerVisible(),false);console.log('PASS 偷宋先生失手断线');
 console.log(JSON.stringify({status:'PASS'}));process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
