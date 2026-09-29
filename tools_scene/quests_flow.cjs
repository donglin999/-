// 支线任务 + 消息铺 冒烟测试（W3）：真实寻路交谈 + 键盘推进对话 + 自动战斗
// 前提：本地静态服务器 http://localhost:8123
// 用法：node tools_scene/quests_flow.cjs [截图目录=review/quests]
// 覆盖：风箱与箭镞 / 校场募勇三关 / 消息铺购买（折扣·看破·寻宝·支线·秘闻·引荐·未到货）/ 说书匣 / 竹片暗记 / 一船盐 / 城头旧伤 / 断碑 / 任务菜单
const PW = '/private/tmp/claude-501/pw/node_modules/playwright';
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const { chromium } = require(PW);
const fs = require('fs');
const [out = 'review/quests'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const log = []; let fails = 0;
const L = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); log.push(s); console.log(s) };
const CHECK = (ok, ...a) => { if (!ok) fails++; L(ok ? '✓' : '✗', ...a) };
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()) });
  await p.goto('http://localhost:8123/?t=' + Date.now() + '#street', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
  // 开局穷：按「落魄小乞」5 两起步，统计支线收入
  await p.evaluate(() => { S.silver = 5; window.__bk = []; window.__fights = 0 });
  await p.evaluate(() => {
    window.__auto = setInterval(() => {
      if (mode !== 'battle' || !B) return;
      if (!B.__seen) { B.__seen = 1; window.__fights++; for (const a of B.allies) a.hp = a.mhp; window.__bk.push(B.foes.map(f => f.name + ':' + [...f.known].join(''))) }
      for (const f of B.foes) if (f.hp > 1) f.hp = 1;
      const w = document.getElementById('bt-win'); if (w) { w.dispatchEvent(new PointerEvent('pointerdown')); return }
      if (!B.key || dlgBusy) return;
      const cmd = document.getElementById('bt-cmd'), hd = cmd && cmd.querySelector('.hd span'), t = hd ? hd.textContent : '';
      if (cmd && !cmd.hidden && /回合/.test(t)) { B.key('n1'); return }
      B.key('ok');
    }, 250);
  });
  const st = () => p.evaluate(() => ({ scene: S.scene, silver: S.silver, fights: window.__fights, quests: JSON.stringify(S.quests || {}) }));
  const Q = id => p.evaluate(id => (S.quests && S.quests[id]) || { stage: 0 }, id);
  // 推进对话；面板打开且无对话时按 Esc 关闭（onPanel 可先处理面板）
  async function drive(choices = [], onPanel, maxMs = 60000) {
    const t0 = Date.now(); let ci = 0;
    while (Date.now() - t0 < maxMs) {
      const s = await p.evaluate(() => ({ m: mode, busy, dlg: dlgBusy, ch: !document.getElementById('dlg').hidden && !!document.querySelector('#dlg .choices button'), panel: !document.getElementById('panel').hidden, pk: panelKind }));
      if (s.m === 'scene' && !s.busy && !s.dlg && !s.panel) return true;
      if (s.m === 'battle' && !s.dlg) { await p.waitForTimeout(300); continue }
      if (s.panel && !s.dlg) { if (onPanel) { await onPanel(s.pk); onPanel = null } await p.keyboard.press('Escape'); await p.waitForTimeout(250); continue }
      if (s.ch) { await p.keyboard.press(String(choices[ci++] || 1)); await p.waitForTimeout(200); continue }
      await p.keyboard.press('Space'); await p.waitForTimeout(110);
    }
    return false;
  }
  async function talkTo(id, choices, onPanel) {
    const r = await p.evaluate((id) => {
      cur._npcs = npcsOf(cur);
      const n = cur._npcs.find(n => n.id === id); if (!n) return { err: 'no npc ' + id };
      const q = npcPos(n), side = player.x < q.x ? -1 : 1, off = n.sp ? Math.max(34, npcH(n) * .4) : 20;
      const cand = [[q.x + side * off, q.y + 2], [q.x - side * off, q.y + 2], [q.x, q.y + off * .8], [q.x, q.y - off * .6]];
      let path = null; for (const [cx, cy] of cand) { if (standOk(cx, cy) && !npcBlock(cx, cy)) { path = setPath(cx, cy); if (path) break } }
      player.talkTo = path ? n : null; return { path: !!path, at: [+(n.x).toFixed(2), +(n.y).toFixed(2)] };
    }, id);
    if (!r.path) { CHECK(false, '无法寻路到', id, r); return false }
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) { const s = await p.evaluate(() => ({ busy, dlg: dlgBusy, path: !!player.path })); if (s.busy || s.dlg) break; if (!s.path) break; await p.waitForTimeout(100) }
    const s1 = await p.evaluate(() => ({ busy, dlg: dlgBusy }));
    if (!s1.busy && !s1.dlg) await p.evaluate((id) => { const n = cur._npcs.find(n => n.id === id); if (n) interact(n) }, id);
    const ok = await drive(choices, onPanel);
    L(ok ? '·' : '✗', 'talk', id, r.at, await st());
    return ok;
  }
  const go = async (sc, at) => { await p.evaluate(([sc, at]) => { goScene(sc, at) }, [sc, at]); await p.waitForFunction(sc => S.scene === sc, sc, { timeout: 20000 }); await p.waitForTimeout(700); await drive() };
  const fight = async src => { await p.evaluate(src => { window.__bf = 1; eval(src).then(() => window.__bf = 0) }, src); await p.waitForFunction(() => mode === 'battle', null, { timeout: 15000 }); await drive(); await p.waitForFunction(() => !window.__bf, null, { timeout: 30000 }).catch(() => { }); await drive() };
  const shot = n => p.screenshot({ path: `${out}/${n}.png` });
  // 在消息铺面板里买指定消息
  const buy = ids => async pk => {
    if (pk !== 'rumor') return;
    for (const id of ids) {
      const r = await p.evaluate(id => { const j = RUMORS.findIndex(r => r.id === id); document.querySelector(`[data-j="${j}"]`).click(); const b = document.getElementById('rb'); if (!b || b.disabled) return 'cannot'; b.click(); return S.rumors[id] ? 'ok' : 'fail' }, id);
      CHECK(r === 'ok', '消息铺购买', id, r);
      await p.waitForTimeout(150);
    }
    await shot('02_rumor_' + ids.join('_'));
  };

  L('进场', await st());
  // ── 1. 风箱与箭镞（开局帮工）
  await talkTo('smith', [1, 1, 2, 3]);             // 我来 · 快拉 · 慢拉 · 停一停 → 工钱 14 + 箭镞，交互结束
  CHECK((await Q('q_smith')).stage === 1, '风箱：拿到箭镞', await st());
  await shot('01_smith');
  // 消息铺：先看看「未到货」与穷状态
  await talkTo('gossip', [], async pk => { const t = await p.evaluate(() => [...document.querySelectorAll('.rrow')].map(e => e.textContent).join(' | ')); L('货单', t); CHECK(/未到货/.test(t), '消息铺有「未到货」条目'); await buy(['cache', 'smith'])(pk) });
  // ── 2. 城门：交箭镞 + 校场
  await go('gate', [23.5, 20]);
  await talkTo('soldier', [1]);                    // 收下 15 两 → 校场开启
  CHECK((await Q('q_smith')).stage === 2 && (await Q('q_camp')).stage === 1, '箭镞送达 · 校场开启', await st());
  await talkTo('soldier', [1]); CHECK((await Q('q_camp')).stage === 2, '校场第一关', await st());
  const early = await st(); L('★ 早期收入：战斗', early.fights, '场后银两', early.silver);
  await talkTo('soldier', [1]); CHECK((await Q('q_camp')).stage === 3, '校场第二关', await st());
  await talkTo('soldier', [1]); CHECK((await Q('q_camp')).stage === 3, '第三关未打听前被拒');
  // ── 3. 回街市：铁匠结账（选短打）+ 八折
  await go('street', [33, 16]);
  let shopPrice = null; const base = await p.evaluate(() => ({ wood: ITEMS.wood.price, bun: ITEMS.bun.price }));
  await talkTo('smith', [2]);
  const after = await p.evaluate(() => ({ wood: ITEMS.wood.price, cloth: !!S.bag.cloth }));
  CHECK((await Q('q_smith')).done && after.cloth, '风箱与箭镞完成（得粗布短打）');
  CHECK(after.wood === base.wood, '任务结算后未自动打开商店');
  await talkTo('smith', [], async pk => { if (pk === 'shop') { shopPrice = await p.evaluate(() => ({ wood: ITEMS.wood.price, iron: ITEMS.iron.price, bun: ITEMS.bun.price })); await shot('03_smith_discount') } });
  CHECK(shopPrice && shopPrice.wood === Math.round(base.wood * .8) && shopPrice.bun === base.bun && after.wood === base.wood, '铁匠八折（兵器护甲八折、药食原价、离店还原）', base, shopPrice, after);
  // 消息铺：引荐 / 看破 / 支线 / 秘闻
  await p.evaluate(() => { if (S.silver < 40) { window.__topup = 40 - S.silver; S.silver = 40 } });
  await talkTo('gossip', [], buy(['fancheng', 'wolf', 'gaibang', 'yangmiao']));
  // ── 4. 校场第三关（引荐）
  await go('gate', [23.5, 20]);
  await talkTo('soldier', [1]); CHECK((await Q('q_camp')).done, '校场第三关（教头）', await st());
  await go('street', [33, 16]);
  // ── 5. 说书匣
  await p.evaluate(() => setFlag('quiz'));
  await talkTo('oldman', [1]); CHECK((await Q('q_book')).stage === 1, '说书匣：接下');
  await go('alley', [1.6, 20.4]);
  await shot('04_alley_pipi');
  await talkTo('q_pipi', [1]); CHECK((await Q('q_book')).stage === 2, '说书匣：打跑泼皮', await st());
  await talkTo('q_cache', [1]); CHECK(await p.evaluate(() => hasFlag('q_cache')), '寻宝：土地龛', await st());
  // ── 6. 竹片暗记：接
  await talkTo('beggar', [1]); CHECK((await Q('q_bamboo')).stage === 1, '竹片暗记：接下');
  await go('street', [64, 24]);
  await talkTo('oldman', [2]); CHECK((await Q('q_book')).done, '说书匣完成（推辞 → 悟性）');
  // ── 7. 渡口：狼群看破 → 喽啰事件 → 竹片 → 令牌 → 一船盐
  await p.evaluate(() => { S.unlocked.ferry = 1 });
  await fight("battle({ foes: [mk('wolf'), mk('wolf')] })");
  CHECK(/剑/.test(JSON.stringify(await p.evaluate(() => window.__bk.slice(-1)))) , '看破：野狼开场即知「剑」「阳」', await p.evaluate(() => window.__bk.slice(-1)));
  await go('ferry', [3, 24.5]);
  await talkTo('bandits', [1]);
  await talkTo('boatman', []); CHECK((await Q('q_bamboo')).stage === 2, '竹片交给老船夫');
  await shot('05_ferry');
  // 一船盐（工作流 F 起，13 §3.5）：盐商搭汤老舵的渡船，护送战在江心截船
  await talkTo('boatman', [1]); CHECK(await p.evaluate(() => S.scene === 'crossing') && (await Q('q_salt')).stage === 1, '一船盐：盐商上船', await st());
  await talkTo('boatman', [1, 2]); CHECK((await Q('q_salt')).done, '一船盐完成（江心截船）', await st());
  // 喽啰看破（买 bandit 后）
  await p.evaluate(() => { S.rumors.bandit = 1 });
  await fight("battle({ foes: [mk('thug')] })");
  CHECK(/拳棍|棍拳/.test(JSON.stringify(await p.evaluate(() => window.__bk.slice(-1)))), '看破：打手开场即知「拳」「棍」', await p.evaluate(() => window.__bk.slice(-1)));
  // ── 8. 回偏巷交差
  await go('alley', [1.6, 20.4]);
  await talkTo('beggar', []); CHECK((await Q('q_bamboo')).done, '竹片暗记完成', await p.evaluate(() => Object.keys(S.skills)));
  // ── 9. 庙外：老僧旧伤 + 断碑
  await p.evaluate(() => { setFlag('spar'); S.bag.wine = 1 });
  await go('temple_out', [23.5, 14]);
  await shot('06_temple_out_stele');
  await talkTo('monk', [1]); CHECK((await Q('q_monk')).stage === 1, '默庵的咳嗽：接下');
  await talkTo('monk', [1]); CHECK((await Q('q_monk')).done, '默庵的咳嗽完成（竹叶青）', await p.evaluate(() => S.st));
  await talkTo('q_stele', [1]); CHECK(await p.evaluate(() => hasFlag('q_stele')), '断碑拓读');
  // ── 10. 任务菜单 + 消息铺全貌
  await p.evaluate(() => bagPanel('quest')); await p.waitForTimeout(400); await shot('07_quest_menu');
  const qe = await p.evaluate(() => questEntries().map(e => e.name + (e.done ? '✔' : '…')));
  const menuSide = await p.evaluate(() => [...document.querySelectorAll('#panel .jm-q .nm, #panel .qlog .nm')].map(e => e.textContent).join(' | '));
  L('任务页', menuSide);
  CHECK(qe.length === 6 && qe.every(x => x.endsWith('✔')), '任务表 6 条全部完成', qe);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await go('street', [60, 24]);
  await p.evaluate(() => { S.bag.ledger = 1; S.silver += 40; window.__topup = (window.__topup || 0) + 40 });
  await talkTo('gossip', [], async pk => { await buy(['heifeng', 'qingchong'])(pk); await p.waitForTimeout(200); await shot('08_rumor_log') });
  await fight("battle({ foes: [mk('chief')] })");
  CHECK(/刀阳|阳刀/.test(JSON.stringify(await p.evaluate(() => window.__bk.slice(-1)))), '看破：独眼阎罗开场即知「刀」「阳」', await p.evaluate(() => window.__bk.slice(-1)));
  CHECK(await p.evaluate(() => hasFlag('hint_qingchong')), '青虫印伏笔已记');
  const fin = await st(); L('最终', fin, '补给银两', await p.evaluate(() => window.__topup || 0));
  L(JSON.stringify({ errors: errs, fails }));
  fs.writeFileSync(`${out}/flow.log`, log.join('\n'));
  await b.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 800) })); process.exit(1); });
