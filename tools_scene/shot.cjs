// 探索场景截图：node tools_scene/shot.cjs <输出.png> [场景id=street] [x格] [y格] [额外 JS]
// 直接切到场景（不走 fade），主角放在 (x,y)（缺省 start），等 1.2s 让路人/镜头稳定后截图（1280×720 视口）
const PW = '/private/tmp/claude-501/pw/node_modules/playwright';
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const { chromium } = require(PW);
const [out = 'shot.png', id = 'street', x, y, js = ''] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8123/?t=' + Date.now() + '#street', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
  await p.evaluate(([id, x, y, js]) => {
    cur = SC[id]; buildGrid(cur); S.scene = id; if (cur.mapv) (S.mapv = S.mapv || {})[id] = cur.mapv; const st = cur.start;
    player.x = (x !== undefined && x !== '' ? +x : st[0]) * TS; player.y = (y !== undefined && y !== '' ? +y : st[1]) * TS; player.trail = [];
    spawnWanderers(); snapCam(); hud(); if (js) eval(js);
  }, [id, x, y, js]);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out });
  console.log(JSON.stringify({ out, errors: errs }));
  await b.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 500) })); process.exit(1); });
