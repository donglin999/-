'use strict';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/05-map-interactables';
const base='http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map';
const scenes=['qihe_trial','qh_south','qh_east','qh_west','qh_north','qh_refuge','qh_mountain','prologue_inn_interior','prologue_clinic_interior','prologue_chen_hall','prologue_ye_house','prologue_chen_guest'];
const stages=[['night',null],['day1',{stage:'days',halfDay:0}],['day2',{stage:'days',halfDay:2,events:{'xu-meeting':true}}],['day3am',{stage:'days',halfDay:4,events:{'xu-meeting':true,'three-meeting':true}}],['day3pm',{stage:'days',halfDay:5,events:{'xu-meeting':true,'three-meeting':true,packing:true}}],['refuge',{stage:'refuge',halfDay:6}],['mountain',{stage:'mountain',halfDay:6}]];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
 const ctx=await browser.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1});const page=await ctx.newPage();page.setDefaultTimeout(20000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.QiheExpansion&&S&&mode==='scene'&&!busy);
 const result={};
 for(const [label,cp] of stages){
  result[label]={};
  for(const sc of scenes){
   console.log(label,sc);const r=await page.evaluate(async([sc,cp])=>{
     if(saveKey()!=='xjh.qihe-ui.review.v1')throw new Error('not review save');
     S.prologue.arrival.stage='done';
     if(cp){S.qiheChapter={...QiheChapter.initial(),...cp,choices:{},events:cp.events||{}};S.qiheChapter.mainDismissed=cp.halfDay;}else{delete S.qiheChapter;}
     await Promise.race([goScene(sc),new Promise(r=>setTimeout(r,2500))]);
     try{QiheExpansion.refresh()}catch(e){}
     const list=npcsOf(cur).map(n=>({id:n.id,name:n.name,sp:n.sp||null,x:Math.round(n.x*TS),y:Math.round(n.y*TS)}));
     const w=(typeof wanderers!=='undefined'?wanderers:[]).map(w=>({sp:w.sp,name:w.name,x:Math.round(w.x),y:Math.round(w.y)}));
     return {list,w,size:[cur.gw*TS,cur.gh*TS]};
   },[sc,cp]).catch(e=>({error:e.message}));
   result[label][sc]=r;
  }
 }
 fs.writeFileSync(path.join(out,'inventory.json'),JSON.stringify(result,null,1));
 // screenshots at day1
 await page.evaluate(()=>{S.qiheChapter={...QiheChapter.initial(),stage:'days',halfDay:0,choices:{},events:{},mainDismissed:0}});
 for(const sc of ['qihe_trial','qh_south','qh_east','qh_west','qh_north','prologue_inn_interior']){
   await page.evaluate(async sc=>{await Promise.race([goScene(sc),new Promise(r=>setTimeout(r,2500))]);QiheExpansion.refresh()},sc);
   await page.waitForTimeout(800);
   await page.screenshot({path:path.join(out,'ingame-day1-'+sc+'.png')});
 }
 console.log('errors',errors.slice(0,5));
 await browser.close();
})();
