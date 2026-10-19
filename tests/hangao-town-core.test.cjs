// 汉皋城系统逻辑测试（无浏览器）：node --test tests/hangao-town-core.test.cjs
// 覆盖 docs/design/hangao-systems.md 的可量化规则；不证明界面、美术或平衡。
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../review/hangao-town/town-data.js');
const C = require('../review/hangao-town/town-core.js');
const fresh = () => C.create(D);
const uidOf = (s, id) => s.inv.find(e => e.id === id).uid;

test('时间：只由剧情时间点推进；活动不耗时间', () => {
  const s = fresh(); assert.equal(C.label(D, s), '五月初一·午后'); assert.equal(s.phase, 'day');
  C.rest(D, s, 'inn_upper'); C.work(D, s, 'porter', 'good'); C.acceptTask(D, s, 'b_lost_dog'); C.completeTask(D, s, 'b_lost_dog');
  assert.equal(C.label(D, s), '五月初一·午后', '歇息、零工、委托都不推进时间');
  assert.equal(C.advanceBeat(D, s, 'hg_board').ok, false, '不在目标场所不能推进');
  const r = C.advanceBeat(D, s, 'hg_inn'); assert.ok(r.ok); assert.ok(r.scene.length > 0, '有小剧场');
  assert.equal(C.label(D, s), '五月初一·夜'); assert.equal(s.phase, 'night');
});

test('方案 A：九个时间点，夜晚只有两个特殊剧情夜；自由期不限时，找周砚回谷', () => {
  const s = fresh(), seq = [];
  while (!s.monthEnded) { seq.push(D.BEATS[s.beat].id + (s.phase === 'night' ? '☾' : '')); C.advanceBeat(D, s, C.goal(D, s).place); }
  assert.deepEqual(seq, ['T1', 'T2☾', 'T3', 'T3b', 'T5', 'T7', 'T9', 'T10☾', 'F']);
});

test('约定可快进；推进前能列出会错过的事；特殊剧情夜只限定活动范围', () => {
  const s = fresh(); s.beat = D.BEATS.findIndex(b => b.id === 'T5');
  assert.ok(C.expiring(D, s, 'skip').length > 0); assert.ok(C.advanceBeat(D, s, 'hg_inn', 'skip').ok); assert.equal(D.BEATS[s.beat].id, 'T9');
  const t = fresh(); assert.equal(C.advanceBeat(D, t, 'hg_inn', 'skip').ok, false, 'T1 没有可快进的约定');
  assert.ok(C.isOpen(D, t, C.place(D, 'hg_qiyue')) && C.isOpen(D, t, C.place(D, 'hg_casino')), '夜景场所白天也能进');
  C.advanceBeat(D, t, 'hg_inn'); assert.equal(C.isOpen(D, t, C.place(D, 'hg_smith')), false, '特殊剧情夜：铁铺不在活动范围');
  assert.deepEqual(D.PLACES.filter(p => C.isOpen(D, t, p)).map(p => p.id).sort(), ['hg_casino', 'hg_inn', 'hg_qiyue', 'hg_sundry1'], '只有限定范围内的场所能去');
});

test('购买：扣钱、入行囊、加好感；营业时间、银两、限购、熟客专柜都会拦', () => {
  const s = fresh();
  const r = C.buy(D, s, 'hg_smith', 'qingfeng_sword'); assert.ok(r.ok); assert.equal(s.silver, 220 - 36); assert.equal(s.fav.hg_smith, 3);
  assert.equal(C.buyCheck(D, s, 'hg_smith', 'binxie_sword').ok, false, '乙级 260 两买不起');
  assert.match(C.buyCheck(D, s, 'hg_smith', 'dunfeng_sword').why, /好感 60/);
  s.beat = 1; assert.match(C.buyCheck(D, s, 'hg_smith', 'ruanjia').why, /今晚不去/); s.beat = 0;
  s.phase = 'day'; s.silver = 9999; assert.ok(C.buy(D, s, 'hg_smith', 'binxie_sword').ok);
  assert.match(C.buyCheck(D, s, 'hg_smith', 'binxie_sword').why, /限 1/);
  assert.match(C.buyCheck(D, s, 'hg_rouge', 'suzhu_yanzhi').why, /尚未上架/);
});

