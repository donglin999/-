// 导出原版某个界面的实测排版：每个可见元素的位置尺寸（相对 1280×720 窗口）、字号、字体、颜色、底色、边框、圆角、透明度、文字。
// 供 Godot 界面逐项对齐。用法：node tools/dump_layout.cjs --scene=... --eval="打开界面的 JS" --root="#panel" --out=layout.json [--png=截图]
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const A=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,...v]=a.replace(/^--/,'').split('=');return [k,v.join('=')||'1']}));
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:{width:1280,height:720}});await p.goto(A.url||'http://127.0.0.1:8792/');await p.waitForTimeout(3000);
if(!A.url){await p.click('#qh-new-journey');await p.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&cur,null,{timeout:60000});await p.waitForTimeout(1500);
 await p.evaluate(a=>{const d=document.getElementById('dlg');d.hidden=true;dlgBusy=false;document.body.classList.remove('prologue-fixed-scene');if(a.scene){cur=SC[a.scene];buildGrid(cur);S.scene=a.scene;spawnWanderers();snapCam()}S.prologue.arrival.stage='done';S.prologue.arrival.borrowed=true;OpeningCharacters.applyScene(cur);busy=false;hud()},A)}
if(A.eval)await p.evaluate(A.eval);await p.waitForTimeout(+(A.wait||3000));
const L=await p.evaluate(root=>{const out=[];const R=document.querySelector(root)||document.body;
 for(const e of R.querySelectorAll('*')){if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;const r=e.getBoundingClientRect();if(r.width<1||r.height<1||r.bottom<0||r.top>720)continue;const c=getComputedStyle(e);
  const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('').slice(0,40);
  const o={tag:e.tagName.toLowerCase(),cls:String(e.className||'').slice(0,60),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};
  if(own){o.text=own;o.fs=c.fontSize;o.ff=c.fontFamily.split(',')[0];o.fw=c.fontWeight;o.col=c.color;o.ls=c.letterSpacing;o.lh=c.lineHeight}
  if(c.backgroundColor!=='rgba(0, 0, 0, 0)')o.bg=c.backgroundColor;if(c.backgroundImage!=='none')o.bgi=c.backgroundImage.slice(0,120);
  if(c.borderTopWidth!=='0px'||c.borderLeftWidth!=='0px')o.border=c.borderTopWidth+' '+c.borderTopColor+' / L '+c.borderLeftWidth+' '+c.borderLeftColor;
  if(c.borderRadius!=='0px')o.radius=c.borderRadius;if(c.opacity!=='1')o.op=c.opacity;if(c.boxShadow!=='none')o.shadow=c.boxShadow.slice(0,80);
  if(e.tagName==='IMG')o.src=(e.getAttribute('src')||'').slice(0,80);out.push(o)}return out},A.root||'body');
require('fs').writeFileSync(A.out||'layout.json',JSON.stringify(L,null,0).replace(/\},\{/g,'},\n{'));if(A.png)await p.screenshot({path:A.png});console.log('元素',L.length);await b.close()})();
