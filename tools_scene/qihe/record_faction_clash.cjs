// Record compositor frames and successfully played SFX from the isolated actual scene.
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'art_sources/qihe-faction-clash-20261012/video-final');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});try{
 const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8792/?battleReview=clash&holdReview=1&play=1#qihe-map');await p.waitForFunction(()=>typeof QiheFactionClash!=='undefined'&&mode==='scene'&&!busy);await p.evaluate(()=>QiheFactionClash.ready());await p.waitForTimeout(2600);
 await p.mouse.click(30,30);await p.evaluate(()=>{keys={};player.path=null;busy=true;__audio.beginSfxCapture()});
 const cdp=await p.context().newCDPSession(p),frames=[];let last=0,serial=0;
 cdp.on('Page.screencastFrame',e=>{cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});const t=e.metadata.timestamp;if(t-last<1/31)return;last=t;const file=String(serial++).padStart(5,'0')+'.jpg';fs.writeFileSync(path.join(out,file),Buffer.from(e.data,'base64'));frames.push({file,timestamp:t})});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1280,maxHeight:720,everyNthFrame:1});
 await p.evaluate(()=>QiheFactionClash.play());await cdp.send('Page.stopScreencast');
 const sounds=await p.evaluate(()=>__audio.endSfxCapture());assert.deepEqual(errors,[]);assert(frames.length>200);assert(sounds.events.filter(e=>e.name==='clash_blade_hit_20261012').length>=8);
 fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify({viewport:[1280,720],frames,source:'actual compositor frames; no generated video'},null,2));fs.writeFileSync(path.join(out,'sfx-events.json'),JSON.stringify(sounds,null,2));console.log(JSON.stringify({frames:frames.length,sfx:sounds.events.length,errors}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
