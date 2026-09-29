// 出口切换连续帧：对每个场景出口，把主角放在出口前 2.5 格处、朝出口寻路走过去，每 ~110ms 截一帧，直到进入新场景并站定。
// 用来人工检查：走出方向与入场方向一致、门洞处不被建筑"吞"、淡出/淡入顺滑、出口标签不被遮挡。
// 前提：本地静态服务器 http://localhost:8123
// 用法：node tools_scene/exit_frames.cjs [输出目录=review/scene_v3/exits] [场景id…]
// 输出：<out>/<from>__<to>/f00.png …（1280×720 画面缩到 640×360），另在控制台打印每帧的场景/坐标/朝向/alpha
const PW = '/private/tmp/claude-501/pw/node_modules/playwright';
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const { chromium } = require(PW);
const fs = require('fs');
const [out = 'review/scene_v3/exits', ...only] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8123/?t=' + Date.now() + '#street', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
  await p.evaluate(() => { Object.assign(S.flags, { gate_ok: 1, awake: 1, spar: 1, gate_pass: 1 }); S.party = ['dog'] });
  const pairs = await p.evaluate(() => { const r = []; for (const id in SC) for (const e of (SC[id].exits || [])) if (e.to !== 'map') r.push([id, e.to]); return r });
  const summary = [];
  for (const [from, to] of pairs) {
    if (only.length && !only.includes(from)) continue;
    const dir = `${out}/${from}__${to}`; fs.mkdirSync(dir, { recursive: true });
    const info = await p.evaluate(([from, to]) => {
      cur = SC[from]; buildGrid(cur); S.scene = from; const e = cur.exits.find(e => e.to === to); const d = exitDir(e), v = DV[d];
      const [c0, r0, c1, r1] = e.r; let tx = (c0 + c1 + 1) / 2 * TS, ty = (r0 + r1 + 1) / 2 * TS;
      // 出口区内离可走区最近的点作目标；起点 = 目标沿出口反方向退 2.5 格（找可站点）
      let best = null, bd = 1e9; for (let y = r0 * TS + 4; y < (r1 + 1) * TS; y += 4) for (let x = c0 * TS + 4; x < (c1 + 1) * TS; x += 4) if (standOk(x, y)) { const dd = Math.hypot(x - tx, y - ty); if (dd < bd) { bd = dd; best = [x, y] } }
      if (best) [tx, ty] = best;
      let sx = tx - v[0] * 100, sy = ty - v[1] * 100; if (!standOk(sx, sy)) { for (let k = 60; k < 200; k += 8) { const x = tx - v[0] * k, y = ty - v[1] * k; if (standOk(x, y)) { sx = x; sy = y; break } } }
      player.x = sx; player.y = sy; player.dir = d; player.trail = []; spawnWanderers(); snapCam(); hud(); setPath(tx, ty);
      return { d, at: e.at };
    }, [from, to]);
    const frames = [];
    for (let i = 0; i < 26; i++) {
      await p.screenshot({ path: `${dir}/f${String(i).padStart(2, '0')}.png`, scale: 'css' });
      frames.push(await p.evaluate(() => ({ s: S.scene, x: Math.round(player.x), y: Math.round(player.y), d: player.dir, a: +(player.alpha ?? 1).toFixed(2), busy })));
      await p.waitForTimeout(110);
    }
    const last = frames[frames.length - 1];
    const ok = last.s === to && last.d === info.d && !last.busy;
    summary.push({ from, to, dir: info.d, ok, last });
    console.log(ok ? '✓' : '✗', from, '→', to, 'dir', info.d, 'final', JSON.stringify(last));
    // 回到起始场景（不走 fade）
    await p.evaluate(() => { player.anim = null; player.alpha = 1; busy = false });
  }
  fs.writeFileSync(`${out}/summary.json`, JSON.stringify({ summary, errors: errs }, null, 1));
  console.log(JSON.stringify({ errors: errs }));
  await b.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 800) })); process.exit(1); });
