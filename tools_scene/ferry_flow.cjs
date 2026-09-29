// 渡江情节冒烟测试（工作流 F，docs/design/01 §5.5）：真实寻路交谈 + 键盘推进对话 + 自动战斗
// 前提：本地静态服务器 http://localhost:8123
// 用法：node tools_scene/ferry_flow.cjs [截图目录=review/ferry]
// 覆盖：交药（渡口开放）→ 大地图 → 西岸码头喽啰事件（喽啰×2+水匪）→ 汤老舵说出暗桩 → 一船盐（盐商上船）→ 渡船：同伴/汤老舵往事 → 江心截船（bb_river）→ 盐商结账
//       → 东岸三种解法：①硬闯（浪里鳅，得令牌+纸条）②智取（冒充送例钱，偷令牌）③放过（偷听暗号）+ 分赃者亮令牌入伙
//       → 每种都渡回西岸（第①次核对黑风寨此时才开放）→ 寨门：暗号+令牌放行 / 只有暗号须硬闯 → 旧档兼容（已开放黑风寨、老船夫给过令牌）
const PW = '/private/tmp/claude-501/pw/node_modules/playwright';
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const { chromium } = require(PW);
const fs = require('fs');
const [out = 'review/ferry'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const log = []; let fails = 0;
const L = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); log.push(s); console.log(s) };
const CHECK = (ok, ...a) => { if (!ok) fails++; L(ok ? '✓' : '✗', ...a) };
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [], bad = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()) });
  p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '')) });
  await p.goto('http://localhost:8123/?t=' + Date.now() + '#street', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
  // 自动战斗：开场记下敌人与背景，把敌人压到 1 气血、我方回满，普攻推进
  await p.evaluate(() => {
    window.__bk = []; window.__fights = 0;
    window.__auto = setInterval(() => {
      if (mode !== 'battle' || !B) return;
      if (!B.__seen) { B.__seen = 1; window.__fights++; for (const a of B.allies) a.hp = a.mhp; window.__bk.push({ bg: B.bg, foes: B.foes.map(f => f.name + '/' + f.maxShield + '/' + f.weak.join('')) }) }
      for (const f of B.foes) if (f.hp > 1) f.hp = 1;
      const w = document.getElementById('bt-win'); if (w) { w.dispatchEvent(new PointerEvent('pointerdown')); return }
      if (!B.key || dlgBusy) return;
      const cmd = document.getElementById('bt-cmd'), hd = cmd && cmd.querySelector('.hd span'), t = hd ? hd.textContent : '';
      if (cmd && !cmd.hidden && /回合/.test(t)) { B.key('n1'); return }
      B.key('ok');
    }, 250);
  });
  const st = () => p.evaluate(() => ({ scene: S.scene, c: +(player.x / TS).toFixed(2), r: +(player.y / TS).toFixed(2), dir: player.dir, silver: S.silver, moral: S.moral, token: !!S.bag.token, bandit: !!S.unlocked.bandit,
    f: ['ferry_ev', 'tang_told', 'tang_story', 'cross_fight', 'bf_east', 'bf_code', 'bf_trick', 'bf_back', 'gate_pass'].filter(k => S.flags[k]).map(k => k + (S.flags[k] === 1 ? '' : '=' + S.flags[k])).join(','), quest: questLine() }));
  const lastBattle = () => p.evaluate(() => window.__bk[window.__bk.length - 1] || null);
  async function drive(choices = [], maxMs = 90000) {
    const t0 = Date.now(); let ci = 0;
    while (Date.now() - t0 < maxMs) {
      const s = await p.evaluate(() => ({ m: mode, busy, dlg: dlgBusy, ch: !document.getElementById('dlg').hidden && !!document.querySelector('#dlg .choices button'), panel: !document.getElementById('panel').hidden }));
      if (s.m === 'scene' && !s.busy && !s.dlg && !s.panel) { await p.waitForTimeout(150); const s2 = await p.evaluate(() => ({ busy, dlg: dlgBusy, a: !!player.anim })); if (!s2.busy && !s2.dlg && !s2.a) return true; continue }
      if (s.m === 'battle' && !s.dlg) { await p.waitForTimeout(300); continue }
      if (s.panel && !s.dlg) { await p.keyboard.press('Escape'); await p.waitForTimeout(250); continue }
      if (s.ch) { await p.keyboard.press(String(choices[ci++] || 1)); await p.waitForTimeout(220); continue }
      await p.keyboard.press('Space'); await p.waitForTimeout(110);
    }
    return false;
  }
  async function talkTo(id, choices) {
    const r = await p.evaluate((id) => {
      cur._npcs = npcsOf(cur);
      const n = cur._npcs.find(n => n.id === id); if (!n) return { err: 'no npc ' + id + ' in ' + S.scene };
      const q = npcPos(n), side = player.x < q.x ? -1 : 1, off = n.sp ? Math.max(34, npcH(n) * .4) : 20;
      const cand = [[q.x + side * off, q.y + 2], [q.x - side * off, q.y + 2], [q.x, q.y + off * .8], [q.x, q.y - off * .6], [q.x + side * off * .6, q.y + 12]];
      let path = null; for (const [cx, cy] of cand) { if (standOk(cx, cy) && !npcBlock(cx, cy)) { path = setPath(cx, cy); if (path) break } }
      player.talkTo = path ? n : null; return { path: !!path, at: [+(n.x).toFixed(2), +(n.y).toFixed(2)] };
    }, id);
    if (!r.path) { CHECK(false, '无法寻路到', id, r); return false }
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) { const s = await p.evaluate(() => ({ busy, dlg: dlgBusy, path: !!player.path })); if (s.busy || s.dlg) break; if (!s.path) break; await p.waitForTimeout(100) }
    const s1 = await p.evaluate(() => ({ busy, dlg: dlgBusy }));
    if (!s1.busy && !s1.dlg) await p.evaluate((id) => { const n = cur._npcs.find(n => n.id === id); if (n) interact(n) }, id);
    const ok = await drive(choices);
    L(ok ? '·' : '✗', 'talk', id, r.at, await st());
    return ok;
  }
  const waitScene = async sc => { await p.waitForFunction(sc => S.scene === sc && mode === 'scene', sc, { timeout: 30000 }); await drive() };
  const shot = n => p.screenshot({ path: `${out}/${n}.png` });
  const optsOf = () => p.evaluate(() => [...document.querySelectorAll('#dlg .choices button')].map(b => b.textContent));
  // 选项文本检查：打开对话后停在选择处，读出选项再按 k
  async function talkPeek(id, k, until) {
    await p.evaluate((id) => { const n = npcsOf(cur).find(n => n.id === id); const q = npcPos(n); player.x = q.x - 40; player.y = q.y + 4; player.path = null; interact(n) }, id);
    const t0 = Date.now(); let opts = [];
    while (Date.now() - t0 < 20000) {
      const ch = await p.evaluate(() => !document.getElementById('dlg').hidden && !!document.querySelector('#dlg .choices button'));
      if (ch) { opts = await optsOf(); if (!until || opts.some(o => until.test(o))) break; await p.keyboard.press('1'); await p.waitForTimeout(200); continue }
      await p.keyboard.press('Space'); await p.waitForTimeout(110);
    }
    return opts;
  }
  async function viaMap(id) {
    await p.evaluate(() => { openMap() });
    await p.waitForFunction(() => mode === 'map' && typeof mapPick === 'function' && mapPick, null, { timeout: 8000 });
    await p.waitForTimeout(400);
    const on = await p.evaluate(id => !!S.unlocked[id], id);
    if (!on) { await p.evaluate(() => mapPick(null)); await drive(); return false }
    await p.evaluate(id => { mapSel = NODES.find(n => n.id === id); mapUI(); mapPick(mapSel) }, id);
    await p.waitForTimeout(300); await drive(); return true;
  }
  const reset = () => p.evaluate(() => { for (const k of ['bf_east', 'bf_code', 'bf_trick', 'bf_trick_fail', 'bf_back', 'gate_pass', 'ferry_split']) delete S.flags[k]; S.bag.token = 0; S.bag.bf_note = 0; S.unlocked.bandit = 0; const d = derived(); S.hp = d.mhp; S.mp = d.mmp });

  // ═══ 1. 交药 → 渡口开放 ═══
  await p.evaluate(() => { Object.assign(S.flags, { xq: 3, suzhi_met: 1, xq_c_gossip: 1, xq_c_lady: 1, xq_w1: 1, xq_fate: 'guard' }); S.bag.jieyao = 1; S.bag.ledger = 1; S.party = ['dog']; S.silver = 60; S.st.wis = 5 });
  await talkTo('suzhi', [1, 2, 1]);
  let s = await st();
  CHECK(await p.evaluate(() => !!S.unlocked.ferry && S.party.includes('suzhi')), '交药后：苏芷同行、东津渡开放', s);
  CHECK(!(await p.evaluate(() => !!S.unlocked.bandit)), '此时黑风寨未开放');
  // ═══ 2. 大地图 → 西岸码头（山道狼群）═══
  await viaMap('ferry'); await waitScene('ferry');
  s = await st(); L('码头入场', s, await lastBattle());
  await shot('01_ferry_west');
  // ═══ 3. 喽啰事件：喽啰×2 + 黑风水匪（D1 #15，不再有狼）═══
  await talkTo('bandits', [1]);
  const bk = await lastBattle();
  CHECK(bk && bk.bg === 'bb_ferry' && bk.foes.some(f => f.startsWith('黑风水匪')) && !bk.foes.some(f => f.startsWith('野狼')), '码头之战：喽啰×2+黑风水匪（bb_ferry）', bk);
  s = await st();
  CHECK(/ferry_ev/.test(s.f) && /tang_told/.test(s.f) && !s.bandit, '喽啰事件后：汤老舵说出暗桩；黑风寨仍未开放', s);
  // ═══ 4. 一船盐：盐商上船 → 渡船 ═══
  await talkTo('boatman', [1]);
  await waitScene('crossing');
  s = await st();
  CHECK(s.scene === 'crossing' && (await p.evaluate(() => QAPI.get('q_salt').stage)) === 1, '一船盐：盐商上船，进入渡船场景', s);
  const npcsBoat = await p.evaluate(() => npcsOf(cur).map(n => n.id));
  CHECK(['boatman', 'suzhi', 'dog', 'merchant'].every(k => npcsBoat.includes(k)) && !npcsBoat.includes('bow'), '船上：汤老舵/苏芷/大黄/盐商在甲板上，截船前不能靠岸', npcsBoat);
  CHECK(await p.evaluate(() => followers.length === 0), '渡船上同伴以 NPC 身份出现（不跟随）');
  await p.waitForTimeout(1200); await shot('02_crossing');
  await talkTo('suzhi', []); await talkTo('dog', []); await talkTo('merchant', []);
  // ═══ 5. 汤老舵往事 → 江心截船 → 盐商结账 ═══
  const m0 = await p.evaluate(() => S.silver);
  await p.evaluate(() => { const n = npcsOf(cur).find(n => n.id === 'boatman'); interact(n) });
  await p.waitForFunction(() => SC.crossing._raid, null, { timeout: 30000 }).catch(() => { });
  await p.waitForTimeout(1500); await shot('03_crossing_raid');
  await drive([2, 1]);
  const bk2 = await lastBattle();
  CHECK(bk2 && bk2.bg === 'bb_river' && bk2.foes.length === 3 && bk2.foes.every(f => f.startsWith('黑风水匪')), '江心截船：黑风水匪×3（bb_river）', bk2);
  CHECK(await p.evaluate(() => QAPI.get('q_salt').done && hasFlag('tang_story') && hasFlag('cross_fight')), '往事已讲、截船已打、一船盐完成', 'silver', m0, '→', await p.evaluate(() => S.silver));
  await shot('04_crossing_after');
  await talkTo('bow', [1]);
  await waitScene('ferry_e');
  s = await st();
  CHECK(s.scene === 'ferry_e' && s.dir === 'd', '靠岸：东岸芦苇荡（栈桥上、朝下）', s);
  CHECK(await p.evaluate(() => followers.length === 2), '东岸：同伴恢复跟随');
  await p.waitForTimeout(800); await shot('05_ferry_e_arrive');
  // ═══ 6. 解法①：硬闯 ═══
  await talkTo('langli', [1]);
  const bk3 = await lastBattle();
  s = await st();
  CHECK(bk3 && bk3.foes[0].startsWith('浪里鳅') && s.token && /bf_east=fight/.test(s.f) && /bf_code/.test(s.f) && (await p.evaluate(() => !!S.bag.bf_note)), '硬闯：打败浪里鳅，得黑风令牌 + 暗号纸条', bk3, s);
  await shot('06_ferry_e_fight');
  await talkTo('boatman_e', [1]);
  await waitScene('ferry');
  s = await st();
  CHECK(s.scene === 'ferry' && s.bandit && /bf_back/.test(s.f), '渡回西岸：此时黑风寨才开放', s);
  await shot('07_back_west');
  CHECK(await viaMap('bandit'), '大地图可去黑风寨');
  await waitScene('bgate');
  let op = await talkPeek('guard');
  CHECK(op.some(o => /风起云涌/.test(o)) && op.some(o => /令牌/.test(o)), '寨门：暗号与令牌两个选项都在', op);
  await p.keyboard.press('1'); await drive();
  CHECK(await p.evaluate(() => hasFlag('gate_pass')), '对暗号 + 亮令牌 → 放行（无战斗）');
  await shot('08_bgate_pass');

  // ═══ 7. 解法②：智取（冒充铁臂帮送例钱）══ 走西岸码头再坐一趟船（平安航程，无截船）
  await reset();
  await p.evaluate(() => { setFlag('bf_back'); goScene('ferry', [21.8, 5.1], 'r') }); await waitScene('ferry');
  await p.evaluate(() => { delete S.flags.bf_back });
  await talkTo('boatman', [1]);
  await waitScene('crossing');
  CHECK(await p.evaluate(() => npcsOf(cur).some(n => n.id === 'bow') && !SC.crossing._raid), '再次过江：风平浪静，可直接靠岸');
  await talkTo('bow', [1]); await waitScene('ferry_e');
  op = await talkPeek('langli');
  CHECK(op.some(o => /冒充/.test(o)) && !op.some(o => /亮出/.test(o)), '持账簿：出现「冒充送例钱」选项', op);
  await p.keyboard.press('2'); await drive([1, 1]);
  s = await st();
  CHECK(/bf_trick/.test(s.f) && /bf_code/.test(s.f) && !s.token, '智取：付例钱骗得暗号，浪里鳅醉倒', s);
  await p.waitForTimeout(500); await shot('09_ferry_e_trick');
  await talkTo('steal', [1]);
  s = await st();
  CHECK(s.token && /bf_east=trick/.test(s.f), '智取：从窝棚摸走令牌', s);
  await talkTo('boatman_e', [1]); await waitScene('ferry');
  CHECK((await st()).bandit, '智取后回西岸：黑风寨开放');
  await p.evaluate(() => { goScene('bgate', NODES.find(n => n.id === 'bandit').at) }); await waitScene('bgate');
  await talkTo('guard', [1]);
  CHECK(await p.evaluate(() => hasFlag('gate_pass')), '智取：对暗号 + 令牌 → 放行');

  // ═══ 8. 解法③：放过（只偷听暗号）══
  await reset();
  await p.evaluate(() => { goScene('ferry_e', [23.2, 7.2], 'd') }); await waitScene('ferry_e');
  await talkTo('eaves', [1]);
  s = await st();
  CHECK(/bf_east=spare/.test(s.f) && /bf_code/.test(s.f) && !s.token, '放过：窝棚后偷听到暗号，悄悄退走（无令牌）', s);
  await shot('10_ferry_e_spare');
  await talkTo('boatman_e', [1]); await waitScene('ferry');
  CHECK((await st()).bandit, '放过后回西岸：黑风寨开放');
  await p.evaluate(() => { goScene('bgate', NODES.find(n => n.id === 'bandit').at) }); await waitScene('bgate');
  op = await talkPeek('guard');
  CHECK(op.some(o => /风起云涌/.test(o)) && !op.some(o => /亮出/.test(o)), '寨门：只有暗号选项', op);
  const nb = await p.evaluate(() => window.__fights);
  await p.keyboard.press('1'); await drive();
  const bk4 = await lastBattle();
  CHECK((await p.evaluate(() => window.__fights)) === nb + 1 && bk4.foes.filter(f => f.startsWith('寨犬')).length === 2 && await p.evaluate(() => hasFlag('gate_pass')), '只有暗号 → "令牌呢？" 硬闯（守寨喽啰×2 + 寨犬×2）', bk4);

  // ═══ 9. 分赃者：亮令牌入伙 ═══
  await reset();
  await p.evaluate(() => { setFlag('ferry_split'); S.bag.token = 1; goScene('ferry_e', [23.2, 7.2], 'd') }); await waitScene('ferry_e');
  op = await talkPeek('langli');
  CHECK(op.some(o => /亮出黑风令牌/.test(o)), '持令牌：出现「亮令牌入伙」选项', op);
  const mo = await p.evaluate(() => S.moral);
  await p.keyboard.press(String(op.findIndex(o => /亮出/.test(o)) + 1)); await drive();
  s = await st();
  CHECK(/bf_east=join/.test(s.f) && /bf_code/.test(s.f) && s.moral === mo - 1, '入伙：得知暗号，侠义 −1', s);

  // ═══ 10. 旧档兼容：改版前已过渡口事件、已开放黑风寨、老船夫给过令牌 ═══
  await reset();
  await p.evaluate(() => { S.flags.ferry_ev = 1; S.unlocked.bandit = 1; S.bag.token = 1; for (const k of ['tang_told', 'cross_fight']) delete S.flags[k]; goScene('ferry', [3, 24.5]) }); await waitScene('ferry');
  s = await st();
  CHECK(s.bandit && /前往黑风寨/.test(s.quest), '旧档：黑风寨保持开放，任务提示指向黑风寨', s);
  await talkTo('boatman', [2]);
  CHECK(await p.evaluate(() => !!S.unlocked.bandit && S.scene === 'ferry'), '旧档：与汤老舵交谈不锁死（可选择不渡江）');
  await p.evaluate(() => { goScene('bgate', NODES.find(n => n.id === 'bandit').at) }); await waitScene('bgate');
  op = await talkPeek('guard');
  CHECK(op.some(o => /风起云涌/.test(o)) && op.some(o => /令牌/.test(o)), '旧档：老船夫告诉过的暗号 + 令牌仍可用', op);
  await p.keyboard.press('1'); await drive();
  CHECK(await p.evaluate(() => hasFlag('gate_pass')), '旧档：寨门放行');
  // 江湖 · 任务页
  await p.evaluate(() => bagPanel('quest')); await p.waitForTimeout(400); await shot('11_quest_menu'); await p.keyboard.press('Escape');

  L('战斗记录', await p.evaluate(() => window.__bk));
  L(JSON.stringify({ errors: errs, http: bad, fails }));
  fs.writeFileSync(`${out}/ferry_flow.log`, log.join('\n'));
  await b.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 800) })); process.exit(1); });
