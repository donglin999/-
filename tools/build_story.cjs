// Godot 版自有剧本：把 xiaojianghu-godot/story/*.ink 编译成 game/data/story/<文件名>.json，并把其中的入口 knot 登记进 index.json。
// 2026-11-04 起只更新 Godot 版；原版导出的剧本（tools/extract_story.cjs）不再重跑，新台词写在本目录 story/ 下。
// 编译器借用原版目录里已装好的 inkjs（只读引用，不改原版）。用法：node tools/build_story.cjs
const fs = require('node:fs');
const path = require('node:path');
const INK = path.join(__dirname, '../../xiaojianghu-legacy-prologue/tools_story/ink/node_modules/inkjs/dist');
const inkjs = require(path.join(INK, 'ink-full.js'));
const { PosixFileHandler } = require(path.join(INK, 'inkjs-full-posixhandler.js'));
const SRC = path.join(__dirname, '../story');
const OUT = path.join(__dirname, '../game/data/story');
const idxPath = path.join(OUT, 'index.json');
const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
let bad = 0;
for (const f of fs.readdirSync(SRC).filter(n => n.endsWith('.ink'))) {
  const file = path.join(SRC, f);
  const src = fs.readFileSync(file, 'utf8');
  const knots = [...src.matchAll(/^===\s*(\w+)\s*===/gm)].map(m => m[1]);
  if (!knots.length) continue;
  const out = 'gd_' + knots[0];   // 以第一个 knot 命名，前缀 gd_ 与原版导出的文件区分
  const errs = [];
  const c = new inkjs.Compiler(src, new inkjs.CompilerOptions(file, [], false, (m, t) => { if (t === 2) errs.push(String(m)); else console.warn(f, String(m)) }, new PosixFileHandler(SRC + '/')));
  let json = null;
  try { const s = c.Compile(); json = s && s.ToJson() } catch (e) { errs.push(e.message || String(e)) }
  if (errs.length || !json) { bad++; console.error(f, '编译失败：', errs.join('；')); continue }
  fs.writeFileSync(path.join(OUT, out + '.json'), json);
  for (const k of knots) {
    if (idx.knots[k] && idx.knots[k] !== out) console.warn(f, '覆盖已有入口', k, idx.knots[k], '→', out);
    idx.knots[k] = out;
  }
  // 2026-11-11 剧本里删掉的入口也从登记里拿掉（原来只加不减，删了 fq_steward 等三段后登记还指着它们，全分支扫荡报“找不到入口”）
  for (const k of Object.keys(idx.knots)) if (idx.knots[k] === out && !knots.includes(k)) { delete idx.knots[k]; console.log(f, '入口已删', k); }
  console.log(f, '→', out + '.json', knots.join(' '));
}
fs.writeFileSync(idxPath, JSON.stringify(idx, null, 1));
process.exit(bad ? 1 : 0);
