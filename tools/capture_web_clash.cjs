// 原版领队交锋（QiheFactionClash.play）按时间截图，与 Godot `--battle=clash` 同时间点对照（看招式特效）。
// 用法：node tools/capture_web_clash.cjs <输出目录> [毫秒,毫秒,…]
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=process.argv[2]||'clash';const times=(process.argv[3]||'1500,3000,4500,6000,7500,9000,10500,12000,13500,15000').split(',').map(Number);
require('fs').mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8792/');await p.waitForTimeout(3000);await p.click('#qh-new-journey');
await p.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&window.QiheFactionClash,null,{timeout:60000});await p.waitForTimeout(1000);
await p.evaluate(()=>{busy=false;dlgBusy=false;document.getElementById('dlg').hidden=true;window.__clashP=QiheFactionClash.play()});
// 零点：第一句喊话框出现（与 Godot 批量截图的 "zero":"clash_caption" 一致）
await p.waitForFunction(()=>{const c=document.getElementById('qh-clash-caption');return c&&!c.hidden},null,{timeout:60000,polling:'raf'});
const t0=Date.now();
for(const t of times){const w=t-(Date.now()-t0);if(w>0)await p.waitForTimeout(w);await p.screenshot({path:`${out}/web_${t}.png`})}
console.log('交锋截图',times.length,'错误',errs.slice(0,3));await b.close()})();
