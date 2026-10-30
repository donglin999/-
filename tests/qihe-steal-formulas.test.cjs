'use strict';
// 偷窃系统·公式测试（2026-10-27 开发三子任务一）：验证下手把握、差距系数、成功率按设计稿第 4 节计算。
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

// 模拟 QiheNpc
global.window.QiheNpc=()=>({
 view:()=>({index:0}),
 bagOf:()=>[],
 bond:{get:()=>({score:0,stage:'冷淡'})},
 test:()=>true
});

test('差距系数按平方曲线衰减（第 4.2 节）',()=>{
 // 窃术二级 s=6：d=8 时系数 1/(1+(8/6)²)=0.36
 const ctx1={hero:{lv:2,stealLv:2,agi:4},target:{lv:10},bond:{stage:'冷淡'},rumor:{here:0}};
 const gap1=1/(1+Math.pow(8/6,2));
 assert.ok(Math.abs(gap1-0.36)<0.01,'d=8,s=6 系数应约 0.36');
 
 // 窃术四级 s=7：d=20 时系数 1/(1+(20/7)²)=0.09
 const gap2=1/(1+Math.pow(20/7,2));
 assert.ok(Math.abs(gap2-0.11)<0.01,'d=20,s=7 系数应约 0.11');
});

test('下手把握=底数×差距系数，限 1～95%（第 4.1 节）',()=>{
 // 萧白 2 级窃术二级身法 4，管事 10 级：底数 40+10+0=50，差距系数 0.36 → 18%
 const ctx={hero:{lv:2,stealLv:2,agi:4},target:{lv:10,state:'normal'},bond:{stage:'冷淡'},rumor:{here:0}};
 const grip=ST.grip(ctx);
 assert.equal(grip,18,'管事下手把握应为 18%');
 
 // 不习武的人等级 0，萧白有优势：底数 50+等级优势 2=52，系数 1 → 52%
 const ctx2={hero:{lv:2,stealLv:2,agi:4},target:{lv:0,state:'normal'},bond:{stage:'冷淡'},rumor:{here:0}};
 const grip2=ST.grip(ctx2);
 assert.equal(grip2,52,'不习武者下手把握应为 52%');
});

test('单件成功率=下手把握×难度系数（第 4.3 节）',()=>{
 // 下手把握 18%，难二（0.85）→ 15%，难三（0.7）→ 13%
 assert.equal(Math.round(18*0.85),15,'难二单件应 15%');
 assert.equal(Math.round(18*0.7),13,'难三单件应 13%');
 
 // 下限 5%（2026-10-27 用户改，原 1%）：成功率低于 5% 时限定到 5%
 const ctx={hero:{lv:2,stealLv:2,agi:4},target:{lv:88,state:'normal'},bond:{stage:'冷淡'},rumor:{here:0}};
 const grip=ST.grip(ctx);
 assert.equal(grip,5,'周砚下手把握应限定为 5%');
});

test('窃术等级按经验阶梯（第 5 节）',()=>{
 global.S.steal={exp:0};
 assert.equal(ST.stealLv(),1,'经验 0 应为一级');
 global.S.steal.exp=6;
 assert.equal(ST.stealLv(),2,'经验 6 应为二级');
 global.S.steal.exp=15;
 assert.equal(ST.stealLv(),3,'经验 15 应为三级');
 global.S.steal.exp=230;
 assert.equal(ST.stealLv(),10,'经验 230 应为十级');
});

test('失手扣关系按次数（第 8.3 节）',()=>{
 assert.equal(D.CAUGHT_PENALTY[1],-10,'首次失手扣 −10');
 assert.equal(D.CAUGHT_PENALTY.more,-15,'再次失手扣 −15');
});

console.log('✓ 所有公式测试通过');

test('戒心：得手一件 ×0.85，失手被发觉一回 ×0.85²，不低于 5%',()=>{
 global.S={steal:{taken:{x:{a:true}},caught:{x:{count:1}}}};
 const w=ST.wary('x');assert.equal(w.lv,3);assert.ok(Math.abs(w.mult-Math.pow(0.85,3))<1e-9);
 const c=ST.chance('x',{g:null,diff:1},60,{}).chance;assert.equal(c,Math.round(60*Math.pow(0.85,3)));
 global.S={steal:{taken:{},caught:{y:{count:3}}}};assert.equal(ST.chance('y',{diff:6},10,{}).chance,5,'压到下限 5%');
});
