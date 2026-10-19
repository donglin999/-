'use strict';
// ink 剧本构建与检查（迁移方案 xiaojianghu/docs/design/story-source-migration.md §2.3、§4.4、§8.2–8.4）
//   node tools_story/build_ink.cjs              编译 + 全部检查 + 导出总表与路线
//   node tools_story/build_ink.cjs --approve <剧本相对路径|all>   用户审过后登记指纹（§8.4）
// 输入：story/**/*.ink（_共用/ 下是共享声明，不单独编译）、story/_共用/flags.json、../xiaojianghu/bible/人物/*.md（另收 bible/物品/ 里带“名牌”字段的页，如路牌）
// 2026-10-18 第 2 期：支持 ink 函数（=== function）、隧道 knot（->->，只随调用方遍历）、参数变量（VAR x = false // 参数）；
//   路线遍历改为“读到标记才分支”的穷举（只对本 knot 及本文件 ink 函数里读取的标记分支），并检查每句台词至少被一条路线走到。
// 输出（生成物，不手改）：js/story-data/<首个 knot>.js、docs/story-lines.csv、docs/story-routes/<knot>.md、story/_共用/speakers.json
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const inkjs = require('./ink/node_modules/inkjs/dist/ink-full.js');
const { PosixFileHandler } = require('./ink/node_modules/inkjs/dist/inkjs-full-posixhandler.js');

const root = path.resolve(__dirname, '..');
const storyDir = path.join(root, 'story');
const shared = path.join(storyDir, '_共用');
const outDir = path.join(root, 'js', 'story-data');
const bibleDir = path.resolve(root, '..', 'xiaojianghu', 'bible');
const errors = [], warns = [];
const err = (f, m) => errors.push(`${f}：${m}`), warn = (f, m) => warns.push(`${f}：${m}`);
const rel = f => path.relative(storyDir, f).split(path.sep).join('/');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const inks = walk(storyDir).filter(f => f.endsWith('.ink') && !rel(f).startsWith('_共用/')).sort();

