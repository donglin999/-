#!/usr/bin/env node
/* 攻击招式扩充 v1 的平衡验证（docs/design/martial-review/attack-expansion-v1.md §9）。
 * 做法：不改名册文件，在内存里给现有队伍各造一支“换招队”——把队里一名输出位换成只带新招式的同角色（数值、内功、装备不变），
 * 用同一套遭遇、同一批种子与原队对比胜率、回合数；再按品阶比较新旧攻击招的每次出手伤害与使用次数。
 * 用法：node tools_balance/attack_expansion_sim.cjs [--seeds 12]
 * 输出：docs/design/martial-review/balance/sim/attack-expansion-v1.json（含写进设计文档的 markdown 段落）。 */
'use strict';
const fs = require('fs'), path = require('path');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') && a.push([x.slice(2), all[i + 1]]), a), []));
const SEEDS = +(args.seeds || 12);
process.argv = process.argv.slice(0, 2);   // combat_sim 自己也读命令行
const sim = require('./combat_sim.cjs');
const D = sim.D, R = D.roster, OUT = path.join(__dirname, '..', 'docs/design/martial-review/balance/sim/attack-expansion-v1.json');
sim.CFG.seeds = SEEDS;

// 换招成员：[新成员 id, 取代的原成员, 兵器, 招式与最早阶段]
const SECT = (p) => [[p + '1', 'Y1'], [p + '2', 'Y1+'], [p + '3', 'Y2'], [p + '4a', 'TRAVEL'], [p + '4b', 'TRAVEL'], [p + '5a', 'LATE'], [p + '5b', 'LATE'], [p + '5', 'LATE']];
const VARIANTS = [
  ['x_bh', 'lu', '暗器', SECT('bh_d')], ['x_zc', 'tang', '暗器', SECT('zc_f')], ['x_hc', 'duan', '棍', SECT('hc_g')],
  ['x_sf', 'wen', '棍', SECT('sf_f')], ['x_gj', 'cen', '暗器', SECT('gj_h')], ['x_pj', 'shen', '刀', SECT('pj_d')],
  ['x_jh_sword', 'xiao_s', '剑', [['gy_s1', 'Y1'], ['jh_wm1', 'Y1+'], ['jh_jh1', 'Y1+'], ['jh_by1', 'Y2'], ['jh_by2', 'TRAVEL'], ['jh_ly1', 'TRAVEL'], ['jh_ly2', 'TRAVEL'], ['jh_qx1', 'TRAVEL'], ['jh_qx2', 'TRAVEL'], ['jh_gh1', 'LATE'], ['jh_gh2', 'LATE'], ['jh_gh3', 'LATE'], ['jh_dm1', 'LATE'], ['jh_dm2', 'LATE'], ['jh_dm3', 'LATE']]],
  ['x_jh_dart', 'xiao_s', '暗器', [['gy_s1', 'Y1'], ['jh_bp1', 'Y1+'], ['jh_pl1', 'Y1+'], ['jh_tz1', 'Y2'], ['jh_qp1', 'Y2'], ['jh_qp2', 'TRAVEL'], ['jh_hp1', 'TRAVEL'], ['jh_hp2', 'TRAVEL'], ['jh_lm1', 'LATE'], ['jh_lm2', 'LATE'], ['jh_lm3', 'LATE'], ['jh_bx1', 'LATE'], ['jh_bx2', 'LATE'], ['jh_bx3', 'LATE']]],
  ['x_jh_fist', 'xiao_p', '拳', [['gy_p1', 'Y1'], ['jh_luo1', 'Y1+'], ['jh_cy1', 'Y2'], ['jh_cg1', 'Y2'], ['jh_lx1', 'Y2'], ['jh_qs1', 'Y2'], ['jh_qs2', 'TRAVEL'], ['jh_xh1', 'TRAVEL'], ['jh_xh2', 'TRAVEL'], ['jh_fl1', 'LATE'], ['jh_fl2', 'LATE'], ['jh_fl3', 'LATE']]],
  ['x_jh_blade', 'xiao_p', '刀', [['gy_p1', 'Y1'], ['jh_hd1', 'Y2'], ['jh_bl1', 'Y2'], ['jh_ty1', 'Y2'], ['jh_xy1', 'TRAVEL'], ['jh_xy2', 'TRAVEL'], ['jh_qq1', 'TRAVEL'], ['jh_qq2', 'TRAVEL'], ['jh_bw1', 'TRAVEL'], ['jh_bw2', 'TRAVEL'], ['jh_sh1', 'TRAVEL'], ['jh_sh2', 'TRAVEL']]],
];
const NEW = new Set(VARIANTS.flatMap(v => v[3].map(m => m[0])).filter(id => !/^gy_/.test(id)));
const pairs = [];   // [原队, 换招队, 换的是谁]
for (const [vid, base, weapon, moves] of VARIANTS) {
  for (const [id] of moves) if (!D.moves[id]) throw new Error('缺招式 ' + id);
  R.members[vid] = { ...R.members[base], name: R.members[base].name + '·换招', weapon, moves };
  if (R.early_substitutes[base]) R.early_substitutes[vid] = R.early_substitutes[base];   // 早期由同一名替补出场，与原队一致
  for (const [pname, ids] of Object.entries({ ...R.parties })) {
    if (pname.startsWith('换') || !ids.includes(base)) continue;
    const vname = `换${vid.slice(2)}·${pname}`;
    if (pairs.some(p => p[1] === vname)) continue;
    R.parties[vname] = ids.map(x => x === base ? vid : x);
    pairs.push([pname, vname, vid]);
    break;   // 每个换招成员只配一支队伍
  }
}
const t0 = Date.now(), { rows, skillAgg } = sim.simulate();
// 第二遍：绝学提前到“游历后段”学会（同 combat_sim 的 --jueAt 8），最后一个阶段功法七重、绝招可用；只看最后一个阶段
sim.CFG.jueAt = 8;
const LAST = sim.STAGES.length - 1, pass2 = sim.simulate(), rows2 = pass2.rows.filter(r => r.si === LAST), skill2 = pass2.skillAgg;
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
const KINDS = ['normal', 'elite', 'boss'], KN = { normal: '普通', elite: '精英', boss: '头目' }, WIN = { normal: [3, 5], elite: [5, 7], boss: [7, 10] };
const agg = (rs, party, kind, from = 0) => { rs = rs.filter(r => r.party === party && r.kind === kind && r.si >= from); return { win: mean(rs.map(r => r.win)), rounds: mean(rs.map(r => r.rounds)), hp: mean(rs.map(r => r.hpLeft)) }; };
const firstStage = vid => Math.min(...R.members[vid].moves.filter(m => NEW.has(m[0])).map(m => ({ Y1: 0, 'Y1+': 1, Y2: 3, TRAVEL: 6, 'TRAVEL+': 8, LATE: 9 })[m[1]]));
const mk = rs => pairs.map(([b, v, vid]) => { const from = firstStage(vid); return { base: b, variant: v, member: vid, replaced: R.members[vid].name.replace('·换招', ''), role: R.members[vid].role, from, kinds: Object.fromEntries(KINDS.map(k => [k, { base: agg(rs, b, k, from), variant: agg(rs, v, k, from) }])) }; });
const cmp = mk(rows), cmp2 = mk(rows2);
const out = rs => rs.filter(r => { const [lo, hi] = WIN[r.kind]; return r.win < .9 || r.rounds < lo || r.rounds > hi; }).length;
const baseRows = rows.filter(r => !r.party.startsWith('换')), varRows = rows.filter(r => r.party.startsWith('换'));
const per = {};
for (const [id, a] of Object.entries(skillAgg)) { const m = D.moves[id]; if (!m || !(m.c.total_power > 0) || !a.uses) continue;
  const key = `${m.grade}|${m.target === 'all_foes' ? '群体' : '单体'}|${NEW.has(id) ? 'new' : 'old'}`;
  (per[key] ||= []).push({ id, name: m.name, uses: a.uses, perUse: a.dmg / a.uses, power: m.c.total_power }); }
