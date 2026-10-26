// 差役战斗表采用验收：8792 评审入口 ?battleReview=bailiff，无头截待机、普攻（下劈命中帧）、受击各一张，1280 与 1920 两档。
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=__dirname;
(async()=>{const browser=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});const report=[];
try{for(const width of [1280,1920]){
 const ctx=await browser.newContext({viewport:{width,height:Math.round(width*9/16)}}),p=await ctx.newPage(),errors=[],requests=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 p.on('response',r=>{if(/b_qh_bailiff/.test(r.url()))requests.push({url:r.url().replace(/^https?:\/\/[^/]+/,''),status:r.status()})});
 await p.addInitScript(()=>localStorage.setItem('xjh.save','BAILIFF_NORMAL_SAVE_SENTINEL'));
 await p.goto('http://127.0.0.1:8792/?battleReview=bailiff&poseReview=1&play=1#qihe-map',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>typeof B!=='undefined'&&B&&B.foes?.some(u=>u.art==='qh_bailiff')&&mode==='battle',{},{timeout:45000});
 await p.waitForTimeout(1800);
 const info=await p.evaluate(()=>{const u=B.foes.find(u=>u.art==='qh_bailiff'),A=BART.qh_bailiff,im=IMG[A.file];return{name:u.name,lv:u.lv,art:u.art,file:A.file,src:im?.src?.replace(/^https?:\/\/[^/]+/,''),natural:[im?.naturalWidth,im?.naturalHeight],expected:[A.cell[0]*A.cols,A.cell[1]],adult:BATTLE_ADULT.has('qh_bailiff'),skills:u.skills,atkType:u.atkType,saveKey:saveKey(),normal:localStorage.getItem('xjh.save')}});
 assert.equal(info.file,'b_qh_bailiff_hd_20261022');assert.deepEqual(info.natural,info.expected);assert(info.src.includes('assets/production/battle/b_qh_bailiff_hd_20261022.webp'));assert(info.adult);
 assert.equal(info.saveKey,'xjh.qihe-battle.review.v1');assert.equal(info.normal,'BAILIFF_NORMAL_SAVE_SENTINEL');
 const shots=[];
 for(const [k,label] of [['idle','待机'],['atk','普攻'],['hurt','受击']]){
  const st=await p.evaluate(k=>{const u=B.foes.find(u=>u.art==='qh_bailiff'),s=BART.qh_bailiff.anim[k],i=k==='atk'?s.hit:0;BFXI.act(u,k,true);u._reviewFrame=s.f[i];return{anim:u.anim.k,frame:u._reviewFrame}},k);
  await p.waitForTimeout(500);const file=`${width}-${k}.png`;await p.screenshot({path:path.join(out,file)});shots.push({anim:k,label,...st,file});
 }
 assert.deepEqual(errors,[]);report.push({width,status:'pass',info,requests,shots,errors});await ctx.close();
}}finally{await browser.close()}
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({date:'2026-10-23',entry:'http://127.0.0.1:8792/?battleReview=bailiff&poseReview=1&play=1#qihe-map',runs:report},null,2));
console.log(JSON.stringify(report.map(r=>({width:r.width,status:r.status,natural:r.info.natural,shots:r.shots.map(s=>s.file+':'+s.frame)}))));
})().catch(e=>{console.error(e);process.exitCode=1});
