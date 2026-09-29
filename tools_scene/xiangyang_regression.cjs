// 襄阳分支回归。独立 browser context，绝不读取或覆盖普通浏览器存档。
// 运行：node tools_scene/xiangyang_regression.cjs [http://127.0.0.1:8123]
// 用页面真实剧情函数跑分支；对话和战斗结果由测试驱动，以便稳定验证状态机。
const { chromium } = require('/private/tmp/claude-501/pw/node_modules/playwright');
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const base = process.argv[2] || 'http://127.0.0.1:8123';
let failures = 0;
function check(ok, name, detail) { console.log(`${ok ? '✓' : '✗'} ${name}${detail === undefined ? '' : ' ' + JSON.stringify(detail)}`); if (!ok) failures++; }

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  // 每案全新无痕上下文，case 间也不共享 localStorage。
  async function pageFor(name) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/?case=${encodeURIComponent(name)}#street`, { waitUntil: 'load' });
    await page.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene' && S.scene === 'street', null, { timeout: 40000 });
    await page.evaluate(() => {
      window.__test = { choices: [], fights: [], fightCount: 0 };
      choose = async () => { if (!window.__test.choices.length) throw Error('choice queue empty'); return window.__test.choices.shift() };
      say = async () => {}; talk = async () => {}; toast = async () => {}; gain = async () => {};
      battle = async () => { window.__test.fightCount++; return window.__test.fights.shift() || 'win' };
    });
    return { context, page, errors };
  }
  async function run(name, fn) {
    const c = await pageFor(name);
    try { await fn(c.page); check(c.errors.length === 0, `${name} 无页面异常`, c.errors) }
    catch (e) { check(false, `${name} 执行异常`, e.message) }
    finally { await c.context.close() }
  }
  const state = p => p.evaluate(() => ({ xq: XQ(), flags: { ...S.flags }, silver: S.silver, moral: S.moral, bag: { ...S.bag }, party: [...S.party], pet: S.pet, unlocked: { ...S.unlocked }, fights: window.__test.fightCount }));
  const act = (p, scene, id, choices = [], fights = []) => p.evaluate(async ({ scene, id, choices, fights }) => {
    window.__test.choices = choices; window.__test.fights = fights;
    const n = SC[scene].npcs.find(n => n.id === id);
    if (!n) throw Error(`NPC missing ${scene}/${id}`);
    await n.act(n);
    if (window.__test.choices.length) throw Error(`unused choices: ${window.__test.choices}`);
  }, { scene, id, choices, fights });

  await run('解药婉拒再邀请', async p => {
    await p.evaluate(() => { S.flags.xq = 3; S.bag.jieyao = 1 });
    await act(p, 'street', 'suzhi', [0, 1, 2]); // 不收钱、不追问、婉拒
    let s = await state(p);
    check(s.xq === 4 && !!s.flags.xq_decline && !s.party.includes('suzhi') && !s.bag.jieyao, '婉拒后保持可续主线', s);
    await act(p, 'street', 'suzhi', [0]);
    s = await state(p);
    check(s.xq === 5 && s.party.filter(x => x === 'suzhi').length === 1 && !s.flags.xq_decline && !!s.unlocked.ferry, '再次邀请仅入队一次', s);
  });

  for (const [label, fate, bonus, moral] of [['放走', 'spare', 0, 2], ['押送', 'guard', 20, 3], ['取钱袋', 'rob', 35, -1]]) {
    await run(`代付与处置-${label}`, async p => {
      await p.evaluate(() => { S.flags.xq = 2; S.flags.xq_c_gossip = 1; S.flags.xq_c_lady = 1 });
      await act(p, 'street', 'liu', [1, ['spare', 'guard', 'rob'].indexOf(fate)], ['win']);
      const s = await state(p);
      check(s.xq === 3 && s.flags.xq_pay && s.flags.xq_fate === fate && s.silver === 20 + bonus && s.moral === 10 + moral && s.fights === 1 && s.bag.jieyao === 1, `代付后${label}结果`, s);
      check(await p.evaluate(() => !SC.street.npcs.find(n => n.id === 'liu').show()), '疤脸刘结案后消失');
      await p.evaluate(() => save());
      const saved = await p.evaluate(() => loadSave());
      check(saved.flags.xq === 3 && saved.flags.xq_fate === fate && saved.silver === s.silver, '存档保留处置，未重复发奖');
    });
  }

  await run('战败后重试', async p => {
    await p.evaluate(() => { S.flags.xq = 2; S.flags.xq_c_gossip = 1; S.flags.xq_c_lady = 1; S.hp = 1 });
    await act(p, 'street', 'liu', [2], ['lose']);
    let s = await state(p);
    check(s.xq === 2 && !s.flags.xq_w1 && !s.bag.jieyao && s.flags.xq_fate == null && s.fights === 1, '战败不发解药、不结案', s);
    await act(p, 'street', 'liu', [2, 1], ['win', 'win']);
    s = await state(p);
    check(s.xq === 3 && s.flags.xq_w1 && s.flags.xq_fate === 'guard' && s.bag.jieyao === 1 && s.fights === 3, '重试后正常推进', s);
  });

  for (const [label, choice] of [['救船夫', 0], ['入伙', 1], ['离开', 2]]) {
    await run(`渡口-${label}`, async p => {
      await p.evaluate(() => { S.flags.xq = 4; S.unlocked.ferry = 1 });
      await act(p, 'ferry', 'bandits', [choice], ['win']);
      const s = await state(p);
      check(choice === 2 ? !s.flags.ferry_ev && s.fights === 0 : !!s.flags.ferry_ev && s.fights === (choice === 0 ? 1 : 0), `渡口${label}事件状态`, s);
      check(choice === 1 ? !!s.flags.ferry_split && s.silver === 80 && !!s.bag.token : !s.flags.ferry_split, `渡口${label}分支收益`, s);
    });
  }

  await run('宠物有无与队尾', async p => {
    const none = await p.evaluate(() => ({ pet: S.pet, party: partyHere() }));
    check(!none.pet && none.party.length === 0, '未领养不出现宠物', none);
    await act(p, 'alley', 'dog', [0]);
    let s = await state(p);
    const dogGone = await p.evaluate(() => !SC.alley.npcs.find(n => n.id === 'dog').show());
    check(s.pet === 'dog' && s.party.length === 0 && s.bag.bun === 1 && dogGone, '领养只扣一个馒头，宠物独立于队友', s);
    const order = await p.evaluate(() => { S.party.push('suzhi'); return partyHere() });
    check(order.join(',') === 'suzhi,dog', '宠物跟在队伍末尾', order);
    await p.evaluate(() => save());
    const saved = await p.evaluate(() => loadSave());
    check(saved.pet === 'dog' && saved.party.join(',') === 'suzhi', '存档保持人宠分离');
    await p.reload({ waitUntil: 'load' });
    await p.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene', null, { timeout: 40000 });
    const reloaded = await p.evaluate(() => loadSave());
    check(reloaded.pet === 'dog' && reloaded.party.join(',') === 'suzhi' && reloaded.bag.bun === 1, '页面重载后测试档仍可读且无重复扣物', reloaded);
  });

  await run('偏巷鸡场战败重试与一次性奖励', async p => {
    await act(p, 'alley', 'rooster', [0], ['lose']);
    let s = await state(p);
    check(!s.flags.rooster && s.fights === 1 && await p.evaluate(() => SC.alley.npcs.find(n => n.id === 'rooster').show()), '战败后红冠将军仍可挑战', s);
    await act(p, 'alley', 'rooster', [0], ['win']);
    s = await state(p);
    const reward = await p.evaluate(() => ({ bonus: S.atkBonus, skill: !!S.skills.guafeng, visible: SC.alley.npcs.find(n => n.id === 'rooster').show() }));
    check(!!s.flags.rooster && s.fights === 2 && reward.bonus === 5 && reward.skill && !reward.visible, '获胜只结算一次并隐藏鸡场目标', { s, reward });
    await p.evaluate(() => save());
    const saved = await p.evaluate(() => loadSave());
    check(saved.flags.rooster && saved.atkBonus === 5 && saved.skills.guafeng, '鸡场奖励写入存档');
  });

  await run('偏巷旧档落点', async p => {
    await p.evaluate(() => goScene('alley', [1.6, 20.4]));
    await p.waitForFunction(() => S.scene === 'alley' && cur === SC.alley, null, { timeout: 20000 });
    const points = await p.evaluate(() => [[23, 24], [34.12, 10.45], [37.65, 17.85], [33, 27], [3, 29.4], [54.4, 19.3], [17, 14], [19, 10.5], [31, 24.5]].map(([x, y]) => {
      S.mapv.alley = 1; player.x = x * TS; player.y = y * TS; placeFix();
      return { old: [x, y], now: [+(player.x / TS).toFixed(2), +(player.y / TS).toFixed(2)], walkable: standOk(player.x, player.y), version: S.mapv.alley };
    }));
    check(points.every(v => v.walkable && v.version === 4), '九个旧档代表位置均迁移到可站立点', points);
  });

  await run('江心盐船奖励幂等', async p => {
    await p.evaluate(() => { QAPI.set('q_salt', 1); S.silver = 0 });
    await p.evaluate(async () => { window.__test.choices = [1]; await onSaltEscort() });
    let s = await state(p);
    const q = await p.evaluate(() => QAPI.get('q_salt'));
    check(q.done && s.silver === 20 && s.bag.pill === 1, '护送结算一次', { q, s });
    await p.evaluate(async () => { window.__test.choices = []; await onSaltEscort() });
    s = await state(p);
    check(s.silver === 20 && s.bag.pill === 1, '重复回调不重复发奖', s);
  });

  await browser.close();
  console.log(`回归结束：${failures} 项失败`);
  process.exitCode = failures ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1 });
