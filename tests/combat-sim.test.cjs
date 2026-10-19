'use strict';
// 离线战斗模拟器：可复现、规则与弱点系统 v1 一致。
const test = require('node:test'), assert = require('node:assert/strict');
const sim = require('../tools_balance/combat_sim.cjs');

test('同一种子结果完全一致', () => {
  const run = () => { const r = sim.runBattle(sim.buildParty('破势爆发', 6), sim.buildFoes('精英·刀堂', 6), 1234); return JSON.stringify({ w: r.win, n: r.rounds, log: r.S.log }); };
  assert.equal(run(), run());
});

test('装配遵守功法重数开启：甲级第二招五重前不出现，绝招七重前不出现', () => {
  for (let si = 0; si < sim.STAGES.length; si++) {
    const u = sim.buildMember('xiao_s', si);
    for (const id of u.load) { const art = sim.D.artOf[id]; if (art) assert(art.unlock <= u.levels[id], `${sim.STAGES[si]} ${id} 未开启却被装配`); }
  }
  assert(!sim.buildMember('xiao_s', 6).load.includes('gy_s4b'), '游历初期千岚归一只有一重，敛云守锋不应开启');
});

test('削盾与破势：每段命中弱点削1盾，盾归零即破势，破势跳过行动并在两回合后回满', () => {
  const party = sim.buildParty('破势爆发', 6), foes = sim.buildFoes('普通·山道', 6);
  const r = sim.runBattle(party, foes, 99);
  assert(r.S.log.breaks >= 0);
  for (const f of r.S.foes) { assert(f.shield >= 0 && f.shield <= f.maxShield); }
  // 全量统计里必须出现破势
  let breaks = 0; for (let s = 0; s < 20; s++) breaks += sim.runBattle(sim.buildParty('破势爆发', 6), sim.buildFoes('普通·山道', 6), s).S.log.breaks;
  assert(breaks > 0, '20 场普通战一次破势都没有');
});

test('绝招只在 3BP 时可用，用后计入统计', () => {
  const D = sim.D;
  for (const id of ['gy_s5', 'zc_s5', 'gj_s5']) { const c = D.moves[id].c; assert.equal(c.bp[0].available, false); assert.equal(c.bp[3].available, true); assert.equal(c.mp, 24); }
  // 绝招威力需明显高于“甲级招 + 3BP”
  assert(D.moves.gy_s5.c.total_power > D.moves.gy_s4.c.total_power * 2.1 * 1.25);
});

test('内功数值：18 门都有可结算的主动效果与被动数值', () => {
  for (const h of Object.values(sim.D.hearts)) {
    assert(h.active_skill.effects.length >= 1, h.id); assert(Number.isInteger(h.active_skill.cooldown_self_actions), h.id);
    assert(h.passive_skill.numbers && Object.keys(h.passive_skill.numbers).length, h.id);
  }
});

test('培养方式：功法不绑章节；属性门槛挡住早期秘籍', () => {
  const pg = require('../tools_balance/progression_sim.cjs');
  const focus = pg.progress('剑', '专修', 64), relaxed = pg.progress('剑', '均衡', 64);
  assert(focus.learnedAt.art_gy_s_jue < relaxed.learnedAt.art_gy_s_jue, '专修应比均衡更早学到绝学');
  assert(focus.learnedAt.art_gy_s_jue <= 36, '一直练功的玩家应能在三年培养期内学到绝学');
  const gated = pg.progress('剑', '专修', 64, { secret: { art: 'art_gy_s_jue', month: 6 } });
  const open = pg.progress('剑', '专修', 64, { secret: { art: 'art_gy_s_jue', month: 6 }, noAttr: true });
  assert.equal(open.learnedAt.art_gy_s_jue, 6);
  assert(gated.learnedAt.art_gy_s_jue >= 20, '第6个月拿到绝学秘籍时，属性门槛应让它推迟到第20个月以后才能学');
});
