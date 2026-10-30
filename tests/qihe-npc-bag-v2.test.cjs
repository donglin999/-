'use strict';
// 随身物品 v2（2026-10-27，赠礼稿第 11 节）：易物秤不出现商店货；能换的随身物都在偷窃清单里；装备不进随身物；旧存档的秤货重算。
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
require('../js/qihe-steal-data.js');
require('../js/qihe-steal.js');
const D=window.QIHE_NPC_DATA,P=D.PEOPLE,G=window.QiheGift,ST=window.QiheSteal,SH=window.QIHE_NPC_ITEMS;
for(const[id,p]of Object.entries(P))p.id=id;
const fresh=()=>{global.S={qiheChapter:{stage:'days',halfDay:2,events:{}},bag:{},steal:{version:1,lv:1,exp:0}}};

test('新物品都登记进 ITEMS，并有字可当图标',()=>{
 for(const id of SH.NEW){assert.ok(ITEMS[id]?.name,id);assert.ok(ICO[id],id+' 没有字')}
});

test('易物不出现商店货：功能人物秤上的东西与他的货单不相交，店家秤上没有装备和吃食',()=>{
 fresh();
 for(const[id,p]of Object.entries(P)){if(!p.shop)continue;const shop=SH.shopIds(id),stock=Object.keys(G.stockOf(p));
  assert.ok(shop.length,id+' 没有货单');
  for(const x of stock)assert.ok(!shop.includes(x),`${p.name}的秤上出现了商店货 ${x}`)}
 const inn=Object.keys(G.stockOf(P.innkeeper));
 for(const x of ['bun','wine','club','cloth','needles','charm','knife','mianjia'])assert.ok(!inn.includes(x),'店家秤上有 '+x);
 assert.ok(inn.length>=1,'店家秤上应有他的随身物');
});

test('旧存档（v1）里店家秤上的商店货换版后清掉',()=>{
 fresh();S.qiheGift={version:1,stock:{innkeeper:{club:1,cloth:1,bun:3}}};
 const st=G.stockOf(P.innkeeper);assert.ok(!st.club&&!st.cloth&&!st.bun,JSON.stringify(st));
});

test('随身物与偷窃清单一致：能偷的人，肯换的东西都在偷窃清单里；清单只来自随身物',()=>{
 for(const[id,p]of Object.entries(P)){if(p.noSteal)continue;fresh();
  const list=ST.listItems(id,p).map(x=>x.n);
  for(const it of p.bag){if(!G.canSwap(p,it))continue;if(it.when&&!window.QiheNpc.test(it.when))continue;if(it.until&&window.QiheNpc.test(it.until))continue;
   assert.ok(list.includes(it.n),`${p.name}：肯换的 ${it.n} 不在偷窃清单`);assert.ok(it.diff>=1,`${p.name}：${it.n} 能偷却没有难度`)}
  const names=new Set(p.bag.map(x=>x.n||(x.money?'钱袋':'')));
  for(const n of list)assert.ok(names.has(n),`${p.name}：偷窃清单里的 ${n} 不在随身物`)}
});

test('能偷的人身上每件不是剧情、贴身的东西都写了难度；钱都有难度',()=>{
 for(const[id,p]of Object.entries(P)){if(p.noSteal)continue;
  for(const it of p.bag){if(it.c==='剧'&&!it.stealable||it.c==='贴'||it.look)continue;assert.ok(it.diff>=1&&it.diff<=6,`${p.name}：${it.n||'钱'} 难度`)}}
});

test('穿戴装备不进随身物，也不进偷窃与易物',()=>{
 for(const[id,p]of Object.entries(P)){const g=p.gear||{};
  for(const slot of ['weapon','armor','acc']){const c=g[slot];if(!c)continue;
   assert.ok(!p.bag.some(x=>x.n===c.n),`${p.name}：装备 ${c.n} 又出现在随身物`)}}
 fresh();S.lv=2;const v=window.QiheNpc.view(P.shenyanhui);   // 沈雁回：兵器、佩饰来自 gear
 assert.equal(v.gear.weapon.name,'截江棍');assert.equal(v.gear.acc.name,'行旅凭牌');assert.equal(v.gear.armor,null);
 const c=window.QiheNpc.view(P.chen);assert.ok(c.civil);assert.equal(c.gear.weapon.name,'木匠工具');   // 不习武的人装备栏写随身工具
});

test('寻常人熟络才肯换，功能人物初识就换；孩子、小耗子、宋先生没有易物',()=>{
 fresh();
 assert.equal(G.barterState(P.peddler).off,false);
 assert.equal(G.barterState(P.retainer).off,true);
 S.qiheBond={retainer:{score:25,gifts:[]}};assert.equal(G.barterState(P.retainer).off,false);
 for(const id of ['ashuan','xiaohe','aqi','song','ye'])assert.ok(G.barterState(P[id]).hidden,id);
});

test('换光了的随身物，偷窃清单里也没有了',()=>{
 fresh();S.qiheBond={retainer:{score:25,gifts:[]}};S.bag={pill:5};
 assert.ok(ST.listItems('retainer',P.retainer).some(x=>x.n==='麻缠护手'));
 assert.ok(G.deal(P.retainer,[['pill',2]],[['qh_hand_wrap',1]]));
 assert.equal(S.bag.qh_hand_wrap,1);
 assert.ok(!ST.listItems('retainer',P.retainer).some(x=>x.n==='麻缠护手'),'换走的护手还在偷窃清单');
 assert.ok(!G.stockOf(P.retainer).qh_hand_wrap);
});
