// Capture battle/canvas behavior without blocking on unrelated font downloads.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'art_sources/qihe-clash-jia-20261014/browser');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});const report=[];
try{for(const width of [1280,1920]){
 const ctx=await browser.newContext({viewport:{width,height:Math.round(width*9/16)},recordVideo:width===1280?{dir:path.join(out,'video'),size:{width:1280,height:720}}:undefined}),p=await ctx.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await p.addInitScript(()=>{localStorage.setItem('xjh.save','CLASH_NORMAL_SAVE_SENTINEL');window.__clashFrames={};const capture=()=>{const q=window.QiheFactionClash;if(q?.presentation){const d=q.presentation,id=d.skill;for(const [phase,time]of [['start',d.hitAt*.4],['hit',d.hitAt+80],['end',d.dur-100]]){const key=id+'-'+phase;if(d.elapsed>=time&&!window.__clashFrames[key])window.__clashFrames[key]={time:d.elapsed,fxStatus:d.fxStatus,targets:d.targets,activeFx:q.active?.skill||null,motion:d.motion,stationary:d.stationary,caster:(()=>{const u=q.state.units[QiheClashData.sequence.find(s=>s.skill===id).actor];return{x:u.x,y:u.y,ox:u.ox||0,oy:u.oy||0,anim:u.anim?.k||'idle'}})(),origin:d.casterOrigin,png:document.getElementById('cv').toDataURL('image/png')}}}requestAnimationFrame(capture)};requestAnimationFrame(capture)});
 await p.goto('http://127.0.0.1:8792/?battleReview=clash&play=1#qihe-map',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.QiheFactionClash?.playing&&typeof B!=='undefined'&&B?.units.length===6);
 const before=await p.evaluate(()=>JSON.stringify(S));await p.mouse.click(30,30);
 await p.waitForFunction(()=>document.querySelector('#qh-clash-caption b')?.textContent==='岑霜'&&!document.getElementById('qh-clash-caption').hidden);
 await p.screenshot({path:path.join(out,`${width}-cast.png`)});
 await p.keyboard.press('Escape');await p.keyboard.press('Space');await p.keyboard.press('q');
 await p.waitForFunction(()=>document.querySelector('#qh-clash-caption b')?.textContent==='沈雁回'&&!document.getElementById('qh-clash-caption').hidden,{},{timeout:45000});
 await p.screenshot({path:path.join(out,`${width}-stop.png`)});
 await p.waitForFunction(()=>!window.QiheFactionClash.playing&&window.__qiheClashLast?.result==='stopped',{},{timeout:20000});
 const data=await p.evaluate(()=>({player:JSON.stringify(S),result:window.__qiheClashLast,normal:localStorage.getItem('xjh.save'),key:saveKey(),frames:window.__clashFrames,mode,Bclear:B===null,uiClear:!document.body.classList.contains('qh-faction-clash')}));
 assert.equal(data.player,before);assert.equal(data.normal,'CLASH_NORMAL_SAVE_SENTINEL');assert.equal(data.key,'xjh.qihe-clash.review.v1');assert(data.Bclear&&data.uiClear);assert.equal(data.result.log.filter(x=>['am_s1','am_s3','cs_whip_s1','cs_whip_s2'].includes(x.skill)).length,4);
 for(const [key,value]of Object.entries(data.frames)){fs.writeFileSync(path.join(out,`${width}-${key}.png`),Buffer.from(value.png.split(',')[1],'base64'));delete value.png}assert.equal(Object.keys(data.frames).length,12);for(const f of Object.values(data.frames)){assert.equal(f.motion,'cast');assert(f.stationary);assert.deepEqual({...f.caster,anim:undefined},{...f.origin,anim:undefined});assert(['cast','idle'].includes(f.caster.anim));}for(const id of ['am_s3','cs_whip_s2']){const r=data.result.log.find(a=>a.skill===id);assert.equal(r.hits.length,3);assert.equal(data.frames[id+'-hit'].activeFx,id);assert.equal(data.frames[id+'-hit'].fxStatus,'ready')}assert.equal(data.result.units.cen.lv,38);assert.equal(data.result.units.xu.lv,22);
 // Actual exception in a staged action must still restore battle UI and the player.
 if(width===1280){const failed=await p.evaluate(async()=>{const old=QiheClashRules.impact,saved=JSON.stringify(S);QiheClashRules.impact=()=>{throw Error('injected action failure')};let message;try{await QiheFactionClash.play()}catch(e){message=e.message}finally{QiheClashRules.impact=old}return{message,unchanged:saved===JSON.stringify(S),clear:B===null&&!QiheFactionClash.playing&&!document.body.classList.contains('qh-faction-clash')}});assert.equal(failed.message,'injected action failure');assert(failed.unchanged&&failed.clear)}
 assert.deepEqual(errors,[]);report.push({width,status:'pass',mode:data.mode,playerUnchanged:true,normalSaveUntouched:true,result:data.result,frames:data.frames,errors});await ctx.close();
}}finally{await browser.close()}
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.map(r=>({width:r.width,status:r.status,skills:r.result.log.filter(a=>['am_s1','am_s3','cs_whip_s1','cs_whip_s2'].includes(a.skill)).map(a=>a.skill),frames:Object.keys(r.frames).length,errors:r.errors}))));
})().catch(e=>{console.error(e);process.exitCode=1});
