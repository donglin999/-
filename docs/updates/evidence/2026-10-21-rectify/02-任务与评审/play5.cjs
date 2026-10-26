'use strict';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),fs=require('fs');
const out='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/02-任务与评审';
const exe='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const url='http://127.0.0.1:8792/';const sv=JSON.parse(fs.readFileSync(path.join(__dirname,'save-arrival.json')));
(async()=>{const b=await chromium.launch({executablePath:exe});const ctx=await b.newContext({viewport:{width:1280,height:720}});await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));const p=await ctx.newPage();
await p.goto(url,{waitUntil:'domcontentloaded'});await p.evaluate(sv=>{localStorage.setItem(sv.k,sv.v);localStorage.setItem('xjh.qihe-prologue.latest.v1',sv.k)},sv);await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.getElementById('qh-continue-0'));await p.click('#qh-continue-0',{noWaitAfter:true});await p.waitForURL(/play=1/);await p.waitForFunction(()=>typeof mode!=='undefined'&&document.getElementById('loading').hidden&&mode==='scene'&&!busy&&!dlgBusy,null,{timeout:60000});
await p.evaluate(()=>{const n=cur._npcs.find(n=>n.id==='aunt');player.x=n.x*TS+(walkable(n.x*TS,n.y*TS+40)?0:40);player.y=n.y*TS+40;snapCam()});await p.keyboard.press('e');
for(let i=0;i<60;i++){const c=await p.locator('#dlg:not([hidden]) .choices button').count();if(c){break}if(await p.locator('#dlg').isVisible())await p.locator('#dlg').click();await p.waitForTimeout(120)}
await p.waitForTimeout(300);await p.screenshot({path:path.join(out,'02b-第一夜-周婶当场派三件小事.png')});
console.log(await p.evaluate(()=>[...document.querySelectorAll('#dlg .choices button')].map(b=>b.innerText)));
await b.close()})().catch(e=>{console.error(e);process.exit(1)});
