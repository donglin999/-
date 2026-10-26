'use strict';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path');
const out='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/02-任务与评审';
const exe='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const url='http://127.0.0.1:8792/';
const log=(...a)=>console.log(...a);
(async()=>{const b=await chromium.launch({executablePath:exe});const ctx=await b.newContext({viewport:{width:1280,height:720}});
await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.getElementById('qh-new-journey'));
await p.screenshot({path:path.join(out,'00-title.png')});
await p.click('#qh-new-journey',{noWaitAfter:true});await p.waitForURL(/play=1/);await p.waitForFunction(()=>typeof mode!=='undefined'&&document.getElementById('loading').hidden,null,{timeout:60000});
log('url',p.url());
// drain dialogs for a while
let lastTxt='';const seen=[];
for(let i=0;i<1500;i++){
 const st=await p.evaluate(()=>({mode,busy,dlgBusy,scene:S?.scene,arr:S?.prologue?.arrival?.stage,ch:S?.qiheChapter?.stage,hd:S?.qiheChapter?.halfDay,who:document.querySelector('#dlg .who')?.innerText,txt:document.querySelector('#dlg .txt')?.innerText,dlg:!document.getElementById('dlg').hidden,battle:typeof battle!=='undefined'&&!!battle}));
 if(st.txt&&st.txt!==lastTxt){seen.push((st.who||'')+'：'+st.txt);lastTxt=st.txt}
 if(i%50===0)log(i,JSON.stringify({...st,txt:undefined}));
 if(st.arr==='done'&&!st.busy&&!st.dlgBusy){log('ARRIVAL DONE at',i);break}
 const n=await p.locator('#dlg:not([hidden]) .choices button').count();
 if(n){await p.locator('#dlg .choices button').nth(0).click().catch(()=>{});}
 else if(st.dlg)await p.locator('#dlg').click({timeout:1000}).catch(()=>{});
 else if(st.mode==='battle'||st.battle){await p.keyboard.press('j').catch(()=>{});}
 await p.waitForTimeout(120);
}
const st=await p.evaluate(()=>({mode,scene:S.scene,arr:S.prologue?.arrival?.stage,ch:S.qiheChapter||null,outs:S.prologue?.outsiders||null}));log(JSON.stringify(st));
require('fs').writeFileSync(path.join('/private/tmp/claude-501/-Users-wuxiuxiang-project-luotuozhuan/cee2f540-8d09-4e39-a916-75d3855a0702/scratchpad/p2','lines1.txt'),seen.join('\n'));
await p.screenshot({path:path.join(out,'01-after-arrival.png')});
const saved=await p.evaluate(()=>{const k=saveKey();return {k,v:localStorage.getItem(k)}});
require('fs').writeFileSync('/private/tmp/claude-501/-Users-wuxiuxiang-project-luotuozhuan/cee2f540-8d09-4e39-a916-75d3855a0702/scratchpad/p2/save-arrival.json',JSON.stringify(saved));
log('errors',errs);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
