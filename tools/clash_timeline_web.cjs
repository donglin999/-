// 原版领队交锋的节奏：以第一句喊话出现为零点，记下每句喊话、每一步横幅（showName）出现的时刻（毫秒）。
// 与 Godot `--battle=clash --clash-timeline`（无头即可）打印的 [clash-t] 行对照。用法：node tools/clash_timeline_web.cjs
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('http://127.0.0.1:8792/');await p.waitForTimeout(3000);await p.click('#qh-new-journey');
await p.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&window.QiheFactionClash,null,{timeout:60000});await p.waitForTimeout(1000);
await p.evaluate(()=>{window.__tl=[];let t0=-1,lastCap='',lastBan=null;const mark=s=>{const n=performance.now();if(t0<0)t0=n;__tl.push([Math.round(n-t0),s])};
 (function loop(){const c=document.getElementById('qh-clash-caption');const cap=c&&!c.hidden?c.textContent:'';if(cap&&cap!==lastCap)mark('喊 '+(c.querySelector('b')?.textContent||''));lastCap=cap;
  if(typeof B!=='undefined'&&B&&B.banner&&B.banner!==lastBan&&t0>=0){lastBan=B.banner;mark('步 '+B.banner.t)}requestAnimationFrame(loop)})();
 busy=false;dlgBusy=false;document.getElementById('dlg').hidden=true;window.__done=false;QiheFactionClash.play().then(()=>__done=true)});
await p.waitForFunction(()=>window.__done,null,{timeout:120000});
for(const [t,s] of await p.evaluate(()=>__tl))console.log(String(t).padStart(6),s);await b.close()})();
