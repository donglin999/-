// 战斗冒烟测试：无头浏览器打开游戏 → 开一场战斗 → 自动随机出招 → 按时间点截图 → 输出页面报错
// 前提：本地静态服务器 http://localhost:8123 （python3 -m http.server 8123 --directory xiaojianghu）
// 用法：node tools_fx/bt_smoke.cjs <输出目录> [总时长ms=20000] [截图间隔ms=2500] [场景=bandits|boss|slow]
//   slow：把 performance.now 放慢到 1/10，适合截特效/动作细节
//   break：每次出手先投满蓄势，敌人护盾降为 2 且弱点含剑/暗器/刀，覆盖蓄势/破防/死亡/胜利演出
// 输出：<输出目录>/shot_XX.png 与控制台 JSON {result, errors, round}
const PW = '/private/tmp/claude-501/pw/node_modules/playwright';
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const { chromium } = require(PW);
const fs = require('fs');
const [out = 'bt_shots', total = '20000', every = '2500', mode = 'bandits'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); if (m.type() === 'warning' && /VFX/.test(m.text())) errs.push('WARN ' + m.text()); });
  await p.goto('http://localhost:8123/?t=' + Date.now() + '#street', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
  await p.evaluate((m) => {
    S.weapon = 'wood'; for (const k of ['fuhu', 'liuye', 'jingxin', 'shuaibei', 'bianfa', 'lianhua', 'guafeng']) S.skills[k] = 1;
    S.mp = 999; S.hp = 9999; S.lv = 8; S.party = ['suzhi', 'dog'];
    if (m === 'slow') { const pn = performance.now.bind(performance), b0 = pn(); performance.now = () => b0 + (pn() - b0) * 0.1; }
    const foes = m === 'boss' ? [mk('chief'), mk('bandit'), mk('wolf')] : [mk('bandit'), mk('bandit'), mk('wolf')];
    if (m === 'break') foes.forEach(f => { f.shield = 2; f.weak = ['剑', '暗器', '刀', '阳']; });
    window.__r = null; battle({ bg: 'bg_street', foes, boss: m === 'boss' }).then(r => window.__r = r);
    window.__iv = setInterval(() => {
      if (!B || !B.key || dlgBusy) { const w = document.getElementById('bt-win'); if (w) w.dispatchEvent(new PointerEvent('pointerdown')); return }
      const cmd = document.getElementById('bt-cmd'), hd = cmd && cmd.querySelector('.hd span'), t = hd ? hd.textContent : '';
      if (cmd && !cmd.hidden && /回合/.test(t)) { if (m === 'break') { for (let i = 0; i < 3; i++) B.key('bp'); B.key('n1'); return } B.key(Math.random() < .7 ? 'n2' : 'n1'); return }
      if (cmd && !cmd.hidden && /武学/.test(t)) { B.key('n' + (1 + Math.floor(Math.random() * 9))); return }
      B.key('ok');
    }, m === 'slow' ? 900 : 300);
  }, mode);
  const T = +total, E = +every; let i = 0;
  for (let t = 0; t < T; t += E) { await p.waitForTimeout(E); await p.screenshot({ path: `${out}/shot_${String(i++).padStart(2, '0')}.png` }); }
  const r = await p.evaluate(() => ({ result: window.__r, round: B && B.round, mode }));
  console.log(JSON.stringify({ ...r, errors: errs }));
  await b.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 500) })); process.exit(1); });
