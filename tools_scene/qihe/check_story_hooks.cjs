'use strict';
// 回扣与分支检查（规范：xiaojianghu/docs/design/optional-story-dependencies.md；登记表：xiaojianghu/docs/design/registry/story-hooks.json）。
// 用法（工作区根目录）：node tools_scene/qihe/check_story_hooks.cjs [--report] [--hook gn_spring]
//   错误（退出码 1）：E1 whenSeen／whenUnseen 指向未登记或不存在的场次；E2 固定剧情的触发前置依赖可选剧情。
//   警告：W1 台词出现某段可选剧情的独有关键词，却不在那段剧情里、也没有用 whenSeen 分版本、也没登记豁免；
//         W2 可选剧情以另一段可选剧情为前置（可能一断全断），而登记表没有把它声明为 gate。
//   --report 输出每段可选剧情的反查清单（被哪些台词回扣、被哪些分支用到），改可选剧情前先看。
const path = require('path'), fs = require('fs'), root = path.resolve(__dirname, '../..');
const REG = path.join(root, '../xiaojianghu/docs/design/registry/story-hooks.json');
const reg = JSON.parse(fs.readFileSync(REG, 'utf8')), hooks = reg.hooks, allow = reg.allow || [];
const H = require(path.join(root, 'js/qh-mode-cultivation-household.js'));
const PH = require(path.join(root, 'js/qh-pre-hangao.js')), PD = require(path.join(root, 'js/qh-pre-hangao-data.js'));
const V = require(path.join(root, 'js/qh-mode-cultivation-visitors.js'));
const defs = H.definitions.map(d => ({ ...d })); PH.definitions(defs);
const byId = new Map(defs.map(d => [d.id, d]));
const isFixed = id => !!byId.get(id)?.auto, isOptional = id => byId.has(id) && !byId.get(id).auto;
const errors = [], warns = [], uses = {}; for (const k of Object.keys(hooks)) uses[k] = { lines: [], hits: [] };

// 1. 进城前剧情数据里的 whenSeen／whenUnseen
const guarded = new Set();
for (const s of PD.scenes) for (const l of [...s.opening, ...s.ending, ...(s.choices || []).flatMap(c => c.lines || []), ...(s.productionChoices || []).flatMap(c => c.lines || [])]) {
  for (const id of [...(l.whenSeen || []), ...(l.whenUnseen || [])]) {
    if (!byId.has(id)) errors.push(`E1 ${s.id} ${l.id}：whenSeen/whenUnseen 指向不存在的场次 ${id}`);
    else if (!hooks[id] && isOptional(id)) errors.push(`E1 ${s.id} ${l.id}：可选剧情 ${id} 没有登记在回扣登记表`);
    else if (!hooks[id]) {}  // 固定剧情依赖固定剧情允许（R-剧情-07），不必登记
    if (hooks[id]) uses[id].lines.push(`${s.id}「${l.text.slice(0, 24)}」${l.whenSeen ? '（看过才播）' : '（没看过才播）'}`);
  }
  if (l.whenSeen || l.whenUnseen) guarded.add(s.id + '|' + l.text);
}
// 2. 触发前置
for (const d of defs) {
  const need = [...(d.factRequires || []), ...(d.requires || [])].filter(f => /_seen$/.test(f)).map(f => f.replace(/_seen$/, '')).filter(isOptional);
  for (const o of need) {
    if (d.auto) errors.push(`E2 固定剧情 ${d.id}《${d.name}》的触发依赖可选剧情 ${o}《${byId.get(o).name}》`);
    else if (!(hooks[o]?.consumers || []).some(c => c.scene === d.id && c.size === 'gate')) warns.push(`W2 可选剧情 ${d.id}《${d.name}》以可选剧情 ${o} 为前置，登记表没有声明为 gate（可能一断全断）`);
  }
}
// 3. 关键词扫描：游戏实际会播的全部培养台词
const lines = [];
const ctxs = [{}, { gn_lamp_seen: 1, gn_spring_seen: 1, gn_cook_seen: 1, gn_letter_seen: 1 }];
const seen = new Set();
for (const d of defs) for (const facts of ctxs) {
  let x; try { const st = { facts, learned: { footwork: true, sword: true, fist: true }, relations: {}, preHangao: {} }; x = V.script(d.id, { ...PH.extra(st), footwork: true, sword: true, fist: false, opening: { chen_injury: 'unknown' }, delivery: null }); } catch (e) { continue; }
  for (const l of [...x.intro, ...x.choices.flatMap(c => [{ text: c.text || '', speaker: 'choice' }, ...c.lines]), ...x.closing]) {
    const k = d.id + '|' + l.text; if (!l.text || seen.has(k)) continue; seen.add(k); lines.push({ scene: d.id, text: l.text });
  }
}
const allowed = (scene, text, kw) => allow.some(a => (a.line === scene || (a.text && text.includes(a.text))) && (!a.keyword || a.keyword === kw));
for (const [hid, h] of Object.entries(hooks)) for (const p of h.plants || []) for (const kw of p.keywords || []) for (const l of lines) {
  if (l.scene === hid || !l.text.includes(kw)) continue;
  uses[hid].hits.push(`${l.scene}「${l.text.slice(0, 24)}」含“${kw}”`);
  const gateOk = (h.consumers || []).some(c => c.scene === l.scene && c.size === 'gate');  // 以本段为前置的可选剧情，回扣无妨
  if (gateOk || guarded.has(l.scene + '|' + l.text) || allowed(l.scene, l.text, kw)) continue;
  warns.push(`W1 ${isFixed(l.scene) ? '固定' : '可选'}剧情 ${l.scene}「${l.text.slice(0, 30)}」含 ${hid}《${h.name}》的关键词“${kw}”，没有分版本也没有登记豁免`);
}
// 输出
const only = process.argv.includes('--hook') ? process.argv[process.argv.indexOf('--hook') + 1] : null;
if (process.argv.includes('--report') || only) for (const [hid, u] of Object.entries(uses)) {
  if (only && hid !== only) continue;
  console.log(`\n## ${hid}《${hooks[hid].name}》（${hooks[hid].kind}）`);
  for (const c of hooks[hid].consumers || []) console.log(`  分支/门槛 [${c.size}] ${c.scene}：${c.what}`);
  for (const t of u.lines) console.log('  回扣台词 ' + t);
  for (const t of u.hits) console.log('  关键词出现 ' + t);
}
console.log(`\n回扣检查：登记 ${Object.keys(hooks).length} 段可选剧情；扫描台词 ${lines.length} 句；错误 ${errors.length}，警告 ${warns.length}`);
for (const e of errors) console.log('  ' + e); for (const w of warns) console.log('  ' + w);
const todo = allow.filter(a => a.pending); if (todo.length) { console.log(`待办豁免 ${todo.length} 条（重做相关场次时要处理）：`); for (const a of todo) console.log(`  ${a.line}「${a.keyword}」：${a.reason}`); }
process.exitCode = errors.length ? 1 : 0;
