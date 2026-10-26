const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/03-素材缺失';
const orig='/private/tmp/claude-501/-Users-wuxiuxiang-project-luotuozhuan/cee2f540-8d09-4e39-a916-75d3855a0702/scratchpad/orig/';
(async()=>{const b=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const report={};
for(const mode of ['before','after']){fs.mkdirSync(path.join(out,mode),{recursive:true});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const bad=[];
 p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url().replace(/^.*8792\//,''))});
 if(mode==='before'){for(const f of ['qihe-journal.js','qihe-ui-model.js'])await p.route(new RegExp('/js/'+f.replace('.','\\.')+'\\?'),r=>r.fulfill({body:fs.readFileSync(orig+f,'utf8'),contentType:'application/javascript'}))}
 await p.goto('http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map');await p.waitForFunction(()=>typeof S!=='undefined'&&S?.qiheChapter&&window.QiheJianghuUI,null,{timeout:30000});await p.waitForTimeout(1500);
 await p.evaluate(()=>{if(saveKey()!=='xjh.qihe-ui.review.v1')throw Error('save key');S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events={'xu-meeting':true,'c1-00b':true};S.qiheChapter.questions={'xulingyi-dispute':true,'censhuang-dispute':true,'shenyanhui-dispute':true};S.prologue.arrival.borrowed=true;save();});
 await p.waitForTimeout(800);await p.screenshot({path:path.join(out,mode,'hud.png')});
 await p.evaluate(()=>QiheJianghuUI.open('quest'));await p.locator('.qjc').waitFor();
 await p.locator('[data-qj="journalTab"][data-id="people"]').click();await p.waitForTimeout(500);
 const ids=await p.evaluate(()=>[...document.querySelectorAll('.qjc [data-id]')].map(e=>e.dataset.id));
 report[mode]={ids:[...new Set(ids)],shots:[]};
 for(const id of ['xulingyi','censhuang','shenyanhui','song']){const l=p.locator(`.qjc-index-list [data-id="${id}"], .qjc [data-qj="journalPerson"][data-id="${id}"]`).first();if(!await l.count())continue;await l.click();await p.waitForTimeout(700);
  const im=await p.evaluate(()=>[...document.querySelectorAll('.qjc img')].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})));
  await p.screenshot({path:path.join(out,mode,'codex-'+id+'.png')});report[mode].shots.push({id,im})}
 report[mode].bad=bad;await ctx.close()}
fs.writeFileSync(path.join(out,'codex-report.json'),JSON.stringify(report,null,1));console.log(JSON.stringify(report,null,1).slice(0,3000));await b.close()})();
