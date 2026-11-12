// 只检查 story/ 下的剧本能不能编译，不写任何文件（2026-11-12）。用法：node tools/ink_check.cjs [文件名.ink …]（不给名字就查全部）
const fs = require('node:fs'), path = require('node:path');
const INK = path.join(__dirname, '../../xiaojianghu-legacy-prologue/tools_story/ink/node_modules/inkjs/dist');
const inkjs = require(path.join(INK, 'ink-full.js'));
const { PosixFileHandler } = require(path.join(INK, 'inkjs-full-posixhandler.js'));
const SRC = path.join(__dirname, '../story');
const names = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(SRC).filter(n => n.endsWith('.ink'));
let bad = 0;
for (const f of names) {
  const file = path.join(SRC, f), errs = [];
  const c = new inkjs.Compiler(fs.readFileSync(file, 'utf8'), new inkjs.CompilerOptions(file, [], false, (m, t) => { if (t === 2) errs.push(String(m)); else console.log(f, '警告', String(m)) }, new PosixFileHandler(SRC + '/')));
  let ok = false; try { ok = !!c.Compile() } catch (e) { errs.push(String(e)) }
  if (errs.length || !ok) { bad++; console.log(f, '【编译失败】', errs.join('；')) } else console.log(f, '编译通过');
}
process.exit(bad ? 1 : 0);
