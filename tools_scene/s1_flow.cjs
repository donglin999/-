// S1 重建场景流程冒烟（真实寻路行走 + 键盘推进对话 + 自动战斗）
// 前提：本地静态服务器 http://localhost:8123
// 用法：node tools_scene/s1_flow.cjs [截图目录=review/scene_v4/s1flow]
// 一、序章：标题「初入江湖」→ 建角 → 羊太傅庙（开场运镜：先看神龛，再落到主角）→ 参拜 / 烤火 → 出庙（庙外空地台阶下、朝下）
//     → 古井 → 老僧教学战 → 学武 → 下山 → 大地图选襄阳 → 南门（mapIn 入场、朝上）→ 桥头军士盘查 → 进城（街市南大街底、朝上）
// 二、黑风寨：大地图进寨门（mapIn、朝上）→ 挖酒 → 守寨喽啰（亮令牌）→ 进寨（山洞洞口、朝上）→ 账桌 / 山川图 → 巨蟒 → 独眼阎罗（头目战）→ 章末
// 三、尾声站位（02 §4.1）与战败回庙点可站；五个场景旧档坐标迁移后可站、不在出口区、可寻路
const PW = '/private/tmp/claude-501/pw/node_modules/playwright';
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const { chromium } = require(PW);
const fs = require('fs');
const [out = 'review/scene_v4/s1flow'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const log = []; let fails = 0;
const L = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); log.push(s); console.log(s); if (s.startsWith('✗')) fails++ };
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()) });
  const autoBattle = () => p.evaluate(() => {
    if (window.__auto) return;
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
  const st = () => p.evaluate(() => ({ scene: S.scene, c: +(player.x / TS).toFixed(2), r: +(player.y / TS).toFixed(2), dir: player.dir, mode, busy, dlg: dlgBusy }));
  async function drive(choices = [], maxMs = 90000, stopMode) {
    const t0 = Date.now(); let ci = 0;
    while (Date.now() - t0 < maxMs) {
      const s = await p.evaluate(() => ({ m: mode, busy, dlg: dlgBusy, ch: !!document.querySelector('#dlg .choices button'), panel: !document.getElementById('panel').hidden }));
      if (stopMode && s.m === stopMode) return true;
      if (s.m === 'scene' && !s.busy && !s.dlg && !s.panel) return true;
      if (s.m === 'map' && !s.dlg) return true;
      if (s.m === 'battle' && !s.dlg) { await p.waitForTimeout(300); continue }
      if (s.ch) { await p.keyboard.press(String(choices[ci++] || 1)); await p.waitForTimeout(200); continue }
      await p.keyboard.press('Space'); await p.waitForTimeout(120);
    }
    return false;
  }
  async function talkTo(id, choices, stopMode) {
    const r = await p.evaluate((id) => {
      const n = cur._npcs.find(n => n.id === id); if (!n) return { err: 'no npc ' + id };
      const q = npcPos(n), side = player.x < q.x ? -1 : 1, off = n.sp ? Math.max(34, npcH(n) * .4) : 20;
      const cand = [[q.x + side * off, q.y + 2], [q.x - side * off, q.y + 2], [q.x, q.y + off * .8], [q.x, q.y - off * .6], [q.x, q.y + 30]];
      let path = null; for (const [cx, cy] of cand) { if (standOk(cx, cy) && !npcBlock(cx, cy)) { path = setPath(cx, cy); if (path) break } }
      player.talkTo = path ? n : null; return { path: !!path };
    }, id);
    if (!r.path) { L('✗ 无法寻路到', id, r); return false }
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) { const s = await p.evaluate(() => ({ busy, dlg: dlgBusy, path: !!player.path })); if (s.busy || s.dlg || !s.path) break; await p.waitForTimeout(100) }
    const s1 = await p.evaluate(() => ({ busy, dlg: dlgBusy }));
    if (!s1.busy && !s1.dlg) await p.evaluate((id) => { const n = cur._npcs.find(n => n.id === id); if (n) interact(n) }, id);
    const ok = await drive(choices, 90000, stopMode);
    L(ok ? '✓' : '✗', 'talk', id, await st());
    return ok;
  }
  async function walkExit(to, ms = 40000) {
    await p.evaluate((to) => { player.talkTo = null; const e = exitsOf(cur).find(e => e.to === to); const [c0, r0, c1, r1] = e.r;
      let best = null, bd = 1e9; const tx = (c0 + c1 + 1) / 2 * TS, ty = (r0 + r1 + 1) / 2 * TS;
      for (let y = r0 * TS + 4; y < (r1 + 1) * TS; y += 4) for (let x = c0 * TS + 4; x < (c1 + 1) * TS; x += 4) if (standOk(x, y)) { const d = Math.hypot(x - tx, y - ty); if (d < bd) { bd = d; best = [x, y] } }
      setPath(best[0], best[1]) }, to);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { const s = await p.evaluate(() => ({ m: mode, s: S.scene, busy })); if ((s.m === 'map') || (s.s === to && s.m === 'scene' && !s.busy)) return true; await p.waitForTimeout(150) }
    return false;
  }

  // ═══ 一、序章 ═══
  await p.goto('http://localhost:8123/?t=' + Date.now(), { waitUntil: 'load' });
  await p.evaluate(() => localStorage.removeItem('xjh.save'));
  await p.goto('http://localhost:8123/?t=' + Date.now(), { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && document.getElementById('tn'), null, { timeout: 40000 });
  await autoBattle();
  await p.click('#tn');
  await p.waitForFunction(() => document.getElementById('cgo'), null, { timeout: 10000 });
  for (let i = 0; i < 12 && await p.evaluate(() => document.getElementById('cgo').disabled); i++)   // 分配 6 点属性（轮流点各属性的「+」）
    await p.evaluate((i) => { const bs = [...document.querySelectorAll('[data-p]')]; bs[i % bs.length].click() }, i);
  await p.click('#cgo');
  await p.waitForFunction(() => mode === 'scene' && cur === SC.temple, null, { timeout: 20000 });
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/01_intro.png` });
  const cam0 = await p.evaluate(() => ({ camY: Math.round(cam.y), focusShrine: camIntro ? 1 : 0, player: [+(player.x / TS).toFixed(2), +(player.y / TS).toFixed(2)], stand: standOk(player.x, player.y) }));
  L(cam0.focusShrine && cam0.camY < 200 && cam0.stand && Math.abs(cam0.player[0] - 17.25) < .3 ? '✓' : '✗', '开场运镜：镜头先对准神龛，主角站在篝火边草铺', cam0);
  await drive();
  await p.waitForTimeout(3500);
  await p.screenshot({ path: `${out}/02_awake.png` });
  const cam1 = await p.evaluate(() => ({ intro: !!camIntro, dy: Math.round(cam.y + VH / 2 - (player.y - CHAR_H * .45)), awake: !!S.flags.awake }));
  L(!cam1.intro && cam1.awake && Math.abs(cam1.dy) < 120 ? '✓' : '✗', '运镜结束：镜头回到主角', cam1);
  await talkTo('altar', [1]);
  await talkTo('fire');
  await talkTo('monk_chest');
  let ok = await walkExit('temple_out');
  let s = await st();
  L(ok && s.dir === 'd' && s.r < 15.5 ? '✓' : '✗', '出庙（庙外空地台阶下、朝下）', s);
  await p.screenshot({ path: `${out}/03_temple_out.png` });
  await talkTo('well', [2]);
  await talkTo('stove');
  await talkTo('monk', [1, 1]);
  const sp = await p.evaluate(() => ({ spar: !!S.flags.spar, xy: !!S.unlocked.xiangyang }));
  L(sp.spar && sp.xy ? '✓' : '✗', '教学战 + 学武 + 大地图开启', sp);
  // 断碑（支线互动点，由古井偏移派生）可达
  const stele = await p.evaluate(() => { const n = SC.temple_out.npcs.find(n => n.id === 'q_stele'); if (!n) return { none: 1 }; const x = n.x, y = n.y; return { x: +x.toFixed(2), y: +y.toFixed(2), stand: standOk(x * TS, y * TS), path: !!findPath(x * TS, y * TS) } });
  L(stele.none || (stele.stand && stele.path) ? '✓' : '✗', '断碑互动点可达', stele);
  ok = await walkExit('map');
  L(ok && (await p.evaluate(() => mode)) === 'map' ? '✓' : '✗', '下山 → 大地图');
  await p.waitForFunction(() => typeof mapPick === 'function', null, { timeout: 10000 });
  await p.evaluate(() => mapPick(NODES.find(n => n.id === 'xiangyang')));
  await p.waitForFunction(() => mode === 'scene' && cur === SC.gate && !busy, null, { timeout: 20000 });
  s = await st();
  L(s.dir === 'u' && Math.abs(s.c - 30) < 1 && Math.abs(s.r - 33.5) < 1 ? '✓' : '✗', '大地图 → 南门（官道下方 mapIn 入场、朝上）', s);
  await p.screenshot({ path: `${out}/04_gate.png` });
  await talkTo('gate_notice');
  await talkTo('soldier', [1]);
  L((await p.evaluate(() => !!S.flags.gate_ok)) ? '✓' : '✗', '桥头盘查 gate_ok');
  ok = await walkExit('street', 60000);
  s = await st();
  L(ok && s.dir === 'u' && s.r > 36 ? '✓' : '✗', '进城（街市南大街底、朝上）', s);
  await p.screenshot({ path: `${out}/05_street.png` });

  // ═══ 二、黑风寨 ═══
  await p.evaluate(() => { Object.assign(S.flags, { ferry_ev: 1, gate_ok: 1 }); S.unlocked.bandit = 1; S.bag.token = 1; S.bag.shovel = 1; S.moral = 15; const d = derived(); S.hp = d.mhp; S.mp = d.mmp });
  await p.evaluate(() => { goScene('bgate', NODES.find(n => n.id === 'bandit').at) });
  await p.waitForFunction(() => mode === 'scene' && cur === SC.bgate && !busy, null, { timeout: 20000 });
  await p.waitForTimeout(1500); await p.waitForFunction(() => !busy && !player.anim, null, { timeout: 10000 });
  s = await st();
  L(s.dir === 'u' && Math.abs(s.c - 15.9) < 1 && Math.abs(s.r - 28.05) < 1 ? '✓' : '✗', '大地图 → 寨门（山道下方入场、朝上）', s);
  await p.screenshot({ path: `${out}/06_bgate.png` });
  await talkTo('bgate1');
  L((await p.evaluate(() => !!S.flags.dig_bgate1)) ? '✓' : '✗', '挖出埋酒');
  await talkTo('guard', [1]);
  L((await p.evaluate(() => !!S.flags.gate_pass)) ? '✓' : '✗', '亮令牌过寨门 gate_pass');
  ok = await walkExit('cave');
  s = await st();
  L(ok && s.dir === 'u' && s.r > 25 ? '✓' : '✗', '进寨（山洞洞口、朝上）', s);
  await p.screenshot({ path: `${out}/07_cave.png` });
  await talkTo('ledger'); await talkTo('hidemap');
  await talkTo('snake', [1]);
  L((await p.evaluate(() => !!S.flags.snake)) ? '✓' : '✗', '巨蟒战');
  await p.screenshot({ path: `${out}/08_before_boss.png` });
  await talkTo('chief', [1], 'end');
  await p.waitForTimeout(800);
  const end = await p.evaluate(() => ({ chief: !!S.flags.chief_dead, mode }));
  L(end.chief && end.mode === 'end' ? '✓' : '✗', '独眼阎罗头目战 → 章末', end);
  await p.screenshot({ path: `${out}/09_end.png` });

  // ═══ 三、尾声站位 / 战败回庙 / 旧档迁移 ═══
  await p.goto('http://localhost:8123/?t=' + Date.now() + '#street', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
  const ep = await p.evaluate(() => { cur = SC.temple; buildGrid(cur); const chk = (c, r) => standOk(c * TS, r * TS) && !exitsOf(cur).some(e => inR(Math.floor(c), Math.floor(r), e.r));
    return { monk_end: chk(26.5, 19.5), suzhi_end: chk(20.5, 19.8), door: chk(24, 24), lose: chk(24, 20.5) } });
  L(Object.values(ep).every(Boolean) ? '✓' : '✗', '尾声站位（老僧 26.5,19.5 / 苏芷 20.5,19.8 / 庙门 24,24）与战败回庙点 (24,20.5) 可站', ep);
  const OLD = { temple: [[24, 20.5], [23.5, 19.2], [24, 13.6], [10, 22], [40, 14]], temple_out: [[23.5, 12], [14, 17.8], [27, 15.5], [24, 24.5], [40, 24]],
    gate: [[23.5, 14.2], [27, 15.6], [23.5, 24.5], [2, 20], [45, 18]], bgate: [[12, 24.5], [24, 15], [8, 21], [35, 22]], cave: [[25.5, 21.5], [24, 15.2], [12, 21], [38, 24]] };
  for (const id in OLD) for (const [ox, oy] of OLD[id]) {
    await p.evaluate(([id, ox, oy]) => { const s = JSON.parse(JSON.stringify(S)); Object.assign(s.flags, { awake: 1, spar: 1, gate_ok: 1, gate_pass: 1 }); s.scene = id; s.x = ox * 40; s.y = oy * 40; delete s.mapv; localStorage.setItem('xjh.save', JSON.stringify(s)) }, [id, ox, oy]);
    await p.goto('http://localhost:8123/?t=' + Date.now(), { waitUntil: 'load' });
    await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'title' && document.getElementById('tc'), null, { timeout: 40000 });
    await p.click('#tc');
    await p.waitForFunction((id) => mode === 'scene' && cur === SC[id], id, { timeout: 20000 });
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({ c: +(player.x / TS).toFixed(2), r: +(player.y / TS).toFixed(2), stand: standOk(player.x, player.y), inExit: exitsOf(cur).some(e => inR(Math.floor(player.x / TS), Math.floor(player.y / TS), e.r)),
      mapv: S.mapv && S.mapv[S.scene], path: !!findPath(cur.start[0] * TS, cur.start[1] * TS) }));
    L(r.stand && !r.inExit && r.path && r.mapv === 1 ? '✓' : '✗', '旧档', id, [ox, oy], '→', r);
  }
  L(JSON.stringify({ fails, errors: errs }));
  fs.writeFileSync(`${out}/flow.log`, log.join('\n'));
  await b.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 800) })); process.exit(1); });
