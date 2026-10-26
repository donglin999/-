'use strict';
// 2026-10-23 剧本二：8792 无头走第一夜（一次性浏览器上下文，不碰玩家存档）。
//   第一段：现状（运行时读编译产物 js/story-data/，ink 改稿未 --approve，仍是旧台词；任务面板与行程提示是本轮 js 改动）。
//   第二段：预览（把临时副本编译出的改稿 story-data 注入页面，只在这个一次性上下文里生效），截旁听与交差。
// 用法：node walk.cjs <临时副本 story-data 目录>
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),fs=require('fs');
const out=__dirname,exe=process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const draftDir=process.argv[2];const url='http://127.0.0.1:8792/';const log=[];const L=(...a)=>{const s=a.join(' ');log.push(s);console.log(s);fs.appendFileSync(path.join(__dirname,'walk-progress.txt'),s+'\n')};
(async()=>{const b=await chromium.launch({executablePath:exe});const ctx=await b.newContext({viewport:{width:1280,height:720}});
await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const st=()=>p.evaluate(()=>({battle:typeof battle!=='undefined'&&!!battle,mode,busy,dlgBusy,arr:S?.prologue?.arrival?.stage,who:document.querySelector('#dlg .who')?.innerText,txt:document.querySelector('#dlg .txt')?.innerText,dlg:!document.getElementById('dlg').hidden,panel:!document.getElementById('panel').hidden}));
// 推进对白：want 为要选的选项文字片段列表；shotAt 为 {文字片段:文件名}
async function drain(want=[],shotAt={},max=400){let last='';for(let i=0;i<max;i++){const s=await st();
  if(s.txt&&s.txt!==last){last=s.txt;L('  ',(s.who||'')+'：'+s.txt);for(const[k,f]of Object.entries(shotAt))if(s.txt.includes(k)){await p.waitForTimeout(350);await p.screenshot({path:path.join(out,f)});L('   〔截图 '+f+'〕');delete shotAt[k]}}
  const btn=p.locator('#dlg:not([hidden]) .choices button');const n=await btn.count();
  if(n){const texts=await btn.allInnerTexts();L('   【选项】'+texts.join(' ／ '));let k=texts.findIndex(t=>want.some(w=>t.includes(w)));if(k<0)k=0;L('   → '+texts[k]);
    for(const[kk,f]of Object.entries(shotAt))if(texts.some(t=>t.includes(kk))){await p.screenshot({path:path.join(out,f)});L('   〔截图 '+f+'〕');delete shotAt[kk]}
    await btn.nth(k).click().catch(()=>{});await p.waitForTimeout(150);continue}
  if(s.dlg){await p.locator('#dlg').click({timeout:1000}).catch(()=>{});await p.waitForTimeout(120);continue}
  if(s.mode==='battle'||s.battle){await p.keyboard.press('j').catch(()=>{});await p.waitForTimeout(200);continue}
  if(!s.busy&&!s.dlgBusy&&s.mode==='scene')return;await p.waitForTimeout(150)}}
const act=async(name,want=[],shotAt={})=>{L('▶ '+name);await p.evaluate(n=>{window.__done=false;Promise.resolve(QihePrologue.actions[n]()).finally(()=>{window.__done=true})},name);await p.waitForTimeout(300);await drain(want,shotAt);await p.waitForFunction(()=>window.__done,null,{timeout:20000}).catch(()=>L('  （等待超时）'))};
const journalText=()=>p.evaluate(()=>[questLine(),...mnQuests().map(q=>q.t+'：'+q.d)].join('\n'));
async function shotJ(file){await p.keyboard.press('j');await p.waitForTimeout(700);await p.screenshot({path:path.join(out,file)});L('〔截图 '+file+'〕');await p.keyboard.press('Escape');await p.waitForTimeout(500);await p.evaluate(()=>{if(!document.getElementById('panel').hidden){try{QiheJianghuUI.close?.()}catch(e){}}});await p.waitForTimeout(300);L('  面板已关：'+await p.evaluate(()=>document.getElementById('panel').hidden))}
async function shotPanel(file){const r=await p.evaluate(()=>{try{if(window.QiheJianghuUI?.open){QiheJianghuUI.open('quest');return 'open(quest)'}}catch(e){return 'err '+e.message}return 'none'});L('任务面板打开方式：'+r);await p.waitForTimeout(800);await p.screenshot({path:path.join(out,file)});L('〔截图 '+file+'〕');const t=await p.evaluate(()=>document.getElementById('panel')?.innerText||'');L('任务面板文字：'+t.replace(/\n+/g,' | ').slice(0,600));await p.keyboard.press('Escape');await p.waitForTimeout(400);await p.evaluate(()=>{if(!document.getElementById('panel').hidden&&window.closePanel)closePanel()})}
await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.getElementById('qh-new-journey'));
await p.click('#qh-new-journey',{noWaitAfter:true});await p.waitForURL(/play=1/);await p.waitForFunction(()=>typeof mode!=='undefined'&&document.getElementById('loading').hidden,null,{timeout:60000});
L('== 新开一局，推进到进村结束');for(let i=0;i<60;i++){await drain([],{},200);const s=await st();L('  进度',JSON.stringify({...s,txt:undefined}));if(s.arr==='done'&&!s.busy&&!s.dlgBusy)break;await p.waitForTimeout(300)}
const base=await p.evaluate(()=>JSON.stringify(S));
L('== 第一段：现状（旧台词＋本轮 js）');L('行程：'+await journalText());
await p.screenshot({path:path.join(out,'01-现状-进村后-行程提示.png')});
await act('aunt',['碗']);await act('aunt',['布']);await act('aunt',['药']);
L('行程：'+await journalText());await shotJ('02-现状-行记-下一步提示与三条旧任务.png');
await act('chen',['这位客人'],{'行舟早年的朋友':'04-现状-旧台词旁听-还碗后多问一句.png'});
L('errors',JSON.stringify(errs));
if(draftDir){L('== 第二段：预览（注入未批准改稿的编译产物，仅本上下文）');
 await p.evaluate(b=>{S=JSON.parse(b);save()},base);await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>typeof mode!=='undefined'&&document.getElementById('loading').hidden&&mode==='scene'&&!busy&&!dlgBusy,null,{timeout:60000}).catch(async()=>{await drain();});
 for(const f of ['qihe_errand_aunt','qihe_errand_chen','qihe_errand_cloth','qihe_errand_elder','qihe_first_night'])await p.addScriptTag({content:fs.readFileSync(path.join(draftDir,f+'.js'),'utf8')});
 L('行程：'+await journalText());
 await act('aunt',['三样都交给我'],{'三样都交给我':'05-预览-周婶一次托付三处.png'});
 L('行程：'+await journalText());await shotJ('06-预览-行记-接下后.png');
 await act('chen',['站在门边'],{'站在门边':'07-预览-陈伯家-听或不听.png','行舟早年的朋友':'08-预览-陈伯家-旁听周砚.png'});
 await act('cloth',['在门口听'],{'有只旧玉匣肯卖':'09-预览-客栈-旁听帮众.png'});
 await act('elder',['在一旁听'],{'作不得数':'10-预览-老人家门口-旁听差役.png'});
 L('行程：'+await journalText());await shotJ('11-预览-行记-三处办完待交差.png');
 await act('aunt',[],{'路上听着什么了':'12-预览-回药棚交差.png'});
 L('行程：'+await journalText());L('金创药：'+await p.evaluate(()=>S.bag?.pill||0));await shotJ('13-预览-行记-已办完.png');
 await act('relic',[]);
 await act('rest',['躺下睡觉','功法','玉匣','验过'],{'三拨人':'14-预览-过夜-三处都说了.png'});
 L('errors',JSON.stringify(errs));}
fs.writeFileSync(path.join(out,'walk-log.txt'),log.join('\n')+'\n');await b.close()})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'walk-log.txt'),log.join('\n')+'\n'+e.stack);process.exit(1)});