// ── 说话人：从设定圣经生成（§2.1）；圣经不在时沿用上次生成的 speakers.json ──
function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/); if (!m) return {};
  const o = {};
  for (const line of m[1].split('\n')) { const k = line.match(/^([^:#\s][^:]*):\s*(.*)$/); if (k) o[k[1].trim()] = k[2].trim().replace(/^"(.*)"$/, '$1'); }
  return o;
}
let speakers;
const speakersPath = path.join(shared, 'speakers.json');
if (fs.existsSync(path.join(bibleDir, '人物'))) {
  speakers = {};
  for (const f of walk(path.join(bibleDir, '人物')).filter(f => f.endsWith('.md'))) {
    const fm = frontmatter(fs.readFileSync(f, 'utf8'));
    if (fm['类型'] !== '人物' || !fm['姓名']) continue;
    const list = s => (s || '').replace(/^\[|\]$/g, '').split(/[,，]/).map(x => x.trim()).filter(Boolean);
    const entry = { bible: path.relative(path.resolve(root, '..'), f).split(path.sep).join('/'), moods: list(fm['表情']) };
    speakers[fm['姓名']] = entry;
    for (const alias of list(fm['名牌别称'])) speakers[alias] = { ...entry, aliasOf: fm['姓名'] };
  }
  // 非人物名牌（如“路牌”）：bible/物品/ 下带“名牌”字段的页
  const itemsDir = path.join(bibleDir, '物品');
  if (fs.existsSync(itemsDir)) for (const f of walk(itemsDir).filter(f => f.endsWith('.md'))) {
    const fm = frontmatter(fs.readFileSync(f, 'utf8'));
    if (!fm['名牌']) continue;
    speakers[fm['名牌']] = { bible: path.relative(path.resolve(root, '..'), f).split(path.sep).join('/'), moods: [], kind: fm['类型'] || '物品' };
  }
  fs.writeFileSync(speakersPath, JSON.stringify({ 说明: '由 tools_story/build_ink.cjs 从 xiaojianghu/bible/人物/（及 bible/物品/ 的名牌）生成，不手改', speakers }, null, 2) + '\n');
} else if (fs.existsSync(speakersPath)) {
  speakers = JSON.parse(fs.readFileSync(speakersPath, 'utf8')).speakers; warn('speakers', '未找到设定圣经，沿用上次生成的 speakers.json');
} else { speakers = {}; err('speakers', '找不到设定圣经 xiaojianghu/bible/人物/，也没有 speakers.json'); }

// 2026-10-19：允许按批次分文件（flags*.json、externals*.ink），多人并行时互不覆盖；同名标记或函数重复登记会报错
const flagsReg = {};
for (const f of fs.readdirSync(shared).filter(f => /^flags.*\.json$/.test(f)).sort()) {
  for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(path.join(shared, f), 'utf8')).flags || {})) { if (flagsReg[k]) err(f, `标记 ${k} 已在别的登记表里登记`); flagsReg[k] = v; }
}
const externalsSrc = fs.readdirSync(shared).filter(f => /^externals.*\.ink$/.test(f)).sort().map(f => fs.readFileSync(path.join(shared, f), 'utf8')).join('\n');
const declared = new Set([...externalsSrc.matchAll(/^EXTERNAL\s+(\w+)\s*\(/gm)].map(m => m[1]));
const PARTS = ['开始', '培养', '游历', '终局'];
const partOf = f => { const d = rel(f).split('/')[0]; const i = ['01-开始', '02-培养', '03-游历', '04-终局'].indexOf(d); return i < 0 ? null : PARTS[i]; };

// ── 逐文件：静态检查（§4.4、§8.2）＋编译 ──
const allIds = new Map(), lines = [], usage = {}, compiled = [];
for (const f of inks) {
  const src = fs.readFileSync(f, 'utf8'), name = rel(f), part = partOf(f);
  if (!part) err(name, '剧本必须放在 01-开始/02-培养/03-游历/04-终局 之一');
  // 剧情三道关·第一关（2026-10-19）：每个剧本文件头必须写戏眼（谁想要什么、什么挡着、散场时什么变了）
  if (!/^\/\/\s*戏眼[:：]\s*\S/m.test(src)) err(name, '文件头缺少“// 戏眼：……”（谁想要什么、什么挡着、散场时什么变了），先写戏眼再写台词');
  let knot = null;
  const inkFns = new Set([...src.matchAll(/^={2,}\s*function\s+(\w+)/gm)].map(m => m[1]));
  const calls = {}, fnReads = {}; // 谁调用了哪些 ink 函数、ink 函数里读了哪些标记（路线遍历按调用关系把标记算到 knot 头上）
  src.split('\n').forEach((raw, i) => {
    const ln = i + 1, line = raw.replace(/\/\/.*$/, '').trim();
    const fk = line.match(/^={2,}\s*function\s+(\w+)/); if (fk) { knot = 'function:' + fk[1]; return; }
    const k = line.match(/^={2,}\s*(\w+)\s*={0,}/); if (k) { knot = k[1]; return; }
    for (const m of line.matchAll(/\b(\w+)\s*\(/g)) if (/^~|\{/.test(line) || line.includes('~')) {
      const fn = m[1]; if (inkFns.has(fn)) { (calls[knot] ||= new Set()).add(fn); continue; } if (['not', 'and', 'or'].includes(fn)) continue;
      if (!declared.has(fn) && !/^(CHOICE_COUNT|TURNS|TURNS_SINCE|SEED_RANDOM|RANDOM|INT|FLOAT|FLOOR|LIST_\w+)$/.test(fn)) err(`${name}:${ln}`, `调用了未声明的游戏函数 ${fn}（先在 _共用/externals.ink 声明）`);
    }
    for (const m of line.matchAll(/\b(set_flag|flag)\(\s*"([^"]+)"\s*(?:,\s*([^)]+))?\)/g)) {
      const [, fn, p, val] = m, reg = flagsReg[p];
      (usage[p] ||= { set: new Set(), read: new Set(), parts: new Set(), readKnots: new Set() })[fn === 'set_flag' ? 'set' : 'read'].add(name);
      usage[p].parts.add(part);
      if (fn === 'flag') { if (knot && knot.startsWith('function:')) (fnReads[knot.slice(9)] ||= new Set()).add(p); else usage[p].readKnots.add(`${name}#${knot}`); }
      if (!reg) { err(`${name}:${ln}`, `标记 ${p} 没有在 flags.json 登记`); continue; }
      if (fn === 'set_flag') { const v = JSON.parse(val.trim()); if (!reg.values.some(x => x === v)) err(`${name}:${ln}`, `标记 ${p} 设成了 ${val.trim()}，不在登记取值 ${JSON.stringify(reg.values)} 内`); }
      if (reg.part && part && PARTS.indexOf(part) < PARTS.indexOf(reg.part)) err(`${name}:${ln}`, `标记 ${p} 属于“${reg.part}”，不能在更早的“${part}”里使用`);
    }
    if (!line || /^(~|\*|\+|-|=|\{|\}|INCLUDE|EXTERNAL|VAR|CONST|#)/.test(line)) return;
    const text = line.replace(/\s#.*$/, '').trim(), tags = [...line.matchAll(/#\s*([^#]+)/g)].map(m => m[1].trim());
    const id = (tags.find(t => t.startsWith('id:')) || '').slice(3), mood = (tags.find(t => t.startsWith('mood:')) || '').slice(5);
    const sp = text.match(/^([^：【（]{1,12})：/), who = sp ? sp[1] : text.startsWith('【') ? '' : null;
    if (who === null) err(`${name}:${ln}`, `这一行没有说话人（写成“人名：台词”，字幕用【】）：${text.slice(0, 30)}`);
    else if (who && !speakers[who]) err(`${name}:${ln}`, `说话人“${who}”不在设定圣经 bible/人物/ 里`);
    if (!id) err(`${name}:${ln}`, '台词缺少编号 #id:');
    else if (allIds.has(id)) err(`${name}:${ln}`, `编号 ${id} 重复（已用于 ${allIds.get(id)}）`);
    else allIds.set(id, `${name}:${ln}`);
    if (mood && who && speakers[who] && !speakers[who].moods.includes(mood)) err(`${name}:${ln}`, `${who} 没有表情 ${mood}（圣经登记：${speakers[who].moods.join('、') || '无'}）`);
    lines.push({ id, part, file: name, knot, who, mood, text: sp ? text.slice(sp[0].length) : text.replace(/^【|】$/g, '') });
  });
  // ink 函数里读的标记，算到（直接或间接）调用它的 knot 头上
  for (const k of Object.keys(calls)) {
    if (k.startsWith('function:')) continue;
    const seen = new Set(), todo = [...calls[k]];
    while (todo.length) { const fn = todo.pop(); if (seen.has(fn)) continue; seen.add(fn); todo.push(...(calls['function:' + fn] || [])); for (const p of fnReads[fn] || []) usage[p]?.readKnots.add(`${name}#${k}`); }
  }
  // 编译（INCLUDE 相对本文件所在目录）
  const compiler = new inkjs.Compiler(src, new inkjs.CompilerOptions(f, [], false, (m, t) => { (t === 2 ? err : warn)(name, String(m)) }, new PosixFileHandler(path.dirname(f) + '/')));
  let json = null; try { const story = compiler.Compile(); json = story && story.ToJson(); } catch (e) { err(name, '编译失败：' + (e.message || e)); }
  const knots = [...src.matchAll(/^={2,}\s*(\w+)/gm)].map(m => m[1]).filter(k => k !== 'function');
  // 隧道 knot（以 ->-> 返回）只能被别的 knot 调用，不单独遍历
  const bodies = src.split(/^(?==={2,})/m), tunnels = new Set();
  const allParams = [...src.matchAll(/^VAR\s+(\w+)\s*=\s*(true|false)\s*\/\/\s*参数/gm)].map(m => m[1]), params = {};
  for (const b of bodies) {
    const k = b.match(/^={2,}\s*(\w+)/); if (!k || k[1] === 'function') continue;
    if (/^\s*->->/m.test(b)) tunnels.add(k[1]);
    params[k[1]] = allParams.filter(v => new RegExp('\\b' + v + '\\b').test(b.replace(/\/\/.*$/gm, ''))); // 参数只在用到它的 knot 里分真假
  }
  if (json && knots.length) compiled.push({ file: name, knots, tunnels, params, json, src });
}

// ── 标记断线检查（§8.2）──
for (const [p, reg] of Object.entries(flagsReg)) {
  const u = usage[p], legacy = (reg.legacyRead || []).length > 0;
  if (!u) { warn('flags.json', `登记的标记 ${p} 在剧本里没有用到`); continue; }
  const extSet = reg.setByExternal || [];
  for (const e of extSet) { const fn = e.match(/^\w+/)?.[0]; if (fn && !declared.has(fn)) err('flags.json', `标记 ${p} 登记由游戏函数 ${fn} 设置，但该函数没有在 externals.ink 声明`); }
  if (u.read.size && !u.set.size && !reg.legacySet && !extSet.length) err('flags.json', `标记 ${p} 被读取，但没有任何剧本或游戏函数设置它（登记 setByExternal 或 legacySet）`);
  if (u.set.size && !u.read.size && !legacy && !reg.recordOnly) err('flags.json', `标记 ${p} 被设置，但没有任何地方读取（断线；若由未迁移的 JS 读取，请登记 legacyRead）`);
}

// ── 路线遍历（§8.3）──
const routesDir = path.join(root, 'docs', 'story-routes'); fs.mkdirSync(routesDir, { recursive: true });
const ROUTE_CAP = 400;
function routesOf(json, knot, file, params, covered) {
  // 读到标记才分支：只对本 knot（含它调用的 ink 函数）里读取的标记按登记取值（routeValues 优先）分支；其余标记取默认值。
  // 选项同样逐一分支。用“决策序列”重放的方式穷举，参数变量（VAR x = false // 参数）按真假各跑一遍。
  const branchable = new Set(Object.keys(usage).filter(p => flagsReg[p] && usage[p].readKnots.has(`${file}#${knot}`)));
  const norm = v => v == null ? false : v;
  const paramCombos = params.reduce((acc, v) => acc.flatMap(c => [false, true].map(x => ({ ...c, [v]: x }))), [{}]);
  const out = []; let truncated = false;
  for (const pc of paramCombos) {
    const stack = [[]];
    while (stack.length) {
      if (out.length >= ROUTE_CAP) { truncated = true; break; }
      const prefix = stack.pop(), decisions = [], flags = {}, picks = [], calls = [], text = [];
      const decide = n => {
        let i;
        if (decisions.length < prefix.length) i = prefix[decisions.length];
        else { i = 0; for (let k = n - 1; k >= 1; k--) stack.push([...decisions, k]); }
        decisions.push(i); return i;
      };
      const story = new inkjs.Story(json);
      for (const fn of declared) story.BindExternalFunction(fn, (...a) => {
        if (fn === 'flag') {
          const p = a[0];
          if (p in flags) return norm(flags[p]);
          if (branchable.has(p)) { const vals = flagsReg[p].routeValues || flagsReg[p].values; const v = vals[decide(vals.length)]; flags[p] = v; picks.push(`${p}=${JSON.stringify(v)}`); return norm(v); }
          return norm(flagsReg[p]?.default);
        }
        if (fn === 'set_flag') flags[a[0]] = a[1];
        calls.push(`${fn}(${a.map(x => JSON.stringify(x)).join(', ')})`); return null;
      }, fn === 'flag');
      for (const [v, val] of Object.entries(pc)) story.variablesState[v] = val;
      const pushCalls = () => { if (calls.length) { text.push(...calls.map(c => '  〔' + c + '〕')); calls.length = 0; } };
      try {
        story.ChoosePathString(knot);
        while (true) {
          while (story.canContinue) {
            const t = story.Continue().trim(); pushCalls();
            const id = (story.currentTags || []).find(x => x.startsWith('id:')); if (id) covered.add(id.slice(3).trim());
            if (t) text.push(t);
          }
          pushCalls();
          if (!story.currentChoices.length) break;
          const i = decide(story.currentChoices.length), c = story.currentChoices[i];
          text.push(`  ▶ 选：${c.text}`); picks.push(`选：${c.text}`); story.ChooseChoiceIndex(i);
        }
        if (story.state.currentErrors?.length) err(knot, '运行出错：' + story.state.currentErrors.join('；'));
        out.push({ params: pc, picks, text });
      } catch (e) { err(knot, `路线 ${JSON.stringify(pc)} ${picks.join('，')} 运行出错：${e.message || e}`); }
    }
  }
  if (truncated) warn(knot, `路线超过 ${ROUTE_CAP} 条，路线文件已截断（覆盖检查仍以已遍历路线为准）`);
  return out;
}

// ── 已批准剧本的指纹闸门（§8.4）──
const apprPath = path.join(shared, 'approved.json');
const appr = fs.existsSync(apprPath) ? JSON.parse(fs.readFileSync(apprPath, 'utf8')) : { 说明: '', files: {} };
appr.说明 = '用户审过的剧本指纹（迁移方案 §8.4）。改动已批准的剧本会让构建停止并列出改动，用户确认后运行 node tools_story/build_ink.cjs --approve <文件> 更新。不手改。';
const snapDir = path.join(shared, 'approved');
const approveArg = process.argv.indexOf('--approve') >= 0 ? process.argv[process.argv.indexOf('--approve') + 1] : null;
for (const c of compiled) {
  const h = sha(c.src), a = appr.files[c.file];
  if (approveArg && (approveArg === 'all' || approveArg === c.file)) {
    appr.files[c.file] = { sha256: h, approvedAt: new Date().toISOString().slice(0, 10) };
    fs.mkdirSync(path.dirname(path.join(snapDir, c.file)), { recursive: true }); fs.writeFileSync(path.join(snapDir, c.file), c.src);
    console.log('已登记批准：' + c.file); continue;
  }
  if (a && a.sha256 !== h) {
    const old = fs.existsSync(path.join(snapDir, c.file)) ? fs.readFileSync(path.join(snapDir, c.file), 'utf8').split('\n') : [];
    const now = c.src.split('\n'), gone = old.filter(l => !now.includes(l)), added = now.filter(l => !old.includes(l));
    err(c.file, `已批准的剧本被改动，需要用户确认。\n    删去：\n${gone.map(l => '      - ' + l).join('\n') || '      （无）'}\n    新增：\n${added.map(l => '      + ' + l).join('\n') || '      （无）'}`);
  }
}
fs.writeFileSync(apprPath, JSON.stringify(appr, null, 2) + '\n');

// ── 路线遍历与覆盖检查（§8.3）：每句台词至少要被一条路线走到 ──
const routeDocs = [];
if (!errors.length) for (const c of compiled) {
  const covered = new Set();
  for (const k of c.knots) {
    if (c.tunnels.has(k)) continue;
    routeDocs.push({ k, file: c.file, routes: routesOf(c.json, k, c.file, c.params[k] || [], covered) });
  }
  const missed = lines.filter(l => l.file === c.file && l.id && !covered.has(l.id)).map(l => l.id);
  if (missed.length) err(c.file, `路线遍历没有走到这些台词（死路或条件永远不成立）：${missed.join('、')}`);
}

// ── 输出 ──
if (!errors.length) {
  fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true });
  for (const c of compiled) fs.writeFileSync(path.join(outDir, c.knots[0] + '.js'), `// 生成物：由 story/${c.file} 经 tools_story/build_ink.cjs 编译，不手改\nwindow.STORY_DATA=window.STORY_DATA||{};window.STORY_EXTERNALS=${JSON.stringify([...declared])};${c.knots.map(k => `STORY_DATA[${JSON.stringify(k)}]=`).join('')}${c.json};\n`);
  for (const f of fs.readdirSync(routesDir)) if (f.endsWith('.md')) fs.rmSync(path.join(routesDir, f));
  for (const { k, file, routes } of routeDocs)
    fs.writeFileSync(path.join(routesDir, k + '.md'), `# 路线：${k}（${file}）\n\n生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 ${routes.length} 条路线。\n\n` +
      routes.map((r, i) => `## 路线 ${i + 1}：${[...Object.entries(r.params).map(([p, v]) => `${p}=${v}`), ...r.picks].join('，') || '（无分支）'}\n\n${r.text.map(t => t.startsWith('  ') ? t : '- ' + t).join('\n')}\n`).join('\n'));
  const csv = ['编号,部分,剧本,场景,说话人,表情,台词', ...lines.map(l => [l.id, l.part, l.file, l.knot, l.who, l.mood, l.text].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  fs.writeFileSync(path.join(root, 'docs', 'story-lines.csv'), '﻿' + csv + '\n');
}
for (const w of warns) console.warn('提示  ' + w);
for (const e of errors) console.error('错误  ' + e);
console.log(JSON.stringify({ status: errors.length ? 'fail' : 'pass', scripts: compiled.length, lines: lines.length, flags: Object.keys(flagsReg).length, approved: Object.keys(appr.files).length, errors: errors.length, warnings: warns.length }));
process.exit(errors.length ? 1 : 0);