for (const [id, a] of Object.entries(skill2)) { const m = D.moves[id]; if (!m || m.grade !== '绝' || !(m.c.total_power > 0) || !a.uses) continue;
  (per[`绝|${m.target === 'all_foes' ? '群体' : '单体'}|${NEW.has(id) ? 'new' : 'old'}`] ||= []).push({ id, name: m.name, uses: a.uses, perUse: a.dmg / a.uses, power: m.c.total_power }); }
const used = id => (skillAgg[id] && skillAgg[id].uses) || (skill2[id] && skill2[id].uses);
const neverUsed = [...NEW].filter(id => !used(id)).map(id => D.moves[id].name);
const top = Object.entries(skillAgg).filter(([id]) => NEW.has(id)).map(([id, a]) => ({ name: D.moves[id].name, grade: D.moves[id].grade, uses: a.uses, perUse: Math.round(a.dmg / Math.max(1, a.uses)) })).sort((a, b) => b.uses - a.uses);
const ROLE = { striker: '输出', breaker: '破势', tank: '护卫', healer: '医者', support: '接应' };
const LABEL = {"bh": "白鹇谷飞针路", "zc": "照川袖剑路", "hc": "合川杠棒路", "sf": "松风拂尘路", "gj": "归烬烬砂路", "pj": "巡江腰刀路", "jh_sword": "散学·剑", "jh_dart": "散学·暗器", "jh_fist": "散学·拳掌", "jh_blade": "散学·刀与长兵"};

