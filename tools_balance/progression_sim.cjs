#!/usr/bin/env node
/* 培养方式模拟：功法不与章节绑定，按游戏内月份推算“专修／均衡／游历支线”三种时间分配下，
 * 主角属性、功法重数、学会各门功法的月份；再把结果接入战斗模拟，并做“早期拿到绝学秘籍”的压力测试。
 * 规则：学习一门功法 = 前置重数 + 属性门槛（martial-systems.json 的 prerequisite、learn_req）；
 *       升重：n→n+1 需 min(6n², 20n) 熟练（2026-10-08 校准，原 6n²），且主属性 ≥ 3 + ⌊1.5(n−1)⌋（运行中的升重属性规则）。
 * 所有成长速率是本模拟的假设，见 PROFILES，结论只用于比较门槛设计，不代表已定的培养数值。
 * 用法：node tools_balance/progression_sim.cjs [--seeds 30] */
'use strict';
const fs = require('fs'), path = require('path');
const sim = require('./combat_sim.cjs');
const { D, STAGES } = sim;
const DOC = path.resolve(__dirname, '../docs/design/martial-review');
const SYS = JSON.parse(fs.readFileSync(path.join(DOC, 'martial-systems.json'), 'utf8'));
const ARTS = Object.fromEntries(SYS.systems.filter(a => a.kind === 'external_art').map(a => [a.id, a]));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') && a.push([x.slice(2), all[i + 1]]), a), []));
const ATTRS = ['str', 'con', 'agi', 'wil', 'wis'];
const NAME = { str: '臂力', con: '根骨', agi: '身法', wil: '定力', wis: '悟性' };

// 阶段锚点对应的游戏内月份（假设：三年培养期 1–36 月；下山后各锚点按下表月份假设；原二十章锚点已取消，时点待安排）
const STAGE_MONTH = { first_courses: 3, xiangyang: 5, year1_end: 12, year2_mid: 18, year2_end: 24, graduation: 36, travel_entry: 38, travel_mid: 44, chapter14: 50, chapter17: 56, chapter18: 60, finale: 64 };
// 时间分配（假设）：每月属性增长（主、副、根骨、定力、其他）与投入功法的熟练
const PROFILES = {
  专修: { desc: '几乎不闲逛，课余都在练功', main: .45, sub: .35, con: .30, wil: .25, other: .12, prof: 60, lump: 0 },
  均衡: { desc: '练功、生活、人物事件大致各占一份', main: .32, sub: .25, con: .22, wil: .18, other: .10, prof: 42, lump: 0 },
  游历: { desc: '多走支线与游历，练功较少；支线偶尔给属性', main: .20, sub: .16, con: .14, wil: .12, other: .08, prof: 28, lump: 1.5 },
};
// 主角两条路线的功法链
const CHAINS = {
  剑: ['system_gy_foundation_s', 'art_gy_s2', 'art_gy_s3', 'system_gy_s', 'art_gy_s_jue'],
  拳掌: ['system_gy_foundation_p', 'art_gy_p2', 'art_gy_p3', 'system_gy_p', 'art_gy_p_jue'],
};
const ROUTE = { 剑: ['agi', 'wis'], 拳掌: ['str', 'con'] };
let need = n => Math.min(6 * n * n, 20 * n);   // 2026-10-08 校准曲线（原 6n²）；setNeed() 可换成其他曲线做对照
function setNeed(fn) { need = fn; }
const upAttr = n => 3 + Math.floor(1.5 * (n - 1));

function canLearn(art, st, levels, opts = {}) {
  const p = art.prerequisite;
  if (p && !opts.skipPrereq) { const ok = (p.any_of || [p.art_id]).some(id => (levels[id] || 0) >= p.level); if (!ok) return false; }
  if (opts.noAttr) return true;
  return Object.entries(art.learn_req || {}).every(([k, v]) => st[k] >= v);
}

/* 逐月推进：先长属性，再把熟练投入“当前要练的功法”（最高的未到七重者），满足条件就学下一门。
 * opts.secret = { art, month }：在该月通过支线拿到秘籍（不需要前置重数，但仍要属性门槛，除非 noAttr） */
function progress(route, profileName, months = 64, opts = {}) {
  const P = PROFILES[profileName], [mainA, subA] = ROUTE[route], chain = CHAINS[route];
  const st = Object.fromEntries(ATTRS.map(a => [a, 4]));
  const levels = {}, prof = {}, learnedAt = {}, openedX = { month: null };
  levels[chain[0]] = 1; prof[chain[0]] = 0; learnedAt[chain[0]] = 1;
  const timeline = [];
  for (let m = 1; m <= months; m++) {
    for (const a of ATTRS) st[a] += a === mainA ? P.main : a === subA ? P.sub : a === 'con' ? P.con : a === 'wil' ? P.wil : P.other;
    if (P.lump && m % 12 === 0) for (const a of ATTRS) st[a] += P.lump;
    // 支线秘籍
    if (opts.secret && m >= opts.secret.month && !levels[opts.secret.art] && canLearn(ARTS[opts.secret.art], st, levels, { skipPrereq: true, noAttr: opts.noAttr })) { levels[opts.secret.art] = 1; prof[opts.secret.art] = 0; learnedAt[opts.secret.art] = m; }
    // 学下一门
    for (const id of chain) if (!levels[id] && canLearn(ARTS[id], st, levels)) { levels[id] = 1; prof[id] = 0; learnedAt[id] = m; }
    // 熟练投入：已学的最高一门；若它已到十重则投下一门
    const learned = chain.concat(opts.secret ? [opts.secret.art] : []).filter(id => levels[id]);
    const target = learned.slice().reverse().find(id => levels[id] < 10) || learned[learned.length - 1];
    prof[target] += P.prof;
    while (levels[target] < 10 && prof[target] >= need(levels[target]) && st[mainA] >= upAttr(levels[target] + 1)) { prof[target] -= need(levels[target]); levels[target]++; }
    const jue = opts.secret?.art || chain[4];
    if (levels[jue] >= 7 && openedX.month === null) openedX.month = m;
    timeline.push({ month: m, st: { ...st }, levels: { ...levels } });
  }
  return { learnedAt, openedX: openedX.month, timeline };
}

