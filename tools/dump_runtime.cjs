// 开着原版（8792）跑到地图里，导出运行时组装好的数据：场景表 SC（函数只记名字与长度）、ART、CHARS/PORTS、IMG 键→文件/切片。
// 这些是原版多份脚本在运行时拼出来的，静态抽取拿不全。只读原版。
// 用法：node tools/dump_runtime.cjs   （需要原版 python3 scripts/serve-current.py 已在 8792 运行）
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const OUT=path.resolve(__dirname,'../game/data/runtime');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('http://127.0.0.1:8792/');await p.waitForTimeout(5000);await p.click('#qh-new-journey');await p.waitForTimeout(15000);
const r=await p.evaluate(()=>{
 const rel=u=>String(u||'').replace(location.origin+'/','').split('?')[0];
 const ser=(v,d=0)=>{if(typeof v==='function')return {__fn:v.name||'anon',len:String(v).length};if(v instanceof HTMLImageElement)return {__img:rel(v.src)};if(v instanceof HTMLCanvasElement)return {__img:'canvas'};
  if(Array.isArray(v))return d>10?null:v.map(x=>ser(x,d+1));if(v&&typeof v==='object'){if(d>10)return null;const o={};for(const k of Object.keys(v)){if(k.startsWith('_'))continue;o[k]=ser(v[k],d+1)}return o}return v};
 const sc={};for(const k in SC)sc[k]=ser(SC[k]);
 const img={};for(const k in IMG){const v=IMG[k];if(!v)continue;if(v._sheet){img[k]={sheet:rel(v._sheet.image.src),r:[v._sheet.x,v._sheet.y,v._sheet.w,v._sheet.h]}}else if(v.src)img[k]={src:rel(v.src),w:v.naturalWidth,h:v.naturalHeight}}
 const reg={};for(const [n,R] of [['WALK',WALK],['RUN',RUN],['IDLE',IDLE],['FIDGET',FIDGET]])reg[n]=ser(R);
 const faces={};for(const k of PORTS){for(const e of ['',...(EXPR[k]||[]),'neutral','firm','smile','worry','surprise','hurt','angry']){const sp='c_'+k+(e?':'+e:'');const f=face(sp);if(f!=='none')faces[sp]=rel(f.replace(/^url\((.*)\)$/,'$1'))}}
 const dlg={leads:[...DIALOGUE_LEADS],ports:PORTS,expr:EXPR,faces,foes:FOES,names:(()=>{const o={};for(const n of ['药商','管事','护院','采办使','陆衡','程铎','岑霜','乌魁','叶蘅','周婶','陈伯','周砚','店家','村口老人','差役','采办随从','帮众','小禾','阿栓','小耗子','阿七','货郎','船家','算命先生','蔺管事','新来的','阿炭'])o[n]=OpeningCharacters.dialogueSprite(n,'',null);return o})(),paths:window.PRODUCTION_ASSET_PATHS,audio:window.PRODUCTION_AUDIO_PATHS};
 return {dlg,sc,art:ser(ART),chars:CHARS,ports:PORTS,optChars:OPT_CHARS,expr:EXPR,img,reg,occlusion:OCCLUSION,size:SIZE}});
const globals=await p.evaluate(()=>{const rel=u=>String(u||'').replace(location.origin+'/','').split('?')[0];const seen=new WeakSet();
 const ser=(v,d=0)=>{if(typeof v==='function')return {__fn:v.name||'anon'};if(v instanceof HTMLElement||v instanceof Node)return null;if(v instanceof HTMLImageElement)return {__img:rel(v.src)};
  if(v&&typeof v==='object'){if(seen.has(v))return '__cycle';if(d>12)return null;seen.add(v);try{if(Array.isArray(v))return v.map(x=>ser(x,d+1));const o={};for(const k of Object.keys(v)){if(k.startsWith('_'))continue;try{o[k]=ser(v[k],d+1)}catch(e){o[k]=null}}return o}finally{seen.delete(v)}}return v};
 const out={};for(const k of Object.keys(window)){if(!/^[A-Z]/.test(k))continue;const v=window[k];if(!v||typeof v!=='object'||v instanceof Node)continue;if(['STORY_DATA','IMG'].includes(k))continue;try{out[k]=ser(v)}catch(e){}}
 for(const k of ['ITEMS','SKILLS','ORIGINS','STATN','STATD','PARTY_DEF','MN_MEM','MN_PREF','COMPANIONS','DOG','PETS'])try{out[k]=ser(eval(k))}catch(e){}
 return out});
fs.writeFileSync(path.join(OUT,'globals.json'),JSON.stringify(globals));
for(const k of ['sc','art','img','reg','dlg'])fs.writeFileSync(path.join(OUT,k+'.json'),JSON.stringify(r[k]));
fs.writeFileSync(path.join(OUT,'misc.json'),JSON.stringify({chars:r.chars,ports:r.ports,optChars:r.optChars,expr:r.expr,occlusion:r.occlusion,size:r.size},null,1));
console.log('scenes',Object.keys(r.sc).length,'img',Object.keys(r.img).length);await b.close()})();
