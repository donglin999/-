#!/usr/bin/env node
/* 把 combat_sim.cjs 的结果整理成 docs/design/martial-review/balance/sim-report.md 的数据表部分。
 * 用法：node tools_balance/sim_report.cjs --main r2-p1.0 --jue r2-p1.0-jue8 --chain r2-p1.0 [--alt r2-p1.25] [--curve enemy-curve-p1.0.json]
 * 只输出表格段落（写到 sim/tables-<main>.md），结论文字在 sim-report.md 中人工撰写。 */
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '../docs/design/martial-review/balance/sim');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') && a.push([x.slice(2), all[i + 1]]), a), []));
const R = l => JSON.parse(fs.readFileSync(path.join(DIR, `results-${l}.json`), 'utf8'));
const C = l => JSON.parse(fs.readFileSync(path.join(DIR, `chain-${l}.json`), 'utf8'));
const { D, STAGES } = require('./combat_sim.cjs');
const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const f2 = x => (x === null || x === undefined || Number.isNaN(x)) ? '—' : (+x).toFixed(2), pc = x => (x * 100).toFixed(0) + '%';
const STAGE_CN = Object.fromEntries(D.anchors.map(a => [a.id, a.stage]));
const main = R(args.main), L = [];
const group = (rows, key, val) => { const m = {}; for (const r of rows) (m[key(r)] ||= []).push(val(r)); return m; };

L.push(`## 数据表（${args.main}）`, '', `每格 ${main.config.seeds} 场；破势倍率 ${main.config.brk}，弱点倍率 ${main.config.weak}；敌方压力档 ${main.config.pressure}。`, '', '锚点9—12原以旧二十章章号命名；原二十章锚点已取消，时点待安排，数值未改。', '');
// 1. 敌人曲线
const curve = JSON.parse(fs.readFileSync(path.join(DIR, args.curve || 'enemy-curve-p1.0.json'), 'utf8')).curve;
L.push('### 校准出的敌人曲线（乘在阶段锚点与敌人模板之上）', '', '| 阶段 | 普通 血／攻 | 精英 血／攻 | 头目 血／攻 | 观察：普通战每回合承伤 |', '| --- | --- | --- | --- | --- |');
for (const st of STAGES) { const c = curve[st]; L.push(`| ${STAGE_CN[st]} | ${c.normal.hp}／${c.normal.atk} | ${c.elite.hp}／${c.elite.atk} | ${c.boss.hp}／${c.boss.atk} | ${pc(c.normal.observedTaken || 0)} |`); }
// 2. 分类结果
L.push('', '### 单场结果（按遭遇类型）', '', '| 类型 | 胜率 | 平均回合 | 破势次数 | 首次破势回合 | 剩余气血 | 剩余内力 | 阵亡/场 |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const k of ['normal', 'elite', 'boss']) { const rs = main.rows.filter(r => r.kind === k); L.push(`| ${{ normal: '普通', elite: '精英', boss: '头目' }[k]} | ${pc(mean(rs.map(r => r.win)))} | ${f2(mean(rs.map(r => r.rounds)))} | ${f2(mean(rs.map(r => r.breaks)))} | ${f2(mean(rs.filter(r => r.firstBreak).map(r => r.firstBreak)))} | ${pc(mean(rs.map(r => r.hpLeft)))} | ${pc(mean(rs.map(r => r.mpLeft)))} | ${f2(mean(rs.map(r => r.deaths)))} |`); }
// 3. 队伍对比
L.push('', '### 队伍对比（平均回合，越短输出越强）', '', '| 队伍 | 普通 | 精英 | 头目 | 头目胜率 |', '| --- | --- | --- | --- | --- |');
for (const p of Object.keys(D.roster.parties)) { const rs = main.rows.filter(r => r.party === p), by = k => f2(mean(rs.filter(r => r.kind === k).map(r => r.rounds))); L.push(`| ${p} | ${by('normal')} | ${by('elite')} | ${by('boss')} | ${pc(mean(rs.filter(r => r.kind === 'boss').map(r => r.win)))} |`); }
// 4. 连战
if (args.chain) { const ch = C(args.chain); L.push('', '### 四连战（三场普通＋一场精英，气血内力延续）', '', '| 阶段 | 通关率 | 结束剩余气血 | 结束剩余内力 |', '| --- | --- | --- | --- |');
  const by = group(ch.rows, r => r.stage, r => r); for (const st of STAGES) { const rs = by[st]; L.push(`| ${STAGE_CN[st]} | ${pc(mean(rs.map(r => r.clear)))} | ${pc(mean(rs.map(r => r.hpEnd)))} | ${pc(mean(rs.map(r => r.mpEnd)))} |`); } }
// 5. 招式
const skills = main.skills.filter(s => s.id !== 'basic' && D.moves[s.id]);
L.push('', '### 招式使用（按品阶；“每次”为每次施展的平均伤害，含所花 BP）', '');
for (const g of ['丁', '丙', '乙', '甲', '绝']) { const rs = skills.filter(s => s.grade === g).sort((a, b) => b.uses - a.uses); if (!rs.length) continue;
  L.push(`**${g}级**：` + rs.map(s => `${s.name} ${s.uses}次${s.perUse ? '／' + s.perUse : ''}`).join('，'), ''); }
const basic = main.skills.find(s => s.id === 'basic'); if (basic) L.push(`普攻：${basic.uses}次／${basic.perUse}。`, '');
L.push(`从未被使用：${main.neverUsed.map(id => D.moves[id]?.name || id).join('、') || '无'}。`, '');
if (args.jue) { const j = R(args.jue); const xs = j.skills.filter(s => D.moves[s.id]?.profile === 'X'); L.push(`绝学提前到锚点9取得时（对照组 ${args.jue}）：` + (xs.map(s => `${s.name} ${s.uses}次／${s.perUse}`).join('，') || '仍未使用') + `；从未使用 ${j.neverUsed.length} 项。`, ''); }
// 6. 内功
L.push('### 内功主动使用次数', '', Object.entries(main.inner).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${D.hearts[k].name}·${D.hearts[k].active_skill.name} ${v}`).join('，') || '无', '');
const unusedInner = Object.keys(D.hearts).filter(k => !main.inner[k]); L.push(`未被使用的内功主动：${unusedInner.map(k => D.hearts[k].name + '·' + D.hearts[k].active_skill.name).join('、') || '无'}（有些内功不在任何模拟队伍里）。`, '');
// 6b. 异常
if (main.status) { const st = main.status, n = st.fights || 1; L.push('### 异常状态（每场平均）', '', Object.entries(st.applied).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / n).toFixed(2)}`).join('，') + `；解除 ${(st.cleansed / n).toFixed(2)} 次；我方持续伤害输出 ${(st.dotDmg / n).toFixed(0)}／场。`, ''); }
// 7. 对照
if (args.alt) { const a = R(args.alt); L.push('### 对照组', '', '| 组 | 普通回合 | 精英回合 | 头目回合 | 头目胜率 |', '| --- | --- | --- | --- | --- |');
  for (const [n, r] of [[args.main, main], [args.alt, a]]) { const by = k => r.rows.filter(x => x.kind === k); L.push(`| ${n} | ${f2(mean(by('normal').map(x => x.rounds)))} | ${f2(mean(by('elite').map(x => x.rounds)))} | ${f2(mean(by('boss').map(x => x.rounds)))} | ${pc(mean(by('boss').map(x => x.win)))} |`); } L.push(''); }
fs.writeFileSync(path.join(DIR, `tables-${args.main}.md`), L.join('\n') + '\n');
console.log('written', `tables-${args.main}.md`);
