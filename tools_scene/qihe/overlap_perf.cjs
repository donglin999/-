// 用法：node tools_scene/qihe/overlap_perf.cjs <输出.json>（需 8792 在运行）。每帧后 getImageData(0,0,1,1) 强制 GPU 同步，计入真实绘制耗时。
// 帧耗：同一画面下 drawScene 平均耗时，重叠半透明开/关对比
const fs=require('fs');const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const EXE='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
(async()=>{const b=await chromium.launch({executablePath:EXE});const p=await b.newPage({viewport:{width:1280,height:720}});
 await p.goto('http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map',{waitUntil:'load',timeout:120000});
 await p.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&window.QiheExpansion,null,{timeout:60000});
 await p.evaluate(()=>QiheExpansion.go('east'));await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{const base=cur.npcs;wanderers=[];followers=[];
  const sps=['c_opening_aunt','c_opening_chen','c_opening_apothecary','c_opening_steward','c_opening_retainer','c_opening_bailiff','c_ye','c_opening_luheng'];
  // 被挡站点：凉棚下一排 + 西口树后
  const hid=[[643,244],[700,244],[760,244],[782,238],[102,462],[82,470],[673,250],[720,250]];
  const clear=[[640,420],[700,430],[760,430],[820,440],[560,440],[880,450],[600,480],[740,480]];
  const run=(spots,occ,n=240)=>{cur.npcs=[...base,...spots.map((a,i)=>({id:'perf'+i,name:'p'+i,sp:sps[i%sps.length],x:a[0]/TS,y:a[1]/TS,dir:'d',fixed:true,idle:false,act:async()=>{}}))];cur._npcs=npcsOf(cur);
   Object.assign(player,{x:700,y:330,alpha:1});cam.x=Math.max(0,700-VW/2);cam.y=Math.max(0,300-VH/2);cur.occlusion=occ?undefined:false;
   for(let i=0;i<20;i++){drawScene(1000+i*16);g.getImageData(0,0,1,1)}let gs=0,gms=0;const t0=performance.now();for(let i=0;i<n;i++){drawScene(2000+i*16);g.getImageData(0,0,1,1);gs+=OCC_STATS.ghosts;gms+=OCC_STATS.ms}
   return{frameMs:+((performance.now()-t0)/n).toFixed(3),ghostPassMs:+(gms/n).toFixed(3),ghosts:+(gs/n).toFixed(1),actors:OCC_STATS.actors}};
  const out={};
  for(const[k,spots]of[['无人被挡_8NPC',clear],['8NPC全被挡',hid]]){out[k+'_关']=run(spots,false);out[k+'_开']=run(spots,true);out[k+'_关2']=run(spots,false);out[k+'_开2']=run(spots,true)}
  cur.npcs=base;cur._npcs=npcsOf(cur);delete cur.occlusion;return out});
 console.log(JSON.stringify(r,null,1));fs.writeFileSync(process.argv[2]||'perf.json',JSON.stringify(r,null,1));await b.close()})();
