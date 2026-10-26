'use strict';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),fs=require('fs');
const out='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/02-任务与评审';
const exe='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const url='http://127.0.0.1:8792/';const log=(...a)=>console.log(...a);
const sv=JSON.parse(fs.readFileSync(path.join(__dirname,'save-arrival.json')));
async function talk(p,pick,rec=[]){for(let i=0;i<300;i++){if(await p.evaluate(()=>!busy&&!dlgBusy))return rec;const t=await p.evaluate(()=>(document.querySelector('#dlg .who')?.innerText||'')+'：'+(document.querySelector('#dlg .txt')?.innerText||''));if(rec[rec.length-1]!==t)rec.push(t);const opts=await p.evaluate(()=>[...document.querySelectorAll('#dlg:not([hidden]) .choices button')].map(b=>b.innerText));if(opts.length){let k=pick(opts);if(k<0)k=0;rec.push('  [选] '+opts[k]);await p.locator('#dlg .choices button').nth(k).click()}else await p.locator('#dlg').click().catch(()=>{});await p.waitForTimeout(80)}throw Error('talk timeout')}
async function useNpc(p,id){await p.evaluate(id=>{const n=cur._npcs.find(n=>n.id===id);if(!n)throw Error('no npc '+id+' in '+S.scene);player.x=n.x*TS+(walkable(n.x*TS,n.y*TS+40)?0:40);player.y=n.y*TS+40;snapCam()},id);await p.keyboard.press('e');await p.waitForTimeout(350)}
async function goExit(p,re){const id=await p.evaluate(re=>cur._npcs.find(n=>new RegExp(re).test(n.name||''))?.id,re);if(!id)throw Error('no exit '+re);await useNpc(p,id);await talk(p,o=>0);await p.waitForFunction(()=>!busy&&!dlgBusy)}
async function fresh(b){const ctx=await b.newContext({viewport:{width:1280,height:720}});await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(url,{waitUntil:'domcontentloaded'});await p.evaluate(sv=>{localStorage.setItem(sv.k,sv.v);localStorage.setItem('xjh.qihe-prologue.latest.v1',sv.k)},sv);await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.getElementById('qh-continue-0'));await p.click('#qh-continue-0',{noWaitAfter:true});await p.waitForURL(/play=1/);await p.waitForFunction(()=>typeof mode!=='undefined'&&document.getElementById('loading').hidden&&mode==='scene'&&!busy&&!dlgBusy,null,{timeout:60000});return {ctx,p}}
const accept=o=>{let k=o.findIndex(x=>x.includes('帮忙'));if(k<0)k=o.findIndex(x=>x.includes('我去'));return k};
(async()=>{const b=await chromium.launch({executablePath:exe});const R={};
// A: 第一夜接齐三方三件
{const {ctx,p}=await fresh(b);await goExit(p,'回村');await goExit(p,'南村口');
 R.xu=await talk(p,accept,[]).catch(e=>String(e)); await useNpc(p,'xulingyi');R.xu=await talk(p,accept);
 await useNpc(p,'censhuang');R.cen=await talk(p,accept);
 await goExit(p,'返回');await goExit(p,'东埠');await useNpc(p,'shenyanhui');R.shen=await talk(p,accept);
 await p.waitForTimeout(1500);
 R.questsA=await p.evaluate(()=>mnQuests().map(q=>q.t+' | '+q.d));
 await p.keyboard.press('j');await p.waitForTimeout(800);await p.screenshot({path:path.join(out,'11-第一夜-三方三件全部可接.png')});
 R.errA=p.errs;await ctx.close()}
// B: 第一夜接齐周婶三件
{const {ctx,p}=await fresh(b);await useNpc(p,'aunt');R.aunt=await talk(p,o=>o.findIndex(x=>x.includes('碗')));
 for(const w of ['布','药']){await useNpc(p,'aunt');R['aunt'+w]=await talk(p,o=>o.findIndex(x=>x.includes(w)>=0&&x.includes(w)));}
 R.questsB=await p.evaluate(()=>mnQuests().map(q=>q.t+' | '+q.d));
 await p.keyboard.press('j');await p.waitForTimeout(800);await p.screenshot({path:path.join(out,'12-第一夜-周婶三件小事.png')});
 R.errB=p.errs;await ctx.close()}
fs.writeFileSync(path.join(__dirname,'info4.json'),JSON.stringify(R,null,1));log(JSON.stringify({qA:R.questsA,qB:R.questsB,eA:R.errA,eB:R.errB},null,1));
await b.close();})().catch(e=>{console.error(e);process.exit(1)});
