// 探索场景碰撞 / 交互审计：无头浏览器加载游戏，逐场景用引擎自己的 standOk / navOf 判定，
// 输出可走热图叠图 review/scene_v2/audit_<scene>.png 与问题清单 review/scene_v2/audit.json（控制台同时打印摘要）。
// 前提：本地静态服务器 http://localhost:8123
// 用法：node tools_scene/audit.cjs [输出目录=review/scene_v2] [场景id...]
// 叠图图例：绿=可走且与入场点连通；黄=可走但不连通（孤岛，通常是「奇怪位置」）；红框=粗格/mask 边界外的剧情点；
//          蓝框=出口区；白圈=NPC（实心=其 80px 交互圈内有可达站位，×=不可达）；青点=入场点(start/各出口 at/大地图 at)；橙点=路人站位不可站
const PW = '/private/tmp/claude-501/pw/node_modules/playwright';
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const { chromium } = require(PW);
const fs = require('fs');
const [out = 'review/scene_v4/audit', ...only] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8123/?t=' + Date.now() + '#street', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
  const ids = only.length ? only : Object.keys(await p.evaluate(() => Object.fromEntries(Object.keys(SC).map(k => [k, 1]))));
  const report = {};
  for (const id of ids) {
    const r = await p.evaluate((id) => {
      const sc = SC[id]; cur = sc; buildGrid(sc); S.scene = id; if (sc.mapv) (S.mapv = S.mapv || {})[id] = sc.mapv; if (typeof setDims === 'function') setDims(sc);
      const st = sc.start; player.x = st[0] * TS; player.y = st[1] * TS; player.trail = []; spawnWanderers(); cur._nav = null;
      const WWs = (typeof sceneW === 'function') ? sceneW(sc) : WW, WHs = (typeof sceneH === 'function') ? sceneH(sc) : WH;
      const nav = navOf(), { NS, nw, nh, ok } = nav;
      // 入场点集合
      const arr = [['start', st]];
      for (const k in SC) for (const e of (SC[k].exits || [])) if (e.to === id && e.at) arr.push([k + '→', e.at]);
      if (typeof NODES !== 'undefined') for (const n of NODES) if (n.to === id) arr.push(['map:' + n.id, sc.mapIn || n.at]);   // 场景有 mapIn 时 goScene 会替换 NODES.at
      // 从所有入场点 BFS（8 邻接，同 findPath 的斜穿规则）
      const comp = new Int32Array(nw * nh).fill(-1);
      const okc = (c, r) => c >= 0 && r >= 0 && c < nw && r < nh && ok[r * nw + c] === 1;
      const snap = (x, y) => { let c = Math.floor(x / NS), r = Math.floor(y / NS); if (okc(c, r)) return [c, r]; let best = null, bd = 1e9; for (let rr = 0; rr < nh; rr++) for (let cc = 0; cc < nw; cc++) if (ok[rr * nw + cc]) { const d = (cc - c) ** 2 + (rr - r) ** 2; if (d < bd) { bd = d; best = [cc, rr] } } return best && bd <= 9 ? best : null };
      let ncomp = 0; const sizes = [];
      const flood = (c0, r0) => { const q = [[c0, r0]]; comp[r0 * nw + c0] = ncomp; let n = 0; while (q.length) { const [c, r] = q.pop(); n++; for (const [dc, dr] of NB8) { const nc = c + dc, nr = r + dr; if (!okc(nc, nr) || comp[nr * nw + nc] >= 0) continue; if (dc && dr && (!okc(c + dc, r) || !okc(c, r + dr))) continue; comp[nr * nw + nc] = ncomp; q.push([nc, nr]) } } sizes.push(n); ncomp++ };
      const issues = [];
      const arrive = [];
      for (const [k, a] of arr) {
        const x = a[0] * TS, y = a[1] * TS, s = standOk(x, y), cell = snap(x, y);
        const inExit = (sc.exits || []).some(e => inR(Math.floor(a[0]), Math.floor(a[1]), e.r));
        arrive.push({ k, a, stand: s, inExit });
        if (!s) issues.push(`入场点 ${k} [${a}] 不可站`);
        if (inExit && k !== 'start') issues.push(`入场点 ${k} [${a}] 落在本场景出口区内（会立刻再次触发）`);
        if (cell && comp[cell[1] * nw + cell[0]] < 0) flood(cell[0], cell[1]);
      }
      const main = arrive.length ? (() => { const c = snap(st[0] * TS, st[1] * TS); return c ? comp[c[1] * nw + c[0]] : -1 })() : -1;
      // 其余可走格：未连通的孤岛
      let island = 0;
      for (let r = 0; r < nh; r++) for (let c = 0; c < nw; c++) if (ok[r * nw + c] && comp[r * nw + c] < 0) { flood(c, r); island++ }
      const reach = (x, y) => { const c = Math.floor(x / NS), r = Math.floor(y / NS); return okc(c, r) && comp[r * nw + c] === main };
      // NPC：80px 交互圈内是否存在可达站位（忽略其它 NPC 阻挡）
      const npcs = [];
      for (const n of (sc.npcs || [])) {
        const nx = n.x * TS, ny = n.y * TS; let okN = false, best = 1e9;
        for (let dy = -76; dy <= 76; dy += 4) for (let dx = -76; dx <= 76; dx += 4) { const d = Math.hypot(dx, dy); if (d >= 78) continue; if (n.sp && d < Math.max(12, npcH(n) * .15) + 2) continue; if (standOk(nx + dx, ny + dy) && reach(nx + dx, ny + dy)) { okN = true; best = Math.min(best, d) } }
        npcs.push({ id: n.id, x: n.x, y: n.y, sp: !!n.sp, ok: okN, d: best < 1e9 ? Math.round(best) : null, onWalk: standOk(nx, ny) });
        if (!okN) issues.push(`NPC ${n.id} [${n.x},${n.y}] 80px 内无可达站位`);
        if (n.sp && !standOk(nx, ny)) issues.push(`NPC ${n.id} 脚底不在可走区（站在墙/物件上）`);
      }
      // 出口：出口矩形内是否有可达格
      const exits = [];
      for (const e of (sc.exits || [])) {
        const [c0, r0, c1, r1] = e.r; let n = 0;
        for (let y = r0 * TS + 4; y < (r1 + 1) * TS; y += 8) for (let x = c0 * TS + 4; x < (c1 + 1) * TS; x += 8) if (standOk(x, y) && reach(x, y)) n++;
        exits.push({ to: e.to, label: e.label, r: e.r, reach: n });
        if (!n) issues.push(`出口 ${e.label}→${e.to} 不可达`);
      }
      // 家具净空（02 §2.4）：剧情 NPC / 站桩路人脚下 ±10px 内不得有障碍（不贴着桌凳、摊架、货箱站），且不能站在素材图像下半部分的背后（会被桌凳盖住像站进家具里）
      const clear = (x, y) => [[0, 0], [-10, 0], [10, 0], [0, 6], [0, -6], [-7, 4], [7, 4]].every(([dx, dy]) => ptOk(x + dx, y + dy));
      const K3 = sc.propK || 3;
      const behind = (x, y) => (sc.props || []).find(q => { const x0 = q[4], x1 = q[4] + q[2] * K3, top = q[5], b = q[6]; return x > x0 + 4 && x < x1 - 4 && y < b && y > top + (b - top) * .45 });
      const standers = [...(sc.npcs || []).filter(n => n.sp).map(n => ['NPC ' + n.id, n.x, n.y]), ...(sc.extras || []).filter(e => e.mode === 'stand' && e.x != null).map(e => ['路人 ' + e.sp, e.x, e.y])];
      for (const [nm, cx, cy] of standers) {
        const X = cx * TS, Y = cy * TS;
        if (standOk(X, Y) && !clear(X, Y)) issues.push(`${nm} [${cx},${cy}] 离家具/建筑过近（<10px），会贴着或踩进物件`);
        const q = behind(X, Y); if (q) issues.push(`${nm} [${cx},${cy}] 站在素材（图集 ${q[0]},${q[1]}）图像下半部的背后，会被盖住像站进家具里`);
      }
      // 出入方向一致性（02 §3）：A 的出口 e（方向 d）→ B；B 必须有回 A 的出口且方向为 d 的反向；入口点 at 离该回程出口不超过 5 格
      const dirs = [];
      for (const e of (sc.exits || [])) {
        const d = exitDir(e, sc); dirs.push(e.to + ':' + d);
        if (e.to === 'map' || !SC[e.to]) continue;
        const B = SC[e.to], back = (B.exits || []).filter(x => x.to === id);
        if (!back.length) { issues.push(`出口 ${e.label}→${e.to}：对方场景没有回到 ${id} 的出口`); continue }
        const okDir = back.filter(x => exitDir(x, B) === OPP[d]);
        if (!okDir.length) issues.push(`方向不一致：${id} 向 ${d} 走出 → ${e.to}，但 ${e.to} 回 ${id} 的出口方向是 ${back.map(x => exitDir(x, B)).join('/')}（应为 ${OPP[d]}）`);
        else if (e.at) { const dist = Math.min(...okDir.map(x => { const [c0, r0, c1, r1] = x.r; return Math.hypot(clamp(e.at[0], c0, c1 + 1) - e.at[0], clamp(e.at[1], r0, r1 + 1) - e.at[1]) })); if (dist > 5) issues.push(`入口点 ${id}→${e.to} [${e.at}] 离 ${e.to} 的回程出口 ${dist.toFixed(1)} 格（应在出口旁，从出口方向走进来）`) }
      }
      // 路人
      const extras = [];
      for (const e of (sc.extras || [])) {
        const pts = e.x != null ? [[e.x, e.y]] : e.pts || [];
        for (const q of pts) if (!standOk(q[0] * TS, q[1] * TS)) { extras.push(q); issues.push(`路人 ${e.sp} [${q}] 不可站`) }
      }
      // 地图边缘可走（能走出画面外沿）
      let edge = 0; const inEx = (x, y) => (sc.exits || []).some(e => inR(Math.floor(x / TS), Math.floor(y / TS), e.r));
      const eOk = (x, y) => standOk(x, y) && !inEx(x, y);
      for (let x = 4; x < WWs; x += 8) { if (eOk(x, 10)) edge++; if (eOk(x, WHs - 6)) edge++ }
      for (let y = 4; y < WHs; y += 8) { if (eOk(8, y)) edge++; if (eOk(WWs - 8, y)) edge++ }
      // 渲染叠图（世界 ×0.5）
      const K = .5, cv = document.createElement('canvas'); cv.width = Math.round(WWs * K); cv.height = Math.round(WHs * K);
      const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
      const bgi = IMG[sc.bg]; if (bgi && bgi.naturalWidth) x.drawImage(bgi, 0, 0, cv.width, cv.height);
      if (sc.props && typeof drawPropsTo === 'function') drawPropsTo(x, sc, K);
      const S8 = 8;
      for (let yy = 0; yy < WHs; yy += S8) for (let xx = 0; xx < WWs; xx += S8) {
        const cx = xx + S8 / 2, cy = yy + S8 / 2; if (!standOk(cx, cy)) continue;
        x.fillStyle = reach(cx, cy) ? 'rgba(40,230,90,.38)' : 'rgba(255,230,0,.6)'; x.fillRect(xx * K, yy * K, S8 * K, S8 * K)
      }
      for (const e of (sc.exits || [])) { const [c0, r0, c1, r1] = e.r; x.strokeStyle = '#39f'; x.lineWidth = 2; x.strokeRect(c0 * TS * K, r0 * TS * K, (c1 - c0 + 1) * TS * K, (r1 - r0 + 1) * TS * K); x.fillStyle = '#39f'; x.font = '12px sans-serif'; x.fillText('→' + e.to, c0 * TS * K + 2, r0 * TS * K + 12) }
      for (const n of npcs) { const X = n.x * TS * K, Y = n.y * TS * K; x.strokeStyle = n.ok ? '#fff' : '#f22'; x.lineWidth = 2; x.beginPath(); x.arc(X, Y, 80 * K, 0, 7); x.stroke(); x.fillStyle = n.ok ? '#fff' : '#f22'; x.fillRect(X - 3, Y - 3, 6, 6); x.font = 'bold 12px sans-serif'; x.fillText(n.id, X + 5, Y - 5) }
      for (const a of arrive) { const X = a.a[0] * TS * K, Y = a.a[1] * TS * K; x.fillStyle = a.stand && !(a.inExit && a.k !== 'start') ? '#0ff' : '#f0f'; x.beginPath(); x.arc(X, Y, 5, 0, 7); x.fill(); x.font = '11px sans-serif'; x.fillText(a.k, X + 6, Y + 12) }
      for (const q of extras) { x.fillStyle = '#f80'; x.fillRect(q[0] * TS * K - 4, q[1] * TS * K - 4, 8, 8) }
      let walkN = 0; for (let i = 0; i < ok.length; i++) walkN += ok[i];
      return { id, dirs, size: [WWs, WHs], mask: !!sc.mask, nav: [NS, nw, nh], walkCells: walkN, comps: sizes.length, mainSize: sizes[main] || 0, islands: island, islandCells: sizes.filter((s, i) => i !== main).reduce((a, b) => a + b, 0), edge, arrive, npcs, exits, issues, png: cv.toDataURL('image/png') };
    }, id);
    fs.writeFileSync(`${out}/audit_${id}.png`, Buffer.from(r.png.split(',')[1], 'base64')); delete r.png;
    if (r.islandCells) r.issues.push(`不连通可走孤岛 ${r.islands} 块 / ${r.islandCells} 个导航格（黄色）`);
    if (r.edge) r.issues.push(`地图外沿 ${r.edge} 个采样点可站（出口区以外也能走到画面边缘）`);
    report[id] = r;
    console.log(`${id.padEnd(11)} ${r.size.join('x')} exits=${r.dirs.join(',')} mask=${r.mask} nav=${r.nav.join('/')} walk=${r.walkCells} comps=${r.comps} issues=${r.issues.length}`);
    for (const s of r.issues) console.log('   - ' + s);
  }
  fs.writeFileSync(`${out}/audit.json`, JSON.stringify({ time: new Date().toISOString(), errors: errs, report }, null, 1));
  console.log(JSON.stringify({ errors: errs }));
  await b.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 800) })); process.exit(1); });
