// 原版培养模式各面板截图与实测排版：载入 walkthrough_web.cjs SAVE_LS 存下的本地存档（刚进培养），
// 关谷中消息、推进师门开场剧情直到底栏可点，再依次点底栏 8 个按钮，各存 png 与 json（与 DUMP_CULT 同口径）。
// 用法：node tools/capture_cult_panels.cjs <localStorage.json> <输出目录> [探查]
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const [lsFile,outDir,probe]=process.argv.slice(2);const fs=require('fs');fs.mkdirSync(outDir,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ls=JSON.parse(fs.readFileSync(lsFile,'utf8'));
await p.addInitScript(ls=>{if(!sessionStorage.getItem('__seeded')){for(const k in ls)localStorage.setItem(k,ls[k]);sessionStorage.setItem('__seeded','1')}},ls);
await p.goto('http://127.0.0.1:8792/');await p.waitForTimeout(3000);
await p.click('#qh-continue-0');await p.waitForTimeout(4000);
const dump=async(name)=>{const L=await p.evaluate(()=>{const out=[];for(const e of document.querySelectorAll('#cultivation *')){const r=e.getBoundingClientRect();if(r.width<1||r.height<1||r.bottom<0||r.top>720||getComputedStyle(e).visibility==='hidden'||getComputedStyle(e).display==='none')continue;const c=getComputedStyle(e);const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('').slice(0,40);const o={tag:e.tagName.toLowerCase(),cls:String(e.className||'').slice(0,60),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};if(own){o.text=own;o.fs=c.fontSize;o.ff=c.fontFamily.split(',')[0];o.col=c.color;o.lh=c.lineHeight}if(c.backgroundColor!=='rgba(0, 0, 0, 0)')o.bg=c.backgroundColor;if(c.borderTopWidth!=='0px')o.border=c.borderTopWidth+' '+c.borderTopColor;out.push(o)}return out});fs.writeFileSync(outDir+'/cult-'+name+'.json',JSON.stringify(L).replace(/\},\{/g,'},\n{'));await p.screenshot({path:outDir+'/cult-'+name+'.png'})};
const state=()=>p.evaluate(()=>{const bs=[...document.querySelectorAll('#cultivation footer button, #cultivation nav button')];return{n:bs.length,enabled:bs.filter(b=>!b.disabled).map(b=>b.getAttribute('aria-label')||b.textContent.trim()).slice(0,12),
 btns:[...document.querySelectorAll('#cultivation button')].filter(b=>b.offsetParent&&!b.disabled).map(b=>(b.className+'|'+b.textContent.trim()).slice(0,50)).slice(0,15),
 modal:[...document.querySelectorAll('#cultivation [class*=modal],#cultivation [class*=story],#cultivation [class*=dialog],#cultivation [class*=notice]')].filter(e=>e.offsetParent).map(e=>e.className.slice(0,40)).slice(0,8)}});
console.log('进入',JSON.stringify(await state()));
if(probe==='1'){await p.screenshot({path:outDir+'/probe0.png'});await b.close();return}
// 关谷中消息，然后推进师门开场：每次点可见的“继续”类按钮或剧情区域，直到底栏有可点按钮
await p.evaluate(()=>{const b=[...document.querySelectorAll('#cultivation button')].find(b=>/知道了/.test(b.textContent));b?.click()});await p.waitForTimeout(1500);
let idle=0;
for(let i=0;i<600;i++){const st=await state();if(st.enabled.length>=4){console.log('底栏可点',i,JSON.stringify(st.enabled));break}
 const did=await p.evaluate(()=>{const vis=[...document.querySelectorAll('#cultivation button')].filter(b=>b.offsetParent&&!b.disabled);
  const ans=vis.filter(b=>/cu-dialogue-answer/.test(b.className));const nx=vis.find(b=>/cu-dialogue-next/.test(b.className))||ans[ans.length-1]||vis.find(b=>/知道了|继续/.test(b.textContent));if(nx){nx.click();return nx.className+'|'+nx.textContent.trim().slice(0,20)}return ''});
 if(!did){idle++;if(idle%10===1)console.log('空闲',i,JSON.stringify(st));if(idle>60)break}else idle=0;
 await p.waitForTimeout(did?120:400)}
await dump('hub2');
if(probe==='2'){await b.close();return}
const labels=(await state()).enabled.slice(0,8);
for(const [i,l] of labels.entries()){
 await p.evaluate(l=>{const b=[...document.querySelectorAll('#cultivation footer button, #cultivation nav button')].find(b=>(b.getAttribute('aria-label')||b.textContent.trim())===l);b?.click()},l);
 await p.waitForTimeout(1500);await dump('p'+i);console.log('面板',i,l);
 for(let k=0;k<3;k++){const back=await p.evaluate(()=>{const b=[...document.querySelectorAll('#cultivation button')].find(b=>b.offsetParent&&!b.disabled&&/cu-back|cu-close|取消|返回/.test(b.className+b.textContent));if(b){b.click();return true}return false});if(!back)await p.keyboard.press('Escape');await p.waitForTimeout(500);if((await state()).enabled.length>=4)break}}
console.log('错误',errs.slice(0,3));
await b.close()})();
