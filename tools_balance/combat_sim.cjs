#!/usr/bin/env node
/* 离线数值战斗模拟器 v1：八方式弱点／护盾／破势 + BP + 内功主动被动。
 * 数据：catalog.json（64 招、18 内功）、lineage-v3-moves.json（23 新招）、martial-systems.json（功法开启）、
 *       balance/budget.json（阶段锚点）、balance/sim/roster.json（人物与队伍）、balance/sim/enemies.json（敌人弱点卡）。
 * 用法：node tools_balance/combat_sim.cjs [--seeds 120] [--break 1.5] [--out docs/design/martial-review/balance/sim]
 * 只做设计校准，不代表运行中的战斗代码；未结算的效果在报告里逐项列出。 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), DOC = path.join(ROOT, 'docs/design/martial-review');
const J = f => JSON.parse(fs.readFileSync(path.join(DOC, f), 'utf8'));

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') && a.push([x.slice(2), all[i + 1]]), a), []));
const CFG = { seeds: +(args.seeds || 120), weak: +(args.weak || 1.1), brk: +(args.break || 1.5), crit: 1.25, critRate: .05, K: 60,
  hitRate: .95, maxRounds: 30, jueAt: args.jueAt !== undefined ? +args.jueAt : null, pressure: +(args.pressure || 1), mpWeight: 14, noEnrage: !!args.noEnrage, noGear: !!args.noGear, noWeaponStats: !!args.noWeaponStats, enrage: +(args.enrage || .2), charge: +(args.charge || 1), foeHp: +(args.foeHp || 1), foeAtk: +(args.foeAtk || 1), out: args.out || path.join(DOC, 'balance/sim'), label: args.label || 'baseline' };

// ---------- 数据装载 ----------
function loadData() {
  const cat = J('catalog.json'), lin = J('lineage-v3-moves.json'), sys = J('martial-systems.json'), budget = J('balance/budget.json');
  const roster = J('balance/sim/roster.json'), enemies = J('balance/sim/enemies.json');
  const moves = {};
  for (const s of [...cat.skills, ...lin.moves]) moves[s.id] = { id: s.id, name: s.name, grade: s.grade, weapon: s.weapon, wclass: s.weak_class || null, element: s.element || null, profile: s.profile, usage: s.usage || 'active', cleanseTier: s.cleanse_tier || null, target: s.target_mode, boost: s.boost_mode, c: s.combat };
  const artOf = {};
  for (const a of sys.systems) if (a.kind === 'external_art') for (const m of a.moves) artOf[m.id] = { id: a.id, unlock: m.unlock_level, ids: a.moves.map(x => x.id) };
  const hearts = Object.fromEntries([...cat.hearts, ...(lin.hearts || [])].map(h => [h.id, h]));
  const equip = Object.fromEntries(cat.equipment.map(e => [e.id, e]));
  return { moves, artOf, hearts, equip, anchors: budget.anchors, roster, enemies };
}
const D = loadData();
const STAGES = D.anchors.map(a => a.id);
const PHASE_IDX = { Y1: 0, 'Y1+': 1, Y2: 3, TRAVEL: 6, 'TRAVEL+': 8, LATE: 9 };
const JUE = new Set(Object.values(J('martial-systems.json').systems).filter(a => a.kind === 'external_art' && a.grade === '绝').flatMap(a => a.moves.map(m => m.id)));
const GR = ['丁', '丙', '乙', '甲', '绝'];

// ---------- 随机数 ----------
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- 统计：未结算效果 ----------
const UNSETTLED = new Map();
const unsettled = (type, by) => { const k = type; if (!UNSETTLED.has(k)) UNSETTLED.set(k, new Set()); UNSETTLED.get(k).add(by); };

// ---------- 建队 ----------
function buildMember(mid, si, override) {
  const R = D.roster, m = R.members[mid], role = R.roles[m.role], A = D.anchors[si];
  const learned = override?.learned ? { ...override.learned } : {};
  if (!override?.learned) for (const [id, ph] of m.moves) { const li = CFG.jueAt !== null && JUE.has(id) ? CFG.jueAt : PHASE_IDX[ph]; if (li <= si && D.moves[id]) learned[id] = Math.max(1, Math.min(10, 1 + 2 * (si - li))); }
  if (!override?.learned && learned.gy_s1 && si === 0) learned.gy_s1 = Math.min(3, learned.gy_s1);
  if (learned.gy_p1 && si === 0) learned.gy_p1 = Math.min(3, learned.gy_p1);
  // 功法重数共享与开启
  const usable = {};
  if (override?.levels) { Object.assign(usable, override.levels); }
  const arts = {};
  for (const id of Object.keys(learned)) { const a = D.artOf[id]; if (a) arts[a.id] = Math.max(arts[a.id] || 0, learned[id]); }
  if (!override?.levels) for (const [id, lv] of Object.entries(learned)) { const a = D.artOf[id]; if (!a) { usable[id] = lv; continue; } const al = arts[a.id]; if (a.unlock <= al) usable[id] = al; }
  // 装配：高品阶优先，保留至少一招低耗
  const cap = R.slot_cap[si];
  const sorted = Object.keys(usable).sort((x, y) => GR.indexOf(D.moves[y].grade) - GR.indexOf(D.moves[x].grade) || D.moves[y].c.total_power - D.moves[x].c.total_power);
  let load = sorted.slice(0, cap);
  const cheap = sorted.filter(id => D.moves[id].c.mp <= 4);
  if (cheap.length && !load.some(id => D.moves[id].c.mp <= 4)) load[load.length - 1] = cheap[0];
  // 内功
  const pick = slot => m.hearts.filter(([, ph, s]) => s === slot && PHASE_IDX[ph] <= si).pop();
  const main = override?.main ? [override.main, 'Y1', 'main'] : pick('main'), sub = override?.sub !== undefined ? (override.sub ? [override.sub, 'Y1', 'sub'] : null) : si >= 3 ? pick('sub') : null;
  const hearts = [main, sub].filter(Boolean).map(([id, ph, slot]) => ({ id, slot, layer: override?.layer || Math.max(1, Math.min(5, 1 + (si - PHASE_IDX[ph]))), h: D.hearts[id] }));
  const P = {};
  for (const h of hearts) {
    const n = h.h.passive_skill.numbers || {}, L = h.layer;
    for (const [k, v] of Object.entries(n.per || {})) P[k] = (P[k] || 0) + v * L;
    for (const t of ['t3', 't5']) if (L >= (t === 't3' ? 3 : 5)) for (const [k, v] of Object.entries(n[t] || {})) P[k] = typeof v === 'number' && ['unload_mp', 'support_mp', 'staff_low_mp'].includes(k) ? Math.min(P[k] || 0, v) : Math.max(P[k] || 0, v);
    for (const k of ['guard_on_defend', 'guard_bonus', 'guard_cap', 'guard_choice_reduction', 'intercept_bonus', 'unhurt_bonus', 'self_steady_mp']) if (n[k] !== undefined) P[k] = Array.isArray(n[k]) ? n[k][L - 1] : n[k];
  }
  // 装备：同槽后得者替换先得者；只结算 skill_mods
  const gearBySlot = {};
  if (!CFG.noGear) for (const [eid, ph] of (m.gear || [])) { const e = D.equip[eid]; if (e && PHASE_IDX[ph] <= si) gearBySlot[e.slot] = e; }
  const G = { element: {}, resist: {}, chance: {}, durMinus: {} };
  for (const e of Object.values(gearBySlot)) { const sm = e.skill_mods || {};
    for (const [k, v] of Object.entries(sm.element_bonus || {})) G.element[k] = (G.element[k] || 0) + v;
    for (const [k, v] of Object.entries(sm.status_resist || {})) G.resist[k] = (G.resist[k] || 0) + v;
    for (const [k, v] of Object.entries(sm.status_chance || {})) G.chance[k] = (G.chance[k] || 0) + v;
    for (const [k, v] of Object.entries(sm.status_duration_minus || {})) G.durMinus[k] = Math.max(G.durMinus[k] || 0, v); }
  // 武器数值 v1（docs/design/martial-review/weapon-stats.md）：攻击按“实际武器攻击 − 当阶段应有武器攻击（阶段参考攻击 ×0.3）”修正，
  // 不打乱已校准的敌人曲线；暴击、防御、异常率、治疗直接加；机制只结算能直接算的（命中、治疗、普攻/弱点/看破/暴露增伤），其余见报告。
  const W = gearBySlot.weapon, WS = (!CFG.noWeaponStats && W && W.stats) || null, WM = (W && W.mech) || {};
  if (WS) for (const [k, v] of Object.entries(WS.status || {})) G.chance[k] = (G.chance[k] || 0) + v;
  // 护具与佩饰数值 v1（armor-acc-stats.md）：护具防御按“实际 − 当阶段应有（中装梯度）”修正；佩饰战斗词条直接计入，功能词条不进模拟
  const AR = !CFG.noWeaponStats && gearBySlot.armor && gearBySlot.armor.stats || null, AC = {};
  if (!CFG.noWeaponStats && gearBySlot.acc) for (const a of gearBySlot.acc.affix || []) AC[a.k] = a.v;
  if (AC.resist_all) for (const k of ['中毒', '流血', '内伤', '封穴', '眩晕', '目眩', '心乱', '惊惧', '迟滞']) G.resist[k] = (G.resist[k] || 0) + AC.resist_all;
  const mainNature = main ? D.hearts[main[0]].nature : '中';
  const u = { id: mid, name: m.name, side: 'ally', role: m.role, weapon: m.weapon, nature: mainNature,
    mhp: Math.round(A.hp * role.hp * (1 + (P.mhp_pct || 0)) + (AR && AR.mhp || 0) + (AC.mhp || 0)), mmp: Math.round(A.mp * (1 + (P.mmp_pct || 0)) + (AR && AR.mmp || 0) + (AC.mmp || 0)),
    atk: Math.max(1, A.attack * role.atk + (WS ? WS.atk - W_EXPECT[si] : 0)), def: A.defense * role.def * (1 + (P.def_pct || 0)) + (WS && WS.def || 0) + (AR ? AR.def - A_EXPECT[si] : 0) + (AC.def || 0), spd: role.spd + (P.speed || 0), wis: 6 + Math.floor(si / 2) + role.wis,
    critRate: Math.min(.35, CFG.critRate + (P.crit_pct || 0) / 100 + (WS && WS.crit || 0) / 100 + (AC.crit || 0) / 100), healW: (WS && WS.heal || 0) / 100 + (WM.type === 'heal' ? WM.value : 0) + (AR && AR.heal || 0) / 100 + (AC.heal || 0), WM, AC, P, G, gear: Object.values(gearBySlot).map(e => e.id), levels: usable, load, hearts };
  u.hp = u.mhp; u.mp = u.mmp;
  return u;
}
// 各阶段“应有武器攻击”＝按常规换装节奏，该阶段剑类梯度应有的武器（第一年丁→丙，第二年至出师乙，游历起甲）；绝级的 +3 是身份武器的额外收益，不计入基准
const W_EXPECT = [8, 8, 12, 17, 17, 17, 23, 23, 23, 23, 23, 23];
// 各阶段“应有护具防御”＝中装梯度（丁4 丙7 乙10 甲14），按同一换装节奏
const A_EXPECT = [4, 4, 7, 10, 10, 10, 14, 14, 14, 14, 14, 14];
function buildParty(name, si) {
  const R = D.roster, size = D.anchors[si].party_reference, ph = R.stage_phase[STAGES[si]];
  const ids = R.parties[name].map(id => { const m = R.members[id]; if (m.from && si < PHASE_IDX[m.from] && R.early_substitutes[id]) return R.early_substitutes[id]; return (PHASE_IDX[ph] < 3 && R.early_substitutes[id]) ? R.early_substitutes[id] : id; }).slice(0, size);
  return ids.map(id => buildMember(id, si));
}
const CURVE_FILE = path.join(DOC, 'balance/sim/' + (args.curve || 'enemy-curve.json'));
let CURVE = fs.existsSync(CURVE_FILE) && !args.nocurve ? JSON.parse(fs.readFileSync(CURVE_FILE, 'utf8')).curve : null;
function buildFoes(enc, si) {
  const E = D.enemies, A = D.anchors[si], band = E.shield_band[D.roster.stage_phase[STAGES[si]]], kind = E.kind_of[enc];
  const cv = CURVE?.[STAGES[si]]?.[kind] || { hp: 1, atk: 1 };
  return E.encounters[enc].map((k, i) => { const t = E.archetypes[k], mhp = Math.round(A.hp * t.hp * CFG.foeHp * cv.hp * (A.party_reference / 4));
    return { inflict: t.inflict || [], id: k + i, name: k, side: 'foe', rank: t.rank, mhp, hp: mhp, atk: A.attack * t.atk * CFG.foeAtk * cv.atk, def: A.enemy_defense, spd: t.spd, maxShield: t.shield + band, shield: t.shield + band, weak: t.weak.slice(), known: new Set(), acts: t.acts.map(a => a[0] === 'bleed' ? ['single', a[1], a[2]] : a), phase2: t.phase2 || null }; });
}

// ---------- 结算基础 ----------
const defMul = d => CFG.K / (CFG.K + Math.max(0, d));
const alive = arr => arr.filter(x => x.hp > 0);
function healBase(u) { return 12 + 4 * u.wis + .1 * u.mmp; }
const WCLASS = { 剑: '剑', 刀: '刀', 锤: '刀', 棍: '长兵', 伞: '长兵', 琴: '音律', 笛: '音律', 琵琶: '音律', 箫: '音律', 扇: '暗器', 暗器: '暗器', 拳: '拳掌', 医具: '拳掌' };
// 弱点类型 v2：兵器类（6）+ 招式属性（6），对齐八方旅人
function hitKinds(u, mv) { const k = []; if (mv.basic) k.push(WCLASS[u.weapon] || '拳掌'); else { if (mv.wclass) k.push(mv.wclass); if (mv.element) k.push(mv.element); } return k; }
function reduction(t) { let r = 0; if (t.guarding) r += 1 - t.guarding; if (t.ding) r += t.ding.red; if (t.unload) r += t.unload; if (t.afterAtk) r += t.afterAtk; if (t.regenRed && t.regen) r += t.regenRed; return Math.min(.6, r); }

// ---------- 战斗状态 ----------
function newBattle(party, foes, seed, carry) {
  const S = { kinds: new Set(party.flatMap(u => [WCLASS[u.weapon] || '拳掌', ...u.load.flatMap(id => [D.moves[id].wclass, D.moves[id].element].filter(Boolean))])), party, foes, round: 0, r: rng(seed), log: { statusApplied: {}, cleansed: 0, dotDmg: 0, dmgBySkill: {}, useBySkill: {}, breaks: 0, firstBreak: null, healDone: 0, prevented: 0, bpSpent: 0, ultimates: 0, deaths: 0, reveals: 0, innerUses: {} } };
  for (const u of party) { if (!carry) { u.hp = u.hp ?? u.mhp; } Object.assign(u, { st: {}, imm: {}, bp: Math.min(5, 1 + ((u.AC || {}).start_bp || 0)), bpSpentRound: -1, cd: {}, innerCd: 0, tokens: 0, nextAtk: 0, focus: 0, ding: null, exposure: 0, expLeft: 0, unload: 0, guarding: 0, intercept: null, counter: 0, regen: null, bleed: null, stun: false, slow: false, orderUp: 0, unhurt: false, unhurtReady: false, interceptBonusReady: false, deathGuard: false, dmgBuff: null, supportHalf: false, firstBreakBpUsed: false, firstRevealUsed: false });
    if (u.P.battle_start_reveal) for (let i = 0; i < u.P.battle_start_reveal; i++) { const f = alive(foes)[Math.floor(S.r() * alive(foes).length)]; reveal(S, f, 1, u); } }
  for (const f of foes) Object.assign(f, { st: {}, imm: {}, broken: false, brokenUntil: -1, charge: null, weakened: 0, exposure: 0, slowed: false, delayed: false, markDmg: 0, markShield: 0, phase2Pending: false, phase2Done: false, recovered: false, actsPerRound: 1 });
  return S;
}
function reveal(S, f, n, by) { const hid = f.weak.filter(w => !f.known.has(w)); let k = 0; for (let i = 0; i < n && hid.length; i++) { f.known.add(hid.splice(Math.floor(S.r() * hid.length), 1)[0]); k++; }
  if (k && by) { S.log.reveals += k; if (by.P.reveal_mp) by.mp = Math.min(by.mmp, by.mp + by.P.reveal_mp); if (by.P.first_reveal_mp && !by.firstRevealUsed) { by.firstRevealUsed = true; by.mp = Math.min(by.mmp, by.mp + by.P.first_reveal_mp); } } return k; }

// 我方对敌一次出手（多段），返回造成的伤害
function strikeFoe(S, u, mv, band, f, ctx) {
  if (f.hp <= 0) return 0;
  const kinds = hitKinds(u, mv), weakKinds = kinds.filter(k => f.weak.includes(k));
  const hits = band.hits || 0; if (!hits) return 0;
  let total = 0, used = 0;
  const M = 1 + .04 * ((u.levels[mv.id] || 1) - 1);
  let pool = ctx.bonus || 0;
  if (f.known.size && u.P.revealed_damage) pool += u.P.revealed_damage;
  if (u.expLeft > 0 && u.P.exposed_damage) pool += Math.min(u.P.exposed_damage, u.P.exposed_damage_cap || 1);
  if (u.nextAtk) { pool += u.nextAtk; }
  if (u.focus) pool += u.focus;
  if (f.markDmg) { pool += f.markDmg; f.markDmg = 0; }
  if (u.dmgBuff) pool += u.dmgBuff.v;
  const wm = u.WM || {};
  if (wm.type === 'basic_atk' && mv.basic) pool += wm.value;
  if (wm.type === 'exposed_atk' && u.expLeft > 0 && mv.weapon === '刀') pool += wm.value;
  if (wm.type === 'revealed_first_hit' && f.known.size && u.wRevRound !== S.round) { pool += wm.value; u.wRevRound = S.round; }
  if (wm.type === 'revealed_break_atk' && f.known.size && f.shield > 0) pool += wm.value;
  if (wm.type === 'weak_hit' && mv.wclass === '拳掌' && weakKinds.length) pool += wm.value;
  if (wm.type === 'first_strike_atk' && !u.wFirstDone) { pool += wm.value; u.wFirstDone = true; }
  const ac = u.AC || {};
  if (ac.weak_dmg && weakKinds.length) pool += ac.weak_dmg;
  if (ac.break_dmg && f.broken) pool += ac.break_dmg;
  if (ac.elite_dmg && (f.rank === 'elite' || f.rank === 'boss')) pool += ac.elite_dmg;
  if (u.G && mv.element && u.G.element[mv.element]) pool += u.G.element[mv.element];
  if (u.unhurtReady && mv.weapon === '剑' && band.hits >= 1 && (mv.target === 'specified')) { pool += u.P.unhurt_bonus || 0; u.unhurtReady = false; }
  if (u.interceptBonusReady && mv.weapon === '拳') { pool += u.P.intercept_bonus || 0; u.interceptBonusReady = false; }
  // 攻击招式扩充 v1（attack-expansion-v1.md §5）：按目标判定的条件增伤、按层数与按气血的增伤，全部并入 30% 加法池
  let sure = false, sureCrit = false;
  for (const e of band.effects) {
    if (e.type === 'conditional_damage' && EXP_COND[e.condition] && EXP_COND[e.condition](f, u)) pool += e.value;
    else if (e.type === 'self_low_hp_bonus') pool += Math.min(.3, e.value * Math.max(0, 1 - u.hp / u.mhp));
    else if (e.type === 'bonus_per_status_stack') pool += Math.min(.3, e.value * String(e.condition || '').split('|').reduce((n, k) => n + stacks(f, k), 0));
    else if (e.type === 'sure_hit') sure = true;
    else if (e.type === 'sure_crit' && (!e.condition || (EXP_COND[e.condition] && EXP_COND[e.condition](f, u)))) sureCrit = true;
  }
  const atk = u.atk * (u.ding ? 1 + u.ding.atk : 1) * (u.expBuff ? 1 + u.expBuff : 1);
  for (let i = 0; i < hits; i++) {
    if (f.hp <= 0) break;
    if (!sure && S.r() > (GR.indexOf(mv.grade) === 0 ? 1 : CFG.hitRate) - (has(u, '目眩') ? (wm.type === 'blind_miss_half' && mv.wclass === '暗器' ? .125 : .25) : 0) && (!mv.basic || has(u, '目眩'))) continue;
    ctx.landed = (ctx.landed || 0) + 1;
    const brokenBefore = f.broken;
    let cond = 0;
    for (const e of band.effects) {
      if (e.type === 'last_hit_bonus' && i === hits - 1) {
        const c = e.condition; if ((c === 'target_broken_before_hit' && brokenBefore) || (c === 'actual_intercept_damage_this_round' && u.interceptedRound === S.round) || (c === 'target_has_attack_reduction' && f.weakened) || (c === 'consume_one_guard_token' && ctx.tokenUsed)) cond += e.value; }
      if (e.type === 'last_hit_bonus_per_revealed_type' && i === hits - 1) cond += e.value * Math.min(5, f.known.size);
    }
    const isWeak = weakKinds.length > 0;
    let dmg = atk * band.total_power / hits * M * (1 + Math.min(.3, pool + cond)) * (isWeak ? CFG.weak : 1) * (brokenBefore ? CFG.brk : 1) * (sureCrit || S.r() < Math.min(.35, u.critRate + (wm.type === 'crit_single' && mv.target === 'specified' ? wm.value / 100 : 0)) ? CFG.crit : 1) * (wm.type === 'multihit_later' && i > 0 && mv.wclass === '暗器' ? 1 + wm.value : 1) * (.95 + S.r() * .1) * defMul(f.def) * (1 + (f.exposure || 0));
    dmg = Math.max(1, Math.round(dmg)); f.hp -= dmg; total += dmg;
    if (isWeak) for (const w of weakKinds) f.known.add(w);
    if (isWeak && !f.broken && f.shield > 0 && used < band.shield_cap) {
      let loss = 1;
      if (i === 0) for (const e of band.effects) if (e.type === 'extra_shield_damage') { const c = e.condition;
        if (c === 'on_matching_weakness_once' || (c === 'matching_weakness_and_charging_once' && f.charge) || (c === 'matching_weakness_and_revealed_target_once' && f.known.size) || (c === 'target_slowed_once' && f.slowed) || ((c === 'consume_one_self_guard_token' || c === 'consume_one_guard_token') && ctx.tokenUsed)) loss += e.value; }
      if (i === 0 && f.markShield) { loss += f.markShield; f.markShield = 0; }
      loss = Math.min(loss, f.shield, band.shield_cap - used, 6 - used); f.shield -= loss; used += loss;
      if (f.shield === 0) breakFoe(S, f, u);
    }
    if (f.exposure) f.exposure = 0;
  }
  if (f.hp <= 0) { f.hp = 0; f.charge = null; }
  return total;
}
const EXP_COND = {
  target_hp_below_50: f => f.hp < f.mhp * .5, target_hp_below_35: f => f.hp < f.mhp * .35, target_hp_below_30: f => f.hp < f.mhp * .3, target_hp_above_90: f => f.hp >= f.mhp * .9,
  target_controlled: f => !!f.slowed || ['封穴', '眩晕', '心乱', '惊惧'].some(k => has(f, k)), target_slowed: f => !!f.slowed, target_blinded: f => has(f, '目眩'),
  target_bleeding: f => has(f, '流血'), target_poisoned: f => has(f, '中毒'), target_charging: f => !!f.charge };
function breakFoe(S, f, by) { f.broken = true; f.brokenUntil = S.round + 1; f.charge = null; S.log.breaks++; if (S.log.firstBreak === null) S.log.firstBreak = S.round;
  if (by && by.P.first_break_bp && !by.firstBreakBpUsed) { by.firstBreakBpUsed = true; by.bp = Math.min(5, by.bp + 1); } }

function healUnit(S, u, t, coef, mult = 1) {
  if (!t || t.hp <= 0) return 0; const amt = Math.min(t.mhp - t.hp, t.mhp * .35, Math.round(healBase(u) * coef * mult * (1 + Math.min(.3, (u.P.heal_bonus || 0) + (u.healW || 0)))));
  const real = has(t, '中毒') ? Math.round(amt * .8) : amt; t.hp += real; S.log.healDone += real; if (u.P.heal_cleanse) cleanseUnit(S, t, 'mid', 1); return real;
}

// ---------- 异常状态 v1（docs/design/status-effects.md） ----------
const DOT = { 中毒: [.02, .005, 5], 流血: [.03, .01, 3], 内伤: [0, 0, 3] };
const HARD = new Set(['眩晕', '封穴', '心乱']), LOW = ['中毒', '流血', '目眩', '迟滞'];
const RESIST = { normal: 0, elite: .15, boss: .3 };
function applyStatus(S, src, t, status, chance, stacks = 1) {
  if (!t || t.hp <= 0) return false;
  const boss = t.rank === 'boss', broken = !!t.broken;
  if (status === '眩晕' && boss) return false;
  if (status === '封穴' && boss && !broken) return false;
  if (HARD.has(status) && (t.imm[status] || 0) > S.round) return false;
  if (t.stImmune && t.stImmune > S.round && (status === '封穴' || status === '心乱')) return false;
  const bonus = src && src.side === 'ally' ? (src.P.status_chance || 0) + (src.statusFocus || 0) + (src.G?.chance[status] || 0) : 0;
  const resist = t.side === 'ally' ? Math.min(.6, (t.P?.status_resist || 0) + (t.G?.resist[status] || 0)) : (RESIST[t.rank] || 0);
  const p = broken ? 1 : Math.max(.05, Math.min(1, chance + bonus - resist));
  if (src && src.statusFocus) src.statusFocus = 0;
  if (S.r() > p) return false;
  if (t.stGuard) { t.stGuard = false; return false; }
  if (src && src.side === 'ally') { if (src.P.status_mp) src.mp = Math.min(src.mmp, src.mp + src.P.status_mp); if (src.P.first_control_bp && !src.firstControlBp && (status === '封穴' || status === '心乱')) { src.firstControlBp = true; src.bp = Math.min(5, src.bp + 1); } }
  if (status === '迟滞') { t.slowed = true; t.slow = true; }
  else if (DOT[status]) { const cur = t.st[status]?.n || 0; t.st[status] = { n: Math.min(DOT[status][2], cur + stacks + (broken ? 1 : 0)), fresh: 1 }; }
  else { const dur = Math.max(1, { 封穴: 2, 眩晕: 1, 目眩: 3, 心乱: 2, 惊惧: boss ? 1 : 2 }[status] + (broken ? 1 : 0) - (t.side === 'ally' ? (t.G?.durMinus[status] || 0) : 0)); t.st[status] = { left: Math.max(t.st[status]?.left || 0, dur) };
    if (status === '惊惧' && t.side === 'foe') t.charge = null; }
  if (HARD.has(status) && t.rank && t.rank !== 'normal') t.imm[status] = S.round + 2 + (t.st[status]?.left || 0);
  S.log.statusApplied[status] = (S.log.statusApplied[status] || 0) + 1;
  if (t.side === 'ally') S.log.allyStatus = (S.log.allyStatus || 0) + 1;
  return true;
}
function has(u, st) { const x = u.st?.[st]; return !!x && ((x.n || 0) > 0 || (x.left || 0) > 0); }
function stacks(u, st) { return u.st?.[st]?.n || 0; }
// 行动结束：持续伤害与时长递减
function statusAfterAction(S, u) {
  for (const k of ['中毒', '流血']) { const n = stacks(u, k); if (!n) continue; const pct = u.rank === 'boss' ? DOT[k][1] : DOT[k][0]; const d = Math.max(1, Math.round(u.mhp * pct * n)); u.hp -= d; S.log.dotDmg += u.side === 'foe' ? d : 0;
    if (u.hp <= 0) { if (u.deathGuard) { u.hp = 1; u.deathGuard = false; } else { u.hp = 0; if (u.side === 'ally') S.log.deaths++; } } }
  for (const k of ['封穴', '目眩', '心乱', '惊惧', '眩晕']) { const x = u.st[k]; if (x && x.left > 0 && --x.left <= 0) delete u.st[k]; }
}
function statusRoundStart(u) { for (const k of ['中毒', '流血', '内伤']) { const x = u.st[k]; if (!x) continue; if (x.fresh) { x.fresh = 0; continue; } if (--x.n <= 0) delete u.st[k]; } }
function cleanseUnit(S, a, tier, count = 1) {
  if (!a) return 0; let n = 0;
  const order = tier === 'low' ? LOW : ['封穴', '内伤', '心乱', '中毒', '流血', '惊惧', '目眩', '迟滞'];
  for (const k of order) { if (n >= (tier === 'all' ? 99 : count)) break; if (k === '迟滞' ? a.slow : has(a, k)) { if (k === '迟滞') a.slow = false; else delete a.st[k]; n++; } }
  S.log.cleansed += n; return n;
}
function statusValue(u, sign) {
  let v = 0; const w = u.rank === 'boss' ? .6 : 1;
  v += stacks(u, '中毒') * 2.5 * w + stacks(u, '流血') * 3 * w + stacks(u, '内伤') * 3.5;
  if (has(u, '封穴')) v += u.side === 'foe' ? 9 : 12; if (has(u, '眩晕')) v += 12; if (has(u, '目眩')) v += 5; if (has(u, '心乱')) v += 6; if (has(u, '惊惧')) v += u.side === 'foe' ? 6 : 5;
  return sign * v;
}

// ---------- 招式与内功执行 ----------
function pickAlly(S, u, how) {
  const al = alive(S.party).filter(x => how === 'other' ? x !== u : true);
  if (!al.length) return null;
  return al.sort((a, b) => a.hp / a.mhp - b.hp / b.mhp)[0];
}
function worstAilment(S, u) { return alive(S.party).map(a => [a, -statusValue(a, 1) - (a.slow ? 2 : 0)]).sort((x, y) => x[1] - y[1])[0][0]; }
function moveCost(u, mv, f) {
  let mp = mv.c.mp; if (!mp) return 0;
  const support = ['G', 'H'].includes(mv.profile);
  if (u.P.unload_mp && mv.c.effects.some(e => e.type === 'unload')) mp += u.P.unload_mp;
  if (u.P.support_mp && support) mp += u.P.support_mp;
  if (u.P.staff_low_mp && mv.weapon === '棍' && ['丁', '丙'].includes(mv.grade)) mp += u.P.staff_low_mp;
  if (mv.c.effects.some(e => e.type === 'mp_discount') && f && f.known.size) mp -= 1;
  if (u.supportHalf && support) mp = Math.ceil(mp / 2);
  if ((u.levels[mv.id] || 1) >= 10 && mv.mastery) mp += mv.mastery.mp || 0;
  if (stacks(u, '内伤')) mp = Math.ceil(mp * (1 + .15 * stacks(u, '内伤')));
  return Math.max(1, mp);
}
function execMove(S, u, mv, bp, tgt) {
  const band = mv.c.bp[bp]; S.log.useBySkill[mv.id] = (S.log.useBySkill[mv.id] || 0) + 1;
  const cost = mv.basic ? 0 : moveCost(u, mv, tgt); u.mp -= cost; if (u.supportHalf && ['G', 'H'].includes(mv.profile)) u.supportHalf = false;
  if (bp) { u.bp -= bp; u.bpSpentRound = S.round; S.log.bpSpent += bp; }
  if (mv.profile === 'X') S.log.ultimates++;
  const ctx = { bonus: 0, tokenUsed: false };
  for (const e of band.effects) {
    if (e.type === 'conditional_damage') { const c = e.condition;
      if ((c === 'previous_self_guard' && u.guardedLast) || (c === 'target_has_revealed_weakness' && tgt && tgt.known.size) || (c === 'target_broken' && tgt && tgt.broken) || (c === 'self_has_exposure' && u.expLeft > 0) || (c === 'ally_used_guard_this_round' && S.guardRound === S.round) || (c === 'target_has_attack_reduction' && tgt && tgt.weakened)) ctx.bonus += e.value;
      else if (c === 'consume_one_self_guard_token' && u.tokens > 0) { u.tokens--; ctx.tokenUsed = true; ctx.bonus += e.value; } }
    if ((e.type === 'last_hit_bonus' || e.type === 'extra_shield_damage') && /guard_token/.test(e.condition) && u.tokens > 0 && !ctx.tokenUsed) { u.tokens--; ctx.tokenUsed = true; }
  }
  if (u.tokens > 0 && !ctx.tokenUsed && u.P.guard_bonus && mv.c.total_power > 0) { u.tokens--; ctx.tokenUsed = true; ctx.bonus += u.P.guard_bonus; }
  let dealt = 0;
  const targets = mv.target === 'all_foes' ? alive(S.foes) : mv.c.total_power > 0 ? [tgt] : [];
  for (const f of targets) { ctx.landed = 0; dealt += strikeFoe(S, u, mv, band, f, ctx);
    for (const e of band.effects) if (e.type === 'apply_status' && ctx.landed) { const tries = e.per_hit ? ctx.landed : 1; for (let i = 0; i < tries; i++) applyStatus(S, u, f, e.status, e.chance - (has(u, '惊惧') ? 0 : 0), e.stacks); }
    if (f.st && has(f, '心乱') && ctx.landed) delete f.st['心乱']; }
  if (mv.c.total_power > 0) { u.nextAtk = 0; u.focus = 0; if (u.P.after_attack_reduction) u.afterAtk = u.P.after_attack_reduction; }
  S.log.dmgBySkill[mv.id] = (S.log.dmgBySkill[mv.id] || 0) + dealt;
  // 非伤害效果
  for (const e of band.effects) {
    const t = e.type, c = e.condition || '';
    if (['conditional_damage', 'last_hit_bonus', 'last_hit_bonus_per_revealed_type', 'extra_shield_damage', 'mp_discount'].includes(t)) continue;
    if (t === 'reveal') { if (tgt) reveal(S, tgt, e.value, u); continue; }
    if (t === 'unload' || t === 'physical_unload') { const v = e.value || .25;
      const who = /each_ally|each_alive_ally/.test(c) ? alive(S.party) : /two_selected|each_selected/.test(c) ? alive(S.party).filter(x => x !== u).sort((a, b) => a.hp / a.mhp - b.hp / b.mhp).slice(0, 2) : /self/.test(c) || c === 'next_received_hit' ? [u] : [pickAlly(S, u, /another/.test(c) ? 'other' : 'any')];
      for (const w of who) if (w) w.unload = Math.max(w.unload, v); S.guardRound = S.round; continue; }
    if (t === 'intercept') { const red = e.damage_reduction || .25; const who = /two_selected/.test(c) ? alive(S.party).filter(x => x !== u).sort((a, b) => a.hp / a.mhp - b.hp / b.mhp).slice(0, 2) : [pickAlly(S, u, 'other')];
      for (const w of who) if (w) w.intercept = { by: u, red }; S.guardRound = S.round; continue; }
    if (t === 'counter_power') { u.counter = e.value; continue; }
    if (t === 'guard_token') { u.tokens = Math.min(u.P.guard_cap || 1, u.tokens + e.value); continue; }
    if (t === 'next_attack_bonus') { u.nextAtk = e.value; continue; }
    if (t === 'heal_coefficient') { const mult = band.heal_multiplier || 1; if (/all_alive_allies/.test(c)) for (const a of alive(S.party)) healUnit(S, u, a, e.value, mult); else healUnit(S, u, pickAlly(S, u, 'any'), e.value, mult); continue; }
    if (t === 'regen_coefficient_per_tick') { const a = pickAlly(S, u, 'any'); if (a) a.regen = { amt: healBase(u) * e.value * (1 + (u.P.regen_bonus || 0)), left: band.duration_recipient_actions || 2, src: u }; continue; }
    if (t === 'cleanse_exposure') { u.expLeft = 0; continue; }
    if (t.startsWith('cleanse') || t === 'slow_immunity') { const tier = mv.cleanseTier || (t === 'cleanse_bleed' || t === 'cleanse_slow' ? 'low' : 'mid');
      const who = /each_alive_ally/.test(c) ? alive(S.party) : t === 'cleanse_slow' && /each/.test(c) ? alive(S.party) : [worstAilment(S, u)];
      for (const a of who) cleanseUnit(S, a, tier, e.value >= 99 ? 99 : 1); continue; }
    if (t === 'apply_status' || t === 'sure_hit' || t === 'sure_crit' || t === 'self_low_hp_bonus' || t === 'bonus_per_status_stack') continue;
    if (t === 'self_damage') { const d = Math.min(u.hp - 1, Math.round(u.mhp * e.value)); if (d > 0) { u.hp -= d; S.log.selfDmg = (S.log.selfDmg || 0) + d; } continue; }   // 自损：不致死
    if (t === 'status_guard') { for (const a of alive(S.party)) a.stGuard = true; continue; }
    if (t === 'team_attack_bonus') { for (const a of alive(S.party)) a.nextAtk = Math.max(a.nextAtk || 0, e.value); continue; }
    if (t === 'cleanse_fear') { for (const a of alive(S.party)) delete a.st['惊惧']; continue; }
    if (t === 'damage_bonus') { const a = alive(S.party).filter(x => x !== u).sort((x, y) => y.atk - x.atk)[0]; if (a) a.dmgBuff = { v: e.value, left: 2 }; if (u.P.self_steady_mp) u.mp = Math.min(u.mmp, u.mp + Math.round(u.mmp * u.P.self_steady_mp)); continue; }
    if (t === 'refresh_own_buff') { for (const a of S.party) if (a.dmgBuff) a.dmgBuff.left = Math.max(a.dmgBuff.left, 2); else if (a.regen) a.regen.left = Math.max(a.regen.left, 2); continue; }
    if (t === 'next_enemy_attack_reduction') { if (tgt) { tgt.weakened = tgt.rank === 'boss' ? e.value / 2 : e.value; if (u.P.self_steady_mp) u.mp = Math.min(u.mmp, u.mp + Math.round(u.mmp * u.P.self_steady_mp)); } continue; }
    if (t === 'self_exposure') { u.expLeft = 2; continue; }
    if (t === 'target_exposure') { if (tgt) tgt.exposure = e.value; continue; }
    if (t === 'slow') { if (tgt && tgt.hp > 0) tgt.slowed = true; continue; }
    if (t === 'delay_remaining_action') { if (tgt && tgt.rank !== 'boss' && !tgt.acted && tgt.known.size) tgt.delayed = true; continue; }
    if (t === 'order_shift' || t === 'order_after_caster' || t === 'order_to_allied_tail') { const a = pickAlly(S, u, 'other'); if (a) a.orderUp = 3; continue; }
    if (t === 'bp_transfer') { const a = alive(S.party).filter(x => x !== u).sort((x, y) => y.atk - x.atk)[0]; if (a) a.bp = Math.min(5, a.bp + e.value); continue; }
    if (t === 'next_ally_same_target_damage') { if (tgt) tgt.markDmg = e.value; continue; }
    if (t === 'next_ally_extra_shield_damage') { if (tgt) tgt.markShield = e.value; continue; }
    if (t === 'death_prevention') { const a = pickAlly(S, u, 'any'); if (a) a.deathGuard = true; continue; }
    if (t === 'self_speed_multiplier') { u.spdMul = e.value; continue; }
    unsettled(t, mv.id);
  }
  u.guardedLast = false;
  return dealt;
}
function execInner(S, u, h, tgt) {
  const a = h.h.active_skill; u.mp -= a.mp; u.innerCd = a.cooldown_self_actions; S.log.innerUses[h.id] = (S.log.innerUses[h.id] || 0) + 1;
  for (const e of a.effects) { const [v1, v2, v3] = e.values;
    switch (e.type) {
      case 'mp_restore': u.mp = Math.min(u.mmp, u.mp + Math.max(1, Math.round(u.mmp * v1))); break;
      case 'heal_self': u.hp = Math.min(u.mhp, u.hp + Math.round(u.mhp * v1)); break;
      case 'heal_ally': healUnit(S, u, a.target_mode === 'ally' ? pickAlly(S, u, e.type === 'heal_ally' && h.id === 'xf_tongdan' ? 'other' : 'any') : u, v1); break;
      case 'regen_ally': { const t = pickAlly(S, u, 'any'); if (t) t.regen = { amt: t.mhp * v1 * (1 + (u.P.regen_bonus || 0)), left: v2, src: u }; break; }
      case 'ding': u.ding = { atk: v1, red: v2, left: v3 }; break;
      case 'guard': u.guarding = v1; u.guardedLast = true; S.guardRound = S.round; break;
      case 'counter': u.counter = v1; break;
      case 'intercept': { const t = pickAlly(S, u, 'other'); if (t) t.intercept = { by: u, red: v1 + (u.P.intercept_reduction || 0) }; S.guardRound = S.round; break; }
      case 'reveal': if (tgt) reveal(S, tgt, v1, u); break;
      case 'focus_next': u.focus = v1; break;
      case 'exposure_buff': u.expBuff = v1; u.expLeft = v3; break;
      case 'unload': { const t = h.id === 'xf_tongdan' ? pickAlly(S, u, 'other') : u; if (t) t.unload = Math.max(t.unload, v1); break; }
      case 'cleanse': cleanseUnit(S, u, 'mid', v1 || 1); break;
      case 'cleanse_slow': u.slow = false; u.slowed = false; break;
      case 'cleanse_exposure': u.expLeft = 0; break;
      case 'order_up': u.orderUp = 3; break;
      case 'guard_token': u.tokens = Math.min(u.P.guard_cap || 1, u.tokens + v1); break;
      case 'next_support_half': u.supportHalf = true; break;
      case 'status_focus': u.statusFocus = v1; break;
      case 'status_immune': u.stImmune = S.round + v1; break;
      default: unsettled(e.type, h.id);
    }
  }
}

// ---------- 我方决策：对每个可选行动做一步前瞻估值 ----------
function expectedIncoming(S, a) {
  const tgts = alive(S.party).length || 1; let s = 0;
  for (const f of alive(S.foes)) { if (f.broken) continue; const p = f.charge ? f.charge.power : 1; s += f.atk * p * defMul(a.def) * (f.charge && f.charge.target === a ? 1 : 1 / tgts) * f.actsPerRound; }
  return s;
}
// 一次常规出手对敌方的价值（与 value() 的敌方血量项同量纲），用于给增益、BP、守势等延后收益定价
function refVal(S, u) { if (S.rvCache && S.rvCache.has(u)) return S.rvCache.get(u); const fs = alive(S.foes); if (!fs.length) return 0; const mh = mean(fs.map(f => f.mhp)), df = mean(fs.map(f => f.def)); return 100 * u.atk * 1.3 * defMul(df) / mh; }
function estRemaining(S) { const fs = alive(S.foes); if (!fs.length) return 0; const hp = fs.reduce((t, f) => t + f.hp, 0); const dpr = alive(S.party).reduce((t, u) => t + u.atk * 1.3 * defMul(mean(fs.map(f => f.def))), 0); return Math.max(1, Math.min(8, hp / Math.max(1, dpr))); }
function value(S) {
  if (!alive(S.foes).length) return 1e4 + alive(S.party).reduce((t, a) => t + 100 * a.hp / a.mhp, 0);
  let v = 0; const rem = S.remCache ?? estRemaining(S);
  for (const f of S.foes) { const w = f.rank === 'boss' ? 1.4 : f.rank === 'elite' ? 1.2 : 1; v -= 100 * w * (f.hp / f.mhp); if (f.hp > 0) { v -= 6 * (f.shield / f.maxShield) * w; if (f.broken) v += 14 * w; for (const k of f.known) v += S.kinds.has(k) && f.shield > 0 ? 5 : 1; if (f.weakened) v += 3; if (f.markDmg || f.markShield) v += 3; v += statusValue(f, 1); } else v += 25 * w; }
  for (const a of S.party) { if (a.hp <= 0) { v -= 120; continue; } const h = a.hp / a.mhp, rv = refVal(S, a); v += 100 * (1 - Math.pow(1 - h, 1.6)) * 1.1;
    const inc = expectedIncoming(S, a); v += (a.unload + (a.guarding ? 1 - a.guarding : 0) + (a.intercept ? .8 : 0) + (a.ding ? a.ding.red * Math.min(a.ding.left, rem) : 0)) * inc / a.mhp * 100;
    if (a.regen) v += a.regen.amt * a.regen.left / a.mhp * 60; v += statusValue(a, -1); if (a.slow) v -= 2;
    v += a.bp * (S.foes.some(f => f.broken && f.hp > 0) ? .6 : .35) * rv + a.mp / Math.max(1, a.mmp) * CFG.mpWeight + a.tokens * (a.P.guard_bonus || .1) * rv + (a.nextAtk + a.focus) * rv
      + (a.ding ? a.ding.atk * Math.min(a.ding.left, rem) * rv : 0) + (a.expBuff && a.expLeft ? a.expBuff * Math.min(a.expLeft, rem) * rv : 0) + (a.dmgBuff ? a.dmgBuff.v * Math.min(a.dmgBuff.left, rem) * rv : 0)
      + (a.counter ? a.counter * rv * .5 : 0) + (a.deathGuard ? 10 : 0) + (a.supportHalf ? 3 : 0) + (a.stGuard ? 4 : 0) + (a.stImmune > S.round ? 3 : 0) + (a.statusFocus ? 3 : 0); }
  return v;
}
function snapshot(S) { return JSON.stringify({ p: S.party.map(u => ({ ...u, hearts: undefined, P: undefined, levels: undefined, load: undefined, intercept: u.intercept ? { by: u.intercept.by.id, red: u.intercept.red } : null, regen: u.regen ? { amt: u.regen.amt, left: u.regen.left } : null })), f: S.foes.map(f => ({ ...f, known: [...f.known], acts: undefined, phase2: undefined, charge: f.charge ? { ...f.charge, target: f.charge.target ? f.charge.target.id : null } : null })), log: S.log, guardRound: S.guardRound }); }
const KEEP_U = new Set(['hearts', 'P', 'levels', 'load']), KEEP_F = new Set(['acts', 'phase2', 'known']);
function restore(S, snap) { const o = JSON.parse(snap); S.party.forEach((u, i) => { const x = o.p[i]; for (const k of Object.keys(u)) if (!KEEP_U.has(k) && !(k in x)) delete u[k]; for (const k of Object.keys(x)) if (!KEEP_U.has(k)) u[k] = x[k]; u.intercept = x.intercept ? { by: S.party.find(p => p.id === x.intercept.by), red: x.intercept.red } : null; u.regen = x.regen ? { ...x.regen, src: u } : null; });
  S.foes.forEach((f, i) => { const x = o.f[i]; for (const k of Object.keys(f)) if (!KEEP_F.has(k) && !(k in x)) delete f[k]; for (const k of Object.keys(x)) if (!KEEP_F.has(k)) f[k] = x[k]; f.known = new Set(x.known); if (f.charge) f.charge.target = S.party.find(p => p.id === f.charge.target) || null; }); S.log = o.log; S.guardRound = o.guardRound; }

function options(S, u) {
  const out = [];
  const foes = alive(S.foes);
  const basic = { id: 'basic', name: '普攻', grade: '丁', weapon: u.weapon === '医具' ? '拳' : u.weapon, profile: 'A', target: 'specified', basic: true,
    c: { mp: 0, total_power: 1, effects: [], bp: [0, 1, 2, 3].map(b => ({ total_power: 1, hits: 1 + b, shield_cap: 1 + b, effects: [], heal_multiplier: 1 })) } };
  const list = has(u, '封穴') ? [basic] : [basic, ...u.load.map(id => D.moves[id]).filter(m => m.usage !== 'defend_enhance')];
  for (const mv of list) {
    if (!mv.basic && (u.cd[mv.id] || 0) > 0) continue;
    const maxBp = has(u, '惊惧') ? 0 : Math.min(3, u.bp), bps = mv.boost === 'hits' || mv.basic ? [...Array(maxBp + 1).keys()] : [...new Set([0, maxBp])];
    for (const bp of bps) {
      const band = mv.c.bp[bp]; if (!band || band.available === false) continue; if (mv.profile === 'X' && bp !== 3) continue;
      const tg = mv.c.total_power > 0 && mv.target !== 'all_foes' || mv.c.effects.some(e => ['reveal', 'next_enemy_attack_reduction', 'slow', 'target_exposure', 'next_ally_same_target_damage', 'next_ally_extra_shield_damage', 'delay_remaining_action'].includes(e.type)) ? foes : [null];
      for (const t of tg) { if (!mv.basic && u.mp < moveCost(u, mv, t)) continue; out.push({ kind: 'move', mv, bp, t }); }
    }
  }
  for (const h of (has(u, '封穴') ? [] : u.hearts)) { const a = h.h.active_skill; if (u.innerCd > 0 || u.mp < a.mp) continue; const tg = a.target_mode === 'foe' ? foes : [null]; for (const t of tg) out.push({ kind: 'inner', h, t }); }
  out.push({ kind: 'defend' });
  return out;
}
function act(S, u, o) {
  if (o.kind === 'move' && o.t && has(u, '心乱') && S.r() < .4) { const fs = alive(S.foes); o = { ...o, t: fs[Math.floor(S.r() * fs.length)] }; }
  if (o.kind === 'move') { execMove(S, u, o.mv, o.bp, o.t); if (o.mv.c.cooldown_self_actions) u.cd[o.mv.id] = o.mv.c.cooldown_self_actions + 1; }
  else if (o.kind === 'inner') execInner(S, u, o.h, o.t);
  else { u.guarding = .5; u.guardedLast = true; S.guardRound = S.round; if (u.P.guard_on_defend) u.tokens = Math.min(u.P.guard_cap || 1, u.tokens + 1);
    // 防御强化：装配的守势招式在防御时自动生效（取效果最高的一招，不付内力）
    const enh = u.load.map(id => D.moves[id]).filter(m => m.usage === 'defend_enhance');
    const score = m => m.c.bp[0].effects.reduce((t, e) => t + (['unload', 'counter_power', 'next_attack_bonus'].includes(e.type) ? e.value : e.type === 'guard_token' ? .2 : 0), 0);
    const mv = enh.sort((a, b) => score(b) - score(a))[0];
    if (mv) { S.log.useBySkill[mv.id] = (S.log.useBySkill[mv.id] || 0) + 1;
      for (const e of mv.c.bp[0].effects) { if (e.type === 'unload') u.unload = Math.max(u.unload, e.value); if (e.type === 'counter_power') u.counter = Math.max(u.counter || 0, e.value);
        if (e.type === 'guard_token') u.tokens = Math.min(u.P.guard_cap || 1, u.tokens + 1); if (e.type === 'next_attack_bonus') u.nextAtk = Math.max(u.nextAtk || 0, e.value);
        if (e.type === 'cleanse_exposure') u.expLeft = 0; } } }
}
function chooseAndAct(S, u) {
  S.rvCache = null; S.remCache = null; S.rvCache = new Map(S.party.map(a => [a, refVal(S, a)])); S.remCache = estRemaining(S);
  const opts = options(S, u), base = value(S), snap = snapshot(S), r0 = S.r;
  let best = null, bestV = -Infinity;
  for (const o of opts) {
    let seedState = 0x9e3779b9; S.r = () => { seedState = (seedState * 1664525 + 1013904223) >>> 0; return .5; };
    act(S, u, o); let v = value(S) - base;
    if (o.kind === 'move' && o.bp) { const t = o.t; if (!(t && t.broken) && o.mv.profile !== 'X') v -= o.bp * .15 * refVal(S, u); }
    restore(S, snap);
    if (v > bestV) { bestV = v; best = o; }
  }
  S.r = r0; S.rvCache = null; S.remCache = null;
  act(S, u, best);
  return best;
}

// ---------- 敌方行动 ----------
function foeAct(S, f) {
  const party = alive(S.party); if (!party.length) return;
  let power, kind, target;
  if (has(f, '封穴') || has(f, '惊惧')) f.charge = null;
  f.wasCharge = !!f.charge;
  if (f.charge) { ({ power, kind } = f.charge); target = f.charge.target && f.charge.target.hp > 0 ? f.charge.target : party[Math.floor(S.r() * party.length)]; f.charge = null; }
  else { let x = S.r(), tot = f.acts.reduce((s, a) => s + a[2], 0) * x; for (const a of f.acts) { tot -= a[2]; if (tot <= 0) { kind = a[0]; power = a[1]; break; } } kind = kind || f.acts[0][0]; power = power || f.acts[0][1];
    if (has(f, '封穴') && kind !== 'single') { kind = 'single'; power = .8; }
    if (kind === 'charge' && has(f, '惊惧')) { kind = 'single'; power = 1; }
    if (kind === 'charge') { f.charge = { power: power * CFG.charge, kind: 'single', target: party[Math.floor(S.r() * party.length)] }; return; }
    target = party[Math.floor(S.r() * party.length)]; }
  power *= f.actsPerRound > 1 ? .6 : 1;
  if (f.weakened) { power *= 1 - f.weakened; f.weakened = 0; }
  power *= (1 - .08 * stacks(f, '内伤')) * (has(f, '惊惧') ? .85 : 1);
  if (f.rank === 'boss' && S.round >= 10 && !CFG.noEnrage) power *= 1 + CFG.enrage * (S.round - 9);
  // 心乱：40% 攻击其他敌人
  if (has(f, '心乱') && S.r() < .4) { const others = alive(S.foes).filter(o => o !== f); if (others.length) { const o = others[Math.floor(S.r() * others.length)]; o.hp = Math.max(0, o.hp - Math.round(f.atk * power * defMul(o.def))); return; } }
  const inflict = (f.inflict || []).filter(x => x.on === kind || x.on === 'any' || (x.on === 'charge' && f.wasCharge));
  const hitOne = (t, p, aoe) => {
    let victim = t, extraRed = 0;
    if (!aoe && t.intercept && t.intercept.by.hp > 0) { victim = t.intercept.by; extraRed = t.intercept.red; victim.interceptedRound = S.round; if (victim.P.intercept_bonus) victim.interceptBonusReady = true; t.intercept = null; }
    const red = Math.min(.6, reduction(victim) + extraRed);
    let dmg = f.atk * p * defMul(victim.def) * (.95 + S.r() * .1) * (1 - red) * (victim.expLeft > 0 ? 1.1 : 1);
    const raw = f.atk * p * defMul(victim.def); S.log.prevented += Math.max(0, raw - dmg);
    dmg = Math.max(1, Math.round(dmg)); victim.hp -= dmg; S.log.taken = (S.log.taken || 0) + dmg; victim.unload = 0; victim.unhurt = false;
    if (victim.hp <= 0) { if (victim.deathGuard) { victim.hp = 1; victim.deathGuard = false; } else { victim.hp = 0; S.log.deaths++; } }
    if (victim.counter && victim.hp > 0 && !aoe) { const c = victim.counter; victim.counter = 0; const d = Math.round(victim.atk * c * defMul(f.def)); f.hp = Math.max(0, f.hp - d); }
    if (victim.hp > 0) for (const x of inflict) applyStatus(S, f, victim, x.status, x.chance, x.stacks || 1);
  };
  if (has(f, '目眩') && S.r() < .25) return;
  if (kind === 'group') for (const t of party) hitOne(t, power, true); else hitOne(target, power, false);
}

// ---------- 回合 ----------
function runBattle(party, foes, seed, carry) {
  const S = newBattle(party, foes, seed, carry);
  while (S.round < CFG.maxRounds) {
    S.round++;
    for (const x of [...alive(S.party), ...alive(S.foes)]) statusRoundStart(x);
    for (const u of alive(S.party)) { const ac = u.AC || {}; if (ac.regen_hp) u.hp = Math.min(u.mhp, u.hp + Math.round(u.mhp * ac.regen_hp)); if (ac.regen_mp) u.mp = Math.min(u.mmp, u.mp + Math.round(u.mmp * ac.regen_mp)); }
    for (const u of alive(S.party)) { if (u.bpSpentRound !== S.round - 1 && S.round > 1 && !has(u, '惊惧')) u.bp = Math.min(5, u.bp + 1); if (u.unhurt) u.unhurtReady = true; u.unhurt = true; }
    for (const f of S.foes) { f.recovered = false; f.acted = false; if (f.broken && S.round > f.brokenUntil) { f.broken = false; f.shield = f.maxShield; f.recovered = true; for (const k of ['封穴', '眩晕', '心乱', '惊惧']) delete f.st[k]; }
      if (f.phase2Pending && !f.phase2Done) { f.phase2Done = true; f.maxShield += f.phase2.shield_add; f.shield = f.broken ? 0 : f.shield + f.phase2.shield_add; const [o, n] = f.phase2.swap_weak; f.weak = f.weak.filter(w => w !== o).concat(n); f.known.delete(o); f.actsPerRound = 2; } }
    const units = [...alive(S.party), ...alive(S.foes)].map(x => ({ x, k: (x.recovered ? 100 : 0) + (x.spd * (x.spdMul || 1)) + (x.orderUp || 0) - (x.slowed ? 3 : 0) - (x.delayed ? 50 : 0) + S.r() * 3 }));
    units.sort((a, b) => b.k - a.k);
    for (const { x } of units) {
      if (x.hp <= 0) continue;
      if (!alive(S.foes).length || !alive(S.party).length) break;
      if (x.side === 'ally') {
        x.orderUp = 0; x.spdMul = 1; x.afterAtk = 0;
        if (has(x, '眩晕')) { delete x.st['眩晕']; x.imm['眩晕'] = S.round + 2; continue; }
        x.guarding = 0;
        chooseAndAct(S, x);
        if (x.cd) for (const k of Object.keys(x.cd)) if (x.cd[k] > 0) x.cd[k]--; if (x.innerCd > 0) x.innerCd--;
        if (x.ding && --x.ding.left <= 0) x.ding = null; if (x.expLeft > 0 && --x.expLeft <= 0) x.expBuff = 0; if (x.dmgBuff && --x.dmgBuff.left <= 0) x.dmgBuff = null;
        if (x.regen) { x.hp = Math.min(x.mhp, x.hp + Math.round(x.regen.amt)); S.log.healDone += x.regen.amt; if (--x.regen.left <= 0) x.regen = null; }
        statusAfterAction(S, x);
      } else {
        if (x.broken) continue; x.acted = true;
        if (has(x, '眩晕')) { delete x.st['眩晕']; x.imm['眩晕'] = S.round + 2; continue; }
        for (let i = 0; i < x.actsPerRound; i++) foeAct(S, x);
        statusAfterAction(S, x);
        x.slowed = false; x.delayed = false;
        if (x.phase2 && !x.phase2Pending && x.hp < x.mhp / 2) x.phase2Pending = true;
      }
    }
    if (!alive(S.foes).length) return { win: true, rounds: S.round, S };
    if (!alive(S.party).length) return { win: false, rounds: S.round, S };
  }
  return { win: false, rounds: CFG.maxRounds, timeout: true, S };
}

// ---------- 批量模拟与汇总 ----------
const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const mean = arr => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
function simulate() {
  const rows = [], skillAgg = {}, innerAgg = {}, statusAgg = { applied: {}, cleansed: 0, dotDmg: 0, fights: 0 };
  for (let si = 0; si < STAGES.length; si++) for (const party of Object.keys(D.roster.parties)) for (const enc of Object.keys(D.enemies.encounters)) {
    const res = [];
    for (let s = 0; s < CFG.seeds; s++) {
      const P = buildParty(party, si), F = buildFoes(enc, si);
      const r = runBattle(P, F, (si * 7919 + s * 104729 + enc.length * 31 + party.length * 17) >>> 0);
      const L = r.S.log;
      res.push({ allyStatus: L.allyStatus || 0, statusApplied: L.statusApplied, cleansed: L.cleansed, dotDmg: L.dotDmg, takenPerRound: (L.taken || 0) / r.rounds / P.reduce((t, u) => t + u.mhp, 0), win: r.win, rounds: r.rounds, timeout: !!r.timeout, hpLeft: mean(P.map(u => u.hp / u.mhp)), mpLeft: mean(P.map(u => u.mp / u.mmp)), deaths: L.deaths, breaks: L.breaks, firstBreak: L.firstBreak, heal: L.healDone, ult: L.ultimates });
      for (const [k, v] of Object.entries(L.dmgBySkill)) { const a = skillAgg[k] ||= { dmg: 0, uses: 0, fights: 0, stages: new Set() }; a.dmg += v; a.stages.add(si); }
      for (const [k, v] of Object.entries(L.useBySkill)) { const a = skillAgg[k] ||= { dmg: 0, uses: 0, fights: 0, stages: new Set() }; a.uses += v; a.fights++; }
      for (const [k, v] of Object.entries(L.innerUses)) innerAgg[k] = (innerAgg[k] || 0) + v;
      for (const [k, v] of Object.entries(L.statusApplied)) statusAgg.applied[k] = (statusAgg.applied[k] || 0) + v; statusAgg.cleansed += L.cleansed; statusAgg.dotDmg += L.dotDmg; statusAgg.fights++;
    }
    rows.push({ stage: STAGES[si], si, party, enc, kind: D.enemies.kind_of[enc], size: D.anchors[si].party_reference,
      win: mean(res.map(x => x.win ? 1 : 0)), rounds: mean(res.map(x => x.rounds)), p90: pct(res.map(x => x.rounds), .9), hpLeft: mean(res.map(x => x.hpLeft)), mpLeft: mean(res.map(x => x.mpLeft)),
      deaths: mean(res.map(x => x.deaths)), allyStatus: mean(res.map(x => x.allyStatus)), taken: mean(res.map(x => x.takenPerRound)), breaks: mean(res.map(x => x.breaks)), firstBreak: mean(res.filter(x => x.firstBreak !== null).map(x => x.firstBreak)) || null, timeout: mean(res.map(x => x.timeout ? 1 : 0)) });
  }
  return { rows, skillAgg, innerAgg, statusAgg };
}

function loadouts() {
  const out = {};
  for (let si = 0; si < STAGES.length; si++) for (const mid of Object.keys(D.roster.members)) { const u = buildMember(mid, si); out[`${STAGES[si]}:${mid}`] = { load: u.load.map(id => `${D.moves[id].name}${u.levels[id]}`), hearts: u.hearts.map(h => `${h.h.name}${h.layer}`) }; }
  return out;
}

function calibrate(iter = 4) {
  const target = { normal: { rounds: 4 }, elite: { rounds: 6 }, boss: { rounds: 8.5 } };
  // 攻击：单次 1.0 威力命中占阶段参考气血的比例（公式与预算：普通 10–16%），直接解析求出
  const hitFrac = { normal: .13 * CFG.pressure, elite: .16 * CFG.pressure, boss: .15 * CFG.pressure }, typAtk = { normal: .63, elite: .82, boss: .97 };
  const ramp = si => args.ramp ? .8 + (+(args.rampTop || 1.25) - .8) * si / (STAGES.length - 1) : 1;
  CURVE = Object.fromEntries(STAGES.map((st, si) => { const A = D.anchors[si], m = k => +(hitFrac[k] * ramp(si) * A.hp * (60 + A.defense) / (60 * A.attack * typAtk[k])).toFixed(3);
    return [st, { normal: { hp: 1, atk: m('normal') }, elite: { hp: 1, atk: m('elite') }, boss: { hp: 1, atk: m('boss') } }]; }));
  for (let it = 0; it < iter; it++) {
    const { rows } = simulate();
    for (const st of STAGES) for (const k of ['normal', 'elite', 'boss']) {
      const rs = rows.filter(r => r.stage === st && r.kind === k), rounds = mean(rs.map(r => r.rounds)), taken = mean(rs.map(r => r.taken)), c = CURVE[st][k];
      c.hp = +(c.hp * Math.pow(target[k].rounds / rounds, .9)).toFixed(3); c.observedTaken = +taken.toFixed(3); c.observedRounds = +rounds.toFixed(2);
    }
    console.error('calibrate', it + 1, JSON.stringify(CURVE[STAGES[6]]));
  }
  fs.writeFileSync(CURVE_FILE, JSON.stringify({ version: 'ENEMY-CURVE-1', note: '由 combat_sim.cjs --calibrate 生成：按目标回合数与每回合承伤反推的敌人血量、攻击系数（乘在阶段锚点与敌人模板之上）。', target, curve: CURVE }, null, 1));
}
function postBattle(party) {
  for (const u of party) { if (u.hp <= 0) u.hp = 1; const P = u.P; if (P.post_battle_mp) u.mp = Math.min(u.mmp, u.mp + Math.round(u.mmp * P.post_battle_mp)); if (P.post_battle_hp) u.hp = Math.min(u.mhp, u.hp + Math.round(u.mhp * P.post_battle_hp));
    if (P.post_battle_party_hp) for (const a of party) a.hp = Math.min(a.mhp, a.hp + Math.round(a.mhp * P.post_battle_party_hp)); }
}
const CHAIN = ['普通·山道', '普通·江岸', '普通·院落', '精英·刀堂'];
function simulateChains(seeds = 30) {
  const out = [], innerAgg = {}, skillUse = {};
  for (let si = 0; si < STAGES.length; si++) for (const party of Object.keys(D.roster.parties)) {
    const res = [];
    for (let s = 0; s < seeds; s++) { const P = buildParty(party, si); let ok = true, fights = 0;
      for (const enc of CHAIN) { const r = runBattle(P, buildFoes(enc, si), (si * 7919 + s * 15485863 + fights * 31) >>> 0, true); fights++;
        for (const [k, v] of Object.entries(r.S.log.innerUses)) innerAgg[k] = (innerAgg[k] || 0) + v; for (const [k, v] of Object.entries(r.S.log.useBySkill)) skillUse[k] = (skillUse[k] || 0) + v;
        if (!r.win) { ok = false; break; } postBattle(P); }
      res.push({ ok, fights, hp: mean(P.map(u => u.hp / u.mhp)), mp: mean(P.map(u => u.mp / u.mmp)) }); }
    out.push({ stage: STAGES[si], party, clear: mean(res.map(x => x.ok ? 1 : 0)), hpEnd: mean(res.map(x => x.hp)), mpEnd: mean(res.map(x => x.mp)) });
  }
  return { rows: out, inner: innerAgg, skillUse };
}
if (require.main === module && args.chain) { CFG.seeds = +(args.seeds || 30); CFG.mpWeight = 30; const r = simulateChains(CFG.seeds); fs.mkdirSync(CFG.out, { recursive: true }); fs.writeFileSync(path.join(CFG.out, `chain-${CFG.label}.json`), JSON.stringify(r, null, 1));
  console.log(JSON.stringify({ label: CFG.label, clear: mean(r.rows.map(x => x.clear)).toFixed(3), hpEnd: mean(r.rows.map(x => x.hpEnd)).toFixed(2), mpEnd: mean(r.rows.map(x => x.mpEnd)).toFixed(2), inner: r.inner })); process.exit(0); }
if (require.main === module && args.calibrate) { CFG.seeds = +(args.seeds || 16); calibrate(+(args.calibrate) || 4); process.exit(0); }
if (require.main === module) {
  const t0 = Date.now(), { rows, skillAgg, innerAgg, statusAgg } = simulate();
  const win = { normal: [3, 5], elite: [5, 7], boss: [7, 10] };
  const flags = [];
  for (const r of rows) { const [lo, hi] = win[r.kind];
    if (r.win < .9) flags.push({ ...r, why: `胜率 ${(r.win * 100).toFixed(0)}%` });
    else if (r.rounds < lo) flags.push({ ...r, why: `过短 ${r.rounds.toFixed(1)} 回合（目标 ${lo}–${hi}）` });
    else if (r.rounds > hi) flags.push({ ...r, why: `过长 ${r.rounds.toFixed(1)} 回合（目标 ${lo}–${hi}）` }); }
  const skills = Object.entries(skillAgg).map(([id, a]) => ({ id, name: D.moves[id]?.name || id, grade: D.moves[id]?.grade, uses: a.uses, dmg: Math.round(a.dmg), perUse: a.uses ? Math.round(a.dmg / a.uses) : 0 }));
  const learnedSomewhere = new Set(Object.values(D.roster.members).flatMap(m => m.moves.map(x => x[0])));
  const neverUsed = [...learnedSomewhere].filter(id => !skillAgg[id] || !skillAgg[id].uses);
  fs.mkdirSync(CFG.out, { recursive: true });
  const result = { version: 'COMBAT-SIM-1', label: CFG.label, config: CFG, seconds: (Date.now() - t0) / 1000, rows, skills, inner: innerAgg, status: statusAgg, neverUsed, unsettled: Object.fromEntries([...UNSETTLED].map(([k, v]) => [k, [...v]])), flags: flags.map(f => ({ stage: f.stage, party: f.party, enc: f.enc, why: f.why })) };
  fs.writeFileSync(path.join(CFG.out, `results-${CFG.label}.json`), JSON.stringify(result, null, 1));
  if (args.loadouts) fs.writeFileSync(path.join(CFG.out, 'loadouts.json'), JSON.stringify(loadouts(), null, 1));
  const byKind = k => rows.filter(r => r.kind === k);
  console.log(JSON.stringify({ label: CFG.label, seconds: result.seconds, fights: rows.length * CFG.seeds, flags: flags.length,
    normal: { win: mean(byKind('normal').map(r => r.win)).toFixed(3), rounds: mean(byKind('normal').map(r => r.rounds)).toFixed(2) },
    elite: { win: mean(byKind('elite').map(r => r.win)).toFixed(3), rounds: mean(byKind('elite').map(r => r.rounds)).toFixed(2) },
    boss: { win: mean(byKind('boss').map(r => r.win)).toFixed(3), rounds: mean(byKind('boss').map(r => r.rounds)).toFixed(2) },
    neverUsed: neverUsed.length, unsettled: Object.keys(result.unsettled) }));
}
module.exports = { buildMember, buildParty, buildFoes, runBattle, simulate, CFG, D, STAGES };
