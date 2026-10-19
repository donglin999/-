'use strict';
// Review-only browser checks: uses a disposable profile and never opens the game.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'review/pre-hangao-completion-20261013');
const url='http://127.0.0.1:8792/review/pre-hangao-completion-20261013/';
const report={status:'running',url,errors:[],failedRequests:[],writeRequests:[],captures:[]};
async function select(page,id){await page.locator(`[data-scene="${id}"]`).click();}
async function textHas(page,term){assert.ok((await page.locator('#reader').innerText()).includes(term),term);}
async function capture(page,name){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});await page.screenshot({path:path.join(out,name),fullPage:false});report.captures.push(name);}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1050}});
  await context.addInitScript(()=>{
   localStorage.setItem('review-preserve','local-sentinel');sessionStorage.setItem('review-preserve','session-sentinel');
   window.reviewStorageWrites=[];
   for(const method of ['setItem','removeItem','clear']){
    const original=Storage.prototype[method];Storage.prototype[method]=function(...args){window.reviewStorageWrites.push(method);return original.apply(this,args);};
   }
  });
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)report.failedRequests.push({url:r.url(),status:r.status()});});
  page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))report.writeRequests.push({method:r.method(),url:r.url()});});
  await page.goto(url,{waitUntil:'networkidle'});await page.locator('#reader .line').first().waitFor();
  await page.locator('#filter').selectOption('all');
  const ids=await page.locator('[data-scene]').evaluateAll(a=>a.map(e=>e.dataset.scene));assert.equal(ids.length,46);
  for(const id of ids){await select(page,id);assert.ok((await page.locator('#reader').innerText()).trim(),id);}
  report.readableScenes=ids.length;
  await select(page,'gn_depart');
  for(const [value,term] of [['new','我叫裴知古'],['known','又见面了'],['close','后来呢']]){
   await page.locator('#pei').selectOption(value);await textHas(page,term);
   const text=await page.locator('#reader').innerText();
   if(value==='new')assert.ok(!text.includes('风吹书页')&&!text.includes('后来呢'));
   if(value==='known')assert.ok(!text.includes('上回还说一道去')&&!text.includes('后来呢'));
  }
  report.peiVariants=3;
  await select(page,'gy_zhou_test');
  await page.locator('#route').selectOption('life');assert.equal(await page.locator('#branch').inputValue(),'practical');await textHas(page,'先不打');
  for(const route of ['sword','fist']){await page.locator('#route').selectOption(route);assert.equal(await page.locator('#branch option').count(),2);await page.locator('#branch').selectOption('hasty');await textHas(page,'重来一步');}
  report.examRoutes=3;
  await select(page,'gy_m06');
  for(const [value,term] of [['guided_footwork','试了那段坡'],['assisted_carry','把包分开'],['asked_for_guidance','我拿不准']]){await page.locator('#delivery').selectOption(value);await textHas(page,term);}
  report.deliveryVariants=3;
  await page.locator('#route').selectOption('sword');await select(page,'hg_pack_review');
  await page.locator('#weapon').selectOption('missing');await textHas(page,'我自己还没备剑');
  await page.locator('#weapon').selectOption('ready');await textHas(page,'带这把木剑');report.weaponVariants=2;
  await page.locator('#delivery').selectOption('guided_footwork');
  await page.locator('#footwork').uncheck();assert.equal(await page.locator('#delivery').inputValue(),'assisted_carry');
  await page.locator('#delivery').selectOption('guided_footwork');assert.ok(await page.locator('#footwork').isChecked());report.deliveryFootworkConsistency=true;
  await page.locator('#pei').selectOption('new');
  await select(page,'gy_m02');await page.locator('[data-tab="stage"]').click();
  assert.ok(!(await page.locator('#present').innerText()).includes('周砚'));
  while(!await page.locator('#next').isDisabled())await page.locator('#next').click();
  assert.ok((await page.locator('#present').innerText()).includes('周砚'));
  for(const [value,term] of [['light','能坐着做些木活'],['rest','腿还得养'],['unknown','这封没写他的伤']]){await page.locator('[data-tab="read"]').click();await page.locator('#injury').selectOption(value);await textHas(page,term);}
  report.injuryVariants=3;
  await select(page,'hg_gate');await page.locator('[data-tab="stage"]').click();
  while(!await page.locator('#next').isDisabled())await page.locator('#next').click();
  assert.ok(!(await page.locator('#present').innerText()).includes('殷红缨'));
  assert.ok((await page.locator('#stage-location').innerText()).includes('灰盒'));report.stageEntryExit=true;
  // Walk every currently available choice and its displayed lines, verifying actual actors.
  const walked=await page.evaluate(()=>{
   let scenes=0,branches=0,lines=0;
   const ids=[...document.querySelectorAll('[data-scene]')].map(b=>b.dataset.scene);
   for(const id of ids){
    document.querySelector(`[data-scene="${id}"]`).click();document.querySelector('[data-tab="stage"]').click();
    if(selected!==id)throw Error('scene navigation failed '+id);scenes++;
    const choices=[...document.querySelector('#branch').options].map(o=>o.value);
    for(const value of choices.length?choices:[null]){
     if(value!==null){document.querySelector('#branch').value=value;document.querySelector('#branch').dispatchEvent(new Event('change'));}branches++;
     for(let guard=0;guard<100;guard++){
      const front=[...document.querySelectorAll('[data-actor]')].map(e=>e.dataset.actor),side=[...document.querySelectorAll('[data-roster]')].map(e=>e.dataset.roster);
      const cast=path[cursor].cast||scene().cast;
      if(front.length>3||JSON.stringify([...front,...side].sort())!==JSON.stringify([...cast].sort()))throw Error('cast mismatch '+selected+':'+cursor);
      if(!document.querySelector('#stage-speech').textContent.trim())throw Error('empty line');lines++;
      if(document.querySelector('#next').disabled)break;
      if(guard===99)throw Error('nonterminating scene');document.querySelector('#next').click();
     }
    }
   }
   return {scenes,branches,lines};
  });assert.equal(walked.scenes,46);report.stageWalk=walked;
  await select(page,'hg_aftercare');await page.locator('[data-tab="read"]').click();
  assert.equal(await page.locator('.letter').count(),3);assert.equal(await page.locator('#reader .avatar[alt*="徐令仪"]').count(),0);
  const read=await page.locator('#reader').innerText();assert.ok(read.indexOf('徐令仪')<read.indexOf('三张都留着吧'));
  report.letterOrderAndOffstageSenders=true;
  for(const doc of ['README','pei-and-handoff','staging','implementation']){await page.locator(`[data-tab="${doc}"]`).click();assert.ok((await page.locator('#document').innerText()).length>500,doc);}
  await page.locator('[data-tab="README"]').click();await page.locator('[data-doc="pei-and-handoff"]').click();assert.equal(await page.locator('.tabs .on').getAttribute('data-tab'),'pei-and-handoff');
  await page.locator('[data-tab="lessons"]').click();assert.equal(await page.locator('.lesson-card').count(),6);report.documents=4;report.lessonGroups=6;
  for(const name of ['README','pei-and-handoff','staging','implementation','dialogue']){
   const response=await page.request.get(url+'documents/'+name+'.md');assert.ok(response.ok());assert.equal(await response.text(),fs.readFileSync(path.join(root,'../xiaojianghu/docs/design/pre-hangao-completion-20261013',name+'.md'),'utf8'));
  }report.documentMirrors=5;
  await page.locator('#filter').selectOption('added');assert.equal(await page.locator('[data-scene]').count(),6);
  await page.locator('#search').fill('城门在眼前');assert.equal(await page.locator('[data-scene]').count(),1);
  await select(page,'hg_gate');await page.locator('#search').fill('');await page.locator('#filter').selectOption('all');report.searchAndFilters=true;
  await select(page,'gn_depart');await page.locator('[data-tab="read"]').click();await capture(page,'preview-reader.png');
  await page.locator('[data-tab="stage"]').click();await page.locator('#stage-canvas').scrollIntoViewIfNeeded();await capture(page,'preview-pei-stage.png');
  await select(page,'hg_farewell');await page.locator('[data-tab="stage"]').click();await page.locator('#stage-canvas').scrollIntoViewIfNeeded();await capture(page,'preview-stage.png');
  for(const viewport of [{width:1440,height:1050},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   for(const tab of ['read','stage','README','pei-and-handoff','lessons']){
    await page.locator(`[data-tab="${tab}"]`).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,JSON.stringify({viewport,tab}));
   }
   if(viewport.width===390){await page.locator('[data-tab="read"]').click();await page.evaluate(()=>scrollTo(0,0));await capture(page,'preview-mobile.png');await page.locator('[data-tab="stage"]').click();await page.locator('#stage-canvas').scrollIntoViewIfNeeded();await capture(page,'preview-mobile-stage.png');}
  }report.desktopOverflow=false;report.mobileOverflow=false;
  report.storage=await page.evaluate(()=>({writes:window.reviewStorageWrites,local:Object.entries(localStorage),session:Object.entries(sessionStorage)}));
  assert.deepEqual(report.storage,{writes:[],local:[['review-preserve','local-sentinel']],session:[['review-preserve','session-sentinel']]});
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);assert.deepEqual(report.writeRequests,[]);
  report.status='pass';await context.close();
 }catch(e){report.status='fail';report.failure=e.stack;process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'browser-check.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
 console.log(JSON.stringify(report));
})();