// 进度 → 战斗用的招式与重数
function overrideAt(route, profileName, month, opts) {
  const pr = progress(route, profileName, month, opts), last = pr.timeline[month - 1];
  const levels = {}, learned = {};
  for (const [artId, lv] of Object.entries(last.levels)) { const art = ARTS[artId]; for (const mv of art.moves) { if (!D.moves[mv.id]) continue; if (mv.unlock_level <= lv) { levels[mv.id] = lv; learned[mv.id] = lv; } } }
  const L = Object.values(last.levels).reduce((a, b) => Math.max(a, b), 1);
  return { learned, levels, main: route === '剑' || route === '拳掌' ? (last.levels[CHAINS[route][4]] ? 'xf_wanhe' : month >= 5 ? 'xf_guiyun' : 'xf_tuna') : null, sub: month >= 18 ? (route === '剑' ? 'xf_guanlan' : 'xf_hengliang') : null, layer: Math.min(5, 1 + Math.floor(month / 12)) };
}

function heroParty(partyName, si, route, profileName, opts) {
  const P = sim.buildParty(partyName, si), heroId = route === '剑' ? 'xiao_s' : 'xiao_p', idx = P.findIndex(u => u.id === heroId);
  if (idx < 0) return P;
  P[idx] = sim.buildMember(heroId, si, overrideAt(route, profileName, STAGE_MONTH[STAGES[si]], opts));
  return P;
}

function fightStats(partyName, route, profileName, si, encs, seeds, opts) {
  let rounds = 0, n = 0, win = 0;
  for (const enc of encs) for (let s = 0; s < seeds; s++) { const r = sim.runBattle(heroParty(partyName, si, route, profileName, opts), sim.buildFoes(enc, si), si * 7919 + s * 131 + enc.length); rounds += r.rounds; win += r.win; n++; }
  return { rounds: +(rounds / n).toFixed(2), win: +(win / n).toFixed(3) };
}

if (require.main === module) {
  const seeds = +(args.seeds || 30), out = { version: 'PROGRESSION-SIM-1', assumptions: { STAGE_MONTH, PROFILES }, timelines: {}, combat: [], secret: [] };
  // 1. 学会各门功法的月份
  for (const route of Object.keys(CHAINS)) for (const pf of Object.keys(PROFILES)) {
    const r = progress(route, pf, 64);
    out.timelines[`${route}·${pf}`] = { learnedAt: Object.fromEntries(Object.entries(r.learnedAt).map(([k, v]) => [ARTS[k].name, v])), openedX: r.openedX,
      attrAt36: Object.fromEntries(ATTRS.map(a => [NAME[a], +r.timeline[35].st[a].toFixed(1)])) };
  }
  // 2. 战斗：同一阶段，不同培养方式（破势爆发队，主角剑路；稳守游历队，主角拳掌路）
  const ENCS = ['普通·山道', '精英·刀堂', '头目·堂主'];
  for (const [party, route] of [['破势爆发', '剑'], ['稳守游历', '拳掌']]) for (const si of [2, 4, 5, 7, 9]) {
    const row = { party, route, stage: STAGES[si], month: STAGE_MONTH[STAGES[si]] };
    for (const pf of Object.keys(PROFILES)) row[pf] = fightStats(party, route, pf, si, ENCS, seeds);
    out.combat.push(row);
  }
  // 3. 压力测试：第 6 / 12 个月通过支线拿到绝学秘籍（不需前置重数）
  for (const month of [6, 12]) for (const pf of Object.keys(PROFILES)) for (const noAttr of [false, true]) {
    const r = progress('剑', pf, 64, { secret: { art: 'art_gy_s_jue', month }, noAttr });
    const learned = r.learnedAt.art_gy_s_jue || null, si = 2; // 第 12 月（年一末）的战斗
    const f = fightStats('破势爆发', '剑', pf, si, ENCS, seeds, { secret: { art: 'art_gy_s_jue', month }, noAttr });
    out.secret.push({ secretMonth: month, profile: pf, attrGate: !noAttr, learnedMonth: learned, xOpenMonth: r.openedX, year1EndFight: f });
  }
  fs.writeFileSync(path.join(DOC, 'balance/sim/progression.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out.timelines, null, 0).slice(0, 4000));
  console.log(JSON.stringify(out.combat));
  console.log(JSON.stringify(out.secret));
}
module.exports = { progress, PROFILES, STAGE_MONTH, CHAINS, setNeed };
