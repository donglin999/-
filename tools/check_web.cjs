// Web 导出版无头浏览器检查（不开窗口）：载入 → 标题页截图 → 点“从头开始” → 等开场截图；打印素材包加载日志与报错。
// 用法：node tools/check_web.cjs <输出目录> [地址，默认 http://127.0.0.1:8799/index.html]
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=process.argv[2]||'webcheck';const url=process.argv[3]||'http://127.0.0.1:8799/index.html';require('fs').mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:720}});const logs=[],errs=[];
p.on('console',m=>{const t=m.text();if(m.type()==='error')errs.push(t);else if(/素材包|Godot Engine|OpenGL/.test(t))logs.push(t)});p.on('pageerror',e=>errs.push(String(e)));
const t0=Date.now();await p.goto(url+'?v='+Date.now());
await p.waitForFunction(()=>!document.getElementById('status')||getComputedStyle(document.getElementById('status')).display==='none'||document.getElementById('status').hidden,null,{timeout:120000}).catch(()=>{});
await p.waitForTimeout(6000);console.log('标题页出现约',Date.now()-t0,'ms');await p.screenshot({path:out+'/title.png'});
await p.mouse.click(200,463);await p.waitForTimeout(12000);await p.screenshot({path:out+'/opening.png'});
await p.waitForTimeout(8000);
console.log(logs.join('\n'));console.log('报错',errs.length,errs.slice(0,5).join('\n'));await b.close()})();
