// 重叠半透明修前/修后截图：node shot.cjs <before|after> <输出目录>
// 修前（需设 OVERLAP_BEFORE_DIR 指向修前镜像）：拦截 js/scene.js、js/qihe-chapter.js 改用修前镜像里的原件；修后：直接用 8792 现行文件。
const fs=require('fs'),path=require('path');
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const EXE='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BEFORE=process.env.OVERLAP_BEFORE_DIR||path.join(__dirname,'before');   // 修前工作区镜像（只读其 js/scene.js、js/qihe-chapter.js）
const [phase='after',outDir=path.join(process.cwd(),'shots')]=process.argv.slice(2);fs.mkdirSync(outDir,{recursive:true});
// 人物 × 遮挡物：树冠（南村口东口大树、东埠西口树）、屋檐（中央图叶家、陈伯家）、凉棚（东埠凉棚、南村口茶棚）
const SPOTS={
 树冠:{key:'south',at:[1448,676]},
 屋檐:{key:'central',at:[1231,397]},
 凉棚:{key:'east',at:[643,244]},
};
const ACTORS={主角:'player',普通NPC:'npc',剧情站位NPC:'cast'};
(async()=>{const b=await chromium.launch({executablePath:EXE});const ctx=await b.newContext({viewport:{width:1280,height:720}});
 if(phase==='before')for(const f of['scene.js','qihe-chapter.js'])await ctx.route('**/js/'+f+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(BEFORE,'js',f),'utf8')}));
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map',{waitUntil:'load',timeout:120000});
 await p.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&window.QiheExpansion,null,{timeout:60000});
 const shots=[];
 for(const[spot,{key,at}]of Object.entries(SPOTS))for(const[actor,role]of Object.entries(ACTORS)){
  await p.evaluate(k=>QiheExpansion.go(k),key);await p.waitForTimeout(700);
  const info=await p.evaluate(([at,role])=>{wanderers=[];followers=[];
   if(cur._occTestBase)cur.npcs=cur._occTestBase;else cur._occTestBase=cur.npcs;
   // 主角站点；NPC 情形主角站到南侧 110px 外可站处
   let px=at[0],py=at[1];if(role!=='player'){for(const d of[[0,120],[60,120],[-60,120],[0,160],[90,90],[-90,90]])if(standOk(at[0]+d[0],at[1]+d[1])){px=at[0]+d[0];py=at[1]+d[1];break}}
   Object.assign(player,{x:px,y:py,dir:'d',walk:0,moving:false,path:null,goal:null,trail:[],alpha:1});
   if(role==='npc')cur.npcs=[...cur._occTestBase,{id:'occ-test-npc',name:'周婶',sp:'c_opening_aunt',x:at[0]/TS,y:at[1]/TS,dir:'d',fixed:true,idle:false,act:async()=>{}}];
   if(role==='cast')cur.npcs=[...cur._occTestBase,{id:'staged-陈伯',name:'陈伯',sp:'c_opening_chen',x:at[0]/TS,y:at[1]/TS,dir:'d',fixed:true,idle:false,cast:true,act:async()=>{}}];   // 与 placeCast 生成的对象同形
   cur._npcs=npcsOf(cur);snapCam();cam.x=Math.max(0,Math.min(WW-VW,at[0]-VW/2));cam.y=Math.max(0,Math.min(WH-VH,at[1]-VH/2));camC.x=cam.x;camC.y=cam.y;
   const r=cv.getBoundingClientRect(),s=r.width/(W/ZOOM);return{stand:standOk(at[0],at[1]),sx:r.left+(at[0]-cam.x)*s,sy:r.top+(at[1]-cam.y)*s,s,player:[px,py]}},[at,role]);
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  // 冻结镜头：渲染若干帧后截图
  await p.evaluate(([at])=>{cam.x=Math.max(0,Math.min(WW-VW,at[0]-VW/2));cam.y=Math.max(0,Math.min(WH-VH,at[1]-VH/2))},[at]);
  await p.waitForTimeout(250);
  const st=await p.evaluate(()=>window.OCC_STATS?{...window.OCC_STATS}:null);
  Object.assign(info,await p.evaluate(([at])=>{const r=cv.getBoundingClientRect(),s=r.width/(W/ZOOM);return{sx:r.left+(at[0]-cam.x)*s,sy:r.top+(at[1]-cam.y)*s}},[at]));
  const w=300,h=260,clip={x:Math.max(0,info.sx-w/2),y:Math.max(0,info.sy-h*.72),width:w,height:h};
  const name=`${spot}-${actor}-${phase}`;await p.screenshot({path:path.join(outDir,name+'.png'),clip});
  shots.push({name,spot,actor,scene:key,at,standable:info.stand,player:info.player,occStats:st});
 }
 fs.writeFileSync(path.join(outDir,`shots-${phase}.json`),JSON.stringify({shots,errors:errs},null,1));console.log(JSON.stringify({n:shots.length,errors:errs}));await b.close()})();
