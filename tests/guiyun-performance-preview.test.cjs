'use strict';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../review/guiyun-performance-fix-20261012');
(async()=>{
 const b=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'}),context=await b.newContext({viewport:{width:1600,height:1000}}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));const report={status:'running',scenes:[],badRequests:[]};p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))report.badRequests.push({url:r.url(),status:r.status()});});
 try{
  await p.goto('http://127.0.0.1:8792/review/guiyun-performance-fix-20261012/',{waitUntil:'networkidle'});await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('点击画面中的箭头'));
  const f=p.frames().find(f=>f.url().includes('chapterPresentationReview=cultivation-performance-preview-20261012'));
  for(let i=0;i<7;i++){
   await p.locator('#scenes button').nth(i).click();const data=await f.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#cultivation img')].map(i=>i.decode().catch(()=>{})));const s=document.querySelector('.cu-story-scene');return {id:s.dataset.visitor,speaker:s.dataset.speaker,actors:[...s.querySelectorAll('.cu-story-actor')].map(i=>i.dataset.character),images:[...document.querySelectorAll('#cultivation img')].filter(i=>!i.naturalWidth).map(i=>i.src),key:saveKey()};});
   assert(data.actors.includes(data.speaker));assert.equal(data.images.length,0);assert(data.key.includes('cultivation-performance-preview-20261012'));report.scenes.push(data);
   await f.locator('.cu-dialogue-next').click();const keys=await f.evaluate(()=>Object.keys(localStorage));assert(keys.every(k=>k.includes('review')));
  }
  await p.locator('#scenes button').first().click();await p.screenshot({path:path.join(out,'preview-page.png')});assert.deepEqual(errors,[]);assert.deepEqual(report.badRequests,[]);report.status='pass';
 }catch(e){report.status='fail';report.failure=e.stack;throw e;}finally{report.errors=errors;fs.writeFileSync(path.join(out,'preview-audit.json'),JSON.stringify(report,null,2)+'\n');await context.close();await b.close();}
 console.log(JSON.stringify({status:report.status,scenes:report.scenes.length,errors}));
})();
