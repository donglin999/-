'use strict';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),fs=require('fs');
const out='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/02-任务与评审';
const exe='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const url='http://127.0.0.1:8792/';const log=(...a)=>console.log(...a);
const sv=JSON.parse(fs.readFileSync(path.join(__dirname,'save-arrival.json')));
async function drain(p,choice=0,rec){for(let i=0;i<200;i++){if(await p.evaluate(()=>!busy&&!dlgBusy))return;const t=await p.evaluate(()=>(document.querySelector('#dlg .who')?.innerText||'')+'：'+(document.querySelector('#dlg .txt')?.innerText||''));if(rec&&rec[rec.length-1]!==t)rec.push(t);const c=await p.locator('#dlg:not([hidden]) .choices button').count();if(c)await p.locator('#dlg .choices button').nth(Math.min(choice,c-1)).click();else if(await p.locator('#dlg').isVisible())await p.locator('#dlg').click();await p.waitForTimeout(90);}throw Error('drain')}
async function useNpc(p,id){await p.evaluate(id=>{const n=cur._npcs.find(n=>n.id===id);if(!n)throw Error('no npc '+id);player.x=n.x*TS+(walkable(n.x*TS,n.y*TS+40)?0:40);player.y=n.y*TS+40;snapCam()},id);await p.keyboard.press('e');await p.waitForTimeout(400)}
(async()=>{const b=await chromium.launch({executablePath:exe});const ctx=await b.newContext({viewport:{width:1280,height:720}});
await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded'});
await p.evaluate(sv=>{localStorage.setItem(sv.k,sv.v);localStorage.setItem('xjh.qihe-prologue.latest.v1',sv.k)},sv);
await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.getElementById('qh-continue-0'));
await p.click('#qh-continue-0',{noWaitAfter:true});await p.waitForURL(/play=1/);await p.waitForFunction(()=>typeof mode!=='undefined'&&document.getElementById('loading').hidden&&mode==='scene'&&!busy&&!dlgBusy,null,{timeout:60000});
// 走出药棚：用前门出口
await useNpc(p,'clinic_interior-out');await drain(p);await p.waitForFunction(()=>!busy&&!dlgBusy);
let s=await p.evaluate(()=>({scene:S.scene,npcs:cur._npcs.map(n=>n.id+':'+n.name)}));log('出药棚后',JSON.stringify(s));
await p.screenshot({path:path.join(out,'05-第一夜-村中.png')});
// 找去南村口的出口
const exitId=await p.evaluate(()=>cur._npcs.find(n=>/南村口/.test(n.name||''))?.id);log('exit',exitId);
if(exitId){await useNpc(p,exitId);await drain(p);await p.waitForFunction(()=>!busy&&!dlgBusy)}
s=await p.evaluate(()=>({scene:S.scene,ch:!!S.qiheChapter,npcs:cur._npcs.map(n=>n.id+':'+n.name)}));log('南村口',JSON.stringify(s));
// 把镜头对着徐令仪截图
await p.evaluate(()=>{const n=cur._npcs.find(n=>n.id==='xulingyi');player.x=n.x*TS+60;player.y=n.y*TS+40;snapCam()});await p.waitForTimeout(500);
await p.screenshot({path:path.join(out,'06-第一夜-南村口已站着徐令仪岑霜.png')});
const rec=[];
await useNpc(p,'xulingyi');await p.waitForTimeout(300);
await p.screenshot({path:path.join(out,'07-第一夜-找徐令仪说话.png')});
// 记录菜单
const menu=await p.evaluate(()=>[...document.querySelectorAll('#dlg .choices button')].map(b=>b.innerText));log('菜单',menu);
// 选“有什么要我帮忙的吗”
const idx=menu.findIndex(t=>t.includes('帮忙'));
if(idx>=0){await p.locator('#dlg .choices button').nth(idx).click();
 for(let i=0;i<200;i++){if(await p.evaluate(()=>!busy&&!dlgBusy))break;const t=await p.evaluate(()=>(document.querySelector('#dlg .who')?.innerText||'')+'：'+(document.querySelector('#dlg .txt')?.innerText||''));if(rec[rec.length-1]!==t)rec.push(t);const opts=await p.evaluate(()=>[...document.querySelectorAll('#dlg:not([hidden]) .choices button')].map(b=>b.innerText));if(opts.length){const k=opts.findIndex(o=>o.includes('我去'));if(k>=0)await p.screenshot({path:path.join(out,'08-第一夜-徐令仪托付拜帖.png')});await p.locator('#dlg .choices button').nth(k>=0?k:0).click()}else await p.locator('#dlg').click();await p.waitForTimeout(90)}}
log('对白',rec.join('\n'));
const q=await p.evaluate(()=>({letter:S.prologue.outsiders?.quests,hud:document.querySelector('#hud')?.innerText.split('\n').slice(-4).join(' / '),quests:mnQuests().map(q=>q.t+' | '+q.d+' | '+q.where)}));log(JSON.stringify(q,null,1));
await p.waitForTimeout(1800);
await p.screenshot({path:path.join(out,'09-第一夜-已接拜帖.png')});
await p.keyboard.press('j');await p.waitForTimeout(800);await p.screenshot({path:path.join(out,'10-第一夜-任务面板-拜帖.png')});
log('PANEL',(await p.locator('#panel').innerText()).slice(0,900));
fs.writeFileSync(path.join(__dirname,'info3.json'),JSON.stringify({menu,rec,q},null,1));
log('errors',errs);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