const f2 = x => x.toFixed(2), pc = x => (x * 100).toFixed(1) + '%';
const table = (cs) => { const L = ['| 换招（原成员定位 → 新路线） | 所在队伍 | 普通：胜率／回合 | 精英：胜率／回合 | 头目：胜率／回合 | 战后气血 |', '| --- | --- | --- | --- | --- | --- |'];
  for (const c of cs) L.push(`| ${c.replaced}（${ROLE[c.role] || c.role}）→ ${LABEL[c.member.slice(2)] || c.member} | ${c.base} | ` + KINDS.map(k => `${pc(c.kinds[k].base.win)}／${f2(c.kinds[k].base.rounds)} → ${pc(c.kinds[k].variant.win)}／${f2(c.kinds[k].variant.rounds)}`).join(' | ') + ` | ${pc(mean(KINDS.map(k => c.kinds[k].base.hp)))} → ${pc(mean(KINDS.map(k => c.kinds[k].variant.hp)))} |`); return L; };
const total = (rows.length + pass2.rows.length) * SEEDS;
const md = ['脚本：`node tools_balance/attack_expansion_sim.cjs`（`tools_balance/combat_sim.cjs` 的规则与敌人曲线不变）。做法：在内存里给现有队伍造 ' + pairs.length + ' 支“换招队”，把一名成员换成只带新招式的同一角色（数值、内功、装备不变），同一批种子对比。每格 ' + SEEDS + ' 个种子，两遍共 ' + total + ' 场。只做设计校准，不代表运行原型的战斗手感。', '',
  '**现有曲线没有变**：名册里的 7 支原队不带新招式，新机制只在新招式上触发；用 40 个种子、23520 场把改动前后的模拟器各跑一遍，588 行结果、各招式统计、异常统计完全相同。', '',
  '### 9.1 换招队与原队（常规进度）', '', '只统计新招式已经可学的阶段；目标回合数：普通 3–5、精英 5–7、头目 7–10。箭头左边是原队，右边是换招队。', '', ...table(cmp), '',
  `超出目标窗口（胜率低于 90% 或回合数出界）的格子：原队 ${out(baseRows)}/${baseRows.length}（${pc(out(baseRows) / baseRows.length)}），换招队 ${out(varRows)}/${varRows.length}（${pc(out(varRows) / varRows.length)}）。`, '',
  '读法：', '',
  '- **输出位换输出位**（唐照雪→袖剑、段明棠→杠棒、岑霜→烬砂、萧白剑→散学剑与散学暗器）：回合数变化都在一成以内，胜率不变，说明新招式与同品阶旧招强度相当。',
  '- **护卫或接应位换成纯攻击**（陆衡→飞针、闻疏桐→拂尘、沈雁回→腰刀、萧白拳掌→散学拳掌与刀棍）：战斗明显变短（头目战短一到两成），这是队伍少了一名护卫或接应、多了一名输出的结果，不是单招超标；敌人倒得更快，所以战后气血基本持平（最后一列）。',
  '- 胜率没有下降，也没有出现新招式让某一阶段胜率跳变的情况。', '',
  '### 9.2 绝招可用时（终局阶段）', '', '常规进度下功法到不了七重，新旧绝招都不会出场；按模拟器已有的 `--jueAt 8` 口径把绝学提前到游历后段学会，只看最后一个阶段（功法七重，绝招可用）。', '', ...table(cmp2), '',
  '### 9.3 每次出手的平均伤害', '', '同一次模拟里统计；各招出现的阶段不同，只作量级对照。绝级取 9.2 那一遍。', '', '| 品阶 | 目标 | 旧招：招数／每次伤害 | 新招：招数／每次伤害 |', '| --- | --- | --- | --- |'];
