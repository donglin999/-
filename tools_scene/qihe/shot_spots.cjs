// 2026-10-27 按地点截实机图（评审台“改前／改后同位置”附图用，R-评审-01）。
// 用法：先起本地 8792，再 node tools_scene/qihe/shot_spots.cjs <输出目录> [前缀]
// 每个地点按“场景 + 人物或景物 id + 偏移（格）”把萧白放过去，镜头跟着他；镜头位置只由地点决定，改前改后截出来是同一个取景。
const path=require('node:path'),fs=require('node:fs');
const dep=process.env.CODEX_NODE_MODULES||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(dep,'playwright'));
const out=process.argv[2]||'evidence/spots';const pre=process.argv[3]||'';fs.mkdirSync(out,{recursive:true});
const SPOTS=[
 ['粮仓','central','granary',[2,1]],
 ['古井','central','well',[-2,1]],
 ['货郎与孩子','central','peddler',[2,-1.5]],
 ['算命摊','central','fortune-stall',[0,2]],
 ['晒谷场','west','grain-yard',[0,3]],
 ['客栈菜牌','central','inn-menu',[0,2]],
];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});   // 用本机 Chrome
 const p=await b.newPage({viewport:{width:1600,height:900}});
 await p.goto('http://127.0.0.1:8792/#qihe-map');await p.waitForFunction(()=>typeof goScene==='function'&&typeof SC!=='undefined'&&!!SC.qh_east,null,{timeout:60000});
 await p.evaluate(()=>{S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events={'c1-00b':true,'c1-s1':true};S.prologue=QihePrologue.fresh();S.silver=10;S.bag={}});
 for(const [name,key,id,[dx,dy]] of SPOTS){
  const ok=await p.evaluate(async([key,id,dx,dy])=>{const sid={central:'m_qh_central',west:'qh_west',south:'qh_south',east:'qh_east',north:'qh_north'}[key];const sc=SC[sid]||Object.values(SC).find(s=>s.npcs?.some(n=>n.id===id));
   const n=sc?.npcs?.find(n=>n.id===id);if(!n)return false;const sk=Object.keys(SC).find(k=>SC[k]===sc);goScene(sk,[n.x+dx,n.y+dy]);return true},[key,id,dx,dy]);
  if(!ok){console.log('找不到',name);continue}
  await wait(1200);await p.keyboard.press('2').catch(()=>{});await wait(300);
  await p.evaluate(()=>{const pn=document.getElementById('panel');if(pn){pn.hidden=true;pn.className='ui panel'}mode='scene';busy=false;dlgBusy=false});await wait(700);
  await p.screenshot({path:path.join(out,`${pre}${name}.png`)});
 }
 await b.close();console.log('截图已存到',out);
})().catch(e=>{console.error(e);process.exit(1)});
