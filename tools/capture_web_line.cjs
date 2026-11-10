// 原版：开新旅程，一路推进对白（选项选第一个），停在含指定文字的那一句，等打字完成后截 #game。
// 用法：node tools/capture_web_line.cjs --until=你是哪里人 --out=web.png [--pick=0]
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const A=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,...v]=a.replace(/^--/,'').split('=');return [k,v.join('=')||'1']}));
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:{width:1312,height:774}});await p.goto('http://127.0.0.1:8792/');await p.waitForTimeout(3000);await p.click('#qh-new-journey');
const end=Date.now()+180000;let ok=false;
while(Date.now()<end){await p.waitForTimeout(250);const s=await p.evaluate(()=>{const d=document.getElementById('dlg');return{dlg:d&&!d.hidden,txt:d?.querySelector('.txt')?.textContent||'',n:document.querySelectorAll('#dlg .choices button').length}});
 if(s.dlg&&s.txt.includes(A.until)){ok=true;break}
 if(s.n)await p.locator('#dlg .choices button').nth(+(A.pick||0)).click({timeout:2000}).catch(()=>{});else if(s.dlg)await p.keyboard.press('Space').catch(()=>{});else{const bt=await p.$('#bt-auto');if(bt)await bt.click().catch(()=>{})}}
await p.waitForTimeout(2500);if(A.rects){const r=await p.evaluate(sel=>{const g=document.getElementById('game').getBoundingClientRect();return sel.split(',').map(s=>[...document.querySelectorAll(s)].filter(e=>!e.hidden&&e.offsetParent).map(e=>{const b=e.getBoundingClientRect(),c=getComputedStyle(e);return s+' x'+Math.round(b.x-g.x)+' y'+Math.round(b.y-g.y)+' w'+Math.round(b.width)+' h'+Math.round(b.height)+' fs'+c.fontSize+' lh'+c.lineHeight+' pad'+c.padding})).flat()},A.rects);console.log(r.join('\n'))}await (await p.$('#game')).screenshot({path:A.out||'web.png'});console.log(ok?'ok':'not found');await b.close()})();
