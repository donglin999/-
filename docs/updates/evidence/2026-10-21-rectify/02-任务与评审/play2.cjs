'use strict';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),fs=require('fs');
const out='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/02-任务与评审';
const exe='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const url='http://127.0.0.1:8792/';const log=(...a)=>console.log(...a);
const sv=JSON.parse(fs.readFileSync(path.join(__dirname,'save-arrival.json')));
(async()=>{const b=await chromium.launch({executablePath:exe});const ctx=await b.newContext({viewport:{width:1280,height:720}});
await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded'});
await p.evaluate(sv=>{localStorage.setItem(sv.k,sv.v);localStorage.setItem('xjh.qihe-prologue.latest.v1',sv.k)},sv);
await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.getElementById('qh-continue-0'));
await p.click('#qh-continue-0',{noWaitAfter:true});await p.waitForURL(/play=1/);await p.waitForFunction(()=>typeof mode!=='undefined'&&document.getElementById('loading').hidden&&mode==='scene'&&!busy&&!dlgBusy,null,{timeout:60000});
const info=await p.evaluate(()=>({scene:S.scene,ch:!!S.qiheChapter,avail:QiheOutsiders.available(),contacts:QiheOutsiders.contactRecords().map(r=>r.t+' @ '+r.where),quests:mnQuests().map(q=>q.t+' | '+(q.group||'')+' | '+q.where),npcs:(SC[S.scene].npcs||[]).map(n=>n.id+':'+n.name),hud:document.querySelector('#hud')?.innerText||''}));
log(JSON.stringify(info,null,1));
await p.screenshot({path:path.join(out,'02-第一夜-药棚-行程.png')});
await p.keyboard.press('j');await p.waitForTimeout(800);
const panel=await p.evaluate(()=>document.getElementById('panel')?.hidden?null:document.getElementById('panel').innerText);
log('PANEL:',panel?.slice(0,1500));
await p.screenshot({path:path.join(out,'03-第一夜-任务面板-三方对接已列出.png')});
// 点开徐令仪条目
const xu=p.locator('[data-qj="quest"]').filter({hasText:'徐令仪'});if(await xu.count()){await xu.first().click();await p.waitForTimeout(400);await p.screenshot({path:path.join(out,'04-第一夜-任务面板-徐令仪条目.png')});log('XU:',(await p.locator('#panel').innerText()).slice(0,800))}
await p.keyboard.press('Escape');await p.waitForTimeout(300);
fs.writeFileSync(path.join(__dirname,'info2.json'),JSON.stringify({info,panel},null,1));
log('errors',errs);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
