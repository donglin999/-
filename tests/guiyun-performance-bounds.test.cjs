'use strict';
// Inspect native alpha against the actual game stage, including every new mood in every slot.
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),assets=JSON.parse(fs.readFileSync(path.join(root,'art_sources/guiyun-performance-fix-20261012/adopt.json'))).assets;
(async()=>{
 const b=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'}),report={status:'running',states:0,clips:[],errors:[]};
 try{for(const width of [1280,1600,1920]){
  const c=await b.newContext({viewport:{width,height:Math.round(width*9/16)}}),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto('http://127.0.0.1:8792/?chapterPresentationReview=cultivation-performance-bounds-20261012&play=1#qihe-map');await p.waitForFunction(()=>window.Cultivation?.state()&&document.querySelector('#cultivation:not([hidden])'));const f=p;
  const result=await f.evaluate(async assets=>{
   if(!saveKey().includes('cultivation-performance-bounds-20261012'))throw Error('not an isolated review save');const H=CultivationHousehold,Q=CultivationStory,host=document.querySelector('#cultivation'),clips=[];let states=0;const cache=new Map();
   for(const a of assets){const [actor,...m]=a.key.split('_'),mood=m.join('_')||'fun';for(const choice of [false,true])for(const cast of [[actor,'hero'],['hero',actor],[actor,'hero','zhou'],['hero',actor,'zhou'],['hero','zhou',actor]]){
    host.querySelectorAll('.cu-story-scene').forEach(e=>e.remove());H.resetMoods();const el=Q.render(host,{title:'透明轮廓检查',text:'',speaker:actor,cast,choice,moods:{[actor]:mood}}),img=el.querySelector('[data-character="'+actor+'"]');await img.decode();const r=img.getBoundingClientRect(),st=el.querySelector('.cu-story-stage').getBoundingClientRect(),footer=host.querySelector('.cu-bottom').getBoundingClientRect().top;
    if(!cache.has(img.src)){const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,rows=[];for(let y=0;y<canvas.height;y++){let min=canvas.width,max=-1;for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>200){min=Math.min(min,x);max=x;}rows.push([min,max]);}cache.set(img.src,rows);}
    const rows=cache.get(img.src),from=Math.max(0,Math.ceil((st.top-r.top)*img.naturalHeight/r.height)),to=Math.min(img.naturalHeight,Math.floor((footer-r.top)*img.naturalHeight/r.height));let min=img.naturalWidth,max=-1;for(let y=from;y<to;y++){min=Math.min(min,rows[y][0]);max=Math.max(max,rows[y][1]);}const left=r.left+min*r.width/img.naturalWidth,right=r.left+(max+1)*r.width/img.naturalWidth;states++;if(left<st.left-2||right>st.right+2)clips.push({key:a.key,choice,slot:cast.indexOf(actor),count:cast.length,left,right,stage:[st.left,st.right],viewport:innerWidth});
   }}return {states,clips};
  },assets);report.states+=result.states;report.clips.push(...result.clips);await c.close();
 }assert.deepEqual(report.errors,[]);assert.deepEqual(report.clips,[]);report.status='pass';}catch(e){report.status='fail';report.failure=e.message;throw e;}finally{fs.writeFileSync(path.join(root,'review/guiyun-performance-fix-20261012/bounds-audit.json'),JSON.stringify(report,null,2)+'\n');await b.close();}console.log(JSON.stringify(report));
})();
