// Jianghu icon coverage and desktop render smoke test. Uses an isolated browser page.
// Run: node tests/menu-icons.test.cjs [output directory]
const { chromium } = require('/private/tmp/claude-501/pw/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const EXE = require('os').homedir() + '/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const out = process.argv[2] || 'review/jianghu-icons';
const base = process.env.XJH_TEST_URL || 'http://localhost:8123';
fs.mkdirSync(out, { recursive: true });
let failures = 0;
const check = (ok, what, detail) => { console.log(`${ok ? '✓' : '✗'} ${what}${detail ? ' ' + JSON.stringify(detail) : ''}`); if (!ok) failures++; };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [], missing = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && /i_jianghu|menu-icons/.test(r.url())) missing.push(`${r.status()} ${r.url()}`); });
  await page.goto(base + '/?icons=' + Date.now() + '#street', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof mode !== 'undefined' && mode === 'scene' && !!window.MENU_ICONS);
  const inventory = await page.evaluate(() => {
    const groups = { item: ITEMS, skill: SKILLS, xinfa: XINFA }, result = {};
    for (const [kind, entries] of Object.entries(groups)) {
      const keys = Object.keys(entries), mapped = Object.keys(MENU_ICONS[kind]);
      result[kind] = { count: keys.length, missing: keys.filter(k => !mapped.includes(k)), extra: mapped.filter(k => !keys.includes(k)) };
    }
    return result;
  });
  for (const [kind, r] of Object.entries(inventory)) check(!r.missing.length, `${kind} 图标全覆盖（${r.count}）`, r);
  check(await page.evaluate(() => MENU_ICONS.cell >= 192), '图集使用高分辨率原稿');

  await page.evaluate(() => bagPanel('bag'));
  check(await page.locator('.jm-invcell .jm-pxi').count() > 0 && await page.locator('.jm-tabs .jm-pxi').count() === 7, '第一章普通存档可打开带图标的江湖菜单');

  await page.evaluate(() => {
    S.chapter = 2; S.lv = 13; S.pts = 0;
    S.skills = Object.fromEntries(Object.keys(SKILLS).map(k => [k, 1]));
    S.skSeen = Object.keys(SKILLS);
    S.bag = Object.fromEntries(Object.keys(ITEMS).map(k => [k, 2]));
    S.weapon = 'iron'; S.armor = 'vest'; S.acc = 'jade';
    mnEnsure(); S.xinfa.known = Object.keys(XINFA);
    for (const k of S.xinfa.known) S.xinfa.lv[k] = 1;
    bagPanel('bag');
  });
  await page.locator('.jm-invcell').first().waitFor();
  check(await page.locator('.jm-tabs .jm-pxi').count() === 7, '七个江湖系统入口显示图标');
  check(await page.locator('.jm-invcell .jm-pxi').count() === inventory.item.count, '行囊每格均使用图片');
  check(await page.locator('.jm-invcell .jm-pxi').first().evaluate(el => getComputedStyle(el).imageRendering !== 'pixelated'), '图标按平滑方式缩放');
  await page.screenshot({ path: path.join(out, '01-bag.png') });
  await page.locator('.jm-invcell').first().hover();
  await page.waitForTimeout(150);
  check(await page.locator('.jm-float:not([hidden]) .jm-pxi').count() > 0, '物品悬停详情显示图标');
  await page.screenshot({ path: path.join(out, '02-item-tooltip.png') });

  await page.evaluate(() => bagPanel('equip'));
  check(await page.locator('.jm-wornslot .jm-pxi').count() === 3, '三类已装备槽显示图标');
  await page.screenshot({ path: path.join(out, '03-equip.png') });
  await page.evaluate(() => { S.weapon = null; S.armor = null; S.acc = null; bagPanel('equip') });
  check(await page.locator('.jm-wornslot .jm-slotghost .jm-pxi').count() === 3, '空装备槽显示低对比度部位示意');
  await page.screenshot({ path: path.join(out, '03b-empty-equip.png') });
  await page.evaluate(() => { S.weapon = 'iron'; S.armor = 'vest'; S.acc = 'jade' });

  await page.evaluate(() => bagPanel('skill'));
  // 粗浅拳脚是战斗默认动作，武学页按既有设计不列成可装配卡。
  check(await page.locator('.jm-skillcard:not(.jm-xfcard) .jm-pxi').count() === inventory.skill.count - 1, '所有可装配招式卡显示图标');
  check(await page.locator('.jm-xfcard .jm-pxi').count() === inventory.xinfa.count, '所有心法卡显示图标');
  await page.screenshot({ path: path.join(out, '04-skills.png') });
  await page.locator('.jm-xfcard').first().hover();
  await page.waitForTimeout(150);
  check(await page.locator('.jm-float:not([hidden]) .jm-pxi').count() > 0, '心法悬停详情显示图标');
  await page.screenshot({ path: path.join(out, '05-xinfa-tooltip.png') });

  for (const tab of ['attr', 'skill', 'bag', 'equip', 'party', 'quest', 'sys']) {
    await page.locator(`.jm-tabs button[data-k="${tab}"]`).click();
    check(await page.evaluate(id => menuTab === id && !document.querySelector('.jm-body')?.textContent.includes('此页出错'), tab), `${tab} 页面可通过图标入口打开`);
  }

  check(!errors.length && !missing.length, '页面及素材无异常', { errors, missing });
  await browser.close();
  console.log(`江湖图标回归：${failures} 项失败`);
  process.exitCode = failures ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1 });
