// 街市主线 + 出口 + 旧档迁移 冒烟测试（真实寻路行走 + 键盘推进对话 + 自动战斗）
// 前提：本地静态服务器 http://localhost:8123
// 用法：node tools_scene/street_flow.cjs [截图目录=review/scene_v2/flow]
// 流程：#street 进场 → 走到挑夫老周身旁交谈（触发青蚨散）→ 包打听（赊消息，线索 1）→ 线索 2 直接置位 → 走到疤脸刘对质
//      → 两场战斗（敌人血量压到 1 自动打）→ 处置 → 把解药交给苏芷 → 入队；
//      跟随同伴不参与 E/空格 目标；再走南门出口（南大街向下）→ 城门场景（从门洞向下走出）→ 进城回街市（从南大街底向上走进） → 走偏巷出口 → 偏巷 → 回街市；最后写入旧版坐标存档，读档验证迁移后可站。
const PW = '/private/tmp/claude-501/pw/node_modules/playwright';
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const { chromium } = require(PW);
const fs = require('fs');
const [out = 'review/scene_v3/flow', entry = '#street'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const log = [];
const L = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); log.push(s); console.log(s) };
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()) });
  await p.goto('http://localhost:8123/?t=' + Date.now() + entry, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
  // 页面内自动战斗：敌人血量压到 1，轮到我方就普攻
  await p.evaluate(() => {
    window.__auto = setInterval(() => {
      if (mode !== 'battle' || !B) return;
      for (const f of B.foes) if (f.hp > 1) f.hp = 1;
      const w = document.getElementById('bt-win'); if (w) { w.dispatchEvent(new PointerEvent('pointerdown')); return }
      if (!B.key || dlgBusy) return;
      const cmd = document.getElementById('bt-cmd'), hd = cmd && cmd.querySelector('.hd span'), t = hd ? hd.textContent : '';
      if (cmd && !cmd.hidden && /回合/.test(t)) { B.key('n1'); return }
      B.key('ok');
    }, 250);
  });
  const st = () => p.evaluate(() => ({ scene: S.scene, x: Math.round(player.x), y: Math.round(player.y), xq: S.flags.xq || 0, mode, busy, dlg: dlgBusy, party: S.party, q: questLine() }));
  // 推进对话：choices 为依次选择的下标（1 起的数字键）
  async function drive(choices = [], maxMs = 60000) {
    const t0 = Date.now(); let ci = 0;
    while (Date.now() - t0 < maxMs) {
      const s = await p.evaluate(() => ({ m: mode, busy, dlg: dlgBusy, ch: !!document.querySelector('#dlg .choices button'), panel: !document.getElementById('panel').hidden }));
      if (s.m === 'scene' && !s.busy && !s.dlg && !s.panel) return true;
      if (s.m === 'battle' && !s.dlg) { await p.waitForTimeout(300); continue }
      if (s.ch) { await p.keyboard.press(String(choices[ci++] || 1)); await p.waitForTimeout(200); continue }
      await p.keyboard.press('Space'); await p.waitForTimeout(120);
    }
    return false;
  }
  // 真实寻路走到 NPC 身旁并交谈（与点击 NPC 相同的逻辑）
  async function talkTo(id, choices) {
    const r = await p.evaluate((id) => {
      const n = cur._npcs.find(n => n.id === id); if (!n) return { err: 'no npc ' + id };
      const q = npcPos(n), side = player.x < q.x ? -1 : 1, off = n.sp ? Math.max(34, npcH(n) * .4) : 20;
      const cand = [[q.x + side * off, q.y + 2], [q.x - side * off, q.y + 2], [q.x, q.y + off * .8], [q.x, q.y - off * .6]];
      let path = null; for (const [cx, cy] of cand) { if (standOk(cx, cy) && !npcBlock(cx, cy)) { path = setPath(cx, cy); if (path) break } }
      player.talkTo = path ? n : null; return { path: !!path };
    }, id);
    if (!r.path) { L('✗ 无法寻路到', id, r); return false }
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) { const s = await p.evaluate(() => ({ busy, dlg: dlgBusy, path: !!player.path })); if (s.busy || s.dlg) break; if (!s.path) break; await p.waitForTimeout(100) }
    const s1 = await p.evaluate(() => ({ busy, dlg: dlgBusy }));
    if (!s1.busy && !s1.dlg) { // 没自动开口：距离够近就直接交互
      await p.evaluate((id) => { const n = cur._npcs.find(n => n.id === id); if (n) interact(n) }, id);
    }
    const ok = await drive(choices);
    L(ok ? '✓' : '✗', 'talk', id, await st());
    return ok;
  }
  async function walkTo(x, y, until, ms = 30000) {
    await p.evaluate(([x, y]) => { player.talkTo = null; return !!setPath(x * TS, y * TS) }, [x, y]);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (await p.evaluate(until)) return true; await p.waitForTimeout(150) }
    return false;
  }
  L('进场', await st());
  await p.screenshot({ path: `${out}/01_enter.png` });
  await talkTo('zhou', [1]);                       // 蹲下帮她按住挑夫
  await talkTo('gossip', [3]);                     // 赊着
  await p.evaluate(() => { clueGot('lady', '疤脸刘碰过老周的茶碗') });
  await p.waitForFunction(() => (S.flags.xq || 0) >= 2, null, { timeout: 10000 }); await p.waitForTimeout(300); await drive();
  L('线索', await st());
  await p.screenshot({ path: `${out}/02_clues.png` });
  await talkTo('liu', [3, 1]);                     // 撸起袖子 → 两场战斗 → 「滚」
  L('对质后', await st());
  await talkTo('suzhi', [1, 2, 1]);                // 留着买药 / 不追问 / 一起走吧
  L('交药后', await st());
  await p.screenshot({ path: `${out}/03_after.png` });
  // 跟随同伴不可被 E/空格 选中（02 §3.5）
  const fn = await p.evaluate(() => { const f = followers[0]; if (!f) return { none: 1 }; player.x = f.x + 20; player.y = f.y; const n = nearest(); return { party: S.party, near: n ? n.type + ':' + (n.o.id || '') : null } });
  L(fn.none || fn.near === null || (fn.near && !fn.near.startsWith('comp')) ? '✓' : '✗', '同伴不参与交互目标', fn);
  // 出口：南门（南大街向下出图）；到城门场景应在门洞口、朝下
  const sx = await p.evaluate(() => { const e = SC.street.exits.find(e => e.to === 'gate'); return [(e.r[0] + e.r[2]) / 2 + .5, e.r[1] + .6] });
  let ok = await walkTo(sx[0], sx[1], () => S.scene === 'gate' && mode === 'scene' && !busy, 40000);
  const g1 = await st(); const gd = await p.evaluate(() => player.dir);
  L(ok && gd === 'd' && g1.y < 18 * 40 ? '✓' : '✗', '南门出口（到城门门洞口、朝下）', g1, gd);
  await p.waitForTimeout(600);
  const gx = await p.evaluate(() => { const e = SC.gate.exits.find(e => e.to === 'street'); return [(e.r[0] + e.r[2]) / 2 + .5, e.r[1] + .5] });
  ok = await walkTo(gx[0], gx[1], () => S.scene === 'street' && mode === 'scene' && !busy, 40000);
  const s2 = await st(), sd = await p.evaluate(() => player.dir);
  L(ok && sd === 'u' && s2.y > 36 * 40 ? '✓' : '✗', '进城回街市（在南大街底、朝上）', s2, sd);
  await p.waitForTimeout(600);
  ok = await walkTo(65.6, 24, () => S.scene === 'alley' && mode === 'scene' && !busy, 60000);
  L(ok ? '✓' : '✗', '偏巷出口', await st());
  await p.waitForTimeout(600);
  ok = await walkTo(0.3, 20.4, () => S.scene === 'street' && mode === 'scene' && !busy, 40000);
  L(ok ? '✓' : '✗', '偏巷回街市', await st());
  await p.screenshot({ path: `${out}/04_back.png` });
  // 旧档迁移：旧 48×27 街市坐标（包打听旧位置、城门旧位置、旧地图东南角墙里）
  // 另加 v2 存档（mapv.street=2）站在旧北门门洞 / 旧入场点：应原地吸附到可站点
  for (const [ox, oy, v] of [[34.1, 18.6], [23.4, 24], [44, 25.5], [10, 12], [33, 11.4, 2], [33, 14.6, 2]]) {
    await p.evaluate(([ox, oy, v]) => { const s = JSON.parse(JSON.stringify(S)); s.scene = 'street'; s.x = ox * 40; s.y = oy * 40; if (v) s.mapv = { street: v }; else delete s.mapv; localStorage.setItem('xjh.save', JSON.stringify(s)) }, [ox, oy, v]);
    await p.goto('http://localhost:8123/?t=' + Date.now(), { waitUntil: 'load' });
    await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'title' && document.getElementById('tc'), null, { timeout: 40000 });
    await p.click('#tc');
    await p.waitForFunction(() => mode === 'scene' && cur === SC.street, null, { timeout: 20000 });
    await p.waitForTimeout(900);
    const r = await p.evaluate(() => ({ x: +(player.x / TS).toFixed(2), y: +(player.y / TS).toFixed(2), stand: standOk(player.x, player.y), mapv: S.mapv, path: !!findPath(33 * TS, 16 * TS) }));
    L(r.stand && r.path ? '✓' : '✗', '旧档', [ox, oy, v || 1], '→', r);
  }
  await p.screenshot({ path: `${out}/05_oldsave.png` });
  L(JSON.stringify({ errors: errs }));
  fs.writeFileSync(`${out}/flow.log`, log.join('\n'));
  await b.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 800) })); process.exit(1); });
