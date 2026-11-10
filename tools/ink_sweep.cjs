// 剧本全分支扫荡（2026-11-05）：把 game/data/story 里登记的每个入口 knot，所有选项分支都走一遍（深度优先，每个分支各走到底）。
// 游戏函数（flag、go_scene……）用替身：flag 先全当“否”走一遍，再全当“是”走一遍；剧本里的真假变量也各翻一次。
// 查：剧本运行报错（跳到不存在的地方、函数没接、变量类型不对……）、走不出来的死循环、一句话都没有就结束的入口、空选项。
// 用法：node tools/ink_sweep.cjs [--out=报告.json] [--knot=只扫某个]   有错误时退出码 1
const fs = require('node:fs');
const path = require('node:path');
const INK = path.join(__dirname, '../../xiaojianghu-legacy-prologue/tools_story/ink/node_modules/inkjs/dist');
const { Story } = require(path.join(INK, 'ink-full.js'));
const DIR = path.join(__dirname, '../game/data/story');
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? '1'] }));
const idx = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
const MAX_PATHS = 400, MAX_DEPTH = 18, MAX_STEPS = 4000;
const report = { tunnels: new Set(), knots: 0, paths: 0, lines: 0, errors: [], warnings: [], empty: [], truncated: [] };
const cache = {};
function load(file) {
  if (!cache[file]) cache[file] = fs.readFileSync(path.join(DIR, file + '.json'), 'utf8').replace(/^﻿/, '');
  return new Story(cache[file]);
}
function bindAll(story, flagValue, errs) {
  const names = new Set(idx.externals || []);
  // 剧本里声明了、索引里没登记的也接上（只取 EXTERNAL 声明）
  try { for (const n of story.listDefinitions ? [] : []) names.add(n) } catch { }
  for (const n of names) {
    try {
      story.BindExternalFunction(n, (...a) => n === 'flag' ? flagValue : (n === 'choose' ? 0 : 0), false);
    } catch (e) { /* 本文件没声明这个函数 */ }
  }
  story.allowExternalFunctionFallbacks = true;
  story.onError = (msg, type) => { (type === 2 ? errs : report.warnings).push(String(msg)) };
}
function boolVars(story) {
  const out = [];
  const vs = story.variablesState;
  for (const name of vs._globalVariables.keys()) {
    const v = vs.$(name);
    if (typeof v === 'boolean') out.push(name);
  }
  return out;
}
function sweepKnot(knot, file, flagValue, flip) {
  const errs = [];
  let story;
  try { story = load(file) } catch (e) { report.errors.push({ knot, err: '剧本载入失败：' + e.message }); return }
  bindAll(story, flagValue, errs);
  if (flip) for (const v of boolVars(story)) story.variablesState.$(v, !story.variablesState.$(v));
  try { story.ChoosePathString(knot) } catch (e) { report.errors.push({ knot, err: '找不到入口：' + e.message }); return }
  const start = story.state.ToJson();
  let paths = 0, lines = 0, truncated = false;
  const stack = [{ s: start, depth: 0, trail: [] }];
  while (stack.length) {
    if (paths >= MAX_PATHS) { truncated = true; break }
    const { s, depth, trail } = stack.pop();
    story.state.LoadJson(s);
    let steps = 0, said = 0;
    try {
      while (story.canContinue) {
        const t = story.Continue();
        if (t.trim()) said++;
        if (++steps > MAX_STEPS) { errs.push(`死循环？走了 ${MAX_STEPS} 句还没停（路线 ${trail.join('>') || '开头'}）`); break }
      }
    } catch (e) {
      // 被别处用 “-> x ->” 当小段调用的 knot（如寒暄 greet_ye_lines），单独当入口走到 ->-> 会报这一句：不是错，记成小段跳过
      if (depth === 0 && /tunnel onwards/.test(e.message)) { report.tunnels.add(knot); paths++; continue }
      errs.push(`${e.message}（路线 ${trail.join('>') || '开头'}）`); paths++; continue
    }
    lines += said;
    const cs = story.currentChoices;
    if (!cs.length || depth >= MAX_DEPTH) { paths++; if (depth >= MAX_DEPTH) truncated = true; if (depth === 0 && said === 0 && !cs.length) report.empty.push(`${knot}（flag=${flagValue}${flip ? '，变量翻转' : ''}）`); continue }
    const here = story.state.ToJson();
    cs.forEach((c, i) => {
      if (!c.text.trim()) errs.push(`空选项（路线 ${trail.join('>') || '开头'}）`);
      story.state.LoadJson(here);
      story.ChooseChoiceIndex(i);
      stack.push({ s: story.state.ToJson(), depth: depth + 1, trail: [...trail, i + 1] });
    });
  }
  report.paths += paths; report.lines += lines;
  if (truncated) report.truncated.push(knot);
  for (const e of [...new Set(errs)]) {
    // 被别处用 “-> x ->” 当小段调用的 knot（如寒暄 greet_ye_lines），单独当入口走到 ->-> 会报这一句：不是错，记成小段
    if (/tunnel onwards statement/.test(e)) { report.tunnels.add(knot); continue }
    report.errors.push({ knot, mode: `flag=${flagValue}${flip ? '，变量翻转' : ''}`, err: e });
  }
}
const knots = Object.entries(idx.knots).filter(([k]) => !args.knot || k === args.knot);
for (const [knot, file] of knots) {
  report.knots++;
  for (const fv of [false, true]) for (const flip of [false, true]) sweepKnot(knot, file, fv, flip);
}
// 同一句话的 #id 不该在两处出现（台词核对、配音都按 id 找）
report.empty = [...new Set(report.empty)];
report.tunnels = [...report.tunnels];
console.log(`剧本扫荡：${report.knots} 个入口，${report.paths} 条路线，${report.lines} 句；错误 ${report.errors.length} 条，提示 ${report.warnings.length} 条，空入口 ${report.empty.length} 个，小段 ${report.tunnels.length} 个，分支太多只走了一部分 ${report.truncated.length} 个`);
for (const e of report.errors.slice(0, 40)) console.log('  【错误】', e.knot, e.mode || '', e.err);
if (args.out) { fs.mkdirSync(path.dirname(args.out), { recursive: true }); fs.writeFileSync(args.out, JSON.stringify(report, null, 1)) }
process.exit(report.errors.length ? 1 : 0);