test('价格：好感折扣、讲价九折、最低七折、生客上浮', () => {
  const s = fresh();
  assert.equal(C.buyPrice(D, s, 'hg_jewel', 'anxingfu'), Math.ceil(18 * 1.1), '翠钿阁生客上浮一成');
  s.fav.hg_jewel = 30; assert.equal(C.buyPrice(D, s, 'hg_jewel', 'anxingfu'), Math.ceil(18 * 0.9));
  s.fav.hg_smith = 90; s.haggle.hg_smith = { beat: s.beat, ok: true };
  assert.equal(C.buyPrice(D, s, 'hg_smith', 'bailian_sword'), Math.ceil(96 * Math.max(0.85 * 0.9, 0.7)));
});

test('讲价：每家每个时间点一次，结果固定；换时间点可再试', () => {
  const s = fresh(), a = C.haggle(D, s, 'hg_smith'); assert.ok(a.ok);
  assert.equal(C.haggle(D, s, 'hg_smith').ok, false);
  const s2 = fresh(); assert.equal(C.haggle(D, s2, 'hg_smith').success, a.success, '同存档同时间点结果相同，读档不能重刷');
  C.advanceBeat(D, s, 'hg_inn'); assert.equal(C.haggle(D, s, 'hg_smith').ok, false, '特殊剧情夜铁铺不在活动范围');
  C.advanceBeat(D, s, 'hg_inn'); assert.ok(C.haggle(D, s, 'hg_smith').ok, '到下一个白天时间点可再讲价');
});

test('出售与典当：剧情物品拒绝；典当六成、3 个时间点、赎回加一成、过期流当', () => {
  const s = fresh();
  assert.equal(C.sell(D, s, 'hg_smith', uidOf(s, 'ev_zhaotie')).ok, false);
  assert.equal(C.pawn(D, s, uidOf(s, 'ye_box')).ok, false);
  const u = uidOf(s, 'shutie_podao'), before = s.silver; assert.ok(C.pawn(D, s, u).ok);
  assert.equal(s.silver - before, 18); assert.equal(s.pawn[0].due, s.beat + 3);
  assert.ok(C.redeem(D, s, u).ok); assert.equal(s.silver, before - 2, '18 当，20 赎');
  C.pawn(D, s, u); for (const p of ['hg_inn', 'hg_inn', 'hg_board', 'hg_inn']) C.advanceBeat(D, s, p);
  assert.equal(s.pawn.length, 0); assert.deepEqual(s.forfeited, ['shutie_podao']);
});

test('鉴定：付费必定揭示且结果按种子固定；自己看加熟练度', () => {
  const a = fresh(), b = fresh();
  const ra = C.appraise(D, a, uidOf(a, 'unid_sword'), 'paid'), rb = C.appraise(D, b, uidOf(b, 'unid_sword'), 'paid');
  assert.ok(ra.ok); assert.equal(ra.result, rb.result); assert.equal(a.silver, 216);
  const c = fresh(), r = C.appraise(D, c, uidOf(c, 'unid_sword'), 'self');
  assert.ok(r.ok); assert.equal(c.appraiseSkill, r.success ? 3 : 1);
  assert.equal(C.appraise(D, c, uidOf(c, 'jinchuangyao'), 'paid').ok, false, '不需要鉴定的东西');
});

test('委托榜：最多同时 3 张，完成给钱给声望，不耗时间，不能重复', () => {
  const s = fresh();
  ['b_errand_medicine', 'b_lost_dog', 'b_herb'].forEach(id => assert.ok(C.acceptTask(D, s, id).ok));
  assert.equal(C.acceptTask(D, s, 'b_ledger').ok, false);
  const t = C.label(D, s); assert.ok(C.completeTask(D, s, 'b_errand_medicine').ok); assert.ok(C.completeTask(D, s, 'b_lost_dog').ok); assert.equal(C.label(D, s), t, '委托不耗时间');
  assert.equal(s.silver, 220 + 8 + 10); assert.equal(s.rep, 8 + 2 + 3);
  assert.equal(C.acceptTask(D, s, 'b_lost_dog').ok, false);
});

test('赌坊（夜景场所）：每局 1—5 两；每个时间点输赢 ±20 封顶；最多 10 局', () => {
  const s = fresh(); assert.equal(C.dice(D, s, 'big', 6).ok, false);
  let n = 0; while (C.dice(D, s, n % 2 ? 'big' : 'small', 5).ok) n++;
  assert.ok(n <= 10); assert.ok(Math.abs(s.casino.net) <= 20); assert.equal(s.silver, 220 + s.casino.net);
});

