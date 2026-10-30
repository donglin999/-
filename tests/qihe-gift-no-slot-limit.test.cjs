'use strict';
// 2026-10-27 用户“一个时段不设送礼次数”：同一时段可以连送；同一件东西连送靠递减收住（第二件减半，第三件起不加分）。
// 2026-10-29 评审台“以物易物与商店”你选的改法：第三件起台词说“不必再送”，东西退回行囊、不扣。
const test=require('node:test'),assert=require('node:assert/strict');

global.isQiheEntry=()=>true;
global.window=global;
global.ITEMS={bun:{name:'羊肉笼饼',price:6},wine:{name:'竹叶青',price:20},pill:{name:'金疮药',price:20},club:{name:'枣木短杖',price:16},cloth:{name:'归谷短衣',price:20},
 needles:{name:'素铜针囊',price:22},charm:{name:'厌胜钱',price:18},knife:{name:'厚背樵刀',price:32},mianjia:{name:'行旅夹衣',price:38},jade:{name:'檀木手串',price:55},
 pelt:{name:'山狼皮',price:16},vest:{name:'牛皮护心甲',price:70},iron:{name:'青锋剑',price:80},
 qh_rope:{name:'麻绳',price:4},qh_tinder:{name:'火折子',price:6},qh_sewing_kit:{name:'针线包',price:8},qh_candy:{name:'糖块',price:2},qh_fried_rice:{name:'炒米',price:3},
 qh_flat_stone:{name:'扁石子',key:1},qh_wild_herb:{name:'野草药'},qh_dry_branch:{name:'枯枝'},qh_river_reed:{name:'芦苇'},qh_practice_staff:{name:'练习棍'},
 qh_song_coat:{name:'青绫行衣'},qh_song_abacus:{name:'乌木算珠'}};
global.ICO={};
global.S={qiheChapter:{stage:'days',halfDay:2,events:{}},bag:{}};
require('../js/qihe-npc-items.js');
require('../js/qihe-npc-data.js');
require('../js/qihe-npc-core.js');
require('../js/qihe-gift.js');
const P=window.QIHE_NPC_DATA.PEOPLE,G=window.QiheGift,Q=window.QiheNpc;
for(const[id,p]of Object.entries(P))p.id=id;

test('同一时段给同一个人连送，前两件收下且递减；第三件同样的退回不扣',()=>{
 const p=P.innkeeper;S.bag={bun:3,wine:1};
 const r1=G.give(p,'bun'),r2=G.give(p,'bun'),r3=G.give(p,'bun'),r4=G.give(p,'wine');
 for(const r of [r1,r2,r3,r4])assert.notEqual(r.kind,'used');
 assert.equal(r3.kind,'again');assert.equal(r3.keep,true,'第三件退回');
 assert.equal(S.bag.bun,1,'送出两个笼饼，第三个还在行囊');
 const d=[r1,r2,r3].map(r=>r.after-r.before);
 assert.ok(d[1]<=d[0]&&d[2]===0,'递减：'+d);
 assert.equal(G.givenTo(p),3);
 assert.ok(!('usedThisSlot' in G),'不再有每时段一次的判断');
});
