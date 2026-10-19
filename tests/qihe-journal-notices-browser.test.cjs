'use strict';
// Exercise normal NPC/checkpoint paths in disposable UI-review journeys only.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'..',process.env.QIHE_NOTICE_REVIEW_DIR||'review/qihe-journal-notices-20261010');
const base=process.env.QIHE_TEST_URL||'http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map';
const idle=page=>page.waitForFunction(()=>window.QiheJournalNotices&&S&&mode==='scene'&&!busy&&!dlgBusy);
async function fixture(page){
 await page.evaluate(()=>{
  if(saveKey()!=='xjh.qihe-ui.review.v1')throw new Error('Expected independent review save');
  S.prologue.arrival.greeted={叶蘅:true,周婶:true,陈伯:true};
  S.prologue.errands={bowls:'none',cloth:'none',medicine:'none'};
  S.prologue.outsiders={quests:{letter:{stage:'none'},account:{stage:'none'},ledger:{stage:'none'}}};
  S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;
  S.qiheChapter.events={'xu-meeting':true};S.qiheChapter.questions={};S.qiheChapter.choices={};
  delete S.qiheCodex;
  QiheJournalNotices.reset(S);save();hud();
 });
 assert.equal(await page.evaluate(()=>QiheJournal.people(S).some(p=>p.id==='shenyanhui')),false);
 assert.equal(await page.evaluate(()=>QiheJournalNotices.pending().length),0);
}
async function endLine(page){
 await page.locator('#dlg .txt').waitFor();
 await page.locator('#dlg').click();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#dlg .more')).visibility!=='hidden');
 await page.locator('#dlg').click();
}
async function identity(page){
 await page.evaluate(async()=>{await goScene('qh_east');const npc=npcsOf(cur).find(n=>n.name==='沈雁回');if(!npc)throw new Error('Shen NPC not present');void interact(npc)});
 await page.locator('#dlg .choices button').filter({hasText:'谈她的身份'}).click();
 await page.locator('#dlg .txt').filter({hasText:'我跑商路'}).waitFor();
 assert.equal(await page.locator('#qh-journal-notice').isVisible(),false,'Notice interrupted a dialogue');
 await endLine(page);await idle(page);
}
async function capture(page,file,report){
 await page.waitForFunction(()=>[...document.querySelectorAll('#qh-journal-notice img')].every(i=>i.complete&&i.naturalWidth>0));
 await page.evaluate(()=>Promise.all(document.getElementById('qh-journal-notice').getAnimations().map(a=>a.finished.catch(()=>{}))));
 const layout=await page.evaluate(()=>{
  const el=document.getElementById('qh-journal-notice'),r=el.getBoundingClientRect();
  return{viewport:[innerWidth,innerHeight],box:{x:r.x,y:r.y,width:r.width,height:r.height},text:el.innerText,style:{background:getComputedStyle(el).backgroundImage,border:getComputedStyle(el).borderWidth,titleFont:getComputedStyle(el.querySelector('strong')).fontSize,bodyFont:getComputedStyle(el.querySelector('p')).fontSize},bodyWidth:document.body.scrollWidth,cardWidth:el.clientWidth,cardScrollWidth:el.scrollWidth,storageKeys:Object.keys(localStorage),images:[...el.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),width:i.naturalWidth}))};
 });
 assert(layout.box.x>=0&&layout.box.x+layout.box.width<=layout.viewport[0]);
 assert(layout.box.y>=0&&layout.box.y+layout.box.height<=layout.viewport[1]);
 assert(layout.bodyWidth<=layout.viewport[0]&&layout.cardScrollWidth<=layout.cardWidth+1);
 assert(!layout.storageKeys.some(k=>/^xjh\.qihe-prologue/.test(k)),'A player journey was touched');
 await page.screenshot({path:path.join(out,file)});report.captures.push({file,layout});
 const clip={x:Math.max(0,layout.box.x-75),y:Math.max(0,layout.box.y-85),width:Math.min(410,layout.viewport[0]-Math.max(0,layout.box.x-75)),height:Math.min(layout.box.height+135,layout.viewport[1]-Math.max(0,layout.box.y-85))};
 await page.screenshot({path:path.join(out,file.replace('.png','-detail.png')),clip});
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
 const report={kind:'formal-game-journal-notices',url:base,playerBrowserAccessed:false,saveIsolation:'disposable contexts / xjh.qihe-ui.review.v1',captures:[],checks:[],errors:[],missingAssets:[]};
 try{
  for(const viewport of [{width:1600,height:900},{width:740,height:872}]){
   const context=await browser.newContext({viewport,deviceScaleFactor:1}),page=await context.newPage();page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(30000);
   page.on('pageerror',e=>report.errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))report.missingAssets.push({url:r.url(),status:r.status()})});
   await page.goto(base,{waitUntil:'networkidle'});await idle(page);await fixture(page);
   const before=await page.evaluate(()=>({chapter:JSON.stringify(S.qiheChapter),silver:S.silver,quests:JSON.stringify(S.prologue.outsiders.quests)}));
   await identity(page);
   const notice=page.locator('#qh-journal-notice');await notice.waitFor({state:'visible'});
   assert.equal(await notice.getAttribute('data-kind'),'new');assert.equal(await notice.getAttribute('data-people'),'shenyanhui');
   assert((await notice.innerText()).includes('结识了沈雁回'));assert((await notice.innerText()).includes('这段相识，已记入人物图鉴。'));
   await capture(page,'new-acquaintance-'+viewport.width+'.png',report);
   const after=await page.evaluate(()=>({chapter:JSON.stringify(S.qiheChapter),silver:S.silver,quests:JSON.stringify(S.prologue.outsiders.quests)}));
   // The actual identity answer legitimately sets the corresponding question flag.
   assert.equal(after.silver,before.silver);assert.equal(after.quests,before.quests);
   assert.equal(await page.evaluate(()=>S.qiheChapter.halfDay),2);
   assert.equal(await page.evaluate(()=>QiheJournalNotices.pending().length),0,'First acquaintance and identity were not merged');
   if(viewport.width===1600){
    await page.keyboard.press('l');await page.locator('.qjc').waitFor();
    assert.equal(await page.locator('.qjc-reader h2').innerText(),'沈雁回');assert.equal(await notice.isVisible(),false);
    await page.keyboard.press('Escape');await idle(page);
    const encounter=await page.evaluate(()=>({actual:S.qiheCodex.people.shenyanhui,saved:JSON.parse(localStorage.getItem(saveKey())).qiheCodex.people.shenyanhui}));
    assert(encounter.actual.identity&&encounter.actual.firstPlace);assert.deepEqual(encounter.saved,encounter.actual);
    // Repeat the real NPC question, which must not produce another notice.
    await identity(page);assert.equal(await page.evaluate(()=>QiheJournalNotices.pending().length),0);assert.equal(await notice.isVisible(),false);
    await page.reload({waitUntil:'networkidle'});await idle(page);
    assert.equal(await page.evaluate(()=>QiheJournalNotices.pending().length),0);assert.equal(await notice.isVisible(),false);
    assert.deepEqual(await page.evaluate(()=>S.qiheCodex.people.shenyanhui),encounter.actual);
    report.checks.push('Real Shen NPC identity: dialogue deferred, one merged new-person card, L targets Shen; normal checkpoint persisted the encounter; repeated identity and reload are silent');
    // Set only the prerequisite in an isolated fixture, then use the actual witness branch.
    await page.evaluate(()=>{if(saveKey()!=='xjh.qihe-ui.review.v1')throw new Error('Expected independent review save');S.prologue.outsiders.quests.ledger={stage:'accepted',rewarded:false};QiheJournalNotices.reset(S);save();hud()});
    await page.evaluate(async()=>{await QihePrologue.goLocal('clinic_interior');const npc=npcsOf(cur).find(n=>n.name==='周婶');if(!npc)throw new Error('Aunt NPC not present');void interact(npc)});
    await page.locator('#dlg .choices button').filter({hasText:'药单上的两道数'}).click();
    for(const text of ['河埠两篓是货药','册上把三篓','今天没人来验','我去问河埠']){
     await page.locator('#dlg .txt').filter({hasText:text}).waitFor();
     assert.equal(await notice.isVisible(),false,'A story update interrupted a dialogue');await endLine(page);
    }
    await idle(page);assert.equal(await page.evaluate(()=>S.prologue.outsiders.quests.ledger.stage),'checked');
    await notice.waitFor({state:'visible'});assert.equal(await notice.getAttribute('data-kind'),'updated');
    assert.equal(await notice.getAttribute('data-people'),'shenyanhui,aunt');assert((await notice.innerText()).includes('沈雁回、周婶的故事，又添一笔'));
    assert((await notice.innerText()).includes('最新见闻已记入人物图鉴。'));
    await capture(page,'updated-stories-1600.png',report);
    // A scene transition can clear `busy` while an enclosing cast is still active.
    const castToken=await page.evaluate(()=>DialogueStage.begin({id:'journal-notice-review'}));
    await notice.waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>busy||dlgBusy),false);
    await page.evaluate(token=>DialogueStage.end(token),castToken);await notice.waitFor({state:'visible'});
    // Menus temporarily hide/pause the notice; the card returns on free exploration.
    await page.evaluate(()=>QiheJianghuUI.open('party'));await notice.waitFor({state:'hidden'});
    await page.keyboard.press('Escape');await notice.waitFor({state:'visible'});
    await notice.locator('[data-qjn="view"]').click();await page.locator('.qjc').waitFor();
    assert.equal(await page.locator('.qjc-reader h2').innerText(),'沈雁回');
    await page.locator('.qjc-reader [data-qj="journalTask"][data-id="out:ledger"]').click();
    assert((await page.locator('.qjc-reader').innerText()).includes('用途已核'));
    await page.locator('[data-qj="journalPaper"]').click();assert((await page.locator('.qj-drawer').innerText()).includes('两篓货药'));
    await page.keyboard.press('Escape');await page.keyboard.press('Escape');await idle(page);
    assert.equal(await page.evaluate(()=>QiheJournalNotices.pending().length),0);assert.equal(await notice.isVisible(),false);
    const stage=await page.evaluate(()=>JSON.parse(localStorage.getItem(saveKey())).prologue.outsiders.quests.ledger.stage);assert.equal(stage,'checked');
    report.checks.push('Actual Aunt drug-ledger witness updates the known Shen and Aunt together after dialogue and the existing toast; active cast and menu hide/pause; button opens Shen and related verified paper; normal save remains checked');
   }else{
    await notice.locator('[data-qjn="dismiss"]').click();assert.equal(await notice.isVisible(),false);
    assert.equal(await page.evaluate(()=>QiheJournalNotices.pending().length),0);
    report.checks.push('740px card: portrait loads, no card/body overflow, natural copy and dismiss work');
   }
   await context.close();
  }
  assert.equal(report.errors.length,0);assert.equal(report.missingAssets.length,0);report.result='pass';
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({result:report.result,captures:report.captures.length,errors:report.errors,missingAssets:report.missingAssets,checks:report.checks}));
 }catch(e){report.result='fail';report.failure=String(e.stack||e);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');throw e}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