test('擂台：输了可再来；连胜三人后挑擂主；擂主随剧情时间点开放', () => {
  const s = fresh(); s.inv.push({ uid: 999, id: 'binxie_sword', qty: 1 });
  assert.ok(C.challenge(D, s).ok); assert.ok(C.challenge(D, s).ok, '同一时间点可以连续上台');
  s.arena.streak = 3; assert.equal(C.arenaNext(D, s).name, '石长庚');
  s.arena.beaten.push('石长庚'); assert.equal(C.arenaCheck(D, s).ok, false, '自由期之前只开放第一位擂主');
  s.beat = D.BEATS.findIndex(b => b.id === 'F'); assert.equal(C.arenaNext(D, s).name, '裴砚秋');
});

test('快速往返：没去过、停航不能去；收车钱、不耗时间；提前回谷结束本月', () => {
  const s = fresh();
  assert.match(C.travelCheck(D, s, 'alliance').why, /亲自走/);
  assert.match(C.travelCheck(D, s, 'hechuan').why, /停航/);
  assert.ok(C.travel(D, s, 'qihe').ok); assert.equal(s.silver, 217); assert.equal(C.label(D, s), '五月初一·午后'); assert.equal(s.where, 'qihe');
  assert.ok(C.returnToTown(D, s).ok); assert.equal(s.where, 'hangao');
  assert.ok(C.travel(D, s, 'guiyun').endMonth); assert.equal(s.monthEnded, true);
});

test('打零工、点菜、宴请、传闻、听曲', () => {
  const s = fresh();
  assert.equal(C.work(D, s, 'porter', 'good').pay, 8); C.work(D, s, 'porter', 'normal'); C.work(D, s, 'porter', 'normal'); assert.equal(C.work(D, s, 'porter', 'normal').ok, false, '每个时间点最多三次');
  assert.ok(C.eat(D, s, 'bianyu').ok); assert.equal(C.eat(D, s, 'outang').ok, false);
  assert.equal(C.feast(D, s, 'tang').ok, false, '不认识唐照雪');
  assert.ok(C.feast(D, s, 'suzhi').ok); assert.equal(C.feast(D, s, 'suzhi').ok, false);
  const r = C.buyRumor(D, s, 'ask'); assert.ok(r.ok); assert.equal(C.verifyRumor(D, s, r.rumor.id).msg, '查证：属实');
  s.beat = 1; s.phase = 'night'; const m = s.silver; const ref = C.listen(D, s, 'song_houting'); assert.ok(ref.refused); assert.equal(s.silver, m, '不弹的曲不收钱');
  assert.ok(C.listen(D, s, 'song_yuexia').ok); assert.equal(s.silver, m - 5); assert.ok(s.flags.met_liu);
});

test('存档往返：create(saved) 得到深拷贝', () => {
  const s = fresh(); C.buy(D, s, 'hg_smith', 'qingfeng_sword');
  const t = C.create(D, JSON.parse(JSON.stringify(s))); assert.deepEqual(t, s); t.silver = 0; assert.notEqual(s.silver, 0);
});

test('装备：三槽、买并装上替下回行囊、从行囊装上', () => {
  const s = fresh(); assert.equal(s.equip.weapon, 'baila_gun');
  assert.ok(C.buyAndEquip(D, s, 'hg_smith', 'qingfeng_sword').ok); assert.equal(s.equip.weapon, 'qingfeng_sword');
  assert.ok(s.inv.some(e => e.id === 'baila_gun')); assert.equal(s.silver, 184);
  assert.equal(C.buyAndEquip(D, s, 'hg_herb', 'jinchuangyao').ok, false, '药品不能装备');
  assert.ok(C.equipUid(D, s, uidOf(s, 'shutie_podao')).ok); assert.equal(s.equip.weapon, 'shutie_podao');
  assert.equal(C.equipUid(D, s, uidOf(s, 'unid_sword')).ok, false, '未鉴定的不能装备');
});

test('买五与全部卖出', () => {
  const s = fresh(); assert.ok(C.buyMany(D, s, 'hg_herb', 'jinchuangyao', 5).ok); assert.equal(s.silver, 120);
  assert.equal(s.inv.find(e => e.id === 'jinchuangyao').qty, 7);
  assert.ok(C.sellAll(D, s, 'hg_herb', uidOf(s, 'jinchuangyao')).ok); assert.equal(s.silver, 190); assert.ok(!s.inv.some(e => e.id === 'jinchuangyao'));
  s.silver = 50; assert.equal(C.buyMany(D, s, 'hg_herb', 'jinchuangyao', 5).ok, false);
});
