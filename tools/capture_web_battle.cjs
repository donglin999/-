// 原版：开新旅程，一路推进到后山遇狼战斗开场，等指定毫秒后截 #game；可选按键序列（如 Enter）后再截。
// 用法：node tools/capture_web_battle.cjs --wait=3000 --out=web_battle.png [--keys=Enter,Enter --out2=...]
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const A=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,...v]=a.replace(/^--/,'').split('=');return [k,v.join('=')||'1']}));
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:{width:1312,height:774}});await p.goto('http://127.0.0.1:8792/');await p.waitForTimeout(3000);await p.click('#qh-new-journey');
const end=Date.now()+180000;
while(Date.now()<end){await p.waitForTimeout(150);const s=await p.evaluate(()=>({m:typeof mode!=='undefined'?mode:'',n:document.querySelectorAll('#dlg .choices button').length,dlg:!document.getElementById('dlg').hidden}));
 if(s.m==='battle')break;if(s.n)await p.locator('#dlg .choices button').first().click({timeout:2000}).catch(()=>{});else if(s.dlg)await p.keyboard.press('Space').catch(()=>{})}
await p.waitForTimeout(+(A.wait||3000));await (await p.$('#game')).screenshot({path:A.out||'web_battle.png'});
if(A.keys){for(const k of A.keys.split(',')){await p.keyboard.press(k);await p.waitForTimeout(500)}await p.waitForTimeout(+(A.wait2||1500));await (await p.$('#game')).screenshot({path:A.out2||'web_battle2.png'})}
console.log('ok');await b.close()})();