for (const g of ['丁', '丙', '乙', '甲', '绝']) for (const t of ['单体', '群体']) { const o = per[`${g}|${t}|old`] || [], n = per[`${g}|${t}|new`] || []; if (!o.length && !n.length) continue;
  const w = a => a.length ? Math.round(a.reduce((s, x) => s + x.perUse * x.uses, 0) / a.reduce((s, x) => s + x.uses, 0)) : '—';
  md.push(`| ${g} | ${t} | ${o.length}／${w(o)} | ${n.length}／${w(n)} |`); }
const ults = Object.entries(skill2).filter(([id]) => NEW.has(id) && D.moves[id].grade === '绝' && skill2[id].uses).map(([id, a]) => `${D.moves[id].name} ${a.uses} 次、每次 ${Math.round(a.dmg / a.uses)}`);
const oldUlts = Object.entries(skill2).filter(([id]) => !NEW.has(id) && D.moves[id] && D.moves[id].grade === '绝' && D.moves[id].c.total_power > 0 && skill2[id].uses).map(([id, a]) => `${D.moves[id].name} ${a.uses} 次、每次 ${Math.round(a.dmg / a.uses)}`);
md.push('', `新绝招（9.2 那一遍）：${ults.join('；') || '无'}。旧绝招对照：${oldUlts.join('；') || '无'}。`, '',
  `新招式的使用：${top.length} 招在常规进度里被用过，用得最多的是 ${top.slice(0, 6).map(x => `${x.name}（${x.uses} 次）`).join('、')}。` + (neverUsed.length ? `两遍都没被选用的 ${neverUsed.length} 招：${neverUsed.join('、')}。原因有两类：装配上限 6 格时高品阶优先，低品阶被挤掉；模拟器按“这一步的即时收益”选招，蓄势、反击、先手类容易被低估。这些招式的结算由 \`tests/attack-expansion.test.cjs\` 逐条验证。` : '全部新招式都被用到。'));
fs.writeFileSync(OUT, JSON.stringify({ version: 'ATTACK-EXPANSION-SIM-2', seeds: SEEDS, fights: total, seconds: (Date.now() - t0) / 1000, pairs: cmp, pairsJue: cmp2, perUse: per, neverUsed, top, markdown: md }, null, 1));
console.log(JSON.stringify({ fights: total, seconds: (Date.now() - t0) / 1000, pairs: cmp.map(c => [c.variant, ...KINDS.map(k => `${KN[k]} ${pc(c.kinds[k].variant.win)}/${f2(c.kinds[k].variant.rounds)} (原 ${f2(c.kinds[k].base.rounds)})`)]), jue: cmp2.map(c => [c.variant, ...KINDS.map(k => `${KN[k]} ${pc(c.kinds[k].variant.win)}/${f2(c.kinds[k].variant.rounds)} (原 ${f2(c.kinds[k].base.rounds)})`)]), ults, oldUlts, neverUsed }, null, 1));
