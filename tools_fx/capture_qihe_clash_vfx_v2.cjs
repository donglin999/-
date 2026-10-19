// 第 7 步：无头浏览器打开 8792 交锋评审入口，注入 review/qihe-clash-vfx-v2/harness.js，逐关键帧截取画布原像素，并记录性能。
// 用法：node tools_fx/capture_qihe_clash_vfx_v2.cjs   产出：art_sources/qihe-clash-vfx-elements-v1/review-shots/*.png、perf.json
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const EXE='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const OUT=path.join(__dirname,'../art_sources/qihe-clash-vfx-elements-v1/review-shots');
const KEYS={am_s3_v2:[180,400,520,640,900],cs_whip_s1_v2:[240,320,600],cs_whip_s2_v2:[180,400,540,800]};
const only=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:EXE});try{
 const p=await b.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 p.on('pageerror',e=>console.error('pageerror',e.message));
 await p.goto('http://127.0.0.1:8792/?battleReview=clash&holdReview=1&play=1#qihe-map');
 await p.addScriptTag({url:'/review/qihe-clash-vfx-v2/harness.js?t='+Date.now()});
 await p.waitForFunction(()=>window.ClashV2Review&&(ClashV2Review.ready||ClashV2Review.error),null,{timeout:120000});
 const err=await p.evaluate(()=>ClashV2Review.error);if(err)throw Error(err);
 await p.waitForTimeout(1200);
 fs.mkdirSync(OUT,{recursive:true});
 for(const [id,ts] of Object.entries(KEYS)){if(only&&!id.startsWith(only))continue;for(const t of ts){
  await p.evaluate(([id,t])=>ClashV2Review.seek(id,t),[id,t]);await p.waitForTimeout(250);
  const url=await p.evaluate(()=>document.getElementById('cv').toDataURL('image/png'));
  fs.writeFileSync(path.join(OUT,`${id}_${t}.png`),Buffer.from(url.split(',')[1],'base64'));console.log('shot',id,t)}}
 // 闪避演示：第二个目标闪避
 for(const [id,t] of [['am_s3_v2',560],['cs_whip_s2_v2',560]]){if(only&&!id.startsWith(only))continue;await p.evaluate(([id,t])=>ClashV2Review.seek(id,t,{miss:1}),[id,t]);await p.waitForTimeout(250);
  const url=await p.evaluate(()=>document.getElementById('cv').toDataURL('image/png'));fs.writeFileSync(path.join(OUT,`${id}_${t}_miss2.png`),Buffer.from(url.split(',')[1],'base64'))}
 const perf=[];for(const id of ['am_s3_v2','cs_whip_s1_v2','cs_whip_s2_v2','am_s3','cs_whip_s1','cs_whip_s2'])for(const low of [false,true]){
  const runs=[];for(let i=0;i<5;i++)runs.push(await p.evaluate(([id,low])=>ClashV2Review.perf(id,{low}),[id,low]));
  const M=['avg','p95','max','simAvg','simP95','simMax'],r=runs.slice(1).reduce((a,v)=>({...v,...Object.fromEntries(M.map(k=>[k,Math.max(a[k]||0,v[k])]))}),{});perf.push(r);console.log(JSON.stringify(r))}
 fs.writeFileSync(path.join(OUT,'perf.json'),JSON.stringify({date:new Date().toISOString(),note:'无头 Chromium（headless shell，Apple Silicon），60fps 固定步长逐帧。avg/p95/max＝update+render+叠加到 960×540 画布（含交锋层共用的 8px 模糊辉光合成）；sim*＝只算 update+render（模拟＋分层绘制）。同一招跑 5 次去掉首次（含图集首次烘焙），取其余 4 次中的最大值。不含素材首次加载。',perf},null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
