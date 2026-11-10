// 原版对照截图：开新旅程，等进入地图后把场景直接切到指定位置（关掉剧情对话），截 #game（1280×720）。
// 用法：node tools/capture_web.cjs --scene=prologue_backhill [--at=x,y] [--dir=d] [--out=文件.png] [--wait=毫秒] [--eval=JS]
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const A=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,...v]=a.replace(/^--/,'').split('=');return [k,v.join('=')||'1']}));
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:A.page?{width:1280,height:720}:{width:1312,height:774}});
await p.goto('http://127.0.0.1:8792/');await p.waitForTimeout(3000);await p.click('#qh-new-journey');
await p.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&cur,null,{timeout:60000});await p.waitForTimeout(1500);
await p.evaluate(async a=>{const id=a.scene;if(typeof ensureSceneAssets==='function')await ensureSceneAssets(id);
  cur=SC[id];buildGrid(cur);S.scene=id;window.OpeningCharacters?.applyScene(cur);
  const at=a.at?a.at.split(',').map(Number):[cur.start[0]*TS,cur.start[1]*TS];player.x=at[0];player.y=at[1];player.dir=a.dir||cur.startDir||'d';player.alpha=1;player.path=null;player.goal=null;player.trail=[];particles=[];
  spawnWanderers();snapCam();busy=true;const d=document.getElementById('dlg');d.hidden=true;dlgBusy=false;document.getElementById('prompt').hidden=true;
  document.body.classList.remove('prologue-fixed-scene');if(a.eval)eval(a.eval)},A);
if(A.rects){const r=await p.evaluate(sel=>{const g=document.getElementById('game').getBoundingClientRect();return sel.split(',').map(s=>[...document.querySelectorAll(s)].filter(e=>e.offsetParent&&(e.children.length===0||e.matches(".qh-objective,.qh-tracker,.qh-status"))).map(e=>{const b=e.getBoundingClientRect(),c=getComputedStyle(e);return s+' x'+Math.round(b.x-g.x)+' y'+Math.round(b.y-g.y)+' w'+Math.round(b.width)+' h'+Math.round(b.height)+' fs'+c.fontSize+' ff'+c.fontFamily.slice(0,14)+' col'+c.color+' t:'+e.textContent.trim().slice(0,16)})).flat()},A.rects);console.log(r.join('\n'))}
if(A.state)require('fs').writeFileSync(A.state,await p.evaluate(()=>JSON.stringify(S)));await p.waitForTimeout(+(A.wait||2500));
if(A.page)await p.screenshot({path:A.out||'web.png'});else{const el=await p.$('#game');await el.screenshot({path:A.out||'web.png'})}console.log('ok',A.out);await b.close()})().catch(e=>{console.error(e);process.exit(1)});
