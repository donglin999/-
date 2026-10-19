'use strict';
// Real game page, disposable browser contexts and the explicit UI-review save key.
// Never connects to the user's browser profile or reads/writes a player journey.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'../review/qihe-journal-adoption-20261010');
const base=process.env.QIHE_TEST_URL||'http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map';
async function fixture(page){
 await page.evaluate(()=>{
  if(saveKey()!=='xjh.qihe-ui.review.v1')throw new Error('Expected independent review save');
  S.prologue.arrival.greeted={叶蘅:true,周婶:true,陈伯:true};
  S.prologue.errands={bowls:'closed',cloth:'none',medicine:'none'};
  S.prologue.outsiders={quests:{letter:{stage:'done',choice:0,rewarded:true},account:{stage:'none'},ledger:{stage:'accepted',rewarded:false}}};
  S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;
  S.qiheChapter.events={'xu-meeting':true};S.qiheChapter.choices={};
  S.qiheChapter.questions={'xulingyi-dispute':true,'censhuang-dispute':true,'shenyanhui-dispute':true};
  window.QiheJournalNotices?.reset(S);save();QiheJianghuUI.open('quest');
 });
 await page.locator('.qjc').waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>!document.getElementById('toast')||getComputedStyle(document.getElementById('toast')).opacity==='0');
}
async function layout(page){return page.evaluate(()=>{
 const r=e=>{const a=e.getBoundingClientRect();return{x:a.x,y:a.y,width:a.width,height:a.height}};
 const root=document.querySelector('.qjc'),reader=root.querySelector('.qjc-reader');
 return{viewport:{width:innerWidth,height:innerHeight},bodyWidth:document.body.scrollWidth,panel:r(document.getElementById('panel')),directory:r(root.querySelector('.qjc-directory')),reader:r(reader),readerWidth:reader.clientWidth,readerScrollWidth:reader.scrollWidth,readerHeight:reader.clientHeight,readerScrollHeight:reader.scrollHeight,tabs:r(root.querySelector('.qjc-tabs')),rows:[...root.querySelectorAll('.qjc-entry')].map(r),font:getComputedStyle(root.querySelector('.qjc-section>p')||root).fontSize,images:[...root.querySelectorAll('img')].map(i=>({source:i.getAttribute('src'),complete:i.complete,width:i.naturalWidth})),storageKeys:Object.keys(localStorage)};
});}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
 const report={kind:'formal-game-journal-integration',url:base,playerBrowserAccessed:false,saveIsolation:'disposable contexts / xjh.qihe-ui.review.v1',captures:[],errors:[],missingAssets:[],checks:[]};
 try{
  for(const viewport of [{width:1600,height:900},{width:1280,height:720},{width:1920,height:1080},{width:740,height:872}]){
   const context=await browser.newContext({viewport,deviceScaleFactor:1}),page=await context.newPage();
   page.on('pageerror',e=>report.errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))report.missingAssets.push({url:r.url(),status:r.status()})});
   await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.QiheJianghuUI&&S&&mode==='scene'&&!busy&&!dlgBusy);await fixture(page);
   const directory=page.locator('.qjc-index-list');
   assert.equal(await page.locator('[data-qj="questFilter"]').count(),2);
   assert.equal(await directory.locator('[data-qj="quest"]').count(),2);
   assert(!/三方对接|取布|护路棍法/.test(await directory.innerText()));
   await directory.locator('[data-id="out:ledger"]').click();
   assert(!/病人药包|没有签名|第十七/.test(await page.locator('.qjc-reader').innerText()));
   for(const [view,file]of [['tasks','task-journal'],['people','character-codex']]){
    await page.locator('[data-qj="journalTab"][data-id="'+view+'"]').click();
    if(view==='people')await directory.locator('[data-id="xulingyi"]').click();
    const measure=await layout(page);
    assert(measure.bodyWidth<=viewport.width,'Body overflow');assert(measure.readerScrollWidth<=measure.readerWidth+1,'Reader horizontal overflow');
    assert.equal(measure.directory.width,viewport.width<=1000?72:220);assert(measure.tabs.x<viewport.width/2,'Legacy tabs CSS leaked');assert(measure.tabs.y<measure.reader.y);
    assert(parseFloat(measure.font)>=18);for(const row of measure.rows)assert(row.height<=80,'Oversized directory row');
    for(const img of measure.images)assert(img.complete&&img.width>0,'Missing image '+img.source);
    assert(!measure.storageKeys.some(k=>/^xjh\.qihe-prologue/.test(k)),'A player journey was touched');
    const text=await page.locator('.qjc-reader').innerText();assert(!/可交谈|第二日傍晚|幕后|标记人物/.test(text));
    const capture=file+'-'+viewport.width+'.png';await page.screenshot({path:path.join(out,capture)});report.captures.push({view,file:capture,layout:measure});
   }
   if(viewport.width===1600){
    await page.locator('[data-qj="journalTab"][data-id="tasks"]').click();await directory.locator('[data-id="out:ledger"]').click();
    const before=await page.evaluate(()=>({silver:S.silver,chapter:JSON.stringify(S.qiheChapter),quests:JSON.stringify(S.prologue.outsiders)}));
    await page.locator('[data-qj="journalPaper"]').click();assert(await page.locator('.qj-drawer').isVisible());assert((await page.locator('.qj-drawer').innerText()).includes('尚待核实'));await page.keyboard.press('Escape');assert(!(await page.locator('.qj-drawer').isVisible()));
    await page.locator('[data-qj="questTrack"]').click();assert.equal(await page.locator('[data-qj="questTrack"]').getAttribute('aria-pressed'),'false');
    await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>S&&mode==='scene'&&!busy&&!dlgBusy);await page.keyboard.press('l');await page.locator('.qjc').waitFor();await directory.locator('[data-id="out:ledger"]').click();assert.equal(await page.locator('[data-qj="questTrack"]').getAttribute('aria-pressed'),'false');
    await page.locator('[data-qj="questFilter"][data-id="done"]').click();assert.equal(await directory.locator('[data-qj="quest"]').count(),2);await directory.locator('[data-id="out:letter"]').click();assert((await page.locator('.qjc-reader').innerText()).includes('6 文'));
    await page.locator('.qjc-reader [data-qj="journalPerson"][data-id="xulingyi"]').click();assert.equal(await page.locator('.qjc-reader h2').innerText(),'徐令仪');
    await page.locator('.qjc-reader [data-qj="journalTask"][data-id="out:letter"]').click();assert.equal(await page.locator('[data-qj="questFilter"][data-id="done"]').getAttribute('class'),'qjc-active');
    await page.locator('[data-qj="journalTab"][data-id="people"]').click();
    for(const id of ['xulingyi','censhuang','shenyanhui','ye','chen','aunt']){await directory.locator('[data-id="'+id+'"]').click();assert.equal(await page.locator('.qjc-reader h2').count(),1)}
    await page.locator('[data-qj="journalCollapse"]').click();assert.equal((await layout(page)).directory.width,72);await directory.locator('[data-id="xulingyi"]').click();assert.equal(await page.locator('.qjc-reader h2').innerText(),'徐令仪');await page.locator('[data-qj="journalCollapse"]').click();
    for(const id of ['party','skill','bag','equip','sys']){await page.locator('[data-qj="page"][data-id="'+id+'"]').click();assert.equal(await page.locator('.qjc').count(),0);assert((await page.locator('#panel').innerText()).length>60)}
    await page.keyboard.press('Escape');await page.keyboard.press('l');await page.locator('.qjc').waitFor();
    await page.locator('[data-qj="journalTab"][data-id="tasks"]').click();await page.locator('[data-qj="questFilter"][data-id="active"]').click();await directory.locator('[data-id="out:ledger"]').click();await page.locator('[data-qj="journalAction"]').click();
    assert(await page.locator('#panel').evaluate(e=>e.hidden));assert(await page.evaluate(()=>QiheNavigation.guide().title.includes('周婶')||QiheNavigation.guide().detail.includes('周婶')));
    const after=await page.evaluate(()=>({silver:S.silver,chapter:JSON.stringify(S.qiheChapter),quests:JSON.stringify(S.prologue.outsiders)}));assert.deepEqual(after,before,'Reading, tracking, navigation or menu switching advanced story');
    await page.evaluate(()=>QiheJianghuUI.open('quest'));await directory.locator('[data-id="main:qihe"]').click();await page.locator('[data-qj="journalAction"]').click();
    await page.locator('#dlg .choices button').filter({hasText:'继续探索'}).click();await page.waitForFunction(()=>!busy&&!dlgBusy);
    assert.equal(await page.evaluate(()=>S.qiheChapter.halfDay),2,'Cancelling the main-story prompt advanced time');
    await page.evaluate(()=>{void QiheChapter.interact('shenyanhui')});await page.locator('#dlg .choices button').filter({hasText:'谈她的身份'}).click();
    await page.locator('#dlg .txt').filter({hasText:'我跑商路'}).waitFor();await page.locator('#dlg').click();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#dlg .more')).visibility!=='hidden');await page.locator('#dlg').click();await page.waitForFunction(()=>!busy&&!dlgBusy);
    const encounter=await page.evaluate(()=>({actual:S.qiheCodex?.people?.shenyanhui,saved:JSON.parse(localStorage.getItem(saveKey()))?.qiheCodex?.people?.shenyanhui}));assert(encounter.actual?.firstPlace);assert.equal(encounter.actual.identity,true);assert.deepEqual(encounter.saved,encounter.actual);assert(!JSON.stringify(encounter).includes('我跑商路'));
    await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>S&&mode==='scene'&&!busy&&!dlgBusy);assert.deepEqual(await page.evaluate(()=>S.qiheCodex.people.shenyanhui),encounter.actual);
    report.checks.push('Real task filters; known paper drawer + Escape; tracking persisted across reload; related profiles/tasks; 72px rail; L menu shortcut; all five other menus; real navigation; no quest, chapter or reward mutation');
    report.checks.push('Main-story confirmation cancel keeps the date; real Shen identity dialogue records first encounter through normal checkpoint and survives reload without storing dialogue text');
   }
   if(viewport.width===740){await page.locator('[data-qj="journalTab"][data-id="tasks"]').click();await page.locator('[data-qj="questFilter"][data-id="done"]').click();assert.equal(await directory.locator('[data-qj="quest"]').count(),2);await directory.locator('[data-id="out:letter"]').click();assert((await page.locator('.qjc-reader').innerText()).includes('6 文'));report.checks.push('740px real game: automatic rail, both status filters, completed reward, no horizontal overflow');}
   await context.close();
  }
  assert.equal(report.errors.length,0);assert.equal(report.missingAssets.length,0);
  report.result='pass';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,captures:report.captures.length,errors:report.errors,missingAssets:report.missingAssets,checks:report.checks}));
 }catch(e){report.result='fail';report.failure=String(e.stack||e);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');throw e}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
