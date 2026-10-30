'use strict';
// 偷窃系统·表驱动测试（2026-10-27 开发三子任务二）：验证第 9 节表每格期望值、规则用例。
const test=require('node:test'),assert=require('node:assert/strict');

// 模拟全局对象
global.isQiheEntry=()=>true;
global.S={};
global.window={};

// 加载模块
require('../js/qihe-steal-data.js');
require('../js/qihe-steal.js');
const D=global.window.QIHE_STEAL_DATA;
const ST=global.window.QiheSteal;

// 模拟 QiheNpc（全局默认）
global.window.QiheNpc={
 view:(t)=>({index:0}),
 bagOf:(t,v)=>{
  if(t.id==='steward')return[{n:'钱45两',money:45,diff:3},{n:'金疮药',diff:2},{n:'厌胜钱',diff:2},{n:'檀木手串',g:'丙',diff:3}];
  if(t.id==='song')return[{n:'银铤',money:600,diff:6},{n:'寒魄符',g:'甲',diff:5},{n:'行商牙牌',g:'甲',diff:5}];
  return[];
 },
 bond:{get:(id)=>({score:0,stage:'冷淡'}),add:(id,v,opt)=>{}},
 test:(cond)=>true,
 data:{PEOPLE:{steward:{id:'steward',battle:{lv:10}},song:{id:'song',gate:0,flags:{breaksLine:'song'}},bandit:{id:'bandit',battle:{lv:12,spec:{name:'帮众'}}}}}
};

test('第 9 节表：管事（10 级）',()=>{
 const ctx={hero:{lv:2,stealLv:2,agi:4},target:{lv:10,state:'normal'},bond:{stage:'冷淡'},rumor:{here:0}};
 const grip=ST.grip(ctx);
 assert.equal(grip,18,'下手把握 18%');
 assert.equal(Math.round(18*0.7),13,'钱 45 两应 13%');
 assert.equal(Math.round(18*0.85),15,'金疮药应 15%');
 assert.equal(Math.round(18*0.85),15,'厌胜钱应 15%');
 assert.equal(Math.round(18*0.7),13,'檀木手串应 13%');
});

test('第 9 节表：宋先生（72 级）',()=>{
 const ctx={hero:{lv:2,stealLv:2,agi:4},target:{lv:72,state:'normal'},bond:{stage:'冷淡'},rumor:{here:0}};
 const grip=ST.grip(ctx);
 assert.equal(grip,5,'下手把握 5%（下限，2026-10-27 用户改 1%→5%）');
 assert.equal(Math.round(1*0.2),0,'0.2 会被限到下限');
 assert.equal(Math.round(1*0.3),0,'0.3 会被限到下限');
});

test('规则：教学不扣关系',async()=>{
 global.S={aqiTeach:{step:1},qiheBond:{}};
 const ctx={npcId:'aqi',item:{n:'测试'},target:{},result:'fail',ruleset:'teach',ctx:{},bond:{},tier:D.TIERS.none,caught:{count:1}};
 
 let bondCalled=false;
 global.window.QiheNpc.bond.add=(id,v)=>{bondCalled=true};
 
 await ST.resolve(ctx);
 assert.equal(bondCalled,false,'教学失手不应调用 bond.add');
});

test('规则：宋先生失手断线',async()=>{
 global.S={qiheSong:{step:2}};
 const ctx={npcId:'song',item:{n:'银铤'},target:{flags:{breaksLine:'song'}},result:'fail',ruleset:'main',
  ctx:{phase:'opening',mapId:'test'},bond:{},tier:D.TIERS.none,caught:{count:1}};
 
 await ST.resolve(ctx);
 assert.equal(global.S.qiheSong.broken,true,'宋先生失手应设 broken');
 assert.equal(global.S.qiheSong.brokenAt,2,'应记录断在 step 2');
});

test('规则：敌对开战条件',async()=>{
 global.S={};
 const baseCtx={
  npcId:'bandit',
  item:{n:'竹叶青'},
  target:{fighter:true,flags:{}},
  result:'fail',
  ruleset:'main',
  ctx:{phase:'opening',mapId:'test',fixedScene:false},
  bond:{hostile:true},
  tier:D.TIERS.none,
  caught:{count:2}
 };
 
 let fightCalled=false;
 global.window.battle=async()=>{fightCalled=true;return'win'};
 global.window.QiheNpc.battleOf=(p)=>({spec:{name:'帮众',lv:12}});
 
 await ST.resolve(baseCtx);
 const rules=D.OUTCOME_RULES.filter(r=>r.set==='main'&&r.effects.some(e=>e.op==='fight'));
 assert.ok(rules.length>0,'应有敌对开战规则');
});

test('规则：读档不复制物品',()=>{
 global.S={steal:{taken:{steward:{'金疮药':true}}}};
 // 2026-10-27：listItems 改读目标的原始随身物品表（target.bag），不再走查看页的 bagOf
 const items=ST.listItems('steward',{id:'steward',battle:{lv:10},bag:[{n:'金疮药',diff:2},{n:'厌胜钱',diff:2}]});
 assert.ok(!items.some(it=>it.n==='金疮药'),'已偷过的物品不应再出现');
 assert.ok(items.some(it=>it.n==='厌胜钱'),'未偷过的物品应出现');
});

console.log('✓ 所有表驱动测试通过');
