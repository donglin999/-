'use strict';
// 2026-10-28 功能类佩饰接线：行商牙牌（买价 −12%、银两 +15%）、指南鱼坠（掉落 +15%、战后回复 8%）、药香荷包（药食 +30%）、走镖手札（历练 360）。
const test=require('node:test'),assert=require('node:assert/strict');
global.window=global;
global.ITEMS={};
require('../js/qihe-steal-data.js');
require('../js/qihe-npc-items.js');
const eq={hero:{acc:null},ye:{acc:null}};
global.mnEq=w=>eq[w];global.mnMembers=()=>['hero','ye'];
require('../js/qihe-acc-fx.js');
const F=window.QiheAccFx,Pool=require('../js/shared-insight-pool.js');

test('物品带上了效果字段，说明里不再写“待接”',()=>{
 for(const k of ['qh_merchant_tally','qh_compass_fish','qh_escort_notes','qh_herb_pouch'])assert.ok(ITEMS[k]&&!/待接/.test(ITEMS[k].desc),k);
 assert.deepEqual(ITEMS.qh_merchant_tally.func,{buy:.12,silver:.15});
 assert.deepEqual(ITEMS.qh_compass_fish.func,{drop:.15,postHeal:.08});
 assert.equal(ITEMS.qh_escort_notes.insight,360);
});

test('没戴就不变；队里有人戴牙牌，买价、银两都算',()=>{
 eq.hero.acc=null;eq.ye.acc=null;
 assert.equal(F.buy(100),100);assert.equal(F.silver(40),40);assert.equal(F.drop(25),25);
 eq.ye.acc='qh_merchant_tally';
 assert.equal(F.buy(100),88);assert.equal(F.buy(2),2);assert.equal(F.buy(1),1);
 assert.equal(F.silver(40),46);assert.equal(F.silver(0),0);
});

test('指南鱼坠：掉落几率（百分数）乘 1.15 封顶 100；战后回复只算戴着的人',()=>{
 eq.hero.acc='qh_compass_fish';eq.ye.acc=null;
 assert.ok(Math.abs(F.drop(40)-46)<1e-9);assert.equal(F.drop(95),100);
 assert.equal(F.of('hero').postHeal,.08);assert.equal(F.of('ye').postHeal,undefined);
});

test('药香荷包：戴着的人服药食多回 30%',()=>{
 eq.hero.acc=null;eq.ye.acc='qh_herb_pouch';
 assert.equal(F.heal('ye',40),52);assert.equal(F.heal('hero',40),40);
});

test('走镖手札读过才发 360 历练，只发一次',()=>{
 const s={};assert.equal(Pool.sync(s).length,0);
 s.itemInsight={qh_escort_notes:true};
 const g=Pool.sync(s);assert.equal(g.length,1);assert.equal(g[0].amount,360);assert.equal(s.jianghuInsight.balance,360);
 assert.equal(Pool.sync(s).length,0);assert.equal(s.jianghuInsight.balance,360);
});

test('行诊药囊：医具兵器，拿着的人治疗招式多回 22%；兵器、佩饰两格的效果相加',()=>{
 const k=ITEMS.qh_medical_kit;assert.equal(k.weapon.kind,'医具');assert.ok(!/待接/.test(k.desc));
 eq.hero={acc:null,weapon:null};eq.ye={weapon:'qh_medical_kit',acc:'qh_herb_pouch'};
 assert.equal(F.skillHeal('ye',100),122);assert.equal(F.skillHeal('hero',100),100);
 assert.equal(F.heal('ye',40),52,'佩饰照算');
});

test('百家平安符：挨上致命一击保住 1 点气血，每场（每个战斗单位）一次',()=>{
 ITEMS.qh_baijia_charm={name:'百家平安符',acc:1,func:{lastStand:1}};
 eq.hero={acc:'qh_baijia_charm',weapon:null};global.floatTxt=()=>{};
 const u={side:'ally',isHero:true,hp:5};
 assert.equal(F.lastStand(u,3),3,'不致命不管');
 assert.equal(F.lastStand(u,99),4,'第一次致命：留 1 点');
 assert.equal(F.lastStand(u,99),99,'同一场第二次照常');
 assert.equal(F.lastStand({side:'foe',hp:5},99),99,'敌人不算');
});
