'use strict';
// 2026-10-16 审查 P0：培养存档先迁移后校验、读档失败可修复。纯 node，无需浏览器。
const assert=require('node:assert/strict');
const C=require('../js/qh-mode-cultivation-core'),D=require('../js/qh-mode-cultivation-data'),R=require('../js/qh-mode-cultivation-relations');
const copy=x=>JSON.parse(JSON.stringify(x));
const current=D.economyVersion;
function ready(){const s=C.initial();C.join(s);s.learned.stance={source:'B03'};return s;}

// 1. 模拟 economyVersion 升一级：上一版的旧档（含进行中活动）仍能读入，迁移后版本跟上。
const plain=copy(ready()),busy=ready();C.start(busy,'B03');const busySave=copy(busy);
D.economyVersion=current+1;
try{
 const a=C.restore(plain);assert.equal(a.economyVersion,current+1);assert.equal(a.energy,plain.energy);
 const b=C.restore(busySave);assert.equal(b.pending.action,'B03');assert.equal(b.economyVersion,current,'有进行中活动时保留旧版本，收尾后再迁移');
 C.resolve(b,0,{directResult:true});C.closeResult(b);assert.equal(b.economyVersion,current+1);
 assert.equal(C.recover(plain).repairs.length,0);
}finally{D.economyVersion=current;}

// 2. 比程序新的存档仍拒读；第 1 版（无版本号、体力上限 10）照旧补足体力。
assert.throws(()=>C.restore({...plain,economyVersion:current+1}),/格式不正确/);
const legacy=copy(plain);delete legacy.economyVersion;legacy.energy=10;assert.equal(C.restore(legacy).energy,Math.min(D.energyPerPeriod,10+D.energyPerPeriod-10));
assert.throws(()=>C.restore({...legacy,energy:11}),/格式不正确/);

// 3. 失效的动作选择、关系人物、历练地点、进行中活动：修复后读入，原数据不被改动。
const known=Object.values(R.profiles)[0].id,broken=copy(busySave);
broken.selection={category:'basic',action:'GONE01'};
broken.relations={[known]:{score:10,interactions:[],returnOffered:false},ghost:{score:5,interactions:[],returnOffered:false}};
broken.pending.action='GONE02';
const before=JSON.stringify(broken);
assert.throws(()=>C.restore(broken));
const fixed=C.recover(broken);
assert.ok(fixed.state,'应修复成功');assert.equal(JSON.stringify(broken),before,'原数据不变');
assert.deepEqual(fixed.state.selection,C.initial().selection);
assert.deepEqual(Object.keys(fixed.state.relations),[known]);
assert.equal(fixed.state.pending,null);assert.equal(fixed.state.energy,broken.energy,'不退回体力（待用户确认）');
assert.equal(fixed.repairs.length,3);assert.ok(fixed.error);

// 4. 修不了的给出 state:null 与原因，由界面提供出口。
const hopeless=C.recover({...copy(plain),route:'nowhere'});assert.equal(hopeless.state,null);assert.match(hopeless.error,/格式不正确/);
assert.equal(C.recover(null).state,null);
console.log('save-recovery ok');
