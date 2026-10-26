const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/03-素材缺失';
const orig='/private/tmp/claude-501/-Users-wuxiuxiang-project-luotuozhuan/cee2f540-8d09-4e39-a916-75d3855a0702/scratchpad/orig/';
const combos=[['ye',[['萧白','c_hero','left'],['叶蘅','c_ye','right']],'叶蘅'],
 ['luheng',[['萧白','c_hero','left'],['陆衡','c_opening_luheng','center'],['叶蘅','c_ye','right']],'陆衡'],
 ['censhuang',[['萧白','c_hero','left'],['乌魁','c_opening_wukui','center'],['岑霜','c_qh_censhuang_story','right']],'岑霜'],
 ['xu',[['萧白','c_hero','left'],['沈雁回','c_qh_shenyanhui_story','center'],['徐令仪','c_qh_xulingyi_story','right']],'徐令仪'],
 ['zhouyan',[['萧白','c_hero','left'],['周砚','c_opening_zhouyan','right']],'周砚']];
(async()=>{const b=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const rep={};
for(const mode of ['before','after'])for(const vp of [[1280,720],[1600,900]]){
 const ctx=await b.newContext({viewport:{width:vp[0],height:vp[1]}});const p=await ctx.newPage();
 if(mode==='before')await p.route(/\/js\/dialogue-stage\.js\?/,r=>r.fulfill({body:fs.readFileSync(orig+'dialogue-stage.js','utf8'),contentType:'application/javascript'}));
 await p.goto('http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map');await p.waitForFunction(()=>typeof S!=='undefined'&&S?.qiheChapter&&window.DialogueStage,null,{timeout:30000});await p.waitForTimeout(1500);
 await p.evaluate(()=>{if(saveKey()!=='xjh.qihe-ui.review.v1')throw Error('key');S.prologue.arrival.borrowed=true});
 for(const [name,cast,speaker] of combos){
  await p.evaluate(([cast,speaker])=>{window.__t=DialogueStage.withCast({id:'fade-check',cast:cast.map(([who,sp,slot])=>({who,sp,slot}))},()=>say(speaker,'（立绘下沿检查）这一句只用来截图。'))},[cast,speaker]);
  await p.waitForTimeout(900);
  const info=await p.evaluate(()=>{const r=e=>{const a=e.getBoundingClientRect();return Math.round(a.bottom)};return{box:r(document.querySelector('#dlg .box')),faces:[...document.querySelectorAll('#dlg .face.dialogue-portrait')].filter(f=>!f.hidden).map(f=>({c:f.dataset.character,bottom:r(f),mask:f.style.maskImage||''}))}});
  (rep[mode+'-'+vp[0]]||=[]).push({name,...info});
  await p.screenshot({path:path.join(out,mode,`dialogue-${name}-${vp[0]}.png`)});
  await p.keyboard.press('Space');await p.waitForTimeout(250);await p.keyboard.press('Space');await p.waitForTimeout(400);
 }
 await ctx.close()}
fs.writeFileSync(path.join(out,'dialogue-fade-report.json'),JSON.stringify(rep,null,1));console.log(JSON.stringify(rep['before-1280']),'\n',JSON.stringify(rep['after-1280']));await b.close()})();
