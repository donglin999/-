// 烘焙原版程序化水墨纹理（js/bui.js 的 swash/paper/enso/rod/seal/blot/coin 等，固定种子、确定性生成）：
// 在原版页面挂钩记录实际用到的每组参数，跑几场战斗（评审入口自动战斗）并打开江湖菜单各页，
// 然后用原版自己的函数逐个生成、导出 PNG（2 倍像素密度）到 game/data/bui/，索引 index.json：规范化参数键 → {f,lw,lh}。
// Godot 端用同样的规范化规则拼键查表（game/scripts/ui/bui.gd），结果与原版逐像素一致。
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const OUT=path.resolve(__dirname,'../game/data/bui');fs.mkdirSync(OUT,{recursive:true});
const FNS=['swash','paper','enso','rod','seal','blot','coin','icon','text','img','weakIcon'];
const canon=v=>Array.isArray(v)?'['+v.map(canon).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}':typeof v==='number'?String(v):JSON.stringify(v);
const hook=()=>{window.__bui=new Map();let real;Object.defineProperty(window,'BUI',{configurable:true,get(){return real},set(v){real=v;for(const f of ['swash','paper','enso','rod','seal','blot','coin','icon','text','img','weakIcon']){const o=v[f];if(typeof o!=='function')continue;v[f]=function(...a){try{window.__bui.set(f+'|'+JSON.stringify(a),[f,a])}catch(e){}return o.apply(this,a)}}}})};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const calls=new Map();
async function run(url,fn){const p=await b.newPage({viewport:{width:1312,height:774}});await p.addInitScript(hook);await p.goto(url);await p.waitForTimeout(4000);try{await fn(p)}catch(e){console.log('出错',url,e.message)}
 const got=await p.evaluate(()=>[...window.__bui.values()]);for(const [f,a] of got)calls.set(f+'|'+JSON.stringify(a),[f,a]);console.log(url,'调用',got.length);await p.close()}
const clickThrough=async(p,ms)=>{const end=Date.now()+ms;while(Date.now()<end){await p.waitForTimeout(200);await p.evaluate(()=>{const a=document.getElementById('bt-auto');if(a&&!a.classList.contains('on'))a.click();const d=document.getElementById('dlg');if(d&&!d.hidden){const c=d.querySelector('.choices button');if(c)c.click();else d.click()}})}};
for(const r of ['road','lesson','ye','bailiff','clash','hero'])await run('http://127.0.0.1:8792/?battleReview='+r+'&play=1#qihe-map',p=>clickThrough(p,45000));
// 正常开局：跑到遇狼，手动按回车出招（覆盖指令菜单、目标选择、蓄势），再进江湖菜单各页
await run('http://127.0.0.1:8792/',async p=>{await p.click('#qh-new-journey');const end=Date.now()+150000;
 while(Date.now()<end){await p.waitForTimeout(150);const s=await p.evaluate(()=>({m:mode,n:document.querySelectorAll('#dlg .choices button').length,dlg:!document.getElementById('dlg').hidden}));
  if(s.m==='battle'){for(const k of ['ArrowDown','ArrowUp','e','q','Enter','Enter','Escape','ArrowDown','Enter','Escape','ArrowDown','ArrowDown','Enter','Escape','Enter','Enter'])await p.keyboard.press(k).catch(()=>{}),await p.waitForTimeout(350);continue}
  if(s.n)await p.locator('#dlg .choices button').first().click({timeout:2000}).catch(()=>{});else if(s.dlg)await p.keyboard.press('Space').catch(()=>{});
  if(await p.evaluate(()=>mode==='scene'&&S?.prologue?.arrival?.stage==='done'&&!busy&&!dlgBusy))break}
 for(const k of ['i','e','e','e','e','e','e','e','Escape'])await p.keyboard.press(k).catch(()=>{}),await p.waitForTimeout(600)});
console.log('不同调用',calls.size);
// 生成导出
const p=await b.newPage();await p.addInitScript(hook);await p.goto('http://127.0.0.1:8792/?battleReview=road&play=1#qihe-map');await p.waitForTimeout(4000);
const index={};let n=0;
for(const [k,[f,a]] of calls){const r=await p.evaluate(([f,a])=>{try{const c=BUI[f](...a);if(!c||!c.toDataURL)return null;return{d:c.toDataURL('image/png'),lw:c.lw||c.width,lh:c.lh||c.height,w:c.width,h:c.height}}catch(e){return null}},[f,a]);
 if(!r)continue;const key=f+'|'+canon(a),file=crypto.createHash('sha1').update(key).digest('hex').slice(0,16)+'.png';
 fs.writeFileSync(path.join(OUT,file),Buffer.from(r.d.split(',')[1],'base64'));index[key]={f:file,lw:r.lw,lh:r.lh,w:r.w,h:r.h};n++}
fs.writeFileSync(path.join(OUT,'index.json'),JSON.stringify(index,null,0));console.log('导出',n);await b.close()})();
