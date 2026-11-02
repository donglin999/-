process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
// Real story and battle flow; UI clicks choose rescue route and enable road auto-battle.
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../art_sources/qihe-clash-jia-20261014/browser-tail');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});const reports=[];
try{for(const route of ['chen'])/* 2026-11-02 起没有救人二选一 */{const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],seen=new Map();let evidenceStarted=false,morning=false;
p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('xjh.save','FINALE_SENTINEL'));
await p.goto('http://127.0.0.1:8792/?battleReview=clash&tail=1&play=1#qihe-map');await p.mouse.click(20,20);const deadline=Date.now()+200000;
while(Date.now()<deadline){const state=await p.evaluate(()=>{const d=document.getElementById('dlg'),cg=document.querySelector('#qh-fire-cg');return{stage:window.QiheChapter?.state().stage,arrived:!!window.QiheChapter?.state().events?.arrival,done:!!window.QiheChapter?.state().events?.['evidence-v2'],busy:typeof busy!=='undefined'&&busy,dlg:d&&!d.hidden,text:d?.querySelector('.txt')?.textContent,options:d&&!d.hidden?[...d.querySelectorAll('.choices button')].map(x=>x.textContent):[],cg:cg?.dataset.shot,src:cg?.querySelector('img')?.src,clash:window.QiheFactionClash?.playing,auto:typeof B!=='undefined'&&B&&!B.opt.factionClash&&!B.auto&&!document.querySelector('#bt-auto')?.hidden}});
if(state.cg&&!seen.has(state.cg)){seen.set(state.cg,state.src);await p.screenshot({path:path.join(out,route+'-'+state.cg+'.png')})}
if(state.text?.includes('次日清晨'))morning=true;
if(state.done&&!state.busy)break;
if(state.options.length){const idx=state.options.findIndex(x=>x.includes('救陈伯'));await p.locator('#dlg .choices button').nth(idx<0?0:idx).click({timeout:3000}).catch(()=>{})}
else if(state.dlg){await p.locator('#dlg .txt').click({force:true,timeout:3000}).catch(()=>{})}   /* 两句之间文本框会短暂隐藏，点空了下一轮再点 */
else if(state.auto){await p.locator('#bt-auto').click({timeout:3000}).catch(()=>{})}
else if(state.stage==='refuge'&&state.arrived&&!state.busy&&!evidenceStarted)/* 2026-11-02：等到达对话放完再对证，否则抢在剧情运行中触发会被挡掉、只触发一次就干等到超时 */{evidenceStarted=true;await p.evaluate(()=>{window.__evidencePromise=QiheChapter.evidence().catch(e=>{window.__evidenceError=e.message})})}
await p.waitForTimeout(180);
}
const result=await p.evaluate(()=>({chapter:QiheChapter.state(),normal:localStorage.getItem('xjh.save'),clash:window.__qiheClashLast,voice:CharacterVoice.playing,error:window.__evidenceError}));
assert.equal(result.chapter.clashVersion,3);assert.equal(result.chapter.rescue,route);assert.equal(result.chapter.roadResult,'win');assert(result.chapter.events['evidence-v2']);assert.equal(result.normal,'FINALE_SENTINEL');assert.equal(result.clash.log.length,8);assert.equal(result.chapter.coreOwner,'叶蘅');assert(morning);assert.deepEqual(errors,[]);assert(!result.error);
for(const shot of ['ignition','cen','shen','evacuation'])assert(seen.get(shot)?.includes('_night_20261014.webp'),shot);assert(seen.has('xu'));
reports.push({route,cgs:Object.fromEntries(seen),morning,roadResult:result.chapter.roadResult,chenCare:result.chapter.chenCare,normalSaveUntouched:true,errors});console.log('PASS real finale '+route+' / 5 CGs / road victory / morning evidence');await p.close();}
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(reports,null,2));}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
