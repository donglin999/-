// 把原版 ink 搬到 Godot 版 story/（2026-11-12；原版不再更新，要改的剧本先搬过来再改）。用法：node tools/ink_move.cjs <文件名.ink> …
// 先验证原版重编结果和 Godot 版现有数据一致（不一致就不搬）；入口已被 Godot 版别的剧本接管的不搬；已在 story/ 里的跳过。不改 game/data/story。
const fs = require('node:fs'), path = require('node:path');
const R = path.join(__dirname, '../..');
const INK = path.join(R, 'xiaojianghu-legacy-prologue/tools_story/ink/node_modules/inkjs/dist');
const inkjs = require(path.join(INK, 'ink-full.js'));
const { PosixFileHandler } = require(path.join(INK, 'inkjs-full-posixhandler.js'));
const SRC = path.join(R, 'xiaojianghu-legacy-prologue/story/01-开始'), DST = path.join(R, 'xiaojianghu-godot/story'), OUT = path.join(R, 'xiaojianghu-godot/game/data/story');
const idx = JSON.parse(fs.readFileSync(path.join(OUT, 'index.json'), 'utf8'));
let bad = 0;
for (const f of process.argv.slice(2)) {
  if (fs.existsSync(path.join(DST, f))) { console.log(f, '已在 Godot 版 story/，直接改它'); continue }
  const file = path.join(SRC, f);
  if (!fs.existsSync(file)) { console.log(f, '原版里没有这个文件'); bad++; continue }
  const src = fs.readFileSync(file, 'utf8');
  const knots = [...src.matchAll(/^===\s*(\w+)\s*===/gm)].map(m => m[1]);
  const over = knots.filter(k => String(idx.knots[k] || '').startsWith('gd_'));
  if (over.length) { console.log(f, '【不搬】这些入口已被 Godot 版别的剧本接管：', over.join(' ')); bad++; continue }
  const errs = [];
  const c = new inkjs.Compiler(src, new inkjs.CompilerOptions(file, [], false, (m, t) => { if (t === 2) errs.push(String(m)) }, new PosixFileHandler(SRC + '/')));
  let j = null; try { j = c.Compile().ToJson() } catch (e) { errs.push(String(e)) }
  if (errs.length || !j) { console.log(f, '【不搬】原版编译报错', errs.join('；')); bad++; continue }
  const tgt = idx.knots[knots[0]], cp = tgt && path.join(OUT, tgt + '.json');
  const cur = cp && fs.existsSync(cp) ? fs.readFileSync(cp, 'utf8') : null;
  if (!cur || JSON.stringify(JSON.parse(j)) !== JSON.stringify(JSON.parse(cur))) { console.log(f, '【不搬】原版重编结果和 Godot 版现有数据不一致（' + tgt + '）'); bad++; continue }
  const head = '// ' + new Date().toISOString().slice(0, 10) + ' 从原版 xiaojianghu-legacy-prologue/story/01-开始/' + f + ' 搬到 Godot 版（原版不再更新）；此后以本文件为准，由 tools/build_story.cjs 编译。\n';
  fs.writeFileSync(path.join(DST, f), head + src.replace(/^INCLUDE \.\.\/_共用\//gm, 'INCLUDE _共用/'));
  console.log(f, '已搬到 xiaojianghu-godot/story/');
}
process.exit(bad ? 1 : 0);
